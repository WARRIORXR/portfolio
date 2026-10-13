//! GitHub data access: normalisation of upstream payloads plus a TTL cache.
//!
//! The gateway talks to two public read-only upstreams:
//!
//! * `api.github.com` for repositories (60 req/hour unauthenticated)
//! * `github-contributions-api.jogruber.de` for the contribution calendar
//!
//! Both responses are cached so a traffic spike on the site does not exhaust
//! the upstream rate limit.

use std::sync::Arc;
use std::time::Duration;

use reqwest::header::{ACCEPT, HeaderValue};
use reqwest::{Client, StatusCode};

use crate::cache::{SharedCache, TtlCache};
use crate::error::ApiError;
use crate::models::{ContributionDay, ContributionResponse, GithubRepoRaw, Repo};

const REPOS_URL: &str = "https://api.github.com/users";
const CONTRIBUTIONS_URL: &str = "https://github-contributions-api.jogruber.de/v4";
const GITHUB_ACCEPT: &str = "application/vnd.github.v3+json";
const USER_AGENT_VALUE: &str = "tanish-jaswal-portfolio-api";

/// Longest GitHub login is 39 characters; short names are allowed.
pub const MAX_USERNAME_LEN: usize = 39;

/// Whether `username` is a plausible GitHub login (also blocks path injection).
pub fn valid_username(username: &str) -> bool {
    let trimmed = username.trim();
    if trimmed.is_empty() || trimmed.len() > MAX_USERNAME_LEN {
        return false;
    }
    trimmed.chars().all(|c| c.is_ascii_alphanumeric() || c == '-')
        && !trimmed.starts_with('-')
        && !trimmed.ends_with('-')
}

/// Drop forks and undocumented repos, normalise, then rank by stars and recency.
pub fn normalize_repos(raw: Vec<GithubRepoRaw>) -> Vec<Repo> {
    let mut repos: Vec<Repo> = raw
        .into_iter()
        .filter(|repo| !repo.fork.unwrap_or(false))
        .filter(|repo| {
            repo.description
                .as_deref()
                .map(|description| !description.trim().is_empty())
                .unwrap_or(false)
        })
        .map(|repo| Repo {
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description.unwrap_or_default().trim().to_string(),
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            url: repo.html_url,
            homepage: repo.homepage.filter(|value| !value.trim().is_empty()),
            topics: repo.topics.unwrap_or_default(),
            updated_at: repo.updated_at.unwrap_or_default(),
        })
        .collect();

    repos.sort_by(|a, b| {
        b.stars
            .cmp(&a.stars)
            .then_with(|| b.updated_at.cmp(&a.updated_at))
            .then_with(|| a.name.cmp(&b.name))
    });
    repos
}

/// Convert an upstream contributions payload into a chronological day series.
pub fn contribution_days(response: ContributionResponse) -> Vec<ContributionDay> {
    let mut days: Vec<ContributionDay> = response
        .contributions
        .into_iter()
        .filter(|entry| !entry.date.trim().is_empty())
        .map(|entry| ContributionDay {
            date: entry.date,
            count: entry.count.unwrap_or(0).max(0),
        })
        .collect();

    days.sort_by(|a, b| a.date.cmp(&b.date));
    days
}

/// Sum of contributions across the calendar.
pub fn contribution_total(days: &[ContributionDay]) -> i64 {
    days.iter().map(|day| day.count).sum()
}

/// GitHub client with per-username caching.
pub struct GithubClient {
    http: Client,
    token: Option<String>,
    default_username: String,
    repos_cache: SharedCache<Vec<Repo>>,
    contributions_cache: SharedCache<Vec<ContributionDay>>,
}

impl GithubClient {
    /// Build a client. `ttl` applies to both caches.
    pub fn new(
        timeout: Duration,
        ttl: Duration,
        token: Option<String>,
        default_username: String,
    ) -> Result<Self, ApiError> {
        let http = Client::builder()
            .timeout(timeout)
            .user_agent(USER_AGENT_VALUE)
            .build()
            .map_err(|error| ApiError::Internal(format!("could not build HTTP client: {error}")))?;

        Ok(Self {
            http,
            token,
            default_username,
            repos_cache: Arc::new(TtlCache::new(ttl)),
            contributions_cache: Arc::new(TtlCache::new(ttl)),
        })
    }

    /// Cached entry counts as `(repos, contributions)`.
    pub fn cache_entries(&self) -> (usize, usize) {
        (self.repos_cache.len(), self.contributions_cache.len())
    }

    /// Age in seconds of a cached repository entry.
    pub fn repos_cache_age(&self, username: &str) -> Option<u64> {
        self.repos_cache.age_secs(&cache_key("repos", username))
    }

    fn resolve_username(&self, username: Option<&str>) -> Result<String, ApiError> {
        let candidate = username
            .map(|value| value.trim().to_string())
            .filter(|value| !value.is_empty())
            .unwrap_or_else(|| self.default_username.clone());

        if !valid_username(&candidate) {
            return Err(ApiError::BadRequest(format!(
                "invalid GitHub username: {candidate:?}"
            )));
        }
        Ok(candidate)
    }

    /// Public, documented, non-fork repositories for a user.
    pub async fn repos(&self, username: Option<&str>) -> Result<Arc<Vec<Repo>>, ApiError> {
        let username = self.resolve_username(username)?;
        let key = cache_key("repos", &username);
        if let Some(cached) = self.repos_cache.get(&key) {
            return Ok(cached);
        }

        let url = format!("{REPOS_URL}/{username}/repos?sort=updated&per_page=100&type=public");
        let response = self.send(&url, GITHUB_ACCEPT).await?;
        let raw: Vec<GithubRepoRaw> = response.json().await.map_err(deserialize_error)?;
        let repos = Arc::new(normalize_repos(raw));
        self.repos_cache.insert(&key, Arc::clone(&repos));
        Ok(repos)
    }

    /// Contribution calendar for the last year.
    pub async fn contributions(
        &self,
        username: Option<&str>,
    ) -> Result<Arc<Vec<ContributionDay>>, ApiError> {
        let username = self.resolve_username(username)?;
        let key = cache_key("contributions", &username);
        if let Some(cached) = self.contributions_cache.get(&key) {
            return Ok(cached);
        }

        let url = format!("{CONTRIBUTIONS_URL}/{username}?y=last");
        let response = self.send(&url, "application/json").await?;
        let payload: ContributionResponse = response.json().await.map_err(deserialize_error)?;
        let days = Arc::new(contribution_days(payload));
        self.contributions_cache.insert(&key, Arc::clone(&days));
        Ok(days)
    }

    async fn send(&self, url: &str, accept: &str) -> Result<reqwest::Response, ApiError> {
        let accept = HeaderValue::from_str(accept)
            .map_err(|error| ApiError::Internal(format!("bad Accept header: {error}")))?;

        let mut request = self.http.get(url).header(ACCEPT, accept);
        if let Some(token) = &self.token {
            request = request.bearer_auth(token);
        }

        let response = request
            .send()
            .await
            .map_err(|error| ApiError::Upstream(format!("request to {url} failed: {error}")))?;

        match response.status() {
            status if status.is_success() => Ok(response),
            StatusCode::NOT_FOUND => Err(ApiError::NotFound(format!("upstream 404 for {url}"))),
            StatusCode::FORBIDDEN | StatusCode::TOO_MANY_REQUESTS => Err(ApiError::Upstream(format!(
                "upstream rate limit reached for {url} (HTTP {})",
                response.status().as_u16()
            ))),
            status => Err(ApiError::Upstream(format!(
                "upstream HTTP {} for {url}",
                status.as_u16()
            ))),
        }
    }
}

fn cache_key(prefix: &str, username: &str) -> String {
    format!("{prefix}:{}", username.to_ascii_lowercase())
}

fn deserialize_error(error: reqwest::Error) -> ApiError {
    ApiError::Upstream(format!("could not decode upstream payload: {error}"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::ContributionEntry;

    fn raw_repo(name: &str, stars: u64, fork: bool, description: Option<&str>) -> GithubRepoRaw {
        GithubRepoRaw {
            id: 1,
            name: name.to_string(),
            full_name: format!("WARRIORXR/{name}"),
            description: description.map(str::to_string),
            language: Some("Python".to_string()),
            stargazers_count: stars,
            forks_count: 0,
            html_url: format!("https://github.com/WARRIORXR/{name}"),
            homepage: Some("   ".to_string()),
            topics: None,
            updated_at: Some("2026-09-01T00:00:00Z".to_string()),
            fork: Some(fork),
        }
    }

    #[test]
    fn usernames_are_validated() {
        assert!(valid_username("WARRIORXR"));
        assert!(valid_username("some-user-99"));
        assert!(!valid_username(""));
        assert!(!valid_username("-leading"));
        assert!(!valid_username("trailing-"));
        assert!(!valid_username("../../etc/passwd"));
        assert!(!valid_username("has space"));
        assert!(!valid_username(&"a".repeat(40)));
    }

    #[test]
    fn repos_are_filtered_and_ranked() {
        let repos = normalize_repos(vec![
            raw_repo("low-stars", 1, false, Some("documented")),
            raw_repo("high-stars", 9, false, Some("documented")),
            raw_repo("a-fork", 50, true, Some("documented")),
            raw_repo("undocumented", 30, false, None),
        ]);

        let names: Vec<&str> = repos.iter().map(|repo| repo.name.as_str()).collect();
        assert_eq!(names, vec!["high-stars", "low-stars"]);
        assert_eq!(repos[0].full_name, "WARRIORXR/high-stars");
        // Blank homepages are normalised to None.
        assert!(repos[0].homepage.is_none());
        assert!(repos[0].topics.is_empty());
    }

    #[test]
    fn contributions_are_sorted_and_clamped() {
        let days = contribution_days(ContributionResponse {
            contributions: vec![
                ContributionEntry {
                    date: "2026-01-03".to_string(),
                    count: Some(2),
                },
                ContributionEntry {
                    date: "2026-01-01".to_string(),
                    count: None,
                },
                ContributionEntry {
                    date: "2026-01-02".to_string(),
                    count: Some(-4),
                },
                ContributionEntry {
                    date: "  ".to_string(),
                    count: Some(5),
                },
            ],
        });

        assert_eq!(days.len(), 3);
        assert_eq!(days[0].date, "2026-01-01");
        assert_eq!(days[0].count, 0);
        assert_eq!(days[1].count, 0);
        assert_eq!(contribution_total(&days), 2);
    }

    #[test]
    fn client_reports_empty_caches_before_any_request() {
        let client = GithubClient::new(
            Duration::from_secs(1),
            Duration::from_secs(60),
            None,
            "WARRIORXR".to_string(),
        )
        .expect("client builds");

        assert_eq!(client.cache_entries(), (0, 0));
        assert!(client.repos_cache_age("WARRIORXR").is_none());
    }

    #[tokio::test]
    async fn invalid_username_is_rejected_without_a_request() {
        let client = GithubClient::new(
            Duration::from_secs(1),
            Duration::from_secs(60),
            None,
            "WARRIORXR".to_string(),
        )
        .expect("client builds");

        let error = client
            .repos(Some("../evil"))
            .await
            .expect_err("path traversal must be rejected");
        assert_eq!(error.status(), StatusCode::BAD_REQUEST);
    }
}
