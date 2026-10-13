//! Integration tests for the gateway HTTP surface.
//!
//! These are hermetic: the Python service points at a closed port, the static
//! directory does not exist, and no test reaches out to GitHub. Requests that
//! would need the network are exercised through their validation paths.

use std::path::PathBuf;

use axum::Router;
use axum::body::Body;
use axum::http::{Request, StatusCode};
use axum::response::Response;
use rust_api::{AppState, Config, build_router};
use serde_json::Value;
use tower::ServiceExt;

const CLOSED_PORT_URL: &str = "http://127.0.0.1:59999";
const CONTACT_LIMIT: u32 = 3;

fn app() -> Router {
    let config = Config {
        python_url: CLOSED_PORT_URL.to_string(),
        static_dir: PathBuf::from("this-directory-does-not-exist"),
        contact_rate_limit: CONTACT_LIMIT,
        ..Config::default()
    };

    build_router(AppState::new(config).expect("state must build from the shared profile"))
}

async fn send(request: Request<Body>) -> (StatusCode, Value) {
    let response: Response = app().oneshot(request).await.expect("router responds");
    let status = response.status();
    let bytes = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("body is readable");
    let json = serde_json::from_slice(&bytes).unwrap_or(Value::Null);
    (status, json)
}

fn get(uri: &str) -> Request<Body> {
    Request::builder()
        .uri(uri)
        .body(Body::empty())
        .expect("request builds")
}

fn post_json(uri: &str, body: &Value) -> Request<Body> {
    Request::builder()
        .method("POST")
        .uri(uri)
        .header("content-type", "application/json")
        .body(Body::from(body.to_string()))
        .expect("request builds")
}

#[tokio::test]
async fn health_reports_gateway_and_downstream_state() {
    let (status, body) = send(get("/api/health")).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["status"], "ok");
    assert_eq!(body["service"], "rust-api");
    assert_eq!(body["profile"]["name"], "Tanish Jaswal");
    assert_eq!(body["profile"]["skills"], 15);
    assert_eq!(body["python"]["reachable"], false);
    assert_eq!(body["static"]["ready"], false);
}

#[tokio::test]
async fn profile_routes_serve_the_shared_document() {
    let (status, body) = send(get("/api/profile")).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["profile"]["githubUsername"], "WARRIORXR");
    assert_eq!(body["skills"].as_array().expect("skills array").len(), 15);

    let (status, body) = send(get("/api/profile/personal")).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["email"], "tanishjaswal56@gmail.com");

    let (status, body) = send(get("/api/profile/skills")).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["skillCategories"].as_array().expect("categories").len(), 4);

    let (status, body) = send(get("/api/stats")).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["counts"]["skills"], 15);
    assert_eq!(body["counts"]["categories"], 3);
    assert_eq!(body["counts"]["categoriesCovered"], 3);
    assert_eq!(body["declared"].as_array().expect("stats").len(), 4);
}

#[tokio::test]
async fn github_rejects_an_invalid_username_before_calling_out() {
    let (status, body) = send(get("/api/github/repos?username=..%2F..%2Fetc")).await;

    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert_eq!(body["error"]["kind"], "bad_request");

    let (status, _) = send(get("/api/insights?username=has%20space")).await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn contact_validation_runs_in_the_gateway() {
    let invalid_email = serde_json::json!({
        "name": "Recruiter",
        "email": "not-an-email",
        "subject": "Internship",
        "message": "A perfectly reasonable message body.",
    });
    let (status, body) = send(post_json("/api/contact", &invalid_email)).await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert!(body["error"]["message"].as_str().expect("message").contains("email"));

    let injected = serde_json::json!({
        "name": "Recruiter",
        "email": "recruiter@example.com",
        "subject": "Hello\nBcc: attacker@example.com",
        "message": "A perfectly reasonable message body.",
    });
    let (status, _) = send(post_json("/api/contact", &injected)).await;
    assert_eq!(status, StatusCode::BAD_REQUEST);

    let too_short = serde_json::json!({
        "name": "Recruiter",
        "email": "recruiter@example.com",
        "subject": "Internship",
        "message": "hi",
    });
    let (status, _) = send(post_json("/api/contact", &too_short)).await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn valid_contact_reports_the_unreachable_data_service() {
    let valid = serde_json::json!({
        "name": "Recruiter",
        "email": "recruiter@example.com",
        "subject": "Internship",
        "message": "We would like to discuss a data analyst internship.",
    });
    let (status, body) = send(post_json("/api/contact", &valid)).await;

    assert_eq!(status, StatusCode::BAD_GATEWAY);
    assert_eq!(body["error"]["kind"], "upstream_error");
}

#[tokio::test]
async fn contact_is_rate_limited_per_client() {
    let valid = serde_json::json!({
        "name": "Recruiter",
        "email": "recruiter@example.com",
        "subject": "Internship",
        "message": "We would like to discuss a data analyst internship.",
    });

    // The limiter counts before the upstream call, so the first CONTACT_LIMIT
    // attempts reach the (unreachable) data service and the next one is 429.
    for _ in 0..CONTACT_LIMIT {
        let (status, _) = send(post_json("/api/contact", &valid)).await;
        assert_ne!(status, StatusCode::TOO_MANY_REQUESTS);
    }

    let (status, body) = send(post_json("/api/contact", &valid)).await;
    assert_eq!(status, StatusCode::TOO_MANY_REQUESTS);
    assert_eq!(body["error"]["kind"], "rate_limited");
}

#[tokio::test]
async fn unknown_paths_fall_back_to_static_assets() {
    let (status, _) = send(get("/api/not-a-route")).await;
    assert_eq!(status, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn healthz_is_plain_text() {
    let response = app().oneshot(get("/healthz")).await.expect("healthz responds");

    assert_eq!(response.status(), StatusCode::OK);
    let bytes = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("body");
    assert_eq!(&bytes[..], b"ok");
}
