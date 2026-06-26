import { isPromoCatalogProduct, type PublicProduct } from './api'

const CATEGORY_ORDER: Record<string, number> = {
  rezidential: 0,
  industrial: 1,
  medical: 2,
  maritim: 3,
}

function getCategoryRank(product: PublicProduct): number {
  const category = String(product.categorie || '').toLowerCase()
  for (const [key, rank] of Object.entries(CATEGORY_ORDER)) {
    if (category.includes(key)) return rank
  }
  return 99
}

function hasPublicPrice(product: PublicProduct): boolean {
  const visibility = (product.priceVisibility as string) ?? 'public'
  const salePrice = Number(product.salePrice)
  return visibility === 'public' && !Number.isNaN(salePrice) && salePrice > 0
}

/** Nominal energy in Wh; unknown values sort last. */
function getEnergyWh(product: PublicProduct): number {
  const parsed = parseFloat(String(product.energieNominala ?? '').replace(',', '.'))
  return Number.isNaN(parsed) ? Infinity : parsed
}

/** Shared catalog order: promo → sector → priced → ascending kWh. */
export function sortCatalogProducts(list: PublicProduct[]): PublicProduct[] {
  return [...list].sort((a, b) => {
    const promoDiff = Number(isPromoCatalogProduct(b)) - Number(isPromoCatalogProduct(a))
    if (promoDiff !== 0) return promoDiff

    const categoryDiff = getCategoryRank(a) - getCategoryRank(b)
    if (categoryDiff !== 0) return categoryDiff

    const priceDiff = Number(hasPublicPrice(b)) - Number(hasPublicPrice(a))
    if (priceDiff !== 0) return priceDiff

    return getEnergyWh(a) - getEnergyWh(b)
  })
}
