import type { LangCode } from '../menu'

export type PartnerCatalogSectionId =
  | 'rezidential'
  | 'micro_grid'
  | 'comercial_medical'
  | 'industrial'
  | 'maritim'

export type PartnerCartTotalsLabels = {
  net: string
  vat: string
  gross: string
}

export type PartnerToolbarLabels = {
  searchProducts: string
  clearSearch: string
  openSearchPanel: string
  closeSearchPanel: string
  notifications: string
  notificationsEmptyTitle: string
  notificationsEmptySubtitle: string
}

export type PartnerProductsTranslations = {
  cartTotals: PartnerCartTotalsLabels
  cartLoading: string
  catalogSections: Record<PartnerCatalogSectionId, string>
  toolbar: PartnerToolbarLabels
  productCountOne: string
  productCountMany: string
  pageTitle: string
  cartTitle: string
  cartAria: string
  cartEmpty: string
  cartDismiss: string
  cartPerUnit: string
  cartAriaWithCount: string
  detailTabDetails: string
  detailTabManuals: string
  detailTabVideos: string
  cartCloseAria: string
  cartContinueShopping: string
  cartRemoveItem: string
  cartCheckout: string
  catalogNavAria: string
}

const ro: PartnerProductsTranslations = {
  cartTotals: { net: 'Total fără TVA', vat: 'TVA', gross: 'Total cu TVA' },
  cartLoading: 'Se încarcă coșul…',
  catalogSections: {
    rezidential: 'Rezidențial',
    micro_grid: 'Comercial · Micro-griduri',
    comercial_medical: 'Comercial & Medical',
    industrial: 'Industrial',
    maritim: 'Maritim',
  },
  toolbar: {
    searchProducts: 'Caută produs…',
    clearSearch: 'Șterge căutarea',
    openSearchPanel: 'Deschide căutarea',
    closeSearchPanel: 'Închide căutarea',
    notifications: 'Notificări',
    notificationsEmptyTitle: 'Nicio notificare nouă',
    notificationsEmptySubtitle: 'Actualizări de comandă și alerte vor fi afișate aici.',
  },
  productCountOne: 'produs',
  productCountMany: 'produse',
  pageTitle: 'Produse',
  cartTitle: 'Coș de cumpărături',
  cartAria: 'Coș de cumpărături',
  cartEmpty: 'Coșul este gol.',
  cartDismiss: 'Închide',
  cartPerUnit: '/ buc.',
  cartAriaWithCount: 'Coș ({count} produse)',
  detailTabDetails: 'Detalii',
  detailTabManuals: 'Manuale',
  detailTabVideos: 'Video',
  cartCloseAria: 'Închide coșul',
  cartContinueShopping: 'Continuă cumpărăturile',
  cartRemoveItem: 'Șterge din coș',
  cartCheckout: 'Plasează comanda',
  catalogNavAria: 'Secțiuni catalog',
}

const en: PartnerProductsTranslations = {
  cartTotals: { net: 'Subtotal (excl. VAT)', vat: 'VAT', gross: 'Total (incl. VAT)' },
  cartLoading: 'Loading cart…',
  catalogSections: {
    rezidential: 'Residential',
    micro_grid: 'Commercial · Micro-grids',
    comercial_medical: 'Commercial & Medical',
    industrial: 'Industrial',
    maritim: 'Marine',
  },
  toolbar: {
    searchProducts: 'Search products…',
    clearSearch: 'Clear search',
    openSearchPanel: 'Open search',
    closeSearchPanel: 'Close search',
    notifications: 'Notifications',
    notificationsEmptyTitle: 'No new notifications',
    notificationsEmptySubtitle: 'Order updates and alerts will appear here.',
  },
  productCountOne: 'product',
  productCountMany: 'products',
  pageTitle: 'Products',
  cartTitle: 'Shopping cart',
  cartAria: 'Shopping cart',
  cartEmpty: 'Your cart is empty.',
  cartDismiss: 'Close',
  cartPerUnit: '/ unit',
  cartAriaWithCount: 'Cart ({count} products)',
  detailTabDetails: 'Details',
  detailTabManuals: 'Manuals',
  detailTabVideos: 'Videos',
  cartCloseAria: 'Close cart',
  cartContinueShopping: 'Continue shopping',
  cartRemoveItem: 'Remove from cart',
  cartCheckout: 'Place order',
  catalogNavAria: 'Catalog sections',
}


const translations: Record<LangCode, PartnerProductsTranslations> = { ro, en }

export function formatPartnerCatalogSectionCount(lang: LangCode, count: number): string {
  const tr = getPartnerProductsTranslations(lang)
  const word = count === 1 ? tr.productCountOne : tr.productCountMany
  return `${count} ${word}`
}

export function getPartnerProductsTranslations(lang: LangCode): PartnerProductsTranslations {
  return translations[lang] ?? translations.ro
}

/** @deprecated Use getPartnerProductsTranslations(lang).cartTotals */
export function partnerCartTotalsLabels(langCode: LangCode): PartnerCartTotalsLabels {
  return getPartnerProductsTranslations(langCode).cartTotals
}

/** @deprecated Use getPartnerProductsTranslations(lang).cartLoading */
export function partnerCartLoadingLabel(langCode: LangCode): string {
  return getPartnerProductsTranslations(langCode).cartLoading
}

/** @deprecated Use getPartnerProductsTranslations(lang).catalogSections */
export function partnerCatalogSectionLabels(
  langCode: LangCode,
): Record<PartnerCatalogSectionId, string> {
  return getPartnerProductsTranslations(langCode).catalogSections
}

/** @deprecated Use getPartnerProductsTranslations(lang).toolbar */
export function partnerToolbarLabels(langCode: LangCode): PartnerToolbarLabels {
  return getPartnerProductsTranslations(langCode).toolbar
}
