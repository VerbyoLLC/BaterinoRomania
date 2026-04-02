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
  techCompozitieCelula: string
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
  ceSePoateAlimenta: string
  /** Right column: section above inverter / usage shortcuts */
  compatibilitateSiUtilizare: string
  /** Right column: warranty / trust badge grid */
  sigurantaBaterino: string
  cantitateLabel: string
  pretLabel: string
  /** Strikethrough list price line, e.g. "PREȚ VECHI" next to old amount */
  pretVechiLabel: string
  includesTVA: string
  /** Replace {pct} with formatted rate, e.g. "Includes VAT 21%" */
  includesVatWithPct: string
  alegeProgramReduceri: string
  faraReducere: string
  /** Discount programme labels (residential compact pricing) */
  reduceriProgram5: string
  reduceriProgram10: string
  reduceriProgram15: string
  /** Line before saved amount, e.g. "Economisești" / "You save" */
  economisestiLabel: string
  /** Discount headline next to savings — replace {pct} with whole number, e.g. "5% REDUCERE" */
  discountPctHighlight: string
  /** Open modal with discount programme cards (residential pricing) */
  veziProgrameReduceri: string
  /** CTA in modal footer → full /reduceri page */
  reduceriModalSeeFullPage: string
  comandaBtn: string
  /** Residential public pricing: order button follow-up (checkout not live) */
  clientOrderNotice: string
  totalEstimated: string
  ariaQtyDecrease: string
  ariaQtyIncrease: string
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
  /** Product hero description expand */
  descriptionReadMore: string
  descriptionReadLess: string
  // Contact CTA
  contactTitle: string
  contactDesc: string
  contacteazaNe: string
  ariaPrev: string
  ariaNext: string
  // Compatibilitate 99% modal
  compatibilitate99Title: string
  compatibilitate99Desc: string
  // Garantie modal
  garantieModalTitle: string
  garantieModalDesc: string
  // Producator verificat modal
  producatoriModalTitle: string
  producatoriModalDesc: string
  // Retur modal
  returModalTitle: string
  returModalDesc: string
  // Swap modal
  swapModalTitle: string
  swapModalDesc: string
  // Suport & Service modal
  suportModalTitle: string
  suportModalDesc: string
  // Ce se poate alimenta modal
  alimentaModalTitle: string
  alimentaModalIntro: string
  alimentaModalExemple: string
  alimentaModalEx1: string
  alimentaModalEx2: string
  alimentaModalEx3: string
  alimentaModalEx4: string
  alimentaModalEx5: string
  alimentaModalEx6: string
  alimentaModalCateOre: string
  alimentaModalDurata: string
  alimentaModalDurata1: string
  alimentaModalDurata2: string
  alimentaModalDurata3: string
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
    techCompozitieCelula: 'Compoziție celulă',
    badgeGarantie: 'Garantie timp de 10 ani',
    badgeCompatibilitate: 'Compatibilitate 99% Invertoare',
    badgeProducatori: 'Producator verificat',
    badgeRetur: 'Retur in 15 zile',
    badgeSwap: 'SWAP - Baterie la schimb',
    badgeSuport: 'Suport & Service in Romania',
    compatibilitateTitle: 'Compatibilitate Invertor',
    compatibilitateClose: 'Închide',
    compatibilitateSearch: 'Caută invertor...',
    compatibilitateNoResults: 'Niciun invertor găsit.',
    compatibilitateLabel: 'COMPATIBILITATE',
    verificareCompatibilitate: 'Verifică compatibilitate invertor',
    ceSePoateAlimenta: 'Ce se poate alimenta?',
    compatibilitateSiUtilizare: 'Compatibilitate și utilizare',
    sigurantaBaterino: 'Siguranța Baterino',
    cantitateLabel: 'CANTITATE',
    pretLabel: 'PREȚ',
    pretVechiLabel: 'PREȚ VECHI',
    includesTVA: 'include TVA',
    includesVatWithPct: 'Include TVA {pct}%',
    alegeProgramReduceri: 'ALEGE PROGRAM REDUCERI',
    faraReducere: 'Fără reducere',
    reduceriProgram5: 'Program Reduceri 5%',
    reduceriProgram10: 'Program Reduceri 10%',
    reduceriProgram15: 'Program Reduceri 15%',
    economisestiLabel: 'Economisești',
    discountPctHighlight: '{pct}% REDUCERE',
    veziProgrameReduceri: 'Vezi programe reduceri',
    reduceriModalSeeFullPage: 'Deschide pagina Programe reducere',
    comandaBtn: 'COMANDĂ',
    clientOrderNotice:
      'Comanda online nu este încă activă. Te rugăm să ne contactezi pentru ofertă sau să îți creezi cont pentru programele de reduceri.',
    totalEstimated: 'Total estimativ',
    ariaQtyDecrease: 'Scade cantitatea',
    ariaQtyIncrease: 'Crește cantitatea',
    documenteTehnice: 'Documente Tehnice',
    document: 'Document',
    dateTehnice: 'Date tehnice despre produs',
    intrebariFrecvente: 'Întrebări frecvente',
    stiaiCa: 'ȘTIAI CĂ?',
    swapDesc: 'Baterino îți oferă la schimb o baterie atunci când produsul tău se află în service pentru diagnoză sau mentenanță.',
    reduceriTitle: 'UTILIZEAZĂ PROGRAMELE NOASTRE DE REDUCERI',
    reduceriDesc: 'Creează un cont pe platforma Baterino și alege programul de reducere care ți se potrivește.',
    intraInCont: 'intră în cont',
    descriptionReadMore: 'Citește mai mult',
    descriptionReadLess: 'Mai puțin',
    contactTitle: 'Nu ești sigur ce ți se potrivește?',
    contactDesc: 'Discută cu echipa noastră și află care este cea mai bună soluție pentru tine.',
    contacteazaNe: 'CONTACTEAZĂ-NE',
    ariaPrev: 'Anterior',
    ariaNext: 'Următorul',
    compatibilitate99Title: 'Compatibilitate cu 99% din Invertoare',
    compatibilitate99Desc: 'Bateriile noastre sunt proiectate pentru compatibilitate cu majoritatea invertoarelor comercializate în România, fiind testate și configurate pentru funcționare optimă cu fiecare tip de invertor.',
    garantieModalTitle: 'Garantie timp de 10 ani',
    garantieModalDesc: 'Producătorul LithTech oferă o garanție de 10 ani pentru componentele bateriei. Celulele și sistemul de management al bateriei (BMS) beneficiază de garanție extinsă de 10 ani. Vă recomandăm să verificați certificatul de garanție înainte de achiziție.',
    producatoriModalTitle: 'Producator verificat',
    producatoriModalDesc: 'Înainte de a prelua importul și distribuția LithTech, am analizat riguros calitatea produselor și a celulelor, am vizitat fabrica și am studiat procesul de producție, pentru a ne asigura că oferim pe piață un produs la cele mai înalte standarde.',
    returModalTitle: 'Retur in 15 zile',
    returModalDesc: 'Deși este foarte puțin probabil să fie necesar, aveți la dispoziție 15 zile de la primirea produsului pentru a-l returna. După verificarea returului, contravaloarea produsului va fi rambursată în maximum 5 zile de la data recepționării acestuia de către noi.',
    swapModalTitle: 'SWAP - Baterie la schimb',
    swapModalDesc: 'Serviciul care îți oferă siguranța. În cazul în care bateria ta necesită service pentru reparații sau mentenanță, îți punem la dispoziție o baterie de același model (sau echivalent) pe întreaga durată a intervenției.',
    suportModalTitle: 'Suport & Service in Romania',
    suportModalDesc: 'Am instruit echipa noastră tehnică în colaborare directă cu producătorul și am implementat în România echipamente specializate pentru testare și diagnosticare. Oferim mentenanță și service local, optimizând timpul de intervenție și garantând suport rapid și sigur.',
    alimentaModalTitle: 'Ce poate alimenta o baterie de 5kWh?',
    alimentaModalIntro: 'Capacitatea utilă reală este aproximativ 4 – 4.5 kWh (în funcție de setările sistemului).',
    alimentaModalExemple: 'Exemple orientative:',
    alimentaModalEx1: 'Iluminat LED (10 becuri) → 20–30 ore',
    alimentaModalEx2: 'TV + internet + laptop → 15–20 ore',
    alimentaModalEx3: 'Frigider (150W medie) → 20–25 ore',
    alimentaModalEx4: 'Birou complet (PC + monitor + router) → 12–18 ore',
    alimentaModalEx5: 'Centrală pe gaz (pompe + automatizare) → 15–20 ore',
    alimentaModalEx6: 'Consum esențial locuință (300–500W constant) → 8–12 ore',
    alimentaModalCateOre: 'Câte ore ține?',
    alimentaModalDurata: 'Durata depinde de consum:',
    alimentaModalDurata1: 'La 300W consum constant → ~14–16 ore',
    alimentaModalDurata2: 'La 500W consum constant → ~8–10 ore',
    alimentaModalDurata3: 'La 1kW consum constant → ~4–5 ore',
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
    techCompozitieCelula: 'Cell composition',
    badgeGarantie: '10-year warranty',
    badgeCompatibilitate: '99% Inverter Compatibility',
    badgeProducatori: 'Verified manufacturer',
    badgeRetur: '15-day returns',
    badgeSwap: 'SWAP - Replacement battery',
    badgeSuport: 'Support & Service in Romania',
    compatibilitateTitle: 'Inverter Compatibility',
    compatibilitateClose: 'Close',
    compatibilitateSearch: 'Search inverter...',
    compatibilitateNoResults: 'No inverter found.',
    compatibilitateLabel: 'COMPATIBILITY',
    verificareCompatibilitate: 'Check inverter compatibility',
    ceSePoateAlimenta: 'What can it power?',
    compatibilitateSiUtilizare: 'Compatibility and usage',
    sigurantaBaterino: 'Baterino assurance',
    cantitateLabel: 'QUANTITY',
    pretLabel: 'PRICE',
    pretVechiLabel: 'OLD PRICE',
    includesTVA: 'includes VAT',
    includesVatWithPct: 'Includes VAT {pct}%',
    alegeProgramReduceri: 'CHOOSE DISCOUNT PROGRAMME',
    faraReducere: 'No discount',
    reduceriProgram5: 'Discount programme 5%',
    reduceriProgram10: 'Discount programme 10%',
    reduceriProgram15: 'Discount programme 15%',
    economisestiLabel: 'You save',
    discountPctHighlight: '{pct}% OFF',
    veziProgrameReduceri: 'View discount programmes',
    reduceriModalSeeFullPage: 'Open discount programmes page',
    comandaBtn: 'ORDER',
    clientOrderNotice:
      'Online checkout is not active yet. Please contact us for a quote or create an account to use our discount programmes.',
    totalEstimated: 'Estimated total',
    ariaQtyDecrease: 'Decrease quantity',
    ariaQtyIncrease: 'Increase quantity',
    documenteTehnice: 'Technical Documents',
    document: 'Document',
    dateTehnice: 'Technical product data',
    intrebariFrecvente: 'Frequently asked questions',
    stiaiCa: 'DID YOU KNOW?',
    swapDesc: 'Baterino offers you a replacement battery while your product is in service for diagnosis or maintenance.',
    reduceriTitle: 'USE OUR DISCOUNT PROGRAMMES',
    reduceriDesc: 'Create an account on the Baterino platform and choose the discount programme that suits you.',
    intraInCont: 'log in',
    descriptionReadMore: 'Read more',
    descriptionReadLess: 'Show less',
    contactTitle: 'Not sure what suits you?',
    contactDesc: 'Talk to our team and find out which is the best solution for you.',
    contacteazaNe: 'CONTACT US',
    ariaPrev: 'Previous',
    ariaNext: 'Next',
    compatibilitate99Title: 'Compatibility with 99% of Inverters',
    compatibilitate99Desc: 'Our batteries are designed for compatibility with most inverters sold in Romania, being tested and configured for optimal operation with each type of inverter.',
    garantieModalTitle: '10-year warranty',
    garantieModalDesc: 'LithTech manufacturer offers a 10-year warranty for battery components. Cells and the battery management system (BMS) benefit from an extended 10-year warranty. We recommend checking the warranty certificate before purchase.',
    producatoriModalTitle: 'Verified manufacturer',
    producatoriModalDesc: 'Before taking over the LithTech import and distribution, we rigorously analysed the quality of products and cells, visited the factory and studied the production process, to ensure we offer on the market a product at the highest standards.',
    returModalTitle: '15-day returns',
    returModalDesc: 'Although it is very unlikely to be necessary, you have 15 days from receiving the product to return it. After verification of the return, the product value will be refunded within a maximum of 5 days from the date we receive it.',
    swapModalTitle: 'SWAP - Replacement battery',
    swapModalDesc: 'The service that gives you peace of mind. If your battery requires service for repairs or maintenance, we provide you with a battery of the same model (or equivalent) for the entire duration of the intervention.',
    suportModalTitle: 'Support & Service in Romania',
    suportModalDesc: 'We have trained our technical team in direct collaboration with the manufacturer and have implemented specialised equipment for testing and diagnostics in Romania. We offer local maintenance and service, optimising intervention time and guaranteeing fast and reliable support.',
    alimentaModalTitle: 'What can a battery of 5kWh power?',
    alimentaModalIntro: 'The actual usable capacity is approximately 4 – 4.5 kWh (depending on system settings).',
    alimentaModalExemple: 'Indicative examples:',
    alimentaModalEx1: 'LED lighting (10 bulbs) → 20–30 hours',
    alimentaModalEx2: 'TV + internet + laptop → 15–20 hours',
    alimentaModalEx3: 'Refrigerator (150W average) → 20–25 hours',
    alimentaModalEx4: 'Full office (PC + monitor + router) → 12–18 hours',
    alimentaModalEx5: 'Gas boiler (pumps + automation) → 15–20 hours',
    alimentaModalEx6: 'Essential household consumption (300–500W constant) → 8–12 hours',
    alimentaModalCateOre: 'How long does it last?',
    alimentaModalDurata: 'Duration depends on consumption:',
    alimentaModalDurata1: 'At 300W constant consumption → ~14–16 hours',
    alimentaModalDurata2: 'At 500W constant consumption → ~8–10 hours',
    alimentaModalDurata3: 'At 1kW constant consumption → ~4–5 hours',
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
    techCompozitieCelula: '电芯成分',
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
    ceSePoateAlimenta: '可以供电什么？',
    compatibilitateSiUtilizare: '兼容性与用途',
    sigurantaBaterino: 'Baterino保障与承诺',
    cantitateLabel: '数量',
    pretLabel: '价格',
    pretVechiLabel: '原价',
    includesTVA: '含增值税',
    includesVatWithPct: '含增值税 {pct}%',
    alegeProgramReduceri: '选择折扣计划',
    faraReducere: '无折扣',
    reduceriProgram5: '折扣计划 5%',
    reduceriProgram10: '折扣计划 10%',
    reduceriProgram15: '折扣计划 15%',
    economisestiLabel: '您节省',
    discountPctHighlight: '{pct}% 折扣',
    veziProgrameReduceri: '查看折扣计划',
    reduceriModalSeeFullPage: '打开折扣计划专页',
    comandaBtn: '订购',
    clientOrderNotice: '在线结账尚未开通。请联系我们以获取报价，或注册账户使用折扣计划。',
    totalEstimated: '预估合计',
    ariaQtyDecrease: '减少数量',
    ariaQtyIncrease: '增加数量',
    documenteTehnice: '技术文档',
    document: '文档',
    dateTehnice: '产品技术数据',
    intrebariFrecvente: '常见问题',
    stiaiCa: '你知道吗？',
    swapDesc: '当您的产品在服务中心进行诊断或维护时，Baterino为您提供更换电池。',
    reduceriTitle: '使用我们的折扣计划',
    reduceriDesc: '在Baterino平台创建账户并选择适合您的折扣计划。',
    intraInCont: '登录',
    descriptionReadMore: '展开全文',
    descriptionReadLess: '收起',
    contactTitle: '不确定什么适合您？',
    contactDesc: '与我们的团队讨论，了解最适合您的解决方案。',
    contacteazaNe: '联系我们',
    ariaPrev: '上一张',
    ariaNext: '下一张',
    compatibilitate99Title: '与99%逆变器兼容',
    compatibilitate99Desc: '我们的电池设计为与罗马尼亚销售的大多数逆变器兼容，经过测试和配置，可与每种类型的逆变器实现最佳运行。',
    garantieModalTitle: '10年保修',
    garantieModalDesc: 'LithTech制造商为电池组件提供10年保修。电芯和电池管理系统（BMS）享有延长10年保修。我们建议在购买前查看保修证书。',
    producatoriModalTitle: '认证制造商',
    producatoriModalDesc: '在接管LithTech进口和分销之前，我们严格分析了产品和电芯的质量，参观了工厂并研究了生产流程，以确保我们向市场提供符合最高标准的产品。',
    returModalTitle: '15天退货',
    returModalDesc: '虽然退货的可能性很小，但您有15天的时间从收到产品之日起退货。退货验证后，产品价值将在我们收到退货之日起最多5天内退还。',
    swapModalTitle: 'SWAP - 更换电池',
    swapModalDesc: '让您安心的服务。如果您的电池需要维修或保养服务，我们将在整个维修期间为您提供同型号（或同等）的电池。',
    suportModalTitle: '罗马尼亚支持与服务',
    suportModalDesc: '我们与制造商直接合作培训了技术团队，并在罗马尼亚实施了用于测试和诊断的专用设备。我们提供本地维护和服务，优化干预时间并保证快速可靠的支持。',
    alimentaModalTitle: '一块5kWh的电池可以供电什么？',
    alimentaModalIntro: '实际可用容量约为4–4.5 kWh（取决于系统设置）。',
    alimentaModalExemple: '参考示例：',
    alimentaModalEx1: 'LED照明（10个灯泡）→ 20–30小时',
    alimentaModalEx2: '电视+网络+笔记本电脑 → 15–20小时',
    alimentaModalEx3: '冰箱（平均150W）→ 20–25小时',
    alimentaModalEx4: '完整办公室（电脑+显示器+路由器）→ 12–18小时',
    alimentaModalEx5: '燃气锅炉（泵+自动化）→ 15–20小时',
    alimentaModalEx6: '基本家庭用电（300–500W恒定）→ 8–12小时',
    alimentaModalCateOre: '能持续多久？',
    alimentaModalDurata: '持续时间取决于用电量：',
    alimentaModalDurata1: '300W恒定用电 → 约14–16小时',
    alimentaModalDurata2: '500W恒定用电 → 约8–10小时',
    alimentaModalDurata3: '1kW恒定用电 → 约4–5小时',
  },
}

export function getProductDetailTranslations(lang: LangCode): ProductDetailTranslations {
  return translations[lang] ?? translations.ro
}
