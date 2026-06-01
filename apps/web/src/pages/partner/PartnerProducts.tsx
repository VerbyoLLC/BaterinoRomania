import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  Search,
  X,
  ShoppingCart,
  Minus,
  Plus,
  ChevronRight,
  Trash2,
  ShoppingBag,
  Bell,
  Home,
  LayoutGrid,
  BriefcaseMedical,
  Factory,
  Anchor,
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
  getPartnerCatalogSaleUnitNumeric,
  getPartnerDisplayUnitPriceWithVat,
  getPartnerCatalogVatPercentForDisplay,
} from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'
import { useCatalogCurrency } from '../../contexts/CatalogCurrencyContext'
import { getProductDetailTranslations } from '../../i18n/product-detail'
import { getProduseTranslations } from '../../i18n/produse'
import ResidentialProductCatalogBadges from '../../components/product/ResidentialProductCatalogBadges'
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
import ProductDetailRightSection from '../../components/ProductDetailRightSection'
import { ReducerePartenerBox } from './PartnerSidebarBoxes'
import {
  hydratePartnerCartFromProducts,
  partnerProductHasListPrice,
  readPartnerCartFromStorage,
  writePartnerCartToStorage,
  type PartnerCartStoredLine,
  type PartnerCartItem,
} from '../../lib/partnerCart'

/* ─────────────────────────────────────────────── types ─── */
type CartItem = PartnerCartItem

/* ─────────────────────────────────────────────── helpers ─── */

function formatPrice(price: number, langCode: string, currency: string): string {
  const locale = langCode === 'en' ? 'en-GB' : langCode === 'zh' ? 'zh-CN' : 'ro-RO'
  return `${price.toLocaleString(locale, { maximumFractionDigits: 0 })} ${currency}`
}

function formatPartnerVatPctLabel(pct: number): string {
  if (Number.isInteger(pct)) return String(pct)
  const rounded = Math.round(pct * 100) / 100
  return String(rounded).replace(/\.?0+$/, '')
}

/** Net (catalog) and VAT portion; UI shows `Total cu TVA` = rounded(net) + rounded(VAT). */
function computePartnerCartTotals(items: CartItem[]): { net: number; vat: number } {
  let net = 0
  let vat = 0
  for (const { product, quantity } of items) {
    const nu = getPartnerCatalogSaleUnitNumeric(product)
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
  langCode,
  currency,
  loading = false,
}: {
  variant: 'sidebar' | 'mobile'
  items: CartItem[]
  onChangeQty: (productId: string, delta: number) => void
  onRemove: (productId: string) => void
  onDismiss?: () => void
  onCheckout?: () => void
  langCode: LangCode
  currency: string
  loading?: boolean
}) {
  const tr = getPartnerProductsTranslations(langCode)
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const hasPricedItems = items.some((i) => !Number.isNaN(getPartnerDisplayUnitPriceWithVat(i.product)))

  const showClose = !!onDismiss

  return (
    <section
      aria-label={tr.cartAria}
      aria-busy={loading}
      className={
        variant === 'sidebar'
          ? 'relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'
          : 'relative flex max-h-[min(58vh,560px)] flex-col overflow-hidden rounded-t-2xl border border-b-0 border-slate-200 bg-white shadow-[0_-12px_40px_rgba(15,23,42,0.12)]'
      }
    >
      {loading ? (
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
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <PartnerCartPanelSkeletonInner />
        ) : items.length === 0 ? (
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
        ) : (
          <ul className="m-0 list-none divide-y divide-slate-100 p-0">
            {items.map(({ product, quantity }) => {
              const img = getProductCardImageUrl(product)
              const price = getPartnerDisplayUnitPriceWithVat(product)
              const linePriceDisplay = !Number.isNaN(price) ? formatPrice(price * quantity, langCode, currency) : null
              const unitPriceDisplay = !Number.isNaN(price) ? formatPrice(price, langCode, currency) : null

              return (
                <li key={product.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f7f7f7] ring-1 ring-slate-200">
                    <img src={img} alt={product.title} className="h-full w-full object-contain p-1.5" loading="lazy" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 line-clamp-2 text-xs font-semibold leading-snug text-slate-900 font-['Inter']">{product.title}</p>
                    {unitPriceDisplay && (
                      <p className="mt-0.5 m-0 text-[11px] text-slate-400 font-['Inter']">
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
                        <span className="flex w-8 items-center justify-center border-x border-slate-200 text-xs font-bold tabular-nums text-slate-900 font-['Inter']">
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
                        <span className="ml-auto shrink-0 text-xs font-bold tabular-nums text-slate-900 font-['Inter']">
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
            const { net, vat } = computePartnerCartTotals(items)
            const lb = partnerCartTotalsLabels(langCode)
            const rn = Math.round(net)
            const rv = Math.round(vat)
            const rg = rn + rv
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 font-['Inter']">{lb.net}</span>
                  <span className="text-xs font-semibold tabular-nums text-slate-800 font-['Inter']">
                    {formatPrice(rn, langCode, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 font-['Inter']">{lb.vat}</span>
                  <span className="text-xs font-semibold tabular-nums text-slate-800 font-['Inter']">
                    {formatPrice(rv, langCode, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2">
                  <span className="text-xs font-semibold text-slate-700 font-['Inter']">{lb.gross}</span>
                  <span className="text-base font-extrabold tabular-nums text-slate-900 font-['Inter']">
                    {formatPrice(rg, langCode, currency)}
                  </span>
                </div>
              </div>
            )
          })()}
          <button
            type="button"
            onClick={() => onCheckout?.()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 active:bg-slate-950 font-['Inter']"
          >
            <ShoppingBag className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            {tr.cartCheckout}
          </button>
          {variant === 'mobile' && onDismiss ? (
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
/* ─────────────────────────────────────────────── ProductCard ─── */
function PartnerProductCard({
  product,
  selected,
  quantity,
  onQuantityChange,
  onAddToCart,
  onViewDetails,
  trProduse,
  currency,
  langCode,
}: {
  product: PublicProduct
  selected: boolean
  quantity: number
  onQuantityChange: (delta: number) => void
  onAddToCart: () => void
  onViewDetails: () => void
  trProduse: ReturnType<typeof getProduseTranslations>
  currency: string
  langCode: string
}) {
  const img = getProductCardImageUrl(product)
  const { specLine1 } = getCatalogProductSpecLines(product)
  const stockUnavailable = residentialProductStockUnavailable(product)
  const stockCta = getResidentialCatalogStockListingCta(product, {
    outOfStock: trProduse.catalogStockOutOfStock,
    comingSoon: trProduse.catalogStockComingSoon,
  })

  const unitWithVat = getPartnerDisplayUnitPriceWithVat(product)
  const priceDisplay = !Number.isNaN(unitWithVat) ? formatPrice(unitWithVat, langCode, currency) : null
  const partnerVatPct = getPartnerCatalogVatPercentForDisplay(product)
  const subtitle = String(product.subtitle || '').trim()

  return (
    <li
      onClick={onViewDetails}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white transition-all duration-200 ${
        selected
          ? 'shadow-[0_16px_56px_-12px_rgba(15,23,42,0.22)]'
          : 'shadow-[0_4px_28px_-6px_rgba(15,23,42,0.1)] hover:shadow-[0_14px_44px_-10px_rgba(15,23,42,0.16)]'
      }`}
    >
      {/* Image */}
        <div className="relative bg-[#f7f7f7]">
        <div className="flex h-56 items-center justify-center p-6">
          <img
            src={img}
            alt={product.title}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
      </div>
        <div className="pointer-events-none absolute left-3 top-3 z-10 max-w-[calc(100%-1.5rem)]">
          <ResidentialProductCatalogBadges
            product={product}
            labels={catalogBadgeLabelsFromProduseTr(trProduse)}
            layout="stack"
            include={['stock', 'delivery']}
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="min-w-0">
          <p className="m-0 line-clamp-2 text-base font-bold leading-snug text-slate-900 font-['Inter']">
            {product.title}
          </p>
          {(subtitle || specLine1) && (
            <p className="mt-1 m-0 line-clamp-1 text-xs text-slate-500 font-['Inter']">
              {subtitle || specLine1}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="mt-auto pt-1">
          <div className="mb-1.5 flex justify-center">
            <ResidentialProductCatalogBadges
              product={product}
              labels={catalogBadgeLabelsFromProduseTr(trProduse)}
              layout="wrap"
              className="justify-center gap-1.5"
              include={['transport', 'reducere']}
              appearance="neutral"
            />
          </div>
          {priceDisplay && !stockUnavailable ? (
            <div>
              <p className="m-0 text-base font-extrabold tabular-nums text-slate-900 font-['Inter']">
                {priceDisplay}
              </p>
              {partnerVatPct != null ? (
                <p className="mt-0.5 m-0 text-[11px] font-medium text-slate-500 font-['Inter']">
                  {trProduse.catalogIncludesVatWithPct.replace('{pct}', formatPartnerVatPctLabel(partnerVatPct))}
                </p>
              ) : null}
            </div>
          ) : stockCta ? (
            <p className="m-0 text-xs font-semibold text-slate-500 font-['Inter']">{stockCta}</p>
          ) : (
            <p className="m-0 text-xs text-slate-400 font-['Inter']">—</p>
          )}
        </div>

        {/* Quantity + Details + Add to basket */}
        {stockUnavailable ? (
          <div className="mt-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-center">
            <p className="m-0 text-xs font-semibold text-slate-500 font-['Inter']">
              {trProduse.catalogStockPartnerFooterNote}
            </p>
          </div>
        ) : !partnerProductHasListPrice(product) ? (
          <div className="mt-1 flex flex-col gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onViewDetails()
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 font-['Inter']"
            >
              <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
              Detalii
            </button>
            <a
              href="/partner/suport"
              onClick={(e) => e.stopPropagation()}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 active:bg-slate-950 font-['Inter']"
            >
              Discută cu noi
            </a>
          </div>
        ) : (
          <div className="mt-1 flex flex-col gap-2">
            {/* Row 1: quantity stepper */}
            <div
              className="flex w-full items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
          <button
            type="button"
            onClick={() => onQuantityChange(-1)}
                aria-label="−"
                className="flex flex-1 items-center justify-center py-2 text-slate-600 transition hover:bg-slate-50 active:bg-slate-100"
          >
                <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
              <span
                className="flex w-12 items-center justify-center border-x border-slate-200 text-sm font-bold tabular-nums text-slate-900 font-['Inter']"
                aria-live="polite"
              >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(1)}
                aria-label="+"
                className="flex flex-1 items-center justify-center py-2 text-slate-600 transition hover:bg-slate-50 active:bg-slate-100"
          >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </div>
            {/* Row 2: details */}
        <button
          type="button"
              onClick={(e) => {
                e.stopPropagation()
                onViewDetails()
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 font-['Inter']"
            >
              <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
              Detalii
            </button>
            {/* Row 3: add to basket */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onAddToCart()
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 active:bg-slate-950 font-['Inter']"
            >
              <ShoppingCart className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              Adaugă în coș
        </button>
      </div>
        )}
      </div>
    </li>
  )
}

/* ─────────────────────────────────────────────── Skeleton ─── */
function PartnerProductCardSkeleton() {
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_28px_-6px_rgba(15,23,42,0.1)] animate-pulse" aria-hidden>
      <div className="h-56 bg-[#f7f7f7]" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-5 w-4/5 rounded-md bg-slate-200" />
        <div className="h-3 w-3/5 rounded-md bg-slate-200" />
        <div className="mt-1 h-5 w-1/3 rounded-md bg-slate-200" />
        <div className="mt-1 h-9 w-full rounded-xl bg-slate-100" />
        <div className="h-9 w-full rounded-xl bg-slate-100" />
        <div className="h-9 w-full rounded-xl bg-slate-200" />
      </div>
    </li>
  )
}

/* ─────────────────────────────────────────────── Detail panel ─── */

function ProductDetailPanel({
  product,
  loading,
  tr,
  langCode,
  activeTab,
}: {
  product: PublicProduct | null
  loading: boolean
  tr: ReturnType<typeof getProductDetailTranslations>
  langCode: string
  activeTab: 'detalii' | 'tehnice' | 'manuale' | 'videos'
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-5 animate-pulse p-6">
        <div className="h-6 w-3/5 rounded bg-slate-200" />
        <div className="h-56 rounded-2xl bg-slate-100" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-4 w-28 rounded bg-slate-200" />
              <div className="h-4 w-20 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 text-center px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <ShoppingCart className="h-7 w-7 text-slate-400" strokeWidth={1.5} />
        </div>
        <p className="text-sm text-slate-500 font-['Inter']">
          Selectează un produs pentru a vedea detaliile.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4">
      <ProductDetailRightSection
        product={product}
        tr={tr}
        langCode={langCode}
        compact
            hideBadges
        partnerTab={activeTab}
      />
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────── Page ─── */
export default function PartnerProducts() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { language } = useLanguage()
  const { currency } = useCatalogCurrency()
  const tr = getProductDetailTranslations(language.code)
  const trProduse = getProduseTranslations(language.code)
  const trProducts = getPartnerProductsTranslations(language.code)

  const partnerDetailTabs = useMemo(
    () => [
      { id: 'detalii' as const, label: trProducts.detailTabDetails },
      { id: 'tehnice' as const, label: tr.techSpecsTab },
      { id: 'manuale' as const, label: trProducts.detailTabManuals },
      { id: 'videos' as const, label: trProducts.detailTabVideos },
    ],
    [tr, trProducts],
  )

  const [products, setProducts] = useState<PublicProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailPanelTab, setDetailPanelTab] = useState<'detalii' | 'tehnice' | 'manuale' | 'videos'>('detalii')
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  /* ── cart ── */
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  /** False until first catalog load + localStorage hydrate completes (avoids saving [] over a persisted cart). */
  const [cartStorageReady, setCartStorageReady] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const prevCartTotalRef = useRef(0)
  const [searchBarExpanded, setSearchBarExpanded] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  /* ── partner discount ── */
  const [discountPercent, setDiscountPercent] = useState<number | null>(null)
  const [discountLoading, setDiscountLoading] = useState(true)

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

  const detailIdFromRoute = searchParams.get('detail')?.trim() ?? ''

  const searchRef = useRef<HTMLInputElement>(null)
  const cartSectionRef = useRef<HTMLDivElement>(null)

  const scrollDesktopCartIntoView = () => {
    requestAnimationFrame(() => {
      cartSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  /* ── partner profile (discount) ── */
  useEffect(() => {
    getPartnerProfile()
      .then((p) => setDiscountPercent(p?.partnerDiscountPercent ?? null))
      .catch(() => setDiscountPercent(null))
      .finally(() => setDiscountLoading(false))
  }, [])

  /* ── data ── */
  useEffect(() => {
    getProducts()
      .then(setProducts)
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

  /* ── Persist partner cart ── */
  useEffect(() => {
    if (!cartStorageReady || typeof window === 'undefined') return
    const minimal: PartnerCartStoredLine[] = cartItems.map(({ product, quantity }) => ({
      productId: product.id,
      quantity,
    }))
    writePartnerCartToStorage(minimal)
  }, [cartItems, cartStorageReady])

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
    const flat = PARTNER_CATALOG_SECTION_ORDER.flatMap((id) => buckets[id])
    return { sectionBuckets: buckets, displayedProductsFlat: flat }
  }, [searchFiltered])

  /* ── deselect if filtered away (never while catalog is loading — avoids clearing ?detail= deep links) ── */
  useEffect(() => {
    if (!selectedId) return
    if (loading) return
    if (!displayedProductsFlat.some((p) => p.id === selectedId)) {
      dismissProductDetailPanel()
    }
  }, [displayedProductsFlat, selectedId, dismissProductDetailPanel, loading])

  /* ── qty helpers ── */
  const qty = (id: string) => quantities[id] ?? 1
  const changeQty = (id: string, delta: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, Math.min(99, (prev[id] ?? 1) + delta)) }))
  }

  /* ── cart helpers ── */
  const addToCart = (product: PublicProduct, quantity: number) => {
    if (!partnerProductHasListPrice(product)) return
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
    if (typeof window === 'undefined' || !window.matchMedia('(min-width: 1280px)').matches) {
      setCartOpen(true)
    }
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

  const cartTotalItems = cartItems.reduce((s, i) => s + i.quantity, 0)

  /* After first line added on desktop, scroll sidebar basket into view */
  useEffect(() => {
    const prev = prevCartTotalRef.current
    prevCartTotalRef.current = cartTotalItems
    if (typeof window === 'undefined' || !window.matchMedia('(min-width: 1280px)').matches) return
    if (prev === 0 && cartTotalItems > 0) {
      requestAnimationFrame(() => scrollDesktopCartIntoView())
    }
  }, [cartTotalItems])

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
    'm-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 shrink-0 border-b border-slate-200 bg-white px-5 py-2.5 shadow-sm sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between xl:gap-4">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 xl:flex-1 xl:min-w-0">
            <h1 className="shrink-0 text-2xl font-bold tracking-tight text-slate-900 font-['Inter'] sm:text-3xl">
              {trProducts.pageTitle}
            </h1>
            <nav
              className="flex min-w-0 flex-wrap items-center gap-1.5 sm:flex-1 sm:flex-nowrap sm:overflow-x-auto sm:pb-0.5 xl:flex-initial xl:overflow-visible xl:pb-0 [scrollbar-width:thin]"
              role="navigation"
              aria-label={trProducts.catalogNavAria}
            >
              {PARTNER_CATALOG_SECTION_ORDER.map((sid) => {
                const count = sectionBuckets[sid].length
                const label = catalogSectionLabels[sid]
              return (
                <button
                    key={sid}
                  type="button"
                  onClick={() => {
                      document.getElementById(`partner-catalog-${sid}`)?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      })
                    }}
                    className="flex h-8 shrink-0 items-center rounded-lg bg-white px-2.5 text-left text-[11px] font-semibold leading-tight text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 sm:text-xs font-['Inter']"
                  >
                    <span className="max-w-[11rem] truncate sm:max-w-none">{label}</span>
                    {count > 0 ? (
                      <span className="ml-1 shrink-0 tabular-nums text-slate-400">({count})</span>
                    ) : null}
                </button>
              )
            })}
            </nav>
          </div>

          <div className="flex min-w-0 w-full xl:w-auto flex-1 flex-wrap items-center justify-end gap-2 sm:gap-3 xl:flex-nowrap xl:justify-end xl:gap-4">
            <div
              className={`flex min-h-9 min-w-0 items-center overflow-hidden transition-[max-width,opacity] duration-200 ease-out ${searchBarExpanded ? 'pointer-events-auto max-w-[min(100vw-10rem,20rem)] flex-1 opacity-100 xl:flex-initial xl:max-w-[20rem]' : 'pointer-events-none max-w-0 flex-[0_0_auto] opacity-0'}`}
              aria-hidden={!searchBarExpanded}
            >
              <div className="relative w-full min-w-[10rem] pr-2 sm:min-w-[12rem]">
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
                className="h-9 shrink-0 rounded-xl px-3 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 hover:text-slate-800 font-['Inter']"
              >
                {trProduse.clearFilters}
              </button>
            ) : null}

            <div className="relative flex shrink-0 items-center gap-2">
              {notificationsOpen ? (
                <button
                  type="button"
                  className="fixed inset-0 z-[19] bg-transparent cursor-default border-0 p-0 m-0"
                  aria-hidden
                  tabIndex={-1}
                  onClick={() => setNotificationsOpen(false)}
                />
              ) : null}
              <button
                type="button"
                aria-label={searchBarExpanded ? trToolbar.closeSearchPanel : trToolbar.openSearchPanel}
                aria-expanded={searchBarExpanded}
                aria-controls="partner-catalog-search-input"
                aria-pressed={searchBarExpanded}
                onClick={() => {
                  setSearchBarExpanded((e) => !e)
                  setNotificationsOpen(false)
                }}
                className={`${PARTNER_TOOLBAR_ICON_BTN} ${searchBarExpanded ? 'ring-2 ring-slate-900/25' : ''}`}
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
              </button>
              <div className="relative shrink-0">
                <button
                  type="button"
                  id="partner-toolbar-notifications"
                  aria-label={trToolbar.notifications}
                  aria-expanded={notificationsOpen}
                  aria-controls="partner-notifications-popover"
                  aria-haspopup="dialog"
                  onClick={() => {
                    setNotificationsOpen((v) => !v)
                    setSearchBarExpanded(false)
                  }}
                  className={PARTNER_TOOLBAR_ICON_BTN}
                >
                  <Bell className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                </button>

                {notificationsOpen ? (
                  <div
                    role="dialog"
                    id="partner-notifications-popover"
                    aria-labelledby="partner-notifications-heading"
                    className="absolute right-0 top-[calc(100%+8px)] z-30 w-[min(calc(100vw-3rem),18rem)] rounded-xl border border-slate-200 bg-white p-4 text-left shadow-lg ring-1 ring-slate-900/5"
                  >
                    <p
                      id="partner-notifications-heading"
                      className="m-0 text-sm font-semibold text-slate-900 font-['Inter'] leading-snug"
                    >
                      {trToolbar.notificationsEmptyTitle}
                    </p>
                    <p className="mt-1.5 m-0 text-xs leading-relaxed text-slate-500 font-['Inter']">
                      {trToolbar.notificationsEmptySubtitle}
                    </p>
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(false)
                  setSearchBarExpanded(false)
                  if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1280px)').matches) {
                    scrollDesktopCartIntoView()
                  } else {
                    setCartOpen(true)
                  }
                }}
                aria-label={trProducts.cartAriaWithCount.replace('{count}', String(cartTotalItems))}
                className={PARTNER_TOOLBAR_ICON_BTN}
              >
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={2} />
                {cartTotalItems > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-white font-['Inter']">
                    {cartTotalItems > 99 ? '99+' : cartTotalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
          </div>

      {/* ── Main area: grid + right sidebar (info + basket) ── */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Product grid — only this column scrolls; scrollbar visually hidden */}
        <div className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
            <div className="flex flex-col gap-12 pb-4">
              {PARTNER_CATALOG_SECTION_ORDER.map((sectionId) => {
                const list = sectionBuckets[sectionId]
                if (list.length === 0) return null
                const SectionIcon = PARTNER_CATALOG_SECTION_ICON[sectionId]
                return (
                  <section
                    key={sectionId}
                    id={`partner-catalog-${sectionId}`}
                    className="scroll-mt-36 sm:scroll-mt-40"
                    aria-labelledby={`partner-catalog-heading-${sectionId}`}
                  >
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-slate-200 pb-3">
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
                          currency={currency}
                          langCode={language.code}
                          onQuantityChange={(delta) => changeQty(product.id, delta)}
                          onAddToCart={() => addToCart(product, qty(product.id))}
                          onViewDetails={() => setSelectedId(product.id)}
                />
              ))}
                    </ul>
                  </section>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Right sidebar: coș, reduceri ── */}
        <aside className="hidden min-h-0 w-[23rem] shrink-0 flex-col border-l border-slate-200 bg-[#f7f7f7] xl:flex xl:flex-col">
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
            <div ref={cartSectionRef} className="flex min-h-0 shrink-0 flex-col">
              <PartnerCartPanel
                variant="sidebar"
                loading={!cartStorageReady}
                items={cartItems}
                onChangeQty={changeCartQty}
                onRemove={removeFromCart}
                onCheckout={() => navigate('/partner/checkout')}
                langCode={language.code}
                currency={currency}
              />
      </div>

            <ReducerePartenerBox discountPercent={discountPercent} loading={discountLoading} />
          </div>
        </aside>
      </div>

      {/* Mobile cart — bottom sheet in-page (no backdrop); xl uses sidebar above */}
      <div
        className={`xl:hidden fixed inset-x-0 bottom-0 z-[45] transition-transform duration-300 ease-out ${
          cartOpen ? 'translate-y-0 pointer-events-auto' : 'translate-y-[calc(100%+8px)] pointer-events-none'
        }`}
      >
        <PartnerCartPanel
          variant="mobile"
          loading={!cartStorageReady}
          items={cartItems}
          onChangeQty={changeCartQty}
          onRemove={removeFromCart}
          onDismiss={() => setCartOpen(false)}
          onCheckout={() => navigate('/partner/checkout')}
          langCode={language.code}
          currency={currency}
        />
      </div>

      {/* ── Detail drawer ── */}
      <div
            aria-hidden
        onClick={() => dismissProductDetailPanel()}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          selectedId != null ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
          />
          <aside
            role="dialog"
            aria-modal="true"
        aria-label="Detalii produs"
        className={`fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-4xl flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          selectedId != null ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="shrink-0 border-b border-slate-200">
          {/* Product hero in drawer header */}
          <div className="flex items-center gap-4 px-4 py-4 sm:px-6">
            {detailLoading ? (
              <div className="flex flex-1 items-center gap-4 animate-pulse">
                <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-1/2 rounded bg-slate-200" />
                </div>
              </div>
            ) : selectedProduct ? (
              (() => {
                const p = selectedProduct
                const stockUnavailable = residentialProductStockUnavailable(p)
                const hasList = partnerProductHasListPrice(p)
                const q = qty(p.id)
                const unit = getPartnerDisplayUnitPriceWithVat(p)
                const showPrice = !Number.isNaN(unit) && !stockUnavailable
                const vpc = showPrice ? getPartnerCatalogVatPercentForDisplay(p) : null

                return (
                  <div className="grid min-w-0 flex-1 grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-5">
                    {/* Col 1 — image + badge + title */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f7f7f7] ring-1 ring-slate-200">
                        <img
                          src={getProductCardImageUrl(p)}
                          alt={p.title}
                          className="h-full w-full object-contain p-1.5"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="mb-1">
                          <ResidentialProductCatalogBadges
                            product={p}
                            labels={catalogBadgeLabelsFromProduseTr(trProduse)}
                            layout="wrap"
                          />
                        </div>
                        <p className="m-0 text-sm font-bold leading-snug text-slate-900 font-['Inter']">{p.title}</p>
                        {p.subtitle ? (
                          <p className="mt-0.5 m-0 line-clamp-2 text-xs text-slate-500 font-['Inter']">{p.subtitle}</p>
                        ) : null}
                      </div>
                    </div>

                    {/* Col 2 — price (centered in column) */}
                    <div className="flex min-h-[3.5rem] flex-col items-center justify-center sm:min-h-0 sm:min-w-[6.75rem] sm:items-end sm:text-right md:min-w-[7.5rem]">
                      {showPrice ? (
                        <>
                          <p className="m-0 text-base font-extrabold tabular-nums text-slate-900 font-['Inter']">
                            {formatPrice(unit, language.code, currency)}
                          </p>
                          {vpc != null ? (
                            <p className="mt-0.5 m-0 text-[11px] font-medium text-slate-500 font-['Inter']">
                              {trProduse.catalogIncludesVatWithPct.replace('{pct}', formatPartnerVatPctLabel(vpc))}
                            </p>
                          ) : null}
                        </>
                      ) : stockUnavailable ? (
                        <p className="m-0 max-w-[11rem] text-center text-xs font-semibold text-slate-500 font-['Inter'] sm:text-right">
                          {getResidentialCatalogStockListingCta(p, {
                            outOfStock: trProduse.catalogStockOutOfStock,
                            comingSoon: trProduse.catalogStockComingSoon,
                          }) ?? '—'}
                        </p>
                      ) : !hasList ? (
                        <p className="m-0 text-xs font-medium text-slate-400 font-['Inter']">—</p>
                      ) : (
                        <p className="m-0 text-xs text-slate-400 font-['Inter']">—</p>
                      )}
                    </div>

                    {/* Col 3 — quantity + add to cart / alternates */}
                    <div className="flex min-h-[3.5rem] flex-col items-center justify-center sm:min-h-0 sm:min-w-[11rem] sm:max-w-[13rem]">
                      {stockUnavailable ? (
                        <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-center">
                          <p className="m-0 text-[11px] font-semibold leading-snug text-slate-500 font-['Inter']">
                            {trProduse.catalogStockPartnerFooterNote}
                          </p>
                        </div>
                      ) : !hasList ? (
                        <a
                          href="/partner/suport"
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 active:bg-slate-950 font-['Inter']"
                        >
                          Discută cu noi
                        </a>
                      ) : (
                        <div
                          className="flex w-full flex-col gap-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex w-full items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <button
                  type="button"
                              onClick={() => changeQty(p.id, -1)}
                              aria-label="−"
                              className="flex flex-1 items-center justify-center py-2 text-slate-600 transition hover:bg-slate-50 active:bg-slate-100"
                            >
                              <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                            </button>
                            <span
                              className="flex w-12 items-center justify-center border-x border-slate-200 text-sm font-bold tabular-nums text-slate-900 font-['Inter']"
                              aria-live="polite"
                            >
                              {q}
                            </span>
                            <button
                              type="button"
                              onClick={() => changeQty(p.id, 1)}
                              aria-label="+"
                              className="flex flex-1 items-center justify-center py-2 text-slate-600 transition hover:bg-slate-50 active:bg-slate-100"
                            >
                              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => addToCart(p, q)}
                            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 active:bg-slate-950 font-['Inter']"
                          >
                            <ShoppingCart className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                            Adaugă în coș
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()
            ) : (
              <p className="flex-1 text-sm font-semibold text-slate-900 font-['Inter']">Detalii produs</p>
            )}
            <button
              type="button"
              onClick={() => dismissProductDetailPanel()}
                  aria-label="Închide"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
              <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
          <div className="flex gap-0 overflow-x-auto px-4 sm:px-6" role="tablist">
            {partnerDetailTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={detailPanelTab === tab.id}
                    onClick={() => setDetailPanelTab(tab.id)}
                className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors font-['Inter'] -mb-px ${
                      detailPanelTab === tab.id
                        ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
                <ProductDetailPanel
                  product={selectedProduct}
                  loading={detailLoading}
                  tr={tr}
                  langCode={language.code}
                  activeTab={detailPanelTab}
                />
            </div>
          </aside>

    </div>
  )
}
