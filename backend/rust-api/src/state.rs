//! Application state shared by every handler.

use std::sync::Arc;
use std::time::Duration;

use crate::config::Config;
use crate::error::ApiError;
use crate::github::GithubClient;
use crate::models::ProfileDocument;
use crate::python_client::PythonClient;
use crate::rate_limit::RateLimiter;

/// Everything a handler needs, cheap to clone (all fields are reference counted).
#[derive(Clone)]
pub struct AppState {
    /// Resolved configuration.
    pub config: Arc<Config>,
    /// The shared profile document, parsed once at startup.
    pub profile: Arc<ProfileDocument>,
    /// GitHub client with its response caches.
    pub github: Arc<GithubClient>,
    /// Client for the Python data service.
    pub python: Arc<PythonClient>,
    /// Per-client limiter for the contact endpoint.
    pub limiter: Arc<RateLimiter>,
}

impl AppState {
    /// Build state from configuration, failing fast on an unusable profile.
    pub fn new(config: Config) -> Result<Self, ApiError> {
        let profile = ProfileDocument::embedded().map_err(|error| {
            ApiError::Internal(format!("shared/profile.json does not match the API types: {error}"))
        })?;

        let github = GithubClient::new(
            config.github_timeout,
            config.cache_ttl,
            config.github_token.clone(),
            config.github_username.clone(),
        )?;

        let python = PythonClient::new(config.python_url.clone(), Duration::from_secs(10))?;

        let limiter = RateLimiter::new(config.contact_rate_limit, Duration::from_secs(60));

        Ok(Self {
            config: Arc::new(config),
            profile: Arc::new(profile),
            github: Arc::new(github),
            python: Arc::new(python),
            limiter: Arc::new(limiter),
        })
    }
}
