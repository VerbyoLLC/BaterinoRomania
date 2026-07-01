import type { ReactNode } from 'react'
import { FileText, ShoppingBag, X } from 'lucide-react'
import type { LangCode } from '../../i18n/menu'
import { getPartnerProductsTranslations } from '../../i18n/partner/products'

export type PartnerBasketTab = 'cart' | 'rfq'

/** Matches empty cart / ofertă sidebar layout while localStorage hydrates. */
export function PartnerBasketTabPanelSkeleton({ loadingLabel }: { loadingLabel?: string }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 font-['Inter']" aria-busy="true">
      {loadingLabel ? <span className="sr-only">{loadingLabel}</span> : null}
      <div className="animate-pulse motion-reduce:animate-none" aria-hidden>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="h-5 w-36 max-w-[70%] rounded-md bg-slate-200" />
          <div className="h-6 w-28 rounded-md bg-slate-100" />
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-3.5 w-full rounded bg-slate-100" />
          <div className="h-3.5 w-[94%] rounded bg-slate-100" />
          <div className="h-3.5 w-[80%] rounded bg-slate-100" />
        </div>
        <div className="mt-5 space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3.5">
              <div className="h-[42px] w-[42px] shrink-0 rounded-xl bg-slate-200" />
              <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                <div className="h-4 w-[76%] rounded bg-slate-200" />
                <div className="h-3.5 w-full rounded bg-slate-100" />
                <div className="h-3.5 w-[88%] rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 border-t border-slate-100 pt-5 flex justify-center">
          <div className="h-3.5 w-[88%] max-w-[16rem] rounded bg-slate-100" />
        </div>
      </div>
    </div>
  )
}

function TabCountBadge({ count, active }: { count: number; active: boolean }) {
  if (count <= 0) return null
  return (
    <span
      className={`flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums font-['Inter'] ${
        active ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
      }`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

export function PartnerBasketTabsShell({
  variant,
  activeTab,
  onTabChange,
  showCartTab,
  cartCount,
  rfqCount,
  onDismiss,
  langCode,
  children,
}: {
  variant: 'sidebar' | 'mobile'
  activeTab: PartnerBasketTab
  onTabChange: (tab: PartnerBasketTab) => void
  showCartTab: boolean
  cartCount: number
  rfqCount: number
  onDismiss?: () => void
  langCode: LangCode
  children: ReactNode
}) {
  const tr = getPartnerProductsTranslations(langCode)

  const shellClass =
    variant === 'sidebar'
      ? 'flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'
      : 'flex max-h-[min(58vh,560px)] flex-col overflow-hidden rounded-t-2xl border border-b-0 border-slate-200 bg-white shadow-[0_-12px_40px_rgba(15,23,42,0.12)]'

  const tabBtnClass = (active: boolean) =>
    `flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold font-['Inter'] transition ${
      active
        ? 'bg-white text-slate-900 shadow-sm'
        : 'text-slate-500 hover:text-slate-700'
    }`

  return (
    <section className={shellClass} aria-label={tr.basketTabsAria}>
      <div className="shrink-0 border-b border-slate-100 bg-[#f7f7f7] px-2 pt-2 pb-2">
        <div className="flex items-center gap-2">
          <div
            className="flex min-w-0 flex-1 gap-1 rounded-xl bg-slate-200/70 p-1"
            role="tablist"
            aria-label={tr.basketTabsAria}
          >
            {showCartTab ? (
              <button
                type="button"
                role="tab"
                id="partner-basket-tab-cart"
                aria-selected={activeTab === 'cart'}
                aria-controls="partner-basket-panel-cart"
                onClick={() => onTabChange('cart')}
                className={tabBtnClass(activeTab === 'cart')}
              >
                <ShoppingBag className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                <span>{tr.basketTabCart}</span>
                <TabCountBadge count={cartCount} active={activeTab === 'cart'} />
              </button>
            ) : null}
            <button
              type="button"
              role="tab"
              id="partner-basket-tab-rfq"
              aria-selected={activeTab === 'rfq'}
              aria-controls="partner-basket-panel-rfq"
              onClick={() => onTabChange('rfq')}
              className={tabBtnClass(activeTab === 'rfq')}
            >
              <FileText className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              <span>{tr.basketTabQuote}</span>
              <TabCountBadge count={rfqCount} active={activeTab === 'rfq'} />
            </button>
          </div>
          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              aria-label={tr.cartCloseAria}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white hover:text-slate-900 xl:hidden"
            >
              <X className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      <div
        id={activeTab === 'cart' ? 'partner-basket-panel-cart' : 'partner-basket-panel-rfq'}
        role="tabpanel"
        aria-labelledby={activeTab === 'cart' ? 'partner-basket-tab-cart' : 'partner-basket-tab-rfq'}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        {children}
      </div>
    </section>
  )
}
