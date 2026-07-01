import {
  residentialProductStockUnavailable,
  isPromoCatalogProduct,
  type PublicProduct,
} from './api'

export const PARTNER_RFQ_STORAGE_KEY = 'baterino.partner.rfq.v1'

export type PartnerRfqStoredLine = {
  productId: string
  quantity: number
}

export type PartnerRfqItem = {
  product: PublicProduct
  quantity: number
}

export const PARTNER_RFQ_UPDATED_EVENT = 'baterino:partner-rfq-updated'
export const PARTNER_OPEN_RFQ_EVENT = 'baterino:partner-open-rfq'

export function hydratePartnerRfqFromProducts(
  products: PublicProduct[],
  stored: PartnerRfqStoredLine[],
): PartnerRfqItem[] {
  if (!stored.length) return []
  const map = new Map(products.map((p) => [p.id, p]))
  const restored: PartnerRfqItem[] = []
  for (const row of stored) {
    const productId = String(row.productId ?? '').trim()
    const quantity = Number(row.quantity)
    if (!productId || !Number.isFinite(quantity)) continue
    const p = map.get(productId)
    if (!p || isPromoCatalogProduct(p)) continue
    if (residentialProductStockUnavailable(p)) continue
    const qty = Math.max(1, Math.min(99, Math.floor(quantity)))
    restored.push({ product: p, quantity: qty })
  }
  return restored
}

export function readPartnerRfqFromStorage(): PartnerRfqStoredLine[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(PARTNER_RFQ_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const out: PartnerRfqStoredLine[] = []
    for (const row of parsed) {
      if (!row || typeof row !== 'object') continue
      const productId = String((row as PartnerRfqStoredLine).productId ?? '').trim()
      const quantity = Number((row as PartnerRfqStoredLine).quantity)
      if (!productId || !Number.isFinite(quantity)) continue
      out.push({ productId, quantity })
    }
    return out
  } catch {
    return []
  }
}

export function partnerRfqStoredTotalQuantity(lines?: PartnerRfqStoredLine[]): number {
  const rows = lines ?? readPartnerRfqFromStorage()
  return rows.reduce((sum, row) => {
    const q = Number(row.quantity)
    return sum + (Number.isFinite(q) ? Math.max(0, Math.floor(q)) : 0)
  }, 0)
}

export function notifyPartnerRfqUpdated(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(PARTNER_RFQ_UPDATED_EVENT))
}

export function writePartnerRfqToStorage(lines: PartnerRfqStoredLine[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(PARTNER_RFQ_STORAGE_KEY, JSON.stringify(lines))
    notifyPartnerRfqUpdated()
  } catch {
    /* quota / private mode */
  }
}

export function clearPartnerRfqStorage(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(PARTNER_RFQ_STORAGE_KEY)
    notifyPartnerRfqUpdated()
  } catch {
    /* ignore */
  }
}

export function generatePartnerRfqReferenceId(): string {
  const year = new Date().getFullYear()
  const seq = String(Math.floor(Math.random() * 9000) + 1000)
  return `RFQ-${year}-${seq}`
}
