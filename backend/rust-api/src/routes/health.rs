//! `GET /api/health` — gateway status plus downstream reachability.

use axum::Json;
use axum::extract::State;
use chrono::Utc;
use serde_json::{Value, json};

use crate::state::AppState;

/// Report gateway, profile and Python-service status.
pub async fn health(State(state): State<AppState>) -> Json<Value> {
    let python_info = state.python.health().await;
    let (cached_repos, cached_contribution_sets) = state.github.cache_entries();

    Json(json!({
        "status": "ok",
        "service": "rust-api",
        "version": env!("CARGO_PKG_VERSION"),
        "time": Utc::now().to_rfc3339(),
        "profile": {
            "name": state.profile.profile.name,
            "title": state.profile.profile.title,
            "skills": state.profile.skills.len(),
        },
        "github": {
            "defaultUsername": state.config.github_username,
            "authenticated": state.config.github_token.is_some(),
            "cacheTtlSeconds": state.config.cache_ttl.as_secs(),
            "cachedRepoSets": cached_repos,
            "cachedContributionSets": cached_contribution_sets,
        },
        "python": {
            "url": state.python.base_url(),
            "reachable": python_info.is_some(),
            "info": python_info,
        },
        "static": {
            "dir": state.config.static_dir.display().to_string(),
            "ready": state.config.static_dir.join("index.html").exists(),
        },
    }))
}
