import { useEffect, useRef, useState } from 'react'

function easeOutCubic(progress) {
  return 1 - (1 - progress) ** 3
}

export default function useCountUp(
  target,
  { duration = 700, disabled = false } = {},
) {
  const safeTarget = Number.isFinite(Number(target)) ? Number(target) : 0
  const [animatedValue, setAnimatedValue] = useState(0)
  const valueRef = useRef(0)
  const previousDisabledRef = useRef(disabled)

  // When re-enabling after being disabled, capture the currently displayed
  // value so the animation interpolates smoothly from where it left off.
  useEffect(() => {
    const wasDisabled = previousDisabledRef.current

    if (!disabled && wasDisabled) {
      valueRef.current = animatedValue
    }

    previousDisabledRef.current = disabled
  }, [disabled, animatedValue])

  useEffect(() => {
    if (disabled) {
      return undefined
    }

    const startValue = valueRef.current

    if (startValue === safeTarget) {
      return undefined
    }

    const startTime = performance.now()
    const distance = safeTarget - startValue
    let frameId = null

    const tick = (now) => {
      const progress = Math.min(1, (now - startTime) / duration)
      const nextValue = startValue + distance * easeOutCubic(progress)

      valueRef.current = nextValue
      setAnimatedValue(nextValue)

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick)
      } else {
        valueRef.current = safeTarget
      }
    }

    frameId = window.requestAnimationFrame(tick)

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [disabled, duration, safeTarget])

  // When reduced motion is enabled, return the target immediately without
  // animating. Otherwise return the running animated value.
  return disabled ? safeTarget : animatedValue
}
