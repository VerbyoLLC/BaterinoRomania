import type { PublicCatalogSectorKey } from './catalog-sector'

export type CatalogCategoryRoute = {
  /** URL segment under /produse/ */
  slug: string
  /** Catalog sector filter used by Produse */
  sector: PublicCatalogSectorKey
  seoTitle: string
  seoDescription: string
  ogImage: string
}

/** Public category landings that match Edge Middleware CATEGORY_OG + sitemap. */
export const CATALOG_CATEGORY_ROUTES: Record<string, CatalogCategoryRoute> = {
  'baterii-solare': {
    slug: 'baterii-solare',
    sector: 'rezidential',
    seoTitle: 'Baterii Solare LiFePO₄',
    seoDescription:
      'Baterii solare LiFePO₄ rezidențiale LithTech — autoconsum, backup de urgență și independență energetică. Garanție 10 ani.',
    ogImage: '/images/divizii/rezidential/stocare-energie-rezidential-og.jpg',
  },
  'sisteme-bess': {
    slug: 'sisteme-bess',
    sector: 'industrial',
    seoTitle: 'Sisteme BESS Industrial LiFePO₄',
    seoDescription:
      'Sisteme BESS industriale LithTech — modular, cabinet și container, 62kWh până la 5015kWh. Garanție 10 ani, livrare în România.',
    ogImage: '/images/divizii/industrial/baterii-stocare-industrial-og.jpg',
  },
}

export function getCatalogCategoryRoute(slug?: string | null): CatalogCategoryRoute | null {
  if (!slug) return null
  return CATALOG_CATEGORY_ROUTES[String(slug).toLowerCase()] ?? null
}
