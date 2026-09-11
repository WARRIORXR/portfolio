import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCw, AlertCircle, Sparkles, Filter } from 'lucide-react'
import { Github } from '../ui/BrandIcons'
import { useGithubRepos } from '../../hooks/useGithubRepos'
import { clearRepoCache } from '../../lib/github'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'
import LoadingSpinner from '../shared/LoadingSpinner'
import GlassButton from '../ui/GlassButton'
import { SectionWrapper, SectionItem, SectionTitle } from '../shared/SectionWrapper'
import { personalInfo } from '../../data/personalInfo'

const FILTERS = [
  { id: 'all', label: 'ALL REPOSITORIES' },
  { id: 'Python', label: 'PYTHON' },
  { id: 'Jupyter Notebook', label: 'JUPYTER & ML' },
  { id: 'HTML', label: 'WEB ARCHITECTURE' },
]

const SORTS = [
  { id: 'stars', label: 'STARS' },
  { id: 'updated', label: 'RECENT' },
  { id: 'name', label: 'NAME' },
]

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/10 bg-black/60 p-6 h-80 animate-pulse flex flex-col justify-between">
      <div className="space-y-4">
        <div className="h-32 bg-white/[0.04] rounded" />
        <div className="h-4 bg-white/[0.05] rounded w-3/4" />
        <div className="h-3 bg-white/[0.03] rounded w-full" />
      </div>
      <div className="h-3 bg-white/[0.04] rounded w-1/3" />
    </div>
  )
}

export default function Projects() {
  const { repos, loading, usingFallback } = useGithubRepos()
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
      <SectionTitle
        label="// 03 · REPOSITORY ARCHIVE"
        title="FEATURED PROJECTS"
        subtitle="AUTONOMOUS CODEBASES &middot; MACHINE LEARNING MODELS &middot; REST APIS"
      />

      {/* Telemetry Control Bar */}
      <SectionItem>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-4 border-b border-white/10">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-white/30 mr-2 flex items-center gap-1.5 uppercase">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1 rounded text-[10px] font-mono tracking-wider uppercase transition-all duration-200 border ${
                  filter === f.id
                    ? 'bg-white text-black font-bold border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                    : 'bg-white/[0.02] border-white/10 text-white/50 hover:text-white hover:border-white/30'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort & Telemetry Refresh */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-black/60 border border-white/10 rounded p-1">
              {SORTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSort(s.id)}
                  className={`px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase transition-colors ${
                    sort === s.id
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <button
              onClick={refresh}
              title="Synchronize Repositories"
              className="p-2 rounded border border-white/10 bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </SectionItem>

      {/* Fallback notification */}
      {usingFallback && !loading && (
        <SectionItem>
          <div className="mb-8 p-3 rounded border border-white/15 bg-white/[0.02] flex items-center justify-between text-xs font-mono text-white/60">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
              <span>CACHED DATA TRANSMITTED &middot; LIVE GITHUB RATE LIMIT SAFEGUARD</span>
            </div>
            <a
              href={personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline text-[11px] uppercase tracking-wider"
            >
              View GitHub Profile &rarr;
            </a>
          </div>
        </SectionItem>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center py-16 gap-8">
          <LoadingSpinner text="SYNCHRONIZING WITH GITHUB TELEMETRY..." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {Array(6).fill(0).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      )}

      {/* Project Matrix */}
      {!loading && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${filter}-${sort}-${refreshKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {processed.length > 0 ? (
              processed.map((repo, i) => (
                <ProjectCard key={repo.id} repo={repo} onOpen={setSelected} index={i} />
              ))
            ) : (
              <div className="col-span-full text-center py-20 font-mono text-xs tracking-widest text-white/40 uppercase">
                NO REPOSITORIES MATCH CURRENT FILTER
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* View all button */}
      {!loading && processed.length > 0 && (
        <SectionItem className="text-center mt-14">
          <GlassButton
            href={personalInfo.github}
            target="_blank"
            variant="outline"
            size="lg"
            icon={<Github className="w-4 h-4" />}
          >
            EXPLORE ALL REPOSITORIES ON GITHUB
          </GlassButton>
        </SectionItem>
      )}

      {/* Modal */}
      {selected && <ProjectModal repo={selected} onClose={() => setSelected(null)} />}
    </SectionWrapper>
  )
}
