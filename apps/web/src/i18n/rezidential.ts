import type { LangCode } from './menu'

export type RezidentialTranslations = {
  // Hero
  heroSupratitlu: string
  heroTitle: string
  heroTagline: string
  // Intro
  introP1: string
  introP2: string
  // Section nav labels
  navStocare: string
  navAplicatii: string
  navAnsambluri: string
  navSisteme: string
  // Section 1 – Stocare
  sectionStocareTitle: string
  sectionStocareDesc: string
  // Section 2 – Aplicații (products)
  sectionAplicatiiTitle: string
  productTRX: string
  productTRXSpec: string
  productHV: string
  productHVSpec: string
  productDesc: string
  productImagePlaceholder: string
  // Section 3 – Ansambluri
  sectionAnsambluriTitle: string
  ansambluriRezidential: string
  ansambluriHoteluri: string
  ansambluriCentre: string
  ansambluriLocuinte: string
  ansambluriFerme: string
  ansambluriStatiuni: string
  ansambluriCladiri: string
  ansambluriZone: string
  // Section 4 – Sisteme
  sectionSistemeTitle: string
  productTA6000: string
  productTA6000Spec: string
  // CTA
  ctaTitle: string
  ctaDesc: string
  ctaSuport: string
  ctaRetur: string
  ctaCompatibilitate: string
  ctaGarantie: string
  ctaVerificat: string
  ctaSuportService: string
  ctaButton: string
  discutaCuNoi: string
  // Feature card labels (short)
  cardGarantie: string
  cardCompatibilitate: string
  cardVerificat: string
  cardRetur: string
  cardSwap: string
  cardService: string
}

const translations: Record<LangCode, RezidentialTranslations> = {
  ro: {
    heroSupratitlu: 'DIVIZIA',
    heroTitle: 'STOCARE ENERGIE SECTOR REZIDENȚIAL',
    heroTagline:
      'De la sisteme Low Voltage pentru case individuale până la soluții High Voltage pentru micro-griduri rezidențiale integrate',
    introP1:
      'În sectorul rezidențial, punem pe primul loc siguranța clientului final. Oferim soluții de stocare a energiei testate și verificate, integrate în sisteme fotovoltaice sau utilizate independent, pentru a asigura continuitatea alimentării și optimizarea consumului.',
    introP2:
      'Ne diferențiem prin suport tehnic dedicat și servicii after-sales competitive, asigurând garanție extinsă, service local și asistență pe termen lung. Fiecare producător pe care îl facilităm în piață este atent evaluat și verificat tehnic, astfel încât clienții noștri să beneficieze de echipamente sigure, fiabile și conforme standardelor de calitate.',
    navStocare: 'Stocare',
    navAplicatii: 'Aplicații',
    navAnsambluri: 'Ansambluri',
    navSisteme: 'Sisteme',
    sectionStocareTitle: 'STOCARE ENERGETICĂ PENTRU LOCUINȚE ȘI MICRO-GRIDURI',
    sectionStocareDesc:
      'Sistemele noastre de stocare rezidențiale și soluțiile High Voltage pot fi integrate în proiecte unde este necesară independența energetică, optimizarea consumului și continuitatea alimentării.',
    sectionAplicatiiTitle: 'APLICAȚII REALE ALE SISTEMELOR BATERINO',
    productTRX: 'TRX Series LiFePo4 LV',
    productTRXSpec: '5 kWh – 16 kW · Stackable',
    productHV: 'LiFePo4 High Voltage',
    productHVSpec: '20,48 kWh – 40,96 kWh',
    productDesc:
      'Sistemele noastre de stocare rezidențiale și soluțiile High Voltage pot fi integrate în proiecte unde este necesară independența energetică, optimizarea consumului și continuitatea alimentării.',
    productImagePlaceholder: 'Imagine produs',
    sectionAnsambluriTitle: 'APLICAȚII REALE ALE SISTEMELOR BATERINO',
    ansambluriRezidential: 'ANSAMBLURI REZIDENȚIALE',
    ansambluriHoteluri: 'HOTELURI ȘI PENSIUNI',
    ansambluriCentre: 'CENTRE COMERCIALE',
    ansambluriLocuinte: 'LOCUINȚE INDIVIDUALE',
    ansambluriFerme: 'FERME AGRICOLE',
    ansambluriStatiuni: 'STAȚIUNI METEOROLOGICE',
    ansambluriCladiri: 'CLĂDIRI DE BIROURI',
    ansambluriZone: 'ZONE GREU ACCESIBILE',
    sectionSistemeTitle: 'SISTEME DE STOCARE LiFePo4 LOW VOLTAGE ȘI HIGH VOLTAGE',
    productTA6000: 'TA6000 LiFePo4 LV',
    productTA6000Spec: '5,12 kWh – 20,48 kWh',
    ctaTitle: 'Discutați cu echipa noastră',
    ctaDesc:
      'Reduceți dependența de rețea și optimizați consumul cu o soluție adaptată locuinței dumneavoastră.',
    ctaSuport: 'Suport și siguranță',
    ctaRetur: 'Retur în 15 zile · SWAP – Baterie la schimb',
    ctaCompatibilitate: 'Compatibilitate 99% Invertoare',
    ctaGarantie: 'Garanție timp de 10 ani · Producători verificați',
    ctaVerificat: 'Echipamente verificate tehnic',
    ctaSuportService: 'Suport & Service în România',
    ctaButton: 'SOLICITĂ EVALUARE TEHNICĂ',
    discutaCuNoi: 'DISCUTĂ CU NOI',
    cardGarantie: 'Garantie timp de 10 ani',
    cardCompatibilitate: 'Compatibilitate 99% Invertoare',
    cardVerificat: 'Producatori verificati',
    cardRetur: 'Retur in 15 zile',
    cardSwap: 'SWAP - Baterie la schimb',
    cardService: 'Suport & Service in Romania',
  },
  en: {
    heroSupratitlu: 'DIVISION',
    heroTitle: 'ENERGY STORAGE – RESIDENTIAL SECTOR',
    heroTagline:
      'From Low Voltage systems for individual homes to High Voltage solutions for integrated residential micro-grids',
    introP1:
      'In the residential sector, we put end-customer safety first. We offer tested and verified energy storage solutions, integrated into photovoltaic systems or used independently, to ensure supply continuity and consumption optimization.',
    introP2:
      'We differentiate ourselves through dedicated technical support and competitive after-sales services, providing extended warranty, local service and long-term assistance. Every manufacturer we facilitate on the market is carefully evaluated and technically verified, so our customers benefit from safe, reliable equipment that meets quality standards.',
    navStocare: 'Storage',
    navAplicatii: 'Applications',
    navAnsambluri: 'Assemblies',
    navSisteme: 'Systems',
    sectionStocareTitle: 'ENERGY STORAGE FOR HOMES AND MICRO-GRIDS',
    sectionStocareDesc:
      'Our residential storage systems and High Voltage solutions can be integrated into projects where energy independence, consumption optimization and supply continuity are required.',
    sectionAplicatiiTitle: 'REAL APPLICATIONS OF BATERINO SYSTEMS',
    productTRX: 'TRX Series LiFePo4 LV',
    productTRXSpec: '5 kWh – 16 kW · Stackable',
    productHV: 'LiFePo4 High Voltage',
    productHVSpec: '20.48 kWh – 40.96 kWh',
    productDesc:
      'Our residential storage systems and High Voltage solutions can be integrated into projects where energy independence, consumption optimization and supply continuity are required.',
    productImagePlaceholder: 'Product image',
    sectionAnsambluriTitle: 'REAL APPLICATIONS OF BATERINO SYSTEMS',
    ansambluriRezidential: 'RESIDENTIAL ASSEMBLIES',
    ansambluriHoteluri: 'HOTELS AND GUEST HOUSES',
    ansambluriCentre: 'SHOPPING CENTRES',
    ansambluriLocuinte: 'INDIVIDUAL HOMES',
    ansambluriFerme: 'AGRICULTURAL FARMS',
    ansambluriStatiuni: 'WEATHER STATIONS',
    ansambluriCladiri: 'OFFICE BUILDINGS',
    ansambluriZone: 'HARD-TO-ACCESS AREAS',
    sectionSistemeTitle: 'LiFePo4 LOW VOLTAGE AND HIGH VOLTAGE STORAGE SYSTEMS',
    productTA6000: 'TA6000 LiFePo4 LV',
    productTA6000Spec: '5.12 kWh – 20.48 kWh',
    ctaTitle: 'Talk to our team',
    ctaDesc: 'Reduce grid dependency and optimize consumption with a solution tailored to your home.',
    ctaSuport: 'Support and safety',
    ctaRetur: '15-day return · SWAP – Battery exchange',
    ctaCompatibilitate: '99% Inverter compatibility',
    ctaGarantie: '10-year warranty · Verified manufacturers',
    ctaVerificat: 'Technically verified equipment',
    ctaSuportService: 'Support & Service in Romania',
    ctaButton: 'REQUEST TECHNICAL ASSESSMENT',
    discutaCuNoi: 'TALK TO US',
    cardGarantie: '10-year warranty',
    cardCompatibilitate: '99% Inverter compatibility',
    cardVerificat: 'Verified manufacturers',
    cardRetur: '15-day return',
    cardSwap: 'SWAP – Battery exchange',
    cardService: 'Support & Service in Romania',
  },
}

export function getRezidentialTranslations(lang: LangCode): RezidentialTranslations {
  return translations[lang] ?? translations.ro
}
