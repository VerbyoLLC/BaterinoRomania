import { useState, useEffect, useMemo, useRef, useCallback, useLayoutEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  Search,
  X,
  ShoppingCart,
  Minus,
  Plus,
  ChevronRight,
  ChevronDown,
  Trash2,
  ShoppingBag,
  CreditCard,
  Home,
  LayoutGrid,
  BriefcaseMedical,
  Factory,
  Anchor,
  ClipboardList,
} from 'lucide-react'
import type { LangCode } from '../../i18n/menu'
import {
  getProducts,
  getProduct,
  getProductCardImageUrl,
  getCatalogProductSpecLines,
  getResidentialCatalogStockListingCta,
  residentialProductStockUnavailable,
  getPartnerProfile,
  type PublicProduct,
  getPartnerCatalogNetUnitForDisplay,
  getPartnerDisplayUnitPriceWithVat,
  getPartnerCatalogVatPercentForDisplay,
  filterProductsForPartnerPanel,
  isPartnerAccountPromotedProduct,
  partnerDiscountConfigured,
  partnerCanSeeDiscountPrices,
  openPartnerContractPreview,
} from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'
import { useCatalogCurrency } from '../../contexts/CatalogCurrencyContext'
import { getProductDetailTranslations } from '../../i18n/product-detail'
import { getProduseTranslations } from '../../i18n/produse'
import { PartnerCatalogPriceBlock } from '../../components/product/PartnerCatalogPriceBlock'
import { PartnerCatalogCardMedia } from '../../components/partner/PartnerCatalogCardMedia'
import { PartnerRfqBasketPanel } from '../../components/partner/PartnerRfqBasketPanel'
import { PartnerCartEmptySidebar } from '../../components/partner/PartnerRfqPriceJourney'
import { PartnerBasketTabsShell, type PartnerBasketTab, PartnerBasketTabPanelSkeleton } from '../../components/partner/PartnerBasketTabsShell'
import { catalogBadgeLabelsFromProduseTr } from '../../lib/catalogProductBadges'
import {
  partnerCartLoadingLabel,
  partnerCartTotalsLabels,
  partnerCatalogSectionLabels,
  partnerToolbarLabels,
  formatPartnerCatalogSectionCount,
  getPartnerProductsTranslations,
  type PartnerCatalogSectionId,
} from '../../i18n/partner/products'
import { getPartnerDashboardTranslations } from '../../i18n/partner/dashboard'
import { PartnerContractSigningCallout } from '../../components/partner/PartnerContractSigningCallout'
import { PartnerContractSigningModal } from '../../components/partner/PartnerContractSigningModal'
import { PartnerProductDetailDrawer } from '../../components/partner/PartnerProductDetailDrawer'
import type { PartnerProductDetailTab } from '../../components/ProductDetailRightSection'
import { normalizeProductCaseStudyExamples } from '../../lib/productCaseStudies'
import {
  hydratePartnerCartFromProducts,
  partnerProductHasListPrice,
  partnerProductCanAddToCart,
  readPartnerCartFromStorage,
  writePartnerCartToStorage,
  PARTNER_OPEN_CART_EVENT,
  type PartnerCartStoredLine,
  type PartnerCartItem,
} from '../../lib/partnerCart'
import {
  hydratePartnerRfqFromProducts,
  readPartnerRfqFromStorage,
  writePartnerRfqToStorage,
  PARTNER_OPEN_RFQ_EVENT,
  type PartnerRfqStoredLine,
  type PartnerRfqItem,
} from '../../lib/partnerRfqBasket'

/* ─────────────────────────────────────────────── types ─── */
type CartItem = PartnerCartItem
type RfqItem = PartnerRfqItem

/* ─────────────────────────────────────────────── helpers ─── */

function formatPrice(price: number, langCode: string, currency: string): string {
  const locale = langCode === 'en' ? 'en-GB' : langCode === 'zh' ? 'zh-CN' : 'ro-RO'
  return `${price.toLocaleString(locale, { maximumFractionDigits: 0 })} ${currency}`
}

/** Net (catalog) and VAT portion after partner account discount. */
function computePartnerCartTotals(items: CartItem[], partnerDiscountPct: number | null): { net: number; vat: number } {
  let net = 0
  let vat = 0
  for (const { product, quantity } of items) {
    const nu = getPartnerCatalogNetUnitForDisplay(product, partnerDiscountPct)
    if (Number.isNaN(nu)) continue
    const lineNet = nu * quantity
    const vpc = getPartnerCatalogVatPercentForDisplay(product)
    net += lineNet
    if (vpc != null && vpc > 0) {
      vat += lineNet * (vpc / 100)
    }
  }
  return { net, vat }
}

function computePartnerCartGrossRounded(items: CartItem[], partnerDiscountPct: number | null): number {
  const { net, vat } = computePartnerCartTotals(items, partnerDiscountPct)
  return Math.round(net) + Math.round(vat)
}

/** Catalog total incl. VAT minus partner total — value of the account discount on this cart. */
function computePartnerCartDiscountSavings(items: CartItem[], partnerDiscountPct: number | null): number {
  if (partnerDiscountPct == null || partnerDiscountPct <= 0 || items.length === 0) return 0
  const catalogGross = computePartnerCartGrossRounded(items, null)
  const partnerGross = computePartnerCartGrossRounded(items, partnerDiscountPct)
  return Math.max(0, catalogGross - partnerGross)
}

function PartnerCartSavingsBox({
  items,
  partnerDiscountPct,
  langCode,
  currency,
  className = '',
  inline = false,
}: {
  items: CartItem[]
  partnerDiscountPct: number | null
  langCode: LangCode
  currency: string
  className?: string
  inline?: boolean
}) {
  const tr = getPartnerProductsTranslations(langCode)
  const savings = computePartnerCartDiscountSavings(items, partnerDiscountPct)
  const pct = partnerDiscountPct != null && partnerDiscountPct > 0 ? partnerDiscountPct : null
  if (!pct || savings <= 0 || items.length === 0) return null

  return (
    <div
      className={`${
        inline
          ? 'rounded-xl border border-emerald-200/90 bg-emerald-50 px-3 py-3'
          : 'rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm'
      } ${className}`.trim()}
      aria-live="polite"
    >
      <p className="m-0 text-xs font-bold uppercase tracking-wide text-emerald-800 font-['Inter'] sm:text-sm">
        {tr.cartPartnerEstimatedProfitTitle}
      </p>
      <p className="mt-1.5 m-0 text-2xl font-extrabold tabular-nums leading-none text-emerald-900 font-['Inter'] sm:text-3xl">
        {formatPrice(savings, langCode, currency)}
      </p>
      <p className="mt-1.5 m-0 text-sm leading-snug text-emerald-800/90 font-['Inter']">
        {tr.cartPartnerEstimatedProfitDescription}
      </p>
    </div>
  )
}

/** Vertical catalog sections on partner Produse (one bucket per product). */
const PARTNER_CATALOG_SECTION_ORDER: PartnerCatalogSectionId[] = [
  'rezidential',
  'micro_grid',
  'comercial_medical',
  'industrial',
  'maritim',
]

const PARTNER_CATALOG_SECTION_ICON: Record<PartnerCatalogSectionId, LucideIcon> = {
  rezidential: Home,
  micro_grid: LayoutGrid,
  comercial_medical: BriefcaseMedical,
  industrial: Factory,
  maritim: Anchor,
}

function partnerCatalogCategorieTokens(p: PublicProduct): string[] {
  return String(p.categorie || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

function partnerProductMatchesMicroGrid(p: PublicProduct): boolean {
  const tokens = partnerCatalogCategorieTokens(p)
  if (tokens.includes('micro_grid')) return true
  const catRaw = String(p.categorie || '').toLowerCase()
  if (/\bmicro[\s_-]?grid\b/.test(catRaw) || catRaw.includes('microgrid')) return true
  const blob = `${p.title} ${p.subtitle || ''}`.toLowerCase()
  return /\bmicro[\s_-]?grid\b/.test(blob) || blob.includes('microgrid')
}

function sortPartnerCatalogProducts(list: PublicProduct[]): PublicProduct[] {
  return [...list].sort((a, b) => {
    const promoDiff =
      Number(isPartnerAccountPromotedProduct(b)) - Number(isPartnerAccountPromotedProduct(a))
    if (promoDiff !== 0) return promoDiff
    return 0
  })
}

/** Assign each product to exactly one partner-facing section. */
function getPartnerCatalogSection(p: PublicProduct): PartnerCatalogSectionId {
  if (partnerProductMatchesMicroGrid(p)) return 'micro_grid'
  const tokens = partnerCatalogCategorieTokens(p)
  const has = (id: string) => tokens.includes(id)
  if (has('maritim')) return 'maritim'
  if (has('industrial')) return 'industrial'
  if (has('medical') || has('comercial')) return 'comercial_medical'
  if (has('rezidential')) return 'rezidential'
  const tip = String(p.tipProdus || '').toLowerCase()
  if (tip === 'industrial') return 'industrial'
  return 'rezidential'
}

const PARTNER_TOOLBAR_ICON_BTN =
  'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/80 disabled:opacity-50'

const PARTNER_LAYOUT_TOP_PAGE_ACTIONS_ID = 'partner-layout-top-page-actions'
const PARTNER_LAYOUT_TOP_LEADING_EXTRA_ID = 'partner-layout-top-leading-extra'

function PartnerLayoutTopBarPortal({ slotId, children }: { slotId: string; children: ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  useLayoutEffect(() => {
    setSlot(document.getElementById(slotId))
  }, [slotId])
  if (!slot) return null
  return createPortal(children, slot)
}

/* ─────────────────────────────────────────────── Cart skeleton ─── */
function PartnerCartPanelSkeletonInner() {
  return (
    <div className="animate-pulse motion-reduce:animate-none" aria-hidden>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3">
            <div className="h-14 w-14 shrink-0 rounded-xl bg-slate-200 ring-1 ring-slate-100" />
            <div className="min-w-0 flex-1 space-y-2 pt-0.5">
              <div className="h-3.5 w-[72%] max-w-[13rem] rounded-md bg-slate-200" />
              <div className="h-2.5 w-24 rounded bg-slate-200" />
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="h-8 w-[4.625rem] rounded-lg bg-slate-200" />
                <div className="h-7 w-7 rounded-lg bg-slate-200" />
                <div className="ml-auto h-3 w-[4rem] shrink-0 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PartnerCartPanelSkeletonFooter() {
  return (
    <div className="shrink-0 space-y-3 border-t border-slate-100 bg-white px-4 py-3">
      <div className="animate-pulse motion-reduce:animate-none space-y-2.5" aria-hidden>
        <div className="flex justify-between gap-3">
          <div className="h-3 w-[11rem] max-w-[45%] rounded bg-slate-200" />
          <div className="h-3 w-14 rounded bg-slate-200" />
        </div>
        <div className="flex justify-between gap-3">
          <div className="h-3 w-8 rounded bg-slate-200" />
          <div className="h-3 w-14 rounded bg-slate-200" />
        </div>
        <div className="flex justify-between gap-3 border-t border-slate-100 pt-2">
          <div className="h-4 w-[8.5rem] max-w-[50%] rounded bg-slate-200" />
          <div className="h-4 w-[4.75rem] rounded bg-slate-200" />
        </div>
      </div>
      <div className="h-10 w-full animate-pulse motion-reduce:animate-none rounded-xl bg-slate-300" aria-hidden />
    </div>
  )
}

/* ─────────────────────────────────────────────── Cart (sidebar + mobile sheet) ─── */
function PartnerCartPanel({
  variant,
  items,
  onChangeQty,
  onRemove,
  onDismiss,
  onCheckout,
  onClear,
  langCode,
  currency,
  partnerDiscountPct,
  loading = false,
  embedded = false,
  hideHeader = false,
  showSavingsBox = false,
}: {
  variant: 'sidebar' | 'mobile'
  items: CartItem[]
  onChangeQty: (productId: string, delta: number) => void
  onRemove: (productId: string) => void
  onDismiss?: () => void
  onCheckout?: () => void
  onClear?: () => void
  langCode: LangCode
  currency: string
  partnerDiscountPct: number | null
  loading?: boolean
  embedded?: boolean
  hideHeader?: boolean
  showSavingsBox?: boolean
}) {
  const tr = getPartnerProductsTranslations(langCode)
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const hasPricedItems = items.some(
    (i) => !Number.isNaN(getPartnerDisplayUnitPriceWithVat(i.product, partnerDiscountPct)),
  )

  const showClose = !!onDismiss && !embedded

  const shellClass = embedded
    ? 'relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white'
    : variant === 'sidebar'
      ? 'relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'
      : 'relative flex max-h-[min(58vh,560px)] flex-col overflow-hidden rounded-t-2xl border border-b-0 border-slate-200 bg-white shadow-[0_-12px_40px_rgba(15,23,42,0.12)]'

  return (
    <section
      aria-label={tr.cartAria}
      aria-busy={loading}
      className={shellClass}
    >
      {!hideHeader && (loading ? (
        <>
          <span className="sr-only">{partnerCartLoadingLabel(langCode)}</span>
          <header className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <ShoppingBag className="h-5 w-5 shrink-0 text-slate-700" strokeWidth={2} aria-hidden />
              <h2 className="m-0 truncate text-sm font-bold text-slate-900 font-['Inter']">{tr.cartTitle}</h2>
              <span className="h-5 min-w-[1.5rem] shrink-0 rounded-full bg-slate-200 animate-pulse motion-reduce:animate-none" aria-hidden />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="h-5 min-w-[1.25rem] shrink-0 rounded-full bg-slate-200 animate-pulse motion-reduce:animate-none" aria-hidden />
              {showClose ? (
                <button
                  type="button"
                  onClick={onDismiss}
                  aria-label={tr.cartCloseAria}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              ) : null}
            </div>
          </header>
        </>
      ) : (
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <ShoppingBag className="h-5 w-5 shrink-0 text-slate-700" strokeWidth={2} aria-hidden />
          <h2 className="m-0 truncate text-sm font-bold text-slate-900 font-['Inter']">{tr.cartTitle}</h2>
          {totalItems > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 px-1.5 text-[11px] font-bold text-white font-['Inter']">
              {totalItems}
            </span>
          )}
        </div>
        {showClose ? (
          <button
            type="button"
            onClick={onDismiss}
            aria-label={tr.cartCloseAria}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        ) : null}
      </header>
      ))}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <PartnerCartPanelSkeletonInner />
        ) : items.length === 0 ? (
          embedded ? (
            <PartnerCartEmptySidebar tr={tr} />
          ) : (
          <div className={`flex flex-col items-center justify-center gap-3 px-4 text-center ${variant === 'sidebar' ? 'py-8' : 'py-10'}`}>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <ShoppingBag className="h-6 w-6 text-slate-400" strokeWidth={1.5} />
            </div>
            <p className="m-0 text-sm font-medium text-slate-500 font-['Inter']">{tr.cartEmpty}</p>
            {(variant === 'mobile' || variant === 'sidebar') && onDismiss ? (
              <button
                type="button"
                onClick={onDismiss}
                className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 font-['Inter']"
              >
                {tr.cartContinueShopping}
              </button>
            ) : null}
          </div>
          )
        ) : (
          <ul className="m-0 list-none divide-y divide-slate-100 p-0">
            {items.map(({ product, quantity }) => {
              const img = getProductCardImageUrl(product)
              const price = getPartnerDisplayUnitPriceWithVat(product, partnerDiscountPct)
              const linePriceDisplay = !Number.isNaN(price) ? formatPrice(price * quantity, langCode, currency) : null
              const unitPriceDisplay = !Number.isNaN(price) ? formatPrice(price, langCode, currency) : null

              return (
                <li key={product.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f7f7f7] ring-1 ring-slate-200">
                    <img src={img} alt={product.title} className="h-full w-full object-contain p-1.5" loading="lazy" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 line-clamp-2 text-sm font-semibold leading-snug text-slate-900 font-['Inter']">{product.title}</p>
                    {unitPriceDisplay && (
                      <p className="mt-0.5 m-0 text-xs text-slate-400 font-['Inter']">
                        {unitPriceDisplay} {tr.cartPerUnit}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <button
                          type="button"
                          onClick={() => onChangeQty(product.id, -1)}
                          aria-label="−"
                          className="flex w-7 items-center justify-center text-slate-500 transition hover:bg-slate-50"
                        >
                          <Minus className="h-3 w-3" strokeWidth={2.5} />
                        </button>
                        <span className="flex w-8 items-center justify-center border-x border-slate-200 text-sm font-bold tabular-nums text-slate-900 font-['Inter']">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onChangeQty(product.id, 1)}
                          aria-label="+"
                          className="flex w-7 items-center justify-center text-slate-500 transition hover:bg-slate-50"
                        >
                          <Plus className="h-3 w-3" strokeWidth={2.5} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(product.id)}
                        aria-label={tr.cartRemoveItem}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                      {linePriceDisplay && (
                        <span className="ml-auto shrink-0 text-sm font-bold tabular-nums text-slate-900 font-['Inter']">
                          {linePriceDisplay}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {loading ? (
        <PartnerCartPanelSkeletonFooter />
      ) : items.length > 0 ? (
        <div className="shrink-0 space-y-2 border-t border-slate-100 bg-white px-4 py-3">
          {hasPricedItems && (() => {
            const { net, vat } = computePartnerCartTotals(items, partnerDiscountPct)
            const lb = partnerCartTotalsLabels(langCode)
            const rn = Math.round(net)
            const rv = Math.round(vat)
            const rg = rn + rv
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500 font-['Inter']">{lb.net}</span>
                  <span className="text-sm font-semibold tabular-nums text-slate-800 font-['Inter']">
                    {formatPrice(rn, langCode, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500 font-['Inter']">{lb.vat}</span>
                  <span className="text-sm font-semibold tabular-nums text-slate-800 font-['Inter']">
                    {formatPrice(rv, langCode, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2">
                  <span className="text-sm font-semibold text-slate-700 font-['Inter']">{lb.gross}</span>
                  <span className="text-lg font-extrabold tabular-nums text-slate-900 font-['Inter']">
                    {formatPrice(rg, langCode, currency)}
                  </span>
                </div>
                <p className="m-0 pt-1 text-xs leading-snug text-slate-400 font-['Inter']">
                  {tr.cartTotalsDisclaimer}
                </p>
              </div>
            )
          })()}
          {showSavingsBox ? (
            <PartnerCartSavingsBox
              items={items}
              partnerDiscountPct={partnerDiscountPct}
              langCode={langCode}
              currency={currency}
              inline
            />
          ) : null}
          <button
            type="button"
            onClick={() => onCheckout?.()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 active:bg-slate-950 font-['Inter']"
          >
            <CreditCard className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            {tr.cartCheckout}
          </button>
          {onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="w-full py-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-800 font-['Inter']"
            >
              {tr.cartClear}
            </button>
          ) : null}
          {!embedded && variant === 'mobile' && onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="w-full rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 font-['Inter']"
            >
              {tr.cartContinueShopping}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

function renderPartnerBasketTabPanel({
  tab,
  variant,
  cartItems,
  rfqItems,
  cartStorageReady,
  rfqStorageReady,
  changeCartQty,
  removeFromCart,
  clearCart,
  changeRfqQty,
  removeFromRfq,
  clearRfq,
  onDismiss,
  onCheckout,
  langCode,
  currency,
  partnerDiscountPct,
  discountPricesVisible,
}: {
  tab: PartnerBasketTab
  variant: 'sidebar' | 'mobile'
  cartItems: CartItem[]
  rfqItems: RfqItem[]
  cartStorageReady: boolean
  rfqStorageReady: boolean
  changeCartQty: (productId: string, delta: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  changeRfqQty: (productId: string, delta: number) => void
  removeFromRfq: (productId: string) => void
  clearRfq: () => void
  onDismiss?: () => void
  onCheckout: () => void
  langCode: LangCode
  currency: string
  partnerDiscountPct: number | null
  discountPricesVisible: boolean
}) {
  const tr = getPartnerProductsTranslations(langCode)
  const panelLoading = tab === 'cart' ? !cartStorageReady : !rfqStorageReady

  if (panelLoading) {
    return (
      <PartnerBasketTabPanelSkeleton
        loadingLabel={tab === 'cart' ? tr.cartLoading : tr.basketPanelLoading}
      />
    )
  }

  if (tab === 'cart') {
    return (
      <PartnerCartPanel
        variant={variant}
        embedded
        hideHeader
        showSavingsBox
        loading={false}
        items={cartItems}
        onChangeQty={changeCartQty}
        onRemove={removeFromCart}
        onClear={clearCart}
        onDismiss={onDismiss}
        onCheckout={onCheckout}
        langCode={langCode}
        currency={currency}
        partnerDiscountPct={partnerDiscountPct}
      />
    )
  }

  return (
    <PartnerRfqBasketPanel
      variant={variant}
      embedded
      hideHeader
      loading={false}
      items={rfqItems}
      onChangeQty={changeRfqQty}
      onRemove={removeFromRfq}
      onClear={clearRfq}
      onDismiss={onDismiss}
      langCode={langCode}
      currency={currency}
      discountPricesVisible={discountPricesVisible}
    />
  )
}

/* ─────────────────────────────────────────────── ProductCard ─── */
function PartnerProductCardControls({
  quantity,
  onQuantityChange,
  onViewDetails,
  onPrimaryAction,
  detailsLabel,
  primaryLabel,
  primaryIcon: PrimaryIcon,
}: {
  quantity: number
  onQuantityChange: (delta: number) => void
  onViewDetails: () => void
  onPrimaryAction: () => void
  detailsLabel: string
  primaryLabel: string
  primaryIcon: typeof ClipboardList
}) {
  return (
    <>
      <div
        className="grid grid-cols-[1fr_46px_1fr] overflow-hidden rounded-[10px] border border-[#e8eaf0]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onQuantityChange(-1)}
          aria-label="−"
          className="border-0 bg-white py-[9px] text-lg text-[#4d6079] transition hover:bg-[#f4f5f7]"
        >
          −
        </button>
        <span
          className="grid place-items-center border-x border-[#e8eaf0] text-[15px] font-semibold tabular-nums text-[#0f1422]"
          aria-live="polite"
        >
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => onQuantityChange(1)}
          aria-label="+"
          className="border-0 bg-white py-[9px] text-lg text-[#4d6079] transition hover:bg-[#f4f5f7]"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onViewDetails()
        }}
        className="mt-[9px] flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-[#e8eaf0] bg-white px-3 py-[11px] text-[13.5px] font-semibold text-[#4d6079] transition hover:bg-[#f4f5f7]"
      >
        <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        {detailsLabel}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onPrimaryAction()
        }}
        className="mt-[9px] flex w-full items-center justify-center gap-2 rounded-[11px] border-0 bg-[#0f1422] px-3 py-3.5 text-[14.5px] font-semibold text-white transition hover:bg-[#1a2233]"
      >
        <PrimaryIcon className="h-4 w-4" strokeWidth={1.9} aria-hidden />
        {primaryLabel}
      </button>
    </>
  )
}

function PartnerProductCard({
  product,
  selected,
  quantity,
  onQuantityChange,
  onAddToCart,
  onAddToRfq,
  onViewDetails,
  trProduse,
  trProducts,
  currency,
  langCode,
  partnerDiscountPct,
  partnerContractSignedAt,
  discountPricesVisible,
}: {
  product: PublicProduct
  selected: boolean
  quantity: number
  onQuantityChange: (delta: number) => void
  onAddToCart: () => void
  onAddToRfq: () => void
  onViewDetails: () => void
  trProduse: ReturnType<typeof getProduseTranslations>
  trProducts: ReturnType<typeof getPartnerProductsTranslations>
  currency: string
  langCode: string
  partnerDiscountPct: number | null
  partnerContractSignedAt: string | null
  discountPricesVisible: boolean
}) {
  const img = getProductCardImageUrl(product)
  const { specLine1 } = getCatalogProductSpecLines(product)
  const stockUnavailable = residentialProductStockUnavailable(product)
  const stockCta = getResidentialCatalogStockListingCta(product, {
    outOfStock: trProduse.catalogStockOutOfStock,
    comingSoon: trProduse.catalogStockComingSoon,
  })

  const hasListPrice = partnerProductHasListPrice(product)
  const canAddToCart = partnerProductCanAddToCart(discountPricesVisible, product)
  const quoteStyle = !hasListPrice || product.catalogStockStatus === 'on_order'
  const subtitle = String(product.subtitle || '').trim()
  const detailsLabel = hasListPrice ? trProducts.cardDetailsLabel : trProducts.cardSpecsLabel
  const primaryLabel = canAddToCart
    ? trProducts.cardAddToCart
    : discountPricesVisible
      ? trProducts.requestQuoteNoListPrice
      : trProducts.requestQuote
  const PrimaryIcon = canAddToCart ? ShoppingCart : ClipboardList

  return (
    <li
      onClick={onViewDetails}
      className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,20,34,0.04),0_16px_36px_-22px_rgba(15,20,34,0.16)] transition-all duration-200 ${
        selected ? 'border-[#4d6079]' : 'border-[#e8eaf0] hover:border-[#d9dde6]'
      }`}
    >
      <div className="relative grid h-[172px] shrink-0 place-items-center bg-[#f7f7f7]">
        <img
          src={img}
          alt={product.title}
          className="max-h-[130px] max-w-[calc(100%-3rem)] object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <PartnerCatalogCardMedia
          product={product}
          trProduse={trProduse}
          trProducts={trProducts}
          quoteStyle={quoteStyle}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4">
        <div className="min-h-0 flex-1">
          <p className="m-0 line-clamp-2 text-[15.5px] font-bold leading-snug tracking-[-0.01em] text-[#0f1422]">
            {product.title}
          </p>
          {(subtitle || specLine1) && (
            <p
              className={`mt-1 m-0 line-clamp-2 text-[12px] font-semibold leading-relaxed ${
                quoteStyle ? 'text-[#4d6079]' : 'text-[#0e8459]'
              }`}
            >
              {subtitle || specLine1}
            </p>
          )}
        </div>

        <div className="mt-auto shrink-0 pt-3.5">
          {!stockUnavailable ? (
            <PartnerCatalogPriceBlock
              product={product}
              partnerDiscountPct={partnerDiscountPct}
              partnerContractSignedAt={partnerContractSignedAt}
              className="w-full"
              formatAmount={(amount) => formatPrice(amount, langCode, currency)}
            />
          ) : stockCta ? (
            <p className="m-0 rounded-xl border border-[#e8eaf0] bg-[#fafbfc] px-3 py-3 text-center text-xs font-semibold text-[#6a7281]">
              {stockCta}
            </p>
          ) : null}

          {stockUnavailable ? (
            <div className="mt-3 rounded-xl border border-[#e8eaf0] bg-[#f4f5f7] px-3 py-2 text-center">
              <p className="m-0 text-xs font-semibold text-[#6a7281]">{trProduse.catalogStockPartnerFooterNote}</p>
            </div>
          ) : (
            <div className="mt-[13px]">
              <PartnerProductCardControls
                quantity={quantity}
                onQuantityChange={onQuantityChange}
                onViewDetails={onViewDetails}
                onPrimaryAction={() => {
                  if (canAddToCart) onAddToCart()
                  else onAddToRfq()
                }}
                detailsLabel={detailsLabel}
                primaryLabel={primaryLabel}
                primaryIcon={PrimaryIcon}
              />
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

/* ─────────────────────────────────────────────── Skeleton ─── */
function PartnerProductCardSkeleton() {
  return (
    <li className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#e8eaf0] bg-white animate-pulse shadow-[0_1px_2px_rgba(15,20,34,0.04)]" aria-hidden>
      <div className="h-[172px] shrink-0 bg-[#f7f7f7]" />
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <div className="flex-1 space-y-2">
          <div className="h-5 w-4/5 rounded-md bg-[#e8eaf0]" />
          <div className="h-3 w-full rounded-md bg-[#e8eaf0]" />
        </div>
        <div className="mt-auto shrink-0 space-y-2 pt-3.5">
          <div className="h-[7.5rem] w-full rounded-[13px] bg-[#eaf7f1]" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-16 rounded-[10px] bg-[#f4f5f7]" />
            <div className="h-16 rounded-[10px] bg-[#f4f5f7]" />
          </div>
          <div className="h-10 w-full rounded-[10px] bg-[#f4f5f7]" />
          <div className="h-10 w-full rounded-[10px] bg-[#f4f5f7]" />
          <div className="h-12 w-full rounded-[11px] bg-[#e8eaf0]" />
        </div>
      </div>
    </li>
  )
}

/* ─────────────────────────────────────────────── Page ─── */
export default function PartnerProducts() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const detailIdFromRoute = searchParams.get('detail')?.trim() ?? ''
  const { language } = useLanguage()
  const { currency } = useCatalogCurrency()
  const tr = getProductDetailTranslations(language.code)
  const trProduse = getProduseTranslations(language.code)
  const trProducts = getPartnerProductsTranslations(language.code)
  const trDash = getPartnerDashboardTranslations(language.code)

  const [products, setProducts] = useState<PublicProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailPanelTab, setDetailPanelTab] = useState<PartnerProductDetailTab>('detalii')

  const partnerDetailTabs = useMemo(() => {
    const tabs: { id: PartnerProductDetailTab; label: string }[] = [
      { id: 'detalii', label: trProducts.detailTabDetails },
      { id: 'tehnice', label: tr.techSpecsTab },
      { id: 'manuale', label: trProducts.detailTabManuals },
      { id: 'videos', label: trProducts.detailTabVideos },
    ]
    const caseStudyItems = normalizeProductCaseStudyExamples(selectedProduct?.caseStudyExamples)
    if (caseStudyItems.length > 0) {
      tabs.push({ id: 'caseStudies', label: tr.studiiDeCaz })
    }
    tabs.push({ id: 'faq', label: tr.intrebariFrecvente })
    return tabs
  }, [selectedProduct, tr, trProducts])

  const [quantities, setQuantities] = useState<Record<string, number>>({})

  /* ── cart ── */
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  /** False until first catalog load + localStorage hydrate completes (avoids saving [] over a persisted cart). */
  const [cartStorageReady, setCartStorageReady] = useState(false)
  const [basketTab, setBasketTab] = useState<PartnerBasketTab>('cart')
  const [basketOpen, setBasketOpen] = useState(false)
  const prevCartTotalRef = useRef(0)
  const prevRfqTotalRef = useRef(0)
  const [searchBarExpanded, setSearchBarExpanded] = useState(false)

  /* ── RFQ basket (before partner discount is approved) ── */
  const [rfqItems, setRfqItems] = useState<RfqItem[]>([])
  const [rfqStorageReady, setRfqStorageReady] = useState(false)

  /* ── partner discount ── */
  const [discountPercent, setDiscountPercent] = useState<number | null>(null)
  const [partnerContractSignedAt, setPartnerContractSignedAt] = useState<string | null>(null)
  const discountConfigured = partnerDiscountConfigured(discountPercent)
  const discountPricesVisible = partnerCanSeeDiscountPrices({
    partnerDiscountPercent: discountPercent,
    partnerContractSignedAt,
  })
  const [contractSigningModalOpen, setContractSigningModalOpen] = useState(false)
  const [readingContractPdf, setReadingContractPdf] = useState(false)

  const handleReadContractPdf = useCallback(async () => {
    setReadingContractPdf(true)
    try {
      await openPartnerContractPreview()
    } catch (err) {
      console.error(err)
    } finally {
      setReadingContractPdf(false)
    }
  }, [])

  const reloadPartnerDiscountProfile = useCallback(() => {
    getPartnerProfile()
      .then((p) => {
        setDiscountPercent(p?.partnerDiscountPercent ?? null)
        setPartnerContractSignedAt(
          typeof p?.partnerContractSignedAt === 'string' && p.partnerContractSignedAt.trim()
            ? p.partnerContractSignedAt
            : null,
        )
      })
      .catch(() => {})
  }, [])

  const dismissProductDetailPanel = useCallback(() => {
    setSelectedId(null)
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete('detail')
        return next
      },
      { replace: true },
    )
  }, [setSearchParams])

  const openProductDetail = useCallback(
    (productId: string) => {
      const id = String(productId || '').trim()
      if (!id) return
      setSelectedId(id)
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('detail', id)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const searchRef = useRef<HTMLInputElement>(null)
  const basketSectionRef = useRef<HTMLDivElement>(null)

  const scrollDesktopBasketIntoView = () => {
    requestAnimationFrame(() => {
      basketSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  const openCartUi = useCallback(() => {
    setBasketTab('cart')
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1280px)').matches) {
      scrollDesktopBasketIntoView()
    } else {
      setBasketOpen(true)
    }
  }, [])

  const openRfqUi = useCallback(() => {
    setBasketTab('rfq')
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1280px)').matches) {
      scrollDesktopBasketIntoView()
    } else {
      setBasketOpen(true)
    }
  }, [])

  useEffect(() => {
    const onOpenCart = () => openCartUi()
    window.addEventListener(PARTNER_OPEN_CART_EVENT, onOpenCart)
    return () => window.removeEventListener(PARTNER_OPEN_CART_EVENT, onOpenCart)
  }, [openCartUi])

  useEffect(() => {
    const onOpenRfq = () => openRfqUi()
    window.addEventListener(PARTNER_OPEN_RFQ_EVENT, onOpenRfq)
    return () => window.removeEventListener(PARTNER_OPEN_RFQ_EVENT, onOpenRfq)
  }, [openRfqUi])

  useEffect(() => {
    const st = location.state as { openCart?: boolean; openRfq?: boolean } | null
    if (st?.openRfq) {
      openRfqUi()
    } else if (st?.openCart) {
      openCartUi()
    }
    if (!st?.openCart && !st?.openRfq) return
    navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: {} })
  }, [location.pathname, location.search, location.state, navigate, openCartUi, openRfqUi])

  /* ── partner profile (discount) ── */
  useEffect(() => {
    getPartnerProfile()
      .then((p) => {
        setDiscountPercent(p?.partnerDiscountPercent ?? null)
        setPartnerContractSignedAt(
          typeof p?.partnerContractSignedAt === 'string' && p.partnerContractSignedAt.trim()
            ? p.partnerContractSignedAt
            : null,
        )
      })
      .catch(() => {
        setDiscountPercent(null)
        setPartnerContractSignedAt(null)
      })
  }, [])

  /* ── data ── */
  useEffect(() => {
    getProducts()
      .then((list) => setProducts(filterProductsForPartnerPanel(Array.isArray(list) ? list : [])))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  /* ── Restore partner cart from localStorage after catalog is available ── */
  useEffect(() => {
    if (loading || cartStorageReady) return

    const stored = readPartnerCartFromStorage()
    const restored = hydratePartnerCartFromProducts(products, stored)
    setCartItems(restored)
    setCartStorageReady(true)
  }, [loading, products, cartStorageReady])

  /* ── Restore partner RFQ basket from localStorage ── */
  useEffect(() => {
    if (loading || rfqStorageReady) return

    const stored = readPartnerRfqFromStorage()
    const restored = hydratePartnerRfqFromProducts(products, stored)
    setRfqItems(restored)
    setRfqStorageReady(true)
  }, [loading, products, rfqStorageReady])

  /* ── Persist partner cart ── */
  useEffect(() => {
    if (!cartStorageReady || typeof window === 'undefined') return
    const minimal: PartnerCartStoredLine[] = cartItems.map(({ product, quantity }) => ({
      productId: product.id,
      quantity,
    }))
    writePartnerCartToStorage(minimal)
  }, [cartItems, cartStorageReady])

  /* ── Persist partner RFQ basket ── */
  useEffect(() => {
    if (!rfqStorageReady || typeof window === 'undefined') return
    const minimal: PartnerRfqStoredLine[] = rfqItems.map(({ product, quantity }) => ({
      productId: product.id,
      quantity,
    }))
    writePartnerRfqToStorage(minimal)
  }, [rfqItems, rfqStorageReady])

  /* ── load full product when selected ── */
  useEffect(() => {
    if (!selectedId) {
      setSelectedProduct(null)
      setDetailLoading(false)
      return
    }
    setDetailPanelTab('detalii')
    setDetailLoading(true)
    getProduct(selectedId)
      .then(setSelectedProduct)
      .catch(() => setSelectedProduct(null))
      .finally(() => setDetailLoading(false))
  }, [selectedId])

  useEffect(() => {
    if (detailPanelTab !== 'caseStudies') return
    const caseStudyItems = normalizeProductCaseStudyExamples(selectedProduct?.caseStudyExamples)
    if (caseStudyItems.length === 0) setDetailPanelTab('detalii')
  }, [detailPanelTab, selectedProduct])

  useEffect(() => {
    if (!detailIdFromRoute) return
    setSelectedId(detailIdFromRoute)
  }, [detailIdFromRoute])

  /* ── search → sections (3-column grids per vertical section) ── */
  const searchFiltered = useMemo(() => {
    let list = products
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          String(p.subtitle || '').toLowerCase().includes(q) ||
          String(p.description || '').toLowerCase().includes(q),
      )
    }
    return list
  }, [products, search])

  const { sectionBuckets, displayedProductsFlat } = useMemo(() => {
    const buckets: Record<PartnerCatalogSectionId, PublicProduct[]> = {
      rezidential: [],
      micro_grid: [],
      comercial_medical: [],
      industrial: [],
      maritim: [],
    }
    for (const p of searchFiltered) {
      const sec = getPartnerCatalogSection(p)
      buckets[sec].push(p)
    }
    for (const id of PARTNER_CATALOG_SECTION_ORDER) {
      buckets[id] = sortPartnerCatalogProducts(buckets[id])
    }
    const flat = PARTNER_CATALOG_SECTION_ORDER.flatMap((id) => buckets[id])
    return { sectionBuckets: buckets, displayedProductsFlat: flat }
  }, [searchFiltered])

  /* ── deselect if filtered away (keep ?detail= deep links on refresh / shared URLs) ── */
  useEffect(() => {
    if (!selectedId) return
    if (loading) return
    if (detailIdFromRoute) return
    const ref = selectedId.trim()
    const stillVisible = displayedProductsFlat.some(
      (p) => p.id === ref || (p.slug != null && String(p.slug) === ref),
    )
    if (!stillVisible) dismissProductDetailPanel()
  }, [displayedProductsFlat, selectedId, dismissProductDetailPanel, loading, detailIdFromRoute])

  /* ── qty helpers ── */
  const qty = (id: string) => quantities[id] ?? 1
  const changeQty = (id: string, delta: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, Math.min(99, (prev[id] ?? 1) + delta)) }))
  }

  /* ── cart helpers ── */
  const addToCart = (product: PublicProduct, quantity: number) => {
    if (!partnerProductCanAddToCart(discountPricesVisible, product)) return
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(99, i.quantity + quantity) }
            : i,
        )
      }
      return [...prev, { product, quantity }]
    })
    dismissProductDetailPanel()
    setBasketTab('cart')
    if (typeof window === 'undefined' || !window.matchMedia('(min-width: 1280px)').matches) {
      setBasketOpen(true)
    }
  }

  const addToRfq = (product: PublicProduct, quantity: number) => {
    if (partnerProductCanAddToCart(discountPricesVisible, product)) return
    setRfqItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(99, i.quantity + quantity) }
            : i,
        )
      }
      return [...prev, { product, quantity }]
    })
    dismissProductDetailPanel()
    openRfqUi()
  }

  const changeRfqQty = (productId: string, delta: number) => {
    setRfqItems((prev) =>
      prev
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: Math.max(1, Math.min(99, i.quantity + delta)) }
            : i,
        )
    )
  }

  const removeFromRfq = (productId: string) => {
    setRfqItems((prev) => prev.filter((i) => i.product.id !== productId))
  }

  const clearRfq = () => {
    setRfqItems([])
  }

  const changeCartQty = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: Math.max(1, Math.min(99, i.quantity + delta)) }
            : i,
        )
    )
  }

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const cartTotalItems = cartItems.reduce((s, i) => s + i.quantity, 0)
  const rfqTotalItems = rfqItems.reduce((s, i) => s + i.quantity, 0)

  /* After first line added on desktop, scroll sidebar basket into view */
  useEffect(() => {
    const prev = prevCartTotalRef.current
    prevCartTotalRef.current = cartTotalItems
    if (typeof window === 'undefined' || !window.matchMedia('(min-width: 1280px)').matches) return
    if (prev === 0 && cartTotalItems > 0) {
      requestAnimationFrame(() => scrollDesktopBasketIntoView())
    }
  }, [cartTotalItems])

  useEffect(() => {
    const prev = prevRfqTotalRef.current
    prevRfqTotalRef.current = rfqTotalItems
    if (typeof window === 'undefined' || !window.matchMedia('(min-width: 1280px)').matches) return
    if (prev === 0 && rfqTotalItems > 0) {
      setBasketTab('rfq')
      requestAnimationFrame(() => scrollDesktopBasketIntoView())
    }
  }, [rfqTotalItems])

  const catalogSectionLabels = useMemo(
    () => partnerCatalogSectionLabels(language.code),
    [language.code],
  )

  const trToolbar = useMemo(() => partnerToolbarLabels(language.code), [language.code])

  useEffect(() => {
    if (!searchBarExpanded || typeof window === 'undefined') return
    const id = window.requestAnimationFrame(() => {
      searchRef.current?.focus()
    })
    return () => cancelAnimationFrame(id)
  }, [searchBarExpanded])

  useEffect(() => {
    if (!searchBarExpanded || typeof window === 'undefined') return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchBarExpanded(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [searchBarExpanded])

  const productGridClass =
    'm-0 grid list-none auto-rows-fr grid-cols-1 items-stretch gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3'

  const scrollToCatalogSection = useCallback((sid: PartnerCatalogSectionId) => {
    document.getElementById(`partner-catalog-${sid}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [])

  const catalogLeading = (
    <>
      <div className="relative min-w-0 flex-1 lg:hidden">
        <label htmlFor="partner-catalog-section-filter" className="sr-only">
          {trProducts.catalogSectionFilterAria}
        </label>
        <select
          id="partner-catalog-section-filter"
          defaultValue=""
          aria-label={trProducts.catalogSectionFilterAria}
          onChange={(e) => {
            const sid = e.target.value as PartnerCatalogSectionId
            if (sid) scrollToCatalogSection(sid)
          }}
          className="h-8 w-full min-w-0 max-w-full appearance-none truncate rounded-lg border border-slate-200 bg-white py-0 pl-2.5 pr-7 text-[11px] font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/80 sm:text-xs font-['Inter']"
        >
          <option value="" disabled>
            {trProducts.catalogSectionFilterPlaceholder}
          </option>
          {PARTNER_CATALOG_SECTION_ORDER.filter((sid) => sectionBuckets[sid].length > 0).map((sid) => {
            const count = sectionBuckets[sid].length
            const label = catalogSectionLabels[sid]
            return (
              <option key={sid} value={sid}>
                {label}
                {count > 0 ? ` (${count})` : ''}
              </option>
            )
          })}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
          strokeWidth={2}
          aria-hidden
        />
      </div>
      <nav
        className="hidden min-w-0 flex-1 items-center gap-1.5 overflow-x-auto [scrollbar-width:thin] lg:flex sm:gap-1.5"
        role="navigation"
        aria-label={trProducts.catalogNavAria}
      >
        {PARTNER_CATALOG_SECTION_ORDER.filter((sid) => sectionBuckets[sid].length > 0).map((sid) => {
          const count = sectionBuckets[sid].length
          const label = catalogSectionLabels[sid]
          return (
            <button
              key={sid}
              type="button"
              onClick={() => scrollToCatalogSection(sid)}
              className="flex h-8 shrink-0 items-center rounded-lg bg-white px-2.5 text-left text-[11px] font-semibold leading-tight text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 sm:text-xs font-['Inter']"
            >
              <span className="max-w-[9rem] truncate sm:max-w-none">{label}</span>
              {count > 0 ? (
                <span className="ml-1 shrink-0 tabular-nums text-slate-400">({count})</span>
              ) : null}
            </button>
          )
        })}
      </nav>
    </>
  )

  const catalogToolbar = (
    <>
      <div
        className={`flex min-h-9 min-w-0 items-center overflow-hidden transition-[max-width,opacity] duration-200 ease-out ${searchBarExpanded ? 'pointer-events-auto max-w-[min(100vw-11rem,20rem)] flex-1 opacity-100 sm:max-w-[20rem]' : 'pointer-events-none max-w-0 flex-[0_0_auto] opacity-0'}`}
        aria-hidden={!searchBarExpanded}
      >
        <div className="relative w-full min-w-[8rem] pr-1 sm:min-w-[12rem]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={2}
            aria-hidden
          />
          <input
            ref={searchRef}
            id="partner-catalog-search-input"
            type="search"
            placeholder={trToolbar.searchProducts}
            autoComplete="off"
            aria-label={trToolbar.searchProducts}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={!searchBarExpanded}
            className="h-9 w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/80 disabled:pointer-events-none disabled:opacity-50 font-['Inter']"
          />
          {search && searchBarExpanded ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label={trToolbar.clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {search.trim() !== '' ? (
        <button
          type="button"
          onClick={() => setSearch('')}
          className="hidden h-9 shrink-0 rounded-xl px-3 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 hover:text-slate-800 sm:inline-flex font-['Inter']"
        >
          {trProduse.clearFilters}
        </button>
      ) : null}

      <div className="relative flex shrink-0 items-center gap-2">
        <button
          type="button"
          aria-label={searchBarExpanded ? trToolbar.closeSearchPanel : trToolbar.openSearchPanel}
          aria-expanded={searchBarExpanded}
          aria-controls="partner-catalog-search-input"
          aria-pressed={searchBarExpanded}
          onClick={() => setSearchBarExpanded((e) => !e)}
          className={`${PARTNER_TOOLBAR_ICON_BTN} ${searchBarExpanded ? 'ring-2 ring-slate-900/25' : ''}`}
        >
          <Search className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <PartnerLayoutTopBarPortal slotId={PARTNER_LAYOUT_TOP_LEADING_EXTRA_ID}>{catalogLeading}</PartnerLayoutTopBarPortal>
      <PartnerLayoutTopBarPortal slotId={PARTNER_LAYOUT_TOP_PAGE_ACTIONS_ID}>{catalogToolbar}</PartnerLayoutTopBarPortal>

      {/* ── Main area: grid + right sidebar (info + basket) ── */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Product grid — only this column scrolls; scrollbar visually hidden */}
        <div className="min-w-0 flex-1 overflow-y-auto bg-[#f7f7f7] p-4 sm:p-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {loading ? (
            <ul className={productGridClass} aria-hidden>
              {Array.from({ length: 6 }).map((_, i) => (
                <PartnerProductCardSkeleton key={i} />
              ))}
            </ul>
          ) : displayedProductsFlat.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <Search className="h-6 w-6 text-slate-400" strokeWidth={1.5} />
            </div>
              <p className="text-sm text-slate-500 font-['Inter']">{trProduse.noResults}</p>
              {search ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                  }}
                  className="text-xs font-semibold text-slate-900 underline underline-offset-2"
                >
                  {trProduse.clearFilters}
                </button>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col gap-6 pb-4">
              {PARTNER_CATALOG_SECTION_ORDER.map((sectionId) => {
                const list = sectionBuckets[sectionId]
                if (list.length === 0) return null
                const SectionIcon = PARTNER_CATALOG_SECTION_ICON[sectionId]
                return (
                  <section
                    key={sectionId}
                    id={`partner-catalog-${sectionId}`}
                    className="scroll-mt-36 rounded-2xl border border-slate-200 bg-white p-4 sm:scroll-mt-40 sm:p-6"
                    aria-labelledby={`partner-catalog-heading-${sectionId}`}
                  >
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                      <h2
                        id={`partner-catalog-heading-${sectionId}`}
                        className="m-0 flex min-w-0 flex-1 items-center gap-2 text-xl font-bold tracking-tight text-slate-900 font-['Inter'] sm:gap-2.5 sm:text-2xl"
                      >
                        <SectionIcon
                          className="h-7 w-7 shrink-0 text-slate-700 sm:h-8 sm:w-8"
                          strokeWidth={1.85}
                          aria-hidden
                        />
                        <span className="min-w-0">{catalogSectionLabels[sectionId]}</span>
                      </h2>
                      <span className="text-xs font-medium tabular-nums text-slate-400 font-['Inter']">
                        {formatPartnerCatalogSectionCount(language.code, list.length)}
                      </span>
                    </div>
                    <ul className={productGridClass}>
                      {list.map((product) => (
                        <PartnerProductCard
                  key={product.id}
                  product={product}
                  selected={selectedId === product.id}
                          quantity={qty(product.id)}
                          trProduse={trProduse}
                          trProducts={trProducts}
                          currency={currency}
                          langCode={language.code}
                          partnerDiscountPct={discountPercent}
                          partnerContractSignedAt={partnerContractSignedAt}
                          discountPricesVisible={discountPricesVisible}
                          onQuantityChange={(delta) => changeQty(product.id, delta)}
                          onAddToCart={() => addToCart(product, qty(product.id))}
                          onAddToRfq={() => addToRfq(product, qty(product.id))}
                          onViewDetails={() => openProductDetail(product.id)}
                />
              ))}
                    </ul>
                  </section>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Right sidebar: coș + cerere de ofertă (tabs) ── */}
        <aside className="hidden min-h-0 w-[23rem] shrink-0 flex-col border-l border-slate-200 bg-[#f7f7f7] xl:flex xl:flex-col">
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 sm:p-6">
            <div ref={basketSectionRef} className="flex min-h-0 w-full min-w-0 shrink-0 flex-col">
              {discountPricesVisible ? (
                <PartnerBasketTabsShell
                  variant="sidebar"
                  activeTab={basketTab}
                  onTabChange={setBasketTab}
                  showCartTab
                  cartCount={cartTotalItems}
                  rfqCount={rfqTotalItems}
                  langCode={language.code}
                >
                  {renderPartnerBasketTabPanel({
                    tab: basketTab,
                    variant: 'sidebar',
                    cartItems,
                    rfqItems,
                    cartStorageReady,
                    rfqStorageReady,
                    changeCartQty,
                    removeFromCart,
                    clearCart,
                    changeRfqQty,
                    removeFromRfq,
                    clearRfq,
                    onCheckout: () => navigate('/partner/checkout'),
                    langCode: language.code,
                    currency,
                    partnerDiscountPct: discountPercent,
                    discountPricesVisible: true,
                  })}
                </PartnerBasketTabsShell>
              ) : discountConfigured ? (
                <PartnerContractSigningCallout
                  variant="sidebar"
                  className="mt-0"
                  title={trDash.contractSigningCalloutTitle}
                  subtitle={trDash.contractSigningCalloutSubtitle}
                  signButtonLabel={trDash.contractSigningCalloutButton}
                  readPdfLabel={trDash.contractSigningCalloutReadPdf}
                  onSignClick={() => setContractSigningModalOpen(true)}
                  onReadPdfClick={handleReadContractPdf}
                  readingPdf={readingContractPdf}
                />
              ) : (
                <PartnerBasketTabsShell
                  variant="sidebar"
                  activeTab="rfq"
                  onTabChange={() => {}}
                  showCartTab={false}
                  cartCount={0}
                  rfqCount={rfqTotalItems}
                  langCode={language.code}
                >
                  {renderPartnerBasketTabPanel({
                    tab: 'rfq',
                    variant: 'sidebar',
                    cartItems,
                    rfqItems,
                    cartStorageReady,
                    rfqStorageReady,
                    changeCartQty,
                    removeFromCart,
                    clearCart,
                    changeRfqQty,
                    removeFromRfq,
                    clearRfq,
                    onCheckout: () => navigate('/partner/checkout'),
                    langCode: language.code,
                    currency,
                    partnerDiscountPct: discountPercent,
                    discountPricesVisible: false,
                  })}
                </PartnerBasketTabsShell>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile basket — bottom sheet with tabs */}
      {discountPricesVisible ? (
        <div
          className={`xl:hidden fixed inset-x-0 bottom-0 z-[45] px-2 pb-2 transition-transform duration-300 ease-out ${
            basketOpen ? 'translate-y-0 pointer-events-auto' : 'translate-y-[calc(100%+8px)] pointer-events-none'
          }`}
        >
          <PartnerBasketTabsShell
            variant="mobile"
            activeTab={basketTab}
            onTabChange={setBasketTab}
            showCartTab
            cartCount={cartTotalItems}
            rfqCount={rfqTotalItems}
            onDismiss={() => setBasketOpen(false)}
            langCode={language.code}
          >
            {renderPartnerBasketTabPanel({
              tab: basketTab,
              variant: 'mobile',
              cartItems,
              rfqItems,
              cartStorageReady,
              rfqStorageReady,
              changeCartQty,
              removeFromCart,
              clearCart,
              changeRfqQty,
              removeFromRfq,
              clearRfq,
              onDismiss: () => setBasketOpen(false),
              onCheckout: () => navigate('/partner/checkout'),
              langCode: language.code,
              currency,
              partnerDiscountPct: discountPercent,
              discountPricesVisible: true,
            })}
          </PartnerBasketTabsShell>
        </div>
      ) : !discountConfigured ? (
        <div
          className={`xl:hidden fixed inset-x-0 bottom-0 z-[45] px-2 pb-2 transition-transform duration-300 ease-out ${
            basketOpen ? 'translate-y-0 pointer-events-auto' : 'translate-y-[calc(100%+8px)] pointer-events-none'
          }`}
        >
          <PartnerBasketTabsShell
            variant="mobile"
            activeTab="rfq"
            onTabChange={() => {}}
            showCartTab={false}
            cartCount={0}
            rfqCount={rfqTotalItems}
            onDismiss={() => setBasketOpen(false)}
            langCode={language.code}
          >
            {renderPartnerBasketTabPanel({
              tab: 'rfq',
              variant: 'mobile',
              cartItems,
              rfqItems,
              cartStorageReady,
              rfqStorageReady,
              changeCartQty,
              removeFromCart,
              clearCart,
              changeRfqQty,
              removeFromRfq,
              clearRfq,
              onDismiss: () => setBasketOpen(false),
              onCheckout: () => navigate('/partner/checkout'),
              langCode: language.code,
              currency,
              partnerDiscountPct: discountPercent,
              discountPricesVisible: false,
            })}
          </PartnerBasketTabsShell>
        </div>
      ) : null}

      <PartnerProductDetailDrawer
        open={selectedId != null}
        loading={detailLoading}
        product={selectedProduct}
        tabs={partnerDetailTabs}
        activeTab={detailPanelTab}
        onTabChange={setDetailPanelTab}
        onClose={dismissProductDetailPanel}
        quantity={selectedProduct ? qty(selectedProduct.id) : 1}
        onQuantityChange={(delta) => {
          if (!selectedProduct) return
          changeQty(selectedProduct.id, delta)
        }}
        onAddToCart={() => {
          if (!selectedProduct) return
          addToCart(selectedProduct, qty(selectedProduct.id))
        }}
        onAddToRfq={() => {
          if (!selectedProduct) return
          addToRfq(selectedProduct, qty(selectedProduct.id))
        }}
        discountPercent={discountPercent}
        partnerContractSignedAt={partnerContractSignedAt}
        discountPricesVisible={discountPricesVisible}
        discountConfigured={discountConfigured}
        tr={tr}
        trProducts={trProducts}
        trProduse={trProduse}
        badgeLabels={catalogBadgeLabelsFromProduseTr(trProduse)}
        formatPrice={(amount) => formatPrice(amount, language.code, currency)}
        langCode={language.code}
      />

      {contractSigningModalOpen ? (
        <PartnerContractSigningModal
          onClose={() => setContractSigningModalOpen(false)}
          onSigned={() => {
            reloadPartnerDiscountProfile()
            setContractSigningModalOpen(false)
          }}
        />
      ) : null}

    </div>
  )
}
