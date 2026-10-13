//! HTTP surface of the gateway.

pub mod contact;
pub mod github;
pub mod health;
pub mod profile;
pub mod proxy;

use axum::Router;
use axum::routing::{get, post};

use crate::state::AppState;

/// Every gateway route, mounted by [`crate::build_router`] under `/api`.
pub fn api_router() -> Router<AppState> {
    Router::new()
        // Gateway + data
        .route("/health", get(health::health))
        .route("/profile", get(profile::document))
        .route("/profile/personal", get(profile::personal))
        .route("/profile/skills", get(profile::skills))
        .route("/stats", get(profile::stats))
        // GitHub (cached in the gateway)
        .route("/github/repos", get(github::repos))
        .route("/github/contributions", get(github::contributions))
        // Analytics (served by the Python service)
        .route("/analytics/summary", get(proxy::analytics_summary))
        .route("/insights", get(proxy::insights))
        // Contact (validated here, delivered by the Python service)
        .route("/contact", post(contact::submit))
}
