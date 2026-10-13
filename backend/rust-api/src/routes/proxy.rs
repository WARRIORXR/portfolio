//! Proxy handlers: the gateway owns the public URL space, the Python service
//! owns the analytics. Upstream status codes are preserved.

use axum::extract::{Query, State};
use axum::response::Response;

use crate::error::ApiError;
use crate::github::valid_username;
use crate::routes::github::GithubQuery;
use crate::state::AppState;

/// `GET /api/analytics/summary` → Python `/analytics/summary`.
pub async fn analytics_summary(State(state): State<AppState>) -> Result<Response, ApiError> {
    let forwarded = state.python.forward_get("/analytics/summary").await?;
    Ok(forwarded.into_response())
}

/// `GET /api/insights` → Python `/github/insights`.
pub async fn insights(
    State(state): State<AppState>,
    Query(query): Query<GithubQuery>,
) -> Result<Response, ApiError> {
    let username = query
        .username
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| state.config.github_username.clone());

    // Validate before interpolating into an upstream query string.
    if !valid_username(&username) {
        return Err(ApiError::BadRequest(format!(
            "invalid GitHub username: {username:?}"
        )));
    }

    let forwarded = state
        .python
        .forward_get(&format!("/github/insights?username={username}"))
        .await?;
    Ok(forwarded.into_response())
}
