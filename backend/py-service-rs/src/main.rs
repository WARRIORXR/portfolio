//! Portfolio data service — Rust port of the FastAPI `py-service`
//! (`backend/py-service/`). Same endpoints, same analytics, same GitHub
//! normalisation, same JSONL contact store. Designed to slot in behind the
//! existing Rust gateway (`backend/rust-api`).
//!
//! Endpoints:
//!   GET  /health
//!   GET  /profile            GET /profile/personal
//!   GET  /analytics/summary
//!   GET  /github/repos?username=      GET /github/contributions?username=
//!   GET  /github/insights?username=
//!   POST /contact
//!
//! SMTP delivery is not ported (no credentials in dev anyway): with SMTP env
//! vars set the service reports mode `smtp-unavailable`; otherwise dry-run
//! mode appends to `messages.jsonl` exactly like the Python version.

use std::{
    collections::HashMap,
    sync::{Arc, Mutex, OnceLock},
    time::{Duration, Instant},
};

use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use chrono::{SecondsFormat, Utc};
use serde_json::{json, Value};
use tower_http::cors::{AllowOrigin, CorsLayer};

const SERVICE_NAME: &str = "py-service";
const SERVICE_VERSION: &str = "1.0.0";
const DEFAULT_USERNAME: &str = "WARRIORXR";

// thresholds from analytics.py
const STRENGTH_THRESHOLD: i64 = 85;
const DEVELOPING_THRESHOLD: i64 = 75;

// contact.py limits
const NAME_MAX: usize = 80;
const SUBJECT_MAX: usize = 140;
const MESSAGE_MIN: usize = 15;
const MESSAGE_MAX: usize = 4000;

const REPOS_URL: &str = "https://api.github.com/users/{username}/repos";
const CONTRIBUTIONS_URL: &str = "https://github-contributions-api.jogruber.de/v4/{username}";

// ── Settings (from environment, like config.py) ─────────────

struct Settings {
    profile_path: String,
    contact_store: String,
    allowed_origins: Vec<String>,
    github_token: Option<String>,
    github_cache_ttl: u64,
    smtp_host: Option<String>,
    contact_to: Option<String>,
    contact_from: Option<String>,
}

impl Settings {
    fn from_env() -> Self {
        let manifest = env!("CARGO_MANIFEST_DIR");
        let env = |name: &str| std::env::var(name).ok().filter(|v| !v.trim().is_empty());
        let default_origins = "http://localhost:5173,http://localhost:5199,http://localhost:8080,\
http://127.0.0.1:5173,http://127.0.0.1:5199,http://127.0.0.1:8080"
            .to_string();
        Settings {
            profile_path: env("PROFILE_PATH")
                .unwrap_or_else(|| format!("{manifest}/../../shared/profile.json")),
            contact_store: env("CONTACT_STORE")
                .unwrap_or_else(|| format!("{manifest}/../data/messages.jsonl")),
            allowed_origins: env("ALLOWED_ORIGINS")
                .unwrap_or(default_origins)
                .split(',')
                .map(|o| o.trim().to_string())
                .filter(|o| !o.is_empty())
                .collect(),
            github_token: env("GITHUB_TOKEN"),
            github_cache_ttl: env("GITHUB_CACHE_TTL")
                .and_then(|v| v.parse().ok())
                .unwrap_or(3600),
            smtp_host: env("SMTP_HOST"),
            contact_to: env("CONTACT_TO"),
            contact_from: env("CONTACT_FROM"),
        }
    }

    fn delivery_mode(&self) -> String {
        if self.smtp_host.is_some() && self.contact_to.is_some() && self.contact_from.is_some() {
            "smtp-unavailable".into() // SMTP port is not implemented in Rust
        } else {
            "dry-run".into()
        }
    }
}

fn now_iso() -> String {
    Utc::now().to_rfc3339_opts(SecondsFormat::Micros, true)
}

fn uuid_v4() -> String {
    let mut b = rand::random::<[u8; 16]>();
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    let hex: Vec<String> = b.iter().map(|x| format!("{x:02x}")).collect();
    format!(
        "{}-{}-{}-{}-{}",
        hex[0..4].join(""),
        hex[4..6].join(""),
        hex[6..8].join(""),
        hex[8..10].join(""),
        hex[10..16].join("")
    )
}

// ── Profile (profile.py) ────────────────────────────────────

fn profile_cache() -> &'static Mutex<HashMap<String, Value>> {
    static CACHE: OnceLock<Mutex<HashMap<String, Value>>> = OnceLock::new();
    CACHE.get_or_init(|| Mutex::new(HashMap::new()))
}

fn load_profile(path: &str) -> Result<Value, String> {
    if let Some(hit) = profile_cache().lock().unwrap().get(path) {
        return Ok(hit.clone());
    }
    let raw = std::fs::read_to_string(path)
        .map_err(|e| format!("cannot read profile at {path}: {e}"))?;
    let document: Value = serde_json::from_str(&raw)
        .map_err(|e| format!("invalid JSON in {path}: {e}"))?;
    if !document.is_object() {
        return Err("profile root must be an object".into());
    }
    for key in ["profile", "skills"] {
        if document.get(key).is_none() {
            return Err(format!("profile document is missing required key '{key}'"));
        }
    }
    profile_cache().lock().unwrap().insert(path.to_string(), document.clone());
    Ok(document)
}

// ── Analytics (analytics.py — pure functions) ───────────────

fn average(values: &[f64]) -> f64 {
    if values.is_empty() {
        0.0
    } else {
        ((values.iter().sum::<f64>() / values.len() as f64) * 10.0).round() / 10.0
    }
}

fn skill_payload(skill: &Value) -> Value {
    json!({
        "name": skill.get("name").cloned().unwrap_or(Value::Null),
        "proficiency": skill.get("proficiency").and_then(Value::as_i64).unwrap_or(0),
        "category": skill.get("category").cloned().unwrap_or(Value::Null),
        "icon": skill.get("icon").cloned().unwrap_or(Value::Null),
        "color": skill.get("color").cloned().unwrap_or(Value::Null),
        "years": skill.get("years").cloned().unwrap_or(Value::Null),
    })
}

fn summarize(document: &Value) -> Value {
    let skills: Vec<Value> = document
        .get("skills")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    let categories: Vec<Value> = document
        .get("skillCategories")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    let experience: Vec<Value> = document
        .get("experience")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    let education = document.get("education").cloned().unwrap_or(json!({}));
    let stats: Vec<Value> = document
        .get("stats")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();

    let real_categories: Vec<&Value> =
        categories.iter().filter(|c| c.get("id") != Some(&json!("all"))).collect();

    let mut by_category: Vec<Value> = real_categories
        .iter()
        .map(|category| {
            let cid = category["id"].as_str().unwrap_or("");
            let members: Vec<&Value> = skills
                .iter()
                .filter(|s| s.get("category").and_then(Value::as_str) == Some(cid))
                .collect();
            let profs: Vec<f64> = members
                .iter()
                .map(|s| s.get("proficiency").and_then(Value::as_f64).unwrap_or(0.0))
                .collect();
            json!({
                "id": cid,
                "label": category.get("label").cloned().unwrap_or(Value::Null),
                "color": category.get("color").cloned().unwrap_or(Value::Null),
                "count": members.len(),
                "averageProficiency": average(&profs),
                "share": if skills.is_empty() { 0.0 } else { ((members.len() as f64 / skills.len() as f64) * 1000.0).round() / 1000.0 },
            })
        })
        .collect();
    by_category.sort_by(|a, b| {
        b["count"]
            .as_i64()
            .unwrap_or(0)
            .cmp(&a["count"].as_i64().unwrap_or(0))
            .then_with(|| {
                a["id"].as_str().unwrap_or("").cmp(b["id"].as_str().unwrap_or(""))
            })
    });

    let mut ranked = skills.clone();
    ranked.sort_by(|a, b| {
        b.get("proficiency")
            .and_then(Value::as_i64)
            .unwrap_or(0)
            .cmp(&a.get("proficiency").and_then(Value::as_i64).unwrap_or(0))
            .then_with(|| {
                a.get("name")
                    .and_then(Value::as_str)
                    .unwrap_or("")
                    .cmp(b.get("name").and_then(Value::as_str).unwrap_or(""))
            })
    });

    let top_skills: Vec<Value> = ranked.iter().take(5).map(skill_payload).collect();
    let developing: Vec<String> = ranked
        .iter()
        .filter(|s| s.get("proficiency").and_then(Value::as_i64).unwrap_or(0) < DEVELOPING_THRESHOLD)
        .filter_map(|s| s.get("name").and_then(Value::as_str))
        .map(String::from)
        .collect();
    let strengths: Vec<Value> = ranked
        .iter()
        .filter(|s| s.get("proficiency").and_then(Value::as_i64).unwrap_or(0) >= STRENGTH_THRESHOLD)
        .map(skill_payload)
        .collect();

    let focus = by_category.first().and_then(|c| c["id"].as_str()).map(String::from);
    let mut covered: Vec<String> = skills
        .iter()
        .filter_map(|s| s.get("category").and_then(Value::as_str))
        .map(String::from)
        .collect();
    covered.sort();
    covered.dedup();

    let experience_highlights: usize = experience
        .iter()
        .map(|e| {
            e.get("description")
                .and_then(Value::as_array)
                .map(|a| a.len())
                .unwrap_or(0)
        })
        .sum();

    json!({
        "totals": {
            "skills": skills.len(),
            "categories": covered.len(),
            "declaredCategories": real_categories.len(),
            "experienceEntries": experience.len(),
            "experienceHighlights": experience_highlights,
            "coursework": education.get("coursework").and_then(Value::as_array).map(|a| a.len()).unwrap_or(0),
            "stats": stats.len(),
        },
        "averageProficiency": average(
            &skills.iter().map(|s| s.get("proficiency").and_then(Value::as_f64).unwrap_or(0.0)).collect::<Vec<_>>()
        ),
        "byCategory": by_category,
        "topSkills": top_skills,
        "strengths": strengths,
        "developing": developing,
        "focus": focus,
        "coverage": if real_categories.is_empty() { 0.0 } else {
            ((covered.len() as f64 / real_categories.len() as f64) * 1000.0).round() / 1000.0
        },
        "yearsTracked": skills.iter().map(|s| s.get("years").and_then(Value::as_i64).unwrap_or(0)).sum::<i64>(),
        "generatedAt": now_iso(),
    })
}

fn contribution_insights(days: &[Value]) -> Value {
    let mut ordered: Vec<&Value> = days
        .iter()
        .filter(|d| d.get("date").and_then(Value::as_str).is_some())
        .collect();
    ordered.sort_by_key(|d| d["date"].as_str().unwrap_or("").to_string());

    let counts: Vec<i64> = ordered
        .iter()
        .map(|d| d.get("count").and_then(Value::as_i64).unwrap_or(0))
        .collect();
    let total: i64 = counts.iter().sum();
    let active: Vec<i64> = counts.iter().cloned().filter(|c| *c > 0).collect();

    let mut longest = 0i64;
    let mut current = 0i64;
    for &c in &counts {
        if c > 0 {
            current += 1;
            longest = longest.max(current);
        } else {
            current = 0;
        }
    }
    let mut trailing = 0i64;
    for &c in counts.iter().rev() {
        if c > 0 {
            trailing += 1;
        } else {
            break;
        }
    }
    // max() in Python keeps the FIRST maximum — fold with strict `>`
    let best = ordered.iter().fold(None::<&&Value>, |acc, d| {
        let dc = d.get("count").and_then(Value::as_i64).unwrap_or(0);
        match acc {
            None => Some(d),
            Some(b) if dc > b.get("count").and_then(Value::as_i64).unwrap_or(0) => Some(d),
            other => other,
        }
    });

    json!({
        "total": total,
        "activeDays": active.len(),
        "trackedDays": ordered.len(),
        "longestStreak": longest,
        "currentStreak": trailing,
        "averagePerActiveDay": average(&active.iter().map(|c| *c as f64).collect::<Vec<_>>()),
        "peak": best.map(|d| json!({
            "date": d["date"],
            "count": d.get("count").and_then(Value::as_i64).unwrap_or(0),
        })),
        "consistency": if ordered.is_empty() { 0.0 } else {
            ((active.len() as f64 / ordered.len() as f64) * 1000.0).round() / 1000.0
        },
    })
}

fn language_mix(repos: &[Value]) -> Value {
    let mut counts: Vec<(String, i64)> = Vec::new();
    let mut stars = 0i64;
    let mut forks = 0i64;
    for repo in repos {
        stars += repo.get("stars").and_then(Value::as_i64).unwrap_or(0);
        forks += repo.get("forks").and_then(Value::as_i64).unwrap_or(0);
        let language = repo
            .get("language")
            .and_then(Value::as_str)
            .filter(|l| !l.is_empty())
            .unwrap_or("Other")
            .to_string();
        match counts.iter_mut().find(|(l, _)| *l == language) {
            Some((_, c)) => *c += 1,
            None => counts.push((language, 1)),
        }
    }
    counts.sort_by(|a, b| b.1.cmp(&a.1).then_with(|| a.0.cmp(&b.0)));
    let total: i64 = counts.iter().map(|(_, c)| *c).sum();
    let languages: Vec<Value> = counts
        .iter()
        .map(|(language, count)| {
            json!({
                "language": language,
                "count": count,
                "share": if total == 0 { 0.0 } else { ((*count as f64 / total as f64) * 1000.0).round() / 1000.0 },
            })
        })
        .collect();
    json!({
        "repos": repos.len(),
        "totalStars": stars,
        "totalForks": forks,
        "languages": languages,
    })
}

// ── GitHub client (github.py) ───────────────────────────────

struct AppState {
    http: reqwest::Client,
    cache: Mutex<HashMap<String, (Instant, Value)>>,
    cache_ttl: Duration,
    github_token: Option<String>,
}

fn github_headers(token: &Option<String>) -> Vec<(String, String)> {
    let mut headers = vec![
        ("Accept".to_string(), "application/vnd.github.v3+json".to_string()),
        ("User-Agent".to_string(), "tanish-jaswal-portfolio".to_string()),
    ];
    if let Some(token) = token {
        headers.push(("Authorization".to_string(), format!("Bearer {token}")));
    }
    headers
}

fn normalise_repo(raw: &Value) -> Value {
    json!({
        "id": raw.get("id").cloned().unwrap_or(Value::Null),
        "name": raw.get("name").cloned().unwrap_or(Value::Null),
        "fullName": raw.get("full_name").cloned().unwrap_or(Value::Null),
        "description": raw.get("description").and_then(Value::as_str).unwrap_or(""),
        "language": raw.get("language").cloned().unwrap_or(Value::Null),
        "stars": raw.get("stargazers_count").and_then(Value::as_i64).unwrap_or(0),
        "forks": raw.get("forks_count").and_then(Value::as_i64).unwrap_or(0),
        "url": raw.get("html_url").cloned().unwrap_or(Value::Null),
        "homepage": raw.get("homepage").cloned().unwrap_or(Value::Null),
        "topics": raw.get("topics").cloned().unwrap_or(json!([])),
        "updatedAt": raw.get("updated_at").cloned().unwrap_or(Value::Null),
    })
}

fn select_repos(repos: &[Value]) -> Vec<Value> {
    let mut kept: Vec<Value> = repos
        .iter()
        .filter(|r| !truthy(r.get("fork")) && !r.get("description").and_then(Value::as_str).unwrap_or("").trim().is_empty())
        .map(normalise_repo)
        .collect();
    kept.sort_by(|a, b| {
        b["stars"]
            .as_i64()
            .unwrap_or(0)
            .cmp(&a["stars"].as_i64().unwrap_or(0))
            .then_with(|| {
                a["updatedAt"]
                    .as_str()
                    .unwrap_or("")
                    .cmp(b["updatedAt"].as_str().unwrap_or(""))
            })
            .then_with(|| {
                a["name"].as_str().unwrap_or("").cmp(b["name"].as_str().unwrap_or(""))
            })
    });
    kept
}

fn truthy(v: Option<&Value>) -> bool {
    matches!(v, Some(Value::Bool(true)))
}

fn normalise_contributions(payload: &Value) -> Result<Vec<Value>, String> {
    let raw = payload
        .get("contributions")
        .and_then(Value::as_array)
        .ok_or("contributions payload did not contain a contributions array")?;
    let mut days: Vec<Value> = raw
        .iter()
        .filter(|e| e.get("date").and_then(Value::as_str).is_some())
        .map(|e| {
            json!({
                "date": e["date"],
                "count": e.get("count").and_then(Value::as_i64).unwrap_or(0),
            })
        })
        .collect();
    days.sort_by_key(|d| d["date"].as_str().unwrap_or("").to_string());
    Ok(days)
}

async fn cached_fetch(
    state: &AppState,
    key: &str,
    url: &str,
    headers: &[(String, String)],
) -> Result<Value, String> {
    if let Some((at, value)) = state.cache.lock().unwrap().get(key) {
        if at.elapsed() < state.cache_ttl {
            return Ok(value.clone());
        }
    }
    let mut req = state.http.get(url).timeout(Duration::from_secs(10));
    for (name, value) in headers {
        req = req.header(name, value);
    }
    let resp = req.send().await.map_err(|e| e.to_string())?;
    if resp.status().as_u16() >= 400 {
        return Err(format!("upstream {url} returned HTTP {}", resp.status()));
    }
    let payload: Value = resp.json().await.map_err(|e| e.to_string())?;
    state
        .cache
        .lock()
        .unwrap()
        .insert(key.to_string(), (Instant::now(), payload.clone()));
    Ok(payload)
}

async fn github_repos(state: &AppState, username: &str) -> Result<Vec<Value>, String> {
    let key = format!("repos:{}", username.to_lowercase());
    let url = REPOS_URL.replace("{username}", username) + "?sort=updated&per_page=100&type=public";
    let payload = cached_fetch(state, &key, &url, &github_headers(&state.github_token)).await?;
    payload
        .as_array()
        .ok_or_else(|| "repositories payload was not a list".to_string())
        .map(|list| select_repos(list))
}

async fn github_contributions(state: &AppState, username: &str) -> Result<Vec<Value>, String> {
    let key = format!("contributions:{}", username.to_lowercase());
    let url = CONTRIBUTIONS_URL.replace("{username}", username) + "?y=last";
    let payload = cached_fetch(
        state,
        &key,
        &url,
        &[("Accept".to_string(), "application/json".to_string())],
    )
    .await?;
    normalise_contributions(&payload)
}

// ── Contact (contact.py) ────────────────────────────────────

fn looks_like_email(s: &str) -> bool {
    // ^[^\s@]+@[^\s@]+\.[^\s@]+$
    let parts: Vec<&str> = s.split('@').collect();
    if parts.len() != 2 {
        return false;
    }
    let (local, domain) = (parts[0], parts[1]);
    !local.is_empty() && !domain.is_empty() && domain.contains('.') && !s.contains(char::is_whitespace)
}

fn has_control_chars(s: &str) -> bool {
    s.contains(['\r', '\n', '\0'])
}

fn validate_contact(body: &Value) -> Result<(String, String, String, String), String> {
    let get_str = |k: &str| body.get(k).and_then(Value::as_str).unwrap_or("").trim().to_string();
    let name = get_str("name");
    if name.is_empty() || name.chars().count() > NAME_MAX {
        return Err(format!("name must be 1-{NAME_MAX} characters"));
    }
    let email = get_str("email");
    if email.chars().count() < 3 || email.chars().count() > 254 || !looks_like_email(&email) {
        return Err("invalid email format".into());
    }
    let subject = get_str("subject");
    if subject.is_empty() || subject.chars().count() > SUBJECT_MAX {
        return Err(format!("subject must be 1-{SUBJECT_MAX} characters"));
    }
    let message = get_str("message");
    if message.chars().count() < MESSAGE_MIN {
        return Err(format!("message must be at least {MESSAGE_MIN} characters"));
    }
    if message.chars().count() > MESSAGE_MAX {
        return Err(format!("message must be at most {MESSAGE_MAX} characters"));
    }
    for (field, value) in [("name", &name), ("email", &email), ("subject", &subject)] {
        if has_control_chars(value) {
            return Err(format!("{field} must be a single line"));
        }
    }
    Ok((name, email, subject, message))
}

fn deliver_contact(state: &AppState, name: &str, email: &str, subject: &str, message: &str) -> Result<Value, String> {
    let settings = Settings::from_env();
    let record_id = uuid_v4();
    let received_at = now_iso();

    if settings.delivery_mode() != "dry-run" {
        return Err("SMTP delivery is not implemented in the Rust port; unset SMTP_* to use dry-run mode".into());
    }

    let record = json!({
        "id": record_id,
        "receivedAt": received_at,
        "mode": "dry-run",
        "name": name,
        "email": email,
        "subject": subject,
        "message": message,
    });
    let store = std::path::PathBuf::from(&settings.contact_store);
    if let Some(parent) = store.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    use std::io::Write;
    let mut handle = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&store)
        .map_err(|e| format!("could not persist message: {e}"))?;
    writeln!(handle, "{record}").map_err(|e| format!("could not persist message: {e}"))?;

    Ok(json!({
        "id": record_id,
        "receivedAt": received_at,
        "mode": "dry-run",
        "status": "queued",
    }))
}

// ── HTTP handlers ───────────────────────────────────────────

fn err_response(status: StatusCode, message: &str) -> Response {
    (status, Json(json!({ "detail": message }))).into_response()
}

async fn health(State(state): State<Arc<AppState>>) -> Json<Value> {
    let settings = Settings::from_env();
    let _ = state; // kept for symmetry with the other handlers
    Json(json!({
        "status": "ok",
        "service": SERVICE_NAME,
        "version": SERVICE_VERSION,
        "deliveryMode": settings.delivery_mode(),
        "profilePath": settings.profile_path,
        "time": now_iso(),
    }))
}

async fn profile_document() -> Response {
    let settings = Settings::from_env();
    match load_profile(&settings.profile_path) {
        Ok(doc) => Json(doc).into_response(),
        Err(e) => err_response(StatusCode::INTERNAL_SERVER_ERROR, &e),
    }
}

async fn profile_personal() -> Response {
    let settings = Settings::from_env();
    match load_profile(&settings.profile_path) {
        Ok(doc) => Json(doc["profile"].clone()).into_response(),
        Err(e) => err_response(StatusCode::INTERNAL_SERVER_ERROR, &e),
    }
}

async fn analytics_summary() -> Response {
    let settings = Settings::from_env();
    match load_profile(&settings.profile_path) {
        Ok(doc) => Json(summarize(&doc)).into_response(),
        Err(e) => err_response(StatusCode::INTERNAL_SERVER_ERROR, &e),
    }
}

fn username_from(params: &HashMap<String, String>) -> String {
    params
        .get("username")
        .map(|u| u.chars().take(39).collect())
        .filter(|u: &String| !u.is_empty())
        .unwrap_or_else(|| DEFAULT_USERNAME.to_string())
}

async fn github_repos_handler(
    State(state): State<Arc<AppState>>,
    Query(params): Query<HashMap<String, String>>,
) -> Response {
    let username = username_from(&params);
    match github_repos(&state, &username).await {
        Ok(repos) => Json(json!({
            "username": username,
            "count": repos.len(),
            "repos": repos,
            "fetchedAt": now_iso(),
        }))
        .into_response(),
        Err(e) => err_response(StatusCode::BAD_GATEWAY, &e),
    }
}

async fn github_contributions_handler(
    State(state): State<Arc<AppState>>,
    Query(params): Query<HashMap<String, String>>,
) -> Response {
    let username = username_from(&params);
    match github_contributions(&state, &username).await {
        Ok(days) => {
            let total: i64 = days
                .iter()
                .map(|d| d.get("count").and_then(Value::as_i64).unwrap_or(0))
                .sum();
            Json(json!({
                "username": username,
                "total": total,
                "days": days,
                "fetchedAt": now_iso(),
            }))
            .into_response()
        }
        Err(e) => err_response(StatusCode::BAD_GATEWAY, &e),
    }
}

async fn github_insights_handler(
    State(state): State<Arc<AppState>>,
    Query(params): Query<HashMap<String, String>>,
) -> Response {
    let username = username_from(&params);
    let repos = github_repos(&state, &username).await;
    let days = github_contributions(&state, &username).await;
    match (repos, days) {
        (Ok(repos), Ok(days)) => Json(json!({
            "username": username,
            "languageMix": language_mix(&repos),
            "contributions": contribution_insights(&days),
            "topRepos": repos.iter().take(5).collect::<Vec<_>>(),
        }))
        .into_response(),
        (Err(e), _) | (_, Err(e)) => err_response(StatusCode::BAD_GATEWAY, &e),
    }
}

async fn contact_handler(
    State(state): State<Arc<AppState>>,
    body: String,
) -> Response {
    let parsed: Value = serde_json::from_str(&body).unwrap_or(Value::Null);
    match validate_contact(&parsed)
        .map_err(|e| (StatusCode::UNPROCESSABLE_ENTITY, e))
        .and_then(|(name, email, subject, message)| {
            deliver_contact(&state, &name, &email, &subject, &message)
                .map_err(|e| (StatusCode::BAD_GATEWAY, e))
        }) {
        Ok(result) => (StatusCode::ACCEPTED, Json(result)).into_response(),
        Err((status, msg)) => err_response(status, &msg),
    }
}

// ── Server ──────────────────────────────────────────────────

#[tokio::main]
async fn main() {
    let _ = dotenvy::dotenv();

    let settings = Settings::from_env();
    let origins: Vec<axum::http::HeaderValue> = settings
        .allowed_origins
        .iter()
        .filter_map(|o| o.parse().ok())
        .collect();

    let state = Arc::new(AppState {
        http: reqwest::Client::new(),
        cache: Mutex::new(HashMap::new()),
        cache_ttl: Duration::from_secs(settings.github_cache_ttl),
        github_token: settings.github_token.clone(),
    });

    let app = Router::new()
        .route("/health", get(health))
        .route("/profile", get(profile_document))
        .route("/profile/personal", get(profile_personal))
        .route("/analytics/summary", get(analytics_summary))
        .route("/github/repos", get(github_repos_handler))
        .route("/github/contributions", get(github_contributions_handler))
        .route("/github/insights", get(github_insights_handler))
        .route("/contact", post(contact_handler))
        .layer(
            CorsLayer::new()
                .allow_origin(AllowOrigin::list(origins))
                .allow_methods([
                    axum::http::Method::GET,
                    axum::http::Method::POST,
                    axum::http::Method::OPTIONS,
                ]),
        )
        .with_state(state);

    let port: u16 = std::env::var("PORT").ok().and_then(|p| p.parse().ok()).unwrap_or(8000);
    println!("py-service-rs listening on http://127.0.0.1:{port} (mode: {})", Settings::from_env().delivery_mode());
    let listener = tokio::net::TcpListener::bind(("0.0.0.0", port))
        .await
        .expect("failed to bind port");
    axum::serve(listener, app).await.expect("server error");
}

#[cfg(test)]
mod tests {
    use super::*;

    fn doc() -> Value {
        serde_json::json!({
            "profile": {"name": "Test"},
            "skills": [
                {"name": "Rust", "proficiency": 90, "category": "systems", "years": 2},
                {"name": "Python", "proficiency": 88, "category": "systems", "years": 3},
                {"name": "React", "proficiency": 70, "category": "web", "years": 1},
            ],
            "skillCategories": [
                {"id": "all", "label": "All"},
                {"id": "systems", "label": "Systems", "color": "#f00"},
                {"id": "web", "label": "Web", "color": "#0f0"},
            ],
            "experience": [{"description": ["a", "b"]}],
            "education": {"coursework": ["x", "y", "z"]},
            "stats": [{}],
        })
    }

    #[test]
    fn summarize_matches_python_semantics() {
        let s = summarize(&doc());
        assert_eq!(s["totals"]["skills"], 3);
        assert_eq!(s["totals"]["declaredCategories"], 2);
        assert_eq!(s["totals"]["experienceHighlights"], 2);
        assert_eq!(s["totals"]["coursework"], 3);
        let expected_avg: f64 = (90.0 + 88.0 + 70.0) / 3.0;
        assert_eq!(s["averageProficiency"], json!((expected_avg * 10.0).round() / 10.0));
        // byCategory sorted by count desc → systems (2) first
        assert_eq!(s["byCategory"][0]["id"], "systems");
        assert_eq!(s["byCategory"][0]["count"], 2);
        assert_eq!(s["topSkills"][0]["name"], "Rust");
        assert_eq!(s["developing"], json!(["React"]));
        assert_eq!(s["focus"], "systems");
    }

    #[test]
    fn contribution_insights_streaks() {
        let days = serde_json::json!([
            {"date": "2026-01-01", "count": 1},
            {"date": "2026-01-02", "count": 3},
            {"date": "2026-01-03", "count": 0},
            {"date": "2026-01-04", "count": 2},
            {"date": "2026-01-05", "count": 4},
        ]);
        let c = contribution_insights(days.as_array().unwrap());
        assert_eq!(c["total"], 10);
        assert_eq!(c["activeDays"], 4);
        assert_eq!(c["longestStreak"], 2);
        assert_eq!(c["currentStreak"], 2);
        assert_eq!(c["peak"]["date"], "2026-01-05");
        assert_eq!(c["consistency"], 0.8);
    }

    #[test]
    fn language_mix_counts() {
        let repos = serde_json::json!([
            {"stars": 5, "forks": 1, "language": "Rust"},
            {"stars": 2, "forks": 0, "language": "Rust"},
            {"stars": 1, "forks": 0, "language": null},
        ]);
        let m = language_mix(repos.as_array().unwrap());
        assert_eq!(m["totalStars"], 8);
        assert_eq!(m["languages"][0]["language"], "Rust");
        assert_eq!(m["languages"][0]["share"], 0.667);
        assert_eq!(m["languages"][1]["language"], "Other");
    }

    #[test]
    fn contact_validation() {
        let ok = serde_json::json!({
            "name": "Sir", "email": "a@b.co", "subject": "Hi", "message": "This is a long enough message."
        });
        assert!(validate_contact(&ok).is_ok());
        let bad_email = serde_json::json!({"name": "A", "email": "nope", "subject": "s", "message": "long enough message here"});
        assert!(validate_contact(&bad_email).is_err());
        let short_msg = serde_json::json!({"name": "A", "email": "a@b.co", "subject": "s", "message": "short"});
        assert!(validate_contact(&short_msg).is_err());
        let injected = serde_json::json!({"name": "A\nB", "email": "a@b.co", "subject": "s", "message": "long enough message here"});
        assert!(validate_contact(&injected).is_err());
    }
}
