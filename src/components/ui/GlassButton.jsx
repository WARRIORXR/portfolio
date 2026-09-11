import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function GlassButton({
  children,
  onClick,
  href,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  target,
  download,
  icon,
}) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 350, damping: 30 })
  const springY = useSpring(y, { stiffness: 350, damping: 30 })

  const handleMouse = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3)
  }
  const handleLeave = () => { x.set(0); y.set(0) }

  const variants = {
    primary: `bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500
      text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_35px_rgba(59,130,246,0.6)]`,
    secondary: `bg-white/5 backdrop-blur-sm border border-white/20 text-white/90
      hover:bg-white/10 hover:border-white/30`,
    outline: `border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400`,
    ghost: `text-white/70 hover:text-white hover:bg-white/5`,
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const baseClass = `
    relative inline-flex items-center gap-2 rounded-xl font-medium
    transition-all duration-300 cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-blue-500/50
    disabled:opacity-50 disabled:cursor-not-allowed
    overflow-hidden
    ${variants[variant]} ${sizes[size]} ${className}
  `

  const content = (
    <>
      {/* Shimmer effect */}
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent 
        group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        icon && <span className="text-lg">{icon}</span>
      )}
      <span>{loading ? 'Sending...' : children}</span>
    </>
  )

  if (href) {
    return (
      <motion.a
        ref={ref}
        href={href}
        target={target}
        download={download}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        className={`group ${baseClass}`}
        style={{ x: springX, y: springY }}
        onMouseMove={handleMouse}
        onMouseLeave={handleLeave}
        whileTap={{ scale: 0.97 }}
      >
        {content}
      </motion.a>
    )
  }

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      disabled={disabled || loading}
      className={`group ${baseClass}`}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.97 }}
    >
      {content}
    </motion.button>
  )
}
