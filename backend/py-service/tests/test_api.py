"""HTTP tests for the FastAPI service.

GitHub is never called for real: a ``httpx.MockTransport`` is injected through
the ``get_github_client`` dependency so the tests stay hermetic.
"""

from __future__ import annotations

import json
from pathlib import Path

import httpx
import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.github import GitHubClient
from app.main import app, get_github_client, get_settings

REPO_PAYLOAD = [
    {
        "id": 1,
        "name": "movie-reviewer",
        "full_name": "WARRIORXR/movie-reviewer",
        "description": "Movie recommendation app",
        "language": "Python",
        "stargazers_count": 4,
        "forks_count": 1,
        "html_url": "https://github.com/WARRIORXR/movie-reviewer",
        "homepage": None,
        "topics": ["python"],
        "updated_at": "2026-09-01T00:00:00Z",
    },
    {
        "id": 2,
        "name": "no-description",
        "full_name": "WARRIORXR/no-description",
        "description": None,
        "language": "HTML",
        "stargazers_count": 0,
        "forks_count": 0,
        "html_url": "https://github.com/WARRIORXR/no-description",
        "homepage": None,
        "topics": [],
        "updated_at": "2026-08-01T00:00:00Z",
    },
    {
        "id": 3,
        "name": "forked-repo",
        "full_name": "WARRIORXR/forked-repo",
        "description": "A fork",
        "language": "Python",
        "stargazers_count": 0,
        "forks_count": 0,
        "html_url": "https://github.com/WARRIORXR/forked-repo",
        "homepage": None,
        "topics": [],
        "updated_at": "2026-07-01T00:00:00Z",
        "fork": True,
    },
]

CONTRIBUTIONS_PAYLOAD = {
    "contributions": [
        {"date": "2026-01-01", "count": 0, "level": 0},
        {"date": "2026-01-02", "count": 3, "level": 2},
        {"date": "2026-01-03", "count": 1, "level": 1},
    ]
}


def _handler(request: httpx.Request) -> httpx.Response:
    host = request.url.host
    if host == "api.github.com":
        return httpx.Response(200, json=REPO_PAYLOAD)
    if "jogruber" in host:
        return httpx.Response(200, json=CONTRIBUTIONS_PAYLOAD)
    return httpx.Response(404, json={"message": "unexpected host"})


@pytest.fixture()
def settings(tmp_path: Path) -> Settings:
    return Settings(
        profile_path=Path(__file__).resolve().parents[3] / "shared" / "profile.json",
        contact_store=tmp_path / "messages.jsonl",
        allowed_origins=["http://localhost:5173"],
    )


@pytest.fixture()
def client(settings: Settings) -> TestClient:
    github = GitHubClient(timeout=1.0, transport=httpx.MockTransport(_handler))

    app.dependency_overrides[get_settings] = lambda: settings
    app.dependency_overrides[get_github_client] = lambda: github
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_health(client: TestClient) -> None:
    body = client.get("/health").json()

    assert body["status"] == "ok"
    assert body["service"] == "py-service"
    assert body["deliveryMode"] == "dry-run"


def test_profile_and_analytics(client: TestClient) -> None:
    document = client.get("/profile").json()
    assert document["profile"]["name"] == "Tanish Jaswal"
    assert len(document["skills"]) == 15

    personal = client.get("/profile/personal").json()
    assert personal["githubUsername"] == "WARRIORXR"

    summary = client.get("/analytics/summary").json()
    assert summary["totals"]["skills"] == 15
    assert summary["focus"] == "python"


def test_repos_are_filtered_and_sorted(client: TestClient) -> None:
    body = client.get("/github/repos", params={"username": "WARRIORXR"}).json()

    assert body["count"] == 1
    names = [repo["name"] for repo in body["repos"]]
    assert names == ["movie-reviewer"]
    assert body["repos"][0]["stars"] == 4


def test_contributions_and_insights(client: TestClient) -> None:
    contributions = client.get("/github/contributions").json()
    assert contributions["total"] == 4
    assert contributions["days"][0] == {"date": "2026-01-01", "count": 0}

    insights = client.get("/github/insights").json()
    assert insights["languageMix"]["totalStars"] == 4
    assert insights["contributions"]["longestStreak"] == 2
    assert insights["topRepos"][0]["name"] == "movie-reviewer"


def test_github_failure_maps_to_502() -> None:
    github = GitHubClient(
        timeout=1.0,
        transport=httpx.MockTransport(lambda request: httpx.Response(500, json={})),
    )
    settings = Settings(
        profile_path=Path(__file__).resolve().parents[3] / "shared" / "profile.json",
        contact_store=Path("unused.jsonl"),
    )
    app.dependency_overrides[get_settings] = lambda: settings
    app.dependency_overrides[get_github_client] = lambda: github
    try:
        with TestClient(app) as test_client:
            response = test_client.get("/github/repos")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 502
    assert "HTTP 500" in response.json()["detail"]


def test_contact_dry_run_persists_message(client: TestClient, settings: Settings) -> None:
    payload = {
        "name": "Recruiter",
        "email": "recruiter@example.com",
        "subject": "Internship",
        "message": "We would like to talk about a data analyst internship.",
    }
    response = client.post("/contact", json=payload)

    assert response.status_code == 202
    assert response.json()["mode"] == "dry-run"
    assert response.json()["status"] == "queued"

    assert settings.contact_store.exists(), "dry-run message was not persisted"
    lines = [json.loads(line) for line in settings.contact_store.read_text(encoding="utf-8").splitlines()]
    assert len(lines) == 1
    assert lines[0]["email"] == "recruiter@example.com"
    assert lines[0]["message"].startswith("We would like")


@pytest.mark.parametrize(
    "payload",
    [
        {"name": "", "email": "a@b.com", "subject": "s", "message": "long enough message"},
        {"name": "A", "email": "not-an-email", "subject": "s", "message": "long enough message"},
        {"name": "A", "email": "a@b.com", "subject": "s", "message": "too short"},
        {"name": "A\nBcc: x@y.com", "email": "a@b.com", "subject": "s", "message": "long enough message"},
        {"name": "A", "email": "a@b.com", "subject": "s\nBcc: x@y.com", "message": "long enough message"},
    ],
)
def test_contact_validation_rejects_bad_payloads(client: TestClient, payload: dict[str, str]) -> None:
    assert client.post("/contact", json=payload).status_code == 422
