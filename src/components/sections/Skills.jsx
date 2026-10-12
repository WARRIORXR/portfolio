import { SectionWrapper, SectionItem, SectionTitle } from '../shared/SectionWrapper'
import { skills, skillCategories } from '../../data/skills'

const groups = skillCategories.filter((c) => c.id !== 'all')

export default function Skills() {
  return (
    <SectionWrapper id="skills">
      <SectionTitle
        index="02"
        label="Capabilities"
        title="Skills & tools."
        subtitle="Python-first stack with a focus on machine learning and data."
      />

      <div className="grid gap-12 md:grid-cols-3 md:gap-10">
        {groups.map((cat) => {
          const items = skills.filter((s) => s.category === cat.id)
          return (
            <SectionItem key={cat.id}>
              <h3 className="mono-label mb-5">{cat.label}</h3>
              <div className="flex flex-col divide-y divide-white/[0.08] border-y border-white/[0.08]">
                {items.map((skill) => (
                  <div
                    key={skill.name}
                    className="group flex items-start justify-between gap-4 py-4 transition-colors hover:bg-white/[0.03] -mx-3 px-3 rounded"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white">{skill.name}</div>
                      <div className="mt-0.5 text-xs leading-relaxed text-white/40">
                        {skill.description}
                      </div>
                    </div>
                    <span className="mt-0.5 shrink-0 font-mono text-[11px] tabular-nums text-white/40 group-hover:text-white/70 transition-colors">
                      {skill.proficiency}%
                    </span>
                  </div>
                ))}
              </div>
            </SectionItem>
          )
        })}
      </div>
    </SectionWrapper>
  )
}
