import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import GlassCard from '../ui/GlassCard'
import GlassBadge from '../ui/GlassBadge'
import { SectionWrapper, SectionItem, SectionTitle } from '../shared/SectionWrapper'
import { skills, skillCategories } from '../../data/skills'

function SkillBar({ proficiency, color, inView }) {
  return (
    <div className="relative h-1.5 rounded-full bg-white/10 overflow-hidden mt-2">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
        initial={{ width: 0 }}
        animate={{ width: inView ? `${proficiency}%` : 0 }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
      />
      {/* Shimmer */}
      <motion.div
        className="absolute inset-y-0 w-8 bg-white/30 blur-sm rounded-full"
        animate={{ x: inView ? ['-20px', '400px'] : '-20px' }}
        transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.5, repeat: 0 }}
      />
    </div>
  )
}

function SkillCard({ skill }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 })

  return (
    <div ref={ref}>
      <GlassCard tilt glow glowColor={`${skill.color}50`} className="h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{skill.icon}</span>
            <div>
              <h4 className="font-semibold text-white text-sm">{skill.name}</h4>
              <p className="text-white/40 text-xs">{skill.years}yr{skill.years > 1 ? 's' : ''} exp</p>
            </div>
          </div>
          <span className="text-sm font-mono font-bold" style={{ color: skill.color }}>
            {skill.proficiency}%
          </span>
        </div>
        <p className="text-white/50 text-xs mb-3 leading-relaxed">{skill.description}</p>
        <SkillBar proficiency={skill.proficiency} color={skill.color} inView={inView} />
      </GlassCard>
    </div>
  )
}

export default function Skills() {
  const [active, setActive] = useState('all')

  const filtered = active === 'all' ? skills : skills.filter((s) => s.category === active)

  return (
    <SectionWrapper id="skills">
      <SectionTitle label="// Technical Skills" title="What I Work With" />

      {/* Filter tabs */}
      <SectionItem>
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {skillCategories.map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                active === cat.id
                  ? 'text-white border-transparent shadow-lg'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/8'
              }`}
              style={
                active === cat.id
                  ? { background: `linear-gradient(135deg, ${cat.color}30, ${cat.color}20)`, borderColor: `${cat.color}50`, color: cat.color }
                  : {}
              }
            >
              {cat.label}
            </motion.button>
          ))}
        </div>
      </SectionItem>

      {/* Skill grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-7xl mx-auto"
        >
          {filtered.map((skill) => (
            <SkillCard key={skill.name} skill={skill} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Proficiency legend */}
      <SectionItem className="mt-12 text-center">
        <div className="inline-flex items-center gap-6 bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-xs text-white/50">
          {[['< 70%', '#64748b'], ['70–80%', '#3b82f6'], ['80–90%', '#8b5cf6'], ['90%+', '#06b6d4']].map(([label, color]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>
      </SectionItem>
    </SectionWrapper>
  )
}
