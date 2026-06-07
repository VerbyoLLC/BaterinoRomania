import type { LangCode } from './menu'

export type CartProgramDiscountTranslations = {
  /** `{program}` = short program name, `{pct}` = discount % */
  discountProgramBadge: string
  /** When `reducereProgramId` is missing or unknown after fetch */
  discountProgramFallbackName: string
  /** Shown under badge — future document upload / approval */
  discountDocumentsNotice: string
}

const translations: Record<LangCode, CartProgramDiscountTranslations> = {
  ro: {
    discountProgramBadge: '{program} · {pct}%',
    discountProgramFallbackName: 'Program de reducere',
    discountDocumentsNotice:
      'La finalizare poți fi solicitat să încarci documentele cerute de program (ex.: adeverință, acte de identitate) pentru aprobarea reducerii.',
  },
  en: {
    discountProgramBadge: '{program} · {pct}%',
    discountProgramFallbackName: 'Discount programme',
    discountDocumentsNotice:
      'When you complete your order, you may be asked to upload documents required by the programme (e.g. proof of eligibility) so your discount can be approved.',
  },
}

export function getCartProgramDiscountTranslations(lang: LangCode): CartProgramDiscountTranslations {
  return translations[lang] ?? translations.ro
}
