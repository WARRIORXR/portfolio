# Cloudflare Project Guidelines

This project is deployed to **Cloudflare** using Wrangler static asset hosting.

## Project Structure
- `src/`: React 18 + Vite SPA frontend
- `public/`: Static assets and Cloudflare configuration (`_headers`)
- `wrangler.toml`: Cloudflare Workers & static assets configuration
- `backend/rust-api`: Rust Axum API gateway (deployed separately)
- `backend/py-service`: Python FastAPI data service (deployed separately)

## Deployment
- Live URL: `https://tanish-portfolio.tanishjaswal56.workers.dev`
- Deploy command: `npm run deploy` (runs `vite build` followed by `wrangler deploy`)
- Local development: `npm run dev`
