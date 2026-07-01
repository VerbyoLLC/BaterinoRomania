import { useEffect, useMemo, useState } from 'react'
import {
  Download,
  Info,
  Minus,
  Plus,
  ShoppingCart,
  X,
} from 'lucide-react'
import type { PublicProduct } from '../../lib/api'
import {
  getCatalogProductSpecLines,
  getPartnerCatalogSaleUnitNumeric,
  getResidentialCatalogStockListingCta,
  residentialProductStockUnavailable,
} from '../../lib/api'
import type { ProductDetailTranslations } from '../../i18n/product-detail'
import type { PartnerProductsTranslations } from '../../i18n/partner/products'
import type { ProduseTranslations } from '../../i18n/produse'
import { buildPartnerProductGlanceItems } from '../../lib/partnerProductGlance'
import { partnerProductHasListPrice } from '../../lib/partnerCart'
import {
  buildResidentialCatalogBadgeItems,
  type CatalogBadgeLabels,
} from '../product/ResidentialProductCatalogBadges'
import { PartnerCatalogPriceDrawerBlock } from '../product/PartnerCatalogPriceDrawerBlock'
import PartnerProductDetailTabPanels from './PartnerProductDetailTabPanels'
import type { PartnerProductDetailTab } from '../ProductDetailRightSection'

type TabDef = { id: PartnerProductDetailTab; label: string }

type Props = {
  open: boolean
  loading: boolean
  product: PublicProduct | null
  tabs: TabDef[]
  activeTab: PartnerProductDetailTab
  onTabChange: (tab: PartnerProductDetailTab) => void
  onClose: () => void
  quantity: number
  onQuantityChange: (delta: number) => void
  onAddToCart: () => void
  onAddToRfq: () => void
  discountPercent: number | null
  partnerContractSignedAt: string | null
  discountPricesVisible: boolean
  discountConfigured: boolean
  tr: ProductDetailTranslations
  trProducts: PartnerProductsTranslations
  trProduse: ProduseTranslations
  badgeLabels: CatalogBadgeLabels
  formatPrice: (amount: number) => string
  langCode: string
}

function DrawerTopBar({
  product,
  badgeLabels,
  onClose,
  closeLabel,
}: {
  product: PublicProduct
  badgeLabels: CatalogBadgeLabels
  onClose: () => void
  closeLabel: string
}) {
  const badges = buildResidentialCatalogBadgeItems(product, badgeLabels)
  const stock = badges.find((b) => b.id === 'stock')
  const delivery = badges.find((b) => b.id === 'delivery')

  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-[#e8eaf0] px-6 py-4">
      {stock ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf7f1] px-[11px] py-[5px] text-xs font-semibold text-[#0e8459]">
          <span className="h-[7px] w-[7px] rounded-full bg-[#159b6a]" aria-hidden />
          {stock.label}
        </span>
      ) : null}
      {delivery ? (
        <span className="text-[13px] text-[#6a7281]">
          {delivery.category ? `${delivery.category} · ` : ''}
          <b className="font-semibold text-[#0f1422]">{delivery.label}</b>
        </span>
      ) : null}
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[9px] border border-[#e8eaf0] bg-white text-[#6b7382] transition hover:bg-[#f4f5f7]"
      >
        <X className="h-[17px] w-[17px]" strokeWidth={1.9} />
      </button>
    </div>
  )
}

function DrawerHeadSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-1 gap-6 p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div>
        <div className="aspect-[4/3.2] rounded-[14px] bg-[#f7f7f7]" />
        <div className="mt-2.5 grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="aspect-square rounded-[9px] bg-[#f7f7f7]" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-7 w-4/5 rounded bg-[#eef2f7]" />
        <div className="h-4 w-3/5 rounded bg-[#eef2f7]" />
        <div className="h-16 rounded bg-[#eef2f7]" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-14 rounded-[10px] bg-[#eef2f7]" />
          ))}
        </div>
        <div className="h-40 rounded-[14px] bg-[#eef2f7]" />
        <div className="h-11 rounded-[11px] bg-[#eef2f7]" />
      </div>
    </div>
  )
}

export function PartnerProductDetailDrawer({
  open,
  loading,
  product,
  tabs,
  activeTab,
  onTabChange,
  onClose,
  quantity,
  onQuantityChange,
  onAddToCart,
  onAddToRfq,
  discountPercent,
  partnerContractSignedAt,
  discountPricesVisible,
  discountConfigured,
  tr,
  trProducts,
  trProduse,
  badgeLabels,
  formatPrice,
  langCode,
}: Props) {
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    setActiveImage(0)
  }, [product?.id])

  const images = useMemo(() => {
    if (!product) return [] as string[]
    const imgs = Array.isArray(product.images) ? product.images.filter(Boolean) : []
    if (imgs.length > 0) return imgs
    if (product.cardImage) return [product.cardImage]
    return ['/images/shared/HP2000-all-in-one.png']
  }, [product])

  const heroImage = images[activeImage] ?? images[0]

  if (!open) return null

  const stockUnavailable = product ? residentialProductStockUnavailable(product) : false
  const hasList = product ? partnerProductHasListPrice(product) : false
  const showPrice = product && !Number.isNaN(getPartnerCatalogSaleUnitNumeric(product)) && !stockUnavailable
  const specLine = product ? getCatalogProductSpecLines(product).specLine1 : ''
  const glanceItems = product
    ? buildPartnerProductGlanceItems(product, {
        energy: tr.specEnergieNominala,
        power: trProducts.detailGlancePower,
        cycles: tr.specCicluriDescarcare,
        warranty: tr.techGarantie,
      })
    : []
  const firstDoc = product?.documenteTehnice?.[0]

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className="fixed inset-0 z-40 bg-[rgba(15,20,34,0.45)] backdrop-blur-[2px] transition-opacity duration-300"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={trProducts.detailDrawerAria}
        className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-[880px] translate-x-0 flex-col overflow-hidden bg-white shadow-[-20px_0_60px_-20px_rgba(0,0,0,0.4)] transition-transform duration-300 ease-in-out"
      >
        {loading || !product ? (
          <>
            <div className="flex shrink-0 items-center justify-end border-b border-[#e8eaf0] px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                aria-label={trProducts.detailDrawerCloseAria}
                className="grid h-9 w-9 place-items-center rounded-[9px] border border-[#e8eaf0] bg-white text-[#6b7382]"
              >
                <X className="h-[17px] w-[17px]" strokeWidth={1.9} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <DrawerHeadSkeleton />
            </div>
          </>
        ) : (
          <>
            <DrawerTopBar
              product={product}
              badgeLabels={badgeLabels}
              onClose={onClose}
              closeLabel={trProducts.detailDrawerCloseAria}
            />

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
                <div>
                  <div className="relative aspect-[4/3.2] overflow-hidden rounded-[14px] border border-[#e8eaf0] bg-[#f7f7f7]">
                    <img
                      src={heroImage}
                      alt={product.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    {specLine && specLine !== '—' ? (
                      <span className="absolute bottom-3 left-3.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#8b93a3]">
                        {specLine}
                      </span>
                    ) : null}
                  </div>
                  {images.length > 1 ? (
                    <div className="mt-2.5 grid grid-cols-4 gap-2">
                      {images.slice(0, 4).map((src, i) => (
                        <button
                          key={`${src}-${i}`}
                          type="button"
                          onClick={() => setActiveImage(i)}
                          className={`relative aspect-square overflow-hidden rounded-[9px] border bg-[#f7f7f7] transition ${
                            activeImage === i
                              ? 'border-[#0f1422] shadow-[0_0_0_2px_rgba(15,20,34,0.12)]'
                              : 'border-[#e8eaf0] hover:border-[#d9dde6]'
                          }`}
                          aria-label={`${product.title} ${i + 1}`}
                        >
                          <img src={src} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div>
                  <h2 className="m-0 mt-0.5 text-[21px] font-bold leading-tight tracking-[-0.02em] text-[#0f1422]">
                    {product.title}
                  </h2>
                  {specLine && specLine !== '—' ? (
                    <div className="mt-1.5 text-[12.5px] font-semibold tracking-[0.01em] text-[#4d6079]">{specLine}</div>
                  ) : null}
                  {product.subtitle ? (
                    <p className="mt-2.5 m-0 text-[13.5px] leading-relaxed text-[#6a7281]">{product.subtitle}</p>
                  ) : null}

                  {glanceItems.length > 0 ? (
                    <div className="mt-[18px] grid grid-cols-2 gap-2">
                      {glanceItems.map((item) => (
                        <div key={item.key} className="rounded-[10px] border border-[#e8eaf0] px-3 py-2.5">
                          <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-[#9aa1af]">
                            {item.key}
                          </div>
                          <div className="mt-0.5 text-[14.5px] font-bold tracking-[-0.01em] text-[#0f1422]">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {showPrice ? (
                    <PartnerCatalogPriceDrawerBlock
                      product={product}
                      partnerDiscountPct={discountPercent}
                      partnerContractSignedAt={partnerContractSignedAt}
                      formatAmount={formatPrice}
                      className="mt-[18px]"
                    />
                  ) : stockUnavailable ? (
                    <p className="mt-[18px] m-0 text-sm font-semibold text-[#6a7281]">
                      {getResidentialCatalogStockListingCta(product, {
                        outOfStock: trProduse.catalogStockOutOfStock,
                        comingSoon: trProduse.catalogStockComingSoon,
                      }) ?? '—'}
                    </p>
                  ) : null}

                  {!stockUnavailable ? (
                    !hasList ? (
                      <div className="mt-4 flex flex-col gap-2">
                        <div className="flex w-full items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                          <button
                            type="button"
                            onClick={() => onQuantityChange(-1)}
                            aria-label="−"
                            className="flex flex-1 items-center justify-center py-2.5 text-slate-600 transition hover:bg-slate-50 active:bg-slate-100"
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
                            className="flex flex-1 items-center justify-center py-2.5 text-slate-600 transition hover:bg-slate-50 active:bg-slate-100"
                          >
                            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={onAddToRfq}
                          className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 active:bg-slate-950 font-['Inter']"
                        >
                          {trProducts.requestQuoteNoListPrice}
                        </button>
                      </div>
                    ) : (
                    <div className="mt-4 flex gap-3">
                      <div className="grid shrink-0 grid-cols-[42px_46px_42px] overflow-hidden rounded-[11px] border border-[#d9dde6]">
                        <button
                          type="button"
                          onClick={() => onQuantityChange(-1)}
                          aria-label="−"
                          className="border-0 bg-white text-lg text-[#4d6079] transition hover:bg-[#f4f5f7]"
                        >
                          <Minus className="mx-auto h-4 w-4" strokeWidth={2.5} />
                        </button>
                        <div className="grid place-items-center border-x border-[#e8eaf0] text-sm font-semibold tabular-nums">
                          {quantity}
                        </div>
                        <button
                          type="button"
                          onClick={() => onQuantityChange(1)}
                          aria-label="+"
                          className="border-0 bg-white text-lg text-[#4d6079] transition hover:bg-[#f4f5f7]"
                        >
                          <Plus className="mx-auto h-4 w-4" strokeWidth={2.5} />
                        </button>
                      </div>

                      {discountPricesVisible ? (
                        <button
                          type="button"
                          onClick={onAddToCart}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 active:bg-slate-950 font-['Inter']"
                        >
                          <ShoppingCart className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                          {trProducts.detailDrawerAddToCart}
                        </button>
                      ) : !discountConfigured ? (
                        <button
                          type="button"
                          onClick={onAddToRfq}
                          className="flex flex-1 items-center justify-center rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 active:bg-slate-950 font-['Inter']"
                        >
                          {trProducts.requestQuote}
                        </button>
                      ) : null}
                    </div>
                    )
                  ) : (
                    <div className="mt-4 rounded-[11px] border border-[#e8eaf0] bg-[#f4f5f7] px-3 py-2.5">
                      <p className="m-0 text-xs font-semibold leading-snug text-[#6a7281]">
                        {trProduse.catalogStockPartnerFooterNote}
                      </p>
                    </div>
                  )}

                  {!stockUnavailable && (!hasList || (!discountPricesVisible && !discountConfigured)) ? (
                    <p className="mt-2.5 flex items-center gap-1.5 text-xs text-[#6a7281]">
                      <Info className="h-3.5 w-3.5 shrink-0 text-[#4d6079]" strokeWidth={1.8} aria-hidden />
                      {trProducts.detailDrawerActNoteRfq}
                    </p>
                  ) : null}

                  {firstDoc ? (
                    <button
                      type="button"
                      onClick={() => {
                        const apiBase = import.meta.env.DEV
                          ? 'http://localhost:3001/api'
                          : `${window.location.origin}/api`
                        const proxyUrl = `${apiBase}/download-proxy?url=${encodeURIComponent(firstDoc.url)}`
                        const a = document.createElement('a')
                        a.href = proxyUrl
                        a.download =
                          ((firstDoc.descriere || tr.document).replace(/[^a-zA-Z0-9-_ăâîșțĂÂÎȘȚ\s]/g, '') || 'document') +
                          '.pdf'
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-[13px] font-semibold text-[#4d6079] transition hover:text-[#0f1422]"
                    >
                      <Download className="h-[15px] w-[15px]" strokeWidth={1.8} aria-hidden />
                      {trProducts.detailDrawerDownloadPdf}
                    </button>
                  ) : null}
                </div>
              </div>

              <div
                className="sticky top-0 z-[2] flex gap-1 overflow-x-auto border-b border-[#e8eaf0] bg-white px-6"
                role="tablist"
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`shrink-0 border-0 border-b-2 bg-transparent px-1.5 py-[15px] text-sm font-semibold transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#0f1422] text-[#0f1422]'
                        : 'border-transparent text-[#6a7281] hover:text-[#0f1422]'
                    } mr-[18px] last:mr-0`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="px-6 pb-10 pt-[22px]">
                <PartnerProductDetailTabPanels
                  product={product}
                  tr={tr}
                  langCode={langCode}
                  activeTab={activeTab}
                />
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
