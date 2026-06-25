import type { LangCode } from './menu'

export type FooterTranslations = {
  // Column headings
  companie: string
  suportLegal: string
  divizii: string
  partneri: string
  media: string
  // Brand links (column 1)
  baterinoGlobal: string
  elarionGlobal: string
  // Companie
  despreNoi: string
  promisiune: string
  lithtech: string
  cariere: string
  // Suport & Legal
  sigurantaClientului: string
  verificareGarantie: string
  serviceLithtech: string
  returnareProduse: string
  intrebariFrecvente: string
  suportClienti: string
  termeniConditii: string
  termeniReduceri: string
  politicaConfidentialitate: string
  // Divizii
  rezidential: string
  industrial: string
  medical: string
  maritim: string
  // Partneri
  clienti: string
  instalatori: string
  distribuitori: string
  centreMedicale: string
  // Media
  presa: string
  studiiDeCaz: string
  contact: string
}

const translations: Record<LangCode, FooterTranslations> = {
  ro: {
    companie: 'Companie',
    suportLegal: 'Suport',
    divizii: 'Divizii',
    partneri: 'Parteneri',
    media: 'Legal',
    baterinoGlobal: 'Baterino Global',
    elarionGlobal: 'Elarion Global',
    despreNoi: 'Despre noi',
    promisiune: 'Promisiune',
    lithtech: 'Parteneriat LithTech',
    cariere: 'Cariere',
    sigurantaClientului: 'Siguranta clientului',
    verificareGarantie: 'Verificare Garantie',
    serviceLithtech: 'Service LithTech',
    returnareProduse: 'Returnare produse',
    intrebariFrecvente: 'Intrebari frecvente',
    suportClienti: 'Suport Clienti',
    termeniConditii: 'Termeni si Conditii',
    termeniReduceri: 'Termeni Reduceri',
    politicaConfidentialitate: 'Politica de confidentialitate',
    rezidential: 'Rezidential',
    industrial: 'Industrial',
    medical: 'Medical',
    maritim: 'Maritim',
    clienti: 'Clienti',
    instalatori: 'Instalatori',
    distribuitori: 'Distribuitori',
    centreMedicale: 'Centre Medicale',
    presa: 'Noutăți - Perspective - Progres',
    studiiDeCaz: 'Studii de caz',
    contact: 'Contact',
  },
  en: {
    companie: 'Company',
    suportLegal: 'Support',
    divizii: 'Divisions',
    partneri: 'Partners',
    media: 'Legal',
    baterinoGlobal: 'Baterino Global',
    elarionGlobal: 'Elarion Global',
    despreNoi: 'About us',
    promisiune: 'Promise',
    lithtech: 'LithTech Partnership',
    cariere: 'Careers',
    sigurantaClientului: 'Customer safety',
    verificareGarantie: 'Warranty check',
    serviceLithtech: 'LithTech Service',
    returnareProduse: 'Product returns',
    intrebariFrecvente: 'FAQ',
    suportClienti: 'Customer Support',
    termeniConditii: 'Terms and Conditions',
    termeniReduceri: 'Discount Terms',
    politicaConfidentialitate: 'Privacy Policy',
    rezidential: 'Residential',
    industrial: 'Industrial',
    medical: 'Medical',
    maritim: 'Maritime',
    clienti: 'Clients',
    instalatori: 'Installers',
    distribuitori: 'Distributors',
    centreMedicale: 'Medical Centers',
    presa: 'News - Perspectives - Progress',
    studiiDeCaz: 'Case studies',
    contact: 'Contact',
  },
}

export function getFooterTranslations(lang: LangCode): FooterTranslations {
  return translations[lang] ?? translations.ro
}
