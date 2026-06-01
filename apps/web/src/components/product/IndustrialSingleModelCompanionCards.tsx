import type { LucideIcon } from 'lucide-react'
import { FileDown, Truck } from 'lucide-react'
import type { ReactNode } from 'react'
import type { IndustrialBessTemplateTranslations } from '../../i18n/industrial-bess-template'
import {
  technicalBrochureDownloadFilename,
  technicalBrochureDownloadHref,
} from '../../lib/industrialModelBrochure'

type CompanionCardProps = {
  icon: LucideIcon
  title: string
  body?: string
  stretchHeight?: boolean
  footer?: ReactNode
}

function IndustrialSingleModelCompanionCard({
  icon: Icon,
  title,
  body,
  stretchHeight,
  footer,
}: CompanionCardProps) {
  const hasBody = Boolean(body)

  return (
    <div
      className={`flex min-h-0 min-w-0 w-full flex-col items-center rounded-[10px] border border-neutral-200 bg-white px-4 py-5 text-center shadow-sm transition-all duration-200 ease-out hover:border-neutral-300 hover:shadow-md hover:shadow-slate-900/8 sm:px-5 sm:py-6 ${
        stretchHeight ? 'h-full' : ''
      }`}
    >
      <div
        className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-50 to-white sm:h-[3.75rem] sm:w-[3.75rem]"
        aria-hidden
      >
        <Icon className="h-7 w-7 text-slate-800 sm:h-8 sm:w-8" strokeWidth={1.75} />
      </div>
      <h3 className="m-0 w-full font-bold font-['Inter'] text-slate-900 leading-snug text-[15px] sm:text-base">
        {title}
      </h3>
      {hasBody ? (
        <p className="m-0 mt-3 w-full flex-1 text-sm font-medium leading-relaxed text-neutral-600 font-['Inter'] sm:text-[15px]">
          {body}
        </p>
      ) : null}
      {footer ? (
        <>
          <div className="mt-4 w-full shrink-0">{footer}</div>
          {stretchHeight ? <div className="min-h-0 flex-1" aria-hidden /> : null}
        </>
      ) : null}
    </div>
  )
}

export type IndustrialSingleModelCompanionCardsProps = {
  tr: IndustrialBessTemplateTranslations
  /** Model technical PDF URL; falls back to product-level brochure when omitted. */
  technicalBrochureUrl?: string | null
  productBrochureUrl?: string | null
  modelName?: string
  stretchHeight?: boolean
}

export function IndustrialSingleModelCompanionCards({
  tr,
  technicalBrochureUrl,
  productBrochureUrl,
  modelName = '',
  stretchHeight,
}: IndustrialSingleModelCompanionCardsProps) {
  const brochureTrim =
    (technicalBrochureUrl != null ? String(technicalBrochureUrl).trim() : '') ||
    (productBrochureUrl != null ? String(productBrochureUrl).trim() : '')
  const hasBrochure = brochureTrim.length > 0

  const handleBrochureDownload = () => {
    const proxyUrl = technicalBrochureDownloadHref(brochureTrim)
    const a = document.createElement('a')
    a.href = proxyUrl
    a.download = technicalBrochureDownloadFilename(modelName)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const downloadFooter = hasBrochure ? (
    <button
      type="button"
      onClick={handleBrochureDownload}
      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[8px] border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 font-['Inter'] transition-colors hover:border-slate-400 hover:bg-neutral-50"
    >
      <FileDown className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
      {tr.singleModelDocumentsDownloadCta}
    </button>
  ) : (
    <p className="m-0 flex h-10 items-center justify-center text-xs font-medium text-neutral-400 font-['Inter']">
      {tr.specNoBrochure}
    </p>
  )

  return (
    <div
      className={`grid min-h-0 min-w-0 w-full grid-cols-1 items-stretch gap-3 sm:grid-cols-2 sm:gap-4 ${
        stretchHeight ? 'h-full' : ''
      }`}
    >
      <IndustrialSingleModelCompanionCard
        icon={Truck}
        title={tr.singleModelTransportTitle}
        body={tr.singleModelTransportBody}
        stretchHeight={stretchHeight}
      />
      <IndustrialSingleModelCompanionCard
        icon={FileDown}
        title={tr.singleModelDocumentsTitle}
        stretchHeight={stretchHeight}
        footer={downloadFooter}
      />
    </div>
  )
}
