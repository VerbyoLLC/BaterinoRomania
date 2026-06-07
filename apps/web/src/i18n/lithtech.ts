import type { LangCode } from './menu'

export type LithTechTranslations = {
  // Page supertitle
  supertitle: string
  // Section A – Partnership intro
  sectionALeftBrand: string
  sectionALeftTitle: string
  sectionARightBrand: string
  sectionARightTitle: string
  // Section B – Technology
  sectionBLeftTitle: string
  tech1Title: string; tech1Desc: string
  tech2Title: string; tech2Desc: string
  tech3Title: string; tech3Desc: string
  sectionBRightTitle: string
  impl1Title: string; impl1Desc: string
  impl2Title: string; impl2Desc: string
  impl3Title: string; impl3Desc: string
  // Section C – Safety images
  sectionCLeftBrand: string
  sectionCLeftTitle: string
  sectionCRightBrand: string
  sectionCRightTitle: string
  // Section D – Control & Support
  sectionDLeftTitle: string
  ctrl1Title: string; ctrl1Desc: string
  ctrl2Title: string; ctrl2Desc: string
  ctrl3Title: string; ctrl3Desc: string
  sectionDRightTitle: string
  suport1Title: string; suport1Desc: string
  suport2Title: string; suport2Desc: string
  suport3Title: string; suport3Desc: string
  // CTA
  ctaTitle: string
  ctaDesc: string
  ctaBtn1: string
  ctaBtn2: string
  loadMore: string
}

const translations: Record<LangCode, LithTechTranslations> = {
  ro: {
    supertitle: 'IMPORTATOR ȘI PARTENER STRATEGIC CU LITHTECH',
    sectionALeftBrand: 'LITHTECH',
    sectionALeftTitle: 'PRODUCE TEHNOLOGIA',
    sectionARightBrand: 'BATERINO',
    sectionARightTitle: 'O IMPLEMENTEAZĂ',
    sectionBLeftTitle: 'TEHNOLOGIE DE STOCARE',
    tech1Title: 'Baterie de înaltă performanță',
    tech1Desc: 'Lithtech furnizează baterii litiu avansate, cu densitate energetică ridicată, durată lungă de viață (număr mare de cicluri) și optimizare inteligentă prin sistem BMS.',
    tech2Title: 'Baterie solid-state',
    tech2Desc: 'Dezvoltă baterii solid-state de nouă generație, cu siguranță superioară și stabilitate termică îmbunătățită, pentru sistemele energetice ale viitorului.',
    tech3Title: 'Celulă de combustibil cu hidrogen',
    tech3Desc: 'Explorează soluții bazate pe celule de combustibil cu hidrogen pentru a oferi o energie curată și eficientă, destinată aplicațiilor portabile și soluțiilor de back-up.',
    sectionBRightTitle: 'IMPLEMENTARE ȘI INFRASTRUCTURĂ',
    impl1Title: 'Distribuție și logistică națională',
    impl1Desc: 'Asigurăm importul, stocarea și livrarea rapidă prin depozite poziționate strategic în România, către instalatori și distribuitori.',
    impl2Title: 'Integrare și compatibilitate sisteme',
    impl2Desc: 'Configurăm și validăm compatibilitatea bateriilor cu invertoarele și sistemele existente.',
    impl3Title: 'Implementare proiecte energetice',
    impl3Desc: 'Dezvoltăm și coordonăm proiecte rezidențiale, industriale, medicale și maritime — de la consultanță la punere în funcțiune.',
    sectionCLeftBrand: 'LITHTECH',
    sectionCLeftTitle: 'CREEAZĂ PRODUSE SIGURE',
    sectionCRightBrand: 'BATERINO',
    sectionCRightTitle: 'ÎȚI OFERĂ SIGURANȚĂ',
    sectionDLeftTitle: 'CONTROL ȘI SIGURANȚA BATERIEI',
    ctrl1Title: 'Siguranță a produsului',
    ctrl1Desc: 'Lithtech proiectează fiecare sistem cu protecție pe mai multe niveluri, pentru a asigura o funcționare stabilă și fiabilă.',
    ctrl2Title: 'EMS – Sistem de monitorizare a energiei',
    ctrl2Desc: 'Sistemul EMS al Lithtech echilibrează consumul de energie între sisteme, maximizând eficiența și performanța.',
    ctrl3Title: 'BMS – Sistem de management al bateriei',
    ctrl3Desc: 'Sistemul BMS dezvoltat de Lithtech asigură o operare sigură și eficientă, prin monitorizare în timp real și control inteligent.',
    sectionDRightTitle: 'SUPORT & RESPONSABILITATE',
    suport1Title: 'Service și mentenanță în România',
    suport1Desc: 'Avem departament propriu de diagnoză, intervenție și reparații locale.',
    suport2Title: 'Sistem SWAP – înlocuire rapidă',
    suport2Desc: 'Asigurăm continuitatea funcționalității prin înlocuirea imediată a produsului în caz de probleme sau pe toată durata în care acesta se află în service.',
    suport3Title: 'Suport tehnic și relație cu clientul final',
    suport3Desc: 'Gestionăm garanțiile, suportul 24/7 și comunicarea cu utilizatorul final, reducând riscul pentru parteneri.',
    ctaTitle: 'Discutați cu echipa noastră',
    ctaDesc: 'Prin alianțe strategice solide, asigurăm stabilitate operațională și calitate constantă în fiecare proiect livrat.',
    ctaBtn1: 'VEZI PRODUSE',
    ctaBtn2: 'DISCUTĂ CU NOI',
    loadMore: 'VEZI MAI MULT',
  },
  en: {
    supertitle: 'IMPORTER AND STRATEGIC PARTNER WITH LITHTECH',
    sectionALeftBrand: 'LITHTECH',
    sectionALeftTitle: 'PRODUCES THE TECHNOLOGY',
    sectionARightBrand: 'BATERINO',
    sectionARightTitle: 'IMPLEMENTS IT',
    sectionBLeftTitle: 'STORAGE TECHNOLOGY',
    tech1Title: 'High-performance battery',
    tech1Desc: 'Lithtech supplies advanced lithium batteries with high energy density, long service life (high cycle count) and intelligent optimisation via BMS.',
    tech2Title: 'Solid-state battery',
    tech2Desc: 'Develops next-generation solid-state batteries with superior safety and improved thermal stability for future energy systems.',
    tech3Title: 'Hydrogen fuel cell',
    tech3Desc: 'Explores hydrogen fuel-cell solutions to provide clean, efficient energy for portable applications and back-up systems.',
    sectionBRightTitle: 'IMPLEMENTATION & INFRASTRUCTURE',
    impl1Title: 'National distribution & logistics',
    impl1Desc: 'We handle import, storage and fast delivery through strategically located warehouses across Romania, to installers and distributors.',
    impl2Title: 'System integration & compatibility',
    impl2Desc: 'We configure and validate battery compatibility with existing inverters and systems.',
    impl3Title: 'Energy project implementation',
    impl3Desc: 'We develop and coordinate residential, industrial, medical and maritime projects — from consultancy to commissioning.',
    sectionCLeftBrand: 'LITHTECH',
    sectionCLeftTitle: 'CREATES SAFE PRODUCTS',
    sectionCRightBrand: 'BATERINO',
    sectionCRightTitle: 'DELIVERS SAFETY TO YOU',
    sectionDLeftTitle: 'BATTERY CONTROL & SAFETY',
    ctrl1Title: 'Product safety',
    ctrl1Desc: 'Lithtech designs every system with multi-level protection to ensure stable and reliable operation.',
    ctrl2Title: 'EMS – Energy Monitoring System',
    ctrl2Desc: 'Lithtech\'s EMS balances energy consumption across systems, maximising efficiency and performance.',
    ctrl3Title: 'BMS – Battery Management System',
    ctrl3Desc: 'Lithtech\'s BMS ensures safe and efficient operation through real-time monitoring and intelligent control.',
    sectionDRightTitle: 'SUPPORT & RESPONSIBILITY',
    suport1Title: 'Service & maintenance in Romania',
    suport1Desc: 'We have our own diagnostics, intervention and local repair department.',
    suport2Title: 'SWAP System – fast replacement',
    suport2Desc: 'We ensure operational continuity through immediate product replacement in case of issues or during the full service period.',
    suport3Title: 'Technical support & end-customer relations',
    suport3Desc: 'We manage warranties, 24/7 support and end-user communication, reducing risk for partners.',
    ctaTitle: 'Talk to our team',
    ctaDesc: 'Through solid strategic alliances, we ensure operational stability and consistent quality in every project delivered.',
    ctaBtn1: 'VIEW PRODUCTS',
    ctaBtn2: 'CONTACT US',
    loadMore: 'VIEW MORE',
  },
}

export function getLithTechTranslations(lang: LangCode): LithTechTranslations {
  return translations[lang] ?? translations.ro
}
