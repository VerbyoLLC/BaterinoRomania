import { Link } from 'react-router-dom'
import { Award, Clock, Droplets, Shield, Zap, type LucideIcon } from 'lucide-react'
import type { HomeTranslations } from '../../i18n/home'

const MED_IMAGE_SRC = '/images/slider2/bess-baterino-card.webp'

type MedCardTranslations = Pick<
  HomeTranslations,
  | 'heroV2MedStockTag'
  | 'heroV2MedSpecCapacityLabel'
  | 'heroV2MedSpecCapacityValue'
  | 'heroV2MedSpecPowerLabel'
  | 'heroV2MedSpecPowerValue'
  | 'heroV2MedSpecCyclesLabel'
  | 'heroV2MedSpecCyclesValue'
  | 'heroV2MedSpecRetentionLabel'
  | 'heroV2MedSpecRetentionValue'
  | 'heroV2MedCta'
  | 'heroV2MedCardTitleLine1'
  | 'heroV2MedCardTitleLine2'
  | 'heroV2MedCardTitleLine3'
  | 'heroV2MedCardPriceNote'
  | 'heroV2MedCardWarrantyTag'
  | 'heroV2MedCardUseCaseNote'
  | 'heroV2MedCardFeatureCooling'
  | 'heroV2MedCardFeatureEfficiency'
  | 'heroV2MedCardFeatureCert'
  | 'heroV2MedCardFeatureWarranty'
>

type Props = {
  tr: MedCardTranslations
  isDragging: boolean
  productLink: string
}

function GreySpecCell({ label, value }: { label: string; value: string }) {
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

function BenefitRow({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle: string }) {
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

export default function HomeHeroMedCard({ tr, isDragging, productLink }: Props) {
  const pointerClass = isDragging ? 'pointer-events-none' : 'pointer-events-auto'

  const specs = [
    { label: tr.heroV2MedSpecCapacityLabel, value: tr.heroV2MedSpecCapacityValue },
    { label: tr.heroV2MedSpecPowerLabel, value: tr.heroV2MedSpecPowerValue },
    { label: tr.heroV2MedSpecCyclesLabel, value: tr.heroV2MedSpecCyclesValue },
    { label: tr.heroV2MedSpecRetentionLabel, value: tr.heroV2MedSpecRetentionValue },
  ]

  return (
    <div className="absolute inset-0 flex overflow-hidden rounded-xl bg-white transition-colors">
      {/* Image — left */}
      <div className="relative h-full w-[46%] shrink-0 bg-neutral-100">
        <img src={MED_IMAGE_SRC} alt="" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent" aria-hidden />

        <div className="absolute inset-x-4 bottom-4 z-10">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1.5 text-sm font-bold text-white font-['Inter']">
            <Clock className="size-3.5 shrink-0" aria-hidden />
            {tr.heroV2MedCardWarrantyTag}
          </span>
          <h3 className="m-0 text-[clamp(1.5rem,3vw,2rem)] font-extrabold leading-tight text-white font-['Inter']">
            <span className="block">{tr.heroV2MedCardTitleLine1}</span>
            <span className="block">{tr.heroV2MedCardTitleLine2}</span>
            <span className="block">{tr.heroV2MedCardTitleLine3}</span>
          </h3>
          <p className="m-0 mt-1 text-xs font-medium text-white/55 font-['Inter']">
            {tr.heroV2MedCardPriceNote}
          </p>
        </div>
      </div>

      {/* Details — right */}
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden px-6 py-4">

        {/* Tag — own row, then description below */}
        <div className="mb-3">
          <div className="flex justify-end">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 font-['Inter']">
              <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
              {tr.heroV2MedStockTag}
            </span>
          </div>
          <h3 className="m-0 mt-2 text-lg font-bold leading-tight text-slate-900 font-['Inter']">
            Detalii BESS LiFePo4 Industrial
          </h3>
          <p className="m-0 mt-1.5 text-base font-normal leading-snug text-slate-600 font-['Inter']">
            {tr.heroV2MedCardUseCaseNote}
          </p>
        </div>

        {/* Grey specs grid */}
        <div className="grid grid-cols-2 gap-2">
          {specs.map((spec) => (
            <GreySpecCell key={spec.label} label={spec.label} value={spec.value} />
          ))}
        </div>

        {/* Benefit rows */}
        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-3">
          {[
            { icon: Droplets, title: tr.heroV2MedCardFeatureCooling, subtitle: tr.heroV2MedCardFeatureEfficiency },
            { icon: Award, title: tr.heroV2MedCardFeatureCert, subtitle: '' },
            { icon: Shield, title: tr.heroV2MedCardFeatureWarranty, subtitle: '' },
            { icon: Zap, title: tr.heroV2MedCardFeatureEfficiency, subtitle: '' },
          ].map((b) => (
            <BenefitRow key={b.title} icon={b.icon} title={b.title} subtitle={b.subtitle} />
          ))}
        </div>

        <div className={`mt-auto pt-3 ${pointerClass}`}>
          <Link
            to={productLink}
            className="inline-flex h-10 w-full items-center justify-center rounded-[10px] bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
          >
            {tr.heroV2MedCta}
          </Link>
        </div>
      </div>
    </div>
  )
}
