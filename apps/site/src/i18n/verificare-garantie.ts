import type { LangCode } from './menu'

export type VerificareGarantieTranslations = {
  pageTitle: string
  pageDescription: string
}

const translations: Record<LangCode, VerificareGarantieTranslations> = {
  ro: {
    pageTitle: 'Verificare garanție',
    pageDescription: 'Introdu numărul de serie (SN) al bateriei pentru a verifica garanția.',
  },
  en: {
    pageTitle: 'Warranty check',
    pageDescription: 'Enter your battery serial number (SN) to verify warranty status.',
  },
}

export function getVerificareGarantieTranslations(lang: LangCode): VerificareGarantieTranslations {
  return translations[lang] ?? translations.ro
}
