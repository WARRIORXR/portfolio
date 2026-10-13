"""GitHub data acquisition, normalisation and caching.

The Python service owns the *shape* of GitHub data used by the site; the Rust
gateway re-exposes it under ``/api/*`` so the browser only ever talks to one
origin. Both upstreams are public and read-only:

* ``api.github.com`` — repositories (optionally authenticated with ``GITHUB_TOKEN``)
* ``github-contributions-api.jogruber.de`` — the contribution calendar
"""

from __future__ import annotations

import time
from typing import Any, Callable

import httpx

from .analytics import contribution_insights, language_mix

REPOS_URL = "https://api.github.com/users/{username}/repos"
CONTRIBUTIONS_URL = "https://github-contributions-api.jogruber.de/v4/{username}"


class GitHubError(RuntimeError):
    """Raised when an upstream GitHub request fails."""


class TTLCache:
    """Small in-process TTL cache keyed by string.

    Deliberately dependency-free: the gateway (Rust) holds the durable cache,
    this one only avoids hammering GitHub within a single process.
    """

    def __init__(self, ttl_seconds: int, clock: Callable[[], float] = time.monotonic) -> None:
        self._ttl = ttl_seconds
        self._clock = clock
        self._entries: dict[str, tuple[float, Any]] = {}

    def get(self, key: str) -> Any | None:
        entry = self._entries.get(key)
        if entry is None:
            return None
        stored_at, value = entry
        if self._clock() - stored_at >= self._ttl:
            self._entries.pop(key, None)
            return None
        return value

    def set(self, key: str, value: Any) -> None:
        self._entries[key] = (self._clock(), value)

    def clear(self) -> None:
        self._entries.clear()


def _headers(token: str | None) -> dict[str, str]:
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "tanish-jaswal-portfolio",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def normalise_repo(raw: dict[str, Any]) -> dict[str, Any]:
    """Map a GitHub repository payload to the shape the site consumes."""
    return {
        "id": raw.get("id"),
        "name": raw.get("name"),
        "fullName": raw.get("full_name"),
        "description": raw.get("description") or "",
        "language": raw.get("language"),
        "stars": int(raw.get("stargazers_count") or 0),
        "forks": int(raw.get("forks_count") or 0),
        "url": raw.get("html_url"),
        "homepage": raw.get("homepage") or None,
        "topics": list(raw.get("topics") or []),
        "updatedAt": raw.get("updated_at"),
    }


def select_repos(repos: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Drop forks/undocumented repos, then rank by stars and recency."""
    kept = [
        normalise_repo(repo)
        for repo in repos
        if not repo.get("fork") and (repo.get("description") or "").strip()
    ]
    kept.sort(key=lambda repo: (-repo["stars"], str(repo["updatedAt"] or ""), str(repo["name"])))
    return kept


def normalise_contributions(payload: dict[str, Any]) -> list[dict[str, Any]]:
    """Extract the ``{date, count}`` series from a contributions payload."""
    raw = payload.get("contributions")
    if not isinstance(raw, list):
        raise GitHubError("contributions payload did not contain a contributions array")
    days = [
        {"date": entry["date"], "count": int(entry.get("count") or 0)}
        for entry in raw
        if isinstance(entry, dict) and isinstance(entry.get("date"), str)
    ]
    days.sort(key=lambda day: day["date"])
    return days


class GitHubClient:
    """Async GitHub client with a short-lived in-process cache."""

    def __init__(
        self,
        token: str | None = None,
        timeout: float = 10.0,
        cache_ttl: int = 3600,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self._token = token
        self._timeout = timeout
        self._cache = TTLCache(cache_ttl)
        self._transport = transport

    def _client(self) -> httpx.AsyncClient:
        return httpx.AsyncClient(
            timeout=self._timeout,
            follow_redirects=True,
            transport=self._transport,
        )

    async def _get(self, url: str, headers: dict[str, str]) -> Any:
        async with self._client() as client:
            response = await client.get(url, headers=headers)
        if response.status_code >= 400:
            raise GitHubError(f"upstream {url} returned HTTP {response.status_code}")
        return response.json()

    async def repos(self, username: str) -> list[dict[str, Any]]:
        """Public, documented, non-fork repositories for ``username``."""
        key = f"repos:{username.lower()}"
        cached = self._cache.get(key)
        if cached is not None:
            return cached

        url = REPOS_URL.format(username=username)
        payload = await self._get(f"{url}?sort=updated&per_page=100&type=public", _headers(self._token))
        if not isinstance(payload, list):
            raise GitHubError("repositories payload was not a list")

        repos = select_repos(payload)
        self._cache.set(key, repos)
        return repos

    async def contributions(self, username: str) -> list[dict[str, Any]]:
        """Contribution calendar for the last year."""
        key = f"contributions:{username.lower()}"
        cached = self._cache.get(key)
        if cached is not None:
            return cached

        url = CONTRIBUTIONS_URL.format(username=username) + "?y=last"
        payload = await self._get(url, {"Accept": "application/json"})
        days = normalise_contributions(payload if isinstance(payload, dict) else {})
        self._cache.set(key, days)
        return days

    async def insights(self, username: str) -> dict[str, Any]:
        """Repo mix plus contribution streak metrics in one payload."""
        repos = await self.repos(username)
        days = await self.contributions(username)
        return {
            "username": username,
            "languageMix": language_mix(repos),
            "contributions": contribution_insights(days),
            "topRepos": repos[:5],
        }
