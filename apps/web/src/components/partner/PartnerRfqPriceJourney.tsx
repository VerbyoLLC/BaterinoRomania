import { CirclePlus, CreditCard, LayoutGrid, Package, Phone, Route, Send, Tag, X, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { createPortal } from 'react-dom'
import { getPartnerProductsTranslations, type PartnerProductsTranslations } from '../../i18n/partner/products'
import { useLanguage } from '../../contexts/LanguageContext'

function RfqJourneyStep({
  icon: Icon,
  title,
  subtitle,
  highlight = false,
  showLine = true,
  comfortable = false,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
  highlight?: boolean
  showLine?: boolean
  comfortable?: boolean
}) {
  const iconSize = comfortable ? 'h-[42px] w-[42px]' : 'h-[38px] w-[38px]'
  const iconGlyph = comfortable ? 'h-5 w-5' : 'h-[18px] w-[18px]'
  const lineLeft = comfortable ? 'left-[20px]' : 'left-[18px]'
  const lineTop = comfortable ? 'top-[42px]' : 'top-[38px]'

  return (
    <div className={`relative flex gap-3.5 ${comfortable ? 'pb-5' : 'pb-4'} last:pb-0`}>
      {showLine ? (
        <span
          className={`absolute bottom-0 ${lineLeft} ${lineTop} w-0.5 rounded-full bg-gradient-to-b from-indigo-500 to-slate-200`}
          aria-hidden
        />
      ) : null}
      <div
        className={`relative z-[1] flex ${iconSize} shrink-0 items-center justify-center rounded-xl text-white ${
          highlight
            ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_5px_12px_rgba(15,157,111,0.3)]'
            : 'bg-gradient-to-br from-blue-500 to-indigo-700 shadow-[0_5px_12px_rgba(30,70,180,0.26)]'
        }`}
      >
        <Icon className={iconGlyph} strokeWidth={1.9} aria-hidden />
      </div>
      <div className="min-w-0 pt-0.5">
        <p
          className={`m-0 font-semibold leading-snug font-['Inter'] ${
            comfortable ? 'text-base' : 'text-sm'
          } ${highlight ? 'text-emerald-700' : 'text-slate-900'}`}
        >
          {title}
        </p>
        <p
          className={`mt-1 m-0 leading-snug font-['Inter'] ${
            comfortable ? 'text-sm text-slate-500' : 'text-xs text-slate-400'
          }`}
        >
          {subtitle}
        </p>
      </div>
    </div>
  )
}

function RfqJourneySteps({
  tr,
  includeGoToProductsStep = false,
  comfortable = false,
}: {
  tr: PartnerProductsTranslations
  includeGoToProductsStep?: boolean
  comfortable?: boolean
}) {
  return (
    <div className="relative">
      {includeGoToProductsStep ? (
        <RfqJourneyStep
          comfortable={comfortable}
          icon={LayoutGrid}
          title={tr.rfqEmptyStep1Title}
          subtitle={tr.rfqEmptyStep1Subtitle}
        />
      ) : null}
      <RfqJourneyStep
        comfortable={comfortable}
        icon={CirclePlus}
        title={tr.rfqEmptyStep2Title}
        subtitle={tr.rfqEmptyStep2Subtitle}
      />
      <RfqJourneyStep
        comfortable={comfortable}
        icon={Send}
        title={tr.rfqEmptyStep3Title}
        subtitle={tr.rfqEmptyStep3Subtitle}
      />
      <RfqJourneyStep
        comfortable={comfortable}
        icon={Phone}
        title={tr.rfqEmptyStep4Title}
        subtitle={tr.rfqEmptyStep4Subtitle}
      />
      <RfqJourneyStep
        comfortable={comfortable}
        icon={Tag}
        title={tr.rfqEmptyStep5Title}
        subtitle={tr.rfqEmptyStep5Subtitle}
        highlight
        showLine={false}
      />
    </div>
  )
}

function RfqJourneyInfoBox({ tr, className }: { tr: PartnerProductsTranslations; className?: string }) {
  return (
    <div className={`rounded-2xl bg-[#f4f7fa] px-4 py-4 ${className ?? 'mt-4'}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <Zap className="h-4 w-4" strokeWidth={2} aria-hidden />
      </div>
      <p className="mt-2.5 m-0 text-sm font-bold leading-snug text-slate-900">{tr.rfqEmptyPriceBoxTitle}</p>
      <p className="mt-1.5 m-0 text-sm leading-snug text-slate-500">
        {tr.rfqEmptyPriceBoxBodyBefore}
        <strong className="font-semibold text-slate-700">{tr.rfqEmptyPriceBoxBodyEmphasis}</strong>
        {tr.rfqEmptyPriceBoxBodyAfter}
      </p>
    </div>
  )
}

export function PartnerRfqPriceJourneySidebar({ tr }: { tr: PartnerProductsTranslations }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 font-['Inter']">
      <h3 className="m-0 text-base font-bold leading-snug text-slate-900">{tr.rfqEmptyHeroTitle}</h3>
      <p className="mt-2 m-0 text-sm leading-relaxed text-slate-500">{tr.rfqEmptyHeroSubtitleCatalog}</p>
      <div className="mt-5">
        <RfqJourneySteps tr={tr} comfortable />
      </div>
      <RfqJourneyInfoBox tr={tr} />
      <p className="mt-5 m-0 text-center text-sm leading-relaxed text-slate-500">{tr.rfqEmptySidebarHint}</p>
    </div>
  )
}

/** Empty RFQ tab when partner discount is approved — quote is for configurable systems only. */
export function PartnerRfqApprovedEmptySidebar({ tr }: { tr: PartnerProductsTranslations }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 font-['Inter']">
      <div className="flex flex-wrap items-center gap-2.5">
        <h3 className="m-0 text-base font-bold leading-snug text-slate-900">{tr.rfqTitle}</h3>
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
          {tr.rfqApprovedEmptyBadge}
        </span>
      </div>
      <p className="mt-3 m-0 text-sm leading-relaxed text-slate-600">{tr.rfqApprovedEmptyIntro}</p>
      <div className="mt-5">
        <RfqJourneyStep
          comfortable
          icon={CirclePlus}
          title={tr.rfqApprovedEmptyStep1Title}
          subtitle={tr.rfqApprovedEmptyStep1Subtitle}
        />
        <RfqJourneyStep
          comfortable
          icon={Send}
          title={tr.rfqApprovedEmptyStep2Title}
          subtitle={tr.rfqApprovedEmptyStep2Subtitle}
        />
        <RfqJourneyStep
          comfortable
          icon={Tag}
          title={tr.rfqApprovedEmptyStep3Title}
          subtitle={tr.rfqApprovedEmptyStep3Subtitle}
          highlight
          showLine={false}
        />
      </div>
      <div className="mt-5 border-t border-slate-100 pt-5">
        <p className="m-0 text-center text-sm leading-relaxed text-slate-500">
          {tr.rfqApprovedEmptyFooterBefore}
          <strong className="font-semibold text-slate-700">{tr.rfqApprovedEmptyFooterEmphasis}</strong>
          {tr.rfqApprovedEmptyFooterAfter}
        </p>
      </div>
    </div>
  )
}

/** Empty cart tab when partner discount is approved — in-stock products with partner pricing. */
export function PartnerCartEmptySidebar({ tr }: { tr: PartnerProductsTranslations }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 font-['Inter']">
      <div className="flex flex-wrap items-center gap-2.5">
        <h3 className="m-0 text-base font-bold leading-snug text-slate-900">{tr.cartTitle}</h3>
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
          {tr.cartApprovedEmptyBadge}
        </span>
      </div>
      <p className="mt-3 m-0 text-sm leading-relaxed text-slate-600">{tr.cartApprovedEmptyIntro}</p>
      <div className="mt-5">
        <RfqJourneyStep
          comfortable
          icon={CirclePlus}
          title={tr.cartApprovedEmptyStep1Title}
          subtitle={tr.cartApprovedEmptyStep1Subtitle}
        />
        <RfqJourneyStep
          comfortable
          icon={CreditCard}
          title={tr.cartApprovedEmptyStep2Title}
          subtitle={tr.cartApprovedEmptyStep2Subtitle}
        />
        <RfqJourneyStep
          comfortable
          icon={Package}
          title={tr.cartApprovedEmptyStep3Title}
          subtitle={tr.cartApprovedEmptyStep3Subtitle}
          highlight
          showLine={false}
        />
      </div>
      <div className="mt-5 border-t border-slate-100 pt-5">
        <p className="m-0 text-center text-sm leading-relaxed text-slate-500">
          {tr.cartApprovedEmptyFooterBefore}
          <strong className="font-semibold text-slate-700">{tr.cartApprovedEmptyFooterEmphasis}</strong>
          {tr.cartApprovedEmptyFooterAfter}
        </p>
      </div>
    </div>
  )
}

function PartnerRfqPriceJourneyContent({ tr }: { tr: PartnerProductsTranslations }) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
        <div className="shrink-0 lg:w-[17rem]">
          <div className="mb-3 flex h-[54px] w-[54px] items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-[0_10px_20px_rgba(30,70,180,0.32)]">
            <Route className="h-[26px] w-[26px]" strokeWidth={1.9} aria-hidden />
          </div>
          <h2
            id="partner-rfq-journey-heading"
            className="m-0 text-xl font-bold leading-snug tracking-tight text-slate-900 sm:text-2xl"
          >
            {tr.rfqEmptyHeroTitle}
          </h2>
          <p className="mt-1.5 m-0 text-sm leading-snug text-slate-500">{tr.rfqEmptyHeroSubtitle}</p>
        </div>

        <div className="min-w-0 flex-1">
          <RfqJourneySteps tr={tr} includeGoToProductsStep />
        </div>
      </div>

      <RfqJourneyInfoBox tr={tr} className="mt-0 w-full" />
    </div>
  )
}

export function PartnerRfqPriceJourneyModal({ onClose }: { onClose: () => void }) {
  const { language } = useLanguage()
  const tr = getPartnerProductsTranslations(language.code)

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="partner-rfq-journey-heading"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden
        onMouseDown={(e) => {
          e.preventDefault()
          onClose()
        }}
      />
      <div
        className="relative z-10 flex max-h-[min(90dvh,44rem)] w-full max-w-3xl flex-col overflow-hidden rounded-t-[20px] bg-white shadow-2xl sm:rounded-2xl"
        style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
          <img
            src="/images/shared/baterino-pro-negru-logo.webp"
            alt="Baterino"
            className="h-5 w-auto shrink-0 object-contain sm:h-6"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={tr.rfqCloseAria}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            <X className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 font-['Inter'] sm:px-7 sm:py-6">
          <PartnerRfqPriceJourneyContent tr={tr} />
        </div>
      </div>
    </div>,
    document.body,
  )
}
