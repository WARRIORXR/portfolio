import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, GitFork, ExternalLink, FolderGit2, Calendar } from 'lucide-react'
import { Github } from '../ui/BrandIcons'
import GlassBadge from '../ui/GlassBadge'
import GlassButton from '../ui/GlassButton'
import { getLanguageColor } from '../../lib/github'

export default function ProjectModal({ repo, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!repo) return null
  const langColor = getLanguageColor(repo.language)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/85 backdrop-blur-xl"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal Window */}
        <motion.div
          className="relative z-10 w-full max-w-lg rounded-xl border border-white/20 overflow-hidden bg-black/95 text-white shadow-[0_25px_70px_rgba(0,0,0,0.9)]"
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2.5 min-w-0">
              <FolderGit2 className="w-5 h-5 text-blue-400 shrink-0" />
              <h2 className="font-mono font-bold text-base sm:text-lg text-white truncate">
                {repo.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Description */}
            <p className="text-sm text-white/70 leading-relaxed font-light">
              {repo.description || 'System repository with clean code and algorithmic logic.'}
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded border border-white/10 bg-white/[0.02] text-center font-mono text-xs">
              <div>
                <div className="text-[10px] text-white/40 uppercase">Language</div>
                <div className="font-bold mt-1" style={{ color: langColor }}>
                  {repo.language || 'Code'}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-white/40 uppercase">Stars</div>
                <div className="font-bold mt-1 text-white flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400" />
                  {repo.stargazers_count}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-white/40 uppercase">Forks</div>
                <div className="font-bold mt-1 text-white flex items-center justify-center gap-1">
                  <GitFork className="w-3 h-3 text-white/60" />
                  {repo.forks_count}
                </div>
              </div>
            </div>

            {/* Topics */}
            {repo.topics?.length > 0 && (
              <div>
                <span className="block text-[10px] font-mono tracking-wider text-white/40 uppercase mb-2">
                  TELEMETRY TAGS
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {repo.topics.map((t) => (
                    <GlassBadge key={t} color="#3b82f6" size="xs">
                      {t}
                    </GlassBadge>
                  ))}
                </div>
              </div>
            )}

            {/* Last update */}
            <div className="flex items-center gap-2 text-[11px] font-mono text-white/40">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                LAST SYNCHRONIZED:{' '}
                {new Date(repo.updated_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <GlassButton
                href={repo.html_url}
                target="_blank"
                variant="primary"
                size="md"
                className="flex-1"
                icon={<Github className="w-4 h-4" />}
              >
                VIEW REPOSITORY
              </GlassButton>
              {repo.homepage && (
                <GlassButton
                  href={repo.homepage}
                  target="_blank"
                  variant="outline"
                  size="md"
                  className="flex-1"
                  icon={<ExternalLink className="w-4 h-4" />}
                >
                  LIVE DEMO
                </GlassButton>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
