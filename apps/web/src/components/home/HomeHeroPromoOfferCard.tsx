import { Link } from 'react-router-dom'
import {
  Activity,
  Home,
  Percent,
  Shield,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import type { HomePromoModalTranslations } from './HomePromoModal'

const PROMO_IMAGE_SRC = '/images/home/offer-baterino.webp'

type HeroPromoOfferCardTranslations = HomePromoModalTranslations & {
  heroPromoBadgeDiscount: string
  heroPromoBadgeStock: string
  heroPromoSpecsTitle: string
  heroPromoBenefit1Subtitle: string
  heroPromoBenefit2Subtitle: string
  heroPromoBenefitCareTitle: string
  heroPromoBenefitCareSubtitle: string
  heroPromoPackageDescription: string
}

type Props = {
  tr: HeroPromoOfferCardTranslations
  isDragging: boolean
  productLink: string
}

function GreySpecCell({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg bg-neutral-100 px-3.5 py-3">
      <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400 font-['Inter'] leading-tight">
        {label}
      </p>
      <p className="m-0 mt-1 text-lg font-bold leading-tight text-slate-900 font-['Inter'] tabular-nums">
        {value}
      </p>
    </div>
  )
}

function BenefitRow({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-50">
        <Icon className="size-5 text-sky-900" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="m-0 text-[15px] font-semibold leading-tight text-slate-900 font-['Inter']">{title}</p>
        {subtitle ? <p className="m-0 mt-0.5 text-sm leading-snug text-neutral-500 font-['Inter']">{subtitle}</p> : null}
      </div>
    </div>
  )
}

/** Promo offer layout for the homepage hero slider. */
export default function HomeHeroPromoOfferCard({ tr, isDragging, productLink }: Props) {
  const pointerClass = isDragging ? 'pointer-events-none' : 'pointer-events-auto'

  const specs: { label: string; value: string }[] = [
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

  return (
    <div className="absolute inset-0 flex overflow-hidden rounded-xl bg-white transition-colors">
      {/* Image — left */}
      <div className="relative h-full w-[46%] shrink-0 bg-neutral-100">
        <img src={PROMO_IMAGE_SRC} alt="" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent" aria-hidden />

        {/* Price block + discount badge above title */}
        <div className="absolute inset-x-4 bottom-4 z-10">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1.5 text-sm font-bold text-white font-['Inter']">
            <Percent className="size-3.5 shrink-0" aria-hidden />
            {tr.heroPromoBadgeDiscount}
          </span>
          <h3 className="m-0 text-[clamp(1.5rem,3vw,2rem)] font-extrabold leading-tight text-white font-['Inter']">
            {tr.promoModalTitleLine1}
            <br />
            <span>{tr.promoModalTitleLine2}</span>
          </h3>
          <p className="m-0 mt-0.5 text-sm font-medium text-white/60 font-['Inter']">{tr.promoModalVatNote}</p>
        </div>
      </div>

      {/* Details — right */}
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden px-6 py-4">

        {/* Stoc limitat + package description */}
        <div className="mb-3">
          <div className="flex justify-end">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 font-['Inter']">
              <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
              {tr.heroPromoBadgeStock}
            </span>
          </div>
          <h3 className="m-0 mt-2 text-lg font-bold leading-tight text-slate-900 font-['Inter']">
            Promotia Baterino
          </h3>
          <p className="m-0 mt-1.5 text-base font-normal leading-snug text-slate-600 font-['Inter']">
            {tr.heroPromoPackageDescription}
          </p>
        </div>

        {/* Grey specs grid */}
        <div className="grid grid-cols-2 gap-2">
          {specs.map((spec) => (
            <GreySpecCell key={spec.label} label={spec.label} value={spec.value} />
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-3">
          {benefits.map((benefit) => (
            <BenefitRow
              key={benefit.title}
              icon={benefit.icon}
              title={benefit.title}
              subtitle={benefit.subtitle}
            />
          ))}
        </div>

        <div className={`mt-auto pt-3 ${pointerClass}`}>
          <Link
            to={productLink}
            className="inline-flex h-10 w-full items-center justify-center rounded-[10px] bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
          >
            {tr.promoModalCtaPrimary}
          </Link>
        </div>
      </div>
    </div>
  )
}
