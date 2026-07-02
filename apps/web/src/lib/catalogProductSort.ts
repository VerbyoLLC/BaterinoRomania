import { catalogProductHasRrp, isPromoCatalogProduct, type PublicProduct } from './api'

const SECTOR_SORT_ORDER = ['rezidential', 'industrial', 'medical', 'maritim', 'comercial', 'micro_grid'] as const

/** Sector / division rank (matches API `sectorSortRank` and /produse filters). */
function getSectorRank(product: PublicProduct): number {
  const cat = String(product.categorie || '').toLowerCase()
  if (cat.trim()) {
    let best = SECTOR_SORT_ORDER.length
    for (let i = 0; i < SECTOR_SORT_ORDER.length; i++) {
      if (cat.includes(SECTOR_SORT_ORDER[i])) {
        best = Math.min(best, i)
      }
    }
    if (best < SECTOR_SORT_ORDER.length) return best
  }
  const tip = String(product.tipProdus || '').toLowerCase()
  if (tip === 'rezidential') return 0
  if (tip === 'industrial') return 1
  return SECTOR_SORT_ORDER.length
}

function getProductCategoryOrder(product: PublicProduct): number {
  const order = product.category?.order
  return typeof order === 'number' && Number.isFinite(order) ? order : 9999
}

/** Nominal energy in Wh; unknown values sort last. */
function getEnergyWh(product: PublicProduct): number {
  const parsed = parseFloat(String(product.energieNominala ?? '').replace(',', '.'))
  return Number.isNaN(parsed) ? Infinity : parsed
}

/** Shared catalog order: promo → sector → with RRP → product category → ascending kWh. */
export function sortCatalogProducts(list: PublicProduct[]): PublicProduct[] {
  return [...list].sort((a, b) => {
    const promoDiff = Number(isPromoCatalogProduct(b)) - Number(isPromoCatalogProduct(a))
    if (promoDiff !== 0) return promoDiff

    const sectorDiff = getSectorRank(a) - getSectorRank(b)
    if (sectorDiff !== 0) return sectorDiff

    const rrpDiff = Number(catalogProductHasRrp(b)) - Number(catalogProductHasRrp(a))
    if (rrpDiff !== 0) return rrpDiff

    const categoryOrderDiff = getProductCategoryOrder(a) - getProductCategoryOrder(b)
    if (categoryOrderDiff !== 0) return categoryOrderDiff

    return getEnergyWh(a) - getEnergyWh(b)
  })
}
