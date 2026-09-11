import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'
import { FaBriefcase, FaGraduationCap, FaCode } from 'react-icons/fa'
import GlassCard from '../ui/GlassCard'
import GlassBadge from '../ui/GlassBadge'
import { SectionWrapper, SectionItem, SectionTitle } from '../shared/SectionWrapper'
import { personalInfo, education, experience, stats } from '../../data/personalInfo'

function StatCard({ value, suffix, label }) {
  const { ref, inView } = useInView({ triggerOnce: true })
  return (
    <div ref={ref} className="text-center p-4">
      <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
        {inView ? <CountUp end={value} duration={2} suffix={suffix} /> : `0${suffix}`}
      </div>
      <div className="text-white/50 text-xs mt-1">{label}</div>
    </div>
  )
}

export default function About() {
  return (
    <SectionWrapper id="about">
      <SectionTitle label="// About Me" title="Who Am I?" />

      <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-8">
        {/* Left — Profile Card */}
        <SectionItem className="lg:col-span-2">
          <GlassCard className="h-full" tilt glow>
            {/* Avatar placeholder with gradient */}
            <div className="relative mx-auto w-40 h-40 mb-6">
              <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-6xl font-black text-white shadow-glow">
                TJ
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-slate-900 flex items-center justify-center">
                <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white text-center mb-1">{personalInfo.name}</h3>
            <p className="text-blue-300 text-sm text-center font-mono mb-4">{personalInfo.title}</p>

            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {['Python', 'ML Engineer', 'Flask', 'AI'].map((tag) => (
                <GlassBadge key={tag} color="#3b82f6">{tag}</GlassBadge>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 divide-x divide-y divide-white/10 rounded-xl overflow-hidden border border-white/10">
              {stats.map((s) => (
                <StatCard key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
              ))}
            </div>

            {/* Contact info */}
            <div className="mt-6 space-y-2 text-sm">
              {[
                { label: '📧', value: personalInfo.email },
                { label: '📍', value: personalInfo.location },
                { label: '📞', value: personalInfo.phone },
              ].map(({ label, value }) => (
                <div key={value} className="flex items-center gap-2 text-white/60">
                  <span>{label}</span>
                  <span className="text-white/80 truncate">{value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </SectionItem>

        {/* Right — Info */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Bio */}
          <SectionItem>
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-blue-400">👋</span> Professional Summary
              </h3>
              <p className="text-white/70 leading-relaxed text-sm">
                {personalInfo.bio}
              </p>
            </GlassCard>
          </SectionItem>

          {/* Education */}
          <SectionItem>
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FaGraduationCap className="text-violet-400" /> Education
              </h3>
              <div className="border-l-2 border-violet-500/30 pl-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-white font-medium">{education.degree}</p>
                    <p className="text-violet-300 text-sm">{education.field}</p>
                    <p className="text-white/50 text-xs">{education.institution} · {education.location}</p>
                  </div>
                  <GlassBadge color="#8b5cf6" size="xs">Expected {education.expectedGraduation}</GlassBadge>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {education.coursework.map((c) => (
                    <GlassBadge key={c} color="#64748b" size="xs">{c}</GlassBadge>
                  ))}
                </div>
              </div>
            </GlassCard>
          </SectionItem>

          {/* Experience */}
          <SectionItem>
            <GlassCard glowColor="rgba(6,182,212,0.3)">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FaBriefcase className="text-cyan-400" /> Experience
              </h3>
              {experience.map((exp) => (
                <div key={exp.role} className="border-l-2 border-cyan-500/30 pl-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-white font-medium">{exp.role}</p>
                      <p className="text-cyan-300 text-sm">{exp.company} · {exp.location}</p>
                    </div>
                    <GlassBadge color="#06b6d4" size="xs">{exp.period}</GlassBadge>
                  </div>
                  <ul className="space-y-1.5 mt-2">
                    {exp.description.map((d, i) => (
                      <li key={i} className="text-white/60 text-sm flex gap-2">
                        <span className="text-cyan-400 mt-0.5 flex-shrink-0">▸</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </GlassCard>
          </SectionItem>

          {/* Core tools */}
          <SectionItem>
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <FaCode className="text-emerald-400" /> Core Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Python', 'Flask', 'NumPy', 'Pandas', 'Scikit-learn', 'Jupyter', 'Git', 'SQL', 'HTML/CSS', 'REST APIs'].map((tech) => (
                  <GlassBadge key={tech} color="#10b981">{tech}</GlassBadge>
                ))}
              </div>
            </GlassCard>
          </SectionItem>
        </div>
      </div>
    </SectionWrapper>
  )
}
