import type { LangCode } from './menu'

export type ProductPricingTranslations = {
  saleLabel: string
  landedLabel: string
  vatLabel: string
  priceWithVatLabel: string
  partnerLoginPrompt: string
  partnerLoginCta: string
  hiddenPrompt: string
  contactCta: string
  currencySuffix: string
}

const translations: Record<LangCode, ProductPricingTranslations> = {
  ro: {
    saleLabel: 'Preț',
    landedLabel: 'Preț aterizat',
    vatLabel: 'TVA',
    priceWithVatLabel: 'Preț cu TVA',
    partnerLoginPrompt: 'Prețurile pentru acest produs sunt disponibile pentru parteneri autorizați.',
    partnerLoginCta: 'Autentificare partener',
    hiddenPrompt: 'Pentru ofertă personalizată, contactează echipa Baterino.',
    contactCta: 'Contact',
    currencySuffix: 'lei',
  },
  en: {
    saleLabel: 'Price',
    landedLabel: 'Landed cost',
    vatLabel: 'VAT',
    priceWithVatLabel: 'Price incl. VAT',
    partnerLoginPrompt: 'Pricing for this product is available to approved partners.',
    partnerLoginCta: 'Partner sign in',
    hiddenPrompt: 'Request a tailored quote from the Baterino team.',
    contactCta: 'Contact',
    currencySuffix: 'RON',
  },
  zh: {
    saleLabel: '售价',
    landedLabel: '到岸成本',
    vatLabel: '增值税',
    priceWithVatLabel: '含税价',
    partnerLoginPrompt: '本产品价格仅对授权合作伙伴显示。',
    partnerLoginCta: '合作伙伴登录',
    hiddenPrompt: '请联系 Baterino 获取报价。',
    contactCta: '联系',
    currencySuffix: 'RON',
  },
}

export function getProductPricingTranslations(lang: LangCode): ProductPricingTranslations {
  return translations[lang] ?? translations.ro
}
