import type { LangCode } from './menu'

export type OferteTranslations = {
  seoTitle: string
  seoDesc: string
  pageTitle: string
  pageSubtitle: string
  breadcrumbHome: string
  breadcrumbOferte: string
  cardCta: string
  notFoundTitle: string
  notFoundBody: string
  notFoundCta: string
  vatNote: string
  buyWhatsappCta: string
  whatsappPrefill: string
  buyPhoneCta: string
  technicalDetailsTitle: string
  techTableColSpec: string
  techTableColValue: string
  whyUsTitle: string
}

const translations: Record<LangCode, OferteTranslations> = {
  ro: {
    seoTitle: 'Oferte Baterino — reduceri și pachete pe timp limitat',
    seoDesc: 'Oferte speciale, pe timp limitat, la baterii LiFePO4 și sisteme de stocare a energiei Baterino.',
    pageTitle: 'Oferte',
    pageSubtitle: 'Oferte speciale, pe timp limitat, la produsele Baterino.',
    breadcrumbHome: 'Acasă',
    breadcrumbOferte: 'Oferte',
    cardCta: 'Vezi oferta',
    notFoundTitle: 'Oferta nu a fost găsită',
    notFoundBody: 'Este posibil ca oferta să fi expirat sau linkul să fie greșit.',
    notFoundCta: 'Vezi toate ofertele',
    vatNote: 'TVA inclus',
    buyWhatsappCta: 'Cumpără pe WhatsApp',
    whatsappPrefill: 'Bună, sunt interesat/ă de oferta „{title}” ({price}).',
    buyPhoneCta: 'Comandă telefonic',
    technicalDetailsTitle: 'Detalii tehnice',
    techTableColSpec: 'Specificație',
    techTableColValue: 'Valoare',
    whyUsTitle: 'De ce să cumperi de la noi?',
  },
  en: {
    seoTitle: 'Baterino Offers — limited-time deals and bundles',
    seoDesc: 'Limited-time special offers on Baterino LiFePO4 batteries and energy storage systems.',
    pageTitle: 'Offers',
    pageSubtitle: 'Limited-time special offers on Baterino products.',
    breadcrumbHome: 'Home',
    breadcrumbOferte: 'Offers',
    cardCta: 'View offer',
    notFoundTitle: 'Offer not found',
    notFoundBody: 'This offer may have expired, or the link is incorrect.',
    notFoundCta: 'See all offers',
    vatNote: 'VAT included',
    buyWhatsappCta: 'Buy on WhatsApp',
    whatsappPrefill: 'Hi, I’m interested in the "{title}" offer ({price}).',
    buyPhoneCta: 'Order by phone',
    technicalDetailsTitle: 'Technical details',
    techTableColSpec: 'Specification',
    techTableColValue: 'Value',
    whyUsTitle: 'Why buy from us?',
  },
}

export function getOferteTranslations(lang: LangCode): OferteTranslations {
  return translations[lang] ?? translations.ro
}
