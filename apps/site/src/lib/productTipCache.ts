/** Remember product template so /produse/:slug can pick the right loading skeleton on refresh. */

const storageKey = (slugOrId: string) => `baterino:productTip:${slugOrId}`

export type ProductTipPayload = {
  slug?: string | null
  id: string
  tipProdus: 'rezidential' | 'industrial'
}

export function cacheProductTip(tip: ProductTipPayload): void {
  const keys = new Set<string>()
  const slug = String(tip.slug ?? '').trim()
  if (slug) keys.add(slug)
  if (tip.id) keys.add(String(tip.id))
  for (const k of keys) {
    try {
      sessionStorage.setItem(storageKey(k), tip.tipProdus)
    } catch {
      /* ignore */
    }
  }
}

export function readCachedProductTip(slugOrId: string | undefined): 'rezidential' | 'industrial' | undefined {
  if (!slugOrId) return undefined
  try {
    const v = sessionStorage.getItem(storageKey(slugOrId))
    if (v === 'industrial' || v === 'rezidential') return v
  } catch {
    /* ignore */
  }
  return undefined
}

export function syncProductTipsFromList(list: ProductTipPayload[]): void {
  for (const p of list) {
    cacheProductTip(p)
  }
}
