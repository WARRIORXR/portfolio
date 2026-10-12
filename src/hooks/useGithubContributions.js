import { useEffect, useState } from 'react'

/**
 * Fetches real GitHub contribution data (last year) for a username via the
 * public jogruber mirror of the contributions graph. Returns undefined while
 * loading or on failure, so ContributionSkyline falls back to its seeded
 * generator instead of rendering empty.
 */
export default function useGithubContributions(username = 'WARRIORXR') {
  const [data, setData] = useState(undefined)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (cancelled || !Array.isArray(json.contributions)) return
        const days = json.contributions
          .filter((d) => d && typeof d.date === 'string')
          .map((d) => ({ date: d.date, count: Number(d.count) || 0 }))
        if (days.length) setData(days)
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
