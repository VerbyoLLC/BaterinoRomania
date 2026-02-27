import type { LangCode } from './menu'

export type HomeTranslations = {
  seoTitle: string
  seoDesc: string

  // Hero – left installer box
  heroBoxTitle: string
  heroBoxDesc: string
  heroBoxCta: string

  // Hero – slider tabs
  heroSliderRez: string
  heroSliderInd: string
  heroSliderMed: string
  heroSliderInst: string

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
  heroSlideInstImportatori: string

  // Hero – big right card
  heroCardTitle: string
  heroCardDesc: string   // supports **bold** markers
  heroImportatori: string
  heroCardCta: string
  poweredBy: string

  // Products section
  productsSectionTitle: string
  productsTabAll: string
  productsTabRez: string
  productsTabInd: string
  productsTabMed: string
  productsTabMar: string
  productsViewMore: string
  includesTVA: string

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

  // Reduceri section
  reduceriProgramLabel: string
  reduceriDiscountSuffix: string
  reduceriGridTitle: string
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
  ctaTitle: string
  ctaDesc: string
  ctaBtn1: string
  ctaBtn2: string
}

const translations: Record<LangCode, HomeTranslations> = {
  ro: {
    seoTitle: 'Baterino România – Baterii LiFePO4 și Sisteme Fotovoltaice',
    seoDesc: 'Importator și distribuitor de baterii LiFePO4 și sisteme fotovoltaice pentru sectorul rezidențial, industrial, medical și maritim. Servicii complete, garanție 10 ani.',

    heroBoxTitle: 'Instalezi sau distribui sisteme fotovoltaice?',
    heroBoxDesc: 'Îți oferim produse validate înainte de import, marje competitive și prețuri stabile, service și suport, stocuri permanente.',
    heroBoxCta: 'Devino Partener',

    heroSliderRez: 'REZIDENTIAL',
    heroSliderInd: 'INDUSTRIAL',
    heroSliderMed: 'MEDICAL',
    heroSliderInst: 'INSTALATORI',

    heroSlideRezTitle: 'Soluții de stocare a energiei,\nrezidențiale și micro-grid-uri\ncu baterii LiFePO4',
    heroSlideRezDesc: 'Soluții dedicate **locuințelor individuale și micro-grid-urilor rezidențiale** — pentru autonomie energetică, siguranță și optimizarea autoconsumului.',
    heroSlideIndTitle: 'Soluții EPC pentru stocare de energie la nivel MW',
    heroSlideIndDesc: '**De la concept și dimensionare tehnică până la punere în funcțiune și mentenanță** — livrăm proiecte integrate pentru industrie și parcuri fotovoltaice.',
    heroSlideIndCta: 'CERE EVALUARE TEHNICĂ',
    heroSlideMedTitle: 'Sisteme de stocare a energiei pentru infrastructura medicală critică',
    heroSlideMedDesc: 'Proiectăm și instalăm sisteme de stocare a energiei pentru clinici de imagistică, stomatologie, centre de transfuzie și spitale — cu focus pe siguranță și continuitate, atunci când energia nu are voie să se oprească.',
    heroSlideMedCta: 'DISCUTA CU ECHIPA',
    heroSlideInstTitle: 'NE MĂRIM REȚEAUA DE\nINSTALATORI ȘI DISTRIBUITORI',
    heroSlideInstDesc: 'Fiind importatori LithTech,** îți oferim prețuri avantajoase, stocuri permanente în România cu livrare rapidă și suport tehnic local**. În plus, **gestionăm relația cu clientul final și îți oferim acces la proiecte industriale de anvergură**.',
    heroSlideInstImportatori: 'Importatori',

    heroCardTitle: 'BATERII LIFEPO4 SISTEME FOTOVOLTAICE REZIDENTIAL ȘI INDUSTRIAL',
    heroCardDesc: 'Sisteme de stocare a energiei **pentru mediul rezidential, industrial și maritim**. **Service, mentenanță și suport tehnic** în **România**.',
    heroImportatori: 'Importatori oficiali',
    heroCardCta: 'VEZI PRODUSE',
    poweredBy: 'Powered by',

    productsSectionTitle: 'ALEGE BATERIA TA',
    productsTabAll: 'TOATE',
    productsTabRez: 'REZIDENTIAL',
    productsTabInd: 'INDUSTRIAL',
    productsTabMed: 'MEDICAL',
    productsTabMar: 'MARITIM',
    productsViewMore: 'ÎNCARCĂ MAI MULT',
    includesTVA: 'include TVA',

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

    reduceriProgramLabel: 'PROGRAMUL',
    reduceriDiscountSuffix: 'REDUCERE',
    reduceriGridTitle: 'PROGRAME DE REDUCERI',
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

    heroSliderRez: 'RESIDENTIAL',
    heroSliderInd: 'INDUSTRIAL',
    heroSliderMed: 'MEDICAL',
    heroSliderInst: 'INSTALLERS',

    heroSlideRezTitle: 'Energy storage solutions,\nresidential and micro-grids\nwith LiFePO4 batteries',
    heroSlideRezDesc: 'Solutions dedicated to **individual homes and residential micro-grids** — for energy autonomy, safety and self-consumption optimisation.',
    heroSlideIndTitle: 'EPC solutions for MW-scale energy storage',
    heroSlideIndDesc: '**From concept and technical sizing to commissioning and maintenance** — we deliver integrated projects for industry and solar parks.',
    heroSlideIndCta: 'REQUEST TECHNICAL EVALUATION',
    heroSlideMedTitle: 'Energy storage systems for critical medical infrastructure',
    heroSlideMedDesc: 'We design and install energy storage systems for imaging clinics, dental practices, transfusion centres and hospitals — with a focus on safety and continuity, when power cannot afford to stop.',
    heroSlideMedCta: 'TALK TO THE TEAM',
    heroSlideInstTitle: 'WE ARE EXPANDING OUR NETWORK OF\nINSTALLERS AND DISTRIBUTORS',
    heroSlideInstDesc: 'As LithTech importers,** we offer you competitive pricing, permanent stock in Romania with fast delivery and local technical support**. In addition, **we manage the end-client relationship and give you access to large-scale industrial projects**.',
    heroSlideInstImportatori: 'Importers',

    heroCardTitle: 'LIFEPO4 BATTERIES SOLAR SYSTEMS RESIDENTIAL AND INDUSTRIAL',
    heroCardDesc: 'Energy storage systems **for residential, industrial and maritime environments**. **Service, maintenance and technical support** in **Romania**.',
    heroImportatori: 'Official importers',
    heroCardCta: 'VIEW PRODUCTS',
    poweredBy: 'Powered by',

    productsSectionTitle: 'CHOOSE YOUR BATTERY',
    productsTabAll: 'ALL',
    productsTabRez: 'RESIDENTIAL',
    productsTabInd: 'INDUSTRIAL',
    productsTabMed: 'MEDICAL',
    productsTabMar: 'MARITIME',
    productsViewMore: 'LOAD MORE',
    includesTVA: 'includes VAT',

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

    reduceriProgramLabel: 'PROGRAMME',
    reduceriDiscountSuffix: 'DISCOUNT',
    reduceriGridTitle: 'DISCOUNT PROGRAMMES',
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
    divMedDesc: 'We are the only company in Romania specialised in providing energy storage solutions for imaging centres, dental surgeries, dialysis centres and medical clinics.',

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

    heroSliderRez: '住宅',
    heroSliderInd: '工业',
    heroSliderMed: '医疗',
    heroSliderInst: '安装商',

    heroSlideRezTitle: '储能解决方案，\n住宅与微电网\n磷酸铁锂电池',
    heroSlideRezDesc: '专为独栋住宅和住宅微电网设计的解决方案——实现能源自主、安全和自用优化。',
    heroSlideIndTitle: '兆瓦级储能EPC解决方案',
    heroSlideIndDesc: '从概念和技术选型到调试和维护——我们为工业和光伏电站提供一体化项目。',
    heroSlideIndCta: '申请技术评估',
    heroSlideMedTitle: '关键医疗基础设施储能系统',
    heroSlideMedDesc: '我们为影像中心、牙科诊所、输血中心和医院设计和安装储能系统——专注于安全和连续性，在电力不容中断的场合。',
    heroSlideMedCta: '联系团队',
    heroSlideInstTitle: '我们正在扩大\n安装商和分销商网络',
    heroSlideInstDesc: '作为LithTech进口商，**我们为您提供有竞争力的价格、罗马尼亚常备库存、快速配送和本地技术支持**。此外，**我们管理终端客户关系并为您提供大型工业项目机会**。',
    heroSlideInstImportatori: '进口商',

    heroCardTitle: '磷酸铁锂电池 光伏系统 住宅与工业',
    heroCardDesc: '**住宅、工业和航海领域**的储能系统。在**罗马尼亚**提供**服务、维护和技术支持**。',
    heroImportatori: '官方进口商',
    heroCardCta: '查看产品',
    poweredBy: 'Powered by',

    productsSectionTitle: '选择您的电池',
    productsTabAll: '全部',
    productsTabRez: '住宅',
    productsTabInd: '工业',
    productsTabMed: '医疗',
    productsTabMar: '航海',
    productsViewMore: '加载更多',
    includesTVA: '含增值税',

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

    reduceriProgramLabel: '计划',
    reduceriDiscountSuffix: '折扣',
    reduceriGridTitle: '折扣计划',
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
    divMedDesc: '我们是罗马尼亚唯一专门为影像中心、牙科诊所、透析中心和医疗诊所提供储能解决方案的公司。',

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
