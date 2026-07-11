'use client'

import { useEffect } from 'react'
import { Link } from '@/lib/router'
import { Battery, Home, Layers2, RefreshCw, Shield, Truck, Wifi, X, type LucideIcon } from 'lucide-react'
import type { HomeTranslations } from '../../i18n/home'

const PROMO_IMAGE_SRC = '/images/home/offer-baterino.webp'
export const HOME_PROMO_PRODUCT_LINK = '/produse/baterii-solare/pachet-baterii-lifepo4-20kwh'
const PROMO_PRODUCT_LINK = HOME_PROMO_PRODUCT_LINK

export type HomePromoModalTranslations = Pick<
  HomeTranslations,
  | 'promoModalStatus'
  | 'promoModalImageTitle'
  | 'promoModalTitleLine1'
  | 'promoModalTitleLine2'
  | 'promoModalVatNote'
  | 'promoModalDescription'
  | 'promoModalSpecCapacityLabel'
  | 'promoModalSpecCapacityValue'
  | 'promoModalSpecConfigLabel'
  | 'promoModalSpecConfigValue'
  | 'promoModalSpecLifecycleLabel'
  | 'promoModalSpecLifecycleValue'
  | 'promoModalSpecConnectivityLabel'
  | 'promoModalSpecConnectivityValue'
  | 'promoModalBenefit1Title'
  | 'promoModalBenefit1Subtitle'
  | 'promoModalBenefit2Title'
  | 'promoModalBenefit2Subtitle'
  | 'promoModalBenefit3Title'
  | 'promoModalBenefit3Subtitle'
  | 'promoModalDeliveryTitle'
  | 'promoModalDeliverySubtitle'
  | 'promoModalCtaPrimary'
  | 'promoModalFooter'
  | 'featureModalClose'
  | 'heroPromoBadgeDiscount'
  | 'heroPromoBadgeStock'
  | 'heroPromoSpecsTitle'
  | 'heroPromoBenefit1Subtitle'
  | 'heroPromoBenefit2Subtitle'
  | 'heroPromoBenefitCareTitle'
  | 'heroPromoBenefitCareSubtitle'
>

type Props = {
  open: boolean
  onClose: () => void
  tr: HomePromoModalTranslations
}

function renderBold(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-semibold text-sky-900">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

function SpecCell({
  icon: Icon,
  label,
  value,
  highlight = true,
}: {
  icon: LucideIcon
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-start gap-2 border border-neutral-200 px-2.5 py-2.5 sm:gap-2.5 sm:px-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sky-50 sm:size-8">
        <Icon className="size-3.5 text-sky-900 sm:size-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-400 font-['Inter']">
          {label}
        </p>
        <p
          className={`m-0 mt-1 text-sm font-bold leading-tight font-['Inter'] tabular-nums ${
            highlight ? 'text-sky-900' : 'text-slate-900'
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

function ImageBenefitCard({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 rounded-lg border border-white/25 bg-white/10 p-2.5 text-center backdrop-blur-md sm:p-3">
      <Icon className="size-5 shrink-0 text-white sm:size-6" aria-hidden />
      <div className="min-w-0 w-full">
        <p className="m-0 text-xs font-semibold leading-snug text-white font-['Inter'] sm:text-sm">{title}</p>
        <p className="m-0 mt-0.5 text-[11px] leading-snug text-white/75 font-['Inter'] sm:text-xs">{subtitle}</p>
      </div>
    </div>
  )
}

function PanelBenefitCard({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-sky-50">
        <Icon className="size-4 text-sky-900" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="m-0 text-sm font-semibold leading-snug text-slate-900 font-['Inter']">{title}</p>
        <p className="m-0 mt-0.5 text-xs leading-snug text-neutral-500 font-['Inter']">{subtitle}</p>
      </div>
    </div>
  )
}

export default function HomePromoModal({ open, onClose, tr }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const specs: { icon: LucideIcon; label: string; value: string; highlight?: boolean }[] = [
    { icon: Battery, label: tr.promoModalSpecCapacityLabel, value: tr.promoModalSpecCapacityValue },
    { icon: Layers2, label: tr.promoModalSpecConfigLabel, value: tr.promoModalSpecConfigValue },
    { icon: RefreshCw, label: tr.promoModalSpecLifecycleLabel, value: tr.promoModalSpecLifecycleValue },
    {
      icon: Wifi,
      label: tr.promoModalSpecConnectivityLabel,
      value: tr.promoModalSpecConnectivityValue,
      highlight: false,
    },
  ]

  const imageBenefits: { icon: LucideIcon; title: string; subtitle: string }[] = [
    { icon: Shield, title: tr.promoModalBenefit1Title, subtitle: tr.promoModalBenefit1Subtitle },
    { icon: Home, title: tr.promoModalBenefit2Title, subtitle: tr.promoModalBenefit2Subtitle },
    { icon: RefreshCw, title: tr.promoModalBenefit3Title, subtitle: tr.promoModalBenefit3Subtitle },
  ]

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="home-promo-modal-title"
    >
      <div
        className="relative flex w-full max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label={tr.featureModalClose}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image — left on desktop */}
        <div className="relative w-full shrink-0 bg-neutral-100 lg:w-1/2 lg:min-h-0">
          <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[3/4] lg:aspect-auto lg:min-h-[420px] lg:h-full">
            <img
              src={PROMO_IMAGE_SRC}
              alt=""
              className="h-full w-full object-cover object-center"
            />
            <img
              src="/images/shared/baterino-logo-white.webp"
              alt="Baterino"
              className="absolute left-4 top-4 z-10 h-8 w-auto max-w-[50%] object-contain sm:left-5 sm:top-5 sm:h-9"
            />
            <div className="absolute inset-x-3 bottom-5 z-10 grid grid-cols-3 gap-1.5 sm:inset-x-4 sm:bottom-7 sm:gap-2">
              {imageBenefits.map((benefit) => (
                <ImageBenefitCard
                  key={benefit.title}
                  icon={benefit.icon}
                  title={benefit.title}
                  subtitle={benefit.subtitle}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Offer details — white panel */}
        <div className="flex min-h-0 w-full shrink-0 flex-col overflow-y-auto bg-white p-5 sm:p-6 lg:w-1/2 lg:p-7">
          <p className="m-0 mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-sky-900 font-['Inter']">
            <span className="size-1.5 shrink-0 rounded-full bg-sky-900" aria-hidden />
            {tr.promoModalStatus}
          </p>

          <p className="m-0 mb-2 text-xl font-extrabold uppercase tracking-wide text-sky-900 font-['Inter'] sm:text-2xl">
            {tr.promoModalImageTitle}
          </p>

          <h2
            id="home-promo-modal-title"
            className="m-0 text-[clamp(1.5rem,3.8vw,2rem)] font-extrabold leading-tight text-slate-900 font-['Inter']"
          >
            {tr.promoModalTitleLine1}
            <br />
            <span className="inline-flex flex-wrap items-baseline gap-x-2">
              <span className="text-sky-900">{tr.promoModalTitleLine2}</span>
              <span className="text-xs font-medium text-neutral-500">{tr.promoModalVatNote}</span>
            </span>
          </h2>

          <p className="m-0 mt-3 text-base leading-relaxed text-neutral-600 font-['Inter'] sm:text-[17px]">
            {tr.promoModalDescription}
          </p>

          <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-xl border border-neutral-200">
            {specs.map((spec) => (
              <SpecCell
                key={spec.label}
                icon={spec.icon}
                label={spec.label}
                value={spec.value}
                highlight={spec.highlight !== false}
              />
            ))}
          </div>

          <div className="mt-3">
            <PanelBenefitCard
              icon={Truck}
              title={tr.promoModalDeliveryTitle}
              subtitle={tr.promoModalDeliverySubtitle}
            />
          </div>

          <div className="mt-6">
            <Link
              to={PROMO_PRODUCT_LINK}
              onClick={onClose}
              className="inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 sm:w-auto sm:px-8"
            >
              {tr.promoModalCtaPrimary}
            </Link>
          </div>

          <p className="m-0 mt-4 text-xs text-neutral-500 font-['Inter']">{renderBold(tr.promoModalFooter)}</p>
        </div>
      </div>
    </div>
  )
}
