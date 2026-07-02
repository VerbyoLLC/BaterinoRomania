import type { PublicProduct } from './api'

export type PublicCatalogSectorKey = 'rezidential' | 'industrial' | 'medical' | 'maritim'

export const PUBLIC_CATALOG_SECTOR_KEYS: PublicCatalogSectorKey[] = [
  'rezidential',
  'industrial',
  'medical',
  'maritim',
]

/** Home page sector tabs — uncategorized products may appear in rezidential/industrial via tipProdus. */
export function publicProductMatchesSector(p: PublicProduct, sector: PublicCatalogSectorKey): boolean {
  const cat = String(p.categorie || '').toLowerCase()
  if (cat && cat.includes(sector)) return true
  if (!String(p.categorie || '').trim()) {
    const tip = String(p.tipProdus || '').toLowerCase()
    if (sector === 'rezidential' && tip === 'industrial') return true
    if (sector === 'industrial' && tip === 'rezidential') return true
  }
  return false
}

/** Produse page sector filter — stricter tipProdus fallback than the home tabs. */
export function produseCatalogProductMatchesSector(
  p: PublicProduct,
  sector: PublicCatalogSectorKey,
): boolean {
  const cat = String(p.categorie || '').toLowerCase()
  if (cat && cat.includes(sector)) return true
  if (!String(p.categorie || '').trim()) {
    const tip = String(p.tipProdus || '').toLowerCase()
    if (sector === 'rezidential' && tip === 'rezidential') return true
    if (sector === 'industrial' && tip === 'industrial') return true
  }
  return false
}

export function catalogSectorsWithProducts(
  products: PublicProduct[],
  matches: (p: PublicProduct, sector: PublicCatalogSectorKey) => boolean,
): PublicCatalogSectorKey[] {
  return PUBLIC_CATALOG_SECTOR_KEYS.filter((sector) => products.some((p) => matches(p, sector)))
}

export function countPublicProductsBySector(
  products: PublicProduct[],
): Record<PublicCatalogSectorKey, number> {
  return Object.fromEntries(
    PUBLIC_CATALOG_SECTOR_KEYS.map((k) => [
      k,
      products.filter((p) => publicProductMatchesSector(p, k)).length,
    ]),
  ) as Record<PublicCatalogSectorKey, number>
}

/** Partner dashboard Produse card: rezidențial / industrial / comercial (comercial from `categorie`). */
export type PartnerDashboardProductBucketKey = 'rezidential' | 'industrial' | 'comercial'

export function countPartnerDashboardProductBuckets(
  products: PublicProduct[],
): Record<PartnerDashboardProductBucketKey, number> {
  const comercial = (p: PublicProduct) =>
    String(p.categorie || '')
      .toLowerCase()
      .includes('comercial')
  return {
    rezidential: products.filter(
      (p) => !comercial(p) && publicProductMatchesSector(p, 'rezidential'),
    ).length,
    industrial: products.filter(
      (p) => !comercial(p) && publicProductMatchesSector(p, 'industrial'),
    ).length,
    comercial: products.filter(comercial).length,
  }
}
