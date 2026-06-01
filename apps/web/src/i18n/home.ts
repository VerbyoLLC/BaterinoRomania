import type { LangCode } from './menu'

export type HomeTranslations = {
  seoTitle: string
  seoDesc: string

  // Hero – left installer box
  heroBoxTitle: string
  heroBoxDesc: string
  heroBoxCta: string

  // Hero v2 – heading above card slider
  heroV2Title: string
  /** Hero v2 – inverter search input placeholder */
  heroV2InverterSearchPlaceholder: string
  /** Hero v2 – card 2 (discount programmes) */
  heroV2Card2Title: string
  heroV2Card2Subtitle: string
  heroV2Card2Eyebrow: string
  heroV2Card2DiscountPct: string
  heroV2Card2DiscountNote: string
  heroV2Card2DiscountLead: string
  heroV2Card2EligibleFor: string
  heroV2Card2EligiblePensioners: string
  heroV2Card2EligibleFamilies: string
  heroV2Card2EligibleNeighbours: string
  heroV2Card2EligibleRural: string
  heroV2Card2Cta: string
  /** Hero v2 – card 3 (industrial supply) */
  heroV2Card3Title: string
  heroV2Card3Subtitle: string
  heroV2Card3Cta: string
  /** Hero v2 – card 2 (residential featured product overlay) */
  heroV2RezProductTitle: string
  heroV2RezProductSubtitle: string
  heroV2RezBadgeGarantie: string
  heroV2RezBadgeSwap: string
  heroV2RezBadgeReduceri: string
  heroV2RezBadgeRetur: string
  heroV2RezCtaOrder: string
  heroV2RezCtaDetails: string
  heroV2RezHeroPrice: string
  heroV2RezPriceLabel: string
  heroV2RezPriceNote: string
  heroV2RezBadgeService: string
  heroV2RezSpecCicluri: string
  heroV2RezSpecIp: string
  heroV2RezSpecChem: string
  /** Hero v2 – card 4 (BESS Cabinet 261 kWh overlay) */
  heroV2MedEyebrow: string
  heroV2MedProductTitle: string
  heroV2MedStockTag: string
  heroV2MedSpecCapacityLabel: string
  heroV2MedSpecCapacityValue: string
  heroV2MedSpecPowerLabel: string
  heroV2MedSpecPowerValue: string
  heroV2MedSpecCyclesLabel: string
  heroV2MedSpecCyclesValue: string
  heroV2MedSpecRetentionLabel: string
  heroV2MedSpecRetentionValue: string
  heroV2MedFeature1: string
  heroV2MedFeature2: string
  heroV2MedCta: string
  /** Hero v2 – card 5 (partner / instalatori overlay) */
  heroV2InstTitle: string
  heroV2InstLead: string
  heroV2InstBenefit1: string
  heroV2InstBenefit2: string
  heroV2InstBenefit3: string
  heroV2InstBenefit4: string
  heroV2InstCta: string

  // Hero – slider tabs
  heroSliderRez: string
  heroSliderInd: string
  heroSliderMed: string
  heroSliderInst: string

  // Hero – mobile slider (3 slides)
  heroMobile0Title: string
  heroMobile0Desc: string
  heroMobile1Title: string
  heroMobile1Desc: string
  heroMobile2Title: string
  heroMobile2Desc: string
  heroMobileInstDesc: string
  heroImageAlt: string

  // Hero – slider slide content
  heroSlideRezTitle: string
  heroSlideRezDesc: string
  heroSlideIndTitle: string
  heroSlideIndDesc: string
  heroSlideIndCta: string
  heroSlideMedTitle: string
  heroSlideMedDesc: string
  heroSlideMedCta: string
  heroSlideInstTitle: string
  heroSlideInstDesc: string   // supports **bold** markers
  heroSlideInstCta: string
  heroSlideInstImportatori: string

  // Hero – big right card
  heroCardTitle: string
  heroCardDesc: string   // supports **bold** markers
  heroImportatori: string
  heroCardCta: string
  poweredBy: string

  // Products section
  productsSectionTitle: string
  productsSafetyLink: string
  safetyCardDesc: string
  productsTabAll: string
  productsTabRez: string
  productsTabInd: string
  productsTabMed: string
  productsTabMar: string
  productsViewMore: string
  productsViewAll: string
  productsHowToChoose: string
  productsVoltageAll: string
  productsVoltageLow: string
  productsVoltageHigh: string
  includesTVA: string
  disponibilPentruParteneri: string
  /** Residential card: replaces price when visibility is partner-only / hidden */
  catalogDisponibilParteneriPrice: string
  /** Residential catalog: label above public price */
  pretLabel: string
  catalogIncludesVatWithPct: string
  catalogBadgeStocCategory: string
  catalogBadgeLivrareCategory: string
  catalogBadgeTransportCategory: string
  catalogBadgeInstalareCategory: string
  catalogStockInStock: string
  catalogStockOutOfStock: string
  catalogStockComingSoon: string
  catalogStockOnOrder: string
  catalogDelivery24h: string
  catalogDelivery48h: string
  catalogDelivery7_14d: string
  catalogDelivery60d: string
  catalogTransportFree: string
  catalogTransportPaid: string
  catalogInstallBaterino: string
  catalogInstallPartner: string
  catalogReducereBadge: string
  productsComingSoon: string
  welcomeModalWelcomeTo: string
  welcomeModalTitle: string
  welcomeModalSubtitle: string
  welcomeModalProfesionist: string
  welcomeModalClientFinal: string

  // Installed capacity counters
  capacitySectionEyebrow: string
  capacitySectionTitle: string
  capacitySectionSubtitle: string
  capacityMwUnit: string
  capacityCounter1Title: string
  capacityCounter1Subtitle: string
  capacityCounter2Title: string
  capacityCounter3Title: string
  capacityCounter4Title: string
  capacityCounter5Title: string

  // Features section
  featuresSectionTitle: string
  f1Title: string
  f1Desc: string
  f2Title: string
  f2Desc: string
  f3Title: string
  f3Desc: string
  f4Title: string
  f4Desc: string
  f5Title: string
  f5Desc: string
  f6Title: string
  f6Desc: string
  f7Title: string
  f7Desc: string
  f4ModalDesc: string
  f6ModalDesc: string
  f7ModalDesc: string
  featureModalClose: string
  featureModalMoreLink: string
  featuresShowMore: string

  // Reduceri section
  reduceriProgramLabel: string
  reduceriDiscountSuffix: string
  reduceriGridTitle: string
  reduceriViewAll: string
  reduceriGridSubtitle: string
  reduceriLoadMore: string
  reduceriCard1Title: string
  reduceriCard1Desc: string
  reduceriCard2Title: string
  reduceriCard2Desc: string
  reduceriCard3Title: string
  reduceriCard3Desc: string
  reduceriCard4Title: string
  reduceriCard4Desc: string

  // LithTech section
  lithtechTitle: string
  lithtechBody: string
  lithtechImgAltBaterino: string
  lithtechImgAltLithTech: string
  lithtechCardProduces: string
  lithtechCardImplements: string
  lithtechPartnershipLink: string

  // Divisions section
  divisionsSectionTitle: string
  divisionsSectionBody: string
  divisionsSectionBtn: string
  diviziileNoastreTitle: string
  diviziileNoastreSubtitle: string
  netTitle: string
  netBody: string
  divRezTitle: string
  divRezDesc: string
  divIndTitle: string
  divIndDesc: string
  divMarTitle: string
  divMarDesc: string
  divMedTitle: string
  divMedDesc: string

  // Accessibility
  ariaPrev: string
  ariaNext: string

  // Bottom CTA
  warrantyCtaTitle: string
  warrantyCtaSubtitle: string
  warrantyCtaButton: string
  ctaTitle: string
  ctaDesc: string
  ctaBtn1: string
  ctaBtn2: string
}

const translations: Record<LangCode, HomeTranslations> = {
  ro: {
    seoTitle: 'Baterino - Baterii LiFePO4 pentru sisteme fotovoltaice. Soluții stocare pentru sectorul rezidențial, industrial, medical și maritim.',
    seoDesc: 'Importator și distribuitor LithTech pentru baterii LiFePO4 și sisteme fotovoltaice pentru sectorul rezidențial, industrial, medical și maritim. Servicii complete, garanție 10 ani.',

    heroBoxTitle: 'Instalezi sau distribui sisteme fotovoltaice?',
    heroBoxDesc: 'Îți oferim produse validate înainte de import, marje competitive și prețuri stabile, service și suport, stocuri permanente.',
    heroBoxCta: 'Devino Partener',

    heroV2Title: 'Sisteme de stocare a energiei cu baterii LiFePO4',
    heroV2InverterSearchPlaceholder: 'Vezi compatibilitatea cu invertorul tău',
    heroV2Card2Title: 'Programe de reduceri de până la 20%',
    heroV2Card2Subtitle:
      'Descoperă reducerile noastre pentru seniori, prieteni, vecini și cei care locuiesc la țară.',
    heroV2Card2Eyebrow: 'Baterii rezidențiale',
    heroV2Card2DiscountPct: '20%',
    heroV2Card2DiscountNote: 'reducere',
    heroV2Card2DiscountLead: 'Până la 20% reducere',
    heroV2Card2EligibleFor: 'pentru:',
    heroV2Card2EligiblePensioners: 'Pensionari',
    heroV2Card2EligibleFamilies: 'Familii cu copii',
    heroV2Card2EligibleNeighbours: 'Vecini care se înscriu împreună',
    heroV2Card2EligibleRural: 'Gospodării din mediul rural',
    heroV2Card2Cta: 'Vezi Reduceri',
    heroV2Card3Title: 'Construiești un Proiect Industrial?',
    heroV2Card3Subtitle: 'Avem tehnologia și experiența pentru a-l realiza împreună.',
    heroV2Card3Cta: 'Vezi Proiecte Finalizate',
    heroV2RezProductTitle: 'EcoHome 10 kWh',
    heroV2RezProductSubtitle: 'LithTech · Baterie rezidențială LiFePO₄',
    heroV2RezBadgeGarantie: 'Garanție 10 ani',
    heroV2RezBadgeSwap: 'Baterino SWAP',
    heroV2RezBadgeReduceri: 'Programe de reducere',
    heroV2RezBadgeRetur: 'Retur în 15 zile',
    heroV2RezCtaOrder: 'Comandă acum',
    heroV2RezCtaDetails: 'Detalii',
    heroV2RezHeroPrice: '10.000 RON',
    heroV2RezPriceLabel: 'Preț excelent',
    heroV2RezPriceNote: 'Cel mai bun raport calitate-preț',
    heroV2RezBadgeService: 'Service și suport tehnic în România',
    heroV2RezSpecCicluri: '8.000 cicluri',
    heroV2RezSpecIp: 'IP65',
    heroV2RezSpecChem: 'LiFePO₄',

    heroV2MedEyebrow: 'Peste 20 de ani de funcționare garantată',
    heroV2MedProductTitle: 'BESS Cabinet 261 kWh',
    heroV2MedStockTag: 'În Stoc în România',
    heroV2MedSpecCapacityLabel: 'Capacitate',
    heroV2MedSpecCapacityValue: '261 kWh',
    heroV2MedSpecPowerLabel: 'Putere AC',
    heroV2MedSpecPowerValue: '125 kW',
    heroV2MedSpecCyclesLabel: 'Cicluri de viață',
    heroV2MedSpecCyclesValue: '8.000',
    heroV2MedSpecRetentionLabel: 'Retenție SOH',
    heroV2MedSpecRetentionValue: '70%',
    heroV2MedFeature1: 'Răcire cu lichid · Eficiență ≥99%',
    heroV2MedFeature2: 'Certificat IEC 61000 · Garanție 5/10 ani',
    heroV2MedCta: 'Detalii tehnice',

    heroV2InstTitle: 'Devino Partener Baterino',
    heroV2InstLead: 'Mai mult profit. Zero complicații.',
    heroV2InstBenefit1: 'Structură de preț orientată către parteneri',
    heroV2InstBenefit2: 'Preluăm responsabilitatea clientului final.',
    heroV2InstBenefit3: 'Stocuri permanente cu livrare în maxim 48 de ore',
    heroV2InstBenefit4: 'Service și suport tehnic în România, prin platforma Baterino.',
    heroV2InstCta: 'Devino Partener',

    heroSliderRez: 'REZIDENTIAL',
    heroSliderInd: 'INDUSTRIAL',
    heroSliderMed: 'MEDICAL',
    heroSliderInst: 'INSTALATORI',

    heroMobile0Title: 'Sisteme de stocare a energiei cu baterii LiFePO4',
    heroMobile0Desc: 'Pentru locuințe individuale și micro-grid-uri.',
    heroMobile1Title: 'Soluții BESS pentru stocare de energie la nivel MW',
    heroMobile1Desc: 'Proiecte integrate pentru industrie și parcuri fotovoltaice.',
    heroMobile2Title: 'Soluții BESS pentru infrastructura medicală critică',
    heroMobile2Desc: 'Pentru clinici de imagistică, stomatologie, centre de transfuzie și spitale.',
    heroMobileInstDesc: 'Îți oferim prețuri avantajoase, stocuri permanente în România cu livrare rapidă și suport tehnic local.',
    heroImageAlt: 'Baterii LiFePO4',

    heroSlideRezTitle: 'Soluții de stocare a energiei,\nrezidențiale și micro-grid-uri\ncu baterii LiFePO4',
    heroSlideRezDesc: 'Soluții dedicate **locuințelor individuale și micro-grid-urilor rezidențiale** — pentru autonomie energetică, siguranță și optimizarea autoconsumului.',
    heroSlideIndTitle: 'Soluții EPC pentru stocare de energie la nivel MW',
    heroSlideIndDesc: '**De la concept și dimensionare tehnică până la punere în funcțiune și mentenanță** — livrăm proiecte integrate pentru industrie și parcuri fotovoltaice.',
    heroSlideIndCta: 'AFLA MAI MULTE',
    heroSlideMedTitle: 'Sisteme de stocare a energiei pentru infrastructura medicală critică',
    heroSlideMedDesc: 'Proiectăm și instalăm sisteme de stocare a energiei pentru clinici de imagistică, stomatologie, centre de transfuzie și spitale — cu focus pe siguranță și continuitate, atunci când energia nu are voie să se oprească.',
    heroSlideMedCta: 'AFLA MAI MULTE',
    heroSlideInstTitle: 'NE MĂRIM REȚEAUA DE\nINSTALATORI ȘI DISTRIBUITORI',
    heroSlideInstDesc: 'Fiind importatori LithTech,** îți oferim prețuri avantajoase, stocuri permanente în România cu livrare rapidă și suport tehnic local**. În plus, **gestionăm relația cu clientul final și îți oferim acces la proiecte industriale de anvergură**.',
    heroSlideInstCta: 'VEZI AVANTAJE',
    heroSlideInstImportatori: 'Importatori',

    heroCardTitle: 'BATERII LIFEPO4 SISTEME FOTOVOLTAICE REZIDENTIAL ȘI INDUSTRIAL',
    heroCardDesc: 'Sisteme de stocare a energiei **pentru mediul rezidential, industrial și maritim**. **Service, mentenanță și suport tehnic** în **România**.',
    heroImportatori: 'Importatori oficiali',
    heroCardCta: 'VEZI PRODUSE',
    poweredBy: 'Powered by',

    productsSectionTitle: 'ALEGE BATERIA TA',
    productsSafetyLink: 'Siguranța achiziției',
    safetyCardDesc:
      'Garanție de 10 ani, service în România, SWAP și testare riguroasă — descoperă tot ce include promisiunea Baterino.',
    productsTabAll: 'TOATE',
    productsTabRez: 'REZIDENTIAL',
    productsTabInd: 'INDUSTRIAL',
    productsTabMed: 'MEDICAL',
    productsTabMar: 'MARITIM',
    productsViewMore: 'ÎNCARCĂ MAI MULT',
    productsViewAll: 'Vezi tot',
    productsHowToChoose: 'Cum aleg bateria?',
    productsVoltageAll: 'Tensiune',
    productsVoltageLow: 'Tensiune joasă',
    productsVoltageHigh: 'Tensiune înaltă',
    includesTVA: 'include TVA',
    disponibilPentruParteneri: 'VEZI DETALII',
    catalogDisponibilParteneriPrice: 'Disponibil Partneri',
    pretLabel: 'Preț',
    catalogIncludesVatWithPct: 'Include TVA {pct}%',
    catalogBadgeStocCategory: 'Stoc',
    catalogBadgeLivrareCategory: 'Livrare',
    catalogBadgeTransportCategory: 'Transport',
    catalogBadgeInstalareCategory: 'Instalare',
    catalogStockInStock: 'Stoc suficient',
    catalogStockOutOfStock: 'Stoc epuizat',
    catalogStockComingSoon: 'În curând',
    catalogStockOnOrder: 'La comandă',
    catalogDelivery24h: '24 de ore',
    catalogDelivery48h: '48 ore',
    catalogDelivery7_14d: '7 - 14 zile',
    catalogDelivery60d: '60 de zile',
    catalogTransportFree: 'Gratuit',
    catalogTransportPaid: 'Contra cost',
    catalogInstallBaterino: 'Baterino',
    catalogInstallPartner: 'Partener',
    catalogReducereBadge: 'Programe Reduceri',
    productsComingSoon: 'Site-ul este în curs de actualizare. Produsele vor fi disponibile în curând.',
    welcomeModalWelcomeTo: 'BINE AI VENIT LA',
    welcomeModalTitle: 'ESTI INSTALATOR SAU DISTRIBUITOR?',
    welcomeModalSubtitle: 'În funcție de alegerea ta, îți vom oferi o experiență adaptată nevoilor tale profesionale.',
    welcomeModalProfesionist: 'DA, SUNT PROFESIONIST',
    welcomeModalClientFinal: 'NU, SUNT CLIENT FINAL',

    capacitySectionEyebrow: 'Experiență dovedită',
    capacitySectionTitle: 'Capacitate instalată în România',
    capacitySectionSubtitle:
      'Sisteme de stocare a energiei livrate și puse în funcțiune, pe fiecare segment — de la locuințe individuale la proiecte industriale, medicale și maritime.',
    capacityMwUnit: 'MW',
    capacityCounter1Title: 'Instalați în România',
    capacityCounter1Subtitle: 'toate segmentele',
    capacityCounter2Title: 'Rezidențial',
    capacityCounter3Title: 'Industrial & C&I',
    capacityCounter4Title: 'Medical',
    capacityCounter5Title: 'Maritim',

    featuresSectionTitle: 'DE CE SĂ ÎȚI CUMPERI BATERIE DE LA NOI?',
    f1Title: 'Garanție extinsă 10 ani',
    f1Desc: 'Îți oferim garanție extinsă de 10 ani pentru toate produsele noastre.',
    f2Title: 'Service și Suport în România',
    f2Desc: 'Avem propriul departament de service pentru diagnoză și reparații în România.',
    f3Title: 'Serviciul SWAP Baterino',
    f3Desc: 'Îți oferim o baterie la schimb pe toată durata diagnozei produsului, în cazul apariției unei probleme.',
    f4Title: 'Compatibilitate cu 99% din invertoare',
    f4Desc: 'Indiferent ce invertor utilizezi, bateriile noastre sunt compatibile.',
    f5Title: 'Produse testate înainte de import',
    f5Desc: 'Fiecare produs este testat timp de 60 de zile înainte să fie pus în piață spre vânzare.',
    f6Title: 'Stocuri permanente în România',
    f6Desc: 'Avem stocuri suficiente pentru fiecare produs în depozitele noastre, strategic amplasate.',
    f7Title: 'Retur în 15 zile de la achiziționare',
    f7Desc: 'E puțin probabil, însă poți să returnezi produsul în termen de 15 zile de când l-ai achiziționat.',
    f4ModalDesc: 'Indiferent ce invertor utilizezi, bateriile noastre sunt **compatibile cu peste 99% din invertoarele disponibile pe piață**. Poți verifica compatibilitatea direct pe site sau contacta echipa noastră tehnică pentru recomandări personalizate.',
    f6ModalDesc: 'Avem **stocuri permanente în România** pentru fiecare produs, în depozite strategic amplasate. Astfel asigurăm **livrări rapide** și disponibilitate constantă, fără a depinde de termene lungi de import.',
    f7ModalDesc: 'Deși e puțin probabil să ai nevoie, **poți returna produsul în termen de 15 zile** de la achiziție, în condițiile prevăzute de politica noastră comercială. Ne dorim ca achiziția ta să fie una **sigură și fără riscuri inutile**.',
    featureModalClose: 'Închide',
    featureModalMoreLink: 'Siguranța achiziției',
    featuresShowMore: 'Arată mai multe',

    reduceriProgramLabel: 'PROGRAMUL',
    reduceriDiscountSuffix: 'REDUCERE',
    reduceriGridTitle: 'PROGRAME DE REDUCERI',
    reduceriViewAll: 'Vezi toate programele',
    reduceriGridSubtitle: 'Dezvoltăm programe de reduceri dedicate tuturor categoriilor de clienți. Suntem o companie cu o puternică componentă socială și ne dorim să facem stocarea energiei accesibilă tuturor.',
    reduceriLoadMore: 'ALTE REDUCERI',
    reduceriCard1Title: 'ENERGIE\nPENTRU PĂRINȚI',
    reduceriCard1Desc: 'Pentru pensionarii care doresc să își achiziționeze o baterie.',
    reduceriCard2Title: 'TVA-ul CUM ERA ODATĂ',
    reduceriCard2Desc: 'Primești 12% reducere pentru toate produsele Baterino, din prețul fără TVA.',
    reduceriCard3Title: 'CUM E\nVIAȚA LA ȚARĂ?',
    reduceriCard3Desc: 'Beneficiezi de 7% reducere dacă ai domiciliu într-o comună sau sat.',
    reduceriCard4Title: 'ȘTIU DE LA VECINU\'',
    reduceriCard4Desc: 'Beneficiezi de 5% reducere cu un cod de la un client Baterino deja existent.',

    lithtechTitle: 'IMPORTATORI ȘI DISTRIBUITORI LITHTECH',
    lithtechBody: 'Am ales să colaborăm cu un singur producător de sisteme de stocare energetică, atât pentru sectorul rezidențial, cât și pentru cel industrial, pentru a putea oferi produse de calitate, mentenanță și suport tehnic real după vânzare.\n\nRolul nostru este să protejăm clientul final, să contribuim la o piață transparentă și să susținem standardele brandului LithTech în România.',
    lithtechImgAltBaterino: 'Baterino – livrare și sisteme solare',
    lithtechImgAltLithTech: 'LithTech – importator și distribuitor în România',
    lithtechCardProduces: 'PRODUCE TEHNOLOGIE',
    lithtechCardImplements: 'IMPLEMENTEAZĂ',
    lithtechPartnershipLink: 'VEZI PARTENERIAT',
    divisionsSectionTitle: 'RESPONSABILITATE ȘI COMUNITATE',
    divisionsSectionBody: 'Suntem o companie cu capital 100% românesc, parte din grupul Baterino Global, activă pe piața din România din 2025 și în plină expansiune la nivel european și internațional. Misiunea noastră este să oferim produse de calitate, susținute de servicii și suport real, atât în momentul achiziției, cât și pe termen lung, după vânzare.',
    divisionsSectionBtn: 'DESPRE NOI',
    diviziileNoastreTitle: 'DIVIZIILE BATERINO',
    diviziileNoastreSubtitle: 'Suntem, probabil, singura companie din domeniu care deține o divizie dedicată exclusiv sectorului medical, oferind soluții de stocare a energiei adaptate infrastructurilor critice.',
    netTitle: 'REȚEA NAȚIONALĂ ÎN ROMÂNIA',
    netBody: 'Suntem prezenți la nivel național prin rețeaua noastră de distribuitori, centre de asistență și depozite poziționate strategic.',
    divRezTitle: 'REZIDENTIAL',
    divRezDesc: 'Pentru locuințe individuale și micro-grid-uri.',
    divIndTitle: 'INDUSTRIAL',
    divIndDesc: 'Pentru sectorul industrial și comercial din România.',
    divMarTitle: 'MARITIM',
    divMarDesc: 'Soluții de stocare a energiei pentru mediul maritim.',
    divMedTitle: 'MEDICAL',
    divMedDesc: 'Pentru clinici de imagistică și cabinete stomatologice.',

    warrantyCtaTitle: '10 Ani Garanție – Cea mai extinsă din România',
    warrantyCtaSubtitle:
      'Ca importatori direcți și tehnicieni certificați LithTech, suntem singurii care pot oferi această garanție în România. Asigurăm service-ul local și stăm alături de tine pentru fiecare pas, timp de 10 ani.',
    warrantyCtaButton: 'Vezi Produsele',

    ctaTitle: 'Discutați cu echipa noastră',
    ctaDesc: 'Evaluăm și dimensionăm soluții energetice adaptate nevoilor dumneavoastră.',
    ctaBtn1: 'VEZI PRODUSE',
    ctaBtn2: 'DISCUTĂ CU NOI',
    ariaPrev: 'Anterior',
    ariaNext: 'Următorul',
  },

  en: {
    seoTitle: 'Baterino Romania – LiFePO4 Batteries & Solar Systems',
    seoDesc: 'Importer and distributor of LiFePO4 batteries and solar systems for residential, industrial, medical and maritime sectors. Complete services, 10-year warranty.',

    heroBoxTitle: 'Do you install or distribute solar systems?',
    heroBoxDesc: 'We offer products validated before import, competitive margins and stable prices, service and support, permanent stock.',
    heroBoxCta: 'Become a Partner',

    heroV2Title: 'Energy storage systems with LiFePO4 batteries',
    heroV2InverterSearchPlaceholder: 'See compatibility with your inverter',
    heroV2Card2Title: 'Discount programmes up to 20% off',
    heroV2Card2Subtitle:
      'Discover our discounts for seniors, friends, neighbours, and those living in the countryside.',
    heroV2Card2Eyebrow: 'Residential batteries',
    heroV2Card2DiscountPct: '20%',
    heroV2Card2DiscountNote: 'off',
    heroV2Card2DiscountLead: 'Up to 20% off',
    heroV2Card2EligibleFor: 'for:',
    heroV2Card2EligiblePensioners: 'Pensioners',
    heroV2Card2EligibleFamilies: 'Families with children',
    heroV2Card2EligibleNeighbours: 'Neighbours signing up together',
    heroV2Card2EligibleRural: 'Households in rural areas',
    heroV2Card2Cta: 'See discounts',
    heroV2Card3Title: 'Are you building an industrial project?',
    heroV2Card3Subtitle: 'We have the technology and experience to build it together.',
    heroV2Card3Cta: 'See completed projects',
    heroV2RezProductTitle: 'EcoHome 10 kWh',
    heroV2RezProductSubtitle: 'LithTech · Residential LiFePO₄ battery',
    heroV2RezBadgeGarantie: '10-year warranty',
    heroV2RezBadgeSwap: 'Baterino SWAP',
    heroV2RezBadgeReduceri: 'Discount programmes',
    heroV2RezBadgeRetur: '15-day returns',
    heroV2RezCtaOrder: 'Order now',
    heroV2RezCtaDetails: 'Details',
    heroV2RezHeroPrice: '10,000 RON',
    heroV2RezPriceLabel: 'Excellent price',
    heroV2RezPriceNote: 'Best value for money',
    heroV2RezBadgeService: 'Service and technical support in Romania',
    heroV2RezSpecCicluri: '8,000 cycles',
    heroV2RezSpecIp: 'IP65',
    heroV2RezSpecChem: 'LiFePO₄',

    heroV2MedEyebrow: 'Over 20 years of guaranteed operation',
    heroV2MedProductTitle: 'BESS Cabinet 261 kWh',
    heroV2MedStockTag: 'In stock in Romania',
    heroV2MedSpecCapacityLabel: 'Capacity',
    heroV2MedSpecCapacityValue: '261 kWh',
    heroV2MedSpecPowerLabel: 'AC power',
    heroV2MedSpecPowerValue: '125 kW',
    heroV2MedSpecCyclesLabel: 'Cycle life',
    heroV2MedSpecCyclesValue: '8,000',
    heroV2MedSpecRetentionLabel: 'SOH retention',
    heroV2MedSpecRetentionValue: '70%',
    heroV2MedFeature1: 'Liquid cooling · Efficiency ≥99%',
    heroV2MedFeature2: 'IEC 61000 certified · 5/10 year warranty',
    heroV2MedCta: 'Technical details',

    heroV2InstTitle: 'Become a Baterino Partner',
    heroV2InstLead: 'More profit. Zero hassle.',
    heroV2InstBenefit1: 'Partner-oriented pricing structure',
    heroV2InstBenefit2: 'We take responsibility for the end customer.',
    heroV2InstBenefit3: 'Permanent stock with delivery in up to 48 hours',
    heroV2InstBenefit4: 'Service and technical support in Romania through the Baterino platform.',
    heroV2InstCta: 'Become a Partner',

    heroSliderRez: 'RESIDENTIAL',
    heroSliderInd: 'INDUSTRIAL',
    heroSliderMed: 'MEDICAL',
    heroSliderInst: 'INSTALLERS',

    heroMobile0Title: 'Energy storage systems with LiFePO4 batteries',
    heroMobile0Desc: 'For individual homes and micro-grids.',
    heroMobile1Title: 'BESS solutions for MW-scale energy storage',
    heroMobile1Desc: 'Integrated projects for industry and solar parks.',
    heroMobile2Title: 'BESS solutions for critical medical infrastructure',
    heroMobile2Desc: 'For imaging clinics, dental practices, transfusion centres and hospitals.',
    heroMobileInstDesc: 'We offer you competitive pricing, permanent stock in Romania with fast delivery and local technical support.',
    heroImageAlt: 'LiFePO4 batteries',

    heroSlideRezTitle: 'Energy storage solutions,\nresidential and micro-grids\nwith LiFePO4 batteries',
    heroSlideRezDesc: 'Solutions dedicated to **individual homes and residential micro-grids** — for energy autonomy, safety and self-consumption optimisation.',
    heroSlideIndTitle: 'EPC solutions for MW-scale energy storage',
    heroSlideIndDesc: '**From concept and technical sizing to commissioning and maintenance** — we deliver integrated projects for industry and solar parks.',
    heroSlideIndCta: 'LEARN MORE',
    heroSlideMedTitle: 'Energy storage systems for critical medical infrastructure',
    heroSlideMedDesc: 'We design and install energy storage systems for imaging clinics, dental practices, transfusion centres and hospitals — with a focus on safety and continuity, when power cannot afford to stop.',
    heroSlideMedCta: 'LEARN MORE',
    heroSlideInstTitle: 'WE ARE EXPANDING OUR NETWORK OF\nINSTALLERS AND DISTRIBUTORS',
    heroSlideInstDesc: 'As LithTech importers,** we offer you competitive pricing, permanent stock in Romania with fast delivery and local technical support**. In addition, **we manage the end-client relationship and give you access to large-scale industrial projects**.',
    heroSlideInstCta: 'SEE BENEFITS',
    heroSlideInstImportatori: 'Importers',

    heroCardTitle: 'LIFEPO4 BATTERIES SOLAR SYSTEMS RESIDENTIAL AND INDUSTRIAL',
    heroCardDesc: 'Energy storage systems **for residential, industrial and maritime environments**. **Service, maintenance and technical support** in **Romania**.',
    heroImportatori: 'Official importers',
    heroCardCta: 'VIEW PRODUCTS',
    poweredBy: 'Powered by',

    productsSectionTitle: 'CHOOSE YOUR BATTERY',
    productsSafetyLink: 'Purchase safety',
    safetyCardDesc:
      '10-year warranty, service in Romania, SWAP and rigorous testing — discover everything included in the Baterino promise.',
    productsTabAll: 'ALL',
    productsTabRez: 'RESIDENTIAL',
    productsTabInd: 'INDUSTRIAL',
    productsTabMed: 'MEDICAL',
    productsTabMar: 'MARITIME',
    productsViewMore: 'LOAD MORE',
    productsViewAll: 'See all',
    productsHowToChoose: 'How do I choose?',
    productsVoltageAll: 'Voltage',
    productsVoltageLow: 'Low Voltage',
    productsVoltageHigh: 'High Voltage',
    includesTVA: 'includes VAT',
    disponibilPentruParteneri: 'VIEW DETAILS',
    catalogDisponibilParteneriPrice: 'Available to partners',
    pretLabel: 'Price',
    catalogIncludesVatWithPct: 'Includes VAT {pct}%',
    catalogBadgeStocCategory: 'Stock',
    catalogBadgeLivrareCategory: 'Delivery',
    catalogBadgeTransportCategory: 'Transport',
    catalogBadgeInstalareCategory: 'Instalare',
    catalogStockInStock: 'In stock',
    catalogStockOutOfStock: 'Out of stock',
    catalogStockComingSoon: 'Coming soon',
    catalogStockOnOrder: 'On order',
    catalogDelivery24h: '24 hours',
    catalogDelivery48h: '48 hours',
    catalogDelivery7_14d: '7 - 14 days',
    catalogDelivery60d: '60 days',
    catalogTransportFree: 'Free',
    catalogTransportPaid: 'Paid',
    catalogInstallBaterino: 'Baterino',
    catalogInstallPartner: 'Partner',
    catalogReducereBadge: 'Discount programs',
    productsComingSoon: 'The site is being updated. Products will be available soon.',
    welcomeModalWelcomeTo: 'WELCOME TO',
    welcomeModalTitle: 'ARE YOU AN INSTALLER OR DISTRIBUTOR?',
    welcomeModalSubtitle: 'Depending on your choice, we will offer you an experience tailored to your professional needs.',
    welcomeModalProfesionist: 'YES, I AM A PROFESSIONAL',
    welcomeModalClientFinal: 'NO, I AM AN END CUSTOMER',

    capacitySectionEyebrow: 'Proven track record',
    capacitySectionTitle: 'Installed capacity in Romania',
    capacitySectionSubtitle:
      'Energy storage systems delivered and commissioned across every segment — from individual homes to industrial, medical and maritime projects.',
    capacityMwUnit: 'MW',
    capacityCounter1Title: 'Installed in Romania',
    capacityCounter1Subtitle: 'all segments',
    capacityCounter2Title: 'Residential',
    capacityCounter3Title: 'Industrial & C&I',
    capacityCounter4Title: 'Medical',
    capacityCounter5Title: 'Maritime',

    featuresSectionTitle: 'WHY BUY YOUR BATTERY FROM US?',
    f1Title: 'Extended 10-Year Warranty',
    f1Desc: 'We offer an extended 10-year warranty on all our products.',
    f2Title: 'Service & Support in Romania',
    f2Desc: 'We have our own service department for diagnosis and repairs in Romania.',
    f3Title: 'Baterino SWAP Service',
    f3Desc: 'We provide a replacement battery for the entire duration of your product diagnosis if a problem arises.',
    f4Title: 'Compatible with 99% of Inverters',
    f4Desc: 'No matter what inverter you use, our batteries are compatible.',
    f5Title: 'Products Tested Before Import',
    f5Desc: 'Every product is tested for 60 days before being placed on the market for sale.',
    f6Title: 'Permanent Stock in Romania',
    f6Desc: 'We maintain sufficient stock for every product in our strategically located warehouses.',
    f7Title: 'Returns Within 15 Days',
    f7Desc: 'Unlikely to be needed, but you can return the product within 15 days of purchase.',
    f4ModalDesc: 'No matter what inverter you use, our batteries are **compatible with over 99% of inverters on the market**. You can check compatibility directly on the site or contact our technical team for personalised recommendations.',
    f6ModalDesc: 'We maintain **permanent stock in Romania** for every product in strategically located warehouses. This ensures **fast delivery** and constant availability without relying on long import lead times.',
    f7ModalDesc: 'Although unlikely to be needed, **you can return the product within 15 days** of purchase under our commercial policy. We want your purchase to be **safe and free from unnecessary risk**.',
    featureModalClose: 'Close',
    featureModalMoreLink: 'Purchase safety',
    featuresShowMore: 'Show more',

    reduceriProgramLabel: 'PROGRAMME',
    reduceriDiscountSuffix: 'DISCOUNT',
    reduceriGridTitle: 'DISCOUNT PROGRAMMES',
    reduceriViewAll: 'See all programmes',
    reduceriGridSubtitle: 'We develop discount programmes dedicated to all client categories. We are a company with a strong social component and we want to make energy storage accessible to everyone.',
    reduceriLoadMore: 'OTHER DISCOUNTS',
    reduceriCard1Title: 'ENERGY\nFOR PARENTS',
    reduceriCard1Desc: 'For pensioners who want to purchase a battery.',
    reduceriCard2Title: 'VAT AS IT USED TO BE',
    reduceriCard2Desc: 'Get 12% discount on all Baterino products, from the VAT-exclusive price.',
    reduceriCard3Title: 'WHAT\'S\nLIFE LIKE IN THE COUNTRY?',
    reduceriCard3Desc: 'Benefit from 7% discount if your registered address is in a commune or village.',
    reduceriCard4Title: 'I HEARD IT FROM THE NEIGHBOUR',
    reduceriCard4Desc: 'Benefit from 5% discount with a code from an existing Baterino client.',

    lithtechTitle: 'LITHTECH IMPORTERS & DISTRIBUTORS',
    lithtechBody: 'We chose to work with a single energy storage system manufacturer — for both residential and industrial sectors — in order to offer quality products, maintenance and real post-sale technical support.\n\nOur role is to protect the end client, contribute to a transparent market and uphold LithTech brand standards in Romania.',
    lithtechImgAltBaterino: 'Baterino – delivery and solar systems',
    lithtechImgAltLithTech: 'LithTech – importer and distributor in Romania',
    lithtechCardProduces: 'PRODUCES TECHNOLOGY',
    lithtechCardImplements: 'IMPLEMENTS',
    lithtechPartnershipLink: 'SEE PARTNERSHIP',
    divisionsSectionTitle: 'RESPONSIBILITY AND COMMUNITY',
    divisionsSectionBody: 'We are a company with 100% Romanian capital, part of the Baterino Global group, active on the Romanian market since 2025 and rapidly expanding across Europe and internationally. Our mission is to offer quality products backed by real services and support, both at the point of purchase and long-term, after the sale.',
    divisionsSectionBtn: 'ABOUT US',
    diviziileNoastreTitle: 'BATERINO DIVISIONS',
    diviziileNoastreSubtitle: 'We are probably the only company in the field that has a division dedicated exclusively to the medical sector, offering energy storage solutions adapted to critical infrastructure.',
    netTitle: 'NATIONAL NETWORK IN ROMANIA',
    netBody: 'We are present nationwide through our network of distributors, assistance centres and strategically positioned warehouses.',
    divRezTitle: 'RESIDENTIAL',
    divRezDesc: 'For individual homes and micro-grids.',
    divIndTitle: 'INDUSTRIAL',
    divIndDesc: 'For the industrial and commercial sector in Romania.',
    divMarTitle: 'MARITIME',
    divMarDesc: 'Energy storage solutions for the maritime environment.',
    divMedTitle: 'MEDICAL',
    divMedDesc: 'For imaging clinics and dental practices.',

    warrantyCtaTitle: '10-Year Warranty – The most extensive in Romania',
    warrantyCtaSubtitle:
      'As direct LithTech importers and certified technicians, we are the only ones who can offer this warranty in Romania. We provide local service and stand with you every step of the way for 10 years.',
    warrantyCtaButton: 'View Products',

    ctaTitle: 'Talk to our team',
    ctaDesc: 'We evaluate and size energy solutions tailored to your needs.',
    ctaBtn1: 'VIEW PRODUCTS',
    ctaBtn2: 'TALK TO US',
    ariaPrev: 'Previous',
    ariaNext: 'Next',
  },

  zh: {
    seoTitle: 'Baterino 罗马尼亚 – 磷酸铁锂电池与光伏系统',
    seoDesc: '磷酸铁锂电池及光伏系统进口商和分销商，服务住宅、工业、医疗和航海领域。完整服务，十年质保。',

    heroBoxTitle: '您是否安装或分销光伏系统？',
    heroBoxDesc: '我们提供进口前验证的产品、有竞争力的利润和稳定价格、服务与支持、持续库存。',
    heroBoxCta: '成为合作伙伴',

    heroV2Title: '磷酸铁锂电池储能系统',
    heroV2InverterSearchPlaceholder: '查看与您逆变器的兼容性',
    heroV2Card2Title: '高达20%折扣计划',
    heroV2Card2Subtitle: '了解我们为老年人、朋友、邻居以及农村居民提供的专属折扣。',
    heroV2Card2Eyebrow: '住宅电池',
    heroV2Card2DiscountPct: '20%',
    heroV2Card2DiscountNote: '折扣',
    heroV2Card2DiscountLead: '高达20%折扣',
    heroV2Card2EligibleFor: '适用于：',
    heroV2Card2EligiblePensioners: '退休人员',
    heroV2Card2EligibleFamilies: '有孩子的家庭',
    heroV2Card2EligibleNeighbours: '一起报名的邻居',
    heroV2Card2EligibleRural: '农村家庭',
    heroV2Card2Cta: '查看折扣',
    heroV2Card3Title: '您在建设工业项目吗？',
    heroV2Card3Subtitle: '我们拥有技术和经验，与您一起实现它。',
    heroV2Card3Cta: '查看已完成项目',
    heroV2RezProductTitle: 'EcoHome 10 kWh',
    heroV2RezProductSubtitle: 'LithTech · 住宅 LiFePO₄ 电池',
    heroV2RezBadgeGarantie: '10年保修',
    heroV2RezBadgeSwap: 'Baterino SWAP',
    heroV2RezBadgeReduceri: '折扣计划',
    heroV2RezBadgeRetur: '15天退货',
    heroV2RezCtaOrder: '立即订购',
    heroV2RezCtaDetails: '详情',
    heroV2RezHeroPrice: '10,000 RON',
    heroV2RezPriceLabel: '超值价格',
    heroV2RezPriceNote: '最佳性价比',
    heroV2RezBadgeService: '罗马尼亚本地服务与技术支持',
    heroV2RezSpecCicluri: '8,000 次循环',
    heroV2RezSpecIp: 'IP65',
    heroV2RezSpecChem: 'LiFePO₄',

    heroV2MedEyebrow: '超过20年保证运行',
    heroV2MedProductTitle: 'BESS Cabinet 261 kWh',
    heroV2MedStockTag: '罗马尼亚现货',
    heroV2MedSpecCapacityLabel: '容量',
    heroV2MedSpecCapacityValue: '261 kWh',
    heroV2MedSpecPowerLabel: '交流功率',
    heroV2MedSpecPowerValue: '125 kW',
    heroV2MedSpecCyclesLabel: '循环寿命',
    heroV2MedSpecCyclesValue: '8,000',
    heroV2MedSpecRetentionLabel: 'SOH 保持率',
    heroV2MedSpecRetentionValue: '70%',
    heroV2MedFeature1: '液冷 · 效率 ≥99%',
    heroV2MedFeature2: 'IEC 61000 认证 · 5/10 年保修',
    heroV2MedCta: '技术详情',

    heroV2InstTitle: '成为 Baterino 合作伙伴',
    heroV2InstLead: '更多利润，零烦恼。',
    heroV2InstBenefit1: '面向合作伙伴的定价结构',
    heroV2InstBenefit2: '我们承担终端客户的责任。',
    heroV2InstBenefit3: '常备库存，最多48小时内送达',
    heroV2InstBenefit4: '通过 Baterino 平台在罗马尼亚提供本地服务与技术支持。',
    heroV2InstCta: '成为合作伙伴',

    heroSliderRez: '住宅',
    heroSliderInd: '工业',
    heroSliderMed: '医疗',
    heroSliderInst: '安装商',

    heroMobile0Title: '磷酸铁锂电池储能系统',
    heroMobile0Desc: '适用于独栋住宅和微电网。',
    heroMobile1Title: '兆瓦级储能BESS解决方案',
    heroMobile1Desc: '为工业和光伏电站提供一体化项目。',
    heroMobile2Title: '关键医疗基础设施BESS解决方案',
    heroMobile2Desc: '适用于影像中心、牙科诊所、输血中心和医院。',
    heroMobileInstDesc: '我们为您提供有竞争力的价格、罗马尼亚常备库存、快速配送和本地技术支持。',
    heroImageAlt: '磷酸铁锂电池',

    heroSlideRezTitle: '储能解决方案，\n住宅与微电网\n磷酸铁锂电池',
    heroSlideRezDesc: '专为独栋住宅和住宅微电网设计的解决方案——实现能源自主、安全和自用优化。',
    heroSlideIndTitle: '兆瓦级储能EPC解决方案',
    heroSlideIndDesc: '从概念和技术选型到调试和维护——我们为工业和光伏电站提供一体化项目。',
    heroSlideIndCta: '了解更多',
    heroSlideMedTitle: '关键医疗基础设施储能系统',
    heroSlideMedDesc: '我们为影像中心、牙科诊所、输血中心和医院设计和安装储能系统——专注于安全和连续性，在电力不容中断的场合。',
    heroSlideMedCta: '了解更多',
    heroSlideInstTitle: '我们正在扩大\n安装商和分销商网络',
    heroSlideInstDesc: '作为LithTech进口商，**我们为您提供有竞争力的价格、罗马尼亚常备库存、快速配送和本地技术支持**。此外，**我们管理终端客户关系并为您提供大型工业项目机会**。',
    heroSlideInstCta: '查看优势',
    heroSlideInstImportatori: '进口商',

    heroCardTitle: '磷酸铁锂电池 光伏系统 住宅与工业',
    heroCardDesc: '**住宅、工业和航海领域**的储能系统。在**罗马尼亚**提供**服务、维护和技术支持**。',
    heroImportatori: '官方进口商',
    heroCardCta: '查看产品',
    poweredBy: 'Powered by',

    productsSectionTitle: '选择您的电池',
    productsSafetyLink: '购买安全',
    safetyCardDesc: '10年质保、罗马尼亚本地服务、换电服务与严格测试——了解Baterino承诺的全部内容。',
    productsTabAll: '全部',
    productsTabRez: '住宅',
    productsTabInd: '工业',
    productsTabMed: '医疗',
    productsTabMar: '航海',
    productsViewMore: '加载更多',
    productsViewAll: '查看全部',
    productsHowToChoose: '如何选择电池？',
    productsVoltageAll: '电压',
    productsVoltageLow: '低压',
    productsVoltageHigh: '高压',
    includesTVA: '含增值税',
    disponibilPentruParteneri: '查看详情',
    catalogDisponibilParteneriPrice: '合作伙伴专享',
    pretLabel: '价格',
    catalogIncludesVatWithPct: '含增值税 {pct}%',
    catalogBadgeStocCategory: '库存',
    catalogBadgeLivrareCategory: '配送',
    catalogBadgeTransportCategory: '运输',
    catalogStockInStock: '库存充足',
    catalogStockOutOfStock: '售罄',
    catalogStockComingSoon: '即将到货',
    catalogStockOnOrder: '预订',
    catalogDelivery24h: '24 小时',
    catalogDelivery48h: '48 小时',
    catalogDelivery7_14d: '7 - 14 天',
    catalogDelivery60d: '60 天',
    catalogTransportFree: '免费',
    catalogTransportPaid: '付费',
    catalogInstallBaterino: 'Baterino',
    catalogInstallPartner: '合作伙伴',
    catalogReducereBadge: '折扣计划',
    productsComingSoon: '网站正在更新中，产品即将推出。',
    welcomeModalWelcomeTo: '欢迎来到',
    welcomeModalTitle: '您是安装商还是分销商？',
    welcomeModalSubtitle: '根据您的选择，我们将为您提供适合您专业需求的体验。',
    welcomeModalProfesionist: '我是专业人士',
    welcomeModalClientFinal: '我是终端客户',

    capacitySectionEyebrow: '实绩证明',
    capacitySectionTitle: '罗马尼亚已安装容量',
    capacitySectionSubtitle:
      '已交付并投入运行的储能系统，覆盖住宅、工业、医疗与航海等各个细分市场。',
    capacityMwUnit: 'MW',
    capacityCounter1Title: '罗马尼亚已安装',
    capacityCounter1Subtitle: '全部细分市场',
    capacityCounter2Title: '住宅',
    capacityCounter3Title: '工业与商业',
    capacityCounter4Title: '医疗',
    capacityCounter5Title: '航海',

    featuresSectionTitle: '为什么选择我们购买电池？',
    f1Title: '延长10年质保',
    f1Desc: '我们为所有产品提供10年延长质保。',
    f2Title: '罗马尼亚售后服务与支持',
    f2Desc: '我们拥有自己的服务部门，在罗马尼亚提供诊断和维修。',
    f3Title: 'Baterino换电服务',
    f3Desc: '在产品诊断期间，若出现问题，我们为您提供替换电池。',
    f4Title: '兼容99%的逆变器',
    f4Desc: '无论您使用哪款逆变器，我们的电池均兼容。',
    f5Title: '进口前产品测试',
    f5Desc: '每款产品在上市销售前经过60天测试。',
    f6Title: '罗马尼亚常备库存',
    f6Desc: '我们在战略位置的仓库中为每款产品保持充足库存。',
    f7Title: '15天退货保障',
    f7Desc: '虽然可能性极低，但您可以在购买后15天内退货。',
    f4ModalDesc: '无论您使用哪款逆变器，我们的电池**兼容市场上99%以上的逆变器**。您可以直接在网站上查看兼容性，或联系我们的技术团队获取个性化建议。',
    f6ModalDesc: '我们在战略位置的仓库中为每款产品保持**罗马尼亚常备库存**，确保**快速交付**和持续供应，无需依赖漫长的进口周期。',
    f7ModalDesc: '虽然不太可能需要，但根据我们的商业政策，**您可以在购买后15天内退货**。我们希望您的购买**安全且无多余风险**。',
    featureModalClose: '关闭',
    featureModalMoreLink: '购买安全保障',
    featuresShowMore: '显示更多',

    reduceriProgramLabel: '计划',
    reduceriDiscountSuffix: '折扣',
    reduceriGridTitle: '折扣计划',
    reduceriViewAll: '查看全部计划',
    reduceriGridSubtitle: '我们为各类客户开发专属折扣计划。我们是一家具有强烈社会责任感的企业，希望让每个人都能用上储能产品。',
    reduceriLoadMore: '其他折扣',
    reduceriCard1Title: '父母能源',
    reduceriCard1Desc: '面向希望购买电池的退休人员。',
    reduceriCard2Title: '昔日增值税',
    reduceriCard2Desc: '所有Baterino产品享受不含税价格12%折扣。',
    reduceriCard3Title: '乡村生活',
    reduceriCard3Desc: '若您的户籍在乡镇或村庄，可享受7%折扣。',
    reduceriCard4Title: '邻居推荐',
    reduceriCard4Desc: '使用现有Baterino客户的推荐码可享受5%折扣。',

    lithtechTitle: 'LITHTECH 进口商与分销商',
    lithtechBody: '我们选择与单一储能系统制造商合作——涵盖住宅和工业领域——以提供优质产品、维护和真实的售后技术支持。\n\n我们的职责是保护终端客户，促进透明市场，并在罗马尼亚维护LithTech品牌标准。',
    lithtechImgAltBaterino: 'Baterino – 配送与光伏系统',
    lithtechImgAltLithTech: 'LithTech – 罗马尼亚进口商与分销商',
    lithtechCardProduces: '生产技术',
    lithtechCardImplements: '实施',
    lithtechPartnershipLink: '查看合作',
    divisionsSectionTitle: '责任与社区',
    divisionsSectionBody: '我们是一家100%罗马尼亚资本的公司，隶属于Baterino Global集团，自2025年起活跃于罗马尼亚市场，并正在欧洲和国际市场快速扩张。我们的使命是提供优质产品，辅以真实的服务和支持，无论是在购买时还是销售后的长期服务。',
    divisionsSectionBtn: '关于我们',
    diviziileNoastreTitle: 'BATERINO 部门',
    diviziileNoastreSubtitle: '我们可能是业内唯一拥有专门面向医疗领域的部门的公司，为关键基础设施提供量身定制的储能解决方案。',
    netTitle: '罗马尼亚全国网络',
    netBody: '我们通过经销商网络、服务中心和战略性仓库在全国各地提供服务。',
    divRezTitle: '住宅',
    divRezDesc: '适用于独栋住宅和微电网。',
    divIndTitle: '工业',
    divIndDesc: '面向罗马尼亚工业和商业领域。',
    divMarTitle: '航海',
    divMarDesc: '为航海环境提供储能解决方案。',
    divMedTitle: '医疗',
    divMedDesc: '面向影像中心和牙科诊所。',

    warrantyCtaTitle: '10年质保 – 罗马尼亚最全面的质保',
    warrantyCtaSubtitle:
      '作为LithTech直接进口商和认证技术人员，我们是罗马尼亚唯一能够提供此质保的公司。我们提供本地服务，并在10年内全程陪伴您。',
    warrantyCtaButton: '查看产品',

    ctaTitle: '与我们的团队交流',
    ctaDesc: '我们评估并为您的需求量身定制储能解决方案。',
    ctaBtn1: '查看产品',
    ctaBtn2: '联系我们',
    ariaPrev: '上一项',
    ariaNext: '下一项',
  },
}

export function getHomeTranslations(lang: LangCode): HomeTranslations {
  return translations[lang] ?? translations.ro
}
