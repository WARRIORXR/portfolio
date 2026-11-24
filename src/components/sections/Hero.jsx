import { motion } from 'framer-motion'
import { ArrowDown, ArrowUpRight, FileText, Sparkles, MapPin } from 'lucide-react'
import { personalInfo } from '../../data/personalInfo'
import { Github, Linkedin, Whatsapp } from '../ui/BrandIcons'
import { gmailComposeUrl } from '../../lib/links'

export default function Hero() {
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center px-6 pt-28 pb-16 max-w-5xl mx-auto overflow-hidden">
      {/* Ambient background glows */}
      <div
        className="ambient-glow -top-32 -left-32 w-96 h-96"
        aria-hidden="true"
      />
      <div
        className="ambient-glow top-1/2 -right-32 w-80 h-80 opacity-10 bg-radial from-cyan-500 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-8">
        {/* Availability Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>Available for Data Analyst &amp; AI/ML Roles</span>
          <span className="text-black/20 dark:text-white/20">&bull;</span>
          <span className="flex items-center gap-1 text-neutral-500 dark:text-white/50">
            <MapPin className="w-3 h-3 text-neutral-400 dark:text-white/40" />
            Punjab, India
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4 max-w-3xl"
        >
          <div className="mono-label text-neutral-500 dark:text-white/40">
            Portfolio &middot; 2026 Edition
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.08]">
            Turning raw data into{' '}
            <span className="font-serif italic font-normal text-neutral-700 dark:text-white/90">
              decisive impact
            </span>
            .
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 dark:text-white/60 leading-relaxed max-w-2xl font-normal pt-2">
            Hi, I&apos;m <span className="text-neutral-900 dark:text-white font-medium">{personalInfo.name}</span> — a B.Tech Computer Science student ('27) at IKGPTU building data-driven products end to end: gathering data, analyzing patterns, crafting interactive dashboards, and training machine learning models.
          </p>
        </motion.div>

        {/* Action CTAs & Socials */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center gap-4 pt-2"
        >
          <button
            onClick={() => scrollTo('projects')}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-black px-6 py-3 text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-neutral-900/10"
          >
            <span>Explore Work</span>
            <ArrowDown className="w-4 h-4" />
          </button>

          <a
            href={personalInfo.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/[0.04] px-5 py-3 text-sm font-medium text-neutral-800 dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.08] hover:border-black/20 dark:hover:border-white/30 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
          >
            <FileText className="w-4 h-4 text-neutral-500 dark:text-white/60" />
            <span>Resume</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 dark:text-white/40" />
          </a>

          <button
            onClick={() => scrollTo('contact')}
            className="inline-flex items-center gap-1.5 px-4 py-3 text-sm font-medium text-neutral-600 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors link-underline"
          >
            <span>Get in touch</span>
          </button>

          {/* Social quick pills */}
          <div className="flex items-center gap-2 sm:ml-auto pt-2 sm:pt-0">
            <a
              href={personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="p-2.5 rounded-full border border-black/10 dark:border-white/10 text-neutral-600 dark:text-white/60 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href={personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              className="p-2.5 rounded-full border border-black/10 dark:border-white/10 text-neutral-600 dark:text-white/60 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href={gmailComposeUrl()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Email Tanish"
              className="p-2.5 rounded-full border border-black/10 dark:border-white/10 text-neutral-600 dark:text-white/60 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400/80" />
            </a>
          </div>
        </motion.div>

        {/* Core Pillars / Ticker Strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="pt-8 border-t border-black/[0.08] dark:border-white/[0.08] grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="space-y-1">
            <div className="text-xs font-mono text-neutral-400 dark:text-white/40 uppercase tracking-wider">Analysis</div>
            <div className="text-sm font-medium text-neutral-800 dark:text-white/80">Pandas &middot; NumPy &middot; EDA</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono text-neutral-400 dark:text-white/40 uppercase tracking-wider">Visualization</div>
            <div className="text-sm font-medium text-neutral-800 dark:text-white/80">Power BI &middot; Chart.js &middot; Dashboards</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono text-neutral-400 dark:text-white/40 uppercase tracking-wider">Databases</div>
            <div className="text-sm font-medium text-neutral-800 dark:text-white/80">SQL &middot; PostgreSQL &middot; Supabase</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono text-neutral-400 dark:text-white/40 uppercase tracking-wider">AI / ML</div>
            <div className="text-sm font-medium text-neutral-800 dark:text-white/80">Scikit-learn &middot; Flask &middot; AWS</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
