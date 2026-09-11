import { motion } from 'framer-motion'
import { FaStar, FaCodeBranch, FaExternalLinkAlt, FaGithub } from 'react-icons/fa'
import GlassCard from '../ui/GlassCard'
import GlassBadge from '../ui/GlassBadge'
import GlassButton from '../ui/GlassButton'
import { getLanguageColor } from '../../lib/github'

export default function ProjectCard({ repo, onOpen, index }) {
  const langColor = getLanguageColor(repo.language)
  const updated = new Date(repo.updated_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="h-full"
    >
      <GlassCard
        tilt
        glow
        glowColor={`${langColor}40`}
        className="h-full flex flex-col cursor-pointer"
        onClick={() => onOpen(repo)}
        padding={false}
      >
        <div className="p-5 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl">📁</span>
              <h3 className="font-semibold text-white text-sm truncate hover:text-blue-300 transition-colors">
                {repo.name}
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 text-xs text-white/40">
              <FaStar className="text-yellow-400" />
              <span>{repo.stargazers_count}</span>
              <FaCodeBranch />
              <span>{repo.forks_count}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-white/60 text-xs leading-relaxed mb-4 flex-1 line-clamp-3">
            {repo.description || 'No description provided.'}
          </p>

          {/* Topics */}
          {repo.topics?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {repo.topics.slice(0, 4).map((t) => (
                <GlassBadge key={t} color="#8b5cf6" size="xs">{t}</GlassBadge>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-xs">
              {repo.language && (
                <>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: langColor }} />
                  <span style={{ color: langColor }}>{repo.language}</span>
                </>
              )}
              <span className="text-white/30 ml-2">· {updated}</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-white/40 hover:text-white transition-colors p-1"
                title="GitHub"
              >
                <FaGithub size={14} />
              </a>
              {repo.homepage && (
                <a
                  href={repo.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-400/60 hover:text-blue-300 transition-colors p-1"
                  title="Live Demo"
                >
                  <FaExternalLinkAlt size={12} />
                </a>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
