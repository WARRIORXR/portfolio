import { useState, useMemo, lazy, Suspense } from 'react'
import { ArrowUpRight, Sparkles, FolderGit2, Layers } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Github } from '../ui/BrandIcons'
import { useGithubRepos } from '../../hooks/useGithubRepos'
import { SectionWrapper, SectionItem, SectionTitle } from '../shared/SectionWrapper'
import ErrorBoundary from '../shared/ErrorBoundary'
import { personalInfo } from '../../data/personalInfo'
import { featuredProjects } from '../../data/featuredProjects'
import { DataAnalyticsWidget } from '../ui/DataAnalyticsWidget'

const ClothingRailHero = lazy(() => import('../ui/product-rail-gallery'))
const ProjectShowcase = lazy(() => import('../ui/project-showcase'))

const MAX_PROJECTS = 12

const PROJECT_THEMES = [
  {
    topBar: 'from-emerald-500 to-teal-500',
    numBadge: 'bg-emerald-500/12 text-emerald-800 dark:text-emerald-300',
    catText: 'text-emerald-700 dark:text-emerald-400',
    pill: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/25',
    arrow: 'text-emerald-600 dark:text-emerald-400',
    hoverTitle: 'group-hover:text-emerald-700 dark:group-hover:text-emerald-400',
  },
  {
    topBar: 'from-blue-500 to-cyan-500',
    numBadge: 'bg-blue-500/12 text-blue-800 dark:text-blue-300',
    catText: 'text-blue-700 dark:text-blue-400',
    pill: 'bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/25',
    arrow: 'text-blue-600 dark:text-blue-400',
    hoverTitle: 'group-hover:text-blue-700 dark:group-hover:text-blue-400',
  },
  {
    topBar: 'from-violet-500 to-indigo-500',
    numBadge: 'bg-violet-500/12 text-violet-800 dark:text-violet-300',
    catText: 'text-violet-700 dark:text-violet-400',
    pill: 'bg-violet-500/10 text-violet-800 dark:text-violet-300 border-violet-500/25',
    arrow: 'text-violet-600 dark:text-violet-400',
    hoverTitle: 'group-hover:text-violet-700 dark:group-hover:text-violet-400',
  },
  {
    topBar: 'from-amber-500 to-emerald-500',
    numBadge: 'bg-amber-500/12 text-amber-800 dark:text-amber-300',
    catText: 'text-amber-700 dark:text-amber-400',
    pill: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/25',
    arrow: 'text-amber-600 dark:text-amber-400',
    hoverTitle: 'group-hover:text-amber-700 dark:group-hover:text-amber-400',
  },
]

const PROJECT_RAIL_ITEMS = [
  {
    id: 'cinescope',
    name: 'CineScope · Film Economics & AI',
    description:
      'RESTful film analytics engine calculating box office ROI, margins, and ratings intelligence across 1,200+ titles with Gemini recommendations.',
    kind: 'jacket',
    color: '#065f46',
    trim: '#34d399',
    tag: 'Python & Flask',
    details: ['8 REST APIs', 'Gemini AI', 'Pandas EDA', 'Box-Office ROI', '1,200 Titles'],
  },
  {
    id: 'expenseflow',
    name: 'ExpenseFlow · FinTech Dashboard',
    description:
      'Personal finance and cash flow command center with interactive Chart.js visualizations, automated budget threshold alerts, and multi-currency tracking.',
    kind: 'hoodie',
    color: '#1e40af',
    trim: '#60a5fa',
    tag: 'Chart.js & BI',
    details: ['3 Chart.js Views', '7 Currencies', 'PDF / CSV Export', 'Cap Alerts at 80%'],
  },
  {
    id: 'daily-ink',
    name: 'Daily Ink · Spaced Repetition PWA',
    description:
      'Progressive web application implementing the SuperMemo-2 (SM-2) memory retention algorithm with offline sync, mood analytics, and PostgreSQL RLS.',
    kind: 'knit',
    color: '#4338ca',
    trim: '#a5b4fc',
    tag: 'Supabase & PWA',
    details: ['SM-2 Algorithm', 'PostgreSQL RLS', 'PBKDF2 Hashing', 'Offline-First PWA'],
  },
  {
    id: 'school-aqi',
    name: 'School AQI Alert · IoT Cloud Pipeline',
    description:
      'Hackathon winner: event-driven serverless system ingesting atmospheric Open-Meteo feeds to dispatch automated morning air safety SMS alerts.',
    kind: 'coat',
    color: '#b45309',
    trim: '#fde68a',
    tag: 'AWS Serverless',
    details: ['AWS Lambda', 'DynamoDB', 'EventBridge', 'Bilingual SMS', '19 Test Suites'],
  },
  {
    id: 'airline-satisfaction',
    name: 'Airline Passenger Satisfaction ML',
    description:
      'End-to-end classification pipeline predicting passenger satisfaction with 94.2% accuracy using hyperparameter-tuned ensemble models.',
    kind: 'shirt',
    color: '#0369a1',
    trim: '#7dd3fc',
    tag: 'Scikit-Learn',
    details: ['94.2% Test Accuracy', 'Random Forest', '5-Fold CV', 'Feature Engineering'],
  },
  {
    id: 'credit-risk',
    name: 'Credit Risk Scoring & Default Prediction',
    description:
      'Financial risk assessment model evaluating borrower default probabilities with cost-benefit analysis and ROC-AUC curve optimization.',
    kind: 'tee',
    color: '#831843',
    trim: '#f472b6',
    tag: 'Machine Learning',
    details: ['ROC-AUC 0.92', 'XGBoost', 'Imbalanced Sampling', 'LendingClub Data'],
  },
]

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
        <div key={i} className="py-5 border-t border-black/[0.08] dark:border-white/[0.08]">
          <div className="h-4 w-36 bg-black/[0.06] dark:bg-white/[0.06] rounded animate-pulse" />
          <div className="mt-2 h-3 w-72 bg-black/[0.04] dark:bg-white/[0.04] rounded animate-pulse" />
        </div>
      ))}
      <div className="border-t border-black/[0.08] dark:border-white/[0.08]" />
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

  const modeTabs = [
    { id: 'featured', label: `Case Studies & Data Lab (${featuredProjects.length})`, icon: Sparkles, dot: 'bg-violet-500' },
    { id: 'rail', label: `Interactive 3D Rail (${PROJECT_RAIL_ITEMS.length})`, icon: Layers, dot: 'bg-emerald-500' },
    { id: 'github', label: `GitHub Archive (${repos.length || 'Live'})`, icon: FolderGit2, dot: 'bg-blue-500' },
  ]

  return (
    <SectionWrapper id="projects">
      <SectionTitle
        index="03"
        label="Selected Work"
        title="Engineering"
        italicWord="case studies."
        subtitle="Analytical dashboards, machine learning pipelines, serverless telemetry, and production web systems."
        accent="violet"
      />

      {/* Color-Bound Mode Switcher */}
      <SectionItem className="mb-10">
        <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-2xl sm:rounded-full bg-[#efede7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]">
          {modeTabs.map((tab) => {
            const Icon = tab.icon
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl sm:rounded-full transition-colors duration-200 ${
                  isSelected
                    ? 'text-[#0e1422] dark:text-white'
                    : 'text-[#586375] dark:text-neutral-400 hover:text-[#0e1422] dark:hover:text-white'
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="projects-mode-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-xl sm:rounded-full bg-white dark:bg-[#1f2027] border border-black/[0.07] dark:border-white/[0.1] shadow-sm"
                  />
                )}
                <span className={`relative z-10 h-1.5 w-1.5 rounded-full ${tab.dot}`} />
                <Icon className="relative z-10 w-3.5 h-3.5" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </SectionItem>

      <AnimatePresence mode="wait">
        {activeTab === 'featured' ? (
          <motion.div
            key="featured-list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-12"
          >
            {/* Color-Bound Flagship Case Studies Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {featuredProjects.map((project, idx) => {
                const theme = PROJECT_THEMES[idx % PROJECT_THEMES.length]
                return (
                  <SectionItem key={project.id}>
                    <article className="relative paper-surface rounded-2xl p-6 sm:p-7 flex flex-col justify-between h-full group overflow-hidden">
                      {/* Signature Domain Accent Bar */}
                      <span
                        aria-hidden="true"
                        className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${theme.topBar}`}
                      />

                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md ${theme.numBadge}`}>
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className={`mono-label text-[10px] font-semibold ${theme.catText}`}>
                              {project.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {project.badge && (
                              <span className={`text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full border ${theme.pill}`}>
                                {project.badge}
                              </span>
                            )}
                            <span className="text-[11px] font-mono text-[#586375] dark:text-neutral-500">
                              {project.year}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className={`text-xl font-bold tracking-tight text-[#0e1422] dark:text-white transition-colors ${theme.hoverTitle}`}>
                            {project.title}
                          </h3>
                          <div className="text-xs font-medium text-[#586375] dark:text-neutral-400 mt-0.5">
                            {project.headline}
                          </div>
                        </div>

                        <p className="text-sm leading-relaxed text-[#283040] dark:text-neutral-300">
                          {project.description}
                        </p>

                        <ul className="pt-3 border-t border-black/[0.06] dark:border-white/[0.07] space-y-2">
                          {project.highlights.map((point) => (
                            <li
                              key={point}
                              className="flex items-start gap-2.5 text-xs text-[#586375] dark:text-neutral-400 leading-relaxed"
                            >
                              <span className={`font-mono mt-0.5 shrink-0 ${theme.arrow}`}>&rarr;</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-5 mt-5 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-1.5">
                          {project.tech.map((t) => (
                            <span
                              key={t}
                              className="text-[11px] font-mono rounded-md px-2 py-0.5 bg-[#faf9f6] dark:bg-white/[0.04] text-[#0e1422] dark:text-neutral-300 border border-black/[0.07] dark:border-white/[0.08]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-black/[0.11] dark:border-white/[0.14] bg-white dark:bg-[#141418] px-3.5 py-1.5 text-xs font-medium text-[#0e1422] dark:text-white hover:border-emerald-600/40 dark:hover:border-emerald-400/50 transition-all shadow-sm"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>Source</span>
                          <ArrowUpRight className="w-3 h-3 text-[#586375] dark:text-neutral-400" />
                        </a>
                      </div>
                    </article>
                  </SectionItem>
                )
              })}
            </div>

            {/* Interactive Data Telemetry Lab */}
            <SectionItem>
              <DataAnalyticsWidget />
            </SectionItem>
          </motion.div>
        ) : activeTab === 'rail' ? (
          <motion.div
            key="rail-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            <SectionItem>
              <div className="paper-surface rounded-2xl p-4 sm:p-8 overflow-hidden bg-gradient-to-b from-white via-[#faf9f6] to-emerald-50/30 dark:from-[#111115] dark:via-[#111115] dark:to-emerald-950/10">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center min-h-[380px]">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-emerald-600/20 border-t-emerald-600 animate-spin" />
                        <span className="text-xs font-mono text-[#586375] dark:text-neutral-400">
                          Loading 3D Project Rail…
                        </span>
                      </div>
                    </div>
                  }
                >
                  <ClothingRailHero
                    items={PROJECT_RAIL_ITEMS}
                    eyebrow="Interactive 3D Gallery"
                    heading="Project Clothing Rail"
                    caption="Hover over hangers to tilt • Click any piece to inspect full architecture • Drag to rotate 360°"
                    autoplay={false}
                    hanger="wood"
                  />
                </Suspense>
              </div>
            </SectionItem>
          </motion.div>
        ) : (
          <motion.div
            key="github-list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <SectionItem>
              {loading ? (
                <SkeletonList />
              ) : (
                <ErrorBoundary>
                  <Suspense fallback={<SkeletonList />}>
                    <ProjectShowcase projects={items} title="All Public Repositories" />
                  </Suspense>
                </ErrorBoundary>
              )}
            </SectionItem>

            <SectionItem>
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-xs font-medium text-[#0e1422] dark:text-white border border-black/[0.11] dark:border-white/[0.14] rounded-full px-5 py-2.5 bg-white dark:bg-[#111115] hover:border-emerald-600/40 dark:hover:border-emerald-400/50 transition-all shadow-sm"
              >
                <Github className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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
