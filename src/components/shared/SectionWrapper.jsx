import { motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] },
  },
}

const ACCENT_STYLES = {
  emerald: {
    badge: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-800 dark:text-emerald-300',
    line: 'from-emerald-500/40 via-teal-500/20 to-transparent',
    serif: 'from-emerald-600 via-teal-600 to-sky-600 dark:from-emerald-400 dark:via-teal-300 dark:to-sky-400',
  },
  cobalt: {
    badge: 'bg-blue-500/10 border-blue-500/25 text-blue-800 dark:text-blue-300',
    line: 'from-blue-500/40 via-cyan-500/20 to-transparent',
    serif: 'from-blue-600 via-cyan-600 to-emerald-600 dark:from-blue-400 dark:via-cyan-300 dark:to-emerald-400',
  },
  violet: {
    badge: 'bg-violet-500/10 border-violet-500/25 text-violet-800 dark:text-violet-300',
    line: 'from-violet-500/40 via-indigo-500/20 to-transparent',
    serif: 'from-violet-600 via-indigo-600 to-blue-600 dark:from-violet-400 dark:via-indigo-300 dark:to-sky-400',
  },
}

export function SectionWrapper({ children, id, className = '' }) {
  return (
    <motion.section
      id={id}
      className={`relative py-20 sm:py-24 px-6 max-w-6xl mx-auto border-t border-black/[0.06] dark:border-white/[0.07] scroll-mt-24 ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      variants={containerVariants}
    >
      {children}
    </motion.section>
  )
}

export function SectionItem({ children, className = '' }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}

export function SectionTitle({ index, label, title, italicWord, subtitle, accent = 'emerald' }) {
  const theme = ACCENT_STYLES[accent] || ACCENT_STYLES.emerald

  return (
    <div className="mb-10 sm:mb-14">
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <span className={`mono-label text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${theme.badge}`}>
            {index}
          </span>
          <span className="mono-label text-[11px] text-[#586375] dark:text-neutral-400">
            / {label}
          </span>
        </div>
        <span className={`hidden sm:block h-px flex-1 bg-gradient-to-r ${theme.line}`} />
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
        <motion.h2
          variants={itemVariants}
          className="lg:col-span-7 text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-[#0e1422] dark:text-[#f4f4f5] leading-[1.08]"
        >
          {title}
          {italicWord && (
            <>
              {' '}
              <span className={`font-serif italic font-normal bg-gradient-to-r ${theme.serif} bg-clip-text text-transparent text-[1.09em]`}>
                {italicWord}
              </span>
            </>
          )}
        </motion.h2>

        {subtitle && (
          <motion.p
            variants={itemVariants}
            className="lg:col-span-5 text-sm sm:text-[15px] text-[#586375] dark:text-neutral-400 leading-relaxed lg:text-right"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </div>
  )
}
