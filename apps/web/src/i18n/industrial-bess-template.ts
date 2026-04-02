import type { LangCode } from './menu'

export type IndustrialBessTemplateTranslations = {
  seoTitle: string
  seoDescription: string
  heroKicker: string
  heroTitle: string
  heroSubtitle: string
  tabAdvantages: string
  tabSpec: string
  tabServices: string
  tabWarranty: string
  tabFaq: string
  overviewTitle: string
  /** Heading above per-model summary cards in Overview */
  overviewModelsHeading: string
  /** Mobile: reveal more model cards in 2-column grid */
  modelsLoadMore: string
  /** Hint under model cards heading: tap to open technical details */
  overviewModelsTapHint: string
  /** Desktop WhatsApp: prefilled chat text; placeholders {product}, {model} */
  modelDesktopWhatsappPrefill: string
  /** Desktop: label for WhatsApp link under card */
  modelDesktopDetailsCta: string
  overviewP1: string
  overviewP2: string
  downloadBrochure: string
  contactTitle: string
  contactBlurb: string
  contactCta: string
  carouselAria: string
  prevSlide: string
  nextSlide: string
  goToSlide: string
  modelLabel: string
  techSpecByKey: Record<string, string>
  keyAdvantageFeatures: string[]
  servicesIntro: string
  warrantyIntro: string
  serviceSteps: { title: string; body: string }[]
  warrantyItems: { title: string; body: string }[]
  faqItems: { q: string; a: string }[]
  specBrochureWhenRows: string
  specBrochureWhenEmpty: string
  specOpenPdf: string
  specNoBrochure: string
  noKeyAdvantages: string
  noCarouselImages: string
  overviewPlaceholder: string
  noFaqs: string
  tablistAria: string
  slide1: {
    title: string
    caption: string
    diagramTitle: string
  }
  slide2: {
    title: string
    battery: string
    bms: string
    cooling: string
    mid: string
    footer: string
  }
  slide3: {
    title: string
    thermal: string
    loop: string
    battery: string
    heat: string
    exchanger: string
    radiator: string
    footer: string
  }
  slide4: {
    title: string
    header: string
    cap: string
    volt: string
    pow: string
    cycle: string
    eff: string
    footer: string
  }
}

const TECH_KEYS_EN: Record<string, string> = {
  model: 'Model',
  energySystem: 'Energy System',
  nominalVoltage: 'Nominal Voltage',
  nominalCapacity: 'Nominal Capacity',
  nominalEnergy: 'Nominal Energy',
  systemConfiguration: 'System Configuration',
  cellType: 'Cell Type',
  chemistry: 'Chemistry',
  cycleLife: 'Cycle life',
  batteryModule: 'Battery Module',
  batteryCluster: 'Battery Cluster',
  maxOutputPower: 'Max Output Power',
  ratedOutputVoltage: 'Rated Output Voltage',
  acAccessMethod: 'AC Access Method',
  ratedGridFrequency: 'Rated Grid Frequency',
  pcsCabinetCount: 'Number of PCS cabinets',
  conversionEfficiency: 'Conversion Efficiency',
  coolingMethod: 'Cooling Method',
  communication: 'Communication',
  waterproof: 'Waterproof',
  corrosionLevel: 'Corrosion Level',
  noiseLevel: 'Noise Level',
  chargeTemperature: 'Charge Temperature',
  dischargeTemperature: 'Discharge Temperature',
  storageTemperature: 'Storage Temperature',
  altitude: 'Altitude',
  certification: 'Certification',
  warranty: 'Warranty',
  dimensions: 'Dimensions [L×W×H]',
  weight: 'Weight',
}

const TECH_KEYS_RO: Record<string, string> = {
  model: 'Model',
  energySystem: 'Sistem energetic',
  nominalVoltage: 'Tensiune nominală',
  nominalCapacity: 'Capacitate nominală',
  nominalEnergy: 'Energie nominală',
  systemConfiguration: 'Configurație sistem',
  cellType: 'Tip celulă',
  chemistry: 'Chimie',
  cycleLife: 'Durată de cicluri',
  batteryModule: 'Modul baterie',
  batteryCluster: 'Cluster baterie',
  maxOutputPower: 'Putere maximă de ieșire',
  ratedOutputVoltage: 'Tensiune nominală de ieșire',
  acAccessMethod: 'Metodă acces AC',
  ratedGridFrequency: 'Frecvență rețea nominală',
  pcsCabinetCount: 'Număr dulapuri PCS',
  conversionEfficiency: 'Eficiență de conversie',
  coolingMethod: 'Metodă de răcire',
  communication: 'Comunicație',
  waterproof: 'Impermeabilitate',
  corrosionLevel: 'Nivel coroziune',
  noiseLevel: 'Nivel zgomot',
  chargeTemperature: 'Temperatură încărcare',
  dischargeTemperature: 'Temperatură descărcare',
  storageTemperature: 'Temperatură depozitare',
  altitude: 'Altitudine',
  certification: 'Certificare',
  warranty: 'Garanție',
  dimensions: 'Dimensiuni [L×l×Î]',
  weight: 'Masă',
}

const TECH_KEYS_ZH: Record<string, string> = {
  model: '型号',
  energySystem: '能源系统',
  nominalVoltage: '额定电压',
  nominalCapacity: '额定容量',
  nominalEnergy: '额定能量',
  systemConfiguration: '系统配置',
  cellType: '电芯类型',
  chemistry: '化学体系',
  cycleLife: '循环寿命',
  batteryModule: '电池模块',
  batteryCluster: '电池簇',
  maxOutputPower: '最大输出功率',
  ratedOutputVoltage: '额定输出电压',
  acAccessMethod: '交流接入方式',
  ratedGridFrequency: '额定电网频率',
  pcsCabinetCount: 'PCS 柜数量',
  conversionEfficiency: '转换效率',
  coolingMethod: '冷却方式',
  communication: '通讯',
  waterproof: '防护等级',
  corrosionLevel: '防腐等级',
  noiseLevel: '噪声',
  chargeTemperature: '充电温度',
  dischargeTemperature: '放电温度',
  storageTemperature: '存储温度',
  altitude: '海拔',
  certification: '认证',
  warranty: '质保',
  dimensions: '外形尺寸 [长×宽×高]',
  weight: '重量',
}

const translations: Record<LangCode, IndustrialBessTemplateTranslations> = {
  en: {
    seoTitle: '20FT Container BESS | Baterino',
    seoDescription:
      '20FT Container Battery Energy Storage System — modular liquid cooling, 334–501.5 kWh, industrial-grade energy storage. Grid, transmission, and user-side deployment.',
    heroKicker: "Baterino Introducing LithTech's",
    heroTitle: '20FT Container Battery Energy Storage System (BESS)',
    heroSubtitle: 'Modular liquid cooling · 334–501.5 kWh · Industrial-grade energy storage',
    tabAdvantages: 'Key Advantages',
    tabSpec: 'Technical specification',
    tabServices: 'Baterino services',
    tabWarranty: 'Warranty and support',
    tabFaq: "FAQ's",
    overviewTitle: 'Overview',
    overviewModelsHeading: 'Model highlights',
    modelsLoadMore: 'Load more',
    overviewModelsTapHint: 'Tap a model to see technical details',
    modelDesktopWhatsappPrefill:
      'Hi. I would like to know more details about {product}. Model: {model}.',
    modelDesktopDetailsCta: 'Product details',
    overviewP1:
      'The 20FT Container BESS delivers 334–501.5 kWh of modular energy storage with advanced liquid cooling, flexible expansion, and industry-leading reliability. Supports grid-side, transmission-side, and user-side deployment scenarios.',
    overviewP2:
      'We handle everything: sourcing, installation, commissioning, maintenance, and technical support. Our integrated service model ensures optimal performance throughout the system\'s lifecycle.',
    downloadBrochure: 'Download Brochure',
    contactTitle: 'Dedicated industrial division',
    contactBlurb: 'Discuss your project details with our team. Assessment, delivery and implementation.',
    contactCta: 'Contact us',
    carouselAria: 'BESS product diagrams',
    prevSlide: 'Previous slide',
    nextSlide: 'Next slide',
    goToSlide: 'Go to slide',
    modelLabel: TECH_KEYS_EN.model,
    techSpecByKey: TECH_KEYS_EN,
    keyAdvantageFeatures: [
      'Modular liquid cooling',
      'Flexible expansion',
      'LiFePO₄ chemistry',
      'Low noise design',
      'DC-side turnkey solution',
      'Multi-scenario deployment',
      'Advanced fire safety',
      'Remote monitoring',
    ],
    servicesIntro:
      'We handle every stage of your BESS deployment—from sourcing and logistics to installation and long-term support. Our integrated service model ensures reliability, compliance, and optimal system performance throughout the lifecycle.',
    warrantyIntro:
      'Comprehensive warranty and technical support ensures your BESS operates reliably from day one through end-of-life.',
    serviceSteps: [
      {
        title: 'Importing & sourcing',
        body:
          'Direct procurement from manufacturers with quality assurance, compliance verification, and logistics coordination across Southeast Asia and Eastern Europe.',
      },
      {
        title: 'Installation & commissioning',
        body:
          'Professional on-site installation, system integration, testing, and commissioning by certified technicians. Full site preparation and grid connection support.',
      },
      {
        title: 'After-sales service',
        body:
          'Scheduled maintenance, emergency repairs, spare parts availability, and performance optimization. Local service network across operating regions.',
      },
    ],
    warrantyItems: [
      {
        title: 'Standard warranty',
        body:
          '5-year manufacturer warranty covering all components. Extended 10-year options available for critical deployments.',
      },
      {
        title: 'Technical support',
        body: '24/7 remote monitoring and diagnostics. On-call technical team for troubleshooting and emergency response.',
      },
      {
        title: 'Spare parts',
        body:
          'Pre-stocked critical components for rapid replacement. Direct access to manufacturer inventory for complete modularity.',
      },
      {
        title: 'Training & documentation',
        body: 'Comprehensive operator training, maintenance manuals, and system documentation. Support for staff skill development.',
      },
    ],
    faqItems: [
      {
        q: 'What energy capacity does the 20FT Container BESS provide?',
        a:
          'The system scales from 334 kWh up to 501.5 kWh in a single 20-foot container, with modular design so capacity and power conversion can be aligned to your site load profile and grid requirements.',
      },
      {
        q: 'Which deployment scenarios does this BESS support?',
        a:
          'It is suitable for grid-side services, transmission and distribution support, and behind-the-meter C&I applications—including peak shaving, backup, and hybrid plant buffering where liquid cooling and footprint are priorities.',
      },
      {
        q: 'Why use liquid cooling instead of air cooling?',
        a:
          'Liquid cooling maintains tighter, more uniform cell temperatures, which supports higher-duty cycling, improves safety margins, and can extend useful life compared with many air-cooled alternatives in the same footprint.',
      },
      {
        q: 'What warranty and technical support is typical?',
        a:
          'Standard coverage includes a five-year manufacturer warranty on major components, with ten-year options for critical deployments. Baterino can align remote monitoring, spare parts, and training with your operations model—see the Warranty and support tab for detail.',
      },
      {
        q: 'Does Baterino cover logistics, installation, and commissioning?',
        a:
          'Yes. We support importing and sourcing, professional installation and commissioning, and after-sales service including maintenance and performance optimization, so you have a single path from contract signature to stable operation.',
      },
    ],
    specBrochureWhenRows: 'Additional details and drawings are available in the technical brochure.',
    specBrochureWhenEmpty: 'Full technical specifications for this product are provided in the technical brochure.',
    specOpenPdf: 'Open technical brochure (PDF)',
    specNoBrochure: 'Brochure not uploaded yet.',
    noKeyAdvantages: 'No key advantages configured for this product.',
    noCarouselImages: 'No carousel images',
    overviewPlaceholder: 'Overview content will appear here when provided.',
    noFaqs: 'No FAQs for this product yet.',
    tablistAria: 'Product details',
    slide1: {
      title: '20FT Container system overview',
      caption: '20FT Container system overview',
      diagramTitle: '20FT Container system overview',
    },
    slide2: {
      title: 'System architecture',
      battery: 'Battery',
      bms: 'BMS',
      cooling: 'Cooling',
      mid: 'Integrated power management & control system',
      footer: 'System architecture',
    },
    slide3: {
      title: 'Modular liquid cooling system',
      thermal: 'Thermal management',
      loop: 'Liquid cooling loop',
      battery: 'Battery',
      heat: 'Heat',
      exchanger: 'Exchanger',
      radiator: 'Radiator',
      footer: 'Modular liquid cooling system',
    },
    slide4: {
      title: 'Key technical parameters',
      header: 'Specifications',
      cap: 'Capacity: 334–501.5 kWh',
      volt: 'Voltage: 1331.2V nominal',
      pow: 'Power: 1670–2507.5 kW',
      cycle: 'Cycles: 8,000 @ 70% SOH (20yr)',
      eff: 'Efficiency: ≥98.5%',
      footer: 'Key technical parameters',
    },
  },
  ro: {
    seoTitle: 'BESS container 20ft | Baterino',
    seoDescription:
      'Sistem de stocare în container 20ft — răcire lichidă modulară, 334–501,5 kWh, stocare industrială. Rețea, transport și utilizatori.',
    heroKicker: 'Baterino prezintă LithTech',
    heroTitle: 'Sistem de stocare a energiei în container de 20ft (BESS)',
    heroSubtitle: 'Răcire lichidă modulară · 334–501,5 kWh · Stocare energetică industrială',
    tabAdvantages: 'Avantaje cheie',
    tabSpec: 'Specificații tehnice',
    tabServices: 'Servicii Baterino',
    tabWarranty: 'Garanție și suport',
    tabFaq: 'Întrebări frecvente',
    overviewTitle: 'Prezentare',
    overviewModelsHeading: 'Configurații disponibile',
    modelsLoadMore: 'Încarcă mai mult',
    overviewModelsTapHint: 'Apasă pe model pentru a vedea detalii tehnice',
    modelDesktopWhatsappPrefill:
      'Salut. Aș dori să aflu mai multe detalii despre {product}. Model {model}.',
    modelDesktopDetailsCta: 'Detalii despre produs',
    overviewP1:
      'BESS-ul în container de 20ft oferă 334–501,5 kWh de stocare modulară cu răcire lichidă avansată, expansiune flexibilă și fiabilitate industrială. Compatibil cu scenarii în rețea, transport și parte utilizator.',
    overviewP2:
      'Acoperim întregul flux: aprovizionare, instalare, punere în funcțiune, mentenanță și suport tehnic. Modelul integrat asigură performanță optimă pe durata de viață a sistemului.',
    downloadBrochure: 'Descarcă broșura',
    contactTitle: 'Divizia industrială dedicată',
    contactBlurb: 'Discută cu echipa noastră detaliile proiectului. Evaluare, livrare și implementare.',
    contactCta: 'Contactează-ne',
    carouselAria: 'Diagrame produs BESS',
    prevSlide: 'Diapozitiv anterior',
    nextSlide: 'Diapozitiv următor',
    goToSlide: 'Mergi la diapozitiv',
    modelLabel: TECH_KEYS_RO.model,
    techSpecByKey: TECH_KEYS_RO,
    keyAdvantageFeatures: [
      'Răcire lichidă modulară',
      'Expansiune flexibilă',
      'Chimie LiFePO₄',
      'Design cu zgomot redus',
      'Soluție turnkey parte DC',
      'Deployament multi-scenariu',
      'Siguranță la incendiu avansată',
      'Monitorizare la distanță',
    ],
    servicesIntro:
      'Acoperim toate etapele proiectului BESS — de la aprovizionare și logistică la instalare și suport pe termen lung. Modelul integrat asigură fiabilitate, conformitate și randament pe tot ciclu de viață.',
    warrantyIntro:
      'Garanția și suportul tehnic cuprinzător mențin sistemul în operare sigură de la punerea în funcțiune până la finele duratei de viață.',
    serviceSteps: [
      {
        title: 'Import și aprovizionare',
        body:
          'Achiziție directă de la producători, asigurarea calității, verificări de conformitate și logistică în Asia de Sud-Est și Europa de Est.',
      },
      {
        title: 'Instalare și punere în funcțiune',
        body:
          'Instalare la fața locului, integrare, testare și comisionare de către tehnicieni certificați. Pregătire amplasament și conectare la rețea.',
      },
      {
        title: 'Service post-vânzare',
        body:
          'Mentenanță programată, intervenții de urgență, piese de schimb și optimizare performanță. Rețea locală de service.',
      },
    ],
    warrantyItems: [
      {
        title: 'Garanție standard',
        body:
          'Garanție producător 5 ani pentru componente. Extensie 10 ani disponibilă pentru proiecte critice.',
      },
      {
        title: 'Suport tehnic',
        body: 'Monitorizare și diagnostic la distanță 24/7. Echipă on-call pentru depanare și urgențe.',
      },
      {
        title: 'Piese de schimb',
        body:
          'Componente critice în stoc pentru înlocuire rapidă. Acces la inventarul producătorului pentru modularitate completă.',
      },
      {
        title: 'Training și documentație',
        body:
          'Instruire operatori, manuale de întreținere și documentație sistem. Suport pentru dezvoltarea competențelor.',
      },
    ],
    faqItems: [
      {
        q: 'Ce capacitate energetică oferă BESS-ul în container 20ft?',
        a:
          'Sistemul pornește de la 334 kWh până la 501,5 kWh într-un singur container de 20 de picioare, design modular astfel încât puterea și conversia să fie aliniate profilului sarcinii și rețelei.',
      },
      {
        q: 'Pentru ce scenarii este potrivit?',
        a:
          'Este potrivit pentru servicii în rețea, suport transport-distribuție și aplicații comerciale/industriale în spatele contorului — vârfuri, rezervă și tamponare în hibrid, unde contează răcirea lichidă și amprenta.',
      },
      {
        q: 'De ce răcire lichidă în loc de aer?',
        a:
          'Răcirea lichidă menține temperaturi mai uniforme ale celulelor, suportă cicluri mai solicitante, îmbunătățește marjele de siguranță și poate prelungi viața utilă față de multe soluții cu aer în același volum.',
      },
      {
        q: 'Ce garanție și suport sunt uzuale?',
        a:
          'De regulă garanție 5 ani de la producător pe componentele principale, cu opțiuni 10 ani pentru proiecte critice. Baterino aliniază monitorizarea, piesele și trainingul cu modelul dumneavoastră operațional — vezi fila Garanție și suport.',
      },
      {
        q: 'Acoperiți logistică, instalare și comisionare?',
        a:
          'Da. Suportăm import, instalare profesională, punere în funcțiune și service post-vânzare inclusiv mentenanță și optimizare, pentru un singur flux de la contract la operare stabilă.',
      },
    ],
    specBrochureWhenRows: 'Detalii suplimentare și desene sunt în broșura tehnică.',
    specBrochureWhenEmpty: 'Specificațiile complete sunt prezentate în broșura tehnică.',
    specOpenPdf: 'Deschide broșura tehnică (PDF)',
    specNoBrochure: 'Broșura nu a fost încă încărcată.',
    noKeyAdvantages: 'Nu sunt configurate avantaje cheie pentru acest produs.',
    noCarouselImages: 'Fără imagini în carusel',
    overviewPlaceholder: 'Conținutul secțiunii va apărea aici când este disponibil.',
    noFaqs: 'Încă nu există întrebări frecvente pentru acest produs.',
    tablistAria: 'Detalii produs',
    slide1: {
      title: 'Prezentare sistem container 20ft',
      caption: 'Prezentare sistem container 20ft',
      diagramTitle: 'Prezentare sistem container 20ft',
    },
    slide2: {
      title: 'Arhitectură sistem',
      battery: 'Baterie',
      bms: 'BMS',
      cooling: 'Răcire',
      mid: 'Sistem integrat de management energie și control',
      footer: 'Arhitectură sistem',
    },
    slide3: {
      title: 'Sistem modular de răcire lichidă',
      thermal: 'Management termic',
      loop: 'Circuit răcire lichidă',
      battery: 'Baterie',
      heat: 'Căldură',
      exchanger: 'Schimbător',
      radiator: 'Radiator',
      footer: 'Sistem modular de răcire lichidă',
    },
    slide4: {
      title: 'Parametri tehnici cheie',
      header: 'Specificații',
      cap: 'Capacitate: 334–501,5 kWh',
      volt: 'Tensiune: 1331,2 V nominal',
      pow: 'Putere: 1670–2507,5 kW',
      cycle: 'Cicluri: 8.000 @ 70% SOH (20 ani)',
      eff: 'Eficiență: ≥98,5%',
      footer: 'Parametri tehnici cheie',
    },
  },
  zh: {
    seoTitle: '20尺集装箱BESS | Baterino',
    seoDescription: '20尺集装箱电池储能系统——液冷模块化，334–501.5 kWh，工业级储能。电网、输配电与用户侧场景。',
    heroKicker: 'Baterino 携手 LithTech',
    heroTitle: '20尺集装箱电池储能系统（BESS）',
    heroSubtitle: '模块化液冷 · 334–501.5 kWh · 工业级储能',
    tabAdvantages: '核心优势',
    tabSpec: '技术规格',
    tabServices: 'Baterino 服务',
    tabWarranty: '质保与支持',
    tabFaq: '常见问题',
    overviewTitle: '概述',
    overviewModelsHeading: '型号要点',
    modelsLoadMore: '加载更多',
    overviewModelsTapHint: '点击型号查看技术详情',
    modelDesktopWhatsappPrefill: '您好，我想了解更多关于 {product} 的信息。型号：{model}。',
    modelDesktopDetailsCta: '产品详情',
    overviewP1:
      '20尺集装箱BESS以先进液冷、灵活扩展与工业级可靠性提供334–501.5 kWh模块化储能，适用于电网侧、输配电侧与用户侧场景。',
    overviewP2:
      '我们覆盖采购、安装、调试、运维与技术支持全流程，一体化服务模式确保全生命周期内的最佳运行表现。',
    downloadBrochure: '下载手册',
    contactTitle: '专属工业事业部',
    contactBlurb: '与我们的团队沟通项目细节。评估、交付与实施。',
    contactCta: '联系',
    carouselAria: 'BESS产品示意图',
    prevSlide: '上一张',
    nextSlide: '下一张',
    goToSlide: '转到',
    modelLabel: TECH_KEYS_ZH.model,
    techSpecByKey: TECH_KEYS_ZH,
    keyAdvantageFeatures: [
      '模块化液冷',
      '灵活扩展',
      '磷酸铁锂化学体系',
      '低噪声设计',
      '直流侧一站式方案',
      '多场景部署',
      '先进消防与安全',
      '远程监控',
    ],
    servicesIntro:
      '从采购物流到安装与长期运维，我们覆盖BESS项目全生命周期。一体化服务模式保障可靠性、合规与持续性能。',
    warrantyIntro: '全面的质保与技术支持，确保系统从首日运行到生命周期结束保持稳定可靠。',
    serviceSteps: [
      {
        title: '进口与采购',
        body: '直连制造商采购，质量与合规把关，协同东南亚与东欧物流。',
      },
      {
        title: '安装与调试',
        body: '持证工程师现场安装、系统集成、测试与投运，含场地准备与并网协助。',
      },
      {
        title: '售后服务',
        body: '计划维护、应急维修、备件保障与性能优化，区域服务网络覆盖。',
      },
    ],
    warrantyItems: [
      {
        title: '标准质保',
        body: '主要部件5年制造商质保，关键项目可选延长至10年。',
      },
      {
        title: '技术支持',
        body: '7×24远程监控与诊断，故障与应急响应团队待命。',
      },
      {
        title: '备件',
        body: '关键备件预置以缩短更换周期，并可对接厂商备件体系。',
      },
      {
        title: '培训与资料',
        body: '运维培训、维护手册与系统文档，支持团队能力建设。',
      },
    ],
    faqItems: [
      {
        q: '20尺集装箱BESS的容量范围？',
        a: '单箱可从334 kWh扩展至501.5 kWh，模块化设计便于按负荷与并网需求匹配功率与能量配置。',
      },
      {
        q: '适用于哪些场景？',
        a: '适用于电网侧、输配电侧以及工商业表后应用——削峰、备用与混合电站缓冲，尤其适合重视液冷与占地约束的场景。',
      },
      {
        q: '为何采用液冷而非风冷？',
        a: '液冷可保持更均匀的单体温度，有利于更高占空比循环、提升安全裕度，并在相同体积下往往获得更长使用寿命。',
      },
      {
        q: '典型质保与支持？',
        a: '主要部件通常享有5年制造商质保，关键项目可选10年。Baterino可匹配远程监控、备件与培训——详见“质保与支持”页签。',
      },
      {
        q: '是否覆盖物流、安装与调试？',
        a: '是的。我们提供进口与采购、专业安装调试及售后维护与性能优化，从签约到稳定运行单一责任路径。',
      },
    ],
    specBrochureWhenRows: '更多细节与图纸见技术手册。',
    specBrochureWhenEmpty: '完整技术规格见技术手册。',
    specOpenPdf: '打开技术手册（PDF）',
    specNoBrochure: '手册尚未上传。',
    noKeyAdvantages: '该产品尚未配置核心优势。',
    noCarouselImages: '暂无轮播图',
    overviewPlaceholder: '概述内容将在提供后显示。',
    noFaqs: '暂无常见问题。',
    tablistAria: '产品详情',
    slide1: {
      title: '20尺集装箱系统概览',
      caption: '20尺集装箱系统概览',
      diagramTitle: '20尺集装箱系统概览',
    },
    slide2: {
      title: '系统架构',
      battery: '电池',
      bms: 'BMS',
      cooling: '冷却',
      mid: '一体化功率管理与控制系统',
      footer: '系统架构',
    },
    slide3: {
      title: '模块化液冷系统',
      thermal: '热管理',
      loop: '液冷回路',
      battery: '电池',
      heat: '热量',
      exchanger: '换热器',
      radiator: '散热器',
      footer: '模块化液冷系统',
    },
    slide4: {
      title: '关键参数',
      header: '规格',
      cap: '容量：334–501.5 kWh',
      volt: '电压：额定1331.2 V',
      pow: '功率：1670–2507.5 kW',
      cycle: '循环：8000次 @ 70% SOH（20年）',
      eff: '效率：≥98.5%',
      footer: '关键参数',
    },
  },
}

export function getIndustrialBessTemplateTranslations(lang: LangCode): IndustrialBessTemplateTranslations {
  return translations[lang] ?? translations.en
}
