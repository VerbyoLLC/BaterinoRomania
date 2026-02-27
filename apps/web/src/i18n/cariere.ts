import type { LangCode } from './menu'

export type CariereTranslations = {
  seoTitle: string
  seoDesc: string
  heroTitle: string
  heroDesc: string
  searchTitle: string
  searchSubtitle: string
  departament: string
  judet: string
  oras: string
  searchButton: string
  resultsTitle: string
  noResultsMessage: string
  cvEmail: string
  teamFullTitle: string
  teamFullMessage: string
}

const translations: Record<LangCode, CariereTranslations> = {
  ro: {
    seoTitle: 'Cariere – Baterino România',
    seoDesc: 'Vino să lucrezi cu noi. Caută job-uri pe platforma Baterino.',
    heroTitle: 'VINO SĂ LUCREZI CU NOI',
    heroDesc: 'Punem accent pe inițiativă și responsabilitate individuală. Suntem o echipă mică, dar eficientă, și ne dorim să rămânem agili și orientați spre performanță.',
    searchTitle: 'CAUTĂ JOB-URI PE PLATFORMĂ',
    searchSubtitle: 'Selectează după Departament, Județ și Oraș',
    departament: 'Departament',
    judet: 'Județ',
    oras: 'Oraș',
    searchButton: 'Caută',
    resultsTitle: 'Rezultate Căutare',
    noResultsMessage: 'Ne pare rău, însă nu există nici o poziție disponibilă în orașul selectat. Dacă crezi totuși că poți aduce plus valoare echipei Baterino, trimite-ne CV-ul tău pe adresa:',
    cvEmail: 'cariera@baterino.ro',
    teamFullTitle: 'În acest moment Echipa Baterino este completă.',
    teamFullMessage: 'În acest moment, echipa Baterino este completă și nu avem poziții deschise.\n\nDacă totuși consideri că profilul tău se potrivește cu viziunea noastră, ne poți trimite CV-ul la cariera@baterino.ro.\n\nCu energie,\nEchipa Baterino',
  },
  en: {
    seoTitle: 'Careers – Baterino Romania',
    seoDesc: 'Come work with us. Search for jobs on the Baterino platform.',
    heroTitle: 'COME WORK WITH US',
    heroDesc: 'We emphasize initiative and individual responsibility. We are a small but efficient team, and we want to remain agile and performance-oriented.',
    searchTitle: 'SEARCH JOBS ON THE PLATFORM',
    searchSubtitle: 'Select by Department, County and City',
    departament: 'Department',
    judet: 'County',
    oras: 'City',
    searchButton: 'Search',
    resultsTitle: 'Search Results',
    noResultsMessage: 'We are sorry, but there are no positions available in the selected city. If you believe you can add value to the Baterino team, send your CV to:',
    cvEmail: 'cariera@baterino.ro',
    teamFullTitle: 'The Baterino team is currently complete.',
    teamFullMessage: 'At this time, the Baterino team is complete and we have no open positions.\n\nIf you believe your profile fits our vision, you can send your CV to cariera@baterino.ro.\n\nWith energy,\nThe Baterino Team',
  },
  zh: {
    seoTitle: '招聘 – Baterino 罗马尼亚',
    seoDesc: '加入我们。在Baterino平台搜索职位。',
    heroTitle: '加入我们',
    heroDesc: '我们强调主动性和个人责任。我们是一个小而高效的团队，希望保持敏捷和以绩效为导向。',
    searchTitle: '在平台上搜索职位',
    searchSubtitle: '按部门、县和城市选择',
    departament: '部门',
    judet: '县',
    oras: '城市',
    searchButton: '搜索',
    resultsTitle: '搜索结果',
    noResultsMessage: '抱歉，所选城市中没有职位。如果您认为可以为Baterino团队带来价值，请将简历发送至：',
    cvEmail: 'cariera@baterino.ro',
    teamFullTitle: 'Baterino团队目前已满员。',
    teamFullMessage: '目前，Baterino团队已满员，暂无空缺职位。\n\n如果您认为您的资历符合我们的愿景，可将简历发送至 cariera@baterino.ro。\n\n此致\nBaterino团队',
  },
}

export function getCariereTranslations(lang: LangCode): CariereTranslations {
  return translations[lang] ?? translations.ro
}
