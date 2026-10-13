"""FastAPI application for the portfolio data service.

Endpoints (all read-only except ``/contact``):

* ``GET  /health``                     — liveness + configured delivery mode
* ``GET  /profile``                    — the shared profile document
* ``GET  /analytics/summary``          — skills/resume analytics
* ``GET  /github/repos``               — normalised public repositories
* ``GET  /github/contributions``       — normalised contribution calendar
* ``GET  /github/insights``            — language mix + streak metrics
* ``POST /contact``                    — validated contact submission

The Rust gateway (``backend/rust-api``) proxies these under ``/api/*`` for the
browser, adding caching, rate limiting and static hosting.
"""

from __future__ import annotations

from datetime import datetime, timezone
from functools import lru_cache
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware

from .analytics import summarize
from .config import SERVICE_NAME, SERVICE_VERSION, Settings, cached_settings
from .contact import ContactError, ContactMessage, deliver
from .github import GitHubClient, GitHubError
from .profile import ProfileError, cached_profile, personal_info

DEFAULT_USERNAME = "WARRIORXR"

app = FastAPI(
    title="Portfolio data service",
    version=SERVICE_VERSION,
    description="Resume analytics, GitHub data and contact delivery for the portfolio site.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cached_settings().allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@lru_cache(maxsize=4)
def _client_for(token: str | None, timeout: float, ttl: int) -> GitHubClient:
    return GitHubClient(token=token, timeout=timeout, cache_ttl=ttl)


def get_settings() -> Settings:
    """Settings dependency (overridable in tests)."""
    return cached_settings()


def get_github_client(settings: Annotated[Settings, Depends(get_settings)]) -> GitHubClient:
    """Shared GitHub client dependency (overridable in tests)."""
    return _client_for(settings.github_token, settings.github_timeout, settings.github_cache_ttl)


SettingsDep = Annotated[Settings, Depends(get_settings)]
ClientDep = Annotated[GitHubClient, Depends(get_github_client)]


@app.get("/health")
def health(settings: SettingsDep) -> dict[str, object]:
    """Liveness probe used by the Rust gateway and by developers."""
    return {
        "status": "ok",
        "service": SERVICE_NAME,
        "version": SERVICE_VERSION,
        "deliveryMode": settings.delivery_mode,
        "profilePath": str(settings.profile_path),
        "time": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/profile")
def profile_document() -> dict[str, object]:
    """The full shared profile document."""
    try:
        return cached_profile()
    except ProfileError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/profile/personal")
def profile_personal() -> dict[str, object]:
    """Just the personal-info block."""
    try:
        return personal_info()
    except ProfileError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/analytics/summary")
def analytics_summary() -> dict[str, object]:
    """Aggregate skills, experience and coursework into dashboard metrics."""
    try:
        return summarize(cached_profile())
    except ProfileError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/github/repos")
async def github_repos(
    client: ClientDep,
    username: Annotated[str, Query(min_length=1, max_length=39)] = DEFAULT_USERNAME,
) -> dict[str, object]:
    """Public, non-fork repositories sorted by stars then recency."""
    try:
        repos = await client.repos(username)
    except GitHubError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return {
        "username": username,
        "count": len(repos),
        "repos": repos,
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/github/contributions")
async def github_contributions(
    client: ClientDep,
    username: Annotated[str, Query(min_length=1, max_length=39)] = DEFAULT_USERNAME,
) -> dict[str, object]:
    """Contribution calendar for the last year plus streak metrics."""
    try:
        days = await client.contributions(username)
    except GitHubError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return {
        "username": username,
        "total": sum(day["count"] for day in days),
        "days": days,
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/github/insights")
async def github_insights(
    client: ClientDep,
    username: Annotated[str, Query(min_length=1, max_length=39)] = DEFAULT_USERNAME,
) -> dict[str, object]:
    """Language mix, stars/forks and contribution streaks in one payload."""
    try:
        return await client.insights(username)
    except GitHubError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.post("/contact", status_code=status.HTTP_202_ACCEPTED)
async def contact(payload: ContactMessage, settings: SettingsDep) -> dict[str, object]:
    """Validate a contact submission and deliver (or queue) it."""
    try:
        return await deliver(payload, settings)
    except ContactError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
