import { lazy, Suspense, useState } from 'react'
import { Mail, MapPin, Phone, ArrowUpRight, FileText, GraduationCap, Briefcase, Copy, Check, Award, FileDown } from 'lucide-react'
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

const MILESTONES = [
  {
    title: 'Environmental Hacks IRL Winner',
    detail: '1st Place · School AQI Alert AWS Serverless Pipeline',
    badge: 'Hackathon',
    color: 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300',
  },
  {
    title: 'AI/ML Internship — Netmax',
    detail: 'Completed 6-week Python & ML Model Evaluation Cohort',
    badge: 'Industry',
    color: 'border-violet-500/25 bg-violet-500/10 text-violet-800 dark:text-violet-300',
  },
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
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(personalInfo.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${personalInfo.email}`
    }
  }

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
        {/* Narrative, Metrics Strip & Direct Channels */}
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
              {/* Email row with inline Copy + Gmail compose */}
              <div className="flex flex-wrap items-center justify-between gap-2 py-3.5 text-sm">
                <span className="flex items-center gap-3 text-[#586375] dark:text-neutral-400">
                  <span className="inline-flex p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  Email
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyEmail}
                    title="Copy email to clipboard"
                    className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-[#faf9f6] dark:bg-white/[0.04] px-2.5 py-1 font-mono text-xs text-[#0e1422] dark:text-neutral-200 hover:border-emerald-500/40 transition-colors"
                  >
                    <span>{copied ? 'Copied!' : personalInfo.email}</span>
                    {copied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3 opacity-55" />}
                  </button>
                  <a
                    href={gmailComposeUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Compose in Gmail"
                    title="Compose in Gmail"
                    className="inline-flex p-1.5 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-colors"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

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

              {/* Curriculum Vitae with direct PDF download + Drive preview */}
              <div className="flex flex-wrap items-center justify-between gap-2 py-3.5 text-sm">
                <span className="flex items-center gap-3 text-violet-700 dark:text-violet-400 font-medium">
                  <span className="inline-flex p-1.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <FileText className="w-3.5 h-3.5" />
                  </span>
                  Curriculum Vitae
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href="/Tanish_Jaswal_Data_Analyst_Resume.pdf"
                    download="Tanish_Jaswal_Data_Analyst_Resume.pdf"
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 font-mono text-[11px] font-medium text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                  >
                    <FileDown className="w-3 h-3" />
                    <span>PDF</span>
                  </a>
                  <a
                    href={personalInfo.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs font-medium text-violet-700 dark:text-violet-400 hover:underline"
                  >
                    <span>Drive Preview</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </SectionItem>
        </div>

        {/* Credentials: Education, Experience & Milestones */}
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

          {/* Verified Milestones Card */}
          <SectionItem>
            <div className="paper-surface rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 mono-label text-[10px] text-amber-700 dark:text-amber-400">
                <Award className="w-3.5 h-3.5" />
                <span>Recognized Milestones</span>
              </div>
              <div className="space-y-2.5">
                {MILESTONES.map((m) => (
                  <div key={m.title} className="flex items-start justify-between gap-3 pt-2 border-t border-black/[0.06] dark:border-white/[0.07] first:border-t-0 first:pt-0">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-[#0e1422] dark:text-white">
                        {m.title}
                      </div>
                      <div className="text-[11px] text-[#586375] dark:text-neutral-400">
                        {m.detail}
                      </div>
                    </div>
                    <span className={`shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full border ${m.color}`}>
                      {m.badge}
                    </span>
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
