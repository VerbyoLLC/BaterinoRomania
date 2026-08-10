'use client'

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
import {
  CatalogProductFeatureBadge,
  CatalogProductImageChip,
  CatalogProductPromoChip,
  type CatalogProductFeatureBadgeData,
} from './CatalogProductTagBadges'

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

function badgeItemToFeatureBadge(item: BadgeItem): CatalogProductFeatureBadgeData {
  const typeMap: Record<BadgeItem['id'], CatalogProductFeatureBadgeData['type']> = {
    stock: 'stock',
    delivery: 'delivery',
    transport: 'transport',
    install: 'install',
    reducere: 'reduceri',
  }
  const label =
    item.category && (item.id === 'transport' || item.id === 'install')
      ? `${item.category} ${item.label}`
      : item.label
  return { type: typeMap[item.id], label }
}

function isImageChipBadge(id: BadgeItem['id']) {
  return id === 'stock' || id === 'delivery'
}

type Props = {
  product: PublicProduct
  labels: CatalogBadgeLabels
  className?: string
  layout?: 'stack' | 'wrap' | 'row'
  /** When set, only render these badge types (e.g. stock+delivery on image, transport above price). */
  include?: CatalogBadgeId[]
  /** Admin „Promotie” — chip in the stock/delivery row on the image. */
  promoted?: boolean
  promotieLabel?: string
  /** @deprecated Produse-style badges ignore this; kept for call-site compatibility. */
  appearance?: 'default' | 'neutral'
}

/** Stoc / Livrare / Transport / Reduceri tags for catalog cards and product detail. */
export default function ResidentialProductCatalogBadges({
  product,
  labels,
  className = '',
  layout = 'stack',
  include,
  promoted = false,
  promotieLabel = 'Promoție',
}: Props) {
  const items = buildResidentialCatalogBadgeItems(product, labels).filter(
    (item) => !include || include.includes(item.id),
  )
  const showPromoChip =
    promoted &&
    Boolean(promotieLabel?.trim()) &&
    (!include || include.some((id) => id === 'stock' || id === 'delivery'))
  const promoChip = showPromoChip ? <CatalogProductPromoChip label={promotieLabel.trim()} /> : null

  if (items.length === 0 && !promoChip) return null

  const imageChips = items.filter((item) => isImageChipBadge(item.id))
  const featureBadges = items.filter((item) => !isImageChipBadge(item.id))
  const mixed = imageChips.length > 0 && featureBadges.length > 0

  if (mixed) {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
        {promoChip}
        {items.map((item) => {
          const badge = badgeItemToFeatureBadge(item)
          return isImageChipBadge(item.id) ? (
            <CatalogProductImageChip key={item.id} badge={badge} />
          ) : (
            <CatalogProductFeatureBadge key={item.id} badge={badge} />
          )
        })}
      </div>
    )
  }

  if (imageChips.length > 0 || promoChip) {
    return (
      <div
        className={`flex flex-wrap items-center gap-1.5 ${
          layout === 'stack' ? '' : layout === 'row' ? 'flex-nowrap' : ''
        } ${className}`.trim()}
      >
        {promoChip}
        {imageChips.map((item) => (
          <CatalogProductImageChip key={item.id} badge={badgeItemToFeatureBadge(item)} />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${
        layout === 'row' ? 'flex-nowrap' : ''
      } ${className}`.trim()}
    >
      {featureBadges.map((item) => (
        <CatalogProductFeatureBadge key={item.id} badge={badgeItemToFeatureBadge(item)} />
      ))}
    </div>
  )
}
