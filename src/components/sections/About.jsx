import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'
import {
  Briefcase,
  GraduationCap,
  Cpu,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  CheckCircle2,
  Terminal,
  Activity,
  Layers,
} from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import GlassBadge from '../ui/GlassBadge'
import { SectionWrapper, SectionItem, SectionTitle } from '../shared/SectionWrapper'
import { personalInfo, education, experience, stats } from '../../data/personalInfo'

function StatCard({ value, suffix, label }) {
  const { ref, inView } = useInView({ triggerOnce: true })
  return (
    <div ref={ref} className="p-4 sm:p-5 flex flex-col justify-center items-center text-center">
      <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
        {inView ? <CountUp end={value} duration={2} suffix={suffix} /> : `0${suffix}`}
      </div>
      <div className="text-[10px] font-mono tracking-widest text-white/40 uppercase mt-1">
        {label}
      </div>
    </div>
  )
}

export default function About() {
  return (
    <SectionWrapper id="about">
      <SectionTitle
        label="// 01 · SYSTEM TELEMETRY"
        title="ABOUT TANISH"
        subtitle="AI/ML RESEARCHER & COMPUTER SCIENCE SPECIALIST"
      />

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column — Holographic Profile Card (5 cols) */}
        <SectionItem className="lg:col-span-5">
          <GlassCard className="h-full" tilt glow glowColor="rgba(0,51,255,0.3)">
            {/* Holographic Portrait Frame with Unsplash Tech Asset */}
            <div className="relative mx-auto w-full aspect-square max-w-[280px] mb-6 rounded-lg overflow-hidden border border-white/20 bg-black">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
                alt="Cosmic Neural Field"
                className="w-full h-full object-cover opacity-80 filter contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              
              {/* Overlay telemetry marks */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                SYSTEM ACTIVE
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-left">
                <div className="text-lg font-mono font-bold text-white tracking-wider">
                  TANISH JASWAL
                </div>
                <div className="text-[10px] font-mono text-white/50 tracking-widest uppercase">
                  IKGPTU CSE &middot; CLASS OF 2027
                </div>
              </div>
            </div>

            {/* Quick Badges */}
            <div className="flex flex-wrap gap-1.5 justify-center mb-6">
              {['Python 3.12', 'Machine Learning', 'Deep Learning', 'Flask API', 'Generative AI'].map((tag) => (
                <GlassBadge key={tag} color="#3b82f6" size="xs">
                  {tag}
                </GlassBadge>
              ))}
            </div>

            {/* Telemetry Stats Grid */}
            <div className="grid grid-cols-2 divide-x divide-y divide-white/10 rounded-lg border border-white/10 bg-white/[0.02]">
              {stats.map((s) => (
                <StatCard key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
              ))}
            </div>

            {/* Terminal Contact Telemetry */}
            <div className="mt-6 pt-6 border-t border-white/10 space-y-2.5 text-xs font-mono">
              <div className="flex items-center gap-3 text-white/60">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate hover:text-white transition-colors">
                  {personalInfo.email}
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <MapPin className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                <span className="truncate">{personalInfo.location} (31.3260° N, 75.5762° E)</span>
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{personalInfo.phone}</span>
              </div>
            </div>
          </GlassCard>
        </SectionItem>

        {/* Right Column — Deep Information Architecture (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Executive Summary */}
          <SectionItem>
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-mono tracking-[0.25em] text-white/60 uppercase flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  CORE SUMMARY &middot; OVERVIEW
                </h3>
                <span className="text-[10px] font-mono text-white/30">ID: TJ-2027</span>
              </div>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed font-light mb-4">
                {personalInfo.bio}
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-blue-300/80 bg-blue-500/[0.06] border border-blue-500/20 p-3 rounded">
                <Activity className="w-4 h-4 shrink-0 text-blue-400" />
                <span>Currently seeking AI/ML engineering internships & junior AI research roles.</span>
              </div>
            </GlassCard>
          </SectionItem>

          {/* Experience / Internship */}
          <SectionItem>
            <GlassCard glowColor="rgba(0,255,200,0.2)">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xs font-mono tracking-[0.25em] text-white/60 uppercase flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  PRACTICAL EXPERIENCE
                </h3>
                <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                  VERIFIED
                </span>
              </div>

              {experience.map((exp) => (
                <div key={exp.role} className="border-l border-cyan-500/40 pl-4 py-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                    <h4 className="text-base font-bold text-white font-mono">{exp.role}</h4>
                    <span className="text-[11px] font-mono text-white/40">{exp.period}</span>
                  </div>
                  <p className="text-xs font-mono text-cyan-300 mb-3">
                    {exp.company} &middot; {exp.location}
                  </p>
                  <ul className="space-y-2">
                    {exp.description.map((d, i) => (
                      <li key={i} className="text-xs sm:text-sm text-white/70 flex items-start gap-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </GlassCard>
          </SectionItem>

          {/* Education & Academic Rigor */}
          <SectionItem>
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-mono tracking-[0.25em] text-white/60 uppercase flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-fuchsia-400" />
                  ACADEMIC FOUNDATION
                </h3>
                <span className="text-[10px] font-mono text-white/40">DEGREE PROGRAM</span>
              </div>

              <div className="border-l border-fuchsia-500/40 pl-4 py-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                  <h4 className="text-base font-bold text-white font-mono">{education.degree}</h4>
                  <span className="text-[11px] font-mono text-fuchsia-400">
                    EXPECTED {education.expectedGraduation}
                  </span>
                </div>
                <p className="text-xs font-mono text-fuchsia-300 mb-1">{education.field}</p>
                <p className="text-xs text-white/40 mb-3">
                  {education.institution} &middot; {education.location}
                </p>

                <div className="pt-2 border-t border-white/10">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2">
                    Key Coursework:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {education.coursework.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded border border-white/10 bg-white/[0.02] text-[11px] font-mono text-white/60"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </SectionItem>
        </div>
      </div>
    </SectionWrapper>
  )
}
