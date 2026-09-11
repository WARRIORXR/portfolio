// GitHub API wrapper with LocalStorage caching (1-hour TTL)

const CACHE_KEY = 'github_repos_cache'
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export async function fetchGithubRepos(username) {
  // Check cache first
  const cached = getCachedRepos()
  if (cached) return cached

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

  // Filter out forks and sort by stars then updated
  const filtered = repos
    .filter((r) => !r.fork && r.description)
    .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.updated_at) - new Date(a.updated_at))

  cacheRepos(filtered)
  return filtered
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
