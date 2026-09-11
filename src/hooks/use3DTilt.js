import { useRef, useCallback } from 'react'

export function use3DTilt(maxTilt = 15) {
  const ref = useRef(null)

  const handleMouseMove = useCallback(
    (e) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const cx = rect.width / 2
      const cy = rect.height / 2
      const rotateX = ((y - cy) / cy) * -maxTilt
      const rotateY = ((x - cx) / cx) * maxTilt
      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`
    },
    [maxTilt]
  )

  const handleMouseLeave = useCallback(() => {
    const el = ref.current
    if (el) el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'
  }, [])

  return { ref, handleMouseMove, handleMouseLeave }
}
