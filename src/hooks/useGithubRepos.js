import { useState, useEffect } from 'react'
import { fetchGithubRepos } from '../lib/github'

const FALLBACK_REPOS = [
  {
    id: 1,
    name: 'movie-recommendation-system',
    description: 'Movie recommendation & information web app built with Python and Flask. Features ML-based recommendations.',
    language: 'Python',
    stargazers_count: 0,
    forks_count: 0,
    html_url: 'https://github.com/WARRIORXR',
    homepage: null,
    topics: ['python', 'flask', 'machine-learning', 'recommendation-system'],
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'ml-practice-portfolio',
    description: 'Comprehensive ML practice using Scikit-learn — KNN, Decision Trees, Random Forest, SVM, clustering.',
    language: 'Jupyter Notebook',
    stargazers_count: 0,
    forks_count: 0,
    html_url: 'https://github.com/WARRIORXR',
    homepage: null,
    topics: ['python', 'machine-learning', 'scikit-learn', 'data-science'],
    updated_at: new Date().toISOString(),
  },
]

export function useGithubRepos() {
  const username = import.meta.env.VITE_GITHUB_USERNAME || 'WARRIORXR'
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchGithubRepos(username)
        if (!cancelled) {
          setRepos(data.length > 0 ? data : FALLBACK_REPOS)
          setUsingFallback(data.length === 0)
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('GitHub API failed, using fallback:', err.message)
          setRepos(FALLBACK_REPOS)
          setUsingFallback(true)
          setError(err.message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [username])

  return { repos, loading, error, usingFallback }
}
