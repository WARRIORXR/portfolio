import { motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export function SectionWrapper({ children, id, className = '' }) {
  return (
    <motion.section
      id={id}
      className={`relative py-20 px-4 md:px-8 lg:px-16 xl:px-24 ${className}`}
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

export function SectionTitle({ label, title, gradient = true }) {
  return (
    <div className="text-center mb-16">
      <motion.span
        variants={itemVariants}
        className="inline-block text-sm font-mono font-medium text-blue-400 tracking-widest uppercase mb-3 
          bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full"
      >
        {label}
      </motion.span>
      <motion.h2
        variants={itemVariants}
        className={`text-4xl md:text-5xl font-bold mt-3 ${
          gradient
            ? 'bg-gradient-to-r from-white via-blue-100 to-violet-200 bg-clip-text text-transparent'
            : 'text-white'
        }`}
      >
        {title}
      </motion.h2>
    </div>
  )
}
