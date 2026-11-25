import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionWrapper, SectionItem, SectionTitle } from '../shared/SectionWrapper'
import { skills, skillCategories } from '../../data/skills'

const WORKFLOW_STAGES = [
  { step: '01', stage: 'Ingest & Clean', tools: 'Python · Pandas · SQL', bar: 'bg-emerald-500', tag: 'text-emerald-700 dark:text-emerald-400' },
  { step: '02', stage: 'Model & Validate', tools: 'Scikit-learn · Cross-Val', bar: 'bg-teal-500', tag: 'text-teal-700 dark:text-teal-400' },
  { step: '03', stage: 'Serve APIs', tools: 'Flask · FastAPI · Rust', bar: 'bg-blue-500', tag: 'text-blue-700 dark:text-blue-400' },
  { step: '04', stage: 'Visualize & Deploy', tools: 'Power BI · Chart.js · AWS', bar: 'bg-violet-500', tag: 'text-violet-700 dark:text-violet-400' },
]

function tierFor(proficiency) {
  if (proficiency >= 85) return { label: 'Core', blocks: 5 }
  if (proficiency >= 78) return { label: 'Proficient', blocks: 4 }
  return { label: 'Working', blocks: 3 }
}

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
        title="Technical"
        italicWord="toolkit."
        subtitle="End-to-end engineering stack spanning data preparation, predictive modeling, relational architecture, and BI delivery."
        accent="cobalt"
      />

      {/* Color-Bound Category Filter */}
      <SectionItem className="mb-8">
        <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-2xl sm:rounded-full bg-[#efede7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]">
          {skillCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id
            const count =
              cat.id === 'all'
                ? skills.length
                : skills.filter((s) => s.category === cat.id).length
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`relative px-4 py-1.5 text-xs font-medium rounded-xl sm:rounded-full transition-colors duration-200 ${
                  isSelected
                    ? 'text-[#0e1422] dark:text-white'
                    : 'text-[#586375] dark:text-neutral-400 hover:text-[#0e1422] dark:hover:text-white'
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="skills-cat-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-xl sm:rounded-full bg-white dark:bg-[#1f2027] border border-black/[0.07] dark:border-white/[0.1] shadow-sm"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: cat.color || '#059669' }}
                    aria-hidden="true"
                  />
                  <span>{cat.label}</span>
                  <span className="font-mono text-[10px] opacity-55">{count}</span>
                </span>
              </button>
            )
          })}
        </div>
      </SectionItem>

      {/* Color-Bound Capability Specification Grid */}
      <SectionItem>
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5"
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill) => {
              const tier = tierFor(skill.proficiency)
              const accentColor = skill.color || '#059669'
              return (
                <motion.div
                  key={skill.name}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="relative paper-surface rounded-xl p-5 flex flex-col justify-between group overflow-hidden"
                >
                  {/* Subtle top color-binding hairline */}
                  <span
                    aria-hidden="true"
                    className="absolute top-0 inset-x-0 h-[2px] opacity-80 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: accentColor }}
                  />

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: accentColor }}
                          aria-hidden="true"
                        />
                        <h4 className="text-sm font-semibold text-[#0e1422] dark:text-white tracking-tight truncate">
                          {skill.name}
                        </h4>
                      </div>

                      {/* Color-bound 5-block precision meter */}
                      <div
                        className="flex items-center gap-0.5 shrink-0 pt-1"
                        title={`${tier.label} · ${skill.proficiency}%`}
                        aria-label={`${tier.label} proficiency`}
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span
                            key={n}
                            className={`h-2.5 w-1 rounded-[1px] transition-opacity ${
                              n <= tier.blocks ? 'opacity-100' : 'opacity-15'
                            }`}
                            style={{ backgroundColor: accentColor }}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed text-[#586375] dark:text-neutral-400 line-clamp-2">
                      {skill.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.07] flex items-center justify-between text-[10px] font-mono uppercase tracking-wider">
                    <span style={{ color: accentColor }} className="font-semibold">
                      {tier.label}
                    </span>
                    <span className="text-[#586375] dark:text-neutral-400">
                      {skill.years} {skill.years === 1 ? 'yr' : 'yrs'}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </SectionItem>

      {/* Progressive Color Pipeline Strip */}
      <SectionItem className="mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-black/[0.08] dark:bg-white/[0.09] border border-black/[0.08] dark:border-white/[0.09] rounded-2xl overflow-hidden shadow-sm">
          {WORKFLOW_STAGES.map((stage) => (
            <div key={stage.step} className="relative bg-white dark:bg-[#111115] p-4 sm:p-5 flex items-center justify-between gap-3">
              <span aria-hidden="true" className={`absolute bottom-0 inset-x-0 h-[2px] ${stage.bar}`} />
              <div className="space-y-0.5">
                <div className={`font-mono text-[10px] font-semibold ${stage.tag}`}>
                  STAGE {stage.step}
                </div>
                <div className="text-xs font-semibold text-[#0e1422] dark:text-white">
                  {stage.stage}
                </div>
              </div>
              <div className="text-[11px] font-mono text-[#586375] dark:text-neutral-400 text-right">
                {stage.tools}
              </div>
            </div>
          ))}
        </div>
      </SectionItem>
    </SectionWrapper>
  )
}
