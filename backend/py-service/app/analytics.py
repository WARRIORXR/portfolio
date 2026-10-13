"""Resume and skills analytics.

All functions here are pure: they take the shared profile document and return
plain JSON-serialisable structures. That keeps the analytics unit-testable
without a running server and lets the Rust gateway embed the same numbers.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Iterable

# A skill at or above this proficiency is considered a strength.
STRENGTH_THRESHOLD = 85
# Below this value the skill is still developing.
DEVELOPING_THRESHOLD = 75


def _average(values: Iterable[float]) -> float:
    items = [float(v) for v in values]
    if not items:
        return 0.0
    return round(sum(items) / len(items), 1)


def _skill_payload(skill: dict[str, Any]) -> dict[str, Any]:
    return {
        "name": skill.get("name"),
        "proficiency": int(skill.get("proficiency", 0)),
        "category": skill.get("category"),
        "icon": skill.get("icon"),
        "color": skill.get("color"),
        "years": skill.get("years"),
    }


def summarize(document: dict[str, Any]) -> dict[str, Any]:
    """Aggregate the profile document into analytics for the dashboard."""
    skills: list[dict[str, Any]] = list(document.get("skills") or [])
    categories: list[dict[str, Any]] = list(document.get("skillCategories") or [])
    experience: list[dict[str, Any]] = list(document.get("experience") or [])
    education: dict[str, Any] = dict(document.get("education") or {})
    stats: list[dict[str, Any]] = list(document.get("stats") or [])

    real_categories = [c for c in categories if c.get("id") != "all"]

    by_category: list[dict[str, Any]] = []
    for category in real_categories:
        cid = category.get("id")
        members = [s for s in skills if s.get("category") == cid]
        by_category.append(
            {
                "id": cid,
                "label": category.get("label"),
                "color": category.get("color"),
                "count": len(members),
                "averageProficiency": _average(s.get("proficiency", 0) for s in members),
                "share": round(len(members) / len(skills), 3) if skills else 0.0,
            }
        )
    by_category.sort(key=lambda c: (-c["count"], str(c["id"])))

    ranked = sorted(skills, key=lambda s: (-int(s.get("proficiency", 0)), str(s.get("name"))))
    top_skills = [_skill_payload(s) for s in ranked[:5]]
    developing = [
        _skill_payload(s) for s in ranked if int(s.get("proficiency", 0)) < DEVELOPING_THRESHOLD
    ]
    strengths = [s for s in ranked if int(s.get("proficiency", 0)) >= STRENGTH_THRESHOLD]

    focus = by_category[0]["id"] if by_category else None
    covered = {s.get("category") for s in skills if s.get("category")}

    return {
        "totals": {
            "skills": len(skills),
            "categories": len(covered),
            "declaredCategories": len(real_categories),
            "experienceEntries": len(experience),
            "experienceHighlights": sum(len(e.get("description") or []) for e in experience),
            "coursework": len(education.get("coursework") or []),
            "stats": len(stats),
        },
        "averageProficiency": _average(s.get("proficiency", 0) for s in skills),
        "byCategory": by_category,
        "topSkills": top_skills,
        "strengths": [_skill_payload(s) for s in strengths],
        "developing": [s["name"] for s in developing],
        "focus": focus,
        "coverage": round(len(covered) / len(real_categories), 3) if real_categories else 0.0,
        "yearsTracked": sum(int(s.get("years") or 0) for s in skills),
        "generatedAt": datetime.now(timezone.utc).isoformat(),
    }


def contribution_insights(days: list[dict[str, Any]]) -> dict[str, Any]:
    """Derive streak/consistency metrics from a contribution calendar.

    ``days`` is a chronological list of ``{"date": "YYYY-MM-DD", "count": int}``.
    """
    ordered = sorted(
        (d for d in days if isinstance(d.get("date"), str)),
        key=lambda d: d["date"],
    )
    counts = [int(d.get("count") or 0) for d in ordered]
    total = sum(counts)
    active = [c for c in counts if c > 0]

    longest = current = 0
    for count in counts:
        if count > 0:
            current += 1
            longest = max(longest, current)
        else:
            current = 0

    trailing = 0
    for count in reversed(counts):
        if count > 0:
            trailing += 1
        else:
            break

    best = max(ordered, key=lambda d: int(d.get("count") or 0), default=None)

    return {
        "total": total,
        "activeDays": len(active),
        "trackedDays": len(ordered),
        "longestStreak": longest,
        "currentStreak": trailing,
        "averagePerActiveDay": _average(active),
        "peak": {"date": best.get("date"), "count": int(best.get("count") or 0)} if best else None,
        "consistency": round(len(active) / len(ordered), 3) if ordered else 0.0,
    }


def language_mix(repos: list[dict[str, Any]]) -> dict[str, Any]:
    """Summarise a repo list by primary language, stars and forks."""
    counts: dict[str, int] = {}
    stars = forks = 0
    for repo in repos:
        stars += int(repo.get("stars") or 0)
        forks += int(repo.get("forks") or 0)
        language = repo.get("language") or "Other"
        counts[language] = counts.get(language, 0) + 1

    total = sum(counts.values())
    languages = [
        {
            "language": language,
            "count": count,
            "share": round(count / total, 3) if total else 0.0,
        }
        for language, count in sorted(counts.items(), key=lambda item: (-item[1], item[0]))
    ]

    return {
        "repos": len(repos),
        "totalStars": stars,
        "totalForks": forks,
        "languages": languages,
    }
