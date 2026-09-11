export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' }
  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`relative ${sizes[size]}`}>
        <div className={`${sizes[size]} rounded-full border-2 border-white/10`} />
        <div
          className={`absolute inset-0 ${sizes[size]} rounded-full border-2 border-transparent border-t-blue-500 border-r-violet-500 animate-spin`}
        />
        <div
          className={`absolute inset-2 rounded-full border border-transparent border-t-cyan-400 animate-spin`}
          style={{ animationDirection: 'reverse', animationDuration: '0.7s' }}
        />
      </div>
      {text && <p className="text-white/50 text-sm font-mono">{text}</p>}
    </div>
  )
}
