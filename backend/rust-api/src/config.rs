//! Runtime configuration, read from the environment with safe defaults.

use std::env;
use std::net::SocketAddr;
use std::path::PathBuf;
use std::time::Duration;

/// Repository root, derived from this crate's manifest directory.
pub fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .and_then(|backend| backend.parent())
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("."))
}

fn env_string(key: &str, default: &str) -> String {
    match env::var(key) {
        Ok(value) if !value.trim().is_empty() => value.trim().to_string(),
        _ => default.to_string(),
    }
}

fn env_opt(key: &str) -> Option<String> {
    match env::var(key) {
        Ok(value) if !value.trim().is_empty() => Some(value.trim().to_string()),
        _ => None,
    }
}

fn env_u64(key: &str, default: u64) -> u64 {
    env_opt(key)
        .and_then(|value| value.parse::<u64>().ok())
        .unwrap_or(default)
}

fn env_u32(key: &str, default: u32) -> u32 {
    env_opt(key)
        .and_then(|value| value.parse::<u32>().ok())
        .unwrap_or(default)
}

/// Gateway configuration.
#[derive(Debug, Clone)]
pub struct Config {
    /// Address the HTTP server binds to.
    pub bind_addr: SocketAddr,
    /// Base URL of the Python data service.
    pub python_url: String,
    /// Default GitHub username used when a request omits `username`.
    pub github_username: String,
    /// Optional GitHub token; without it the API is limited to 60 req/hour.
    pub github_token: Option<String>,
    /// Upstream request timeout for GitHub.
    pub github_timeout: Duration,
    /// TTL for cached GitHub responses.
    pub cache_ttl: Duration,
    /// Allowed browser origins for CORS.
    pub allowed_origins: Vec<String>,
    /// Directory holding the built frontend (`dist/`).
    pub static_dir: PathBuf,
    /// Maximum contact submissions allowed per IP per minute.
    pub contact_rate_limit: u32,
}

impl Config {
    /// Build configuration from the process environment.
    pub fn from_env() -> Self {
        let host = env_string("HOST", "127.0.0.1");
        let port = env_u64("PORT", 8080);
        let bind_addr = format!("{host}:{port}")
            .parse::<SocketAddr>()
            .unwrap_or_else(|_| SocketAddr::from(([127, 0, 0, 1], 8080)));

        let allowed_origins = env_string(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,http://localhost:5199,http://127.0.0.1:5173,http://127.0.0.1:5199,https://tanishjaswal.tech,https://www.tanishjaswal.tech,https://tanish-portfolio.tanishjaswal56.workers.dev",
        )
        .split(',')
        .map(|origin| origin.trim().to_string())
        .filter(|origin| !origin.is_empty())
        .collect();

        Self {
            bind_addr,
            python_url: env_string("PY_SERVICE_URL", "http://127.0.0.1:8000"),
            github_username: env_string("GITHUB_USERNAME", "WARRIORXR"),
            github_token: env_opt("GITHUB_TOKEN"),
            github_timeout: Duration::from_secs(env_u64("GITHUB_TIMEOUT", 10)),
            cache_ttl: Duration::from_secs(env_u64("GITHUB_CACHE_TTL", 3600)),
            allowed_origins,
            static_dir: env_opt("STATIC_DIR")
                .map(PathBuf::from)
                .unwrap_or_else(|| repo_root().join("dist")),
            contact_rate_limit: env_u32("CONTACT_RATE_LIMIT", 5),
        }
    }
}

impl Default for Config {
    fn default() -> Self {
        Self {
            bind_addr: SocketAddr::from(([127, 0, 0, 1], 8080)),
            python_url: "http://127.0.0.1:8000".to_string(),
            github_username: "WARRIORXR".to_string(),
            github_token: None,
            github_timeout: Duration::from_secs(10),
            cache_ttl: Duration::from_secs(3600),
            allowed_origins: vec!["http://localhost:5173".to_string()],
            static_dir: repo_root().join("dist"),
            contact_rate_limit: 5,
        }
    }
}
