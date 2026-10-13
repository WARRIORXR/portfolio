//! Error type shared by every handler, with a stable JSON error envelope.

use axum::Json;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use serde_json::json;

/// Everything a handler can fail with.
#[derive(Debug)]
pub enum ApiError {
    /// The request was malformed (400).
    BadRequest(String),
    /// The route does not exist (404).
    NotFound(String),
    /// A prerequisite service is unavailable (502/503).
    Upstream(String),
    /// The caller exceeded its rate limit (429).
    RateLimited,
    /// Unexpected server-side failure (500).
    Internal(String),
}

impl ApiError {
    /// Stable machine-readable discriminator for the error envelope.
    pub fn kind(&self) -> &'static str {
        match self {
            ApiError::BadRequest(_) => "bad_request",
            ApiError::NotFound(_) => "not_found",
            ApiError::Upstream(_) => "upstream_error",
            ApiError::RateLimited => "rate_limited",
            ApiError::Internal(_) => "internal_error",
        }
    }

    /// HTTP status paired with each variant.
    pub fn status(&self) -> StatusCode {
        match self {
            ApiError::BadRequest(_) => StatusCode::BAD_REQUEST,
            ApiError::NotFound(_) => StatusCode::NOT_FOUND,
            ApiError::Upstream(_) => StatusCode::BAD_GATEWAY,
            ApiError::RateLimited => StatusCode::TOO_MANY_REQUESTS,
            ApiError::Internal(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    /// Human-readable message.
    pub fn message(&self) -> String {
        match self {
            ApiError::BadRequest(message)
            | ApiError::NotFound(message)
            | ApiError::Upstream(message)
            | ApiError::Internal(message) => message.clone(),
            ApiError::RateLimited => "too many requests — please try again shortly".to_string(),
        }
    }
}

impl std::fmt::Display for ApiError {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(formatter, "{}: {}", self.kind(), self.message())
    }
}

impl std::error::Error for ApiError {}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        (
            self.status(),
            Json(json!({
                "error": {
                    "kind": self.kind(),
                    "message": self.message(),
                }
            })),
        )
            .into_response()
    }
}

impl From<reqwest::Error> for ApiError {
    fn from(error: reqwest::Error) -> Self {
        ApiError::Upstream(format!("upstream request failed: {error}"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn statuses_and_kinds_line_up() {
        assert_eq!(ApiError::RateLimited.status(), StatusCode::TOO_MANY_REQUESTS);
        assert_eq!(ApiError::RateLimited.kind(), "rate_limited");
        assert_eq!(
            ApiError::BadRequest("nope".into()).status(),
            StatusCode::BAD_REQUEST
        );
        assert_eq!(ApiError::Upstream("boom".into()).kind(), "upstream_error");
        assert!(ApiError::Upstream("boom".into()).message().contains("boom"));
    }
}
