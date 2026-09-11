export default function GlassBadge({ children, color = '#8b5cf6', size = 'sm', className = '' }) {
  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-1.5 text-sm',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium
        border backdrop-blur-sm transition-all duration-200
        hover:scale-105 ${sizes[size]} ${className}`}
      style={{
        background: `${color}15`,
        borderColor: `${color}40`,
        color: color,
      }}
    >
      {children}
    </span>
  )
}
