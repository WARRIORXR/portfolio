import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowUpRight, Mail, FileText, Sun, Moon } from 'lucide-react'
import { Github, Linkedin, Whatsapp } from '../ui/BrandIcons'
import { contactLinks } from '../../lib/links'
import { personalInfo } from '../../data/personalInfo'
import { useTheme } from '../../context/ThemeContext'

const navLinks = [
  { label: 'About', href: '#about', index: '01', dot: 'bg-emerald-500' },
  { label: 'Toolkit', href: '#skills', index: '02', dot: 'bg-blue-500' },
  { label: 'Work', href: '#projects', index: '03', dot: 'bg-violet-500' },
  { label: 'Connect', href: '#footer', index: '04', dot: 'bg-teal-500' },
]

const linkIcons = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
  whatsapp: Whatsapp,
  resume: FileText,
}

const iconLinks = contactLinks.filter((link) => (link.id === 'github' || link.id === 'linkedin') && linkIcons[link.id])
const resumeLink = contactLinks.find((link) => link.id === 'resume')

const pillClass =
  'inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.09] dark:border-white/15 text-[#0e1422] dark:text-neutral-300 transition-all hover:border-emerald-600/40 dark:hover:border-emerald-400/50 hover:text-emerald-700 dark:hover:text-emerald-300 active:scale-95 bg-white dark:bg-[#141418]'

export default function Navbar() {
  const { toggleTheme, isDark } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24)
      if (window.scrollY < 160) {
        setActive('')
        return
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 120) {
        setActive('footer')
        return
      }
      const sections = ['footer', 'projects', 'skills', 'about']
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 240) {
          setActive(id)
          break
        }
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (href) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setOpen(false)
  }

  return (
    <>
      <motion.header
        initial={{ y: -48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-3.5 pb-2 pointer-events-none"
      >
        <nav
          aria-label="Primary"
          className={`max-w-5xl mx-auto h-12 px-3 sm:px-4 flex items-center justify-between gap-4 rounded-full transition-all duration-300 pointer-events-auto ${
            scrolled
              ? 'bg-[#faf9f6]/92 dark:bg-[#09090b]/90 backdrop-blur-xl border border-emerald-600/20 dark:border-emerald-400/20 shadow-md shadow-emerald-950/[0.05] dark:shadow-black/60'
              : 'bg-white/85 dark:bg-[#111115]/80 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.1] shadow-sm'
          }`}
        >
          {/* Color-Bound Monogram */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-[#0e1422] dark:text-white hover:opacity-85 transition-opacity pl-1"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 text-[10px] font-mono font-bold tracking-tight text-white shadow-sm">
              TJ
            </span>
            <span className="hidden xs:inline sm:inline">Tanish Jaswal</span>
          </button>

          {/* Navigation with Sliding Color Pill */}
          <div className="hidden md:flex items-center gap-0.5 bg-[#efede7]/90 dark:bg-white/[0.04] p-1 rounded-full border border-black/[0.05] dark:border-white/[0.07]">
            {navLinks.map((link) => {
              const isActive = active === link.href.slice(1)
              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => scrollTo(link.href)}
                  className={`relative px-3.5 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                    isActive
                      ? 'text-[#0e1422] dark:text-white'
                      : 'text-[#586375] dark:text-neutral-400 hover:text-[#0e1422] dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-white dark:bg-[#1f2027] border border-emerald-500/25 dark:border-emerald-400/25 shadow-sm"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full transition-opacity ${link.dot} ${isActive ? 'opacity-100' : 'opacity-40'}`} />
                    <span className="font-mono text-[10px] opacity-50">{link.index}</span>
                    <span>{link.label}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* Right Controls: Theme + Socials + Gradient CTA */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              className={pillClass}
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[#0e1422]" />
              )}
            </button>

            {iconLinks.map((link) => {
              const Icon = linkIcons[link.id]
              return (
                <a
                  key={link.id}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  title={link.label}
                  className={pillClass}
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              )
            })}

            <a
              href={resumeLink?.href || personalInfo.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#0e1422] to-[#065f46] hover:from-emerald-700 hover:to-teal-700 text-white dark:from-emerald-400 dark:to-teal-300 dark:text-[#09090b] dark:hover:from-emerald-300 dark:hover:to-teal-200 px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 shadow-sm"
            >
              <span>Resume</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={pillClass}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-[#0e1422]" />}
            </button>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className={pillClass}
              aria-label="Toggle navigation"
              aria-expanded={open}
            >
              {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-[72px] z-40 rounded-2xl bg-white/95 dark:bg-[#111115]/95 backdrop-blur-xl border border-emerald-600/20 dark:border-white/[0.12] md:hidden shadow-xl overflow-hidden"
          >
            <div className="px-5 py-2 flex flex-col divide-y divide-black/[0.06] dark:divide-white/[0.07]">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => scrollTo(link.href)}
                  className="flex items-center justify-between py-3.5 text-left"
                >
                  <span className="flex items-center gap-2.5 text-sm font-medium text-[#0e1422] dark:text-white">
                    <span className={`h-2 w-2 rounded-full ${link.dot}`} />
                    <span className="font-mono text-[10px] text-[#586375] dark:text-neutral-500">{link.index}</span>
                    <span>{link.label}</span>
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#586375] dark:text-neutral-500" />
                </button>
              ))}

              {contactLinks.map((link) => {
                const Icon = linkIcons[link.id]
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-3.5 text-left"
                  >
                    <span className="flex items-center gap-3 text-sm text-[#3a3a37] dark:text-neutral-300">
                      <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      {link.label}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#586375] dark:text-neutral-500" />
                  </a>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
