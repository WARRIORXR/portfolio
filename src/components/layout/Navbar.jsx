import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, FileText, ArrowUpRight, Terminal } from 'lucide-react'
import GlassButton from '../ui/GlassButton'
import { personalInfo } from '../../data/personalInfo'

const navLinks = [
  { label: 'HORIZON', href: '#hero', index: '00' },
  { label: 'ABOUT', href: '#about', index: '01' },
  { label: 'SKILLS', href: '#skills', index: '02' },
  { label: 'PROJECTS', href: '#projects', index: '03' },
  { label: 'CONTACT', href: '#contact', index: '04' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('hero')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      const sections = ['contact', 'projects', 'skills', 'about', 'hero']
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 200) {
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
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-black/80 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo / Identifier */}
          <button
            onClick={() => scrollTo('#hero')}
            className="flex items-center gap-3 group text-left"
          >
            <div className="w-8 h-8 rounded border border-white/20 bg-white/[0.04] flex items-center justify-center font-mono text-xs font-bold text-white group-hover:border-white/60 transition-colors">
              <Terminal className="w-4 h-4 text-white/80" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs tracking-[0.25em] font-mono font-bold text-white uppercase group-hover:text-white/90">
                TANISH JASWAL
              </span>
              <span className="text-[9px] tracking-[0.2em] font-mono text-white/40 uppercase">
                AI/ML &middot; CS
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => {
              const isActive = active === link.href.slice(1)
              return (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  className={`group relative py-1 text-[11px] font-mono tracking-[0.2em] transition-colors ${
                    isActive ? 'text-white font-semibold' : 'text-white/50 hover:text-white'
                  }`}
                >
                  <span className="text-[9px] text-white/30 mr-1.5">{link.index}</span>
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-[1px] bg-white shadow-[0_0_8px_#fff]"
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Action CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <GlassButton
              href={personalInfo.resume}
              download
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
              icon={<FileText className="w-3.5 h-3.5" />}
            >
              CV / RESUME
            </GlassButton>

            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded border border-white/10 bg-white/[0.03] text-white/80 hover:text-white"
              aria-label="Toggle navigation"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 bg-black/95 backdrop-blur-3xl border-b border-white/10 p-6 md:hidden flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  className="flex items-center justify-between p-3 rounded border border-white/[0.05] bg-white/[0.02] text-left text-xs font-mono tracking-widest text-white/80 hover:text-white hover:bg-white/[0.06]"
                >
                  <span>
                    <span className="text-white/30 mr-2">{link.index}</span>
                    {link.label}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/40" />
                </button>
              ))}
            </div>

            <GlassButton
              href={personalInfo.resume}
              download
              variant="primary"
              size="md"
              className="w-full mt-2"
              icon={<FileText className="w-4 h-4" />}
            >
              DOWNLOAD RESUME
            </GlassButton>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
