import { motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export function SectionWrapper({ children, id, className = '' }) {
  return (
    <motion.section
      id={id}
      className={`relative py-24 sm:py-32 px-6 max-w-5xl mx-auto ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
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

export function SectionTitle({ index, label, title, subtitle }) {
  return (
    <div className="mb-14 sm:mb-20">
      <motion.div variants={itemVariants} className="flex items-center gap-4 mb-5">
        <span className="mono-label text-neutral-400 dark:text-white/30">{index}</span>
        <span className="h-[1px] flex-1 bg-black/[0.08] dark:bg-white/10" />
        <span className="mono-label text-neutral-500 dark:text-white/45">{label}</span>
      </motion.div>
      <motion.h2
        variants={itemVariants}
        className="text-3xl sm:text-5xl font-semibold tracking-tight text-neutral-900 dark:text-white"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={itemVariants}
          className="mt-4 text-sm text-neutral-600 dark:text-white/50 max-w-xl leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}
