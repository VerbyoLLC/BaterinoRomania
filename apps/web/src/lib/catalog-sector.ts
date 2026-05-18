import type { PublicProduct } from './api'

export type PublicCatalogSectorKey = 'rezidential' | 'industrial' | 'medical' | 'maritim'

/** Same rules as Produse.tsx sector filter — counts stay aligned with the public catalog tabs. */
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

export function countPublicProductsBySector(
  products: PublicProduct[],
): Record<PublicCatalogSectorKey, number> {
  const keys: PublicCatalogSectorKey[] = ['rezidential', 'industrial', 'medical', 'maritim']
  return Object.fromEntries(
    keys.map((k) => [k, products.filter((p) => publicProductMatchesSector(p, k)).length]),
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
