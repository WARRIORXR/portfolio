import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  CornerDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  Sun,
  Moon,
  FileDown,
  FileText,
  Sparkles,
  Layers,
  FolderGit2,
  User,
  Cpu,
  Mail,
} from 'lucide-react'
import { Github, Linkedin, Whatsapp } from './BrandIcons'
import { personalInfo } from '../../data/personalInfo'
import { useTheme } from '../../context/ThemeContext'
import { gmailComposeUrl, whatsappUrl } from '../../lib/links'

export default function CommandPalette({ open, onClose, onSwitchProjectTab }) {
  const { toggleTheme, isDark } = useTheme()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [copiedEmail, setCopiedEmail] = useState(false)

  const jumpTo = (selector, tab) => {
    if (tab && onSwitchProjectTab) {
      onSwitchProjectTab(tab)
    }
    onClose()
    window.setTimeout(() => {
      if (selector === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' })
      }
    }, 60)
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(personalInfo.email)
      setCopiedEmail(true)
      window.setTimeout(() => setCopiedEmail(false), 1800)
    } catch {
      window.location.href = `mailto:${personalInfo.email}`
    }
  }

  const actions = useMemo(
    () => [
      {
        id: 'nav-top',
        group: 'Navigation',
        label: 'Overview & Analyst Spec',
        hint: 'Hero',
        icon: Sparkles,
        accent: 'text-emerald-600 dark:text-emerald-400',
        run: () => jumpTo('top'),
      },
      {
        id: 'nav-about',
        group: 'Navigation',
        label: 'Background, Education & GitHub Skyline',
        hint: '01 About',
        icon: User,
        accent: 'text-emerald-600 dark:text-emerald-400',
        run: () => jumpTo('#about'),
      },
      {
        id: 'nav-skills',
        group: 'Navigation',
        label: 'Technical Toolkit & Pipeline Stages',
        hint: '02 Toolkit',
        icon: Cpu,
        accent: 'text-blue-600 dark:text-blue-400',
        run: () => jumpTo('#skills'),
      },
      {
        id: 'nav-projects',
        group: 'Navigation',
        label: 'Featured Case Studies & Live Telemetry',
        hint: '03 Work',
        icon: FolderGit2,
        accent: 'text-violet-600 dark:text-violet-400',
        run: () => jumpTo('#projects', 'featured'),
      },
      {
        id: 'nav-rail',
        group: 'Navigation',
        label: 'Interactive 3D Project Clothing Rail',
        hint: '3D Showcase',
        icon: Layers,
        accent: 'text-emerald-600 dark:text-emerald-400',
        run: () => jumpTo('#projects', 'rail'),
      },
      {
        id: 'nav-footer',
        group: 'Navigation',
        label: 'Connect & Interactive Starburst Sign-Off',
        hint: '04 Connect',
        icon: Mail,
        accent: 'text-teal-600 dark:text-teal-400',
        run: () => jumpTo('#footer'),
      },
      {
        id: 'act-copy-email',
        group: 'Actions',
        label: copiedEmail ? `Copied ${personalInfo.email}` : `Copy Email (${personalInfo.email})`,
        hint: 'Clipboard',
        icon: copiedEmail ? Check : Copy,
        accent: 'text-emerald-600 dark:text-emerald-400',
        run: copyEmail,
      },
      {
        id: 'act-theme',
        group: 'Actions',
        label: isDark ? 'Switch to Light Paper Theme' : 'Switch to Dark Studio Theme',
        hint: 'Theme',
        icon: isDark ? Sun : Moon,
        accent: 'text-amber-600 dark:text-amber-300',
        run: () => {
          toggleTheme()
          onClose()
        },
      },
      {
        id: 'act-resume-view',
        group: 'Resume & Links',
        label: 'Preview Resume (Google Drive)',
        hint: 'External',
        icon: FileText,
        accent: 'text-violet-600 dark:text-violet-400',
        external: true,
        run: () => {
          window.open(personalInfo.resume, '_blank', 'noopener,noreferrer')
          onClose()
        },
      },
      {
        id: 'act-resume-dl',
        group: 'Resume & Links',
        label: 'Download Resume PDF Directly',
        hint: 'PDF',
        icon: FileDown,
        accent: 'text-emerald-600 dark:text-emerald-400',
        run: () => {
          const a = document.createElement('a')
          a.href = '/Tanish_Jaswal_Data_Analyst_Resume.pdf'
          a.download = 'Tanish_Jaswal_Data_Analyst_Resume.pdf'
          a.click()
          onClose()
        },
      },
      {
        id: 'act-github',
        group: 'Resume & Links',
        label: 'Open GitHub Profile (@WARRIORXR)',
        hint: 'GitHub',
        icon: Github,
        accent: 'text-[#0e1422] dark:text-white',
        external: true,
        run: () => {
          window.open(personalInfo.github, '_blank', 'noopener,noreferrer')
          onClose()
        },
      },
      {
        id: 'act-linkedin',
        group: 'Resume & Links',
        label: 'Connect on LinkedIn',
        hint: 'LinkedIn',
        icon: Linkedin,
        accent: 'text-blue-600 dark:text-blue-400',
        external: true,
        run: () => {
          window.open(personalInfo.linkedin, '_blank', 'noopener,noreferrer')
          onClose()
        },
      },
      {
        id: 'act-gmail',
        group: 'Resume & Links',
        label: 'Compose Email via Gmail',
        hint: 'Mail',
        icon: Mail,
        accent: 'text-blue-600 dark:text-blue-400',
        external: true,
        run: () => {
          window.open(gmailComposeUrl(), '_blank', 'noopener,noreferrer')
          onClose()
        },
      },
      {
        id: 'act-whatsapp',
        group: 'Resume & Links',
        label: 'Message on WhatsApp',
        hint: 'Chat',
        icon: Whatsapp,
        accent: 'text-emerald-600 dark:text-emerald-400',
        external: true,
        run: () => {
          window.open(whatsappUrl(), '_blank', 'noopener,noreferrer')
          onClose()
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [copiedEmail, isDark]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return actions
    return actions.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.group.toLowerCase().includes(q) ||
        a.hint.toLowerCase().includes(q)
    )
  }, [actions, query])

  useEffect(() => {
    setActiveIndex(0)
  }, [query, open])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => (filtered.length ? (i + 1) % filtered.length : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0))
      } else if (e.key === 'Enter' && filtered[activeIndex]) {
        e.preventDefault()
        filtered[activeIndex].run()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, filtered, activeIndex, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Quick command palette"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0e1422]/30 dark:bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-[#111115] border border-emerald-600/20 dark:border-white/[0.12] shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-black/[0.07] dark:border-white/[0.08]">
              <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to section, copy email, download resume…"
                className="flex-1 bg-transparent text-sm text-[#0e1422] dark:text-white placeholder:text-[#586375]/70 dark:placeholder:text-neutral-500 outline-none"
              />
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#efede7] dark:bg-white/[0.08] text-[#586375] dark:text-neutral-400 border border-black/[0.06] dark:border-white/[0.08]">
                ESC
              </kbd>
            </div>

            {/* Action List */}
            <div className="max-h-[360px] overflow-y-auto p-2 space-y-0.5">
              {filtered.length === 0 ? (
                <div className="py-10 text-center text-xs font-mono text-[#586375] dark:text-neutral-400">
                  No matching commands for &ldquo;{query}&rdquo;
                </div>
              ) : (
                filtered.map((item, idx) => {
                  const Icon = item.icon
                  const isActive = idx === activeIndex
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={item.run}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left text-xs transition-colors ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500/12 via-teal-500/8 to-sky-500/8 text-[#0e1422] dark:text-white'
                          : 'text-[#586375] dark:text-neutral-300 hover:bg-[#faf9f6] dark:hover:bg-white/[0.03]'
                      }`}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <span className="p-1.5 rounded-lg bg-[#faf9f6] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] shrink-0">
                          <Icon className={`w-3.5 h-3.5 ${item.accent}`} />
                        </span>
                        <span className="font-medium truncate">{item.label}</span>
                      </span>

                      <span className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-[10px] text-[#586375] dark:text-neutral-400">
                          {item.hint}
                        </span>
                        {item.external ? (
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                        ) : (
                          isActive && <CornerDownLeft className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </span>
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer Hints */}
            <div className="px-4 py-2.5 border-t border-black/[0.06] dark:border-white/[0.08] bg-[#faf9f6] dark:bg-[#15151a] flex items-center justify-between text-[10px] font-mono text-[#586375] dark:text-neutral-400">
              <span>↑↓ Navigate · ↵ Run</span>
              <span>Ctrl / ⌘ + K</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
