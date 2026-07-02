import { residentialProductStockUnavailable, type PublicProduct } from './api'

function num(v: string | number | null | undefined): number | null {
  if (v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/** Public catalog (guest + client): product can be added to cart / checked out online. */
export function publicCatalogClientPurchaseEligible(product: PublicProduct): boolean {
  const tip = String(product.tipProdus || '').toLowerCase()
  if (tip !== 'rezidential' && tip !== 'industrial') return false
  const vis = (product.priceVisibility as string) || 'public'
  if (vis !== 'public') return false
  if (tip === 'rezidential' && residentialProductStockUnavailable(product)) return false
  const sale = num(product.salePrice)
  return sale != null && sale > 0
}

/** @deprecated Prefer `publicCatalogClientPurchaseEligible` — name kept for existing imports. */
export function showResidentialClientPurchaseUI(product: PublicProduct): boolean {
  return publicCatalogClientPurchaseEligible(product)
}
