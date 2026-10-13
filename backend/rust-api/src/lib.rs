//! Portfolio API gateway.
//!
//! Responsibilities:
//!
//! * own the public `/api/*` contract the browser talks to
//! * serve the shared resume data from the embedded `shared/profile.json`
//! * fetch and cache GitHub repositories and contribution data
//! * validate and rate limit contact submissions, then delegate delivery
//! * serve the built frontend (`dist/`) with SPA fallback in production
//!
//! The analytics and message delivery live in `backend/py-service` and are
//! proxied through here so the frontend only needs one origin.

pub mod cache;
pub mod config;
pub mod error;
pub mod github;
pub mod models;
pub mod python_client;
pub mod rate_limit;
pub mod routes;
pub mod state;

pub use config::Config;
pub use error::ApiError;
pub use state::AppState;

use axum::Router;
use axum::http::{HeaderValue, Method, header};
use axum::routing::get;
use tower_http::compression::CompressionLayer;
use tower_http::cors::{AllowOrigin, CorsLayer};
use tower_http::limit::RequestBodyLimitLayer;
use tower_http::services::{ServeDir, ServeFile};
use tower_http::trace::TraceLayer;

/// Largest request body accepted (contact submissions are tiny).
pub const MAX_BODY_BYTES: usize = 64 * 1024;

/// Build the CORS layer from configured origins, skipping unparsable values.
pub fn cors_layer(origins: &[String]) -> CorsLayer {
    let parsed: Vec<HeaderValue> = origins
        .iter()
        .filter_map(|origin| match HeaderValue::from_str(origin.trim()) {
            Ok(value) => Some(value),
            Err(_) => {
                tracing::warn!(%origin, "ignoring invalid CORS origin");
                None
            }
        })
        .collect();

    CorsLayer::new()
        .allow_origin(AllowOrigin::list(parsed))
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers([header::CONTENT_TYPE, header::ACCEPT, header::AUTHORIZATION])
        .max_age(std::time::Duration::from_secs(600))
}

/// Assemble the full application: `/api/*` routes, static assets, middleware.
pub fn build_router(state: AppState) -> Router {
    let api = routes::api_router();
    let static_dir = state.config.static_dir.clone();
    let cors = cors_layer(&state.config.allowed_origins);

    // Static assets with an SPA fallback: any unmatched path serves index.html.
    let static_files = ServeDir::new(&static_dir)
        .not_found_service(ServeFile::new(static_dir.join("index.html")));

    Router::new()
        .nest("/api", api)
        .route("/healthz", get(|| async { "ok" }))
        .fallback_service(static_files)
        .layer(RequestBodyLimitLayer::new(MAX_BODY_BYTES))
        .layer(CompressionLayer::new())
        .layer(TraceLayer::new_for_http())
        .layer(cors)
        .with_state(state)
}
