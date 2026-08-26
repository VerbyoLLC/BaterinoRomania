import type { HomeTranslations } from '../i18n/home'
import { formatResidentialCatalogPriceDisplay, type PublicProduct } from './api'

export const HOME_PROMO_PRODUCT_LINK = '/produse/baterii-solare/pachet-baterii-lifepo4-20kwh'

export const HOME_PROMO_PRODUCT_SLUG =
  HOME_PROMO_PRODUCT_LINK.split('/').filter(Boolean).pop() ?? ''

export function hasHomePromoLivePrice(
  product: PublicProduct | null | undefined,
  langCode: string,
  currency: string,
): boolean {
  if (!product) return false
  return formatResidentialCatalogPriceDisplay(product, langCode, currency) != null
}

/** Build the promo hero/modal price line from the linked catalog product. */
export function buildHomePromoTitleLine2(
  tr: Pick<HomeTranslations, 'promoModalPricePrefix' | 'promoModalTitleLine2'>,
  product: PublicProduct | null | undefined,
  langCode: string,
  currency: string,
): string {
  if (!product) return tr.promoModalTitleLine2
  const livePrice = formatResidentialCatalogPriceDisplay(product, langCode, currency)
  if (!livePrice) return tr.promoModalTitleLine2
  return `${tr.promoModalPricePrefix} ${livePrice}`
}

export function mergeHomePromoTranslations(
  tr: HomeTranslations,
  product: PublicProduct | null | undefined,
  langCode: string,
  currency: string,
): HomeTranslations {
  return {
    ...tr,
    promoModalTitleLine2: buildHomePromoTitleLine2(tr, product, langCode, currency),
  }
}
