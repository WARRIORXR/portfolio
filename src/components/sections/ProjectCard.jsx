import { motion } from 'framer-motion'
import { Star, GitFork, ExternalLink, ArrowUpRight } from 'lucide-react'
import { Github } from '../ui/BrandIcons'
import GlassCard from '../ui/GlassCard'
import GlassBadge from '../ui/GlassBadge'
import { getLanguageColor } from '../../lib/github'

// Curated high-res Unsplash stock images for tech & cosmic themes
const projectThumbnails = [
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80', // Cosmic galaxy
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', // Matrix cyber code
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80', // AI neural network
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80', // Cyber security neon
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', // Deep space earth
]

export default function ProjectCard({ repo, onOpen, index }) {
  const langColor = getLanguageColor(repo.language)
  const updated = new Date(repo.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
  const thumbnail = projectThumbnails[index % projectThumbnails.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="h-full"
    >
      <GlassCard
        tilt
        glow
        glowColor="rgba(0,51,255,0.3)"
        className="h-full flex flex-col cursor-pointer group"
        onClick={() => onOpen(repo)}
        padding={false}
      >
        {/* Project Visual Banner with Unsplash Stock Asset */}
        <div className="relative h-44 w-full overflow-hidden border-b border-white/10 bg-black">
          <img
            src={thumbnail}
            alt={repo.name}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700 filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* Telemetry pill */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white/80">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: langColor, boxShadow: `0 0 8px ${langColor}` }}
            />
            <span>{repo.language || 'Codebase'}</span>
          </div>

          {/* Quick action corner */}
          <div className="absolute top-3 right-3 flex items-center gap-1">
            <span className="w-7 h-7 rounded bg-black/80 border border-white/10 flex items-center justify-center text-white/60 group-hover:text-white group-hover:border-white/30 transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <h3 className="font-mono font-bold text-white text-base tracking-wide truncate group-hover:text-blue-300 transition-colors">
              {repo.name}
            </h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
          <p className="text-white/60 text-xs leading-relaxed font-light mb-4 line-clamp-3">
            {repo.description || 'Deep algorithmic system repository with clean modular architecture.'}
          </p>

          {/* Topics / Tags */}
          <div className="space-y-4">
            {repo.topics?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {repo.topics.slice(0, 3).map((t) => (
                  <GlassBadge key={t} color="#3b82f6" size="xs">
                    {t}
                  </GlassBadge>
                ))}
              </div>
            )}

            {/* Footer Telemetry */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px] font-mono text-white/40">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400" />
                  {repo.stargazers_count}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="w-3 h-3 text-white/60" />
                  {repo.forks_count}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-[10px] uppercase text-white/30">{updated}</span>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 hover:text-white transition-colors"
                  title="GitHub Repository"
                >
                  <Github className="w-3.5 h-3.5" />
                </a>
                {repo.homepage && (
                  <a
                    href={repo.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 hover:text-white transition-colors"
                    title="Live Preview"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
