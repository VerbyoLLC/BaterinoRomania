import { residentialProductStockUnavailable, type PublicProduct } from './api'

function num(v: string | number | null | undefined): number | null {
  if (v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/** Residential template: show public client purchase UI (price, programme, qty, order). */
export function showResidentialClientPurchaseUI(product: PublicProduct): boolean {
  const vis = (product.priceVisibility as string) || 'public'
  if (vis !== 'public') return false
  if (residentialProductStockUnavailable(product)) return false
  const sale = num(product.salePrice)
  return sale != null && sale > 0
}
