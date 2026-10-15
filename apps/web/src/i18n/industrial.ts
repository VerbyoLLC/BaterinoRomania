import type { LangCode } from './menu'

export type IndustrialTranslations = {
  // Hero
  heroTitle: string
  heroTagline: string
  // Nav labels
  navStocare: string
  navSisteme: string
  navAplicatii: string
  // Section 1 – Stocare
  sectionStocareTitle: string
  sectionStocareDesc: string
  introP1: string
  introP2: string
  ctaSuport: string
  // Feature cards (6)
  cardProiectare: string
  cardInstalare: string
  cardSolutii: string
  cardMentenanta: string
  cardSuport: string
  cardTestare: string
  // Section 2 – Sisteme (9 products)
  sectionSistemeTitle: string
  product1Name: string; product1Spec: string
  product2Name: string; product2Spec: string
  product3Name: string; product3Spec: string
  product4Name: string; product4Spec: string
  product5Name: string; product5Spec: string
  product6Name: string; product6Spec: string
  product7Name: string; product7Spec: string
  product8Name: string; product8Spec: string
  product9Name: string; product9Spec: string
  // Section 3 – Aplicații
  sectionAplicatiiTitle: string
  sectionAplicatiiDesc: string
  aplicatiiFabrici: string
  aplicatiiSolare: string
  aplicatiiDate: string
  aplicatiiAeroporturi: string
  aplicatiiLogistica: string
  aplicatiiHoteluri: string
  // CTA
  ctaTitle: string
  ctaDesc: string
  ctaButton: string
}

const translations: Record<LangCode, IndustrialTranslations> = {
  ro: {
    heroTitle: 'Stocare energie sector industrial',
    heroTagline: 'Soluții de stocare a energiei pentru optimizarea consumului, medii industriale complexe și continuitate operațională',
    navStocare: 'Stocare',
    navSisteme: 'Sisteme',
    navAplicatii: 'Aplicații',
    sectionStocareTitle: 'Stocare energetică pentru fabrici, ferme solare și centre comerciale',
    sectionStocareDesc: 'Sistemele noastre industriale de stocare High Voltage pot fi integrate în proiecte unde este necesară independența energetică, reducerea costurilor și continuitatea operațională.',
    introP1: 'Baterino PRO este divizia noastră dedicată soluțiilor de stocare a energiei pentru aplicații industriale, comerciale și infrastructură critică. Proiectăm și integrăm sisteme High Voltage dimensionate conform profilului de consum, cerințelor operaționale și obiectivelor de eficiență energetică ale fiecărui proiect.',
    introP2: 'Implementăm soluții pentru optimizarea vârfurilor de sarcină (peak shaving), integrarea cu sisteme fotovoltaice industriale, continuitatea alimentării și dezvoltarea de micro-griduri. Asigurăm distribuție, instalare, service și suport tehnic în România, oferind infrastructură energetică stabilă, scalabilă și adaptată mediului industrial.',
    ctaSuport: 'Suport complet\nDe la proiectare la mentenanță',
    cardProiectare: 'Proiectare tehnică',
    cardInstalare: 'Instalare și punere în funcțiune',
    cardSolutii: 'Soluții personalizate',
    cardMentenanta: 'Mentenanță preventivă',
    cardSuport: 'Suport tehnic dedicat',
    cardTestare: 'Testare și verificare',
    sectionSistemeTitle: 'Sisteme de stocare LiFePO4 high voltage industriale',
    product1Name: 'BESS', product1Spec: '60 kWh',
    product2Name: 'BESS', product2Spec: '100 kWh',
    product3Name: 'BESS', product3Spec: '100 – 750 kWh',
    product4Name: 'BESS 3 Faze + Paralel', product4Spec: 'Modular 50–250 kWh / string',
    product5Name: 'BESS', product5Spec: '201 kWh – 2 MWh',
    product6Name: 'BESS – Răcire Lichidă / Aer – HV', product6Spec: '215 kWh – 261 kWh',
    product7Name: '10HC Container – HV', product7Spec: '645 kWh – Aer / Lichid',
    product8Name: '20ft Container', product8Spec: 'Răcire cu Aer sau Lichid',
    product9Name: '40ft BESS Container', product9Spec: '',
    sectionAplicatiiTitle: 'Aplicații reale ale sistemelor Baterino',
    sectionAplicatiiDesc: 'Sistemele noastre industriale sunt integrate în proiecte din sectoare critice, unde fiabilitatea și scalabilitatea fac diferența.',
    aplicatiiFabrici: 'Fabrici și manufacturi',
    aplicatiiSolare: 'Ferme de panouri solare',
    aplicatiiDate: 'Centre de date',
    aplicatiiAeroporturi: 'Aeroporturi',
    aplicatiiLogistica: 'Centre logistică',
    aplicatiiHoteluri: 'Hoteluri & resorturi',
    ctaTitle: 'Discutați cu echipa noastră',
    ctaDesc: 'Reduceți costurile operaționale și asigurați continuitatea energetică cu o soluție scalabilă pentru industria dumneavoastră.',
    ctaButton: 'SOLICITĂ EVALUARE TEHNICĂ',
  },
  en: {
    heroTitle: 'Energy storage – industrial sector',
    heroTagline: 'Energy storage solutions for consumption optimization, complex industrial environments and operational continuity',
    navStocare: 'Storage',
    navSisteme: 'Systems',
    navAplicatii: 'Applications',
    sectionStocareTitle: 'Energy storage for factories, solar farms and commercial centres',
    sectionStocareDesc: 'Our industrial High Voltage BESS systems can be integrated into projects requiring energy independence, cost reduction and operational continuity.',
    introP1: 'Baterino PRO is our division dedicated to energy storage solutions for industrial, commercial and critical infrastructure applications. We design and integrate High Voltage systems sized to the consumption profile, operational requirements and energy efficiency targets of each project.',
    introP2: 'We implement solutions for peak load optimisation (peak shaving), integration with industrial photovoltaic systems, supply continuity and micro-grid development. We provide distribution, installation, service and technical support in Romania, offering stable, scalable energy infrastructure adapted to the industrial environment.',
    ctaSuport: 'Full support\nFrom design to maintenance',
    cardProiectare: 'Technical design',
    cardInstalare: 'Installation & commissioning',
    cardSolutii: 'Custom solutions',
    cardMentenanta: 'Preventive maintenance',
    cardSuport: 'Dedicated technical support',
    cardTestare: 'Testing & verification',
    sectionSistemeTitle: 'LiFePO4 high voltage industrial storage systems',
    product1Name: 'BESS', product1Spec: '60 kWh',
    product2Name: 'BESS', product2Spec: '100 kWh',
    product3Name: 'BESS', product3Spec: '100 – 750 kWh',
    product4Name: 'BESS 3-Phase + Parallel', product4Spec: 'Modular 50–250 kWh / string',
    product5Name: 'BESS', product5Spec: '201 kWh – 2 MWh',
    product6Name: 'BESS – Liquid / Air Cooling – HV', product6Spec: '215 kWh – 261 kWh',
    product7Name: '10HC Container – HV', product7Spec: '645 kWh – Air / Liquid',
    product8Name: '20ft Container', product8Spec: 'Air or Liquid Cooling',
    product9Name: '40ft BESS Container', product9Spec: '',
    sectionAplicatiiTitle: 'Real applications of Baterino systems',
    sectionAplicatiiDesc: 'Our industrial systems are integrated into projects across critical sectors where reliability and scalability make the difference.',
    aplicatiiFabrici: 'Factories & manufacturing',
    aplicatiiSolare: 'Solar panel farms',
    aplicatiiDate: 'Data centres',
    aplicatiiAeroporturi: 'Airports',
    aplicatiiLogistica: 'Logistics centres',
    aplicatiiHoteluri: 'Hotels & resorts',
    ctaTitle: 'Talk to our team',
    ctaDesc: 'Reduce operational costs and ensure energy continuity with a scalable solution for your industry.',
    ctaButton: 'REQUEST TECHNICAL ASSESSMENT',
  },
}

export function getIndustrialTranslations(lang: LangCode): IndustrialTranslations {
  return translations[lang] ?? translations.ro
}
