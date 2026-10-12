import { Mail, ArrowUp } from 'lucide-react'
import { Github, Linkedin } from '../ui/BrandIcons'
import { personalInfo } from '../../data/personalInfo'

export default function Footer() {
  const year = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="border-t border-white/[0.08] px-6 py-12">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <div className="text-sm font-medium tracking-tight text-white">Tanish Jaswal</div>
          <div className="mt-1 text-xs text-white/40">
            &copy; {year} &middot; Punjab, India
          </div>
        </div>

        <div className="flex items-center gap-5">
          <a
            href={personalInfo.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="link-underline text-xs text-white/50 hover:text-white transition-colors"
          >
            GitHub
          </a>
          <a
            href={personalInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="link-underline text-xs text-white/50 hover:text-white transition-colors"
          >
            LinkedIn
          </a>
          <a
            href={`mailto:${personalInfo.email}`}
            aria-label="Email"
            className="link-underline text-xs text-white/50 hover:text-white transition-colors"
          >
            Email
          </a>
          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="ml-2 p-1.5 text-white/40 hover:text-white transition-colors"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  )
}
