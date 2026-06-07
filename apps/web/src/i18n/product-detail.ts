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
  /** Lângă titlu: produs în stoc (înainte de program reducere) */
  residentialStockInStockBadge: string
  /** Badge când produsul are programe de reducere asociate (CMS) */
  programReducereBadge: string
  // Compatibility modal
  compatibilitateTitle: string
  /** Inverter list modal: headline under icon */
  compatibilitateInvertorHeroTitle: string
  compatibilitateClose: string
  compatibilitateSearch: string
  compatibilitateNoResults: string
  /** Inverter search: no match — explanation + WhatsApp CTA */
  compatibilitateInvertorNotFoundMessage: string
  compatibilitateInvertorAskAssistanceBtn: string
  /** WhatsApp prefill; replace {search} with the value typed in the inverter search field */
  compatibilitateInvertorWhatsappPrefill: string
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
  /** Discount layout: headline above final line total (cu reduceri) */
  pretFinalLabel: string
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
  /** Suffix in residential discount dropdown options: "{name} : 12% …" */
  residentialDiscountOptionSuffix: string
  /** Desktop link under dropdown → programmes modal */
  veziProgrameReduceri: string
  /** Selected programme → about + terms modal link */
  despreProgram: string
  /** About modal: link to full terms page */
  reduceriTermsOpenFullPage: string
  /** About modal: right column title */
  reduceriProgramTermsHeading: string
  /** Hover button on programme photo in modal */
  reduceriHoverApplyBtn: string
  /** Mobile: opens discount programme picker (replaces native select) */
  mobileApplyDiscountBtn: string
  comandaBtn: string
  /** Guest user + discount programme: CTA prompts account */
  comandaCuContBtn: string
  /** Guest + discount: explanation under CTA */
  residentialDiscountGuestNotice: string
  /** Residential public pricing: order button follow-up (checkout not live) */
  clientOrderNotice: string
  totalEstimated: string
  ariaQtyDecrease: string
  ariaQtyIncrease: string
  documenteTehnice: string
  document: string
  dateTehnice: string
  /** Technical specs table — column headers */
  techTableColSpec: string
  techTableColValue: string
  /** Partner tab / compact heading — short label for technical specs */
  techSpecsTab: string
  /** Mobile accordion label for main specs grid */
  detaliiTehnice: string
  /** Opens full technical details bottom sheet (mobile accordion) */
  toateDetaliileBtn: string
  intrebariFrecvente: string
  studiiDeCaz: string
  // Swap banner (CTA → /siguranta)
  stiaiCa: string
  swapDesc: string
  swapBannerCta: string
  // Reduceri banner
  reduceriTitle: string
  reduceriDesc: string
  /** Reduceri banner CTA (links to /reduceri) */
  intraInCont: string
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
    residentialStockInStockBadge: 'Stoc suficient',
    programReducereBadge: 'Program de reducere',
    compatibilitateTitle: 'Compatibilitate Invertor',
    compatibilitateInvertorHeroTitle: 'Verifică compatibilitatea cu invertorul tău.',
    compatibilitateClose: 'Închide',
    compatibilitateSearch: 'Caută invertor...',
    compatibilitateNoResults: 'Niciun invertor găsit.',
    compatibilitateInvertorNotFoundMessage:
      'Invertorul tău nu este în lista noastră, însă s-ar putea ca această baterie să fie compatibilă. Hai să ne uităm în detaliu.',
    compatibilitateInvertorAskAssistanceBtn: 'Cere asistență',
    compatibilitateInvertorWhatsappPrefill:
      'Salut. Eu am un invertor {search}. Nu l-am găsit în lista voastră. Credeți că bateriile voastre ar fi compatibile cu acest tip de invertor?',
    compatibilitateLabel: 'COMPATIBILITATE',
    verificareCompatibilitate: 'Verifică compatibilitate invertor',
    ceSePoateAlimenta: 'Ce se poate alimenta?',
    compatibilitateSiUtilizare: 'Compatibilitate și utilizare',
    sigurantaBaterino: 'Siguranța Baterino',
    cantitateLabel: 'CANTITATE',
    pretLabel: 'PREȚ',
    pretFinalLabel: 'PREȚ FINAL',
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
    residentialDiscountOptionSuffix: 'REDUCERE',
    veziProgrameReduceri: 'Vezi programe reduceri',
    despreProgram: 'Despre program',
    reduceriTermsOpenFullPage: 'Deschide pagina cu termenii completi',
    reduceriProgramTermsHeading: 'Termeni și condiții ale programului de reducere',
    reduceriHoverApplyBtn: 'APLICĂ REDUCEREA',
    mobileApplyDiscountBtn: 'APLICĂ REDUCERE',
    comandaBtn: 'COMANDĂ',
    comandaCuContBtn: 'COMANDĂ CU CONT',
    residentialDiscountGuestNotice:
      'Trebuie să îți creezi un cont pe platforma Baterino pentru a plasa o comandă cu reducere, deoarece sunt necesare mai multe informații.',
    clientOrderNotice:
      'Comanda online nu este încă activă. Te rugăm să ne contactezi pentru ofertă sau să îți creezi cont pentru programele de reduceri.',
    totalEstimated: 'Total estimativ',
    ariaQtyDecrease: 'Scade cantitatea',
    ariaQtyIncrease: 'Crește cantitatea',
    documenteTehnice: 'Documente Tehnice',
    document: 'Document',
    dateTehnice: 'Date tehnice despre produs',
    techTableColSpec: 'Specificație',
    techTableColValue: 'Valoare',
    techSpecsTab: 'Date Tehnice',
    detaliiTehnice: 'Detalii tehnice',
    toateDetaliileBtn: 'Toate detaliile',
    intrebariFrecvente: 'Întrebări frecvente',
    studiiDeCaz: 'Studii de caz',
    stiaiCa: 'ȘTIAI CĂ?',
    swapDesc:
      'Prin serviciul Baterino SWAP îți oferim o baterie la schimb pe toată durata perioadei în care bateria ta se află la noi în service?',
    swapBannerCta: 'VEZI TOATE SERVICIILE',
    reduceriTitle: 'REDUCERI ÎNTRE 5% ȘI 20%',
    reduceriDesc:
      'La Baterino, bateriile LiFePO4 au prețuri reduse prin programele noastre de reduceri dedicate. Vezi care ți se potrivește.',
    intraInCont: 'VEZI PROGRAME REDUCERI',
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
    residentialStockInStockBadge: 'In stock',
    programReducereBadge: 'Discount programme',
    compatibilitateTitle: 'Inverter Compatibility',
    compatibilitateInvertorHeroTitle: 'Check compatibility with your inverter.',
    compatibilitateClose: 'Close',
    compatibilitateSearch: 'Search inverter...',
    compatibilitateNoResults: 'No inverter found.',
    compatibilitateInvertorNotFoundMessage:
      "Your inverter is not on our list, but this battery may still be compatible. Let's look at the details together.",
    compatibilitateInvertorAskAssistanceBtn: 'Request assistance',
    compatibilitateInvertorWhatsappPrefill:
      'Hi. I have a {search} inverter. I could not find it on your list. Do you think your batteries would be compatible with this type of inverter?',
    compatibilitateLabel: 'COMPATIBILITY',
    verificareCompatibilitate: 'Check inverter compatibility',
    ceSePoateAlimenta: 'What can it power?',
    compatibilitateSiUtilizare: 'Compatibility and usage',
    sigurantaBaterino: 'Baterino assurance',
    cantitateLabel: 'QUANTITY',
    pretLabel: 'PRICE',
    pretFinalLabel: 'FINAL PRICE',
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
    residentialDiscountOptionSuffix: 'DISCOUNT',
    veziProgrameReduceri: 'View discount programmes',
    despreProgram: 'About this programme',
    reduceriTermsOpenFullPage: 'Open full terms page',
    reduceriProgramTermsHeading: 'Terms and conditions of the discount programme',
    reduceriHoverApplyBtn: 'APPLY DISCOUNT',
    mobileApplyDiscountBtn: 'APPLY DISCOUNT',
    comandaBtn: 'ORDER',
    comandaCuContBtn: 'ORDER WITH ACCOUNT',
    residentialDiscountGuestNotice:
      'You need a Baterino account to place an order with a discount programme—we need a few more details to validate and apply your discount.',
    clientOrderNotice:
      'Online checkout is not active yet. Please contact us for a quote or create an account to use our discount programmes.',
    totalEstimated: 'Estimated total',
    ariaQtyDecrease: 'Decrease quantity',
    ariaQtyIncrease: 'Increase quantity',
    documenteTehnice: 'Technical Documents',
    document: 'Document',
    dateTehnice: 'Technical product data',
    techTableColSpec: 'Specification',
    techTableColValue: 'Value',
    techSpecsTab: 'Technical specs',
    detaliiTehnice: 'Technical details',
    toateDetaliileBtn: 'All details',
    intrebariFrecvente: 'Frequently asked questions',
    studiiDeCaz: 'Case studies',
    stiaiCa: 'DID YOU KNOW?',
    swapDesc:
      'With Baterino SWAP, we offer you a replacement battery for the entire period your battery is with us in service.',
    swapBannerCta: 'VIEW ALL SERVICES',
    reduceriTitle: 'DISCOUNTS FROM 5% TO 20%',
    reduceriDesc:
      'At Baterino, LiFePO4 batteries are available at reduced prices through our dedicated discount programmes. See which one suits you.',
    intraInCont: 'VIEW DISCOUNT PROGRAMMES',
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
}

export function getProductDetailTranslations(lang: LangCode): ProductDetailTranslations {
  return translations[lang] ?? translations.ro
}

/** Fallback dacă un bundle vechi nu are încă `residentialDiscountGuestNotice` în `tr`. */
export const RESIDENTIAL_DISCOUNT_GUEST_NOTICE_FALLBACK_RO =
  translations.ro.residentialDiscountGuestNotice
