import { ArrowUp } from 'lucide-react'
import StarburstThanksFooter from '../ui/starburst-thanks-footer'
import { personalInfo } from '../../data/personalInfo'
import { useTheme } from '../../context/ThemeContext'
import { whatsappUrl } from '../../lib/links'

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
    <footer className="relative border-t border-slate-200/80 dark:border-white/[0.08]">
      <StarburstThanksFooter
        name={personalInfo.name}
        thanks={['Thank you', 'Dhanyawad', 'Shukriya', 'Merci', 'Gracias', 'Arigato', 'Danke']}
        tagline="for stopping by"
        signoff="Turning raw data into decisive impact • Class of '27"
        links={links}
        email={personalInfo.email}
        phone={personalInfo.phone}
        height="auto"
        background={isDark ? '#000000' : '#fafafa'}
        ink={isDark ? '#ffffff' : '#0f172a'}
        accent={isDark ? '#34d399' : '#059669'}
        grain={isDark ? 0.12 : 0.03}
        starPoints={10}
        className="pt-12 pb-8"
      />

      <div className="border-t border-slate-200/60 dark:border-white/[0.06] px-6 py-6 bg-slate-50/50 dark:bg-black/60">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-white/40">
          <div>
            &copy; {year} {personalInfo.name} &middot; Designed for clarity &amp; performance. Deployed on Cloudflare.
          </div>

          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-700 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors border border-slate-200 dark:border-white/10 rounded-full px-3 py-1 bg-white hover:bg-slate-100 dark:bg-white/[0.04] shadow-xs"
          >
            <span>Top</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>
      </div>
    </footer>
  )
}
