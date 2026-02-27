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
  zh: {
    heroSupratitlu: '事业部',
    heroTitle: '住宅领域储能',
    heroTagline: '从独栋住宅的低压系统到集成住宅微电网的高压解决方案',
    introP1:
      '在住宅领域，我们将最终用户安全放在首位。我们提供经过测试和验证的储能解决方案，可集成到光伏系统中或独立使用，以确保供电连续性和用电优化。',
    introP2:
      '我们通过专业的技术支持和有竞争力的售后服务脱颖而出，提供延长保修、本地服务和长期支持。我们在市场上推广的每家制造商都经过仔细评估和技术验证，确保客户获得安全、可靠且符合质量标准的设备。',
    navStocare: '储能',
    navAplicatii: '应用',
    navAnsambluri: '场景',
    navSisteme: '系统',
    sectionStocareTitle: '住宅与微电网储能',
    sectionStocareDesc:
      '我们的住宅储能系统和高压解决方案可集成到需要能源独立、用电优化和供电连续性的项目中。',
    sectionAplicatiiTitle: 'BATERINO系统的实际应用',
    productTRX: 'TRX Series LiFePo4 LV',
    productTRXSpec: '5 kWh – 16 kW · 可堆叠',
    productHV: 'LiFePo4 高压',
    productHVSpec: '20.48 kWh – 40.96 kWh',
    productDesc:
      '我们的住宅储能系统和高压解决方案可集成到需要能源独立、用电优化和供电连续性的项目中。',
    productImagePlaceholder: '产品图片',
    sectionAnsambluriTitle: 'BATERINO系统的实际应用',
    ansambluriRezidential: '住宅组合',
    ansambluriHoteluri: '酒店与民宿',
    ansambluriCentre: '商业中心',
    ansambluriLocuinte: '独立住宅',
    ansambluriFerme: '农业农场',
    ansambluriStatiuni: '气象站',
    ansambluriCladiri: '办公楼',
    ansambluriZone: '难以进入区域',
    sectionSistemeTitle: 'LiFePo4 低压与高压储能系统',
    productTA6000: 'TA6000 LiFePo4 LV',
    productTA6000Spec: '5.12 kWh – 20.48 kWh',
    ctaTitle: '与我们的团队沟通',
    ctaDesc: '通过适合您家庭的解决方案减少对电网的依赖并优化用电。',
    ctaSuport: '支持与安全',
    ctaRetur: '15天退换 · SWAP 电池更换',
    ctaCompatibilitate: '99% 逆变器兼容',
    ctaGarantie: '10年制造商保修 · 已验证',
    ctaVerificat: '技术验证设备',
    ctaSuportService: '罗马尼亚支持与服务',
    ctaButton: '申请技术评估',
    discutaCuNoi: '与我们交谈',
    cardGarantie: '10年质保',
    cardCompatibilitate: '99%逆变器兼容',
    cardVerificat: '已验证制造商',
    cardRetur: '15天退换',
    cardSwap: 'SWAP – 电池更换',
    cardService: '罗马尼亚支持与服务',
  },
}

export function getRezidentialTranslations(lang: LangCode): RezidentialTranslations {
  return translations[lang] ?? translations.ro
}
