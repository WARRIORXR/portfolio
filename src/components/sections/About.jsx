import { lazy, Suspense } from 'react'
import { Mail, MapPin, Phone, ArrowUpRight, FileText, GraduationCap, Briefcase } from 'lucide-react'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'
import { SectionWrapper, SectionItem, SectionTitle } from '../shared/SectionWrapper'
import ErrorBoundary from '../shared/ErrorBoundary'
import { personalInfo, education, experience, stats } from '../../data/personalInfo'
import useGithubContributions from '../../hooks/useGithubContributions'
import { gmailComposeUrl, whatsappUrl } from '../../lib/links'

const ContributionSkyline = lazy(() => import('../ui/contribution-skyline'))

const STAT_ACCENTS = [
  { bar: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
  { bar: 'bg-teal-500', text: 'text-teal-700 dark:text-teal-400' },
  { bar: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-400' },
  { bar: 'bg-violet-500', text: 'text-violet-700 dark:text-violet-400' },
]

function StatCell({ value, suffix, label, index }) {
  const { ref, inView } = useInView({ triggerOnce: true })
  const style = STAT_ACCENTS[index % STAT_ACCENTS.length]

  return (
    <div ref={ref} className="relative bg-white dark:bg-[#111115] p-5 flex flex-col justify-between">
      <span className={`absolute top-0 inset-x-0 h-[2px] ${style.bar}`} aria-hidden="true" />
      <div className={`text-2xl sm:text-3xl font-bold tracking-tight tabular-nums ${style.text}`}>
        {inView ? <CountUp end={value} duration={1.2} suffix={suffix} /> : `0${suffix}`}
      </div>
      <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-[#586375] dark:text-neutral-400">
        {label}
      </div>
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
        title="Analytical depth meets"
        italicWord="execution."
        subtitle="Bridging Computer Science theory with real-world data pipelines, dashboards, and machine learning."
        accent="emerald"
      />

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Narrative, Metrics Strip & Contact Ledger */}
        <div className="lg:col-span-7 space-y-7">
          <SectionItem>
            <div className="relative pl-5 sm:pl-6 space-y-2.5">
              <span
                aria-hidden="true"
                className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-gradient-to-b from-emerald-500 via-teal-500 to-blue-500"
              />
              <div className="mono-label text-[10px] text-emerald-700 dark:text-emerald-400">
                Personal Narrative
              </div>
              <p className="text-base sm:text-lg leading-[1.7] text-[#283040] dark:text-neutral-200 font-normal">
                {personalInfo.bio}
              </p>
            </div>
          </SectionItem>

          <SectionItem>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-black/[0.08] dark:bg-white/[0.09] border border-black/[0.08] dark:border-white/[0.09] rounded-2xl overflow-hidden shadow-sm">
              {stats.map((s, idx) => (
                <StatCell key={s.label} value={s.value} suffix={s.suffix} label={s.label} index={idx} />
              ))}
            </div>
          </SectionItem>

          <SectionItem>
            <div className="paper-surface rounded-2xl px-5 divide-y divide-black/[0.06] dark:divide-white/[0.08]">
              <a
                href={gmailComposeUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between py-3.5 text-sm"
              >
                <span className="flex items-center gap-3 text-[#586375] dark:text-neutral-400 group-hover:text-[#0e1422] dark:group-hover:text-white transition-colors">
                  <span className="inline-flex p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  Email
                </span>
                <span className="flex items-center gap-1.5 font-mono text-xs sm:text-sm text-[#0e1422] dark:text-neutral-200">
                  {personalInfo.email}
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </span>
              </a>

              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between py-3.5 text-sm"
              >
                <span className="flex items-center gap-3 text-[#586375] dark:text-neutral-400 group-hover:text-[#0e1422] dark:group-hover:text-white transition-colors">
                  <span className="inline-flex p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  WhatsApp
                </span>
                <span className="flex items-center gap-1.5 font-mono text-xs sm:text-sm text-[#0e1422] dark:text-neutral-200">
                  {personalInfo.phone}
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </span>
              </a>

              <div className="flex items-center justify-between py-3.5 text-sm">
                <span className="flex items-center gap-3 text-[#586375] dark:text-neutral-400">
                  <span className="inline-flex p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <MapPin className="w-3.5 h-3.5" />
                  </span>
                  Location
                </span>
                <span className="font-mono text-xs sm:text-sm text-[#0e1422] dark:text-neutral-200">
                  {personalInfo.location}
                </span>
              </div>

              <a
                href={personalInfo.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between py-3.5 text-sm font-medium text-violet-700 dark:text-violet-400"
              >
                <span className="flex items-center gap-3">
                  <span className="inline-flex p-1.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <FileText className="w-3.5 h-3.5" />
                  </span>
                  Curriculum Vitae
                </span>
                <span className="flex items-center gap-1.5 font-mono text-xs">
                  View Resume PDF
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </a>
            </div>
          </SectionItem>
        </div>

        {/* Credentials: Education & Experience */}
        <div className="lg:col-span-5 space-y-6">
          <SectionItem>
            <div className="paper-surface rounded-2xl overflow-hidden">
              <div className="px-6 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08] bg-gradient-to-r from-blue-50/85 via-sky-50/45 to-transparent dark:from-blue-500/10 dark:to-transparent flex items-center justify-between">
                <span className="inline-flex items-center gap-2 mono-label text-[10px] text-blue-800 dark:text-blue-300 font-semibold">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Education
                </span>
                <span className="text-[11px] font-mono text-blue-700 dark:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                  2023 &ndash; 2027
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-[#0e1422] dark:text-white">
                    {education.degree}
                  </h3>
                  <p className="text-sm text-[#586375] dark:text-neutral-300">
                    {education.field} &middot; {education.institution}
                  </p>
                  <p className="text-xs font-mono text-[#586375] dark:text-neutral-400 pt-0.5">
                    {education.location} &middot; Class of {education.expectedGraduation}
                  </p>
                </div>

                <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
                  <div className="text-[10px] font-mono text-[#586375] dark:text-neutral-400 uppercase tracking-wider mb-2.5">
                    Core Coursework
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {education.coursework.map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center rounded-md border border-blue-500/15 dark:border-blue-400/20 bg-blue-50/50 dark:bg-blue-500/10 px-2.5 py-1 text-xs text-[#0e1422] dark:text-blue-100"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SectionItem>

          <SectionItem>
            <div className="paper-surface rounded-2xl overflow-hidden">
              <div className="px-6 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08] bg-gradient-to-r from-violet-50/85 via-indigo-50/45 to-transparent dark:from-violet-500/10 dark:to-transparent flex items-center justify-between">
                <span className="inline-flex items-center gap-2 mono-label text-[10px] text-violet-800 dark:text-violet-300 font-semibold">
                  <Briefcase className="w-3.5 h-3.5" />
                  Experience
                </span>
                <span className="text-[11px] font-mono text-violet-700 dark:text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full">
                  Internship
                </span>
              </div>

              <div className="p-6">
                {experience.map((job) => (
                  <div key={job.company} className="space-y-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-base font-semibold text-[#0e1422] dark:text-white">
                        {job.role}
                      </h3>
                      <span className="text-xs font-mono text-violet-700 dark:text-violet-300 shrink-0">
                        {job.period}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-[#586375] dark:text-neutral-400">
                      {job.company} &middot; {job.location}
                    </div>
                    <ul className="space-y-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
                      {job.description.map((line) => (
                        <li
                          key={line}
                          className="flex items-start gap-2.5 text-xs leading-relaxed text-[#586375] dark:text-neutral-300"
                        >
                          <span className="font-mono text-violet-600 dark:text-violet-400 mt-0.5">&rarr;</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </SectionItem>
        </div>
      </div>

      {/* GitHub Contribution Skyline */}
      <SectionItem className="mt-14">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="mono-label text-[11px] text-[#586375] dark:text-neutral-400 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Contribution Activity &middot; @{personalInfo.githubUsername}
          </h3>
          <span className="hidden sm:inline font-mono text-[10px] text-emerald-700 dark:text-emerald-400">
            Interactive 2D / 3D Isometric Skyline
          </span>
        </div>
        <Suspense
          fallback={<div className="h-44 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-[#efede7] dark:bg-[#111115] animate-pulse" />}
        >
          <ErrorBoundary
            fallback={
              <div className="h-40 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-[#efede7] dark:bg-[#111115]" aria-hidden />
            }
          >
            <ContributionSkyline
              data={contributions}
              className="rounded-2xl border border-emerald-600/15 dark:border-emerald-400/20 bg-white dark:bg-[#111115] shadow-sm"
            />
          </ErrorBoundary>
        </Suspense>
      </SectionItem>
    </SectionWrapper>
  )
}
