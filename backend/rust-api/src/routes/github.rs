//! GitHub endpoints backed by the gateway's own TTL cache.

use axum::Json;
use axum::extract::{Query, State};
use chrono::Utc;
use serde::Deserialize;
use serde_json::{Value, json};

use crate::error::ApiError;
use crate::github::contribution_total;
use crate::state::AppState;

/// Query parameters accepted by the GitHub routes.
#[derive(Debug, Deserialize)]
pub struct GithubQuery {
    /// GitHub login; defaults to the configured username.
    pub username: Option<String>,
}

/// Public repositories for a user, cached for the configured TTL.
pub async fn repos(
    State(state): State<AppState>,
    Query(query): Query<GithubQuery>,
) -> Result<Json<Value>, ApiError> {
    let username = resolve(&state, query.username.as_deref());
    let repos = state.github.repos(Some(&username)).await?;

    Ok(Json(json!({
        "username": username,
        "count": repos.len(),
        "repos": &repos[..],
        "cacheAgeSeconds": state.github.repos_cache_age(&username),
        "fetchedAt": Utc::now().to_rfc3339(),
    })))
}

/// Contribution calendar for the last year.
pub async fn contributions(
    State(state): State<AppState>,
    Query(query): Query<GithubQuery>,
) -> Result<Json<Value>, ApiError> {
    let username = resolve(&state, query.username.as_deref());
    let days = state.github.contributions(Some(&username)).await?;
    let total = contribution_total(&days);

    Ok(Json(json!({
        "username": username,
        "total": total,
        "days": &days[..],
        "fetchedAt": Utc::now().to_rfc3339(),
    })))
}

fn resolve(state: &AppState, username: Option<&str>) -> String {
    username
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| state.config.github_username.clone())
}
