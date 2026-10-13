//! Thin client for the Python data service.
//!
//! The gateway uses it for three jobs: reporting service health, forwarding
//! contact submissions, and proxying analytics. Upstream status codes are
//! preserved so a validation failure in Python (422) is not flattened into a
//! generic gateway error in the browser.

use std::time::Duration;

use axum::Json;
use axum::response::{IntoResponse, Response};
use reqwest::{Client, StatusCode};
use serde_json::Value;

use crate::error::ApiError;
use crate::models::ContactRequest;

/// A response relayed from the Python service.
#[derive(Debug, Clone)]
pub struct Forwarded {
    /// Upstream HTTP status.
    pub status: u16,
    /// Parsed JSON body, or `{"detail": "<raw text>"}` when it was not JSON.
    pub body: Value,
}

impl Forwarded {
    /// Mirror the upstream response, keeping its status and JSON body.
    pub fn into_response(self) -> Response {
        let status = StatusCode::from_u16(self.status).unwrap_or(StatusCode::BAD_GATEWAY);
        (status, Json(self.body)).into_response()
    }
}

/// Client for `backend/py-service`.
pub struct PythonClient {
    http: Client,
    base_url: String,
}

impl PythonClient {
    /// Build a client pointed at `base_url`, e.g. `http://127.0.0.1:8000`.
    pub fn new(base_url: impl Into<String>, timeout: Duration) -> Result<Self, ApiError> {
        let http = Client::builder()
            .timeout(timeout)
            .build()
            .map_err(|error| ApiError::Internal(format!("could not build HTTP client: {error}")))?;

        Ok(Self {
            http,
            base_url: base_url.into().trim_end_matches('/').to_string(),
        })
    }

    /// Configured base URL.
    pub fn base_url(&self) -> &str {
        &self.base_url
    }

    /// `GET /health`. Returns `None` when the service is down.
    pub async fn health(&self) -> Option<Value> {
        let url = format!("{}/health", self.base_url);
        match self.http.get(url).send().await {
            Ok(response) if response.status().is_success() => response.json().await.ok(),
            _ => None,
        }
    }

    /// `GET` a service path and relay status plus body.
    pub async fn forward_get(&self, path: &str) -> Result<Forwarded, ApiError> {
        let url = format!("{}{}", self.base_url, normalize_path(path));
        let response = self
            .http
            .get(&url)
            .send()
            .await
            .map_err(|error| unreachable_service(&url, &error))?;
        decode(response, &url).await
    }

    /// `POST` a JSON payload and relay status plus body.
    pub async fn forward_post(&self, path: &str, body: &Value) -> Result<Forwarded, ApiError> {
        let url = format!("{}{}", self.base_url, normalize_path(path));
        let response = self
            .http
            .post(&url)
            .json(body)
            .send()
            .await
            .map_err(|error| unreachable_service(&url, &error))?;
        decode(response, &url).await
    }

    /// Submit a validated contact message for delivery.
    pub async fn submit_contact(&self, payload: &ContactRequest) -> Result<Forwarded, ApiError> {
        let body = serde_json::to_value(payload)
            .map_err(|error| ApiError::Internal(format!("could not serialise contact: {error}")))?;
        self.forward_post("/contact", &body).await
    }
}

fn normalize_path(path: &str) -> String {
    if path.starts_with('/') {
        path.to_string()
    } else {
        format!("/{path}")
    }
}

fn unreachable_service(url: &str, error: &reqwest::Error) -> ApiError {
    ApiError::Upstream(format!(
        "python data service unreachable at {url}: {error}. Start it with `npm run dev:py`."
    ))
}

async fn decode(response: reqwest::Response, url: &str) -> Result<Forwarded, ApiError> {
    let status = response.status().as_u16();
    let text = response
        .text()
        .await
        .map_err(|error| ApiError::Upstream(format!("could not read response from {url}: {error}")))?;

    let body = serde_json::from_str(&text).unwrap_or_else(|_| {
        serde_json::json!({ "detail": text.chars().take(500).collect::<String>() })
    });

    Ok(Forwarded { status, body })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn paths_are_normalised() {
        assert_eq!(normalize_path("health"), "/health");
        assert_eq!(normalize_path("/analytics/summary"), "/analytics/summary");
    }

    #[test]
    fn base_url_trailing_slash_is_removed() {
        let client = PythonClient::new("http://127.0.0.1:8000/", Duration::from_secs(5))
            .expect("client builds");
        assert_eq!(client.base_url(), "http://127.0.0.1:8000");
    }

    #[test]
    fn forwarded_responses_keep_their_status() {
        let forwarded = Forwarded {
            status: 422,
            body: serde_json::json!({ "detail": "invalid" }),
        };
        let response = forwarded.into_response();
        assert_eq!(response.status(), StatusCode::UNPROCESSABLE_ENTITY);
    }

    #[test]
    fn unknown_status_falls_back_to_502() {
        let forwarded = Forwarded {
            status: 9999,
            body: serde_json::json!({}),
        };
        assert_eq!(forwarded.into_response().status(), StatusCode::BAD_GATEWAY);
    }
}
