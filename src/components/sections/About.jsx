import { lazy, Suspense } from 'react'
import { Mail, MapPin, Phone, ArrowUpRight, FileText } from 'lucide-react'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'
import { SectionWrapper, SectionItem, SectionTitle } from '../shared/SectionWrapper'
import ErrorBoundary from '../shared/ErrorBoundary'
import { personalInfo, education, experience, stats } from '../../data/personalInfo'
import useGithubContributions from '../../hooks/useGithubContributions'
import { gmailComposeUrl, whatsappUrl } from '../../lib/links'

const ContributionSkyline = lazy(() => import('../ui/contribution-skyline'))

function Stat({ value, suffix, label }) {
  const { ref, inView } = useInView({ triggerOnce: true })
  return (
    <div
      ref={ref}
      className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between"
    >
      <div className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white tabular-nums">
        {inView ? <CountUp end={value} duration={1.6} suffix={suffix} /> : `0${suffix}`}
      </div>
      <div className="mt-2 text-xs text-neutral-500 dark:text-white/50 font-medium">{label}</div>
    </div>
  )
}

export default function About() {
  const contributions = useGithubContributions(personalInfo.githubUsername)

  return (
    <SectionWrapper id="about">
      <SectionTitle
        index="01"
        label="Background"
        title="Turning data into decisions."
        subtitle="Bridging Computer Science theory and real-world analytical systems."
      />

      <div className="grid gap-10 md:grid-cols-5 md:gap-12">
        {/* Bio + contact rows */}
        <div className="md:col-span-3 space-y-8">
          <SectionItem>
            <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="mono-label text-[10px] text-emerald-600 dark:text-emerald-400">Personal Narrative</span>
              </div>
              <p className="text-base sm:text-lg leading-relaxed text-neutral-700 dark:text-white/80">
                {personalInfo.bio}
              </p>
            </div>
          </SectionItem>

          <SectionItem>
            <div className="glass-card rounded-2xl p-5 divide-y divide-slate-100 dark:divide-white/[0.08]">
              <a
                href={gmailComposeUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between py-3 text-sm"
              >
                <span className="flex items-center gap-3 text-neutral-500 dark:text-white/50 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                  <Mail className="w-4 h-4 text-neutral-400 dark:text-white/40" /> Email
                </span>
                <span className="flex items-center gap-1.5 text-neutral-800 dark:text-white/80 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                  {personalInfo.email}
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </a>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between py-3 text-sm"
              >
                <span className="flex items-center gap-3 text-neutral-500 dark:text-white/50 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-neutral-400 dark:text-white/40" /> WhatsApp
                </span>
                <span className="flex items-center gap-1.5 text-neutral-800 dark:text-white/80 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                  {personalInfo.phone}
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </a>
              <div className="flex items-center justify-between py-3 text-sm">
                <span className="flex items-center gap-3 text-neutral-500 dark:text-white/50">
                  <MapPin className="w-4 h-4 text-neutral-400 dark:text-white/40" /> Location
                </span>
                <span className="text-neutral-800 dark:text-white/80">{personalInfo.location}</span>
              </div>
              <a
                href={personalInfo.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <FileText className="w-4 h-4" /> Resume PDF
                </span>
                <span className="flex items-center gap-1.5">
                  View Data Analyst Resume
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </a>
            </div>
          </SectionItem>

          <SectionItem>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((s) => (
                <Stat key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
              ))}
            </div>
          </SectionItem>
        </div>

        {/* Education + experience */}
        <div className="md:col-span-2 space-y-6">
          <SectionItem>
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="mono-label text-[10px]">Education</h3>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full">
                  2023 &ndash; 2027
                </span>
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="text-base font-semibold text-neutral-900 dark:text-white">{education.degree}</div>
                <div className="text-sm text-neutral-600 dark:text-white/60">
                  {education.field} &middot; {education.institution}
                </div>
                <div className="text-xs text-neutral-400 dark:text-white/40">
                  {education.location} &middot; Class of {education.expectedGraduation}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.08]">
                <div className="text-[11px] text-neutral-500 dark:text-white/40 font-mono mb-2 uppercase">Key Coursework</div>
                <div className="flex flex-wrap gap-1.5">
                  {education.coursework.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center rounded-md border border-slate-200/80 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] px-2 py-0.5 text-xs text-neutral-700 dark:text-white/60"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </SectionItem>

          <SectionItem>
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="mono-label text-[10px]">Work Experience</h3>
                <span className="text-[11px] font-mono text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 px-2 py-0.5 rounded-full">
                  Internship
                </span>
              </div>
              {experience.map((job) => (
                <div key={job.company} className="space-y-2 pt-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-base font-semibold text-neutral-900 dark:text-white">
                      {job.role}
                    </div>
                    <div className="text-xs font-mono text-neutral-400 dark:text-white/40 shrink-0">{job.period}</div>
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-white/50">
                    {job.company} &middot; {job.location}
                  </div>
                  <ul className="space-y-1.5 pt-2 text-xs leading-relaxed text-neutral-600 dark:text-white/65 list-disc list-inside">
                    {job.description.map((line) => (
                      <li key={line} className="text-neutral-600 dark:text-white/60">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </SectionItem>
        </div>
      </div>

      {/* GitHub activity — contribution skyline (2D heat map ↔ 3D isometric) */}
      <SectionItem className="mt-16">
        <h3 className="mono-label mb-5 text-neutral-500 dark:text-white/40">GitHub Activity</h3>
        <Suspense
          fallback={<div className="h-40 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-neutral-100 dark:bg-black" />}
        >
          <ErrorBoundary
            fallback={
              <div className="h-40 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-neutral-100 dark:bg-black" aria-hidden />
            }
          >
            <ContributionSkyline data={contributions} className="border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-black/50" />
          </ErrorBoundary>
        </Suspense>
      </SectionItem>
    </SectionWrapper>
  )
}
