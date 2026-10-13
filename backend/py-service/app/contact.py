"""Contact-form validation and delivery.

Two delivery modes:

* ``smtp`` — credentials are present, the message is sent with ``smtplib``.
* ``dry-run`` — no credentials, the message is appended to a JSONL file so the
  form still works end to end during development (matching the demo behaviour
  the site had before the backend existed).

Header injection is prevented by rejecting control characters in the
single-line fields before they reach the mail library.
"""

from __future__ import annotations

import asyncio
import json
import re
import smtplib
import uuid
from datetime import datetime, timezone
from email.message import EmailMessage
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field, field_validator

from .config import Settings

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
CONTROL_CHARS = re.compile(r"[\r\n\x00]")

NAME_MAX = 80
SUBJECT_MAX = 140
MESSAGE_MIN = 15
MESSAGE_MAX = 4000


class ContactMessage(BaseModel):
    """Validated contact-form submission."""

    name: str = Field(min_length=1, max_length=NAME_MAX)
    email: str = Field(min_length=3, max_length=254)
    subject: str = Field(min_length=1, max_length=SUBJECT_MAX)
    message: str = Field(min_length=MESSAGE_MIN, max_length=MESSAGE_MAX)

    @field_validator("name", "email", "subject")
    @classmethod
    def _single_line(cls, value: str, info: Any) -> str:
        cleaned = value.strip()
        if CONTROL_CHARS.search(cleaned):
            raise ValueError(f"{info.field_name} must be a single line")
        return cleaned

    @field_validator("email")
    @classmethod
    def _looks_like_email(cls, value: str) -> str:
        if not EMAIL_RE.match(value):
            raise ValueError("invalid email format")
        return value

    @field_validator("message")
    @classmethod
    def _message_body(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < MESSAGE_MIN:
            raise ValueError(f"message must be at least {MESSAGE_MIN} characters")
        return cleaned


class ContactError(RuntimeError):
    """Raised when delivery fails."""


def build_email(payload: ContactMessage, settings: Settings) -> EmailMessage:
    """Compose the notification email for a validated submission."""
    message = EmailMessage()
    message["To"] = str(settings.contact_to)
    message["From"] = str(settings.contact_from)
    message["Subject"] = f"[portfolio] {payload.subject}"
    message["Reply-To"] = payload.email
    message.set_content(
        "\n".join(
            [
                f"Name:    {payload.name}",
                f"Email:   {payload.email}",
                f"Subject: {payload.subject}",
                "",
                payload.message,
            ]
        )
    )
    return message


def _send_sync(message: EmailMessage, settings: Settings) -> None:
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
        if settings.smtp_starttls:
            server.starttls()
        if settings.smtp_user and settings.smtp_password:
            server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(message)


def store_message(payload: ContactMessage, settings: Settings, record: dict[str, Any]) -> Path:
    """Append a dry-run record to the JSONL store and return the store path."""
    store = settings.contact_store
    store.parent.mkdir(parents=True, exist_ok=True)
    with store.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps({**record, **payload.model_dump()}, ensure_ascii=False) + "\n")
    return store


async def deliver(payload: ContactMessage, settings: Settings) -> dict[str, Any]:
    """Deliver a validated message, returning the API response body."""
    record_id = str(uuid.uuid4())
    received_at = datetime.now(timezone.utc).isoformat()
    record = {"id": record_id, "receivedAt": received_at, "mode": settings.delivery_mode}

    if settings.delivery_mode == "smtp":
        message = build_email(payload, settings)
        try:
            await asyncio.to_thread(_send_sync, message, settings)
        except (OSError, smtplib.SMTPException) as exc:
            raise ContactError(f"SMTP delivery failed: {exc}") from exc
        return {"id": record_id, "receivedAt": received_at, "mode": "smtp", "status": "delivered"}

    try:
        await asyncio.to_thread(store_message, payload, settings, record)
    except OSError as exc:
        raise ContactError(f"could not persist message: {exc}") from exc

    return {"id": record_id, "receivedAt": received_at, "mode": "dry-run", "status": "queued"}
