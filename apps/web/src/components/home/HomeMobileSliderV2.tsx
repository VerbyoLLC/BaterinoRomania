import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Award,
  BadgePercent,
  Clock,
  Droplets,
  Headphones,
  Home,
  Percent,
  Shield,
  ShieldCheck,
  Truck,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { HomeTranslations } from '../../i18n/home'

/** Card dimensions — shorter than desktop, wider to fill more of the viewport. */
const CARD_H = 450
const CARD_W = 'calc(100vw - 3.5rem)' // leaves ~24 px of next card peeking on 390 px phones

/** 20 px = pl-5 — must match the container's padding-left. */
const SCROLL_PAD = 20

/** 5 slides: oferta + bess + instalatori details moved into modals. */
export const MOBILE_SLIDE_V2_COUNT = 5

// ── helpers ────────────────────────────────────────────────────────────────────

/** Returns only the real slide elements, skipping the trailing spacer. */
function getSlideEls(el: HTMLDivElement): HTMLElement[] {
  return Array.from(el.children).filter(
    (n): n is HTMLElement =>
      n instanceof HTMLElement && n.getAttribute('aria-hidden') !== 'true',
  )
}

// ── Shared sub-components ──────────────────────────────────────────────────────



// ── Oferta details modal (bottom sheet) ──────────────────────────────────────

function OfertaDetailsModal({
  tr,
  onClose,
}: {
  tr: HomeTranslations
  onClose: () => void
}) {
  const specs = [
    { label: tr.promoModalSpecCapacityLabel, value: tr.promoModalSpecCapacityValue },
    { label: tr.promoModalSpecConfigLabel, value: tr.promoModalSpecConfigValue },
    { label: tr.promoModalSpecLifecycleLabel, value: tr.promoModalSpecLifecycleValue },
    { label: tr.promoModalSpecConnectivityLabel, value: tr.promoModalSpecConnectivityValue },
  ]
  const benefits: { icon: LucideIcon; title: string; subtitle: string }[] = [
    { icon: Shield, title: tr.promoModalBenefit1Title, subtitle: tr.heroPromoBenefit1Subtitle },
    { icon: Home, title: tr.promoModalBenefit2Title, subtitle: tr.heroPromoBenefit2Subtitle },
    { icon: Activity, title: tr.heroPromoBenefitCareTitle, subtitle: tr.heroPromoBenefitCareSubtitle },
    { icon: Truck, title: tr.promoModalDeliveryTitle, subtitle: tr.promoModalDeliverySubtitle },
  ]

  useEffect(() => {
    const scrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      role="dialog"
      aria-modal="true"
      aria-label="Promotia Baterino"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />

      {/* Sheet */}
      <div
        className="relative w-full max-h-[92dvh] rounded-t-3xl bg-white shadow-2xl animate-slide-up-from-bottom flex flex-col overflow-hidden"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Image header ── */}
        <div className="relative h-52 shrink-0 bg-neutral-900 overflow-hidden">
          <img
            src="/images/home/offer-baterino.jpg"
            alt=""
            className="h-full w-full object-cover opacity-80 scale-105 [filter:blur(2px)]"
          />
          {/* Gradient so text reads cleanly */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex size-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm hover:bg-black/50 active:bg-black/60 transition-colors"
            aria-label="Închide"
          >
            <X className="size-4" />
          </button>

          {/* Drag handle — white on dark bg */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 h-1 w-10 rounded-full bg-white/30" />

          {/* Title + price */}
          <div className="absolute bottom-5 left-5 right-5 z-10">
            <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white font-['Inter']">
              <Percent className="size-3 shrink-0" aria-hidden />
              Promotie · Stoc Limitat
            </span>
            <h3 className="m-0 text-2xl font-extrabold leading-tight text-white font-['Inter']">
              {tr.promoModalTitleLine1}
              <br />
              {tr.promoModalTitleLine2}
            </h3>
            <p className="m-0 mt-1 text-xs font-medium text-white/55 font-['Inter']">
              {tr.promoModalVatNote}
            </p>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* Description */}
          <p className="px-5 pt-4 pb-1 text-sm font-normal leading-snug text-slate-500 font-['Inter']">
            {tr.heroPromoPackageDescription}
          </p>

          {/* Benefits — horizontal scroll slider (dark) */}
          <div className="flex gap-2 overflow-x-auto px-5 py-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {benefits.map((b) => (
              <div key={b.title} className="shrink-0 flex items-center gap-2.5 rounded-xl bg-slate-900 px-3 py-3 min-w-[130px]">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <b.icon className="size-4 text-white" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="m-0 text-xs font-semibold leading-tight text-white font-['Inter']">
                    {b.title}
                  </p>
                  {b.subtitle ? (
                    <p className="m-0 mt-0.5 text-[10px] leading-snug text-white/60 font-['Inter']">
                      {b.subtitle}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="mx-5 border-t border-neutral-100" />

          {/* Specs — 2×2 grey boxes */}
          <div className="grid grid-cols-2 gap-2 px-5 py-3">
            {specs.map((s) => (
              <div key={s.label} className="rounded-xl bg-neutral-100 px-3.5 py-3">
                <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-400 font-['Inter'] leading-tight">
                  {s.label}
                </p>
                <p className="m-0 mt-1 text-base font-bold leading-tight text-slate-900 font-['Inter'] tabular-nums">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sticky CTA ── */}
        <div className="px-5 pt-3 border-t border-neutral-100">
          <Link
            to="/produse/baterii-solare/20kwh-2-x-10kwh-ecohome-10-10kwh"
            className="inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-700 active:bg-slate-800"
          >
            {tr.promoModalCtaPrimary}
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Slide 1: Oferta — image (with "View details" button) ─────────────────────

function SlideOfertaImage({
  tr,
  onOpenDetails,
}: {
  tr: HomeTranslations
  onOpenDetails: () => void
}) {
  return (
    <div className="absolute inset-0 bg-neutral-100">
      <img
        src="/images/slider2/card1-mobile.jpg"
        alt=""
        fetchPriority="high"
        className="h-full w-full object-cover object-center"
      />
      {/* Top gradient for the tag */}
      <div
        className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/50 to-transparent"
        aria-hidden
      />
      {/* Bottom gradient for title + CTA */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/35 to-transparent"
        aria-hidden
      />
      {/* Tag — top */}
      <div className="absolute inset-x-4 top-5 z-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1.5 text-sm font-bold text-white font-['Inter']">
          <Percent className="size-3.5 shrink-0" aria-hidden />
          Promotie · Stoc Limitat
        </span>
      </div>
      {/* Title + CTA — bottom */}
      <div className="absolute inset-x-4 bottom-5 z-10">
        <h3 className="m-0 text-[1.75rem] font-extrabold leading-tight text-white font-['Inter']">
          {tr.promoModalTitleLine1}
          <br />
          <span>{tr.promoModalTitleLine2}</span>
        </h3>
        <p className="m-0 mt-1 text-sm font-medium text-white/60 font-['Inter']">
          {tr.promoModalVatNote}
        </p>
        <button
          type="button"
          onClick={onOpenDetails}
          className="mt-3 w-full h-10 bg-white rounded-[8px] inline-flex justify-center items-center text-black text-sm font-bold font-['Inter'] uppercase hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
        >
          Vezi detalii
        </button>
      </div>
    </div>
  )
}

// ── Slide 3: Reduceri ─────────────────────────────────────────────────────────

function SlideReduceri({ tr }: { tr: HomeTranslations }) {
  return (
    <div className="absolute inset-0">
      <img src="/images/slider2/slide1.jpg" alt="" className="h-full w-full object-cover" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.48) 50%, rgba(0,0,0,0.12) 70%, transparent 85%)',
        }}
        aria-hidden
      />
      <div
        className="absolute inset-x-4 bottom-5 z-10 flex flex-col items-center text-center gap-3"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 2px 10px rgba(0,0,0,0.5)' }}
      >
        <img
          src="/images/shared/baterino-logo-white.png"
          alt="Baterino"
          draggable={false}
          className="h-5 w-auto object-contain [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.85))] pointer-events-none"
        />
        <h3 className="text-xl font-bold leading-tight uppercase text-white font-['Inter'] pointer-events-none">
          {tr.heroV2Card2Title}
        </h3>
        <p className="text-sm font-normal leading-snug normal-case text-white font-['Inter'] pointer-events-none">
          {tr.heroV2Card2Subtitle}
        </p>
        <Link
          to="/reduceri"
          className="w-full h-10 bg-white rounded-[8px] inline-flex justify-center items-center text-black text-sm font-bold font-['Inter'] uppercase [text-shadow:none] hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
        >
          {tr.heroV2Card2Cta}
        </Link>
      </div>
    </div>
  )
}

// ── BESS details modal (bottom sheet) ────────────────────────────────────────

function BessDetailsModal({
  tr,
  onClose,
}: {
  tr: HomeTranslations
  onClose: () => void
}) {
  const specs = [
    { label: tr.heroV2MedSpecCapacityLabel, value: tr.heroV2MedSpecCapacityValue },
    { label: tr.heroV2MedSpecPowerLabel, value: tr.heroV2MedSpecPowerValue },
    { label: tr.heroV2MedSpecCyclesLabel, value: tr.heroV2MedSpecCyclesValue },
    { label: tr.heroV2MedSpecRetentionLabel, value: tr.heroV2MedSpecRetentionValue },
  ]
  const benefits: { icon: LucideIcon; title: string }[] = [
    { icon: Droplets, title: tr.heroV2MedCardFeatureCooling },
    { icon: Award, title: tr.heroV2MedCardFeatureCert },
    { icon: Shield, title: tr.heroV2MedCardFeatureWarranty },
    { icon: Zap, title: tr.heroV2MedCardFeatureEfficiency },
  ]

  useEffect(() => {
    const scrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      role="dialog"
      aria-modal="true"
      aria-label="BESS Industrial"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />

      <div
        className="relative w-full max-h-[92dvh] rounded-t-3xl bg-white shadow-2xl animate-slide-up-from-bottom flex flex-col overflow-hidden"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image header */}
        <div className="relative h-52 shrink-0 bg-neutral-900 overflow-hidden">
          <img
            src="/images/slider2/bess-baterino-card.jpg"
            alt=""
            className="h-full w-full object-cover opacity-80 scale-105 [filter:blur(2px)]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex size-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm hover:bg-black/50 active:bg-black/60 transition-colors"
            aria-label="Închide"
          >
            <X className="size-4" />
          </button>

          <div className="absolute top-3 left-1/2 -translate-x-1/2 h-1 w-10 rounded-full bg-white/30" />

          <div className="absolute bottom-5 left-5 right-5 z-10">
            <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white font-['Inter']">
              <Clock className="size-3 shrink-0" aria-hidden />
              {tr.heroV2MedCardWarrantyTag}
            </span>
            <h3 className="m-0 text-2xl font-extrabold leading-tight text-white font-['Inter']">
              <span className="block">{tr.heroV2MedCardTitleLine1}</span>
              <span className="block">{tr.heroV2MedCardTitleLine2}</span>
              <span className="block">{tr.heroV2MedCardTitleLine3}</span>
            </h3>
            <p className="m-0 mt-1 text-xs font-medium text-white/55 font-['Inter']">
              {tr.heroV2MedCardPriceNote}
            </p>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <p className="px-5 pt-4 pb-1 text-sm font-normal leading-snug text-slate-500 font-['Inter']">
            {tr.heroV2MedCardUseCaseNote}
          </p>

          {/* Benefits — horizontal scroll slider */}
          <div className="flex gap-2 overflow-x-auto px-5 py-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {benefits.map((b) => (
              <div key={b.title} className="shrink-0 flex items-center gap-2.5 rounded-xl bg-slate-900 px-3 py-3 min-w-[130px]">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <b.icon className="size-4 text-white" aria-hidden />
                </div>
                <p className="m-0 text-xs font-semibold leading-tight text-white font-['Inter']">
                  {b.title}
                </p>
              </div>
            ))}
          </div>

          <div className="mx-5 border-t border-neutral-100" />

          {/* Specs — 2×2 grey boxes */}
          <div className="grid grid-cols-2 gap-2 px-5 py-3">
            {specs.map((s) => (
              <div key={s.label} className="rounded-xl bg-neutral-100 px-3.5 py-3">
                <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-400 font-['Inter'] leading-tight">
                  {s.label}
                </p>
                <p className="m-0 mt-1 text-base font-bold leading-tight text-slate-900 font-['Inter'] tabular-nums">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky CTA */}
        <div className="px-5 pt-3 border-t border-neutral-100">
          <Link
            to="/divizii/medical"
            className="inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-700 active:bg-slate-800"
          >
            {tr.heroV2MedCta}
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Slide 3: BESS Industrial — image (with "View details" button) ─────────────

function SlideBessImage({
  tr,
  onOpenDetails,
}: {
  tr: HomeTranslations
  onOpenDetails: () => void
}) {
  return (
    <div className="absolute inset-0 bg-neutral-100">
      <img
        src="/images/slider2/bess-baterino-card.jpg"
        alt=""
        className="h-full w-full object-cover object-center"
      />
      {/* Top gradient for tag */}
      <div
        className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/50 to-transparent"
        aria-hidden
      />
      {/* Bottom gradient for title + CTA */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/35 to-transparent"
        aria-hidden
      />
      {/* Tag — top */}
      <div className="absolute inset-x-4 top-5 z-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1.5 text-sm font-bold text-white font-['Inter']">
          <Clock className="size-3.5 shrink-0" aria-hidden />
          {tr.heroV2MedCardWarrantyTag}
        </span>
      </div>
      {/* Title + CTA — bottom */}
      <div className="absolute inset-x-4 bottom-5 z-10">
        <h3 className="m-0 text-[1.75rem] font-extrabold leading-tight text-white font-['Inter']">
          <span className="block">{tr.heroV2MedCardTitleLine1}</span>
          <span className="block">{tr.heroV2MedCardTitleLine2}</span>
          <span className="block">{tr.heroV2MedCardTitleLine3}</span>
        </h3>
        <p className="m-0 mt-1 text-xs font-medium text-white/55 font-['Inter']">
          {tr.heroV2MedCardPriceNote}
        </p>
        <button
          type="button"
          onClick={onOpenDetails}
          className="mt-3 w-full h-10 bg-white rounded-[8px] inline-flex justify-center items-center text-black text-sm font-bold font-['Inter'] uppercase hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
        >
          Vezi detalii
        </button>
      </div>
    </div>
  )
}

// ── Slide 6: Proiecte Industriale ─────────────────────────────────────────────

function SlideProiecte({ tr }: { tr: HomeTranslations }) {
  return (
    <div className="absolute inset-0">
      <img src="/images/slider2/slider3.jpg" alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/45 pointer-events-none" aria-hidden />
      <div
        className="absolute inset-x-4 bottom-5 z-10 flex flex-col items-center text-center gap-3"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 2px 10px rgba(0,0,0,0.5)' }}
      >
        <img
          src="/images/lithtech/logo-baterino-pro-white.png"
          alt="Baterino Pro"
          draggable={false}
          className="h-5 w-auto object-contain [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.85))] pointer-events-none"
        />
        <h3 className="text-xl font-bold leading-tight uppercase text-white whitespace-pre-line font-['Inter'] pointer-events-none">
          {tr.heroV2Card3Title}
        </h3>
        <p className="text-sm font-normal leading-snug normal-case text-white whitespace-pre-line font-['Inter'] pointer-events-none">
          {tr.heroV2Card3Subtitle}
        </p>
        <button
          type="button"
          onClick={() =>
            document.getElementById('proiecte-industriale')?.scrollIntoView({ behavior: 'smooth' })
          }
          className="w-full h-10 bg-white rounded-[8px] inline-flex justify-center items-center text-black text-sm font-bold font-['Inter'] uppercase [text-shadow:none] hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
        >
          {tr.heroV2Card3Cta}
        </button>
      </div>
    </div>
  )
}

// ── Slide 7: Instalatori — image ──────────────────────────────────────────────

function SlideInstalatoriImage({
  tr,
  onOpenDetails,
}: {
  tr: HomeTranslations
  onOpenDetails: () => void
}) {
  return (
    <div className="absolute inset-0 bg-neutral-900">
      <img
        src="/images/home/slider-apple/slide4-instalatori.jpg"
        alt=""
        className="h-full w-full object-cover object-center"
      />
      {/* Top gradient for tag */}
      <div
        className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/50 to-transparent"
        aria-hidden
      />
      {/* Bottom gradient for title + CTA */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
        aria-hidden
      />
      {/* Tag — top */}
      <div className="absolute inset-x-4 top-5 z-10">
        <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-900 font-['Inter']">
          {tr.heroV2InstNetworkTag}
        </span>
      </div>
      {/* Title + CTA — bottom */}
      <div className="absolute inset-x-4 bottom-5 z-10">
        <p className="m-0 mb-1.5 text-sm font-medium text-white/65 font-['Inter']">
          {tr.heroV2InstLead}
        </p>
        <h3 className="m-0 text-[1.75rem] font-extrabold leading-tight uppercase text-white font-['Inter']">
          {tr.heroV2InstTitle}
        </h3>
        <button
          type="button"
          onClick={onOpenDetails}
          className="mt-3 w-full h-10 bg-white rounded-[8px] inline-flex justify-center items-center text-black text-sm font-bold font-['Inter'] uppercase hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
        >
          Vezi detalii
        </button>
      </div>
    </div>
  )
}

// ── Instalatori details modal (bottom sheet) ─────────────────────────────────

function InstalatoriDetailsModal({
  tr,
  onClose,
}: {
  tr: HomeTranslations
  onClose: () => void
}) {
  const benefits: { icon: LucideIcon; title: string; subtitle: string }[] = [
    { icon: BadgePercent, title: tr.heroV2InstBenefit1Title, subtitle: tr.heroV2InstBenefit1 },
    { icon: ShieldCheck, title: tr.heroV2InstBenefit2Title, subtitle: tr.heroV2InstBenefit2 },
    { icon: Truck, title: tr.heroV2InstBenefit3Title, subtitle: tr.heroV2InstBenefit3 },
    { icon: Headphones, title: tr.heroV2InstBenefit4Title, subtitle: tr.heroV2InstBenefit4 },
  ]

  useEffect(() => {
    const scrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      role="dialog"
      aria-modal="true"
      aria-label="Instalatori Baterino"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />

      <div
        className="relative w-full max-h-[92dvh] rounded-t-3xl bg-white shadow-2xl animate-slide-up-from-bottom flex flex-col overflow-hidden"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image header */}
        <div className="relative h-52 shrink-0 bg-neutral-900 overflow-hidden">
          <img
            src="/images/home/slider-apple/slide4-instalatori.jpg"
            alt=""
            className="h-full w-full object-cover opacity-80 scale-105 [filter:blur(2px)]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex size-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm hover:bg-black/50 active:bg-black/60 transition-colors"
            aria-label="Închide"
          >
            <X className="size-4" />
          </button>

          <div className="absolute top-3 left-1/2 -translate-x-1/2 h-1 w-10 rounded-full bg-white/30" />

          <div className="absolute bottom-5 left-5 right-5 z-10">
            <span className="mb-2.5 inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-900 font-['Inter']">
              {tr.heroV2InstNetworkTag}
            </span>
            <p className="m-0 mb-1 text-sm font-medium text-white/65 font-['Inter']">
              {tr.heroV2InstLead}
            </p>
            <h3 className="m-0 text-2xl font-extrabold leading-tight uppercase text-white font-['Inter']">
              {tr.heroV2InstTitle}
            </h3>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <p className="px-5 pt-4 pb-1 text-sm font-normal leading-snug text-slate-500 font-['Inter']">
            {tr.heroV2InstIntro}
          </p>

          {/* Benefits — 2×2 grid (dark) */}
          <div className="grid grid-cols-2 gap-2 px-5 py-3">
            {benefits.map((b) => (
              <div key={b.title} className="flex items-center gap-2.5 rounded-xl bg-slate-900 px-3 py-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <b.icon className="size-4 text-white" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="m-0 text-xs font-semibold leading-tight text-white font-['Inter']">
                    {b.title}
                  </p>
                  <p className="m-0 mt-0.5 text-[10px] leading-snug text-white/60 font-['Inter']">
                    {b.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky CTA */}
        <div className="px-5 pt-3 border-t border-neutral-100">
          <Link
            to="/instalatori"
            className="inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-[10px] bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-700 active:bg-slate-800"
          >
            {tr.heroV2InstCta}
            <span aria-hidden>↗</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

type Props = { tr: HomeTranslations; jumpTo?: number }

export default function HomeMobileSliderV2({ tr, jumpTo }: Props) {
  const [current, setCurrent] = useState(jumpTo ?? 0)
  const [ofertaModalOpen, setOfertaModalOpen] = useState(false)
  const [bessModalOpen, setBessModalOpen] = useState(false)
  const [instalatoriModalOpen, setInstalatoriModalOpen] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  /** Scroll the container so card `index` is at the snap position. */
  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const el = sliderRef.current
    if (!el) return
    const slides = getSlideEls(el)
    const target = slides[index]
    if (!target) return
    el.scrollTo({ left: target.offsetLeft - SCROLL_PAD, behavior })
  }, [])

  /** Jump without animation when userType changes. */
  useEffect(() => {
    if (jumpTo !== undefined) {
      scrollToIndex(jumpTo, 'auto')
      setCurrent(jumpTo)
    }
  }, [jumpTo, scrollToIndex])

  /** Keep dots in sync while the user swipes. */
  useEffect(() => {
    const el = sliderRef.current
    if (!el) return

    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        if (!sliderRef.current) return
        const slides = getSlideEls(sliderRef.current)
        let closest = 0
        let minDist = Infinity
        slides.forEach((s, i) => {
          const dist = Math.abs(s.offsetLeft - SCROLL_PAD - sliderRef.current!.scrollLeft)
          if (dist < minDist) {
            minDist = dist
            closest = i
          }
        })
        setCurrent(closest)
      })
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const slides = [
    <SlideOfertaImage tr={tr} key="oferta-img" onOpenDetails={() => setOfertaModalOpen(true)} />,
    <SlideReduceri tr={tr} key="reduceri" />,
    <SlideBessImage tr={tr} key="bess-img" onOpenDetails={() => setBessModalOpen(true)} />,
    <SlideProiecte tr={tr} key="proiecte" />,
    <SlideInstalatoriImage tr={tr} key="inst-img" onOpenDetails={() => setInstalatoriModalOpen(true)} />,
  ]

  return (
    <section className="mb-10 w-full" aria-label="Hero">
      <header className="mb-6 px-5 text-center">
        <h1 className="text-black text-2xl font-extrabold font-['Inter'] leading-tight uppercase mb-2 whitespace-pre-line pt-3">
          {tr.heroV2Title}
        </h1>
      </header>

      {/*
        Horizontal scroll container:
        - overflow-x-auto + snap-x gives native swipe on touch devices
        - pl-5 (20px) left padding + trailing spacer = cards float with peek on right
        - [&::-webkit-scrollbar]:hidden hides the scroll bar
      */}
      <div
        ref={sliderRef}
        className="flex w-full overflow-x-auto overscroll-x-contain touch-pan-x touch-pan-y snap-x snap-mandatory [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pl-5 gap-3 py-2"
        style={{ scrollPaddingLeft: `${SCROLL_PAD}px` }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className="relative flex-shrink-0 snap-start overflow-hidden rounded-xl bg-zinc-200 shadow-sm"
            style={{ width: CARD_W, height: CARD_H }}
          >
            {slide}
          </div>
        ))}
        {/* Trailing spacer ensures the last card can scroll fully into the snap position */}
        <div aria-hidden className="flex-shrink-0" style={{ width: `${SCROLL_PAD}px` }} />
      </div>

      {/* Dot indicators + subtitle */}
      <div className="flex justify-center gap-1.5 mt-4">
        {Array.from({ length: MOBILE_SLIDE_V2_COUNT }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollToIndex(i)}
            aria-label={`Slide ${i + 1}`}
            aria-current={i === current ? 'true' : undefined}
            className={`rounded-full transition-all duration-200 ${
              i === current
                ? 'size-2.5 bg-black'
                : 'size-2 bg-black/30'
            }`}
          />
        ))}
      </div>

      <p className="mt-3 px-5 text-center text-gray-500 text-sm font-normal font-['Inter'] leading-6">
        {tr.heroV2Subtitle}
      </p>

      {ofertaModalOpen && (
        <OfertaDetailsModal tr={tr} onClose={() => setOfertaModalOpen(false)} />
      )}
      {bessModalOpen && (
        <BessDetailsModal tr={tr} onClose={() => setBessModalOpen(false)} />
      )}
      {instalatoriModalOpen && (
        <InstalatoriDetailsModal tr={tr} onClose={() => setInstalatoriModalOpen(false)} />
      )}
    </section>
  )
}
