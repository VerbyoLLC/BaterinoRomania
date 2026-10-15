import type { LangCode } from './menu'

export type HomeProductSliderTranslations = {
  titleLine1: string
  titleLine2: string
  subtitle: string
  slideSubtitle: string
  ecoHomeSubtitle: string
  ecoHome16Subtitle: string
  ecoHome20Subtitle: string
  bess261Subtitle: string
  bessModularHvSubtitle: string
  bessContainer14Subtitle: string
  bessContainer51Subtitle: string
  bess60Subtitle: string
  bess100Subtitle: string
  bess200Subtitle: string
  previewBadge: string
  ariaHero: string
  ariaSlides: string
  ariaPrev: string
  ariaNext: string
  specCapacity: string
  specVoltage: string
  specCycles: string
  specChemistry: string
  specUse: string
  specWarranty: string
  warrantyValue: string
  useOutdoor: string
  useIndoor: string
  priceLabel: string
  highlightCompatibility: string
  highlightCompatibilityBack: string
  highlightInstall: string
  highlightEms: string
  highlightWarranty: string
  highlightMaintenance: string
  highlightShipping: string
  highlightSwap: string
  highlightService: string
}

const translations: Record<LangCode, HomeProductSliderTranslations> = {
  ro: {
    titleLine1: 'Baterii LiFePO4 pentru stocare energie',
    titleLine2: 'rezidențial și industrial',
    subtitle: 'Importator direct LithTech în România. Stoc local, service și garanție 10 ani.',
    slideSubtitle: 'Slide de test',
    ecoHomeSubtitle: 'Baterie de perete pentru stocarea energiei solare acasă',
    ecoHome16Subtitle: 'Baterie solară rezidențială pentru interior',
    ecoHome20Subtitle: 'Pachet promoțional de 2 baterii EcoHome 10kWh',
    bess261Subtitle: 'Cabinet exterior pentru mediul industrial. Peak shaving, echilibrare rețea sau stocare.',
    bessModularHvSubtitle:
      'BESS High Voltage modular scalabil cu module LiFePO₄ de 16 kWh, cu capacitate între 64 kWh și 241 kWh. BMS integrat care gestionează balansarea și protecțiile de siguranță.',
    bessContainer14Subtitle: 'Container exterior 20ft cu răcire cu aer, pentru parcuri solare și stocare industrială.',
    bessContainer51Subtitle: 'Container exterior 20ft cu răcire lichidă, pentru parcuri solare și stocare la scară mare.',
    bess60Subtitle: 'Cabinet de stocare pentru aplicații comerciale.',
    bess100Subtitle: 'Stocare pentru sedii și puncte de consum medii.',
    bess200Subtitle: 'Cabinet exterior, de la 100 până la 750 kWh.',
    previewBadge: 'Vezi Detalii',
    ariaHero: 'Prezentare produse',
    ariaSlides: 'Produse',
    ariaPrev: 'Produsul anterior',
    ariaNext: 'Produsul următor',
    specCapacity: 'Capacitate',
    specVoltage: 'Tensiune',
    specCycles: 'Cicluri',
    specChemistry: 'Chimie',
    specUse: 'Utilizare',
    specWarranty: 'Garanție',
    warrantyValue: '10 ani',
    useOutdoor: 'Exterior',
    useIndoor: 'Interior',
    priceLabel: 'Preț',
    highlightCompatibility: 'Compatibilă cu 99% din invertoare',
    highlightCompatibilityBack: 'Verifică compatibilitatea',
    highlightInstall: 'Instalare Baterino',
    highlightEms: 'EMS Baterino',
    highlightWarranty: 'Garanție 10 Ani',
    highlightMaintenance: 'Mentenanță Baterino',
    highlightShipping: 'Transport Gratuit',
    highlightSwap: 'Baterino SWAP',
    highlightService: 'Service în România',
  },
  en: {
    titleLine1: 'LiFePO4 batteries for energy storage',
    titleLine2: 'residential and industrial',
    subtitle: 'Direct LithTech importer in Romania. Local stock, service and 10-year warranty.',
    slideSubtitle: 'Test slide',
    ecoHomeSubtitle: 'Wall-mounted battery for storing solar energy at home',
    ecoHome16Subtitle: 'Residential solar battery for indoor use',
    ecoHome20Subtitle: 'Promotional package of 2 EcoHome 10kWh batteries',
    bess261Subtitle: 'Outdoor cabinet for industrial sites. Peak shaving, grid balancing or storage.',
    bessModularHvSubtitle:
      'Scalable high-voltage modular BESS with 16 kWh LiFePO₄ modules, from 64 kWh to 241 kWh. Integrated BMS that manages balancing and safety protections.',
    bessContainer14Subtitle: 'Outdoor 20ft container with air cooling, for solar parks and industrial storage.',
    bessContainer51Subtitle: 'Outdoor 20ft container with liquid cooling, for solar parks and large-scale storage.',
    bess60Subtitle: 'Storage cabinet for commercial sites.',
    bess100Subtitle: 'Storage for offices and mid-size loads.',
    bess200Subtitle: 'Outdoor cabinet, from 100 to 750 kWh.',
    previewBadge: 'View Details',
    ariaHero: 'Product showcase',
    ariaSlides: 'Products',
    ariaPrev: 'Previous product',
    ariaNext: 'Next product',
    specCapacity: 'Capacity',
    specVoltage: 'Voltage',
    specCycles: 'Cycles',
    specChemistry: 'Chemistry',
    specUse: 'Use',
    specWarranty: 'Warranty',
    warrantyValue: '10 years',
    useOutdoor: 'Outdoor',
    useIndoor: 'Indoor',
    priceLabel: 'Price',
    highlightCompatibility: 'Compatible with 99% of inverters',
    highlightCompatibilityBack: 'Check compatibility',
    highlightInstall: 'Baterino Installation',
    highlightEms: 'Baterino EMS',
    highlightWarranty: '10-Year Warranty',
    highlightMaintenance: 'Baterino Maintenance',
    highlightShipping: 'Free Shipping',
    highlightSwap: 'Baterino SWAP',
    highlightService: 'Service in Romania',
  },
}

export function getHomeProductSliderTranslations(lang: LangCode): HomeProductSliderTranslations {
  return translations[lang] ?? translations.ro
}
