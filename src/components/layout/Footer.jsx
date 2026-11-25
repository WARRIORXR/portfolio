import { lazy, Suspense } from 'react'
import { ArrowUp } from 'lucide-react'
import { personalInfo } from '../../data/personalInfo'
import { useTheme } from '../../context/ThemeContext'
import { whatsappUrl } from '../../lib/links'
import ErrorBoundary from '../shared/ErrorBoundary'

const StarburstThanksFooter = lazy(() => import('../ui/starburst-thanks-footer'))

export default function Footer() {
  const year = new Date().getFullYear()
  const { isDark } = useTheme()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const links = [
    { caption: 'Explore repositories', label: 'github.com/WARRIORXR', href: personalInfo.github },
    { caption: "Let's connect", label: 'linkedin.com/in/tanish-jaswal', href: personalInfo.linkedin },
    { caption: 'Quick chat', label: 'WhatsApp direct', href: whatsappUrl() },
  ]

  return (
    <footer id="footer" className="relative border-t border-emerald-600/15 dark:border-emerald-400/15 scroll-mt-16">
      <ErrorBoundary fallback={<div className="h-24" />}>
        <Suspense
          fallback={
            <div className="h-64 flex items-center justify-center animate-pulse text-xs font-mono text-[#586375] dark:text-neutral-400 bg-[#f4f1ea] dark:bg-[#09090b]">
              Loading sign-off…
            </div>
          }
        >
          <StarburstThanksFooter
            name={personalInfo.name}
            thanks={['Thank you', 'Dhanyawad', 'Shukriya', 'Merci', 'Gracias', 'Arigato', 'Danke']}
            tagline="for stopping by"
            signoff="Turning raw telemetry into decisive intelligence · Class of '27"
            links={links}
            email={personalInfo.email}
            phone={personalInfo.phone}
            height="auto"
            background={isDark ? '#0b0c10' : '#f3f1ea'}
            ink={isDark ? '#f4f4f5' : '#0e1422'}
            accent={isDark ? '#34d399' : '#059669'}
            grain={isDark ? 0.1 : 0.025}
            starPoints={10}
            className="stf-editorial pt-12 pb-8"
          />
        </Suspense>
      </ErrorBoundary>

      <div className="border-t border-black/[0.08] dark:border-white/[0.09] px-6 py-6 bg-[#ebe8df] dark:bg-[#09090b]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#586375] dark:text-neutral-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            <span>
              &copy; {year} {personalInfo.name} &middot; Designed for precision &amp; clarity. Deployed on Cloudflare.
            </span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="inline-flex items-center gap-1.5 text-xs text-[#0e1422] dark:text-neutral-200 hover:border-emerald-600/40 dark:hover:border-emerald-400/50 transition-colors border border-black/[0.12] dark:border-white/[0.14] rounded-full px-3.5 py-1.5 bg-white dark:bg-[#141418] shadow-sm"
          >
            <span>Top</span>
            <ArrowUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          </button>
        </div>
      </div>
    </footer>
  )
}
