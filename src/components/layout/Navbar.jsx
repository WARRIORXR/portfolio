import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { personalInfo } from '../../data/personalInfo'

const navLinks = [
  { label: 'About', href: '#about', index: '01' },
  { label: 'Skills', href: '#skills', index: '02' },
  { label: 'Projects', href: '#projects', index: '03' },
  { label: 'Contact', href: '#contact', index: '04' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      const sections = ['contact', 'projects', 'skills', 'about']
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
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          scrolled ? 'bg-black/70 backdrop-blur-md border-b border-white/[0.08]' : 'bg-transparent border-b border-transparent'
        }`}
      >
        <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-sm font-medium tracking-tight text-white"
          >
            Tanish Jaswal
          </button>

          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className={`link-underline text-[13px] transition-colors ${
                  active === link.href.slice(1) ? 'text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
            <a
              href={personalInfo.resume}
              download
              className="ml-1 inline-flex items-center gap-1 rounded-full border border-white/15 px-3.5 py-1.5 text-[12px] text-white/80 transition-colors hover:border-white/40 hover:text-white"
            >
              Resume
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
              <a
                href={personalInfo.resume}
                download
                className="flex items-center justify-between py-3.5 text-sm text-white/80"
              >
                <span>
                  <span className="font-mono text-[10px] text-white/30 mr-3">CV</span>
                  Resume
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/30" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
