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
    heroTitle: 'STOCARE ENERGIE SECTOR INDUSTRIAL',
    heroTagline: 'Soluții de stocare a energiei pentru optimizarea consumului, medii industriale complexe și continuitate operațională',
    navStocare: 'Stocare',
    navSisteme: 'Sisteme',
    navAplicatii: 'Aplicații',
    sectionStocareTitle: 'STOCARE ENERGETICĂ PENTRU FABRICI, FERME SOLARE ȘI CENTRE COMERCIALE',
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
    sectionSistemeTitle: 'SISTEME DE STOCARE LiFePo4 HIGH VOLTAGE INDUSTRIALE',
    product1Name: 'BESS', product1Spec: '60 kWh',
    product2Name: 'BESS', product2Spec: '100 kWh',
    product3Name: 'BESS', product3Spec: '100 – 750 kWh',
    product4Name: 'BESS 3 Faze + Paralel', product4Spec: 'Modular 50–250 kWh / string',
    product5Name: 'BESS', product5Spec: '201 kWh – 2 MWh',
    product6Name: 'BESS – Răcire Lichidă / Aer – HV', product6Spec: '215 kWh – 261 kWh',
    product7Name: '10HC Container – HV', product7Spec: '645 kWh – Aer / Lichid',
    product8Name: '20ft Container', product8Spec: 'Răcire cu Aer sau Lichid',
    product9Name: '40ft BESS Container', product9Spec: '',
    sectionAplicatiiTitle: 'APLICAȚII REALE ALE SISTEMELOR BATERINO',
    sectionAplicatiiDesc: 'Sistemele noastre industriale sunt integrate în proiecte din sectoare critice, unde fiabilitatea și scalabilitatea fac diferența.',
    aplicatiiFabrici: 'FABRICI ȘI MANUFACTURI',
    aplicatiiSolare: 'FERME DE PANOURI SOLARE',
    aplicatiiDate: 'CENTRE DE DATE',
    aplicatiiAeroporturi: 'AEROPORTURI',
    aplicatiiLogistica: 'CENTRE LOGISTICĂ',
    aplicatiiHoteluri: 'HOTELURI & RESORTURI',
    ctaTitle: 'Discutați cu echipa noastră',
    ctaDesc: 'Reduceți costurile operaționale și asigurați continuitatea energetică cu o soluție scalabilă pentru industria dumneavoastră.',
    ctaButton: 'SOLICITĂ EVALUARE TEHNICĂ',
  },
  en: {
    heroTitle: 'ENERGY STORAGE – INDUSTRIAL SECTOR',
    heroTagline: 'Energy storage solutions for consumption optimization, complex industrial environments and operational continuity',
    navStocare: 'Storage',
    navSisteme: 'Systems',
    navAplicatii: 'Applications',
    sectionStocareTitle: 'ENERGY STORAGE FOR FACTORIES, SOLAR FARMS AND COMMERCIAL CENTRES',
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
    sectionSistemeTitle: 'LiFePo4 HIGH VOLTAGE INDUSTRIAL STORAGE SYSTEMS',
    product1Name: 'BESS', product1Spec: '60 kWh',
    product2Name: 'BESS', product2Spec: '100 kWh',
    product3Name: 'BESS', product3Spec: '100 – 750 kWh',
    product4Name: 'BESS 3-Phase + Parallel', product4Spec: 'Modular 50–250 kWh / string',
    product5Name: 'BESS', product5Spec: '201 kWh – 2 MWh',
    product6Name: 'BESS – Liquid / Air Cooling – HV', product6Spec: '215 kWh – 261 kWh',
    product7Name: '10HC Container – HV', product7Spec: '645 kWh – Air / Liquid',
    product8Name: '20ft Container', product8Spec: 'Air or Liquid Cooling',
    product9Name: '40ft BESS Container', product9Spec: '',
    sectionAplicatiiTitle: 'REAL APPLICATIONS OF BATERINO SYSTEMS',
    sectionAplicatiiDesc: 'Our industrial systems are integrated into projects across critical sectors where reliability and scalability make the difference.',
    aplicatiiFabrici: 'FACTORIES & MANUFACTURING',
    aplicatiiSolare: 'SOLAR PANEL FARMS',
    aplicatiiDate: 'DATA CENTRES',
    aplicatiiAeroporturi: 'AIRPORTS',
    aplicatiiLogistica: 'LOGISTICS CENTRES',
    aplicatiiHoteluri: 'HOTELS & RESORTS',
    ctaTitle: 'Talk to our team',
    ctaDesc: 'Reduce operational costs and ensure energy continuity with a scalable solution for your industry.',
    ctaButton: 'REQUEST TECHNICAL ASSESSMENT',
  },
  zh: {
    heroTitle: '工业领域储能',
    heroTagline: '用于用电优化、复杂工业环境和连续运营的储能解决方案',
    navStocare: '储能',
    navSisteme: '系统',
    navAplicatii: '应用',
    sectionStocareTitle: '工厂、光伏农场与商业中心储能',
    sectionStocareDesc: '我们的工业高压BESS系统可集成到需要能源独立、降低成本和保障运营连续性的项目中。',
    introP1: 'Baterino PRO是我们专注于工业、商业和关键基础设施储能解决方案的部门。我们根据每个项目的用电特征、运营需求和能效目标，设计并集成高压系统。',
    introP2: '我们实施峰值负荷优化（削峰）、工业光伏系统集成、供电连续性和微电网开发解决方案。我们在罗马尼亚提供分销、安装、服务和技术支持，提供稳定、可扩展且适应工业环境的能源基础设施。',
    ctaSuport: '全面支持\n从设计到维护',
    cardProiectare: '技术设计',
    cardInstalare: '安装与调试',
    cardSolutii: '定制解决方案',
    cardMentenanta: '预防性维护',
    cardSuport: '专属技术支持',
    cardTestare: '测试与验证',
    sectionSistemeTitle: 'LiFePo4高压工业储能系统',
    product1Name: 'BESS', product1Spec: '60 kWh',
    product2Name: 'BESS', product2Spec: '100 kWh',
    product3Name: 'BESS', product3Spec: '100 – 750 kWh',
    product4Name: 'BESS 三相 + 并联', product4Spec: '模块化 50–250 kWh / 串',
    product5Name: 'BESS', product5Spec: '201 kWh – 2 MWh',
    product6Name: 'BESS – 液冷 / 风冷 – HV', product6Spec: '215 kWh – 261 kWh',
    product7Name: '10HC 集装箱 – HV', product7Spec: '645 kWh – 风冷 / 液冷',
    product8Name: '20ft 集装箱', product8Spec: '风冷或液冷',
    product9Name: '40ft BESS 集装箱', product9Spec: '',
    sectionAplicatiiTitle: 'BATERINO系统的实际应用',
    sectionAplicatiiDesc: '我们的工业系统集成于关键行业的项目中，可靠性和可扩展性是其核心优势。',
    aplicatiiFabrici: '工厂与制造业',
    aplicatiiSolare: '光伏农场',
    aplicatiiDate: '数据中心',
    aplicatiiAeroporturi: '机场',
    aplicatiiLogistica: '物流中心',
    aplicatiiHoteluri: '酒店与度假村',
    ctaTitle: '与我们的团队沟通',
    ctaDesc: '通过适合您行业的可扩展解决方案降低运营成本并确保能源连续性。',
    ctaButton: '申请技术评估',
  },
}

export function getIndustrialTranslations(lang: LangCode): IndustrialTranslations {
  return translations[lang] ?? translations.ro
}
