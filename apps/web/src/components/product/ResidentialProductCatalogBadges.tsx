import type { PublicProduct } from '../../lib/api'
import {
  getCatalogDeliveryBadgeLabel,
  getCatalogInstallBadgeLabel,
  getCatalogStockBadgeLabel,
  getCatalogTransportBadgeLabel,
  productHasEligibleReducerePrograms,
  catalogProductSupportsBadges,
  type CatalogBadgeLabels,
} from '../../lib/catalogProductBadges'

export type { CatalogBadgeLabels } from '../../lib/catalogProductBadges'

type BadgeVariant =
  | 'stock-in'
  | 'stock-out'
  | 'stock-soon'
  | 'stock-on-order'
  | 'delivery'
  | 'transport'
  | 'install'
  | 'reducere'

type BadgeItem = {
  id: 'stock' | 'delivery' | 'transport' | 'install' | 'reducere'
  category?: string
  label: string
  variant: BadgeVariant
}

export type CatalogBadgeId = BadgeItem['id']

export function buildResidentialCatalogBadgeItems(
  product: PublicProduct,
  labels: CatalogBadgeLabels,
): BadgeItem[] {
  if (!catalogProductSupportsBadges(product.tipProdus)) return []

  const items: BadgeItem[] = []

  const stockLabel = getCatalogStockBadgeLabel(product, {
    inStock: labels.stockIn,
    outOfStock: labels.stockOut,
    comingSoon: labels.stockSoon,
    onOrder: labels.stockOnOrder,
  })
  if (stockLabel) {
    const status = product.catalogStockStatus ?? 'in_stock'
    items.push({
      id: 'stock',
      label: stockLabel,
      variant:
        status === 'out_of_stock'
          ? 'stock-out'
          : status === 'coming_soon'
            ? 'stock-soon'
            : status === 'on_order'
              ? 'stock-on-order'
              : 'stock-in',
    })
  }

  const deliveryLabel = getCatalogDeliveryBadgeLabel(product, {
    h24: labels.delivery24h,
    h48: labels.delivery48h,
    d7_14: labels.delivery7_14d,
    d60: labels.delivery60d,
  })
  if (deliveryLabel) {
    items.push({
      id: 'delivery',
      category: labels.deliveryCategory,
      label: deliveryLabel,
      variant: 'delivery',
    })
  }

  const transportLabel = getCatalogTransportBadgeLabel(product, {
    free: labels.transportFree,
    paid: labels.transportPaid,
  })
  if (transportLabel) {
    items.push({
      id: 'transport',
      category: labels.transportCategory,
      label: transportLabel,
      variant: 'transport',
    })
  }

  const installLabel = getCatalogInstallBadgeLabel(product, {
    baterino: labels.installBaterino,
    partner: labels.installPartner,
  })
  if (installLabel) {
    items.push({
      id: 'install',
      category: labels.installCategory,
      label: installLabel,
      variant: 'install',
    })
  }

  if (productHasEligibleReducerePrograms(product)) {
    items.push({ id: 'reducere', label: labels.reduceri, variant: 'reducere' })
  }

  return items
}

const variantClass: Record<BadgeVariant, string> = {
  'stock-in': 'bg-emerald-100 text-emerald-700 [&_.dot]:bg-emerald-500',
  'stock-out': 'bg-red-100 text-red-700 [&_.dot]:bg-red-500',
  'stock-soon': 'bg-amber-100 text-amber-700 [&_.dot]:bg-amber-400',
  'stock-on-order': 'bg-sky-100 text-sky-800 [&_.dot]:bg-sky-500',
  delivery: 'bg-slate-100 text-slate-700',
  transport: 'bg-teal-100 text-teal-800',
  install: 'bg-indigo-100 text-indigo-800',
  reducere: 'bg-violet-100 text-violet-800',
}

const neutralVariantClass: Record<'transport' | 'install' | 'reducere', string> = {
  transport: 'bg-white text-black [&_.dot]:bg-neutral-500',
  install: 'bg-white text-black',
  reducere: 'bg-white text-black',
}

function CatalogBadgePill({
  category,
  label,
  variant,
  appearance = 'default',
}: {
  category?: string
  label: string
  variant: BadgeVariant
  appearance?: 'default' | 'neutral'
}) {
  const showDot = variant.startsWith('stock-')
  const useNeutral =
    appearance === 'neutral' && (variant === 'transport' || variant === 'install' || variant === 'reducere')
  const pillClass = useNeutral ? neutralVariantClass[variant] : variantClass[variant]
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold font-['Inter'] sm:text-[13px] ${pillClass}`}
    >
      {showDot ? <span className="dot h-2 w-2 shrink-0 rounded-full" aria-hidden /> : null}
      {category ? (
        <>
          <span className={useNeutral ? 'font-bold text-black' : 'font-medium opacity-75'}>
            {category}
          </span>
          <span className={useNeutral ? 'font-bold text-black' : 'opacity-40'} aria-hidden>
            ·
          </span>
        </>
      ) : null}
      {label}
    </span>
  )
}

type Props = {
  product: PublicProduct
  labels: CatalogBadgeLabels
  className?: string
  layout?: 'stack' | 'wrap'
  /** When set, only render these badge types (e.g. stock+delivery on image, transport above price). */
  include?: CatalogBadgeId[]
  /** White pills with black text — used for transport/reduceri above price on catalog cards. */
  appearance?: 'default' | 'neutral'
}

/** Stoc / Livrare / Transport / Reduceri pills for residential catalog cards and product detail. */
export default function ResidentialProductCatalogBadges({
  product,
  labels,
  className = '',
  layout = 'stack',
  include,
  appearance = 'default',
}: Props) {
  const items = buildResidentialCatalogBadgeItems(product, labels).filter(
    (item) => !include || include.includes(item.id),
  )
  if (items.length === 0) return null

  return (
    <div
      className={
        layout === 'stack'
          ? `flex flex-col items-start gap-1.5 ${className}`.trim()
          : `flex flex-wrap items-center gap-2 ${className}`.trim()
      }
    >
      {items.map((item) => (
        <CatalogBadgePill
          key={item.id}
          category={item.category}
          label={item.label}
          variant={item.variant}
          appearance={appearance}
        />
      ))}
    </div>
  )
}
