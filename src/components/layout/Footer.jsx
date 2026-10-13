import { ArrowUp } from 'lucide-react'
import { contactLinks } from '../../lib/links'

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

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {contactLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              aria-label={link.label}
              className="link-underline text-xs text-white/50 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
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
