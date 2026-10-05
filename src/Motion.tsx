import { useEffect, useState } from 'react'
import { reduced } from './reduced'

// Counts up to a number once when it appears; shows the final value immediately under reduced motion.
export function CountUp({ to, ms = 900 }: { to: number; ms?: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (reduced()) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms)
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, ms])
  return <>{reduced() ? to : n}</>
}

// Thin bar at the top of the screen showing how far a lesson has been read.
export function ReadProgress() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      setP(max > 0 ? Math.min(1, h.scrollTop / max) : 1)
    }
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll) }
  }, [])
  return <div className="read-progress" aria-hidden="true"><i style={{ transform: `scaleX(${p})` }} /></div>
}
