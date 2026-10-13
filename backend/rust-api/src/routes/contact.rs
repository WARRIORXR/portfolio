//! `POST /api/contact` — validate, rate limit, then hand off to the Python
//! service, which owns delivery. The upstream status is mirrored so validation
//! failures stay meaningful in the browser.

use axum::Json;
use axum::extract::{ConnectInfo, FromRequestParts, State};
use axum::http::HeaderMap;
use axum::http::request::Parts;
use axum::response::Response;
use std::convert::Infallible;
use std::net::SocketAddr;

use crate::error::ApiError;
use crate::models::ContactRequest;
use crate::state::AppState;

/// Longest accepted name.
pub const NAME_MAX: usize = 80;
/// Longest accepted subject.
pub const SUBJECT_MAX: usize = 140;
/// Shortest accepted message.
pub const MESSAGE_MIN: usize = 15;
/// Longest accepted message.
pub const MESSAGE_MAX: usize = 4000;

/// Result of validating a submission: trimmed fields, ready to forward.
#[derive(Debug, Clone)]
pub struct ValidatedContact {
    /// Trimmed payload.
    pub payload: ContactRequest,
}

fn has_control_chars(value: &str) -> bool {
    value.chars().any(|c| c == '\r' || c == '\n' || c == '\0')
}

/// Single-`@`, dotted domain, no whitespace — deliberately permissive but
/// strict enough to reject obvious junk before it reaches the mail server.
pub fn looks_like_email(value: &str) -> bool {
    if value.len() < 3 || value.len() > 254 || value.contains(char::is_whitespace) {
        return false;
    }
    if has_control_chars(value) {
        return false;
    }
    let mut parts = value.split('@');
    match (parts.next(), parts.next(), parts.next()) {
        (Some(local), Some(domain), None) => {
            !local.is_empty()
                && domain.contains('.')
                && !domain.starts_with('.')
                && !domain.ends_with('.')
                && !domain.starts_with('-')
        }
        _ => false,
    }
}

/// Validate and normalise a contact submission.
pub fn validate(payload: &ContactRequest) -> Result<ValidatedContact, ApiError> {
    let name = payload.name.trim();
    let email = payload.email.trim();
    let subject = payload.subject.trim();
    let message = payload.message.trim();

    if name.is_empty() {
        return Err(ApiError::BadRequest("name is required".to_string()));
    }
    if name.chars().count() > NAME_MAX || has_control_chars(name) {
        return Err(ApiError::BadRequest(format!(
            "name must be a single line of at most {NAME_MAX} characters"
        )));
    }
    if !looks_like_email(email) {
        return Err(ApiError::BadRequest("invalid email format".to_string()));
    }
    if subject.is_empty() || subject.chars().count() > SUBJECT_MAX || has_control_chars(subject) {
        return Err(ApiError::BadRequest(format!(
            "subject must be a single line of at most {SUBJECT_MAX} characters"
        )));
    }
    if message.chars().count() < MESSAGE_MIN {
        return Err(ApiError::BadRequest(format!(
            "message must be at least {MESSAGE_MIN} characters"
        )));
    }
    if message.chars().count() > MESSAGE_MAX {
        return Err(ApiError::BadRequest(format!(
            "message must be at most {MESSAGE_MAX} characters"
        )));
    }

    Ok(ValidatedContact {
        payload: ContactRequest {
            name: name.to_string(),
            email: email.to_string(),
            subject: subject.to_string(),
            message: message.to_string(),
        },
    })
}

/// Identify the caller for rate limiting: real socket peer first, then the
/// proxy headers the gateway may sit behind.
pub fn client_key(peer: Option<SocketAddr>, headers: &HeaderMap) -> String {
    if let Some(address) = peer {
        return address.ip().to_string();
    }
    if let Some(forwarded) = headers
        .get("x-forwarded-for")
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.split(',').next())
        .map(str::trim)
        .filter(|value| !value.is_empty())
    {
        return forwarded.to_string();
    }
    if let Some(real_ip) = headers
        .get("x-real-ip")
        .and_then(|value| value.to_str().ok())
        .map(str::trim)
        .filter(|value| !value.is_empty())
    {
        return real_ip.to_string();
    }
    "local".to_string()
}

/// Extractor for the caller's rate-limit key.
///
/// `ConnectInfo` is only present when the server was started with
/// `into_make_service_with_connect_info`; otherwise the proxy headers (or the
/// `local` bucket) are used, which keeps unit tests hermetic.
pub struct ClientKey(pub String);

impl<S> FromRequestParts<S> for ClientKey
where
    S: Send + Sync,
{
    type Rejection = Infallible;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let peer = parts
            .extensions
            .get::<ConnectInfo<SocketAddr>>()
            .map(|ConnectInfo(address)| *address);

        Ok(ClientKey(client_key(peer, &parts.headers)))
    }
}

/// Handle a contact submission.
pub async fn submit(
    State(state): State<AppState>,
    ClientKey(key): ClientKey,
    Json(payload): Json<ContactRequest>,
) -> Result<Response, ApiError> {
    let validated = validate(&payload)?;

    if !state.limiter.check(&key) {
        tracing::warn!(client = %key, "contact submission rate limited");
        return Err(ApiError::RateLimited);
    }

    let forwarded = state.python.submit_contact(&validated.payload).await?;

    if forwarded.status >= 400 {
        tracing::warn!(
            client = %key,
            status = forwarded.status,
            "contact submission rejected by the data service"
        );
    } else {
        tracing::info!(client = %key, status = forwarded.status, "contact submission accepted");
    }

    Ok(forwarded.into_response())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn payload(name: &str, email: &str, subject: &str, message: &str) -> ContactRequest {
        ContactRequest {
            name: name.to_string(),
            email: email.to_string(),
            subject: subject.to_string(),
            message: message.to_string(),
        }
    }

    #[test]
    fn accepts_a_valid_submission_and_trims_it() {
        let validated = validate(&payload(
            "  Recruiter  ",
            " recruiter@example.com ",
            " Internship ",
            "  We would like to talk about an internship.  ",
        ))
        .expect("payload is valid");

        assert_eq!(validated.payload.name, "Recruiter");
        assert_eq!(validated.payload.email, "recruiter@example.com");
        assert!(validated.payload.message.starts_with("We would like"));
    }

    #[test]
    fn rejects_header_injection_attempts() {
        let error = validate(&payload(
            "Recruiter",
            "recruiter@example.com",
            "Hello\nBcc: attacker@example.com",
            "A perfectly reasonable message body.",
        ))
        .expect_err("newlines in the subject must be rejected");

        assert_eq!(error.status(), axum::http::StatusCode::BAD_REQUEST);
    }

    #[test]
    fn rejects_bad_emails() {
        for email in ["", "nope", "a@b", "@example.com", "a b@example.com", "a@@b.com"] {
            assert!(!looks_like_email(email), "{email} should be rejected");
        }
        assert!(looks_like_email("tanishjaswal56@gmail.com"));
        assert!(looks_like_email("a.b+tag@sub.domain.co.uk"));
    }

    #[test]
    fn rejects_short_and_oversized_messages() {
        assert!(validate(&payload("A", "a@b.com", "s", "too short")).is_err());
        assert!(
            validate(&payload("A", "a@b.com", "s", &"x".repeat(MESSAGE_MAX + 1))).is_err()
        );
    }

    #[test]
    fn peer_address_wins_over_forwarded_headers() {
        let mut headers = HeaderMap::new();
        headers.insert("x-forwarded-for", "9.9.9.9".parse().unwrap());

        let peer: SocketAddr = "10.0.0.5:4444".parse().unwrap();
        assert_eq!(client_key(Some(peer), &headers), "10.0.0.5");
        assert_eq!(client_key(None, &headers), "9.9.9.9");
        assert_eq!(client_key(None, &HeaderMap::new()), "local");
    }
}
