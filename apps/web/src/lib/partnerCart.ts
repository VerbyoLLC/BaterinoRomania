import {
  getPartnerCatalogSaleUnitNumeric,
  residentialProductStockUnavailable,
  type PublicProduct,
} from './api'

/** Persisted partner catalog cart (minimal lines). */
export const PARTNER_CART_STORAGE_KEY = 'baterino.partner.cart.v1'

export type PartnerCartStoredLine = {
  productId: string
  quantity: number
}

export type PartnerCartItem = {
  product: PublicProduct
  quantity: number
}

export function partnerProductHasListPrice(product: PublicProduct): boolean {
  return !Number.isNaN(getPartnerCatalogSaleUnitNumeric(product))
}

/** Restore cart lines from storage against the current catalog snapshot. */
export function hydratePartnerCartFromProducts(
  products: PublicProduct[],
  stored: PartnerCartStoredLine[],
): PartnerCartItem[] {
  if (!stored.length) return []
  const map = new Map(products.map((p) => [p.id, p]))
  const restored: PartnerCartItem[] = []
  for (const row of stored) {
    const productId = String(row.productId ?? '').trim()
    const quantity = Number(row.quantity)
    if (!productId || !Number.isFinite(quantity)) continue
    const p = map.get(productId)
    if (!p || !partnerProductHasListPrice(p)) continue
    if (residentialProductStockUnavailable(p)) continue
    const qty = Math.max(1, Math.min(99, Math.floor(quantity)))
    restored.push({ product: p, quantity: qty })
  }
  return restored
}

export function readPartnerCartFromStorage(): PartnerCartStoredLine[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(PARTNER_CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const out: PartnerCartStoredLine[] = []
    for (const row of parsed) {
      if (!row || typeof row !== 'object') continue
      const productId = String((row as PartnerCartStoredLine).productId ?? '').trim()
      const quantity = Number((row as PartnerCartStoredLine).quantity)
      if (!productId || !Number.isFinite(quantity)) continue
      out.push({ productId, quantity })
    }
    return out
  } catch {
    return []
  }
}

export function writePartnerCartToStorage(lines: PartnerCartStoredLine[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(PARTNER_CART_STORAGE_KEY, JSON.stringify(lines))
  } catch {
    /* quota / private mode */
  }
}

export function clearPartnerCartStorage(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(PARTNER_CART_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
