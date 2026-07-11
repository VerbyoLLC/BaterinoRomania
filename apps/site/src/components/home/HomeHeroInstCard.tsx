'use client'

import { Link } from '@/lib/router'
import { BadgePercent, Headphones, ShieldCheck, Truck, type LucideIcon } from 'lucide-react'
import type { HomeTranslations } from '../../i18n/home'

const INST_IMAGE_SRC = '/images/home/slider-apple/slide4-instalatori.webp'

type InstCardTranslations = Pick<
  HomeTranslations,
  | 'heroV2InstTitle'
  | 'heroV2InstLead'
  | 'heroV2InstBenefit1'
  | 'heroV2InstBenefit1Title'
  | 'heroV2InstBenefit2'
  | 'heroV2InstBenefit2Title'
  | 'heroV2InstBenefit3'
  | 'heroV2InstBenefit3Title'
  | 'heroV2InstBenefit4'
  | 'heroV2InstBenefit4Title'
  | 'heroV2InstCta'
  | 'heroV2InstIntro'
  | 'heroV2InstNetworkTag'
>

type Props = {
  tr: InstCardTranslations
  isDragging: boolean
  productLink: string
}

const BENEFITS: {
  icon: LucideIcon
  titleKey: keyof InstCardTranslations
  subtitleKey: keyof InstCardTranslations
}[] = [
  { icon: BadgePercent, titleKey: 'heroV2InstBenefit1Title', subtitleKey: 'heroV2InstBenefit1' },
  { icon: ShieldCheck,  titleKey: 'heroV2InstBenefit2Title', subtitleKey: 'heroV2InstBenefit2' },
  { icon: Truck,        titleKey: 'heroV2InstBenefit3Title', subtitleKey: 'heroV2InstBenefit3' },
  { icon: Headphones,   titleKey: 'heroV2InstBenefit4Title', subtitleKey: 'heroV2InstBenefit4' },
]

function DarkBenefitBox({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-neutral-100 px-3 py-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white">
        <Icon className="size-3.5 text-sky-900" aria-hidden />
      </div>
      <div>
        <p className="m-0 text-sm font-bold leading-tight text-slate-900 font-['Inter']">{title}</p>
        <p className="m-0 mt-0.5 text-xs leading-snug text-neutral-500 font-['Inter']">{subtitle}</p>
      </div>
    </div>
  )
}

export default function HomeHeroInstCard({ tr, isDragging, productLink }: Props) {
  const pointerClass = isDragging ? 'pointer-events-none' : 'pointer-events-auto'

  return (
    <div className="absolute inset-0 flex overflow-hidden rounded-xl transition-colors">
      {/* Image — left */}
      <div className="relative h-full w-[46%] shrink-0 bg-neutral-900">
        <img src={INST_IMAGE_SRC} alt="" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" aria-hidden />

        <div className="absolute inset-x-4 bottom-4 z-10">
          <p className="m-0 mb-1.5 text-sm font-medium text-white/65 font-['Inter']">
            {tr.heroV2InstLead}
          </p>
          <h3 className="m-0 text-[clamp(1.5rem,3vw,2rem)] font-extrabold leading-tight uppercase text-white font-['Inter']">
            {tr.heroV2InstTitle}
          </h3>
        </div>
      </div>

      {/* Details — right, white */}
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-white px-6 py-5">
        <div className="mb-1.5 flex justify-end">
          <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-900 font-['Inter']">
            {tr.heroV2InstNetworkTag}
          </span>
        </div>
        <h3 className="m-0 mb-1.5 text-lg font-bold leading-tight text-slate-900 font-['Inter']">
          Beneficiile Baterino
        </h3>
        <p className="m-0 mb-4 text-base font-normal leading-snug text-slate-600 font-['Inter']">
          {tr.heroV2InstIntro}
        </p>

        <div className="grid grid-cols-2 gap-2">
          {BENEFITS.map(({ icon, titleKey, subtitleKey }) => (
            <DarkBenefitBox
              key={titleKey}
              icon={icon}
              title={tr[titleKey] as string}
              subtitle={tr[subtitleKey] as string}
            />
          ))}
        </div>

        <div className={`mt-auto pt-4 ${pointerClass}`}>
          <Link
            to={productLink}
            className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-[10px] bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
          >
            {tr.heroV2InstCta}
            <span aria-hidden>↗</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
