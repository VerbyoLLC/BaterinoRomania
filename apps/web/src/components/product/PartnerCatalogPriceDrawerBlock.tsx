import { useCallback, useEffect, useState } from 'react'
import { LockKeyhole, Megaphone, Tag } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getProduseTranslations } from '../../i18n/produse'
import { getPartnerProductsTranslations } from '../../i18n/partner/products'
import { PartnerRfqPriceJourneyModal } from '../partner/PartnerRfqPriceJourney'
import {
  getPartnerCatalogMapUnitNumeric,
  getPartnerCatalogNetUnitForDisplay,
  getPartnerCatalogPrpUnitWithVatNumeric,
  getPartnerDisplayUnitPriceWithVat,
  getPartnerCatalogSaleUnitNumeric,
  partnerCanSeeDiscountPrices,
  type PublicProduct,
} from '../../lib/api'

type Props = {
  product: PublicProduct
  formatAmount: (amount: number) => string
  partnerDiscountPct?: number | null
  partnerContractSignedAt?: string | null
  className?: string
}

function InfoTip({ title, ariaLabel }: { title: string; ariaLabel: string }) {
  return (
    <span
      title={title}
      aria-label={ariaLabel}
      className="inline-flex h-3.5 w-3.5 shrink-0 cursor-help items-center justify-center rounded-full border border-[#d9dde6] text-[9px] font-bold text-[#9aa1af]"
    >
      ?
    </span>
  )
}

export function PartnerCatalogPriceDrawerBlock({
  product,
  formatAmount,
  partnerDiscountPct = null,
  partnerContractSignedAt = null,
  className = '',
}: Props) {
  const { language } = useLanguage()
  const tr = getProduseTranslations(language.code)
  const trPartner = getPartnerProductsTranslations(language.code)
  const [infoModal, setInfoModal] = useState<'prp' | 'map' | null>(null)
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

  const catalogNet = getPartnerCatalogSaleUnitNumeric(product)
  if (Number.isNaN(catalogNet)) return null

  const discountPricesVisible = partnerCanSeeDiscountPrices({
    partnerDiscountPercent: partnerDiscountPct,
    partnerContractSignedAt,
  })
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
  const formatOrDash = (value: number) => (Number.isNaN(value) ? '—' : formatAmount(value))

  return (
    <>
      <div className={`overflow-hidden rounded-[14px] border border-[#e8eaf0] ${className}`.trim()}>
        <div className="flex items-start gap-3 border-b border-[#e8eaf0] bg-[#eef2f7] px-[17px] py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] border border-[#dde5ef] bg-white text-[#4d6079]">
            <LockKeyhole className="h-[19px] w-[19px]" strokeWidth={1.8} aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#4d6079]">
              {trPartner.detailDrawerPartnerPriceKicker}
            </div>
            {discountPricesVisible ? (
              <>
                <div className="mt-0.5 text-lg font-bold tracking-[-0.01em] text-[#0f1422]">
                  {formatAmount(unitNet)}
                  <span className="ml-1.5 text-sm font-semibold text-[#6a7281]">{trPartner.detailDrawerPartnerPriceNetHint}</span>
                </div>
                {!Number.isNaN(unitGross) ? (
                  <p className="m-0 mt-1 text-xs leading-snug text-[#6a7281]">
                    {formatAmount(unitGross)} {trPartner.detailDrawerPartnerPriceGrossHint}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <div className="mt-0.5 text-lg font-bold tracking-[-0.01em] text-[#0f1422]">
                  {trPartner.detailDrawerPartnerPriceOnRequest}
                </div>
                <p className="m-0 mt-1 text-xs leading-snug text-[#6a7281]">{trPartner.detailDrawerPartnerPriceLockedBody}</p>
              </>
            )}
          </div>
          {!discountPricesVisible ? (
            <button
              type="button"
              onClick={openPriceJourney}
              className="ml-auto shrink-0 text-xs font-semibold text-[#4d6079] underline-offset-2 hover:text-[#0f1422] hover:underline"
            >
              {trPartner.detailDrawerPartnerPriceLearnMore}
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          <button
            type="button"
            disabled={Number.isNaN(prpGross)}
            onClick={() => !Number.isNaN(prpGross) && setInfoModal('prp')}
            className="border-b border-[#e8eaf0] px-[17px] py-[13px] text-left transition hover:bg-[#f4f5f7] disabled:cursor-default disabled:hover:bg-transparent sm:border-b-0 sm:border-r sm:border-[#e8eaf0]"
          >
            <div className="flex items-center gap-1.5 text-[11px] text-[#6a7281]">
              {trPartner.detailDrawerPrpLabel}
              <InfoTip title={tr.catalogPrpInfoModalBody} ariaLabel={tr.catalogPrpInfoAria} />
            </div>
            <div className="mt-0.5 text-base font-bold tracking-[-0.01em] text-[#0f1422]">{formatOrDash(prpGross)}</div>
          </button>
          <button
            type="button"
            disabled={Number.isNaN(mapNet)}
            onClick={() => !Number.isNaN(mapNet) && setInfoModal('map')}
            className="px-[17px] py-[13px] text-left transition hover:bg-[#f4f5f7] disabled:cursor-default disabled:hover:bg-transparent"
          >
            <div className="flex items-center gap-1.5 text-[11px] text-[#6a7281]">
              {trPartner.detailDrawerMapLabel}
              <InfoTip title={tr.catalogMapInfoModalBody} ariaLabel={tr.catalogMapInfoAria} />
            </div>
            <div className="mt-0.5 text-base font-bold tracking-[-0.01em] text-[#0f1422]">{formatOrDash(mapNet)}</div>
          </button>
        </div>
        <p className="m-0 px-[17px] pb-3 pt-0 text-[11px] text-[#9aa1af]">{trPartner.detailDrawerRefNote}</p>
      </div>

      {infoModal === 'prp' ? (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4" role="presentation">
          <div className="absolute inset-0 bg-slate-900/45" aria-hidden onMouseDown={closeInfoModal} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl font-['Inter']" role="dialog" aria-modal="true">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <Tag className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </div>
            <h2 className="m-0 text-lg font-bold text-slate-900">{tr.catalogPrpInfoModalTitle}</h2>
            <p className="mt-3 m-0 text-sm leading-relaxed text-slate-600">{tr.catalogPrpInfoModalBody}</p>
            <button type="button" onClick={closeInfoModal} className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
              {tr.catalogPriceInfoModalClose}
            </button>
          </div>
        </div>
      ) : null}

      {infoModal === 'map' ? (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4" role="presentation">
          <div className="absolute inset-0 bg-slate-900/45" aria-hidden onMouseDown={closeInfoModal} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl font-['Inter']" role="dialog" aria-modal="true">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <Megaphone className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </div>
            <h2 className="m-0 text-lg font-bold text-slate-900">{tr.catalogMapInfoModalTitle}</h2>
            <p className="mt-3 m-0 text-sm leading-relaxed text-slate-600">{tr.catalogMapInfoModalBody}</p>
            <button type="button" onClick={closeInfoModal} className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
              {tr.catalogPriceInfoModalClose}
            </button>
          </div>
        </div>
      ) : null}

      {priceJourneyOpen ? <PartnerRfqPriceJourneyModal onClose={closePriceJourney} /> : null}
    </>
  )
}
