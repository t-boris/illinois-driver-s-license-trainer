import { useEffect, useRef } from 'react'
import { reduced } from './reduced'

// Adds the class "in" to children of the container as they scroll into view (one-time reveal).
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const items = [...root.querySelectorAll('h3, li, p')]
    if (reduced() || typeof IntersectionObserver === 'undefined') { items.forEach((e) => e.classList.add('in')); return }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }, { rootMargin: '0px 0px -8% 0px' })
    items.forEach((e) => { e.classList.add('reveal'); io.observe(e) })
    return () => io.disconnect()
  }, [])
  return ref
}
