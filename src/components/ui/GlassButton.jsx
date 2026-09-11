import { motion, useMotionValue, useSpring } from 'framer-motion'
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
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25)
  }
  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  const variants = {
    primary: `bg-white text-black font-semibold hover:bg-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] border border-white`,
    cosmic: `bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 text-white font-medium hover:shadow-[0_0_35px_rgba(0,51,255,0.5)] border border-white/20`,
    secondary: `bg-white/[0.04] backdrop-blur-xl border border-white/15 text-white/90 hover:bg-white/10 hover:border-white/30`,
    outline: `border border-white/20 text-white/80 hover:bg-white/5 hover:border-white/50 hover:text-white`,
    ghost: `text-white/60 hover:text-white hover:bg-white/5 border border-transparent`,
  }

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs tracking-wider uppercase font-mono',
    md: 'px-5 py-2.5 text-xs tracking-widest uppercase font-mono',
    lg: 'px-7 py-3.5 text-sm tracking-widest uppercase font-mono',
  }

  const baseClass = `
    relative inline-flex items-center justify-center gap-2 rounded-lg
    transition-all duration-300 cursor-pointer select-none
    focus:outline-none focus:ring-1 focus:ring-white/40
    disabled:opacity-40 disabled:cursor-not-allowed
    overflow-hidden
    ${variants[variant] || variants.primary} ${sizes[size]} ${className}
  `

  const content = (
    <>
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        icon && <span className="inline-flex items-center justify-center shrink-0">{icon}</span>
      )}
      <span className="relative z-10">{loading ? 'TRANSMITTING...' : children}</span>
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
        whileTap={{ scale: 0.98 }}
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
      whileTap={{ scale: 0.98 }}
    >
      {content}
    </motion.button>
  )
}
