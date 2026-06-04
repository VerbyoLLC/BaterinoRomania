import { useState, useEffect, useRef, useCallback } from 'react'

const SLIDES = [
  '/images/slider2mobile/slide1.jpg',
  '/images/slider2mobile/slide2.png',
  '/images/slider2mobile/slide3.jpg',
  '/images/slider2mobile/slide4.jpg',
  '/images/slider2mobile/slide5.jpg',
  '/images/slider2mobile/slide6.jpg',
  '/images/slider2mobile/skide5.jpg',
]

const AUTO_MS = 4000

export default function HomeMobileSlider() {
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length)
    }, AUTO_MS)
  }, [])

  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [startTimer])

  const goTo = (index: number) => {
    setCurrent(index)
    startTimer()
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) {
      setCurrent((c) => dx < 0 ? (c + 1) % SLIDES.length : (c - 1 + SLIDES.length) % SLIDES.length)
      startTimer()
    }
    touchStartX.current = null
  }

  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '9 / 14' }}>
      {/* Track */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out will-change-transform"
        style={{
          width: `${SLIDES.length * 100}%`,
          transform: `translateX(-${current * (100 / SLIDES.length)}%)`,
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {SLIDES.map((src, i) => (
          <div key={src} className="relative h-full shrink-0" style={{ width: `${100 / SLIDES.length}%` }}>
            <img
              src={src}
              alt=""
              aria-hidden
              draggable={false}
              className="h-full w-full object-cover select-none"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-1.5 pointer-events-none">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={`pointer-events-auto h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-6 bg-white shadow' : 'w-1.5 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
