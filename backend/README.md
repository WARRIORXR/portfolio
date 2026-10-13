# Backend — Rust gateway + Python data service

The portfolio's site logic was moved out of the browser into two services:

```
        ┌──────────────┐   /api/*    ┌────────────────────────┐   HTTP   ┌──────────────────────┐
        │  React (Vite)│ ──────────► │  Rust gateway :8080    │ ───────► │  Python service :8000 │
        │  browser     │ ◄────────── │  backend/rust-api      │ ◄─────── │  backend/py-service   │
        └──────────────┘   JSON      └────────────────────────┘    JSON  └──────────────────────┘
                 │                              │                                 │
                 │ fallback when the gateway    │ GitHub REST (cached)            │ SMTP / JSONL queue
                 └──── is unreachable ─────────► api.github.com, jogruber mirror
```

* **Rust gateway** (`backend/rust-api`, Axum) — owns the public `/api/*` contract, serves the
  embedded resume data, fetches and caches GitHub repositories and contributions, validates and
  rate limits contact submissions, applies CORS, and serves the built frontend (`dist/`) with SPA
  fallback in production.
* **Python service** (`backend/py-service`, FastAPI) — owns the analytics (skills/resume metrics,
  contribution streaks, language mix) and contact delivery (SMTP, or a JSONL queue in dry-run mode).
* **Frontend** — talks to the gateway when `VITE_API_BASE_URL` points at it, and falls back to
  calling GitHub directly when the gateway is absent or down, so the static Vercel deploy keeps
  working.

## Single source of truth

Resume, skills and stats live in [`shared/profile.json`](../shared/profile.json). It is consumed by:

| Consumer | How |
|---|---|
| React app | imported by `src/data/personalInfo.js` and `src/data/skills.js` |
| Rust gateway | embedded at compile time (`include_str!`) and served from memory |
| Python service | read at runtime (`GET /profile`, analytics) |

Edit the JSON only — all three pick the change up automatically, and a schema drift fails the Rust
build/startup instead of silently serving wrong data.

## HTTP contracts

### Gateway (`http://127.0.0.1:8080`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Gateway status, cache sizes, Python reachability |
| GET | `/api/profile` | Full shared profile document |
| GET | `/api/profile/personal`, `/api/profile/skills` | Profile slices |
| GET | `/api/stats` | Counts derived from the profile |
| GET | `/api/github/repos?username=` | Normalised, non-fork, documented repos (TTL cached) |
| GET | `/api/github/contributions?username=` | Contribution calendar (TTL cached) |
| GET | `/api/analytics/summary` | Proxied to the Python service |
| GET | `/api/insights?username=` | Proxied to the Python service |
| POST | `/api/contact` | Validate + rate limit, then deliver via the Python service |
| GET | `/healthz` | Plain-text liveness probe |

Errors use a stable envelope: `{"error": {"kind": "bad_request", "message": "…"}}` with kinds
`bad_request`, `not_found`, `upstream_error`, `rate_limited`, `internal_error`.

Proxy routes preserve the upstream status, so a Python validation failure surfaces as `422`, not a
generic gateway error.

### Python service (`http://127.0.0.1:8000`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Liveness + configured delivery mode |
| GET | `/profile`, `/profile/personal` | Shared profile document / personal block |
| GET | `/analytics/summary` | Skills and resume analytics |
| GET | `/github/repos`, `/github/contributions`, `/github/insights` | GitHub data and metrics |
| POST | `/contact` | Validated delivery — `202` accepted, `422` rejected |

## Running it

```bash
npm install                 # frontend
npm run setup:py            # creates backend/py-service/.venv and installs requirements

npm run dev:py              # Python service on :8000
npm run dev:api             # Rust gateway on :8080  (needs a working Rust linker, see below)
npm run dev                 # Vite on :5173/5199
```

Point the frontend at the gateway with `VITE_API_BASE_URL=http://127.0.0.1:8080` (see
`.env.example`). Without it — or whenever the gateway is unreachable — the UI falls back to
browser-side GitHub calls and EmailJS/demo-mode contact delivery.

Checks:

```bash
npm run lint                # ESLint (flat config)
npx tsc --noEmit            # TypeScript
npm run build               # production build
npm run test:py             # pytest — 16 tests
npm run check:api           # cargo check --all-targets (see toolchain notes below)
```

`npm run check:api` runs the default toolchain and, if it cannot link because the Windows SDK is
missing, automatically retries with an installed `*-windows-gnu` toolchain and says so. Pin one
explicitly with `RUST_TOOLCHAIN=stable-x86_64-pc-windows-gnu npm run check:api`.

## Environment

Every variable is documented in [`.env.example`](../.env.example). Highlights:

* `VITE_API_BASE_URL` — gateway origin (frontend)
* `GITHUB_TOKEN` — optional; raises the GitHub limit from 60 to 5000 requests/hour
* `GITHUB_CACHE_TTL`, `GITHUB_TIMEOUT`, `CONTACT_RATE_LIMIT` (gateway)
* `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `CONTACT_TO`, `CONTACT_FROM` — without them
  the Python service queues messages to `backend/py-service/data/messages.jsonl` (dry-run)

## Verification status

| Piece | How it was verified | Level |
|---|---|---|
| Python service | 16 pytest tests + live `curl` against a running server (real GitHub data, `202` delivery, `422` rejections) | executed |
| Rust gateway | `cargo check --all-targets` and `clippy --all-targets -D warnings`, both clean | compiled only |
| Gateway HTTP contract | temporary Python harness serving the identical `/api/*` response shapes | executed |
| Frontend ↔ gateway | real browser run: `/api/health`, `/api/github/repos`, `/api/github/contributions` consumed, contact form `POST /api/contact` → `202` → message persisted by the Python service | executed |
| Frontend offline fallback | gateway killed: UI falls back to `api.github.com` + jogruber mirror, contact form still succeeds, console clean | executed |

Reproduce the browser runs with `npm run dev:py`, `VITE_API_BASE_URL=http://127.0.0.1:8080 npm run dev`,
and `npm run dev:api` on a machine that can link a Rust binary.

## Security notes

* Contact input is validated in **both** services; names and subjects reject control characters so
  they cannot inject extra mail headers.
* `POST /api/contact` is rate limited per client (default 5/minute), keyed on the socket peer with
  `x-forwarded-for` / `x-real-ip` as fallback when deployed behind a proxy.
* GitHub usernames are validated against `[A-Za-z0-9-]{1,39}` before being placed in an upstream URL,
  which blocks path and query injection.
* No secret is ever sent to the browser: the only frontend-visible values are the API base URL and
  the optional public EmailJS key.

## Toolchain notes (this machine)

`cargo build` needs the **Windows SDK** (MSVC import libraries such as `kernel32.lib`) and a linker;
this machine has the MSVC C++ tools but no Windows SDK, and Git's coreutils `link.exe` shadows the
MSVC linker on `PATH`. In addition, `link.exe` is not enough on its own: proc-macro and build-script
crates must be linked for the *host*.

What works today — verified:

```bash
npm run check:api                                          # falls back to the GNU toolchain
cargo +stable-x86_64-pc-windows-gnu check --all-targets   # compiles clean
cargo +stable-x86_64-pc-windows-gnu clippy --all-targets -- -D warnings   # no warnings
```

To *run* (not just check) the gateway you need a working Windows linker, which means installing the
Windows SDK — Visual Studio Installer → “Desktop development with C++” — and then using the default
toolchain:

```bash
cargo run --manifest-path backend/rust-api/Cargo.toml
```

Status, stated plainly: **the gateway has not been executed on this machine.** It compiles cleanly
(`cargo check --all-targets`, `clippy -D warnings`) with the GNU toolchain, but linking a binary here
still fails — the MSVC toolchain has no Windows SDK import libraries (`kernel32.lib`), and the GNU
toolchain's bundled `dlltool.exe` cannot generate them either (it needs an assembler that rustup does
not ship). Installing the SDK is the reliable fix and requires administrator rights; nothing in the
project depends on which linker you use.

Because the gateway could not be started here, its HTTP contract was verified against a temporary
harness that reproduces the same routes and response shapes (see “Verification status” below).
