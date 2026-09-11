import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  Code2,
  Brain,
  Database,
  Cpu,
  Terminal,
  Globe,
  Binary,
  Layers,
  Sparkles,
  GitBranch,
  Laptop,
  FileCode2,
  Radio,
} from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import { SectionWrapper, SectionItem, SectionTitle } from '../shared/SectionWrapper'
import { skills, skillCategories } from '../../data/skills'

// Lucide icon mapping for cosmic tech look
const skillIconMap = {
  Python: Code2,
  Flask: Globe,
  'REST APIs': Radio,
  'SQL & Databases': Database,
  'HTML & CSS': FileCode2,
  C: Binary,
  'C++': Binary,
  'Machine Learning': Brain,
  'NumPy & Pandas': Layers,
  'Scikit-learn': Cpu,
  'Deep Learning': Sparkles,
  'Generative AI': Brain,
  'Git & GitHub': GitBranch,
  'Jupyter Notebook': Terminal,
  'VS Code': Laptop,
}

function SkillCard({ skill }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })
  const IconComponent = skillIconMap[skill.name] || Terminal

  return (
    <div ref={ref}>
      <GlassCard
        tilt
        glow
        glowColor="rgba(0,51,255,0.25)"
        className="h-full flex flex-col justify-between"
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/80 shrink-0">
                <IconComponent className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h4 className="font-mono font-bold text-white text-sm tracking-wide">
                  {skill.name}
                </h4>
                <span className="text-[10px] font-mono text-white/40 uppercase">
                  {skill.years}YR EXP &middot; {skill.category.toUpperCase()}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-white/90 bg-white/[0.04] border border-white/10 px-2 py-0.5 rounded">
              {skill.proficiency}%
            </span>
          </div>

          <p className="text-white/60 text-xs leading-relaxed font-light mb-4">
            {skill.description}
          </p>
        </div>

        {/* Minimalist Cosmic Telemetry Bar */}
        <div>
          <div className="w-full h-[2px] bg-white/10 relative overflow-hidden rounded-full">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-indigo-400 to-white"
              initial={{ width: 0 }}
              animate={{ width: inView ? `${skill.proficiency}%` : 0 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            />
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

export default function Skills() {
  const [active, setActive] = useState('all')

  const filtered = active === 'all' ? skills : skills.filter((s) => s.category === active)

  return (
    <SectionWrapper id="skills">
      <SectionTitle
        label="// 02 · CORE CAPABILITIES"
        title="TECHNICAL SKILLS"
        subtitle="AI/ML SYSTEMS, ALGORITHMIC PIPELINES & PYTHON BACKEND ARCHITECTURE"
      />

      {/* Filter Matrix Tabs */}
      <SectionItem>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
          {skillCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`px-4 sm:px-5 py-2 rounded text-xs font-mono tracking-widest uppercase transition-all duration-300 border ${
                active === cat.id
                  ? 'bg-white text-black font-bold border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                  : 'bg-white/[0.02] border-white/10 text-white/50 hover:text-white hover:border-white/30 hover:bg-white/[0.05]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </SectionItem>

      {/* Skills Telemetry Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          {filtered.map((skill) => (
            <SkillCard key={skill.name} skill={skill} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Telemetry Legend */}
      <SectionItem className="mt-14 text-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-6 bg-black/60 border border-white/10 rounded-lg px-6 py-3 text-[11px] font-mono text-white/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
            <span>EXPERT (90%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>ADVANCED (80-89%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white/40" />
            <span>PROFICIENT (70-79%)</span>
          </div>
        </div>
      </SectionItem>
    </SectionWrapper>
  )
}
