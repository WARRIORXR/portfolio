//! Profile endpoints. All values come from the embedded `shared/profile.json`,
//! so these handlers never touch the network.

use axum::Json;
use axum::extract::State;
use serde_json::{Value, json};

use crate::error::ApiError;
use crate::models::{PersonalInfo, ProfileDocument, Skill, SkillCategory, Stat};
use crate::state::AppState;

/// The full shared profile document.
pub async fn document(State(state): State<AppState>) -> Result<Json<ProfileDocument>, ApiError> {
    Ok(Json((*state.profile).clone()))
}

/// Just the personal-info block.
pub async fn personal(State(state): State<AppState>) -> Json<PersonalInfo> {
    Json(state.profile.profile.clone())
}

/// Skills and their categories.
pub async fn skills(State(state): State<AppState>) -> Json<Value> {
    let categories: &Vec<SkillCategory> = &state.profile.skill_categories;
    let skills: &Vec<Skill> = &state.profile.skills;
    Json(json!({
        "skillCategories": categories,
        "skills": skills,
    }))
}

/// Headline counts derived from the profile, plus the declared stats.
pub async fn stats(State(state): State<AppState>) -> Json<Value> {
    let categories: Vec<&SkillCategory> = state
        .profile
        .skill_categories
        .iter()
        .filter(|category| category.id != "all")
        .collect();

    let covered: Vec<&str> = categories
        .iter()
        .map(|category| category.id.as_str())
        .filter(|id| {
            state
                .profile
                .skills
                .iter()
                .any(|skill| skill.category == *id)
        })
        .collect();

    let declared: &Vec<Stat> = &state.profile.stats;

    Json(json!({
        "counts": {
            "skills": state.profile.skills.len(),
            "categories": categories.len(),
            "categoriesCovered": covered.len(),
            "experienceEntries": state.profile.experience.len(),
            "coursework": state.profile.education.coursework.len(),
        },
        "declared": declared,
        "institution": state.profile.education.institution,
    }))
}
