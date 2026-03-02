import type { LangCode } from './menu'

export type ProductDetailTranslations = {
  loading: string
  breadcrumbHome: string
  breadcrumbProducts: string
  sectorRezidential: string
  sectorIndustrial: string
  // Spec labels
  specCapacitate: string
  specEnergieNominala: string
  specCicluriDescarcare: string
  specDimensiuni: string
  specGreutate: string
  specTemperaturaOperare: string
  // Tech data labels
  techCurentMaxDescarcare: string
  techCurentMaxIncarcare: string
  techAdancimeDescarcare: string
  techDimensiuni: string
  techProtectie: string
  techCertificari: string
  techGarantie: string
  techTensiuneNominala: string
  techEficientaCiclu: string
  techTemperaturaFunctionare: string
  techTemperaturaStocare: string
  techUmiditate: string
  // Badges
  badgeGarantie: string
  badgeCompatibilitate: string
  badgeProducatori: string
  badgeRetur: string
  badgeSwap: string
  badgeSuport: string
  // Compatibility modal
  compatibilitateTitle: string
  compatibilitateClose: string
  compatibilitateSearch: string
  compatibilitateNoResults: string
  // Sections
  compatibilitateLabel: string
  verificareCompatibilitate: string
  cantitateLabel: string
  pretLabel: string
  includesTVA: string
  alegeProgramReduceri: string
  faraReducere: string
  comandaBtn: string
  documenteTehnice: string
  document: string
  dateTehnice: string
  intrebariFrecvente: string
  // Swap card
  stiaiCa: string
  swapDesc: string
  // Reduceri banner
  reduceriTitle: string
  reduceriDesc: string
  intraInCont: string
  // Contact CTA
  contactTitle: string
  contactDesc: string
  contacteazaNe: string
  ariaPrev: string
  ariaNext: string
}

const translations: Record<LangCode, ProductDetailTranslations> = {
  ro: {
    loading: 'Se încarcă produsul…',
    breadcrumbHome: 'Acasă',
    breadcrumbProducts: 'Produse',
    sectorRezidential: 'Rezidențial',
    sectorIndustrial: 'Industrial',
    specCapacitate: 'Capacitate',
    specEnergieNominala: 'Energie nominală',
    specCicluriDescarcare: 'Cicluri de descărcare',
    specDimensiuni: 'Dimensiuni',
    specGreutate: 'Greutate',
    specTemperaturaOperare: 'Temperatura operare',
    techCurentMaxDescarcare: 'Curent max. descărcare',
    techCurentMaxIncarcare: 'Curent max. încărcare',
    techAdancimeDescarcare: 'Adâncime descărcare (DOD)',
    techDimensiuni: 'Dimensiuni (L × l × h)',
    techProtectie: 'Protecție',
    techCertificari: 'Certificări',
    techGarantie: 'Garanție',
    techTensiuneNominala: 'Tensiune nominală',
    techEficientaCiclu: 'Eficiență ciclu complet',
    techTemperaturaFunctionare: 'Temperatura funcționare',
    techTemperaturaStocare: 'Temperatura stocare',
    techUmiditate: 'Umiditate',
    badgeGarantie: 'Garantie timp de 10 ani',
    badgeCompatibilitate: 'Compatibilitate 99% Invertoare',
    badgeProducatori: 'Producatori verificati',
    badgeRetur: 'Retur in 15 zile',
    badgeSwap: 'SWAP - Baterie la schimb',
    badgeSuport: 'Suport & Service in Romania',
    compatibilitateTitle: 'Compatibilitate Invertor',
    compatibilitateClose: 'Închide',
    compatibilitateSearch: 'Caută invertor...',
    compatibilitateNoResults: 'Niciun invertor găsit.',
    compatibilitateLabel: 'COMPATIBILITATE',
    verificareCompatibilitate: 'Verifică compatibilitate invertor',
    cantitateLabel: 'CANTITATE',
    pretLabel: 'PREȚ',
    includesTVA: 'include TVA',
    alegeProgramReduceri: 'ALEGE PROGRAM REDUCERI',
    faraReducere: 'Fără reducere',
    comandaBtn: 'COMANDĂ',
    documenteTehnice: 'Documente Tehnice',
    document: 'Document',
    dateTehnice: 'Date tehnice despre produs',
    intrebariFrecvente: 'Întrebări frecvente',
    stiaiCa: 'ȘTIAI CĂ?',
    swapDesc: 'Baterino îți oferă la schimb o baterie atunci când produsul tău se află în service pentru diagnoză sau mentenanță.',
    reduceriTitle: 'UTILIZEAZĂ PROGRAMELE NOASTRE DE REDUCERI',
    reduceriDesc: 'Creează un cont pe platforma Baterino și alege programul de reducere care ți se potrivește.',
    intraInCont: 'intră în cont',
    contactTitle: 'Nu ești sigur ce ți se potrivește?',
    contactDesc: 'Discută cu echipa noastră și află care este cea mai bună soluție pentru tine.',
    contacteazaNe: 'CONTACTEAZĂ-NE',
    ariaPrev: 'Anterior',
    ariaNext: 'Următorul',
  },
  en: {
    loading: 'Loading product…',
    breadcrumbHome: 'Home',
    breadcrumbProducts: 'Products',
    sectorRezidential: 'Residential',
    sectorIndustrial: 'Industrial',
    specCapacitate: 'Capacity',
    specEnergieNominala: 'Nominal energy',
    specCicluriDescarcare: 'Discharge cycles',
    specDimensiuni: 'Dimensions',
    specGreutate: 'Weight',
    specTemperaturaOperare: 'Operating temperature',
    techCurentMaxDescarcare: 'Max. discharge current',
    techCurentMaxIncarcare: 'Max. charge current',
    techAdancimeDescarcare: 'Depth of discharge (DOD)',
    techDimensiuni: 'Dimensions (L × W × H)',
    techProtectie: 'Protection',
    techCertificari: 'Certifications',
    techGarantie: 'Warranty',
    techTensiuneNominala: 'Nominal voltage',
    techEficientaCiclu: 'Full cycle efficiency',
    techTemperaturaFunctionare: 'Operating temperature',
    techTemperaturaStocare: 'Storage temperature',
    techUmiditate: 'Humidity',
    badgeGarantie: '10-year warranty',
    badgeCompatibilitate: '99% Inverter Compatibility',
    badgeProducatori: 'Verified manufacturers',
    badgeRetur: '15-day returns',
    badgeSwap: 'SWAP - Replacement battery',
    badgeSuport: 'Support & Service in Romania',
    compatibilitateTitle: 'Inverter Compatibility',
    compatibilitateClose: 'Close',
    compatibilitateSearch: 'Search inverter...',
    compatibilitateNoResults: 'No inverter found.',
    compatibilitateLabel: 'COMPATIBILITY',
    verificareCompatibilitate: 'Check inverter compatibility',
    cantitateLabel: 'QUANTITY',
    pretLabel: 'PRICE',
    includesTVA: 'includes VAT',
    alegeProgramReduceri: 'CHOOSE DISCOUNT PROGRAMME',
    faraReducere: 'No discount',
    comandaBtn: 'ORDER',
    documenteTehnice: 'Technical Documents',
    document: 'Document',
    dateTehnice: 'Technical product data',
    intrebariFrecvente: 'Frequently asked questions',
    stiaiCa: 'DID YOU KNOW?',
    swapDesc: 'Baterino offers you a replacement battery while your product is in service for diagnosis or maintenance.',
    reduceriTitle: 'USE OUR DISCOUNT PROGRAMMES',
    reduceriDesc: 'Create an account on the Baterino platform and choose the discount programme that suits you.',
    intraInCont: 'log in',
    contactTitle: 'Not sure what suits you?',
    contactDesc: 'Talk to our team and find out which is the best solution for you.',
    contacteazaNe: 'CONTACT US',
    ariaPrev: 'Previous',
    ariaNext: 'Next',
  },
  zh: {
    loading: '正在加载产品…',
    breadcrumbHome: '首页',
    breadcrumbProducts: '产品',
    sectorRezidential: '住宅',
    sectorIndustrial: '工业',
    specCapacitate: '容量',
    specEnergieNominala: '额定能量',
    specCicluriDescarcare: '放电循环',
    specDimensiuni: '尺寸',
    specGreutate: '重量',
    specTemperaturaOperare: '工作温度',
    techCurentMaxDescarcare: '最大放电电流',
    techCurentMaxIncarcare: '最大充电电流',
    techAdancimeDescarcare: '放电深度 (DOD)',
    techDimensiuni: '尺寸 (长×宽×高)',
    techProtectie: '保护',
    techCertificari: '认证',
    techGarantie: '保修',
    techTensiuneNominala: '额定电压',
    techEficientaCiclu: '全循环效率',
    techTemperaturaFunctionare: '工作温度',
    techTemperaturaStocare: '储存温度',
    techUmiditate: '湿度',
    badgeGarantie: '10年保修',
    badgeCompatibilitate: '99%逆变器兼容',
    badgeProducatori: '认证制造商',
    badgeRetur: '15天退货',
    badgeSwap: 'SWAP - 更换电池',
    badgeSuport: '罗马尼亚支持与服务',
    compatibilitateTitle: '逆变器兼容性',
    compatibilitateClose: '关闭',
    compatibilitateSearch: '搜索逆变器...',
    compatibilitateNoResults: '未找到逆变器。',
    compatibilitateLabel: '兼容性',
    verificareCompatibilitate: '检查逆变器兼容性',
    cantitateLabel: '数量',
    pretLabel: '价格',
    includesTVA: '含增值税',
    alegeProgramReduceri: '选择折扣计划',
    faraReducere: '无折扣',
    comandaBtn: '订购',
    documenteTehnice: '技术文档',
    document: '文档',
    dateTehnice: '产品技术数据',
    intrebariFrecvente: '常见问题',
    stiaiCa: '你知道吗？',
    swapDesc: '当您的产品在服务中心进行诊断或维护时，Baterino为您提供更换电池。',
    reduceriTitle: '使用我们的折扣计划',
    reduceriDesc: '在Baterino平台创建账户并选择适合您的折扣计划。',
    intraInCont: '登录',
    contactTitle: '不确定什么适合您？',
    contactDesc: '与我们的团队讨论，了解最适合您的解决方案。',
    contacteazaNe: '联系我们',
    ariaPrev: '上一张',
    ariaNext: '下一张',
  },
}

export function getProductDetailTranslations(lang: LangCode): ProductDetailTranslations {
  return translations[lang] ?? translations.ro
}
