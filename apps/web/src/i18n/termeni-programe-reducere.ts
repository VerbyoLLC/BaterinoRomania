import type { LangCode } from './menu'

export type TermeniProgrameReducereTranslations = {
  seoTitle: string
  seoDesc: string
  pageTitle: string
  intro: string
}

const translations: Record<LangCode, TermeniProgrameReducereTranslations> = {
  ro: {
    seoTitle: 'Termeni și Condiții – Programe de Reducere – Baterino România',
    seoDesc: 'Termenii și condițiile pentru programele de reducere Baterino.',
    pageTitle: 'Termeni și Condiții – Programe de Reducere',
    intro: 'Acești termeni și condiții reglementează participarea la programele de reducere oferite de Baterino România. Vă rugăm să citiți cu atenție înainte de a beneficia de orice reducere.',
  },
  en: {
    seoTitle: 'Terms and Conditions – Discount Programs – Baterino Romania',
    seoDesc: 'Terms and conditions for Baterino discount programs.',
    pageTitle: 'Terms and Conditions – Discount Programs',
    intro: 'These terms and conditions govern participation in the discount programs offered by Baterino Romania. Please read carefully before benefiting from any discount.',
  },
}

export function getTermeniProgrameReducereTranslations(lang: LangCode): TermeniProgrameReducereTranslations {
  return translations[lang] ?? translations.ro
}
