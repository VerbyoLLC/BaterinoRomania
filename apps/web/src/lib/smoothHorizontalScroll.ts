const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

type ScrollAnimation = {
  cancel: () => void
}

/** Animate scrollLeft with easing; returns cancel handle. */
export function smoothScrollTo(
  el: HTMLElement,
  targetLeft: number,
  duration = 480,
  minLeft?: number,
  maxLeft?: number,
  onComplete?: () => void,
): ScrollAnimation {
  const start = el.scrollLeft
  const min = minLeft ?? 0
  const max = maxLeft ?? Math.max(0, el.scrollWidth - el.clientWidth)
  const target = Math.min(max, Math.max(min, targetLeft))
  const change = target - start
  const startTime = performance.now()
  let raf = 0
  let cancelled = false

  const step = (now: number) => {
    if (cancelled) return
    const t = Math.min(1, (now - startTime) / duration)
    el.scrollLeft = start + change * easeOutCubic(t)
    if (el.scrollLeft < min) el.scrollLeft = min
    else if (el.scrollLeft > max) el.scrollLeft = max
    if (t < 1) {
      raf = requestAnimationFrame(step)
    } else {
      onComplete?.()
    }
  }

  raf = requestAnimationFrame(step)
  return {
    cancel: () => {
      cancelled = true
      if (raf) cancelAnimationFrame(raf)
    },
  }
}

/** Inertial scroll after drag release; velocity in scrollLeft px/ms. */
export function applyScrollMomentum(
  el: HTMLElement,
  velocityPxMs: number,
  onComplete?: () => void,
  minLeft?: number,
  maxLeft?: number,
): ScrollAnimation {
  let velocity = velocityPxMs
  let lastTime = performance.now()
  let raf = 0
  const friction = 0.92
  const minVelocity = 0.02

  const step = (now: number) => {
    const dt = Math.min(32, now - lastTime)
    lastTime = now
    el.scrollLeft += velocity * dt
    velocity *= friction ** (dt / 16.67)

    const min = minLeft ?? 0
    const max = maxLeft ?? Math.max(0, el.scrollWidth - el.clientWidth)
    if (el.scrollLeft <= min) {
      el.scrollLeft = min
      velocity = 0
    } else if (el.scrollLeft >= max) {
      el.scrollLeft = max
      velocity = 0
    }

    if (Math.abs(velocity) > minVelocity) {
      raf = requestAnimationFrame(step)
    } else {
      onComplete?.()
    }
  }

  if (Math.abs(velocity) > minVelocity) {
    raf = requestAnimationFrame(step)
  } else {
    onComplete?.()
  }

  return {
    cancel: () => {
      if (raf) cancelAnimationFrame(raf)
    },
  }
}

/** Recent pointer velocity mapped to scrollLeft px/ms. */
export function pointerVelocityToScrollVelocity(
  samples: ReadonlyArray<{ x: number; t: number }>,
): number {
  if (samples.length < 2) return 0
  const first = samples[0]
  const last = samples[samples.length - 1]
  const dt = last.t - first.t
  if (dt <= 0) return 0
  return -(last.x - first.x) / dt
}
