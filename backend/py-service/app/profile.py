"""Shared resume/skills data loaded from ``shared/profile.json``.

The JSON file is the single source of truth for the whole project: the React
app imports it directly, the Rust API embeds it, and this service reads it at
runtime. Nothing in this module may hard-code profile values.
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from .config import get_settings


class ProfileError(RuntimeError):
    """Raised when the shared profile document is missing or malformed."""


def load_profile(path: Path | None = None) -> dict[str, Any]:
    """Read and minimally validate the shared profile document."""
    target = path or get_settings().profile_path
    try:
        raw = target.read_text(encoding="utf-8")
    except OSError as exc:  # pragma: no cover - exercised only on bad checkouts
        raise ProfileError(f"cannot read profile at {target}: {exc}") from exc

    try:
        document = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ProfileError(f"invalid JSON in {target}: {exc}") from exc

    if not isinstance(document, dict):
        raise ProfileError(f"profile root must be an object, got {type(document).__name__}")

    for key in ("profile", "skills"):
        if key not in document:
            raise ProfileError(f"profile document is missing required key {key!r}")

    return document


@lru_cache(maxsize=8)
def _cached(path: str) -> dict[str, Any]:
    return load_profile(Path(path))


def cached_profile() -> dict[str, Any]:
    """Profile document, cached per resolved path for the process lifetime."""
    return _cached(str(get_settings().profile_path))


def clear_profile_cache() -> None:
    _cached.cache_clear()


def personal_info() -> dict[str, Any]:
    return cached_profile()["profile"]
