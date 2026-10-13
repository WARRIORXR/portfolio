"""Analytics unit tests — pure functions, no server required."""

from __future__ import annotations

from app.analytics import contribution_insights, language_mix, summarize
from app.profile import load_profile


def test_summarize_real_profile() -> None:
    document = load_profile()
    summary = summarize(document)

    assert summary["totals"]["skills"] == len(document["skills"]) == 15
    assert summary["totals"]["categories"] == 3
    assert summary["totals"]["declaredCategories"] == 3
    assert summary["totals"]["coursework"] == 6
    assert summary["totals"]["experienceEntries"] == 1

    assert 60 <= summary["averageProficiency"] <= 100
    assert summary["focus"] == "python"
    assert len(summary["topSkills"]) == 5
    assert summary["topSkills"][0]["name"] == "Python"
    assert summary["coverage"] == 1.0

    shares = [category["share"] for category in summary["byCategory"]]
    assert abs(sum(shares) - 1.0) < 0.01
    assert summary["generatedAt"]


def test_summarize_handles_empty_document() -> None:
    summary = summarize({"skills": [], "skillCategories": [], "experience": []})

    assert summary["totals"]["skills"] == 0
    assert summary["averageProficiency"] == 0.0
    assert summary["topSkills"] == []
    assert summary["focus"] is None


def test_contribution_insights_streaks() -> None:
    days = [
        {"date": "2026-01-01", "count": 0},
        {"date": "2026-01-02", "count": 2},
        {"date": "2026-01-03", "count": 1},
        {"date": "2026-01-04", "count": 5},
        {"date": "2026-01-05", "count": 0},
        {"date": "2026-01-06", "count": 3},
    ]
    insights = contribution_insights(days)

    assert insights["total"] == 11
    assert insights["activeDays"] == 4
    assert insights["longestStreak"] == 3
    assert insights["currentStreak"] == 1
    assert insights["peak"] == {"date": "2026-01-04", "count": 5}
    assert insights["consistency"] == round(4 / 6, 3)


def test_contribution_insights_empty() -> None:
    insights = contribution_insights([])

    assert insights["total"] == 0
    assert insights["longestStreak"] == 0
    assert insights["peak"] is None


def test_language_mix_shares() -> None:
    mix = language_mix(
        [
            {"language": "Python", "stars": 3, "forks": 1},
            {"language": "Python", "stars": 2, "forks": 0},
            {"language": None, "stars": 0, "forks": 0},
        ]
    )

    assert mix["repos"] == 3
    assert mix["totalStars"] == 5
    assert mix["totalForks"] == 1
    assert mix["languages"][0]["language"] == "Python"
    assert mix["languages"][0]["count"] == 2
    assert abs(sum(item["share"] for item in mix["languages"]) - 1.0) < 0.01
