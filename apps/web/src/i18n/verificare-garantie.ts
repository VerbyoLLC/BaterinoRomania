import type { LangCode } from './menu'

export type VerificareGarantieTranslations = {
  pageTitle: string
  pageDescription: string
  serialLabel: string
  placeholder: string
  submit: string
  modalClose: string
  modelLabel: string
  brandLabel: string
  errorTitle: string
  warrantyActive: string
  notFoundTitle: string
  notFoundBody: string
  contactHint: string
  invalidSerial: string
  loading: string
  genericError: string
  /** Mesaj când API răspunde 429 (anti-enumerare). */
  rateLimited: string
  /** Link semnat invalid sau expirat (400 invalid_token). */
  invalidToken: string
  /** Server fără WARRANTY_VERIFY_TOKEN_SECRET dar client trimite t= (503). */
  tokenNotConfigured: string
  productFallbackAlt: string
}

const translations: Record<LangCode, VerificareGarantieTranslations> = {
  ro: {
    pageTitle: 'Verificare garanție',
    pageDescription: 'Introdu numărul de serie (SN) al bateriei pentru a verifica garanția.',
    serialLabel: 'Număr serie',
    placeholder: 'Ex: LJC5131400325070043',
    submit: 'Verifică',
    modalClose: 'Închide',
    modelLabel: 'Model',
    brandLabel: 'Marcă',
    errorTitle: 'Verificare',
    warrantyActive: 'Garanție activă',
    notFoundTitle: 'Acest număr de serie nu a fost găsit.',
    notFoundBody:
      'Verifică dacă ai introdus numărul de serie corect și încearcă din nou.',
    contactHint:
      'Dacă ești în posesia acestui produs și ai nevoie de ajutor, te rugăm să ne contactezi.',
    invalidSerial:
      'Numărul de serie nu are formatul corect. Verifică și încearcă din nou (ex.: LJC urmat de 16 cifre).',
    loading: 'Se verifică…',
    genericError: 'Nu am putut verifica acum. Încearcă din nou peste câteva momente.',
    rateLimited:
      'Prea multe verificări într-un interval scurt. Așteaptă un minut și încearcă din nou. Dacă problema persistă, contactează-ne.',
    invalidToken:
      'Linkul de verificare din certificat nu este valid sau a expirat. Folosește numărul de serie sau un certificat mai nou.',
    tokenNotConfigured:
      'Verificarea prin linkul din certificat nu este disponibilă momentan. Introdu manual numărul de serie sau încearcă mai târziu.',
    productFallbackAlt: 'Produs',
  },
  en: {
    pageTitle: 'Warranty check',
    pageDescription: 'Enter your battery serial number (SN) to verify warranty status.',
    serialLabel: 'Serial number',
    placeholder: 'E.g. LJC5131400325070043',
    submit: 'Check',
    modalClose: 'Close',
    modelLabel: 'Model',
    brandLabel: 'Brand',
    errorTitle: 'Verification',
    warrantyActive: 'Warranty active',
    notFoundTitle: 'This serial number was not found.',
    notFoundBody: 'Check that you entered the serial number correctly and try again.',
    contactHint:
      'If you are in possession of this product and need help, please contact us.',
    invalidSerial:
      'The serial number format is not valid. Check and try again (e.g. LJC followed by 16 digits).',
    loading: 'Checking…',
    genericError: 'We could not complete the check. Please try again in a moment.',
    rateLimited:
      'Too many checks in a short time. Please wait about a minute and try again. If this keeps happening, contact us.',
    invalidToken:
      'The verification link from your certificate is invalid or has expired. Enter the serial number manually or use a newer certificate.',
    tokenNotConfigured:
      'Certificate link verification is temporarily unavailable. Enter your serial number manually or try again later.',
    productFallbackAlt: 'Product',
  },
}

export function getVerificareGarantieTranslations(lang: LangCode): VerificareGarantieTranslations {
  return translations[lang] ?? translations.ro
}
