import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ShoppingCart, Minus, Plus, ChevronRight, Trash2, ShoppingBag, Loader2 } from 'lucide-react'
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
import ProductDetailRightSection from '../../components/ProductDetailRightSection'
import { ReducerePartenerBox, SigurantaClientuluiBox, SuportTehnicBox } from './PartnerSidebarBoxes'
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
function whToKwhDisplay(wh: string | null | undefined): string | null {
  if (!wh) return null
  const numStr = String(wh).replace(/\s*Wh$/i, '').replace(',', '.').replace(/\s/g, '')
  const num = parseFloat(numStr)
  if (Number.isNaN(num)) return wh
  const kwh = num / 1000
  return `${kwh % 1 === 0 ? kwh.toFixed(0) : kwh.toFixed(2)} kWh`
}

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

function partnerCartTotalsLabels(langCode: string) {
  if (langCode === 'en') {
    return { net: 'Subtotal (excl. VAT)', vat: 'VAT', gross: 'Total (incl. VAT)' }
  }
  if (langCode === 'zh') {
    return { net: '小计（不含增值税）', vat: '增值税', gross: '含税合计' }
  }
  return { net: 'Total fără TVA', vat: 'TVA', gross: 'Total cu TVA' }
}

function partnerCartLoadingLabel(langCode: string): string {
  if (langCode === 'en') return 'Loading cart…'
  if (langCode === 'zh') return '正在加载购物车…'
  return 'Se încarcă coșul…'
}

/** Vertical catalog sections on partner Produse (one bucket per product). */
type PartnerCatalogSectionId = 'rezidential' | 'micro_grid' | 'comercial_medical' | 'industrial' | 'maritim'

const PARTNER_CATALOG_SECTION_ORDER: PartnerCatalogSectionId[] = [
  'rezidential',
  'micro_grid',
  'comercial_medical',
  'industrial',
  'maritim',
]

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

function partnerProductMatchesVoltageFilter(p: PublicProduct, voltageFilter: 'low' | 'high' | ''): boolean {
  if (!voltageFilter) return true
  const v = parseFloat(String(p.tensiuneNominala || '').replace(',', '.'))
  if (Number.isNaN(v)) return false
  if (voltageFilter === 'low' && v >= 100) return false
  if (voltageFilter === 'high' && v < 100) return false
  return true
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

function partnerCatalogSectionLabels(langCode: string): Record<PartnerCatalogSectionId, string> {
  if (langCode === 'en') {
    return {
      rezidential: 'Residential',
      micro_grid: 'Commercial · Micro-grids',
      comercial_medical: 'Commercial & Medical',
      industrial: 'Industrial',
      maritim: 'Marine',
    }
  }
  if (langCode === 'zh') {
    return {
      rezidential: '住宅',
      micro_grid: '商用 · 微电网',
      comercial_medical: '商用与医疗',
      industrial: '工业',
      maritim: '海事',
    }
  }
  return {
    rezidential: 'Rezidențial',
    micro_grid: 'Comercial · Micro-griduri',
    comercial_medical: 'Comercial & Medical',
    industrial: 'Industrial',
    maritim: 'Maritim',
  }
}

/* ─────────────────────────────────────────────── StockBadge ─── */
function StockBadge({
  product,
  inStockLabel,
  outOfStockLabel,
  comingSoonLabel,
}: {
  product: PublicProduct
  inStockLabel: string
  outOfStockLabel: string
  comingSoonLabel: string
}) {
  const status = product.catalogStockStatus
  if (status === 'out_of_stock') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700 font-['Inter']">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden />
        {outOfStockLabel}
      </span>
    )
  }
  if (status === 'coming_soon') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 font-['Inter']">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden />
        {comingSoonLabel}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 font-['Inter']">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
      {inStockLabel}
    </span>
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
  langCode: string
  currency: string
  loading?: boolean
}) {
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const hasPricedItems = items.some((i) => !Number.isNaN(getPartnerDisplayUnitPriceWithVat(i.product)))

  const showClose = !!onDismiss

  return (
    <section
      aria-label="Coș de cumpărături"
      aria-busy={loading}
      className={
        variant === 'sidebar'
          ? 'relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'
          : 'relative flex max-h-[min(58vh,560px)] flex-col overflow-hidden rounded-t-2xl border border-b-0 border-slate-200 bg-white shadow-[0_-12px_40px_rgba(15,23,42,0.12)]'
      }
    >
      {loading ? (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-white/80 backdrop-blur-[2px] motion-reduce:backdrop-blur-none"
          role="status"
        >
          <Loader2 className="h-8 w-8 animate-spin text-slate-600 motion-reduce:animate-none" strokeWidth={2} aria-hidden />
          <span className="sr-only">{partnerCartLoadingLabel(langCode)}</span>
        </div>
      ) : null}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <ShoppingBag className="h-5 w-5 shrink-0 text-slate-700" strokeWidth={2} aria-hidden />
          <h2 className="m-0 truncate text-sm font-bold text-slate-900 font-['Inter']">Coș de cumpărături</h2>
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
            aria-label="Închide coșul"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className={`flex flex-col items-center justify-center gap-3 px-4 text-center ${variant === 'sidebar' ? 'py-8' : 'py-10'}`}>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <ShoppingBag className="h-6 w-6 text-slate-400" strokeWidth={1.5} />
            </div>
            <p className="m-0 text-sm font-medium text-slate-500 font-['Inter']">Coșul este gol.</p>
            {(variant === 'mobile' || variant === 'sidebar') && onDismiss ? (
              <button
                type="button"
                onClick={onDismiss}
                className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 font-['Inter']"
              >
                Continuă cumpărăturile
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
                      <p className="mt-0.5 m-0 text-[11px] text-slate-400 font-['Inter']">{unitPriceDisplay} / buc.</p>
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
                        aria-label="Șterge din coș"
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

      {items.length > 0 && (
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
            Plasează comanda
          </button>
          {variant === 'mobile' && onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="w-full rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 font-['Inter']"
            >
              Continuă cumpărăturile
            </button>
          ) : null}
        </div>
      )}
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
        <div className="absolute left-3 top-3">
          <StockBadge
            product={product}
            inStockLabel={trProduse.catalogStockInStock}
            outOfStockLabel={trProduse.catalogStockOutOfStock}
            comingSoonLabel={trProduse.catalogStockComingSoon}
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
const PARTNER_DETAIL_TABS = [
  { id: 'detalii' as const, label: 'Detalii' },
  { id: 'tehnice' as const, label: 'Tehnice' },
  { id: 'manuale' as const, label: 'Manuale' },
  { id: 'videos' as const, label: 'Video' },
]

function ProductDetailPanel({
  product,
  loading,
  tr,
  trProduse,
  langCode,
  currency,
  quantity,
  onQuantityChange,
  onAddToCart,
  activeTab,
}: {
  product: PublicProduct | null
  loading: boolean
  tr: ReturnType<typeof getProductDetailTranslations>
  trProduse: ReturnType<typeof getProduseTranslations>
  langCode: string
  currency: string
  quantity: number
  onQuantityChange: (delta: number) => void
  onAddToCart: () => void
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

  const stockUnavailable = residentialProductStockUnavailable(product)

  const energieDisplay = whToKwhDisplay(product.energieNominala)
  const p = product as PublicProduct & {
    capacitate?: string; cicluriDescarcare?: string
    dimensiuni?: string; greutate?: string; temperaturaFunctionare?: string
  }
  const specRows: [string, string][] = []
  if (energieDisplay) specRows.push([tr.specEnergieNominala, energieDisplay])
  if (p.capacitate) specRows.push([tr.specCapacitate, p.capacitate])
  if (p.cicluriDescarcare) specRows.push([tr.specCicluriDescarcare, p.cicluriDescarcare])
  if (p.dimensiuni) specRows.push([tr.specDimensiuni, p.dimensiuni])
  if (p.greutate) specRows.push([tr.specGreutate, p.greutate])
  if (p.temperaturaFunctionare) specRows.push([tr.specTemperaturaOperare, p.temperaturaFunctionare])

  return (
    <div className="flex flex-col gap-0">
      {!stockUnavailable && partnerProductHasListPrice(product) ? (
        <div className="border-b border-slate-100 px-6 py-3">
          <p className="m-0 text-lg font-extrabold tabular-nums text-slate-900 font-['Inter']">
            {formatPrice(getPartnerDisplayUnitPriceWithVat(product), langCode, currency)}
          </p>
          {(() => {
            const vpc = getPartnerCatalogVatPercentForDisplay(product)
            return vpc != null ? (
              <p className="mt-0.5 m-0 text-xs font-medium text-slate-500 font-['Inter']">
                {trProduse.catalogIncludesVatWithPct.replace('{pct}', formatPartnerVatPctLabel(vpc))}
              </p>
            ) : null
          })()}
        </div>
      ) : null}

      {/* Qty + Add to basket */}
      {!stockUnavailable ? (
        partnerProductHasListPrice(product) ? (
          <div className="flex items-stretch gap-3 border-b border-slate-100 px-6 py-4">
            <div className="flex items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => onQuantityChange(-1)}
                aria-label="−"
                className="flex w-10 items-center justify-center text-slate-600 transition hover:bg-slate-50"
              >
                <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
              <span
                className="flex w-10 items-center justify-center border-x border-slate-200 text-sm font-bold tabular-nums text-slate-900 font-['Inter']"
                aria-live="polite"
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onQuantityChange(1)}
                aria-label="+"
                className="flex w-10 items-center justify-center text-slate-600 transition hover:bg-slate-50"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>
            <button
              type="button"
              onClick={onAddToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 font-['Inter']"
            >
              <ShoppingCart className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              Adaugă în coș
            </button>
          </div>
        ) : (
          <div className="border-b border-slate-100 px-6 py-4">
            <a
              href="/partner/suport"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 font-['Inter']"
            >
              Discută cu noi
            </a>
          </div>
        )
      ) : (
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-center">
            <p className="m-0 text-sm font-semibold text-slate-600 font-['Inter']">
              {trProduse.catalogStockPartnerFooterNote}
            </p>
          </div>
        </div>
      )}

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'detalii' && specRows.length > 0 && (
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="mb-3 m-0 text-xs font-bold uppercase tracking-wide text-slate-500 font-['Inter']">
              {tr.detaliiTehnice}
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {specRows.map(([label, value], i) => (
                <div key={i} className="min-w-0">
                  <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400 font-['Inter']">
                    {label}
                  </p>
                  <p className="m-0 text-sm font-medium text-slate-900 font-['Inter']">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="px-6 py-4">
          <ProductDetailRightSection
            product={product}
            tr={tr}
            langCode={langCode}
            compact
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
  const { language } = useLanguage()
  const { currency } = useCatalogCurrency()
  const tr = getProductDetailTranslations(language.code)
  const trProduse = getProduseTranslations(language.code)

  const [products, setProducts] = useState<PublicProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [voltageFilter, setVoltageFilter] = useState<'low' | 'high' | ''>('')
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
  /** Desktop (xl+): empty basket hidden until bag icon opens peek panel */
  const [desktopCartPeek, setDesktopCartPeek] = useState(false)
  const prevCartTotalRef = useRef(0)

  /* ── partner discount ── */
  const [discountPercent, setDiscountPercent] = useState<number | null>(null)
  const [discountLoading, setDiscountLoading] = useState(true)

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
      if (sec === 'rezidential' && !partnerProductMatchesVoltageFilter(p, voltageFilter)) continue
      buckets[sec].push(p)
    }
    const flat = PARTNER_CATALOG_SECTION_ORDER.flatMap((id) => buckets[id])
    return { sectionBuckets: buckets, displayedProductsFlat: flat }
  }, [searchFiltered, voltageFilter])

  /* ── deselect if filtered away ── */
  useEffect(() => {
    if (selectedId && !displayedProductsFlat.some((p) => p.id === selectedId)) {
      setSelectedId(null)
    }
  }, [displayedProductsFlat, selectedId])

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
    setSelectedId(null)
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
  const showSidebarCart = cartTotalItems > 0 || desktopCartPeek

  /* Any cart total change clears peek (empty peek survives until lines are added/removed) */
  useEffect(() => {
    setDesktopCartPeek(false)
  }, [cartTotalItems])

  /* After first line added on desktop, scroll sidebar basket into view */
  useEffect(() => {
    const prev = prevCartTotalRef.current
    prevCartTotalRef.current = cartTotalItems
    if (typeof window === 'undefined' || !window.matchMedia('(min-width: 1280px)').matches) return
    if (prev === 0 && cartTotalItems > 0) {
      requestAnimationFrame(() => scrollDesktopCartIntoView())
    }
  }, [cartTotalItems])

  /* Empty desktop peek: scroll sidebar once panel mounts */
  useEffect(() => {
    if (!desktopCartPeek || cartTotalItems !== 0) return
    if (typeof window === 'undefined' || !window.matchMedia('(min-width: 1280px)').matches) return
    requestAnimationFrame(() => scrollDesktopCartIntoView())
  }, [desktopCartPeek, cartTotalItems])

  const catalogSectionLabels = useMemo(
    () => partnerCatalogSectionLabels(language.code),
    [language.code],
  )

  const productGridClass =
    'm-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 shrink-0 border-b border-slate-200 bg-white px-5 py-2.5 shadow-sm sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between xl:gap-4">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 xl:flex-1 xl:min-w-0">
            <h1 className="shrink-0 text-xl font-bold text-slate-900 font-['Inter']">Produse</h1>
            <nav
              className="flex min-w-0 flex-wrap items-center gap-1.5 sm:flex-1 sm:flex-nowrap sm:overflow-x-auto sm:pb-0.5 xl:flex-initial xl:overflow-visible xl:pb-0 [scrollbar-width:thin]"
              role="navigation"
              aria-label="Secțiuni catalog"
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

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 xl:shrink-0">
            <div className="relative min-w-0 flex-1 basis-[min(100%,14rem)] sm:max-w-xs sm:flex-none">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                strokeWidth={2}
                aria-hidden
              />
              <input
                ref={searchRef}
                type="search"
                placeholder="Caută produs…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/80 font-['Inter']"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Șterge căutarea"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

            <label className="flex shrink-0 items-center gap-2 text-[11px] font-semibold text-slate-500 font-['Inter'] sm:text-xs">
              <span className="whitespace-nowrap">{trProduse.filterVolti}</span>
              <select
                value={voltageFilter}
                onChange={(e) => setVoltageFilter((e.target.value || '') as 'low' | 'high' | '')}
                className="h-9 rounded-xl border border-slate-200 bg-white pl-2.5 pr-8 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300/80 font-['Inter'] appearance-none"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%23666' d='M5 7L1 3h8z'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                  backgroundSize: '10px',
                }}
                aria-label={`${catalogSectionLabels.rezidential} · ${trProduse.filterVolti}`}
              >
                <option value="">{trProduse.productsVoltageAll}</option>
                <option value="low">{trProduse.productsVoltageLow}</option>
                <option value="high">{trProduse.productsVoltageHigh}</option>
              </select>
            </label>

            {(voltageFilter || search) && (
              <button
                type="button"
                onClick={() => {
                  setVoltageFilter('')
                  setSearch('')
                }}
                className="h-9 shrink-0 rounded-xl px-3 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 hover:text-slate-800 font-['Inter']"
              >
                {trProduse.clearFilters}
              </button>
            )}

            {!loading && (
              <p className="hidden shrink-0 text-xs text-slate-400 font-['Inter'] sm:block">
                {displayedProductsFlat.length} produse
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1280px)').matches) {
                  if (cartTotalItems === 0) {
                    setDesktopCartPeek(true)
                  } else {
                    scrollDesktopCartIntoView()
                  }
                } else {
                  setCartOpen(true)
                }
              }}
              aria-label={`Coș (${cartTotalItems} produse)`}
              className="relative ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 xl:ml-0"
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
              {(voltageFilter || search) && (
                <button
                  type="button"
                  onClick={() => {
                    setVoltageFilter('')
                    setSearch('')
                  }}
                  className="text-xs font-semibold text-slate-900 underline underline-offset-2"
                >
                  {trProduse.clearFilters}
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-12 pb-4">
              {PARTNER_CATALOG_SECTION_ORDER.map((sectionId) => {
                const list = sectionBuckets[sectionId]
                if (list.length === 0) return null
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
                        className="m-0 text-lg font-bold tracking-tight text-slate-900 font-['Inter']"
                      >
                        {catalogSectionLabels[sectionId]}
                      </h2>
                      <span className="text-xs font-medium tabular-nums text-slate-400 font-['Inter']">
                        {language.code === 'en'
                          ? `${list.length} ${list.length === 1 ? 'product' : 'products'}`
                          : language.code === 'zh'
                            ? `${list.length} 款产品`
                            : `${list.length} ${list.length === 1 ? 'produs' : 'produse'}`}
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

        {/* ── Right sidebar: coș, reduceri (fix), siguranță & suport (collapsible) ── */}
        <aside className="hidden min-h-0 w-[26rem] shrink-0 flex-col border-l border-slate-200 bg-[#f7f7f7] xl:flex xl:flex-col">
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
            <div
              className={`grid min-h-0 shrink-0 transition-[grid-template-rows,margin-bottom] duration-300 ease-in-out motion-reduce:transition-none ${
                showSidebarCart ? 'grid-rows-[1fr] mb-0' : 'grid-rows-[0fr] -mb-3'
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div
                  ref={cartSectionRef}
                  className={`flex shrink-0 flex-col motion-reduce:transition-none ${
                    showSidebarCart ? 'opacity-100' : 'pointer-events-none opacity-0'
                  } transition-opacity duration-200 ease-out`}
                  aria-hidden={!showSidebarCart}
                >
                  <PartnerCartPanel
                    variant="sidebar"
                    loading={!cartStorageReady}
                    items={cartItems}
                    onChangeQty={changeCartQty}
                    onRemove={removeFromCart}
                    onDismiss={cartTotalItems === 0 ? () => setDesktopCartPeek(false) : undefined}
                    onCheckout={() => navigate('/partner/checkout')}
                    langCode={language.code}
                    currency={currency}
                  />
                </div>
              </div>
            </div>

            <ReducerePartenerBox discountPercent={discountPercent} loading={discountLoading} />
            <SigurantaClientuluiBox collapsible cartHasItems={cartTotalItems > 0} stackPosition="upper" />
            <SuportTehnicBox collapsible cartHasItems={cartTotalItems > 0} stackPosition="lower" />
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
        onClick={() => setSelectedId(null)}
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
          <div className="flex items-start gap-4 px-4 py-4 sm:px-6">
            {detailLoading ? (
              <div className="flex flex-1 items-center gap-4 animate-pulse">
                <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-1/2 rounded bg-slate-200" />
                </div>
              </div>
            ) : selectedProduct ? (
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f7f7f7] ring-1 ring-slate-200">
                  <img
                    src={getProductCardImageUrl(selectedProduct)}
                    alt={selectedProduct.title}
                    className="h-full w-full object-contain p-1.5"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="mb-1">
                    <StockBadge
                      product={selectedProduct}
                      inStockLabel={trProduse.catalogStockInStock}
                      outOfStockLabel={trProduse.catalogStockOutOfStock}
                      comingSoonLabel={trProduse.catalogStockComingSoon}
                    />
                  </div>
                  <p className="m-0 text-sm font-bold leading-snug text-slate-900 font-['Inter']">
                    {selectedProduct.title}
                  </p>
                  {selectedProduct.subtitle ? (
                    <p className="mt-0.5 m-0 text-xs text-slate-500 font-['Inter']">{selectedProduct.subtitle}</p>
                  ) : null}
                  {(() => {
                    const unit = getPartnerDisplayUnitPriceWithVat(selectedProduct)
                    const stockUnavail = residentialProductStockUnavailable(selectedProduct)
                    if (!Number.isNaN(unit) && !stockUnavail) {
                      const vpc = getPartnerCatalogVatPercentForDisplay(selectedProduct)
                      return (
                        <div className="mt-1">
                          <p className="m-0 text-base font-extrabold tabular-nums text-slate-900 font-['Inter']">
                            {formatPrice(unit, language.code, currency)}
                          </p>
                          {vpc != null ? (
                            <p className="mt-0.5 m-0 text-[11px] font-medium text-slate-500 font-['Inter']">
                              {trProduse.catalogIncludesVatWithPct.replace('{pct}', formatPartnerVatPctLabel(vpc))}
                            </p>
                          ) : null}
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              </div>
            ) : (
              <p className="flex-1 text-sm font-semibold text-slate-900 font-['Inter']">Detalii produs</p>
            )}
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label="Închide"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
          <div className="flex gap-0 overflow-x-auto px-4 sm:px-6" role="tablist">
            {PARTNER_DETAIL_TABS.map((tab) => (
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
            trProduse={trProduse}
            langCode={language.code}
            currency={currency}
            quantity={selectedId ? qty(selectedId) : 1}
            onQuantityChange={(delta) => selectedId && changeQty(selectedId, delta)}
            onAddToCart={() =>
              selectedProduct &&
              partnerProductHasListPrice(selectedProduct) &&
              addToCart(selectedProduct, selectedId ? qty(selectedId) : 1)
            }
            activeTab={detailPanelTab}
          />
        </div>
      </aside>

    </div>
  )
}
