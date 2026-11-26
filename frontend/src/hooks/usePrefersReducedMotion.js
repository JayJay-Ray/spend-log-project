import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function getInitialPreference() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false
  }

  return window.matchMedia(QUERY).matches
}

export default function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    getInitialPreference,
  )

  useEffect(() => {
    if (!window.matchMedia) {
      return undefined
    }

    const mediaQuery = window.matchMedia(QUERY)
    const handleChange = (event) => setPrefersReducedMotion(event.matches)

    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}
