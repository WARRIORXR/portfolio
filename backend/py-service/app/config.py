"""Runtime configuration for the portfolio data service.

Every value is read from the environment so the service can run unchanged in
development, in Docker, or behind the Rust API gateway. Nothing here mutates
global state, and :func:`get_settings` re-reads the environment so tests can
override it with ``monkeypatch``.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

SERVICE_NAME = "py-service"
SERVICE_VERSION = "1.0.0"

# backend/py-service/app/config.py -> repository root
REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_PROFILE_PATH = REPO_ROOT / "shared" / "profile.json"
DEFAULT_CONTACT_STORE = Path(__file__).resolve().parents[1] / "data" / "messages.jsonl"

DEFAULT_ALLOWED_ORIGINS = (
    "http://localhost:5173",
    "http://localhost:5199",
    "http://localhost:8080",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5199",
    "http://127.0.0.1:8080",
)


def _split_origins(raw: str | None) -> list[str]:
    if not raw:
        return list(DEFAULT_ALLOWED_ORIGINS)
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


@dataclass(frozen=True)
class Settings:
    """Resolved service settings."""

    profile_path: Path
    contact_store: Path
    allowed_origins: list[str] = field(default_factory=list)

    # GitHub REST access. ``github_token`` is optional: unauthenticated requests
    # work, they are just rate limited to 60/hour instead of 5000/hour.
    github_token: str | None = None
    github_timeout: float = 10.0
    github_cache_ttl: int = 3600

    # Contact delivery. Without SMTP credentials the service runs in dry-run
    # mode and appends messages to ``contact_store`` instead of sending them.
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_starttls: bool = True
    contact_to: str | None = None
    contact_from: str | None = None

    @property
    def delivery_mode(self) -> str:
        """``smtp`` when delivery is configured, otherwise ``dry-run``."""
        if self.smtp_host and self.contact_to and self.contact_from:
            return "smtp"
        return "dry-run"


def _env_flag(name: str, default: bool) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _env_int(name: str, default: int) -> int:
    raw = os.environ.get(name)
    if raw is None or not raw.strip():
        return default
    try:
        return int(raw)
    except ValueError:
        return default


def _env_path(name: str, default: Path) -> Path:
    raw = os.environ.get(name)
    return Path(raw).expanduser() if raw and raw.strip() else default


def get_settings() -> Settings:
    """Build settings from the current environment."""
    return Settings(
        profile_path=_env_path("PROFILE_PATH", DEFAULT_PROFILE_PATH),
        contact_store=_env_path("CONTACT_STORE", DEFAULT_CONTACT_STORE),
        allowed_origins=_split_origins(os.environ.get("ALLOWED_ORIGINS")),
        github_token=os.environ.get("GITHUB_TOKEN") or None,
        github_timeout=float(_env_int("GITHUB_TIMEOUT", 10)),
        github_cache_ttl=_env_int("GITHUB_CACHE_TTL", 3600),
        smtp_host=os.environ.get("SMTP_HOST") or None,
        smtp_port=_env_int("SMTP_PORT", 587),
        smtp_user=os.environ.get("SMTP_USER") or None,
        smtp_password=os.environ.get("SMTP_PASSWORD") or None,
        smtp_starttls=_env_flag("SMTP_STARTTLS", True),
        contact_to=os.environ.get("CONTACT_TO") or None,
        contact_from=os.environ.get("CONTACT_FROM") or None,
    )


@lru_cache(maxsize=1)
def cached_settings() -> Settings:
    """Process-wide settings used by request handlers."""
    return get_settings()


def reset_settings_cache() -> None:
    """Drop the cached settings (used by tests and reloads)."""
    cached_settings.cache_clear()
