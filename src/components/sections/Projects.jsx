import { useState, useMemo } from 'react'
import { ArrowUpRight, ExternalLink, Sparkles, FolderGit2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Github } from '../ui/BrandIcons'
import { ProjectShowcase } from '../ui/project-showcase'
import { useGithubRepos } from '../../hooks/useGithubRepos'
import { SectionWrapper, SectionItem, SectionTitle } from '../shared/SectionWrapper'
import ErrorBoundary from '../shared/ErrorBoundary'
import { personalInfo } from '../../data/personalInfo'
import { featuredProjects } from '../../data/featuredProjects'

const MAX_PROJECTS = 12

function toShowcaseItem(repo) {
  const slug = repo.html_url.replace('https://github.com/', '')
  return {
    title: repo.name,
    description: repo.description || 'No description provided.',
    year: String(new Date(repo.updated_at).getFullYear()),
    link: repo.html_url,
    image: `https://opengraph.githubassets.com/1/${slug}`,
  }
}

function SkeletonList() {
  return (
    <div className="flex flex-col" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="py-5 border-t border-white/[0.08]">
          <div className="h-4 w-32 bg-white/[0.06] rounded animate-pulse" />
          <div className="mt-2 h-3 w-64 bg-white/[0.04] rounded animate-pulse" />
        </div>
      ))}
      <div className="border-t border-white/[0.08]" />
    </div>
  )
}

export default function Projects() {
  const [activeTab, setActiveTab] = useState('featured')
  const { repos, loading } = useGithubRepos()

  const items = useMemo(
    () => repos.slice(0, MAX_PROJECTS).map(toShowcaseItem),
    [repos]
  )

  return (
    <SectionWrapper id="projects">
      <SectionTitle
        index="03"
        label="Selected Work"
        title="Featured Projects & Code"
        subtitle="Analytical dashboards, machine learning pipelines, and production full-stack systems."
      />

      {/* Mode Switcher Tabs */}
      <SectionItem className="mb-10">
        <div className="flex items-center gap-2 p-1 rounded-full bg-white/[0.03] border border-white/[0.08] w-fit">
          <button
            onClick={() => setActiveTab('featured')}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-medium rounded-full transition-all duration-200 ${
              activeTab === 'featured'
                ? 'bg-white text-black shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Featured Case Studies ({featuredProjects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-medium rounded-full transition-all duration-200 ${
              activeTab === 'github'
                ? 'bg-white text-black shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>GitHub Repositories ({repos.length || 'Live'})</span>
          </button>
        </div>
      </SectionItem>

      <AnimatePresence mode="wait">
        {activeTab === 'featured' ? (
          <motion.div
            key="featured-list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {featuredProjects.map((project) => (
              <SectionItem key={project.id}>
                <div className="glass-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between h-full group hover:border-white/20">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="mono-label text-[10px] text-emerald-400">
                        {project.category}
                      </span>
                      <span className="text-[11px] font-mono text-white/40">
                        {project.year}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {project.title}
                      </h3>
                      <div className="text-xs text-white/50 font-medium mt-0.5">
                        {project.headline}
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-white/70">
                      {project.description}
                    </p>

                    {/* Bullet Highlights */}
                    <div className="pt-2 border-t border-white/[0.06] space-y-2">
                      {project.highlights.map((point) => (
                        <div
                          key={point}
                          className="flex items-start gap-2 text-xs text-white/60 leading-relaxed"
                        >
                          <span className="text-emerald-400 mt-1 shrink-0">&bull;</span>
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tech stack & CTAs */}
                  <div className="pt-6 mt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {project.tech.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] font-mono rounded px-2 py-0.5 bg-white/[0.04] text-white/50 border border-white/[0.06]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 text-xs text-white/70 hover:text-white hover:border-white/30 transition-all hover:bg-white/[0.04]"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>Source</span>
                        <ArrowUpRight className="w-3 h-3 text-white/40" />
                      </a>
                    </div>
                  </div>
                </div>
              </SectionItem>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="github-list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <SectionItem>
              {loading ? (
                <SkeletonList />
              ) : (
                <ErrorBoundary>
                  <ProjectShowcase projects={items} title="All Public Repositories" />
                </ErrorBoundary>
              )}
            </SectionItem>

            <SectionItem>
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors border border-white/10 rounded-full px-5 py-2.5 hover:border-white/30 bg-white/[0.02]"
              >
                <Github className="w-4 h-4" />
                <span>Explore all repositories on GitHub</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </SectionItem>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  )
}
