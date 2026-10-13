// ============================================================
// Tanish Jaswal — Personal Info (Data Analyst resume)
// ============================================================
//
// The canonical data now lives in `shared/profile.json`, which is the single
// source of truth shared by this app, the Rust API (`backend/rust-api`) and the
// Python service (`backend/py-service`). Edit the JSON, never this file.

import profile from '../../shared/profile.json'

export const personalInfo = profile.profile
export const education = profile.education
export const experience = profile.experience
export const stats = profile.stats
