import { useEffect, useRef, useState } from 'react'
import {
  getRelatedProducts,
  getProductCardImageUrl,
  getCatalogProductSpecLines,
  formatResidentialCatalogPriceDisplay,
  formatResidentialCatalogNetPriceDisplay,
  getResidentialCatalogStockListingCta,
  residentialCatalogUsesPartnerPriceCta,
  productHasEligibleReducerePrograms,
  type PublicProduct,
} from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'
import { useCatalogCurrency } from '../../contexts/CatalogCurrencyContext'
import { getProduseTranslations } from '../../i18n/produse'
import {
  HorizontalCatalogProductCard,
  ResidentialCatalogProductCard,
  IndustrialCatalogProductCard,
  type HorizontalFeatureBadge,
} from './CatalogProductCard'
import {
  catalogBadgeLabelsFromProduseTr,
  getCatalogStockBadgeLabel,
  getCatalogDeliveryBadgeLabel,
  getCatalogTransportBadgeLabel,
  getCatalogInstallBadgeLabel,
} from '../../lib/catalogProductBadges'
import ResidentialProductCatalogBadges from './ResidentialProductCatalogBadges'

function HorizontalCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[10px] bg-[#f7f7f7] animate-pulse">
      <div className="flex flex-col lg:flex-row lg:items-stretch w-full">
        <div className="relative h-56 w-full flex-shrink-0 overflow-hidden rounded-t-[10px] bg-neutral-200 lg:h-auto lg:w-[38%] lg:min-h-[180px] lg:rounded-l-[10px] lg:rounded-tr-none flex items-center justify-center">
          <img src="/images/shared/baterino-logo-black.svg" alt="" className="w-24 h-12 object-contain opacity-20" aria-hidden />
        </div>
        <div className="flex flex-1 flex-col justify-center px-5 py-5 gap-3">
          <div className="h-5 w-3/4 rounded bg-neutral-200" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-full rounded bg-neutral-200" />
            <div className="h-3.5 w-5/6 rounded bg-neutral-200" />
          </div>
          <div className="flex gap-3">
            <div className="h-3 w-24 rounded bg-neutral-200" />
            <div className="h-3 w-20 rounded bg-neutral-200" />
          </div>
          <div className="space-y-1 mt-1">
            <div className="h-2.5 w-8 rounded bg-neutral-300" />
            <div className="h-7 w-32 rounded bg-neutral-200" />
            <div className="h-2.5 w-24 rounded bg-neutral-300" />
          </div>
        </div>
      </div>
    </div>
  )
}

function VerticalCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[10px] bg-[#f7f7f7] pb-6 animate-pulse">
      <div className="flex h-44 w-full items-center justify-center overflow-hidden rounded-t-[10px] bg-neutral-200">
        <img src="/images/shared/baterino-logo-black.svg" alt="" className="w-24 h-12 object-contain opacity-20" aria-hidden />
      </div>
      <div className="flex flex-col items-center px-4 pt-5 gap-2">
        <div className="h-5 w-3/4 rounded bg-neutral-200" />
        <div className="h-3.5 w-full rounded bg-neutral-200" />
        <div className="h-3.5 w-5/6 rounded bg-neutral-200" />
        <div className="h-3 w-24 rounded bg-neutral-200 mt-1" />
        <div className="h-7 w-28 rounded bg-neutral-200 mt-1" />
        <div className="h-2.5 w-20 rounded bg-neutral-300" />
      </div>
    </div>
  )
}

type Props = {
  product: PublicProduct
  layout?: 'horizontal' | 'vertical'
}

export default function RelatedProducts({ product, layout = 'horizontal' }: Props) {
  const { language } = useLanguage()
  const { currency } = useCatalogCurrency()
  const tr = getProduseTranslations(language.code)
  const [related, setRelated] = useState<PublicProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const activeIndexRef = useRef(activeIndex)
  useEffect(() => { activeIndexRef.current = activeIndex }, [activeIndex])

  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 640px)').matches : true
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const sync = () => { setIsDesktop(mq.matches); setActiveIndex(0) }
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const ITEMS_PER_SLIDE = layout === 'vertical' ? (isDesktop ? 3 : 1) : 1
  const FETCH_LIMIT = layout === 'vertical' ? 6 : 4

  // Touch swipe
  const touchStartXRef = useRef<number | null>(null)
  // Mouse drag
  const isDraggedRef = useRef(false)

  useEffect(() => {
    const key = product.slug || product.id
    setLoading(true)
    getRelatedProducts(key, FETCH_LIMIT)
      .then((list) => { setRelated(list); setActiveIndex(0) })
      .catch(() => setRelated([]))
      .finally(() => setLoading(false))
  }, [product.slug, product.id, FETCH_LIMIT])

  const heading = language.code === 'en' ? 'Similar products' : 'Produse similare'

  if (loading) {
    return (
      <section className="mt-6 lg:mt-8">
        <div className="h-6 w-36 rounded bg-neutral-200 animate-pulse mb-4" />
        {layout === 'vertical' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {(isDesktop ? [0, 1, 2] : [0]).map(i => <VerticalCardSkeleton key={i} />)}
          </div>
        ) : (
          <HorizontalCardSkeleton />
        )}
      </section>
    )
  }

  if (related.length === 0) return null

  const catalogBadgeLabels = catalogBadgeLabelsFromProduseTr(tr)

  // Chunk into slides
  const slides: PublicProduct[][] = []
  for (let i = 0; i < related.length; i += ITEMS_PER_SLIDE) {
    slides.push(related.slice(i, i + ITEMS_PER_SLIDE))
  }
  const total = slides.length

  const goTo = (i: number) => setActiveIndex(Math.max(0, Math.min(i, total - 1)))

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => { touchStartXRef.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartXRef.current
    if (Math.abs(dx) > 40) goTo(activeIndexRef.current + (dx < 0 ? 1 : -1))
    touchStartXRef.current = null
  }

  // Mouse drag — listeners on window so fast moves outside the container still register
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isDraggedRef.current = false
    const startX = e.clientX
    let delta = 0
    const onMove = (ev: MouseEvent) => { delta = ev.clientX - startX }
    const onUp = () => {
      if (Math.abs(delta) > 40) {
        isDraggedRef.current = true
        const next = Math.max(0, Math.min(activeIndexRef.current + (delta < 0 ? 1 : -1), total - 1))
        setActiveIndex(next)
      }
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const onClickCapture = (e: React.MouseEvent) => {
    if (isDraggedRef.current) {
      e.preventDefault()
      e.stopPropagation()
      isDraggedRef.current = false
    }
  }

  const renderVerticalCard = (p: PublicProduct) => {
    const img = getProductCardImageUrl(p)
    const pImgs = Array.isArray(p.images) ? p.images : []
    const fallbackImg = pImgs[0] && pImgs[0] !== img ? pImgs[0] : '/images/shared/HP2000-all-in-one.png'
    const { specLine1, specLine2 } = getCatalogProductSpecLines(p)
    const stockListingCta = getResidentialCatalogStockListingCta(p, {
      outOfStock: tr.catalogStockOutOfStock,
      comingSoon: tr.catalogStockComingSoon,
    })
    const residentialPartnerPriceCta =
      p.tipProdus !== 'industrial' && !stockListingCta && residentialCatalogUsesPartnerPriceCta(p)
        ? tr.catalogDisponibilParteneriPrice
        : null
    const priceDisplay =
      p.tipProdus === 'industrial'
        ? formatResidentialCatalogPriceDisplay(p, language.code, currency) ?? undefined
        : stockListingCta || residentialPartnerPriceCta
          ? undefined
          : formatResidentialCatalogPriceDisplay(p, language.code, currency)
    const industrialHasPrice = p.tipProdus === 'industrial' && priceDisplay != null && priceDisplay !== ''
    const showResPriceExtras =
      priceDisplay != null &&
      priceDisplay !== '' &&
      (residentialPartnerPriceCta == null || String(residentialPartnerPriceCta).trim() === '')
    const to = `/produse/${[p.category?.slug, p.slug || p.id].filter(Boolean).join('/')}`
    const common = {
      density: 'home' as const,
      imageSrc: img,
      fallbackImageSrc: fallbackImg,
      imageAlt: p.title,
      title: p.title,
      specLine1,
      specLine2,
      to,
      linkState: { tipProdus: p.tipProdus },
      imageLoadingPlaceholder: true,
      priceDisplay,
    }
    return p.tipProdus === 'industrial' ? (
      <IndustrialCatalogProductCard
        key={p.id}
        {...common}
        subtitle={String(p.subtitle || '').trim() || undefined}
        ctaLabel={industrialHasPrice ? undefined : tr.disponibilPentruParteneri}
        residentialPriceHeading={industrialHasPrice ? tr.pretLabel : null}
        residentialPriceVatNote={industrialHasPrice ? (() => { const net = formatResidentialCatalogNetPriceDisplay(p, language.code, currency); return net ? tr.catalogPretFaraTva.replace('{price}', net) : null })() : null}
        imageOverlay={<ResidentialProductCatalogBadges product={p} labels={catalogBadgeLabels} layout="stack" include={['stock', 'delivery']} />}
        priceAboveBadge={<ResidentialProductCatalogBadges product={p} labels={catalogBadgeLabels} layout="wrap" className="justify-center gap-1.5" include={['transport', 'install']} appearance="neutral" />}
      />
    ) : (
      <ResidentialCatalogProductCard
        key={p.id}
        {...common}
        residentialPartnerPriceCta={residentialPartnerPriceCta}
        residentialStockListingCta={stockListingCta}
        residentialPriceHeading={showResPriceExtras ? tr.pretLabel : null}
        residentialPriceVatNote={showResPriceExtras ? (() => { const net = formatResidentialCatalogNetPriceDisplay(p, language.code, currency); return net ? tr.catalogPretFaraTva.replace('{price}', net) : null })() : null}
        imageOverlay={<ResidentialProductCatalogBadges product={p} labels={catalogBadgeLabels} layout="stack" include={['stock', 'delivery']} />}
        priceAboveBadge={<ResidentialProductCatalogBadges product={p} labels={catalogBadgeLabels} layout="wrap" className="justify-center gap-1.5" include={['transport', 'reducere']} appearance="neutral" />}
      />
    )
  }

  const renderHorizontalCard = (p: PublicProduct) => {
    const img = getProductCardImageUrl(p)
    const imgs = Array.isArray(p.images) ? p.images : []
    const fallbackImg = imgs[0] && imgs[0] !== img ? imgs[0] : '/images/shared/HP2000-all-in-one.png'
    const { specLine1, specLine2 } = getCatalogProductSpecLines(p)
    const stockListingCta = getResidentialCatalogStockListingCta(p, {
      outOfStock: tr.catalogStockOutOfStock,
      comingSoon: tr.catalogStockComingSoon,
    })
    const residentialPartnerPriceCta =
      p.tipProdus !== 'industrial' && !stockListingCta && residentialCatalogUsesPartnerPriceCta(p)
        ? tr.catalogDisponibilParteneriPrice
        : null
    const priceDisplay =
      p.tipProdus === 'industrial'
        ? formatResidentialCatalogPriceDisplay(p, language.code, currency) ?? undefined
        : stockListingCta || residentialPartnerPriceCta
          ? undefined
          : formatResidentialCatalogPriceDisplay(p, language.code, currency)
    const industrialHasPrice = p.tipProdus === 'industrial' && priceDisplay != null && priceDisplay !== ''
    const showResPriceExtras =
      priceDisplay != null &&
      priceDisplay !== '' &&
      (residentialPartnerPriceCta == null || String(residentialPartnerPriceCta).trim() === '')
    const to = `/produse/${[p.category?.slug, p.slug || p.id].filter(Boolean).join('/')}`
    const featureBadges: HorizontalFeatureBadge[] = []
    const stockLabel = getCatalogStockBadgeLabel(p, { inStock: tr.catalogStockInStock, outOfStock: tr.catalogStockOutOfStock, comingSoon: tr.catalogStockComingSoon, onOrder: tr.catalogStockOnOrder })
    if (stockLabel) featureBadges.push({ type: 'stock', label: stockLabel })
    const deliveryLabel = getCatalogDeliveryBadgeLabel(p, { h24: tr.catalogDelivery24h, h48: tr.catalogDelivery48h, d7_14: tr.catalogDelivery7_14d, d60: catalogBadgeLabels.delivery60d })
    if (deliveryLabel) featureBadges.push({ type: 'delivery', label: `${catalogBadgeLabels.deliveryCategory} ${deliveryLabel}` })
    const transportLabel = getCatalogTransportBadgeLabel(p, { free: catalogBadgeLabels.transportFree, paid: catalogBadgeLabels.transportPaid })
    if (transportLabel) featureBadges.push({ type: 'transport', label: `${catalogBadgeLabels.transportCategory} ${transportLabel}` })
    if (p.tipProdus === 'industrial') {
      const installLabel = getCatalogInstallBadgeLabel(p, { baterino: catalogBadgeLabels.installBaterino, partner: catalogBadgeLabels.installPartner })
      if (installLabel) featureBadges.push({ type: 'install', label: `${catalogBadgeLabels.installCategory} ${installLabel}` })
    } else if (productHasEligibleReducerePrograms(p)) {
      featureBadges.push({ type: 'reduceri', label: catalogBadgeLabels.reduceri })
    }
    return (
      <HorizontalCatalogProductCard
        key={p.id}
        variant={p.tipProdus === 'industrial' ? 'industrial' : 'residential'}
        imageSrc={img}
        fallbackImageSrc={fallbackImg}
        imageAlt={p.title}
        title={p.title}
        subtitle={String(p.subtitle || '').trim() || undefined}
        specLine1={specLine1}
        specLine2={specLine2}
        to={to}
        linkState={{ tipProdus: p.tipProdus }}
        priceDisplay={priceDisplay}
        ctaLabel={p.tipProdus === 'industrial' && !industrialHasPrice ? tr.disponibilPentruParteneri : undefined}
        residentialPartnerPriceCta={residentialPartnerPriceCta}
        residentialStockListingCta={stockListingCta}
        residentialPriceHeading={showResPriceExtras || industrialHasPrice ? tr.pretLabel : null}
        residentialPriceVatNote={
          showResPriceExtras || industrialHasPrice
            ? (() => { const net = formatResidentialCatalogNetPriceDisplay(p, language.code, currency); return net ? tr.catalogPretFaraTva.replace('{price}', net) : null })()
            : null
        }
        featureBadges={featureBadges}
      />
    )
  }

  return (
    <section aria-labelledby="related-products-heading" className="mt-6 lg:mt-8">
      <h2
        id="related-products-heading"
        className="text-black text-lg font-bold font-['Inter'] mb-4"
      >
        {heading}
      </h2>

      {/* Slider */}
      <div
        className="overflow-hidden cursor-grab active:cursor-grabbing"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onClickCapture={onClickCapture}
      >
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((slide, si) => (
            <div key={si} className="w-full flex-none select-none">
              {layout === 'vertical' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {slide.map(renderVerticalCard)}
                </div>
              ) : (
                renderHorizontalCard(slide[0])
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bullets */}
      {total > 1 && (
        <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="Slide navigation">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-200 ${
                i === activeIndex ? 'w-6 bg-slate-900' : 'w-2 bg-neutral-300 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
