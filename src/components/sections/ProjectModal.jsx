import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaGithub, FaExternalLinkAlt, FaStar, FaCodeBranch, FaTimes } from 'react-icons/fa'
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
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal */}
        <motion.div
          className="relative z-10 w-full max-w-lg rounded-2xl border border-white/15 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.95) 100%)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          }}
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📁</span>
              <h2 className="font-bold text-white text-lg">{repo.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
            >
              <FaTimes size={14} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Description */}
            <p className="text-white/70 text-sm leading-relaxed">
              {repo.description || 'No description provided.'}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              {repo.language && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ background: langColor }} />
                  <span style={{ color: langColor }}>{repo.language}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-yellow-400">
                <FaStar size={12} /> <span className="text-white/60">{repo.stargazers_count}</span>
              </div>
              <div className="flex items-center gap-1 text-white/60">
                <FaCodeBranch size={12} /> {repo.forks_count}
              </div>
              <span className="text-white/30 text-xs ml-auto">
                Updated {new Date(repo.updated_at).toLocaleDateString('en-IN')}
              </span>
            </div>

            {/* Topics */}
            {repo.topics?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {repo.topics.map((t) => (
                  <GlassBadge key={t} color="#8b5cf6" size="sm">{t}</GlassBadge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <GlassButton href={repo.html_url} target="_blank" variant="primary" className="flex-1 justify-center">
                <FaGithub /> View on GitHub
              </GlassButton>
              {repo.homepage && (
                <GlassButton href={repo.homepage} target="_blank" variant="outline" className="flex-1 justify-center">
                  <FaExternalLinkAlt size={12} /> Live Demo
                </GlassButton>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
