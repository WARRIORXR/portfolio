# py-service-rs — Rust port of the portfolio data service

Rust (Axum) rewrite of `backend/py-service` (FastAPI). Drop-in for the same
endpoints the Rust gateway (`backend/rust-api`) proxies:

| Endpoint | Notes |
|---|---|
| `GET /health` | liveness + delivery mode |
| `GET /profile`, `GET /profile/personal` | reads `shared/profile.json` (cached per path, same validation) |
| `GET /analytics/summary` | line-for-line port of `analytics.py::summarize` |
| `GET /github/repos?username=` | GitHub REST, forks/undocumented dropped, ranked by stars |
| `GET /github/contributions?username=` | jogruber calendar, normalized `{date,count}` |
| `GET /github/insights?username=` | language mix + streaks + top repos |
| `POST /contact` | same validation (email regex, control-char rejection, message ≥ 15 chars); dry-run mode appends to `messages.jsonl` |

## Run

```bash
cargo run              # port 8000 by default (PORT env overrides)
cargo test             # analytics + validation unit tests
```

Environment variables are the same as the Python service: `PROFILE_PATH`,
`CONTACT_STORE`, `ALLOWED_ORIGINS`, `GITHUB_TOKEN`, `GITHUB_CACHE_TTL`,
`SMTP_*`, `CONTACT_TO`, `CONTACT_FROM`.

**One difference:** SMTP delivery is not ported (dev default is dry-run anyway).
If SMTP credentials are set, the service reports mode `smtp-unavailable` and
rejects `/contact` with a 502 rather than pretending to send. Contact flows in
production can keep using the Python service or add `lettre` for SMTP.

## Point the gateway at it

`backend/rust-api` proxies `PY_SERVICE_URL`. Set it to this service's address
to run the full stack in Rust.
