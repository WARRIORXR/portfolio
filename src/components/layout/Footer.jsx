import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa'
import { personalInfo } from '../../data/personalInfo'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative py-12 px-4 border-t border-white/10">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.8), transparent)' }}
      />
      <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="text-white font-bold text-lg mb-1">Tanish Jaswal</p>
          <p className="text-white/40 text-sm">AI/ML & Computer Science Student · Punjab, India</p>
        </div>

        <div className="flex items-center gap-4">
          {[
            { icon: FaGithub, href: personalInfo.github, label: 'GitHub' },
            { icon: FaLinkedin, href: personalInfo.linkedin, label: 'LinkedIn' },
            { icon: FaEnvelope, href: `mailto:${personalInfo.email}`, label: 'Email' },
          ].map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center
                text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>

        <p className="text-white/30 text-sm text-center">
          © {year} Tanish Jaswal · Built with React + Framer Motion
        </p>
      </div>
    </footer>
  )
}
