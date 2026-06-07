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
  tabCaseStudies: string
  overviewTitle: string
  /** Heading above per-model summary cards in Overview */
  overviewModelsHeading: string
  /** Mobile: reveal more model cards in 2-column grid */
  modelsLoadMore: string
  /** Hint under model cards heading: tap to open technical details */
  overviewModelsTapHint: string
  /** Desktop WhatsApp: prefilled chat text; placeholders {product}, {model} */
  modelDesktopWhatsappPrefill: string
  /** Desktop: label for WhatsApp „Cere ofertă” on model card hover */
  modelDesktopCereOfertaCta: string
  /** Desktop: download technical PDF when brochure exists for model */
  modelDesktopTechnicalPdfCta: string
  /** Sole model row: companion cards beside the configuration card */
  singleModelImportingTitle: string
  singleModelImportingBody: string
  singleModelTransportTitle: string
  singleModelTransportBody: string
  singleModelDocumentsTitle: string
  singleModelDocumentsBody: string
  singleModelDocumentsDownloadCta: string
  overviewP1: string
  overviewP2: string
  downloadBrochure: string
  contactTitle: string
  contactBlurb: string
  contactCta: string
  /** Sidebar / șablon: buton WhatsApp (industrial din admin) */
  contactWhatsappCta: string
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
    tabCaseStudies: 'Case studies',
    overviewTitle: 'Overview',
    overviewModelsHeading: 'Model highlights',
    modelsLoadMore: 'Load more',
    overviewModelsTapHint: 'Tap a model to see technical details',
    modelDesktopWhatsappPrefill:
      'Hi. I would like to know more details about {product}. Model: {model}.',
    modelDesktopCereOfertaCta: 'Request a quote',
    modelDesktopTechnicalPdfCta: 'Technical details',
    singleModelImportingTitle: 'Importing and sourcing',
    singleModelImportingBody:
      'Direct procurement from manufacturers with quality assurance, compliance verification, and logistics coordination across Southeast Asia and Eastern Europe.',
    singleModelTransportTitle: 'Transport and Baterino installation',
    singleModelTransportBody:
      'Nationwide delivery and on-site installation by Baterino certified technicians — site preparation, system integration, testing, and grid connection support.',
    singleModelDocumentsTitle: 'Download technical documents',
    singleModelDocumentsBody:
      'Full technical specifications, drawings, and product documentation are available in the technical brochure for this model.',
    singleModelDocumentsDownloadCta: 'Download PDF',
    overviewP1:
      'The 20FT Container BESS delivers 334–501.5 kWh of modular energy storage with advanced liquid cooling, flexible expansion, and industry-leading reliability. Supports grid-side, transmission-side, and user-side deployment scenarios.',
    overviewP2:
      'We handle everything: sourcing, installation, commissioning, maintenance, and technical support. Our integrated service model ensures optimal performance throughout the system\'s lifecycle.',
    downloadBrochure: 'Download Brochure',
    contactTitle: 'Dedicated industrial division',
    contactBlurb: 'Discuss your project details with our team. Assessment, delivery and implementation.',
    contactCta: 'Contact us',
    contactWhatsappCta: 'WhatsApp',
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
    tabCaseStudies: 'Studii de caz',
    overviewTitle: 'Prezentare',
    overviewModelsHeading: 'Configurații disponibile',
    modelsLoadMore: 'Încarcă mai mult',
    overviewModelsTapHint: 'Apasă pe model pentru a vedea detalii tehnice',
    modelDesktopWhatsappPrefill:
      'Salut. Aș dori să aflu mai multe detalii despre {product}. Model {model}.',
    modelDesktopCereOfertaCta: 'Cere ofertă',
    modelDesktopTechnicalPdfCta: 'Detalii tehnice',
    singleModelImportingTitle: 'Import și aprovizionare',
    singleModelImportingBody:
      'Achiziție directă de la producători, asigurarea calității, verificări de conformitate și logistică în Asia de Sud-Est și Europa de Est.',
    singleModelTransportTitle: 'Transport și instalare Baterino',
    singleModelTransportBody:
      'Livrare națională și instalare la fața locului de către tehnicieni certificați Baterino — pregătire amplasament, integrare, testare și conectare la rețea.',
    singleModelDocumentsTitle: 'Descarcă documentația tehnică',
    singleModelDocumentsBody:
      'Specificațiile complete, desenele și documentația produsului sunt disponibile în broșura tehnică pentru acest model.',
    singleModelDocumentsDownloadCta: 'Descarcă PDF',
    overviewP1:
      'BESS-ul în container de 20ft oferă 334–501,5 kWh de stocare modulară cu răcire lichidă avansată, expansiune flexibilă și fiabilitate industrială. Compatibil cu scenarii în rețea, transport și parte utilizator.',
    overviewP2:
      'Acoperim întregul flux: aprovizionare, instalare, punere în funcțiune, mentenanță și suport tehnic. Modelul integrat asigură performanță optimă pe durata de viață a sistemului.',
    downloadBrochure: 'Descarcă broșura',
    contactTitle: 'Divizia industrială dedicată',
    contactBlurb: 'Discută cu echipa noastră detaliile proiectului. Evaluare, livrare și implementare.',
    contactCta: 'Contactează-ne',
    contactWhatsappCta: 'WhatsApp',
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
}

export function getIndustrialBessTemplateTranslations(lang: LangCode): IndustrialBessTemplateTranslations {
  return translations[lang] ?? translations.en
}
