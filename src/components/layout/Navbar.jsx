import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowUpRight, Mail, FileText } from 'lucide-react'
import { Github, Linkedin, Whatsapp } from '../ui/BrandIcons'
import { contactLinks } from '../../lib/links'

const navLinks = [
  { label: 'About', href: '#about', index: '01' },
  { label: 'Skills', href: '#skills', index: '02' },
  { label: 'Projects', href: '#projects', index: '03' },
  { label: 'Contact', href: '#contact', index: '04' },
]

// Icon per link id; the pills stay compact so the top bar never wraps.
// Every contactLinks id must appear here — the mobile menu renders an icon for
// each of them, and a missing entry throws during render.
const linkIcons = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
  whatsapp: Whatsapp,
  resume: FileText,
}

// Only links with an icon become pills; Resume keeps its labelled pill.
const iconLinks = contactLinks.filter((link) => link.id !== 'resume' && linkIcons[link.id])
const resumeLink = contactLinks.find((link) => link.id === 'resume')

const pillClass =
  'inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/70 transition-all hover:border-white/40 hover:text-white hover:scale-105 active:scale-95'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30)
      const sections = ['contact', 'projects', 'skills', 'about']
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 240) {
          setActive(id)
          break
        }
      }
    }
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
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-3 pb-2 transition-all duration-300 pointer-events-none"
      >
        <nav
          className={`max-w-4xl mx-auto h-13 px-4 sm:px-5 flex items-center justify-between gap-4 rounded-full transition-all duration-300 pointer-events-auto ${
            scrolled
              ? 'bg-black/75 backdrop-blur-xl border border-white/[0.12] shadow-2xl shadow-black/80'
              : 'bg-black/40 backdrop-blur-md border border-white/[0.08]'
          }`}
        >
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white hover:opacity-80 transition-opacity"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Tanish Jaswal</span>
          </button>

          <div className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/[0.05]">
            {navLinks.map((link) => {
              const isActive = active === link.href.slice(1)
              return (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  className={`relative px-3.5 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-white/[0.1] shadow-sm'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {link.label}
                </button>
              )
            })}
          </div>

          {/* Socials & Resume */}
          <div className="hidden md:flex items-center gap-2">
            {iconLinks.map((link) => {
              const Icon = linkIcons[link.id]
              return (
                <a
                  key={link.id}
                  href={link.href}
                  {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  aria-label={link.label}
                  title={link.label}
                  className={pillClass}
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              )
            })}
            <a
              href={resumeLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.05] px-3.5 py-1.5 text-xs font-medium text-white transition-all hover:bg-white hover:text-black hover:border-white hover:scale-105 active:scale-95"
            >
              <span>Resume</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-1.5 text-white/80 hover:text-white"
            aria-label="Toggle navigation"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 bg-black/95 backdrop-blur-md border-b border-white/[0.08] md:hidden"
          >
            <div className="px-6 py-4 flex flex-col">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  className="flex items-center justify-between py-3.5 border-b border-white/[0.06] text-left"
                >
                  <span className="text-sm text-white/80">
                    <span className="font-mono text-[10px] text-white/30 mr-3">{link.index}</span>
                    {link.label}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/30" />
                </button>
              ))}

              {contactLinks.map((link) => {
                const Icon = linkIcons[link.id]
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="flex items-center justify-between py-3.5 border-b border-white/[0.06] text-left last:border-b-0"
                  >
                    <span className="flex items-center gap-3 text-sm text-white/80">
                      <Icon className="w-4 h-4 text-white/40" />
                      {link.label}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-white/30" />
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
