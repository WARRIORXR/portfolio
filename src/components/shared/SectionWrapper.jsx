import { motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

export function SectionWrapper({ children, id, className = '' }) {
  return (
    <motion.section
      id={id}
      className={`relative py-28 px-4 sm:px-6 md:px-12 lg:px-20 max-w-7xl mx-auto ${className}`}
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

export function SectionTitle({ label, title, subtitle }) {
  return (
    <div className="text-center mb-16 sm:mb-20 space-y-3">
      <motion.div variants={itemVariants} className="flex items-center justify-center gap-3">
        <span className="h-[1px] w-8 bg-white/20" />
        <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-white/40">
          {label}
        </span>
        <span className="h-[1px] w-8 bg-white/20" />
      </motion.div>
      <motion.h2
        variants={itemVariants}
        className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={itemVariants}
          className="text-xs sm:text-sm font-mono tracking-widest text-white/50 uppercase max-w-xl mx-auto"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}
