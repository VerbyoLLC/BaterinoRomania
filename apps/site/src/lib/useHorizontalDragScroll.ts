import { useRef, useCallback, useState, useEffect, type RefObject } from 'react'
import { applyScrollMomentum, pointerVelocityToScrollVelocity } from './smoothHorizontalScroll'

type UseHorizontalDragScrollOptions = {
  onDragStart?: () => void
  /** Called after drag/momentum ends; use to snap to nearest slide. */
  onDragEnd?: (wasDragged: boolean) => void
  /** Apply inertial scroll on release (mouse only). Default true. */
  momentum?: boolean
  /** Limit how far the strip can scroll. */
  getScrollBounds?: () => { min: number; max: number }
}

/** Mouse drag to scroll horizontally; touch uses native pan on the strip. */
export function useHorizontalDragScroll<T extends HTMLElement>(
  scrollRef: RefObject<T | null>,
  options?: UseHorizontalDragScrollOptions,
) {
  const [isDragging, setIsDragging] = useState(false)
  const isDraggingRef = useRef(false)
  const onDragStartRef = useRef(options?.onDragStart)
  const onDragEndRef = useRef(options?.onDragEnd)
  const momentumEnabled = options?.momentum !== false
  const getScrollBoundsRef = useRef(options?.getScrollBounds)
  onDragStartRef.current = options?.onDragStart
  onDragEndRef.current = options?.onDragEnd
  getScrollBoundsRef.current = options?.getScrollBounds

  const clampScroll = (target: HTMLElement) => {
    const bounds = getScrollBoundsRef.current?.()
    if (!bounds) return
    if (target.scrollLeft < bounds.min) target.scrollLeft = bounds.min
    else if (target.scrollLeft > bounds.max) target.scrollLeft = bounds.max
  }

  const cleanupRef = useRef<(() => void) | null>(null)
  const momentumAnimRef = useRef<{ cancel: () => void } | null>(null)
  const isMomentumRef = useRef(false)

  useEffect(() => {
    return () => {
      cleanupRef.current?.()
      momentumAnimRef.current?.cancel()
    }
  }, [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent<T>) => {
      if (e.pointerType === 'touch' || e.button !== 0) return
      const el = scrollRef.current
      if (!el) return

      cleanupRef.current?.()
      momentumAnimRef.current?.cancel()
      momentumAnimRef.current = null
      isMomentumRef.current = false

      const samples: Array<{ x: number; t: number }> = []
      const state = {
        pointerId: e.pointerId,
        startX: e.clientX,
        lastX: e.clientX,
        dragged: false,
      }

      const finish = (wasDragged: boolean) => {
        cleanupRef.current = null
        isDraggingRef.current = false
        setIsDragging(false)
        el.style.scrollBehavior = ''
        onDragEndRef.current?.(wasDragged)
      }

      const onMove = (ev: PointerEvent) => {
        if (ev.pointerId !== state.pointerId) return
        const dx = ev.clientX - state.lastX
        state.lastX = ev.clientX

        if (!state.dragged) {
          if (Math.abs(ev.clientX - state.startX) <= 3) return
          state.dragged = true
          isDraggingRef.current = true
          setIsDragging(true)
          el.style.scrollBehavior = 'auto'
          onDragStartRef.current?.()
          try {
            el.setPointerCapture(ev.pointerId)
          } catch {
            /* already captured */
          }
        }

        samples.push({ x: ev.clientX, t: performance.now() })
        if (samples.length > 8) samples.shift()

        ev.preventDefault()
        el.scrollLeft -= dx
        clampScroll(el)
      }

      const onUp = (ev: PointerEvent) => {
        if (ev.pointerId !== state.pointerId) return
        document.removeEventListener('pointermove', onMove)
        document.removeEventListener('pointerup', onUp)
        document.removeEventListener('pointercancel', onUp)
        try {
          el.releasePointerCapture(ev.pointerId)
        } catch {
          /* already released */
        }

        const wasDragged = state.dragged
        if (wasDragged) {
          const swallowClick = (clickEv: MouseEvent) => {
            clickEv.preventDefault()
            clickEv.stopImmediatePropagation()
            el.removeEventListener('click', swallowClick, true)
          }
          el.addEventListener('click', swallowClick, true)
          window.setTimeout(() => el.removeEventListener('click', swallowClick, true), 100)
        }

        cleanupRef.current = null
        isDraggingRef.current = false
        setIsDragging(false)
        el.style.scrollBehavior = ''
        clampScroll(el)

        if (wasDragged && momentumEnabled) {
          const velocity = pointerVelocityToScrollVelocity(samples) * 0.55
          if (Math.abs(velocity) > 0.02) {
            const bounds = getScrollBoundsRef.current?.()
            isMomentumRef.current = true
            momentumAnimRef.current = applyScrollMomentum(
              el,
              velocity,
              () => {
                momentumAnimRef.current = null
                isMomentumRef.current = false
                onDragEndRef.current?.(true)
              },
              bounds?.min,
              bounds?.max,
            )
            return
          }
        }

        finish(wasDragged)
      }

      document.addEventListener('pointermove', onMove)
      document.addEventListener('pointerup', onUp)
      document.addEventListener('pointercancel', onUp)
      cleanupRef.current = () => {
        document.removeEventListener('pointermove', onMove)
        document.removeEventListener('pointerup', onUp)
        document.removeEventListener('pointercancel', onUp)
        momentumAnimRef.current?.cancel()
        momentumAnimRef.current = null
        isMomentumRef.current = false
        isDraggingRef.current = false
        setIsDragging(false)
        el.style.scrollBehavior = ''
      }
    },
    [scrollRef, momentumEnabled],
  )

  return { isDragging, isDraggingRef, isMomentumRef, onPointerDown }
}
