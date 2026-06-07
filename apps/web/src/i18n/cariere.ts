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
}

export function getCariereTranslations(lang: LangCode): CariereTranslations {
  return translations[lang] ?? translations.ro
}
