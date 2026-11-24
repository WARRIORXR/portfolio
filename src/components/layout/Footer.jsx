import { ArrowUp } from 'lucide-react'
import { contactLinks } from '../../lib/links'

export default function Footer() {
  const year = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="border-t border-slate-200/80 dark:border-white/[0.08] px-6 py-14 bg-white dark:bg-black/40">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left space-y-1">
          <div className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
            <span>Tanish Jaswal</span>
            <span className="text-neutral-300 dark:text-white/20">&middot;</span>
            <span className="text-xs text-neutral-600 dark:text-white/50 font-normal">Data Analyst &amp; AI/ML</span>
          </div>
          <div className="text-xs text-neutral-500 dark:text-white/40">
            &copy; {year} &middot; Designed for simplicity, performance, and clarity. Deployed on Cloudflare.
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {contactLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              aria-label={link.label}
              className="text-xs text-neutral-600 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="ml-2 inline-flex items-center gap-1 text-xs text-neutral-700 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors border border-slate-200 dark:border-white/10 rounded-full px-2.5 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-transparent shadow-xs"
          >
            <span>Top</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>
      </div>
    </footer>
  )
}
