import { useScroll, useSpring, motion } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 32, restDelta: 0.001 })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2.5px] z-[100] origin-left bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-600 dark:from-emerald-400 dark:via-sky-400 dark:to-violet-400"
      style={{ scaleX }}
    />
  )
}
