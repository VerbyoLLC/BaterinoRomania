import type { LangCode } from '../menu'

export type PartnerCheckoutTranslations = {
  partnerBadge: string
  partnerSubline: string
  stepTitles: readonly [string, string, string, string]
  invalidSession: string
  partnerDiscountApplied: string
  backToContact: string
  copyFromBilling: string
  backToBilling: string
}

const ro: PartnerCheckoutTranslations = {
  partnerBadge: 'Partener',
  partnerSubline:
    'Datele de facturare și livrare pentru firma ta. Confirmarea comenzii este trimisă pe emailul contului partener.',
  stepTitles: [
    'Pasul 1: Persoană de contact',
    'Pasul 2: Date de facturare',
    'Pasul 3: Adresa de livrare',
    'Pasul 4: Finalizare comandă',
  ],
  invalidSession: 'Sesiune invalidă. Autentifică-te din nou.',
  partnerDiscountApplied:
    'Reducere partener {pct}% aplicată la prețul net din catalog (conform politicii comerciale).',
  backToContact: 'Înapoi la persoană de contact',
  copyFromBilling: 'Copiază din adresa fiscală',
  backToBilling: 'Înapoi la datele de facturare',
}

const en: PartnerCheckoutTranslations = {
  partnerBadge: 'Partner',
  partnerSubline:
    'Company billing and delivery. Order confirmation is sent to your partner account email.',
  stepTitles: [
    'Step 1: Contact person',
    'Step 2: Billing details',
    'Step 3: Delivery address',
    'Step 4: Complete order',
  ],
  invalidSession: 'Invalid session. Sign in again.',
  partnerDiscountApplied:
    'Partner discount {pct}% applied to catalog net (per commercial policy).',
  backToContact: 'Back to contact person',
  copyFromBilling: 'Copy from billing address',
  backToBilling: 'Back to billing details',
}


const translations: Record<LangCode, PartnerCheckoutTranslations> = { ro, en }

export function getPartnerCheckoutTranslations(lang: LangCode): PartnerCheckoutTranslations {
  return translations[lang] ?? translations.ro
}
