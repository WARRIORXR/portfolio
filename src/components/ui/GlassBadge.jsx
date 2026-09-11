export default function GlassBadge({
  children,
  color = '#3b82f6',
  size = 'sm',
  className = '',
  dot = true,
}) {
  const sizes = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-xs',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono tracking-wider
        bg-white/[0.03] backdrop-blur-md border border-white/10 text-white/80
        transition-all duration-200 hover:border-white/30 hover:bg-white/[0.06] hover:text-white
        ${sizes[size]} ${className}`}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0 shadow-sm"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
        />
      )}
      <span>{children}</span>
    </span>
  )
}
