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
  suportClienti: string
  termeniConditii: string
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
  contact: string
}

const translations: Record<LangCode, FooterTranslations> = {
  ro: {
    companie: 'Companie',
    suportLegal: 'Suport & Legal',
    divizii: 'Divizii',
    partneri: 'Partneri',
    media: 'Media',
    baterinoGlobal: 'Baterino Global',
    elarionGlobal: 'Elarion Global',
    despreNoi: 'Despre noi',
    promisiune: 'Promisiune',
    lithtech: 'LithTech',
    cariere: 'Cariere',
    sigurantaClientului: 'Siguranta clientului',
    suportClienti: 'Suport Clienti',
    termeniConditii: 'Termeni si Conditii',
    politicaConfidentialitate: 'Politica de confidentialitate',
    rezidential: 'Rezidential',
    industrial: 'Industrial',
    medical: 'Medical',
    maritim: 'Maritim',
    clienti: 'Clienti',
    instalatori: 'Instalatori',
    distribuitori: 'Distribuitori',
    centreMedicale: 'Centre Medicale',
    presa: 'Presa',
    contact: 'Contact',
  },
  en: {
    companie: 'Company',
    suportLegal: 'Support & Legal',
    divizii: 'Divisions',
    partneri: 'Partners',
    media: 'Media',
    baterinoGlobal: 'Baterino Global',
    elarionGlobal: 'Elarion Global',
    despreNoi: 'About us',
    promisiune: 'Promise',
    lithtech: 'LithTech',
    cariere: 'Careers',
    sigurantaClientului: 'Customer safety',
    suportClienti: 'Customer Support',
    termeniConditii: 'Terms and Conditions',
    politicaConfidentialitate: 'Privacy Policy',
    rezidential: 'Residential',
    industrial: 'Industrial',
    medical: 'Medical',
    maritim: 'Maritime',
    clienti: 'Clients',
    instalatori: 'Installers',
    distribuitori: 'Distributors',
    centreMedicale: 'Medical Centers',
    presa: 'Press',
    contact: 'Contact',
  },
  zh: {
    companie: '公司',
    suportLegal: '支持与法律',
    divizii: '事业部',
    partneri: '合作伙伴',
    media: '媒体',
    baterinoGlobal: 'Baterino Global',
    elarionGlobal: 'Elarion Global',
    despreNoi: '关于我们',
    promisiune: '承诺',
    lithtech: 'LithTech',
    cariere: '招聘',
    sigurantaClientului: '客户安全',
    suportClienti: '客户支持',
    termeniConditii: '条款与条件',
    politicaConfidentialitate: '隐私政策',
    rezidential: '住宅',
    industrial: '工业',
    medical: '医疗',
    maritim: '船舶',
    clienti: '客户',
    instalatori: '安装商',
    distribuitori: '经销商',
    centreMedicale: '医疗中心',
    presa: '新闻',
    contact: '联系我们',
  },
}

export function getFooterTranslations(lang: LangCode): FooterTranslations {
  return translations[lang] ?? translations.ro
}
