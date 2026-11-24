import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionWrapper, SectionItem, SectionTitle } from '../shared/SectionWrapper'
import { skills, skillCategories } from '../../data/skills'

export default function Skills() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredSkills =
    selectedCategory === 'all'
      ? skills
      : skills.filter((s) => s.category === selectedCategory)

  return (
    <SectionWrapper id="skills">
      <SectionTitle
        index="02"
        label="Capabilities"
        title="Technical Toolkit"
        subtitle="End-to-end analytical stack across data processing, machine learning models, database architecture, and deployment."
      />

      {/* Category Filter Pills */}
      <SectionItem className="mb-8">
        <div className="flex flex-wrap items-center gap-2">
          {skillCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs font-medium px-4 py-2 rounded-full transition-all duration-200 ${
                  isSelected
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md scale-105'
                    : 'bg-black/[0.04] text-neutral-600 hover:text-black hover:bg-black/[0.08] dark:bg-white/[0.04] dark:text-white/60 dark:hover:text-white dark:hover:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.06]'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </SectionItem>

      {/* Skills Grid */}
      <SectionItem>
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill) => (
              <motion.div
                key={skill.name}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="glass-card rounded-2xl p-5 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl" role="img" aria-label={skill.name}>
                        {skill.icon}
                      </span>
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-white tracking-tight">
                        {skill.name}
                      </h4>
                    </div>
                    <span className="font-mono text-xs tabular-nums text-neutral-500 dark:text-white/50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {skill.proficiency}%
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-neutral-600 dark:text-white/50 line-clamp-2">
                    {skill.description}
                  </p>
                </div>

                {/* Proficiency progress bar */}
                <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-black/[0.06] dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${skill.proficiency}%`,
                        backgroundColor: skill.color || '#3b82f6',
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-white/40 shrink-0">
                    {skill.years} {skill.years === 1 ? 'yr' : 'yrs'} exp
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </SectionItem>
    </SectionWrapper>
  )
}
