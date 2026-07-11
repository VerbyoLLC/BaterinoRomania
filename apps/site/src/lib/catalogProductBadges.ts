import type { PublicProduct } from './api'
import { productHasEligibleReducerePrograms, type CatalogStockStatus } from './api'

export type CatalogBadgeLabels = {
  stockCategory: string
  deliveryCategory: string
  transportCategory: string
  installCategory: string
  stockIn: string
  stockOut: string
  stockSoon: string
  stockOnOrder: string
  delivery24h: string
  delivery48h: string
  delivery7_14d: string
  delivery60d: string
  transportFree: string
  transportPaid: string
  installBaterino: string
  installPartner: string
  reduceri: string
}

export function catalogProductSupportsBadges(tipProdus?: string | null): boolean {
  const tip = String(tipProdus || '').toLowerCase()
  return tip === 'rezidential' || tip === 'industrial'
}

export function getCatalogStockBadgeLabel(
  product: Pick<PublicProduct, 'tipProdus' | 'catalogStockStatus'>,
  labels: { inStock: string; outOfStock: string; comingSoon: string; onOrder: string },
): string | null {
  if (!catalogProductSupportsBadges(product.tipProdus)) return null
  const s = (product.catalogStockStatus ?? 'in_stock') as CatalogStockStatus
  if (s === 'out_of_stock') return labels.outOfStock
  if (s === 'coming_soon') return labels.comingSoon
  if (s === 'on_order') return labels.onOrder
  return labels.inStock
}

export function getCatalogDeliveryBadgeLabel(
  product: Pick<PublicProduct, 'tipProdus' | 'catalogDeliveryBadge'>,
  labels: { h24: string; h48: string; d7_14: string; d60: string },
): string | null {
  if (!catalogProductSupportsBadges(product.tipProdus)) return null
  const d = product.catalogDeliveryBadge ?? '48h'
  if (d === '24h') return labels.h24
  if (d === '7_14d') return labels.d7_14
  if (d === '60d') return labels.d60
  return labels.h48
}

export function getCatalogTransportBadgeLabel(
  product: Pick<PublicProduct, 'tipProdus' | 'catalogTransportBadge'>,
  labels: { free: string; paid: string },
): string | null {
  if (!catalogProductSupportsBadges(product.tipProdus)) return null
  const t = product.catalogTransportBadge ?? 'free'
  if (t === 'paid') return labels.paid
  return labels.free
}

export function getCatalogInstallBadgeLabel(
  product: Pick<PublicProduct, 'tipProdus' | 'catalogInstallBadge'>,
  labels: { baterino: string; partner: string },
): string | null {
  if (String(product.tipProdus || '').toLowerCase() !== 'industrial') return null
  const i = product.catalogInstallBadge ?? 'baterino'
  if (i === 'partner') return labels.partner
  return labels.baterino
}

export function catalogBadgeLabelsFromProduseTr(tr: {
  catalogBadgeStocCategory: string
  catalogBadgeLivrareCategory: string
  catalogBadgeTransportCategory: string
  catalogBadgeInstalareCategory: string
  catalogStockInStock: string
  catalogStockOutOfStock: string
  catalogStockComingSoon: string
  catalogStockOnOrder: string
  catalogDelivery24h: string
  catalogDelivery48h: string
  catalogDelivery7_14d: string
  catalogDelivery60d: string
  catalogTransportFree: string
  catalogTransportPaid: string
  catalogInstallBaterino: string
  catalogInstallPartner: string
  catalogReducereBadge: string
}): CatalogBadgeLabels {
  return {
    stockCategory: tr.catalogBadgeStocCategory,
    deliveryCategory: tr.catalogBadgeLivrareCategory,
    transportCategory: tr.catalogBadgeTransportCategory,
    installCategory: tr.catalogBadgeInstalareCategory,
    stockIn: tr.catalogStockInStock,
    stockOut: tr.catalogStockOutOfStock,
    stockSoon: tr.catalogStockComingSoon,
    stockOnOrder: tr.catalogStockOnOrder,
    delivery24h: tr.catalogDelivery24h,
    delivery48h: tr.catalogDelivery48h,
    delivery7_14d: tr.catalogDelivery7_14d,
    delivery60d: tr.catalogDelivery60d,
    transportFree: tr.catalogTransportFree,
    transportPaid: tr.catalogTransportPaid,
    installBaterino: tr.catalogInstallBaterino,
    installPartner: tr.catalogInstallPartner,
    reduceri: tr.catalogReducereBadge,
  }
}

export { productHasEligibleReducerePrograms }
