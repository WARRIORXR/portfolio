import { motion } from 'framer-motion'
import { use3DTilt } from '../../hooks/use3DTilt'

export default function GlassCard({
  children,
  className = '',
  hover = true,
  glow = false,
  glowColor = 'rgba(59,130,246,0.3)',
  tilt = false,
  padding = true,
  onClick,
}) {
  const { ref, handleMouseMove, handleMouseLeave } = use3DTilt(10)

  return (
    <motion.div
      ref={tilt ? ref : undefined}
      onMouseMove={tilt ? handleMouseMove : undefined}
      onMouseLeave={tilt ? handleMouseLeave : undefined}
      onClick={onClick}
      className={`
        relative rounded-2xl
        bg-white/5 backdrop-blur-lg
        border border-white/10
        ${padding ? 'p-6' : ''}
        ${hover ? 'hover:bg-white/8 hover:border-white/20 transition-all duration-300' : ''}
        ${glow ? 'hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
        transition: 'transform 0.15s ease, box-shadow 0.3s ease, background 0.3s ease',
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${glowColor.replace(')', ', 0.05)')} 0%, transparent 100%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
