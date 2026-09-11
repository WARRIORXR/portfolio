import { Mail, ArrowUp } from 'lucide-react'
import { Github, Linkedin } from '../ui/BrandIcons'
import { personalInfo } from '../../data/personalInfo'

export default function Footer() {
  const year = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative py-16 px-4 sm:px-6 md:px-8 border-t border-white/10 bg-black text-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Identity & Coordinates */}
        <div className="text-center md:text-left space-y-1">
          <div className="text-xs font-mono font-bold tracking-widest uppercase text-white">
            TANISH JASWAL // PORTFOLIO
          </div>
          <div className="text-[10px] font-mono tracking-wider text-white/40 uppercase">
            AI/ML &middot; PYTHON &middot; CS STUDENT &middot; PUNJAB, INDIA (31.32° N, 75.57° E)
          </div>
        </div>

        {/* Social Interfaces */}
        <div className="flex items-center gap-3">
          {[
            { icon: Github, href: personalInfo.github, label: 'GitHub' },
            { icon: Linkedin, href: personalInfo.linkedin, label: 'LinkedIn' },
            { icon: Mail, href: `mailto:${personalInfo.email}`, label: 'Email' },
          ].map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="w-9 h-9 rounded border border-white/10 bg-white/[0.02] flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 hover:bg-white/[0.06] transition-all"
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}

          {/* Return to top */}
          <button
            onClick={scrollToTop}
            title="Return to Orbit"
            className="w-9 h-9 rounded border border-white/10 bg-white/[0.02] flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 hover:bg-white/[0.06] transition-all ml-2"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        {/* Meta / System Status */}
        <div className="text-center md:text-right space-y-1">
          <div className="text-[10px] font-mono tracking-widest text-white/30 uppercase">
            &copy; {year} TANISH JASWAL &middot; HORIZON ARCHITECTURE
          </div>
          <div className="text-[9px] font-mono tracking-wider text-emerald-400/70">
            SYSTEM STATUS: OPERATIONAL
          </div>
        </div>
      </div>
    </footer>
  )
}
