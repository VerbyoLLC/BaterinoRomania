import type { LangCode } from '../menu'

export type PartnerServiceTranslations = {
  title: string
  subtitle: string
  emptyTitle: string
  emptyBody: string
}

const ro: PartnerServiceTranslations = {
  title: 'Reparatii',
  subtitle: 'Gestionează cererile de service și mentenanță.',
  emptyTitle: 'Service și mentenanță',
  emptyBody: 'Aici vei gestiona cererile de service pentru produsele vândute. Funcționalitate în curând.',
}

const en: PartnerServiceTranslations = {
  title: 'Repairs',
  subtitle: 'Manage service and maintenance requests.',
  emptyTitle: 'Service & maintenance',
  emptyBody: 'You will manage service requests for sold products here. Coming soon.',
}


const translations: Record<LangCode, PartnerServiceTranslations> = { ro, en }

export function getPartnerServiceTranslations(lang: LangCode): PartnerServiceTranslations {
  return translations[lang] ?? translations.ro
}
