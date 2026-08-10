'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from '@/lib/router'
import { useLanguage } from '../../contexts/LanguageContext'
import type { HomeTranslations } from '../../i18n/home'
import type { LangCode } from '../../i18n/menu'
import { getSigurantaTranslations } from '../../i18n/siguranta'

type HomeFeaturesGridProps = {
  tr: HomeTranslations
}

const FEATURE_ICONS = [
  '/images/shared/battery-full-icon.svg',
  '/images/shared/service-icon.svg',
  '/images/shared/swap-icon.svg',
  '/images/shared/compatibility-icon.svg',
  '/images/shared/testing-icon.svg',
  '/images/shared/delivery-icon.svg',
  '/images/shared/swap-icon.svg',
] as const

/** Extended modal copy from Siguranță page where available (index → siguranta desc key). */
const SIGURANTA_MODAL_DESC: Partial<Record<number, keyof ReturnType<typeof getSigurantaTranslations>>> = {
  0: 'garantieDesc',
  1: 'suportDesc',
  2: 'swapDesc',
  4: 'testareDesc',
}

function renderBold(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-bold">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

function getFeatureModalBody(tr: HomeTranslations, index: number, lang: LangCode) {
  const sigKey = SIGURANTA_MODAL_DESC[index]
  if (sigKey) return getSigurantaTranslations(lang)[sigKey]
  if (index === 3) return tr.f4ModalDesc
  if (index === 5) return tr.f6ModalDesc
  if (index === 6) return tr.f7ModalDesc
  return ''
}

function FeatureCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: string
  title: string
  desc: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-full w-full flex-col rounded-[10px] bg-[#f7f7f7] px-4 py-5 text-left transition-shadow duration-200 hover:shadow-lg sm:px-5 sm:py-6 lg:px-6 lg:py-6"
    >
      <img src={icon} alt="" aria-hidden className="mb-3 size-9 object-contain sm:size-10" />
      <h3 className="mb-1.5 text-sm font-semibold font-['Inter'] leading-snug text-black sm:text-base">
        {title}
      </h3>
      <p className="flex-1 text-xs font-normal font-['Inter'] leading-relaxed text-gray-600 sm:text-sm sm:leading-5">
        {desc}
      </p>
    </button>
  )
}

function SafetyCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-[10px] border border-gray-200 bg-white px-4 py-5 text-center sm:px-5 sm:py-6 lg:px-6 lg:py-6">
      <h3 className="mb-1.5 text-sm font-semibold font-['Inter'] leading-snug text-black sm:text-base">{title}</h3>
      <p className="text-xs font-normal font-['Inter'] leading-relaxed text-gray-600 sm:text-sm sm:leading-5">{desc}</p>
    </div>
  )
}

function FeatureDetailModal({
  icon,
  title,
  body,
  closeLabel,
  moreLinkLabel,
  onClose,
}: {
  icon: string
  title: string
  body: string
  closeLabel: string
  moreLinkLabel: string
  onClose: () => void
}) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const modal = (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" aria-hidden />
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-feature-modal-title"
        className="relative z-10 w-full max-w-lg rounded-t-[10px] bg-white shadow-2xl sm:rounded-[10px]"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-5 px-6 pb-6 pt-8 sm:px-8 sm:pb-8">
          <img src={icon} alt="" aria-hidden className="size-12 object-contain sm:size-14" />
          <h2
            id="home-feature-modal-title"
            className="text-xl font-bold font-['Inter'] leading-7 text-black sm:text-2xl sm:leading-8"
          >
            {title}
          </h2>
          <p className="text-base font-medium font-['Inter'] leading-7 text-gray-700">
            {renderBold(body)}
          </p>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/siguranta"
              onClick={onClose}
              className="text-sm font-semibold font-['Inter'] text-slate-900 underline underline-offset-2 hover:text-slate-700"
            >
              {moreLinkLabel}
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-[10px] bg-slate-900 px-6 text-sm font-semibold font-['Inter'] text-white transition-colors hover:bg-slate-700"
            >
              {closeLabel}
            </button>
          </div>
        </div>
      </article>
    </div>
  )

  return createPortal(modal, document.body)
}

const MOBILE_FEATURES_INITIAL = 3

/** Homepage features — 4 columns on desktop; Siguranța card is last. */
export default function HomeFeaturesGrid({ tr }: HomeFeaturesGridProps) {
  const { language } = useLanguage()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [mobileShowAll, setMobileShowAll] = useState(false)

  const features = [
    { title: tr.f1Title, desc: tr.f1Desc },
    { title: tr.f2Title, desc: tr.f2Desc },
    { title: tr.f3Title, desc: tr.f3Desc },
    { title: tr.f4Title, desc: tr.f4Desc },
    { title: tr.f5Title, desc: tr.f5Desc },
    { title: tr.f6Title, desc: tr.f6Desc },
    { title: tr.f7Title, desc: tr.f7Desc },
  ] as const

  const activeFeature = activeIndex != null ? features[activeIndex] : null

  const gridItems: Array<{ type: 'feature'; index: number } | { type: 'safety' }> = [
    { type: 'feature', index: 0 },
    { type: 'feature', index: 1 },
    { type: 'feature', index: 2 },
    { type: 'feature', index: 3 },
    { type: 'feature', index: 4 },
    { type: 'feature', index: 5 },
    { type: 'feature', index: 6 },
    { type: 'safety' },
  ]

  return (
    <section className="mb-16 lg:mb-24">
      <div className="px-5 my-8 sm:my-10 lg:px-[var(--grid-edge)]">
        <h2 className="mx-auto max-w-[676px] text-center text-2xl font-bold font-['Inter'] leading-9 text-black sm:text-3xl sm:leading-10 lg:text-left">
          {tr.featuresSectionTitle}
        </h2>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-[10px] px-5 sm:mt-8 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4 lg:px-[var(--grid-edge)]">
        {gridItems.map((item, index) => {
          const hiddenOnMobile = !mobileShowAll && index >= MOBILE_FEATURES_INITIAL

          const card =
            item.type === 'safety' ? (
              <SafetyCard title={tr.productsSafetyLink} desc={tr.safetyCardDesc} />
            ) : (
              <FeatureCard
                icon={FEATURE_ICONS[item.index]}
                title={features[item.index].title}
                desc={features[item.index].desc}
                onClick={() => setActiveIndex(item.index)}
              />
            )

          return (
            <div
              key={item.type === 'safety' ? 'safety' : features[item.index].title}
              className={hiddenOnMobile ? 'hidden sm:contents' : 'contents'}
            >
              {card}
            </div>
          )
        })}
      </div>

      {!mobileShowAll && gridItems.length > MOBILE_FEATURES_INITIAL ? (
        <div className="mt-4 flex justify-center px-5 sm:hidden">
          <button
            type="button"
            onClick={() => setMobileShowAll(true)}
            className="h-11 w-full max-w-xs rounded-[10px] outline outline-1 outline-offset-[-1px] outline-zinc-300 text-sm font-semibold font-['Inter'] text-black transition-colors hover:bg-neutral-100"
          >
            {tr.featuresShowMore}
          </button>
        </div>
      ) : null}

      {activeFeature && activeIndex != null ? (
        <FeatureDetailModal
          icon={FEATURE_ICONS[activeIndex]}
          title={activeFeature.title}
          body={getFeatureModalBody(tr, activeIndex, language.code)}
          closeLabel={tr.featureModalClose}
          moreLinkLabel={tr.featureModalMoreLink}
          onClose={() => setActiveIndex(null)}
        />
      ) : null}
    </section>
  )
}
