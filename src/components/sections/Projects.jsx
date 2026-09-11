import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaGithub, FaSync } from 'react-icons/fa'
import { useGithubRepos } from '../../hooks/useGithubRepos'
import { clearRepoCache } from '../../lib/github'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'
import LoadingSpinner from '../shared/LoadingSpinner'
import GlassButton from '../ui/GlassButton'
import { SectionWrapper, SectionItem, SectionTitle } from '../shared/SectionWrapper'
import { personalInfo } from '../../data/personalInfo'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'Python', label: '🐍 Python' },
  { id: 'Jupyter Notebook', label: '📓 Jupyter' },
  { id: 'HTML', label: '🌐 HTML' },
  { id: 'JavaScript', label: '⚡ JavaScript' },
]

const SORTS = [
  { id: 'stars', label: '⭐ Stars' },
  { id: 'updated', label: '🕐 Updated' },
  { id: 'name', label: '🔤 Name' },
]

// Skeleton card
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 h-48 animate-pulse">
      <div className="flex gap-3 mb-3">
        <div className="w-6 h-6 bg-white/10 rounded" />
        <div className="h-4 bg-white/10 rounded w-3/4" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-white/10 rounded w-full" />
        <div className="h-3 bg-white/10 rounded w-5/6" />
        <div className="h-3 bg-white/10 rounded w-4/6" />
      </div>
    </div>
  )
}

export default function Projects() {
  const { repos, loading, error, usingFallback } = useGithubRepos()
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('stars')
  const [selected, setSelected] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = () => {
    clearRepoCache()
    setRefreshKey((k) => k + 1)
  }

  const processed = [...repos]
    .filter((r) => filter === 'all' || r.language === filter)
    .sort((a, b) => {
      if (sort === 'stars') return b.stargazers_count - a.stargazers_count
      if (sort === 'updated') return new Date(b.updated_at) - new Date(a.updated_at)
      return a.name.localeCompare(b.name)
    })

  return (
    <SectionWrapper id="projects">
      <SectionTitle label="// GitHub Projects" title="What I've Built" />

      {/* Controls */}
      <SectionItem>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 max-w-7xl mx-auto">
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  filter === f.id
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/8'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort + Refresh */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
              {SORTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSort(s.id)}
                  className={`px-3 py-1 rounded text-xs transition-all ${
                    sort === s.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <button
              onClick={refresh}
              title="Refresh repos"
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <FaSync size={12} />
            </button>
          </div>
        </div>
      </SectionItem>

      {/* Rate limit warning */}
      {usingFallback && !loading && (
        <SectionItem>
          <div className="mb-6 max-w-7xl mx-auto px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm text-center">
            ⚠️ GitHub API rate limit reached — showing sample projects.{' '}
            <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-200">
              View all repos on GitHub →
            </a>
          </div>
        </SectionItem>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-16 gap-8">
          <LoadingSpinner text="Fetching GitHub repos..." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto w-full">
            {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      )}

      {/* Projects grid */}
      {!loading && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${filter}-${sort}-${refreshKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto"
          >
            {processed.length > 0 ? (
              processed.map((repo, i) => (
                <ProjectCard key={repo.id} repo={repo} onOpen={setSelected} index={i} />
              ))
            ) : (
              <div className="col-span-full text-center py-16 text-white/40">
                No repos found for this filter.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* View all CTA */}
      {!loading && processed.length > 0 && (
        <SectionItem className="text-center mt-10">
          <GlassButton href={personalInfo.github} target="_blank" variant="secondary" size="lg" icon={<FaGithub />}>
            View All Repos on GitHub
          </GlassButton>
        </SectionItem>
      )}

      {/* Modal */}
      {selected && <ProjectModal repo={selected} onClose={() => setSelected(null)} />}
    </SectionWrapper>
  )
}
