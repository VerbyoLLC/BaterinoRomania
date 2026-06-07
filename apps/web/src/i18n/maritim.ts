import type { LangCode } from './menu'

export type MaritimTranslations = {
  // Hero
  heroTitle: string
  heroTagline: string
  // Nav labels
  navStocare: string
  navProduse: string
  navAplicatii: string
  // Section 1 – Stocare
  sectionStocareTitle: string
  introP1: string
  introP2: string
  examplesTitle: string
  introExamples: string
  ctaSuport: string
  // Feature cards (5)
  cardGarantie: string
  cardProiectare: string
  cardSolutii: string
  cardInstalare: string
  cardService: string
  // Section 2 – Produse
  sectionProduseTitle: string
  product1Category: string
  product1Name: string
  product1Spec: string
  detailsButton: string
  // Section 3 – Aplicații
  sectionAplicatiiTitle: string
  sectionAplicatiiDesc: string
  aplicatiiRemorcher: string
  aplicatiiFerry: string
  aplicatiiRoPax: string
  aplicatiiOffshore: string
  aplicatiiCargo: string
  aplicatiiPescuit: string
  // CTA
  ctaTitle: string
  ctaDesc: string
  ctaButton: string
}

const translations: Record<LangCode, MaritimTranslations> = {
  ro: {
    heroTitle: 'STOCARE ENERGIE SECTOR MARITIM',
    heroTagline: 'Implementăm soluții energetice pentru ambarcațiuni, nave comerciale și infrastructuri portuare',
    navStocare: 'Stocare',
    navProduse: 'Produse',
    navAplicatii: 'Aplicații',
    sectionStocareTitle: 'STOCARE ENERGETICĂ PENTRU MEDIUL MARITIM',
    introP1:
      'Baterino At Sea este divizia noastră dedicată aplicațiilor maritime, cu **echipă specializată în integrarea sistemelor de stocare a energiei pentru flota navală sau infrastructura portuară din România.** Suntem singurul distribuitor cu structură dedicată exclusiv sectorului naval.',
    introP2:
      'Implementăm **sisteme Full-Electric sau Hibride (Battery + Generator) pentru propulsie navală, autonomie la bord, reducerea consumului de combustibil și integrare în infrastructura portuară.**',
    examplesTitle: 'Exemple:',
    introExamples:
      'Remorcher (Tugboat): 100–300 kWh pentru operare autonomă și propulsie hibridă\nNave de pescuit: 60–200 kWh pentru autonomie extinsă și reducerea emisiilor\nFerry Boat / Ro-Pax: 500 kWh – 2 MWh pentru propulsie electrică sau hibridă pe rute scurte',
    ctaSuport: 'Suport complet, de la proiectare la mentenanță',
    cardGarantie: 'Garanție extinsă\n10 ani',
    cardProiectare: 'Proiectare tehnică dedicată',
    cardSolutii: 'Soluții\npersonalizate',
    cardInstalare: 'Instalare realizată de Baterino',
    cardService: 'Service și suport\nîn România',
    sectionProduseTitle: 'PRODUSE RECOMANDATE',
    product1Category: 'MARITIME HV SERIES',
    product1Name: 'White Shark Series',
    product1Spec: 'LFP HV MED: LWS-1-230\n17.600 Ah – 570.101.600 Wh',
    detailsButton: 'Detalii tehnice',
    sectionAplicatiiTitle: 'APLICAȚII MARITIME',
    sectionAplicatiiDesc: 'Soluții de stocare pentru autonomie mai eficientă la bord.',
    aplicatiiRemorcher: 'REMORCHER',
    aplicatiiFerry: 'FERRY BOAT',
    aplicatiiRoPax: 'NAVA RO-PAX',
    aplicatiiOffshore: 'SUPORT OFFSHORE / PSV',
    aplicatiiCargo: 'NAVA CARGO',
    aplicatiiPescuit: 'NAVE DE PESCUIT',
    ctaTitle: 'Discutați cu echipa noastră',
    ctaDesc: 'Evaluăm și dimensionăm soluții de stocare a energiei adaptate specificului fiecărei nave și operațiuni maritime.',
    ctaButton: 'SOLICITĂ EVALUARE TEHNICĂ',
  },
  en: {
    heroTitle: 'ENERGY STORAGE – MARITIME SECTOR',
    heroTagline: 'We implement energy solutions for vessels, commercial ships and port infrastructure',
    navStocare: 'Storage',
    navProduse: 'Products',
    navAplicatii: 'Applications',
    sectionStocareTitle: 'ENERGY STORAGE FOR THE MARITIME ENVIRONMENT',
    introP1:
      'Baterino At Sea is our division dedicated to maritime applications, with a **team specialised in integrating energy storage systems for naval fleets and port infrastructure in Romania.** We are the only distributor with a structure dedicated exclusively to the maritime sector.',
    introP2:
      'We implement **Full-Electric or Hybrid (Battery + Generator) systems for naval propulsion, on-board autonomy, fuel consumption reduction and integration into port infrastructure.**',
    examplesTitle: 'Examples:',
    introExamples:
      'Tugboat: 100–300 kWh for autonomous operation and hybrid propulsion\nFishing vessels: 60–200 kWh for extended autonomy and emission reduction\nFerry Boat / Ro-Pax: 500 kWh – 2 MWh for electric or hybrid propulsion on short routes',
    ctaSuport: 'Full support, from design to maintenance',
    cardGarantie: 'Extended\n10-year warranty',
    cardProiectare: 'Dedicated technical design',
    cardSolutii: 'Custom\nsolutions',
    cardInstalare: 'Installation by Baterino',
    cardService: 'Service & support\nin Romania',
    sectionProduseTitle: 'RECOMMENDED PRODUCTS',
    product1Category: 'MARITIME HV SERIES',
    product1Name: 'White Shark Series',
    product1Spec: 'LFP HV MED: LWS-1-230\n17,600 Ah – 570,101,600 Wh',
    detailsButton: 'Technical details',
    sectionAplicatiiTitle: 'MARITIME APPLICATIONS',
    sectionAplicatiiDesc: 'Storage solutions for more efficient autonomy on board.',
    aplicatiiRemorcher: 'TUGBOAT',
    aplicatiiFerry: 'FERRY BOAT',
    aplicatiiRoPax: 'RO-PAX VESSEL',
    aplicatiiOffshore: 'OFFSHORE SUPPORT / PSV',
    aplicatiiCargo: 'CARGO VESSEL',
    aplicatiiPescuit: 'FISHING VESSELS',
    ctaTitle: 'Talk to our team',
    ctaDesc: 'We evaluate and size energy storage solutions tailored to the specifics of each vessel and maritime operation.',
    ctaButton: 'REQUEST TECHNICAL ASSESSMENT',
  },
}

export function getMaritimTranslations(lang: LangCode): MaritimTranslations {
  return translations[lang] ?? translations.ro
}
