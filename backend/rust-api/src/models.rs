//! Serde models for the shared profile document and the public API contract.
//!
//! The profile JSON is embedded into the binary with [`PROFILE_JSON`], so a
//! mismatch between the Rust types and `shared/profile.json` surfaces as a
//! startup failure rather than a broken response.

use serde::{Deserialize, Serialize};

/// The shared profile document, compiled into the binary.
pub const PROFILE_JSON: &str = include_str!("../../../shared/profile.json");

/// Personal details block.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PersonalInfo {
    pub name: String,
    pub title: String,
    pub taglines: Vec<String>,
    pub bio: String,
    pub email: String,
    pub phone: String,
    pub location: String,
    pub github: String,
    pub github_username: String,
    pub linkedin: String,
    pub resume: String,
}

/// Education block.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Education {
    pub degree: String,
    pub field: String,
    pub institution: String,
    pub location: String,
    pub expected_graduation: String,
    pub coursework: Vec<String>,
}

/// A single work-experience entry.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Experience {
    pub role: String,
    pub company: String,
    pub location: String,
    pub period: String,
    pub description: Vec<String>,
    #[serde(rename = "type")]
    pub kind: String,
}

/// A headline statistic.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Stat {
    pub label: String,
    pub value: i64,
    pub suffix: String,
}

/// Skill grouping.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillCategory {
    pub id: String,
    pub label: String,
    pub color: String,
}

/// A single skill.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Skill {
    pub name: String,
    pub proficiency: u32,
    pub category: String,
    pub icon: String,
    pub color: String,
    pub description: String,
    pub years: u32,
}

/// The whole shared profile document.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProfileDocument {
    pub profile: PersonalInfo,
    pub education: Education,
    pub experience: Vec<Experience>,
    pub stats: Vec<Stat>,
    pub skill_categories: Vec<SkillCategory>,
    pub skills: Vec<Skill>,
}

impl ProfileDocument {
    /// Parse the embedded profile document.
    pub fn embedded() -> Result<Self, serde_json::Error> {
        serde_json::from_str(PROFILE_JSON)
    }
}

/// A public repository, normalised for the frontend.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Repo {
    pub id: u64,
    pub name: String,
    pub full_name: String,
    pub description: String,
    pub language: Option<String>,
    pub stars: u64,
    pub forks: u64,
    pub url: String,
    pub homepage: Option<String>,
    pub topics: Vec<String>,
    pub updated_at: String,
}

/// One day of the contribution calendar.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ContributionDay {
    pub date: String,
    pub count: i64,
}

/// Repository payload as returned by `api.github.com`.
#[derive(Debug, Clone, Deserialize)]
pub struct GithubRepoRaw {
    pub id: u64,
    pub name: String,
    pub full_name: String,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub language: Option<String>,
    #[serde(default)]
    pub stargazers_count: u64,
    #[serde(default)]
    pub forks_count: u64,
    #[serde(default)]
    pub html_url: String,
    #[serde(default)]
    pub homepage: Option<String>,
    #[serde(default)]
    pub topics: Option<Vec<String>>,
    #[serde(default)]
    pub updated_at: Option<String>,
    #[serde(default)]
    pub fork: Option<bool>,
}

/// Contribution payload as returned by the public contributions mirror.
#[derive(Debug, Clone, Deserialize)]
pub struct ContributionResponse {
    #[serde(default)]
    pub contributions: Vec<ContributionEntry>,
}

/// A raw contribution entry.
#[derive(Debug, Clone, Deserialize)]
pub struct ContributionEntry {
    pub date: String,
    #[serde(default)]
    pub count: Option<i64>,
}

/// Contact-form submission.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContactRequest {
    pub name: String,
    pub email: String,
    pub subject: String,
    pub message: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn embedded_profile_matches_the_rust_types() {
        let document = ProfileDocument::embedded().expect("embedded profile must parse");
        assert_eq!(document.profile.github_username, "WARRIORXR");
        assert_eq!(document.skills.len(), 15);
        assert_eq!(document.skill_categories.len(), 4);
        assert_eq!(document.stats.len(), 4);
        assert!(!document.experience.is_empty());
    }

    #[test]
    fn repo_serialises_as_camel_case() {
        let repo = Repo {
            id: 7,
            name: "movie-reviewer".to_string(),
            full_name: "WARRIORXR/movie-reviewer".to_string(),
            description: "Movies".to_string(),
            language: Some("Python".to_string()),
            stars: 3,
            forks: 1,
            url: "https://github.com/WARRIORXR/movie-reviewer".to_string(),
            homepage: None,
            topics: vec!["python".to_string()],
            updated_at: "2026-09-01T00:00:00Z".to_string(),
        };

        let json = serde_json::to_value(&repo).expect("repo must serialise");
        assert_eq!(json["fullName"], "WARRIORXR/movie-reviewer");
        assert_eq!(json["updatedAt"], "2026-09-01T00:00:00Z");
        assert!(json.get("full_name").is_none());
    }
}
