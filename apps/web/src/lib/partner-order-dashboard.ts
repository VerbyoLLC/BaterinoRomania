import type { ClientOrderRow } from './api'

export type PartnerOrderDashBuckets = {
  dePlata: number
  inCurs: number
  livrate: number
}

/**
 * Dashboard KPI split for partner orders (same `fulfillmentStatus` values as Comenzile mele).
 * - De plată: `de_platit` (implicit când lipsește status)
 * - În curs de livrare: `preluata`, `in_pregatire`, `in_curs_livrare`
 * - Livrate: `livrata`
 * `anulata` is excluded from all three; header total = sum of the three buckets.
 */
export function countPartnerOrderDashboardBuckets(rows: ClientOrderRow[]): PartnerOrderDashBuckets {
  let dePlata = 0
  let inCurs = 0
  let livrate = 0
  for (const o of rows) {
    const s = String(o.fulfillmentStatus || 'de_platit').trim()
    if (s === 'anulata') continue
    if (s === 'livrata') {
      livrate += 1
    } else if (s === 'preluata' || s === 'in_pregatire' || s === 'in_curs_livrare') {
      inCurs += 1
    } else if (s === 'de_platit') {
      dePlata += 1
    } else {
      dePlata += 1
    }
  }
  return { dePlata, inCurs, livrate }
}

export function partnerOrdersActiveSubtotal(b: PartnerOrderDashBuckets): number {
  return b.dePlata + b.inCurs + b.livrate
}
