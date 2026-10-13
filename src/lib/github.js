// GitHub data for the portfolio.
//
// Preferred path: the Rust gateway (`GET /api/github/repos`), which fetches,
// normalises and caches upstream data. Fallback: the browser talks to
// api.github.com directly so the static build keeps working without a backend.
// Both paths return the same GitHub REST-shaped objects the UI already uses.

import { apiGet } from './api'

const CACHE_KEY = 'github_repos_cache'
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

/** Map a gateway repository to the GitHub REST shape the components expect. */
export function fromApiRepo(repo) {
  return {
    id: repo.id,
    name: repo.name,
    full_name: repo.fullName,
    description: repo.description || '',
    language: repo.language ?? null,
    stargazers_count: repo.stars ?? 0,
    forks_count: repo.forks ?? 0,
    html_url: repo.url,
    homepage: repo.homepage ?? null,
    topics: repo.topics ?? [],
    updated_at: repo.updatedAt,
  }
}

async function fetchReposViaApi(username) {
  const payload = await apiGet(`/github/repos?username=${encodeURIComponent(username)}`)
  if (!payload || !Array.isArray(payload.repos)) return null
  return payload.repos.map(fromApiRepo)
}

async function fetchReposFromGithub(username) {
  const response = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=50&type=public`,
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'portfolio-app',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
  }

  const repos = await response.json()

  // Filter out forks and undocumented repos, then rank by stars and recency.
  return repos
    .filter((r) => !r.fork && r.description)
    .sort(
      (a, b) =>
        b.stargazers_count - a.stargazers_count ||
        new Date(b.updated_at) - new Date(a.updated_at)
    )
}

export async function fetchGithubRepos(username) {
  const cached = getCachedRepos()
  if (cached) return cached

  const viaApi = await fetchReposViaApi(username)
  const repos = viaApi ?? (await fetchReposFromGithub(username))

  cacheRepos(repos)
  return repos
}

function getCachedRepos() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return data
  } catch {
    return null
  }
}

function cacheRepos(repos) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: repos, timestamp: Date.now() }))
  } catch {
    // storage quota exceeded — ignore
  }
}

export function clearRepoCache() {
  localStorage.removeItem(CACHE_KEY)
}

export function getLanguageColor(language) {
  const colors = {
    Python: '#3572A5',
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Jupyter: '#DA5B0B',
    Shell: '#89e051',
    C: '#555555',
    'C++': '#f34b7d',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#FA7343',
    Kotlin: '#F18E33',
    default: '#8b5cf6',
  }
  return colors[language] || colors.default
}
