import { motion } from 'framer-motion'
import { use3DTilt } from '../../hooks/use3DTilt'

export default function GlassCard({
  children,
  className = '',
  hover = true,
  glow = false,
  glowColor = 'rgba(0, 51, 255, 0.4)',
  tilt = false,
  padding = true,
  onClick,
}) {
  const { ref, handleMouseMove, handleMouseLeave } = use3DTilt(8)

  return (
    <motion.div
      ref={tilt ? ref : undefined}
      onMouseMove={tilt ? handleMouseMove : undefined}
      onMouseLeave={tilt ? handleMouseLeave : undefined}
      onClick={onClick}
      className={`
        relative rounded-xl
        bg-black/60 backdrop-blur-2xl
        border border-white/[0.08]
        overflow-hidden
        ${padding ? 'p-6 sm:p-8' : ''}
        ${hover ? 'hover:border-white/20 hover:bg-zinc-900/60 transition-all duration-300' : ''}
        ${glow ? 'hover:shadow-[0_0_40px_rgba(0,51,255,0.25)]' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
        transition: 'transform 0.15s ease, box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease',
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Corner telemetry marks for cosmic aesthetic */}
      <span className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-white/20 pointer-events-none" />
      <span className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-white/20 pointer-events-none" />
      <span className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-white/20 pointer-events-none" />
      <span className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-white/20 pointer-events-none" />

      {/* Subtle bloom gradient overlay on hover */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${glowColor} 0%, transparent 70%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
