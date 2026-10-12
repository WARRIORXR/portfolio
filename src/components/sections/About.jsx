import { lazy, Suspense } from 'react'
import { Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'
import { SectionWrapper, SectionItem, SectionTitle } from '../shared/SectionWrapper'
import { personalInfo, education, experience, stats } from '../../data/personalInfo'
import useGithubContributions from '../../hooks/useGithubContributions'

const ContributionSkyline = lazy(() => import('../ui/contribution-skyline'))

function Stat({ value, suffix, label }) {
  const { ref, inView } = useInView({ triggerOnce: true })
  return (
    <div ref={ref}>
      <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-white tabular-nums">
        {inView ? <CountUp end={value} duration={1.6} suffix={suffix} /> : `0${suffix}`}
      </div>
      <div className="mt-1 text-xs text-white/40">{label}</div>
    </div>
  )
}

export default function About() {
  const contributions = useGithubContributions(personalInfo.githubUsername)

  return (
    <SectionWrapper id="about">
      <SectionTitle
        index="01"
        label="About"
        title="Building things that learn."
        subtitle={personalInfo.title}
      />

      <div className="grid gap-12 md:grid-cols-5 md:gap-16">
        {/* Bio + contact rows */}
        <div className="md:col-span-3 space-y-8">
          <SectionItem>
            <p className="text-base sm:text-lg leading-relaxed text-white/70">{personalInfo.bio}</p>
          </SectionItem>

          <SectionItem>
            <div className="flex flex-col divide-y divide-white/[0.08] border-y border-white/[0.08]">
              <a
                href={`mailto:${personalInfo.email}`}
                className="group flex items-center justify-between py-3.5 text-sm"
              >
                <span className="flex items-center gap-3 text-white/40">
                  <Mail className="w-3.5 h-3.5" /> Email
                </span>
                <span className="flex items-center gap-1.5 text-white/70 group-hover:text-white transition-colors">
                  {personalInfo.email}
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </a>
              <div className="flex items-center justify-between py-3.5 text-sm">
                <span className="flex items-center gap-3 text-white/40">
                  <Phone className="w-3.5 h-3.5" /> Phone
                </span>
                <span className="text-white/70">{personalInfo.phone}</span>
              </div>
              <div className="flex items-center justify-between py-3.5 text-sm">
                <span className="flex items-center gap-3 text-white/40">
                  <MapPin className="w-3.5 h-3.5" /> Location
                </span>
                <span className="text-white/70">{personalInfo.location}</span>
              </div>
            </div>
          </SectionItem>

          <SectionItem>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((s) => (
                <Stat key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
              ))}
            </div>
          </SectionItem>
        </div>

        {/* Education + experience */}
        <div className="md:col-span-2 space-y-10">
          <SectionItem>
            <h3 className="mono-label mb-5">Education</h3>
            <div className="border-l border-white/[0.08] pl-5 space-y-1.5">
              <div className="text-sm font-medium text-white">{education.degree}</div>
              <div className="text-sm text-white/50">
                {education.field} &middot; {education.institution}
              </div>
              <div className="text-xs text-white/40">
                {education.location} &middot; Class of {education.expectedGraduation}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 pt-2">
                {education.coursework.map((c) => (
                  <span key={c} className="text-xs text-white/40">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </SectionItem>

          <SectionItem>
            <h3 className="mono-label mb-5">Experience</h3>
            <div className="space-y-8">
              {experience.map((job) => (
                <div key={job.company} className="border-l border-white/[0.08] pl-5 space-y-2">
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="text-sm font-medium text-white">
                      {job.role} &middot; {job.company}
                    </div>
                  </div>
                  <div className="text-xs text-white/40">{job.period}</div>
                  {job.description.map((line) => (
                    <p key={line} className="text-sm leading-relaxed text-white/55">
                      {line}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </SectionItem>
        </div>
      </div>

      {/* GitHub activity — contribution skyline (2D heat map ↔ 3D isometric) */}
      <SectionItem className="mt-16">
        <h3 className="mono-label mb-5">GitHub Activity</h3>
        <Suspense
          fallback={<div className="h-40 rounded-xl border border-white/[0.08] bg-black" />}
        >
          <ContributionSkyline data={contributions} className="border-white/[0.08]" />
        </Suspense>
      </SectionItem>
    </SectionWrapper>
  )
}
