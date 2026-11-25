import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDown, ArrowUpRight, FileText, Mail, MapPin, Terminal } from 'lucide-react'
import { personalInfo } from '../../data/personalInfo'
import { Github, Linkedin } from '../ui/BrandIcons'
import { gmailComposeUrl } from '../../lib/links'

const FOCUS_MODES = [
  {
    id: 'analytics',
    label: 'Analytics',
    pipeline: 'Ingest → SQL / Pandas → Power BI',
    highlightLabel: 'Peak Dataset ROI',
    highlightValue: '+340% Sci-Fi',
    secondaryLabel: 'Scale Verified',
    secondaryValue: '1,200+ Titles',
    bars: [58, 72, 64, 88, 96],
    caption: 'CineScope & ExpenseFlow automated EDA pipelines',
    badgeClass: 'bg-emerald-500/12 text-emerald-800 dark:text-emerald-300 border-emerald-500/25',
    barHighlight: 'bg-gradient-to-t from-emerald-600 to-teal-400',
    barBase: 'bg-emerald-600/25 dark:bg-emerald-400/25',
    headerTint: 'from-emerald-50/90 via-teal-50/50 to-sky-50/60 dark:from-emerald-500/10 dark:via-teal-500/5 dark:to-transparent',
    valueText: 'text-emerald-700 dark:text-emerald-400',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'ml',
    label: 'ML / AI',
    pipeline: 'Features → 5-Fold CV → Ensemble',
    highlightLabel: 'Classifier Accuracy',
    highlightValue: '94.2% RF',
    secondaryLabel: 'Risk ROC-AUC',
    secondaryValue: '0.92 XGB',
    bars: [74, 81, 88, 91, 95],
    caption: 'Netmax AI/ML benchmarks & Airline / Credit models',
    badgeClass: 'bg-violet-500/12 text-violet-800 dark:text-violet-300 border-violet-500/25',
    barHighlight: 'bg-gradient-to-t from-violet-600 to-indigo-400',
    barBase: 'bg-violet-600/25 dark:bg-violet-400/25',
    headerTint: 'from-violet-50/90 via-indigo-50/50 to-sky-50/60 dark:from-violet-500/10 dark:via-indigo-500/5 dark:to-transparent',
    valueText: 'text-violet-700 dark:text-violet-400',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'systems',
    label: 'Systems',
    pipeline: 'Flask / Rust → AWS → Cloudflare',
    highlightLabel: 'Edge & API Suites',
    highlightValue: '19 Passing',
    secondaryLabel: 'Alert SLA',
    secondaryValue: '06:30 AM IST',
    bars: [68, 79, 86, 92, 90],
    caption: 'School AQI serverless Lambda + Daily Ink PWA',
    badgeClass: 'bg-blue-500/12 text-blue-800 dark:text-blue-300 border-blue-500/25',
    barHighlight: 'bg-gradient-to-t from-blue-600 to-cyan-400',
    barBase: 'bg-blue-600/25 dark:bg-blue-400/25',
    headerTint: 'from-blue-50/90 via-cyan-50/50 to-emerald-50/60 dark:from-blue-500/10 dark:via-cyan-500/5 dark:to-transparent',
    valueText: 'text-blue-700 dark:text-blue-400',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
]

const PILLARS = [
  { idx: '01', title: 'Analysis', detail: 'Pandas · NumPy · Statistical EDA', topBar: 'bg-emerald-500', tagColor: 'text-emerald-700 dark:text-emerald-400' },
  { idx: '02', title: 'Visualization', detail: 'Power BI · Chart.js · KPI Systems', topBar: 'bg-teal-500', tagColor: 'text-teal-700 dark:text-teal-400' },
  { idx: '03', title: 'Data Layer', detail: 'SQL · PostgreSQL · Supabase RLS', topBar: 'bg-blue-500', tagColor: 'text-blue-700 dark:text-blue-400' },
  { idx: '04', title: 'ML & Cloud', detail: 'Scikit-learn · Flask · AWS Lambda', topBar: 'bg-violet-500', tagColor: 'text-violet-700 dark:text-violet-400' },
]

export default function Hero() {
  const [modeIndex, setModeIndex] = useState(0)
  const activeMode = FOCUS_MODES[modeIndex]

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative pt-28 pb-14 sm:pt-36 sm:pb-20 px-6 overflow-hidden">
      {/* Subtle fading dot-grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 editorial-grid-bg [mask-image:radial-gradient(ellipse_85%_75%_at_50%_20%,#000_35%,transparent_100%)]"
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-10 items-center">
          {/* Left Editorial Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Color-Bound Availability Pill */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex flex-wrap items-center gap-2.5 rounded-full border border-emerald-500/30 dark:border-emerald-400/25 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-sky-50/80 dark:from-emerald-500/10 dark:to-sky-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-950 dark:text-emerald-200 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600 dark:bg-emerald-400" />
              </span>
              <span>Available for Data Analyst &amp; AI/ML Roles</span>
              <span className="text-emerald-900/25 dark:text-white/25">/</span>
              <span className="flex items-center gap-1 text-emerald-800/80 dark:text-emerald-300/80">
                <MapPin className="w-3 h-3" />
                {personalInfo.location}
              </span>
            </motion.div>

            {/* Monumental Headline with Rich Color Gradient */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <div className="mono-label text-[11px] text-[#586375] dark:text-neutral-400 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500" />
                Portfolio Index &middot; 2026 Edition
              </div>
              <h1 className="text-4xl sm:text-6xl xl:text-[68px] font-bold tracking-[-0.035em] text-[#0e1422] dark:text-[#f4f4f5] leading-[1.03]">
                Turning raw telemetry into{' '}
                <span className="font-serif italic font-normal editorial-gradient-text tracking-normal text-[1.13em]">
                  decisive
                </span>{' '}
                intelligence.
              </h1>
              <p className="text-base sm:text-lg text-[#586375] dark:text-neutral-300 leading-relaxed max-w-2xl pt-1">
                I&apos;m <strong className="font-semibold text-[#0e1422] dark:text-white">{personalInfo.name}</strong> &mdash; a B.Tech Computer Science student (&rsquo;27) at IKGPTU engineering end-to-end data pipelines, interactive BI dashboards, and production machine learning models.
              </p>
            </motion.div>

            {/* Primary Action Row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-3 pt-1"
            >
              <button
                type="button"
                onClick={() => scrollTo('projects')}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0e1422] via-[#064e3b] to-[#065f46] hover:from-emerald-700 hover:to-teal-700 text-white dark:from-emerald-400 dark:to-teal-300 dark:text-[#09090b] dark:hover:from-emerald-300 dark:hover:to-teal-200 px-6 py-3 text-sm font-semibold transition-all active:scale-[0.98] shadow-md shadow-emerald-950/15"
              >
                <span>Explore Case Studies</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <a
                href={personalInfo.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-black/[0.11] dark:border-white/[0.15] bg-white dark:bg-[#111115] px-5 py-3 text-sm font-medium text-[#0e1422] dark:text-white hover:border-emerald-600/40 dark:hover:border-emerald-400/50 transition-all active:scale-[0.98] shadow-sm"
              >
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Resume</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#586375] dark:text-neutral-400" />
              </a>

              <button
                type="button"
                onClick={() => scrollTo('footer')}
                className="px-3 py-2 text-sm font-medium text-[#586375] dark:text-neutral-300 hover:text-[#0e1422] dark:hover:text-white transition-colors link-underline"
              >
                Connect
              </button>

              <div className="flex items-center gap-1.5 sm:ml-auto">
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub profile"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.09] dark:border-white/[0.12] bg-white dark:bg-[#111115] text-[#0e1422] dark:text-neutral-300 hover:text-emerald-700 hover:border-emerald-500/40 dark:hover:text-emerald-300 transition-all shadow-sm"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.09] dark:border-white/[0.12] bg-white dark:bg-[#111115] text-[#0e1422] dark:text-neutral-300 hover:text-blue-600 hover:border-blue-500/40 dark:hover:text-blue-400 transition-all shadow-sm"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href={gmailComposeUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Compose Email"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.09] dark:border-white/[0.12] bg-white dark:bg-[#111115] text-[#0e1422] dark:text-neutral-300 hover:text-violet-600 hover:border-violet-500/40 dark:hover:text-violet-400 transition-all shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Color-Reactive Analyst Dossier */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="paper-surface rounded-2xl overflow-hidden">
              {/* Sheet Top Bar (Color-Bound to Active Mode) */}
              <div className={`flex items-center justify-between px-5 py-3.5 border-b border-black/[0.07] dark:border-white/[0.08] bg-gradient-to-r ${activeMode.headerTint} transition-colors duration-300`}>
                <div className="flex items-center gap-2">
                  <Terminal className={`w-3.5 h-3.5 transition-colors ${activeMode.iconColor}`} />
                  <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[#0e1422] dark:text-white">
                    Analyst Spec &middot; TJ-27
                  </span>
                </div>
                <span className={`font-mono text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors ${activeMode.badgeClass}`}>
                  ACTIVE
                </span>
              </div>

              {/* Domain Lens Switcher */}
              <div className="px-5 pt-4 pb-3 border-b border-black/[0.06] dark:border-white/[0.07]">
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#efede7] dark:bg-white/[0.04]">
                  {FOCUS_MODES.map((m, i) => {
                    const selected = i === modeIndex
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setModeIndex(i)}
                        className={`relative py-1.5 text-[11px] font-mono font-medium rounded-lg transition-colors ${
                          selected
                            ? 'text-[#0e1422] dark:text-white'
                            : 'text-[#586375] dark:text-neutral-400 hover:text-[#0e1422] dark:hover:text-white'
                        }`}
                      >
                        {selected && (
                          <motion.span
                            layoutId="hero-spec-tab"
                            transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                            className="absolute inset-0 rounded-lg bg-white dark:bg-[#23242b] border border-black/[0.07] dark:border-white/[0.09] shadow-sm"
                          />
                        )}
                        <span className="relative z-10">{m.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Dynamic Telemetry Body */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMode.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="p-5 space-y-5"
                >
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#586375] dark:text-neutral-500">
                      Execution Pipeline
                    </div>
                    <div className="text-xs sm:text-sm font-mono font-semibold text-[#0e1422] dark:text-white">
                      {activeMode.pipeline}
                    </div>
                  </div>

                  {/* Key Metrics Pair */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-[#faf9f6] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.07]">
                      <div className="text-[10px] font-mono text-[#586375] dark:text-neutral-400 uppercase">
                        {activeMode.highlightLabel}
                      </div>
                      <div className={`mt-1 text-lg font-bold tracking-tight tabular-nums transition-colors ${activeMode.valueText}`}>
                        {activeMode.highlightValue}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#faf9f6] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.07]">
                      <div className="text-[10px] font-mono text-[#586375] dark:text-neutral-400 uppercase">
                        {activeMode.secondaryLabel}
                      </div>
                      <div className="mt-1 text-lg font-bold tracking-tight text-[#0e1422] dark:text-white tabular-nums">
                        {activeMode.secondaryValue}
                      </div>
                    </div>
                  </div>

                  {/* Color-Bound Signal Bars */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-end gap-2 h-14 px-1">
                      {activeMode.bars.map((val, idx) => (
                        <div key={idx} className="flex-1 h-full flex items-end bg-[#efede7] dark:bg-white/[0.04] rounded-md overflow-hidden p-0.5">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${val}%` }}
                            transition={{ duration: 0.42, delay: idx * 0.04, ease: 'easeOut' }}
                            className={`w-full rounded-sm ${
                              idx >= activeMode.bars.length - 2
                                ? activeMode.barHighlight
                                : activeMode.barBase
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="text-[11px] font-mono text-[#586375] dark:text-neutral-400">
                      {activeMode.caption}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Spec Sheet Footer */}
              <div className="px-5 py-3 border-t border-black/[0.07] dark:border-white/[0.08] bg-[#f6f5f0] dark:bg-[#15151a] flex items-center justify-between text-[11px] font-mono text-[#586375] dark:text-neutral-400">
                <span>IKGPTU &middot; B.Tech CSE &rsquo;27</span>
                <span className={`font-medium ${activeMode.valueText}`}>Netmax AI/ML Alum</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Color-Bound Architectural Pillars Ledger */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.25 }}
          className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-px bg-black/[0.08] dark:bg-white/[0.09] border border-black/[0.08] dark:border-white/[0.09] rounded-2xl overflow-hidden shadow-sm"
        >
          {PILLARS.map((pillar) => (
            <div
              key={pillar.idx}
              className="relative p-5 sm:p-6 space-y-1.5 bg-white dark:bg-[#111115]"
            >
              <span className={`absolute top-0 inset-x-0 h-[2.5px] ${pillar.topBar}`} aria-hidden="true" />
              <div className="flex items-center justify-between">
                <span className={`font-mono text-[10px] font-semibold tracking-widest uppercase ${pillar.tagColor}`}>
                  {pillar.idx} / {pillar.title}
                </span>
              </div>
              <div className="text-sm font-medium text-[#0e1422] dark:text-white/90">
                {pillar.detail}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
