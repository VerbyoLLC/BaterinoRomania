import { useCallback, useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ClipboardList, Lock, Megaphone, Tag, X } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getProduseTranslations } from '../../i18n/produse'
import { getPartnerProductsTranslations } from '../../i18n/partner/products'
import { PartnerRfqPriceJourneyModal } from '../partner/PartnerRfqPriceJourney'
import { partnerProductHasListPrice } from '../../lib/partnerCart'
import {
  getPartnerCatalogMapUnitNumeric,
  getPartnerCatalogNetUnitForDisplay,
  getPartnerCatalogPrpUnitWithVatNumeric,
  getPartnerDisplayUnitPriceWithVat,
  normalizePartnerDiscountPercent,
  partnerCanSeeDiscountPrices,
  type PublicProduct,
} from '../../lib/api'

export type PartnerCatalogPriceLabels = {
  pretFaraTva: string
  pretCuTva: string
  prp: string
  map: string
}

type PartnerCatalogPriceBlockProps = {
  product: PublicProduct
  formatAmount: (amount: number) => string
  labels?: PartnerCatalogPriceLabels
  partnerDiscountPct?: number | null
  partnerContractSignedAt?: string | null
  className?: string
}

type PriceInfoKind = 'prp' | 'map'

function InfoTip({ title, ariaLabel }: { title: string; ariaLabel: string }) {
  return (
    <span
      title={title}
      aria-label={ariaLabel}
      className="inline-flex h-[13px] w-[13px] shrink-0 cursor-help items-center justify-center rounded-full border border-[#d9dde6] text-[8px] font-bold text-[#9aa1af]"
    >
      ?
    </span>
  )
}

function PartnerPriceInfoModal({
  icon: Icon,
  title,
  body,
  closeLabel,
  onClose,
}: {
  icon: LucideIcon
  title: string
  body: string
  closeLabel: string
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4" role="presentation">
      <div
        className="absolute inset-0 bg-slate-900/45"
        aria-hidden
        onMouseDown={(e) => {
          e.preventDefault()
          onClose()
        }}
      />
      <div
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl font-['Inter']"
        role="dialog"
        aria-modal="true"
        aria-labelledby="partner-price-info-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          aria-label={closeLabel}
        >
          <X className="h-5 w-5" strokeWidth={2} aria-hidden />
        </button>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
          <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
        </div>
        <h2 id="partner-price-info-modal-title" className="m-0 pr-8 text-lg font-bold text-slate-900">
          {title}
        </h2>
        <p className="mt-3 m-0 text-sm leading-relaxed text-slate-600">{body}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {closeLabel}
        </button>
      </div>
    </div>
  )
}

function NoPriceBlock({ className = '' }: { className?: string }) {
  const { language } = useLanguage()
  const trPartner = getPartnerProductsTranslations(language.code)

  return (
    <div
      className={`rounded-[13px] border border-[#dde5ef] bg-[#eef2f7] px-[15px] py-3.5 ${className}`.trim()}
    >
      <div className="flex items-center gap-[11px]">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border border-[#dde5ef] bg-white text-[#4d6079]">
          <ClipboardList className="h-4 w-4" strokeWidth={1.8} aria-hidden />
        </span>
        <div className="min-w-0">
          <b className="block text-[13px] font-semibold leading-tight tracking-[-0.01em] text-[#0f1422]">
            {trPartner.cardNoPriceTitle}
          </b>
          <span className="mt-0.5 block text-[11px] leading-snug text-[#6a7281]">{trPartner.cardNoPriceSubtitle}</span>
        </div>
      </div>
    </div>
  )
}

function LockedPartnerHero({
  onPress,
  pressAriaLabel,
}: {
  onPress: () => void
  pressAriaLabel: string
}) {
  const { language } = useLanguage()
  const trPartner = getPartnerProductsTranslations(language.code)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onPress()
      }}
      aria-label={pressAriaLabel}
      className="w-full rounded-[13px] border border-[#dde5ef] bg-[#eef2f7] px-[15px] py-3.5 text-left transition hover:bg-[#e4eaf2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f1422]/20"
    >
      <div className="flex items-center gap-[7px] text-[10.5px] font-bold uppercase tracking-[0.09em] text-[#4d6079]">
        <Lock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.9} aria-hidden />
        <span className="min-w-0 truncate normal-case tracking-[-0.01em]">{trPartner.cardPartnerPriceTitle}</span>
        <span className="ml-auto shrink-0 rounded-full bg-[#4d6079] px-2 py-0.5 text-[10.5px] font-bold normal-case tracking-normal text-white">
          {trPartner.cardPartnerPriceOnRequestPill}
        </span>
      </div>
      <p className="mt-2 m-0 text-[13px] font-semibold leading-snug text-[#4d6079]">
        {trPartner.cardPartnerPriceUnlockHint}
      </p>
    </button>
  )
}

function UnlockedPartnerHero({
  unitNet,
  unitGross,
  formatAmount,
  discountPct,
}: {
  unitNet: number
  unitGross: number
  formatAmount: (amount: number) => string
  discountPct: number
}) {
  const { language } = useLanguage()
  const trPartner = getPartnerProductsTranslations(language.code)

  return (
    <div className="rounded-[13px] border border-[#cfeade] bg-[#eaf7f1] px-[15px] py-3.5">
      <div className="flex items-center gap-[7px] text-[10.5px] font-bold uppercase tracking-[0.09em] text-[#0e8459]">
        <Tag className="h-3.5 w-3.5 shrink-0" strokeWidth={1.9} aria-hidden />
        <span className="min-w-0 truncate normal-case tracking-[-0.01em]">{trPartner.cardPartnerPriceTitle}</span>
        {discountPct > 0 ? (
          <span className="ml-auto shrink-0 rounded-full bg-[#159b6a] px-2 py-0.5 text-[10.5px] font-bold normal-case tracking-normal text-white">
            −{Math.round(discountPct)}%
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-[29px] font-bold leading-none tracking-[-0.02em] text-[#0f1422]">
          {formatAmount(unitNet)}
        </span>
        <span className="text-xs font-semibold text-[#6a7281]">{trPartner.detailDrawerPartnerPriceNetHint}</span>
      </div>
      {!Number.isNaN(unitGross) ? (
        <p className="mt-1.5 m-0 text-[13px] font-semibold text-[#4d6079]">
          {formatAmount(unitGross)} {trPartner.detailDrawerPartnerPriceGrossHint}
        </p>
      ) : null}
    </div>
  )
}

function ReferencePriceCards({
  prpGross,
  mapNet,
  formatAmount,
  onPrpPress,
  onMapPress,
}: {
  prpGross: number
  mapNet: number
  formatAmount: (amount: number) => string
  onPrpPress: () => void
  onMapPress: () => void
}) {
  const { language } = useLanguage()
  const tr = getProduseTranslations(language.code)
  const trPartner = getPartnerProductsTranslations(language.code)
  const formatOrDash = (value: number) => (Number.isNaN(value) ? '—' : formatAmount(value))
  const prpInteractive = !Number.isNaN(prpGross)
  const mapInteractive = !Number.isNaN(mapNet)

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        disabled={!prpInteractive}
        onClick={(e) => {
          e.stopPropagation()
          if (prpInteractive) onPrpPress()
        }}
        className="rounded-[10px] border border-[#e8eaf0] px-[13px] py-[11px] text-left transition enabled:hover:bg-[#f4f5f7] disabled:cursor-default"
      >
        <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#9aa1af]">
          {trPartner.cardPrpLabel}
          <InfoTip title={tr.catalogPrpInfoModalBody} ariaLabel={tr.catalogPrpInfoAria} />
        </div>
        <div className="mt-0.5 text-[18.5px] font-bold leading-tight tracking-[-0.01em] text-[#0f1422]">
          {formatOrDash(prpGross)}
        </div>
      </button>
      <button
        type="button"
        disabled={!mapInteractive}
        onClick={(e) => {
          e.stopPropagation()
          if (mapInteractive) onMapPress()
        }}
        className="rounded-[10px] border border-[#e8eaf0] px-[13px] py-[11px] text-left transition enabled:hover:bg-[#f4f5f7] disabled:cursor-default"
      >
        <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#9aa1af]">
          {trPartner.cardMapLabel}
          <InfoTip title={tr.catalogMapInfoModalBody} ariaLabel={tr.catalogMapInfoAria} />
        </div>
        <div className="mt-0.5 text-[18.5px] font-bold leading-tight tracking-[-0.01em] text-[#0f1422]">
          {formatOrDash(mapNet)}
        </div>
      </button>
    </div>
  )
}

export function PartnerCatalogPriceBlock({
  product,
  formatAmount,
  partnerDiscountPct = null,
  partnerContractSignedAt = null,
  className = '',
}: PartnerCatalogPriceBlockProps) {
  const { language } = useLanguage()
  const tr = getProduseTranslations(language.code)
  const trPartner = getPartnerProductsTranslations(language.code)
  const [infoModal, setInfoModal] = useState<PriceInfoKind | null>(null)
  const [priceJourneyOpen, setPriceJourneyOpen] = useState(false)

  const closeInfoModal = useCallback(() => setInfoModal(null), [])
  const openPriceJourney = useCallback(() => setPriceJourneyOpen(true), [])
  const closePriceJourney = useCallback(() => setPriceJourneyOpen(false), [])

  useEffect(() => {
    if (!infoModal && !priceJourneyOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeInfoModal()
        closePriceJourney()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [infoModal, priceJourneyOpen, closeInfoModal, closePriceJourney])

  if (!partnerProductHasListPrice(product)) {
    return <NoPriceBlock className={className} />
  }

  const discountPricesVisible = partnerCanSeeDiscountPrices({
    partnerDiscountPercent: partnerDiscountPct,
    partnerContractSignedAt,
  })
  const discountPct = discountPricesVisible ? normalizePartnerDiscountPercent(partnerDiscountPct) : 0
  const unitNet = getPartnerCatalogNetUnitForDisplay(
    product,
    discountPricesVisible ? partnerDiscountPct : null,
  )
  const unitGross = getPartnerDisplayUnitPriceWithVat(
    product,
    discountPricesVisible ? partnerDiscountPct : null,
  )
  const prpGross = getPartnerCatalogPrpUnitWithVatNumeric(product)
  const mapNet = getPartnerCatalogMapUnitNumeric(product)

  return (
    <>
      <div className={`flex flex-col gap-2 ${className}`.trim()}>
        {discountPricesVisible ? (
          <UnlockedPartnerHero
            unitNet={unitNet}
            unitGross={unitGross}
            formatAmount={formatAmount}
            discountPct={discountPct}
          />
        ) : (
          <LockedPartnerHero onPress={openPriceJourney} pressAriaLabel={trPartner.rfqEmptyHeroTitle} />
        )}
        <ReferencePriceCards
          prpGross={prpGross}
          mapNet={mapNet}
          formatAmount={formatAmount}
          onPrpPress={() => setInfoModal('prp')}
          onMapPress={() => setInfoModal('map')}
        />
      </div>

      {infoModal === 'prp' ? (
        <PartnerPriceInfoModal
          icon={Tag}
          title={tr.catalogPrpInfoModalTitle}
          body={tr.catalogPrpInfoModalBody}
          closeLabel={tr.catalogPriceInfoModalClose}
          onClose={closeInfoModal}
        />
      ) : null}

      {infoModal === 'map' ? (
        <PartnerPriceInfoModal
          icon={Megaphone}
          title={tr.catalogMapInfoModalTitle}
          body={tr.catalogMapInfoModalBody}
          closeLabel={tr.catalogPriceInfoModalClose}
          onClose={closeInfoModal}
        />
      ) : null}

      {priceJourneyOpen ? <PartnerRfqPriceJourneyModal onClose={closePriceJourney} /> : null}
    </>
  )
}
