import type { PublicProduct } from './api'

export type PartnerProductGlanceItem = { key: string; value: string }

function whToKwhDisplay(wh: string | null | undefined): string | null {
  if (!wh) return null
  const numStr = String(wh).replace(/\s*Wh$/i, '').replace(',', '.').replace(/\s/g, '')
  const num = parseFloat(numStr)
  if (Number.isNaN(num)) return wh
  const kwh = num / 1000
  return `${kwh % 1 === 0 ? kwh.toFixed(0) : kwh.toFixed(2)} kWh`
}

/** Up to 4 highlight specs for the partner quick-view header. */
export function buildPartnerProductGlanceItems(
  product: PublicProduct,
  labels: {
    energy: string
    power: string
    cycles: string
    warranty: string
  },
): PartnerProductGlanceItem[] {
  const items: PartnerProductGlanceItem[] = []
  const energie = whToKwhDisplay(product.energieNominala) ?? String(product.capacitate ?? '').trim()
  if (energie) items.push({ key: labels.energy, value: energie })

  const charge = String((product as { curentMaxIncarcare?: string }).curentMaxIncarcare ?? '').trim()
  const discharge = String((product as { curentMaxDescarcare?: string }).curentMaxDescarcare ?? '').trim()
  if (charge || discharge) {
    const parts = [charge, discharge].filter(Boolean)
    items.push({ key: labels.power, value: parts.length === 2 ? `${charge} / ${discharge}` : parts[0]! })
  }

  const cycles = String(product.cicluriDescarcare ?? '').trim()
  if (cycles) items.push({ key: labels.cycles, value: cycles })

  const warranty = String(product.garantie ?? (product as { garantie?: string }).garantie ?? '').trim()
  if (warranty) items.push({ key: labels.warranty, value: warranty })

  return items.slice(0, 4)
}
