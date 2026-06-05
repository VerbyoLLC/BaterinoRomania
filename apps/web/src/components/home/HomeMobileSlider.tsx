import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { BadgePercent, Headphones, ShieldCheck, Truck } from 'lucide-react'
import type { HomeTranslations } from '../../i18n/home'

const SLIDES = [
  '/images/slider2mobile/slide1.jpg',
  '/images/slider2mobile/slide2.png',
  '/images/slider2mobile/slide3.jpg',
  '/images/slider2mobile/slide4.jpg',
  '/images/slider2mobile/slide6.jpg',
  '/images/slider2mobile/skide5.jpg',
]

const CARD_HEIGHT = 450
const AUTO_MS = 4500
const CARD_W = 'calc(100vw - 2.5rem)' // ~85 % viewport, leaving a peek of next card

const textShadow = { textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 2px 10px rgba(0,0,0,0.5)' }

function Dot({ light = false }: { light?: boolean }) {
  return <span className={`mt-[0.35rem] size-1 shrink-0 rounded-full ${light ? 'bg-white/70' : 'bg-slate-400'}`} aria-hidden />
}

// ── Per-slide overlay components ─────────────────────────────────────────────

function SlideRezidential({ tr }: { tr: HomeTranslations }) {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.50) 45%, rgba(0,0,0,0.12) 65%, transparent 80%)' }} aria-hidden />
      <span className="absolute top-4 right-4 z-10 inline-flex rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-black font-['Inter'] pointer-events-none">
        {tr.heroV2MedStockTag}
      </span>
      <div className="absolute inset-x-4 bottom-5 z-10 pointer-events-none" style={textShadow}>
        <p className="mb-1 text-xs font-medium text-white/75 font-['Inter']">{tr.heroV2RezProductSubtitle}</p>
        <h2 className="text-xl font-bold leading-tight text-white font-['Inter']">{tr.heroV2RezProductTitle}</h2>
        <p className="mt-1.5 text-xs text-white/80 font-['Inter']">
          {tr.heroV2RezSpecCicluri}
          <span className="mx-1 text-white/40" aria-hidden>·</span>
          {tr.heroV2RezSpecIp}
          <span className="mx-1 text-white/40" aria-hidden>·</span>
          {tr.heroV2RezSpecChem}
        </p>
        <div className="mt-2.5 rounded-lg border border-white/30 bg-white/20 px-3 py-2 backdrop-blur-md">
          <p className="text-[10px] font-medium text-white/75 font-['Inter']">{tr.heroV2RezPriceLabel}</p>
          <p className="text-xl font-bold leading-none text-white font-['Inter'] tabular-nums">{tr.heroV2RezHeroPrice}</p>
          <p className="mt-0.5 text-xs text-white/85 font-['Inter']">{tr.heroV2RezPriceNote}</p>
        </div>
        <Link to="/produse?sector=rezidential" className="mt-3 pointer-events-auto inline-flex h-10 w-full items-center justify-center rounded-[8px] bg-white px-4 text-sm font-bold uppercase text-black font-['Inter'] [text-shadow:none] hover:bg-neutral-100 active:bg-neutral-200 transition-colors">
          {tr.heroCardCta}
        </Link>
      </div>
    </>
  )
}

function SlideReduceri({ tr }: { tr: HomeTranslations }) {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.48) 50%, rgba(0,0,0,0.12) 70%, transparent 85%)' }} aria-hidden />
      <div className="absolute inset-x-4 bottom-5 z-10 flex flex-col items-center text-center gap-3 pointer-events-none" style={textShadow}>
        <img src="/images/shared/baterino-logo-white.png" alt="Baterino" draggable={false} className="h-5 w-auto object-contain [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.85))]" />
        <h2 className="text-xl font-bold leading-tight uppercase text-white font-['Inter']">{tr.heroV2Card2Title}</h2>
        <p className="text-sm font-normal leading-snug normal-case text-white font-['Inter']">{tr.heroV2Card2Subtitle}</p>
        <Link to="/reduceri" className="pointer-events-auto w-full h-10 bg-white rounded-[8px] inline-flex justify-center items-center text-black text-sm font-bold font-['Inter'] uppercase [text-shadow:none] hover:bg-neutral-100 active:bg-neutral-200 transition-colors">
          {tr.heroV2Card2Cta}
        </Link>
      </div>
    </>
  )
}

function SlideRezidentialAlt({ tr }: { tr: HomeTranslations }) {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.84) 0%, rgba(0,0,0,0.48) 45%, rgba(0,0,0,0.10) 65%, transparent 80%)' }} aria-hidden />
      <span className="absolute top-4 right-4 z-10 inline-flex rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-black font-['Inter'] pointer-events-none">
        {tr.heroV2MedStockTag}
      </span>
      <div className="absolute inset-x-4 bottom-5 z-10 pointer-events-none" style={textShadow}>
        <p className="mb-1 text-xs font-medium text-white/75 font-['Inter']">{tr.heroV2RezProductSubtitle}</p>
        <h2 className="text-xl font-bold leading-tight text-white font-['Inter']">{tr.heroV2RezProductTitle}</h2>
        <ul className="mt-3 space-y-2">
          {[tr.heroV2RezBadgeGarantie, tr.heroV2RezBadgeService, tr.heroV2RezBadgeSwap].map((label) => (
            <li key={label} className="flex items-start gap-2 text-sm text-white/90 font-['Inter']">
              <Dot light />
              {label}
            </li>
          ))}
        </ul>
        <Link to="/produse?sector=rezidential" className="mt-4 pointer-events-auto inline-flex h-10 w-full items-center justify-center rounded-[8px] bg-white px-4 text-sm font-bold uppercase text-black font-['Inter'] [text-shadow:none] hover:bg-neutral-100 active:bg-neutral-200 transition-colors">
          {tr.heroCardCta}
        </Link>
      </div>
    </>
  )
}

function SlideMedical({ tr }: { tr: HomeTranslations }) {
  const specs = [
    { label: tr.heroV2MedSpecCapacityLabel, value: tr.heroV2MedSpecCapacityValue },
    { label: tr.heroV2MedSpecPowerLabel, value: tr.heroV2MedSpecPowerValue },
    { label: tr.heroV2MedSpecCyclesLabel, value: tr.heroV2MedSpecCyclesValue },
    { label: tr.heroV2MedSpecRetentionLabel, value: tr.heroV2MedSpecRetentionValue },
  ]
  return (
    <>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.84) 0%, rgba(0,0,0,0.50) 50%, rgba(0,0,0,0.12) 68%, transparent 82%)' }} aria-hidden />
      <span className="absolute top-4 right-4 z-10 inline-flex rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-black font-['Inter'] pointer-events-none">
        {tr.heroV2MedStockTag}
      </span>
      <div className="absolute inset-x-4 bottom-5 z-10 pointer-events-none" style={textShadow}>
        <p className="mb-1 text-sm font-semibold text-white/90 font-['Inter']">{tr.heroV2MedEyebrow}</p>
        <h2 className="text-xl font-bold leading-tight text-white font-['Inter']">{tr.heroV2MedProductTitle}</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {specs.map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-white/30 bg-white/20 px-2.5 py-2 backdrop-blur-md">
              <p className="text-[10px] font-medium uppercase tracking-wide text-white/70 font-['Inter']">{label}</p>
              <p className="mt-0.5 text-sm font-semibold leading-tight text-white font-['Inter'] tabular-nums">{value}</p>
            </div>
          ))}
        </div>
        <Link to="/divizii/medical" className="mt-3 pointer-events-auto inline-flex h-10 w-full items-center justify-center rounded-[8px] bg-white px-4 text-sm font-bold uppercase text-black font-['Inter'] [text-shadow:none] hover:bg-neutral-100 active:bg-neutral-200 transition-colors">
          {tr.heroV2MedCta}
        </Link>
      </div>
    </>
  )
}

function SlideMaritim({ tr }: { tr: HomeTranslations }) {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.10) 66%, transparent 82%)' }} aria-hidden />
      <div className="absolute inset-x-4 bottom-5 z-10 flex flex-col items-center text-center gap-3 pointer-events-none" style={textShadow}>
        <img src="/images/lithtech/logo-baterino-pro-white.png" alt="Baterino Pro" draggable={false} className="h-5 w-auto object-contain [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.85))]" />
        <h2 className="text-xl font-bold leading-tight uppercase text-white whitespace-pre-line font-['Inter']">{tr.heroV2Card3Title}</h2>
        <p className="text-sm font-normal leading-snug normal-case text-white whitespace-pre-line font-['Inter']">{tr.heroV2Card3Subtitle}</p>
        <Link to="/studii-de-caz" className="pointer-events-auto w-full h-10 bg-white rounded-[8px] inline-flex justify-center items-center text-black text-sm font-bold font-['Inter'] uppercase [text-shadow:none] hover:bg-neutral-100 active:bg-neutral-200 transition-colors">
          {tr.heroV2Card3Cta}
        </Link>
      </div>
    </>
  )
}

function SlideInstalatori({ tr }: { tr: HomeTranslations }) {
  const benefits = [tr.heroV2InstBenefit1, tr.heroV2InstBenefit2, tr.heroV2InstBenefit3, tr.heroV2InstBenefit4]
  const icons = [BadgePercent, ShieldCheck, Truck, Headphones]
  return (
    <>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.56) 50%, rgba(0,0,0,0.15) 68%, transparent 82%)' }} aria-hidden />
      <div className="absolute inset-x-4 bottom-5 z-10 pointer-events-none" style={textShadow}>
        <p className="mb-1 text-xs font-medium tracking-wide text-white/75 font-['Inter']">{tr.heroV2InstLead}</p>
        <h2 className="text-xl font-bold leading-tight uppercase text-white font-['Inter']">{tr.heroV2InstTitle}</h2>
        <div className="mt-3 rounded-lg border border-white/80 bg-white/20 px-3 py-3 backdrop-blur-md [text-shadow:none]">
          <ul className="space-y-2">
            {benefits.map((label, i) => {
              const Icon = icons[i]
              return (
                <li key={label} className="flex items-start gap-2 text-xs leading-snug text-white/90 font-['Inter']">
                  <Icon className="mt-0.5 size-4 shrink-0 text-white" strokeWidth={1.75} aria-hidden />
                  {label}
                </li>
              )
            })}
          </ul>
        </div>
        <Link to="/instalatori" className="mt-3 pointer-events-auto inline-flex h-10 w-full items-center justify-center rounded-[8px] bg-white px-4 text-sm font-bold uppercase text-black font-['Inter'] [text-shadow:none] hover:bg-neutral-100 active:bg-neutral-200 transition-colors">
          {tr.heroV2InstCta}
        </Link>
      </div>
    </>
  )
}

// ── Main slider ───────────────────────────────────────────────────────────────

type Props = { tr: HomeTranslations }

export default function HomeMobileSlider({ tr }: Props) {
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), AUTO_MS)
  }, [])

  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [startTimer])

  const goTo = (index: number) => { setCurrent(index); startTimer() }

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) {
      setCurrent((c) => dx < 0 ? (c + 1) % SLIDES.length : (c - 1 + SLIDES.length) % SLIDES.length)
      startTimer()
    }
    touchStartX.current = null
  }

  const overlays = [
    <SlideReduceri tr={tr} />,
    <SlideRezidentialAlt tr={tr} />,
    <SlideRezidential tr={tr} />,
    <SlideMaritim tr={tr} />,
    <SlideMedical tr={tr} />,
    <SlideInstalatori tr={tr} />,
  ]

  return (
    <section className="mb-10 w-full" aria-label="Hero">
      {/* Title — same as HomeHeroV2 */}
      <header className="mb-6 px-5 text-center">
        <h1 className="text-black text-3xl font-extrabold font-['Inter'] leading-tight">
          {tr.heroV2Title}
        </h1>
      </header>

      {/* Card track — overflow visible so next card peeks */}
      <div className="relative w-full overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform"
          style={{
            paddingLeft: '1.25rem',
            gap: '0.75rem',
            transform: `translateX(calc(-${current} * (${CARD_W} + 0.75rem)))`,
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {SLIDES.map((src, i) => (
            <div
              key={src}
              className="relative flex-shrink-0 overflow-hidden rounded-xl bg-zinc-300"
              style={{ width: CARD_W, height: CARD_HEIGHT }}
            >
              <img
                src={src}
                alt=""
                aria-hidden
                draggable={false}
                loading={i === 0 ? 'eager' : 'lazy'}
                className="h-full w-full object-cover select-none"
              />
              {overlays[i]}
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators — same style as HomeHeroV2 */}
      <div className="flex justify-center gap-2 mt-5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            aria-current={i === current ? 'true' : undefined}
            className={`size-2.5 rounded-full transition-colors ${i === current ? 'bg-black' : 'bg-black/30'}`}
          />
        ))}
      </div>
    </section>
  )
}
