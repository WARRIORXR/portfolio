import { useEffect, useState } from 'react'
import { apiGet } from '../lib/api'

/**
 * Fetches GitHub contribution data (last year) for a username.
 *
 * Preferred path: the Rust gateway (`GET /api/github/contributions`), which
 * caches the upstream response. Fallback: the public jogruber mirror, called
 * straight from the browser. Returns undefined while loading or on failure so
 * ContributionSkyline falls back to its seeded generator instead of rendering
 * empty.
 */
export default function useGithubContributions(username = 'WARRIORXR') {
  const [data, setData] = useState(undefined)

  useEffect(() => {
    let cancelled = false

    const normalize = (entries) =>
      entries
        .filter((d) => d && typeof d.date === 'string')
        .map((d) => ({ date: d.date, count: Number(d.count) || 0 }))

    const fromApi = async () => {
      const payload = await apiGet(`/github/contributions?username=${encodeURIComponent(username)}`)
      if (!payload || !Array.isArray(payload.days)) return null
      const days = normalize(payload.days)
      return days.length ? days : null
    }

    const fromUpstream = async () => {
      const res = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${username}?y=last`
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (!Array.isArray(json.contributions)) return null
      const days = normalize(json.contributions)
      return days.length ? days : null
    }

    const load = async () => {
      try {
        const days = (await fromApi()) ?? (await fromUpstream())
        if (!cancelled && days) setData(days)
      } catch {
        // Silent — the skyline renders its generated sample year instead.
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [username])

  return data
}
