import type { CommercialOfferLanguage } from './commercialOfferDraft'

export type ProductSheetTemplateStrings = {
  topBarDoc: string
  seriesResidential: string
  seriesIndustrial: string
  storageResidential: string
  storageIndustrial: string
  productKind: string
  modelPrefix: string
  kpiEnergy: string
  kpiPower: string
  kpiVoltage: string
  kpiCapacity: string
  warrantyStandardCoverage: string
  warrantySub: string
  warrantyManufacturer: string
  warrantyYears: (years: string) => string
  footerWarrantyBadge: (years: string) => string
  specsSection: string
  specsEmpty: string
  featuresSection: string
  statsSection: string
  statCycleLife: string
  statDischargeTemp: string
  statAltitude: string
  statWaterproof: string
  valueCycles: string
  valueOptional: string
  valueYes: string
  valueNo: string
  valueYears: string
  valueYearsCount: (n: string) => string
  footerCharge: string
  footerOperating: string
  footerStorage: string
  footerAltitude: string
  featHeat: string
  featHeatDefault: string
  featWifi: string
  featWifiDefault: string
  featBms: string
  featBmsDefault: string
  featStack: string
  featStackDefault: string
  featHighCurrent: string
  featHighCurrentDefault: string
  featSolar: string
  featSolarDefault: string
}

const UI: Record<CommercialOfferLanguage, ProductSheetTemplateStrings> = {
  ro: {
    topBarDoc: 'Fișă Tehnică Produs',
    seriesResidential: 'Seria Rezidențială',
    seriesIndustrial: 'Seria Industrială',
    storageResidential: 'Stocare Rezidențială',
    storageIndustrial: 'Stocare Industrială',
    productKind: 'Acumulator LiFePo4',
    modelPrefix: 'Model',
    kpiEnergy: 'Energie',
    kpiPower: 'Putere',
    kpiVoltage: 'Tensiune',
    kpiCapacity: 'Capacitate',
    warrantyStandardCoverage: 'Acoperire standard',
    warrantySub: 'Detalii complete în documentația produsului și în condițiile comerciale Baterino.',
    warrantyManufacturer: 'Garanție producător',
    warrantyYears: (years) => `Garanție ${years} Ani`,
    footerWarrantyBadge: (years) => `Garanție ${years} Ani`,
    specsSection: 'Specificații tehnice',
    specsEmpty: 'Nu există linii în descrierea tehnică a modelului.',
    featuresSection: 'Caracteristici principale',
    statsSection: 'Parametri de operare',
    statCycleLife: 'Durată de viață',
    statDischargeTemp: 'Interval descărcare',
    statAltitude: 'Altitudine maximă',
    statWaterproof: 'Protecție la apă',
    valueCycles: 'cicluri',
    valueOptional: 'Opțional',
    valueYes: 'Da',
    valueNo: 'Nu',
    valueYears: 'Ani',
    valueYearsCount: (n) => `${n} Ani`,
    footerCharge: 'Încărcare',
    footerOperating: 'Funcționare',
    footerStorage: 'Depozitare',
    footerAltitude: 'Altitudine',
    featHeat: 'Autoîncălzire',
    featHeatDefault: 'Modul opțional — funcționare stabilă de la −20°C în climate reci.',
    featWifi: 'WiFi + BT',
    featWifiDefault: 'Wireless pentru monitorizare de la distanță și cuplare invertor.',
    featBms: 'BMS inteligent',
    featBmsDefault: 'Management avansat al celulelor și protecții integrate.',
    featStack: 'Scalabil',
    featStackDefault: 'Expansiune în paralel pentru capacitate mai mare pe măsura nevoilor.',
    featHighCurrent: 'Curent ridicat',
    featHighCurrentDefault: 'Descărcare de vârf pentru consumatori cu putere mare.',
    featSolar: 'Compatibil solar',
    featSolarDefault: 'Compatibil cu invertoare hibride și sisteme off-grid uzuale.',
  },
  en: {
    topBarDoc: 'Product Technical Sheet',
    seriesResidential: 'Residential Series',
    seriesIndustrial: 'Industrial Series',
    storageResidential: 'Residential Storage',
    storageIndustrial: 'Industrial Storage',
    productKind: 'LiFePO4 Battery',
    modelPrefix: 'Model',
    kpiEnergy: 'Energy',
    kpiPower: 'Power',
    kpiVoltage: 'Voltage',
    kpiCapacity: 'Capacity',
    warrantyStandardCoverage: 'Standard coverage',
    warrantySub: 'Full details in the product documentation and Baterino commercial terms.',
    warrantyManufacturer: 'Manufacturer warranty',
    warrantyYears: (years) => `${years}-Year Warranty`,
    footerWarrantyBadge: (years) => `${years}-Year Warranty`,
    specsSection: 'Technical specifications',
    specsEmpty: 'No lines in the model technical description.',
    featuresSection: 'Key features',
    statsSection: 'Operating parameters',
    statCycleLife: 'Cycle life',
    statDischargeTemp: 'Discharge range',
    statAltitude: 'Maximum altitude',
    statWaterproof: 'Water protection',
    valueCycles: 'cycles',
    valueOptional: 'Optional',
    valueYes: 'Yes',
    valueNo: 'No',
    valueYears: 'Years',
    valueYearsCount: (n) => `${n} Years`,
    footerCharge: 'Charge',
    footerOperating: 'Operating',
    footerStorage: 'Storage',
    footerAltitude: 'Altitude',
    featHeat: 'Self-heating',
    featHeatDefault: 'Optional module — stable operation from −20°C in cold climates.',
    featWifi: 'WiFi + BT',
    featWifiDefault: 'Wireless remote monitoring and inverter pairing.',
    featBms: 'Smart BMS',
    featBmsDefault: 'Advanced cell management and integrated protection.',
    featStack: 'Scalable',
    featStackDefault: 'Parallel expansion for higher capacity as needs grow.',
    featHighCurrent: 'High current',
    featHighCurrentDefault: 'Peak discharge for high-power consumers.',
    featSolar: 'Solar compatible',
    featSolarDefault: 'Compatible with hybrid inverters and common off-grid systems.',
  },
  de: {
    topBarDoc: 'Produktdatenblatt',
    seriesResidential: 'Residential-Serie',
    seriesIndustrial: 'Industrial-Serie',
    storageResidential: 'Residential-Speicher',
    storageIndustrial: 'Industrial-Speicher',
    productKind: 'LiFePO4-Akku',
    modelPrefix: 'Modell',
    kpiEnergy: 'Energie',
    kpiPower: 'Leistung',
    kpiVoltage: 'Spannung',
    kpiCapacity: 'Kapazität',
    warrantyStandardCoverage: 'Standardabdeckung',
    warrantySub: 'Vollständige Details in der Produktdokumentation und den Baterino-Geschäftsbedingungen.',
    warrantyManufacturer: 'Herstellergarantie',
    warrantyYears: (years) => `${years} Jahre Garantie`,
    footerWarrantyBadge: (years) => `${years} Jahre Garantie`,
    specsSection: 'Technische Daten',
    specsEmpty: 'Keine Zeilen in der technischen Modellbeschreibung.',
    featuresSection: 'Hauptmerkmale',
    statsSection: 'Betriebsparameter',
    statCycleLife: 'Lebensdauer',
    statDischargeTemp: 'Entladebereich',
    statAltitude: 'Maximale Höhe',
    statWaterproof: 'Wasserschutz',
    valueCycles: 'Zyklen',
    valueOptional: 'Optional',
    valueYes: 'Ja',
    valueNo: 'Nein',
    valueYears: 'Jahre',
    valueYearsCount: (n) => `${n} Jahre`,
    footerCharge: 'Laden',
    footerOperating: 'Betrieb',
    footerStorage: 'Lagerung',
    footerAltitude: 'Höhe',
    featHeat: 'Selbsterwärmung',
    featHeatDefault: 'Optionales Modul — stabiler Betrieb ab −20°C in kalten Klimazonen.',
    featWifi: 'WiFi + BT',
    featWifiDefault: 'Drahtlose Fernüberwachung und Wechselrichter-Kopplung.',
    featBms: 'Intelligentes BMS',
    featBmsDefault: 'Erweitertes Zellenmanagement und integrierte Schutzfunktionen.',
    featStack: 'Skalierbar',
    featStackDefault: 'Parallele Erweiterung für mehr Kapazität nach Bedarf.',
    featHighCurrent: 'Hoher Strom',
    featHighCurrentDefault: 'Spitzenentladung für leistungsstarke Verbraucher.',
    featSolar: 'Solar-kompatibel',
    featSolarDefault: 'Kompatibel mit Hybrid-Wechselrichtern und gängigen Off-Grid-Systemen.',
  },
}

/** English / Romanian labels stored in Magazin → Modele → descriere tehnică. */
const SPEC_LABELS: Record<string, Record<CommercialOfferLanguage, string>> = {
  'model-specific': {
    ro: 'Specific modelului',
    en: 'Model-specific',
    de: 'Modellspezifisch',
  },
  'common (all models in this range)': {
    ro: 'Comun (toate modelele din gamă)',
    en: 'Common (all models in this range)',
    de: 'Gemeinsam (alle Modelle dieser Reihe)',
  },
  'nominal voltage': {
    ro: 'Tensiune nominală',
    en: 'Nominal Voltage',
    de: 'Nennspannung',
  },
  'nominal capacity': {
    ro: 'Capacitate nominală',
    en: 'Nominal Capacity',
    de: 'Nennkapazität',
  },
  'charge & discharge current': {
    ro: 'Curent încărcare / descărcare',
    en: 'Charge & Discharge Current',
    de: 'Lade- & Entladestrom',
  },
  energy: {
    ro: 'Energie',
    en: 'Energy',
    de: 'Energie',
  },
  'cycle life': {
    ro: 'Durată de cicluri',
    en: 'Cycle life',
    de: 'Lebensdauer (Zyklen)',
  },
  'rated output power': {
    ro: 'Putere nominală de ieșire',
    en: 'Rated Output Power',
    de: 'Nennausgangsleistung',
  },
  'discharge temperature': {
    ro: 'Temperatură descărcare',
    en: 'Discharge Temperature',
    de: 'Entladetemperatur',
  },
  'dimensions (w×h×d)': {
    ro: 'Dimensiuni (L×Î×A)',
    en: 'Dimensions (W×H×D)',
    de: 'Abmessungen (B×H×T)',
  },
  weight: {
    ro: 'Masă',
    en: 'Weight',
    de: 'Gewicht',
  },
  chemistry: {
    ro: 'Chimie',
    en: 'Chemistry',
    de: 'Chemie',
  },
  certification: {
    ro: 'Certificare',
    en: 'Certification',
    de: 'Zertifizierung',
  },
  communication: {
    ro: 'Comunicație',
    en: 'Communication',
    de: 'Kommunikation',
  },
  'wifi/bt': {
    ro: 'WiFi / Bluetooth',
    en: 'WIFI/BT',
    de: 'WIFI/BT',
  },
  'self-heating': {
    ro: 'Autoîncălzire',
    en: 'Self-Heating',
    de: 'Selbsterwärmung',
  },
  waterproof: {
    ro: 'Protecție la apă',
    en: 'Waterproof',
    de: 'Wasserschutz',
  },
  'noise level': {
    ro: 'Nivel zgomot',
    en: 'Noise Level',
    de: 'Geräuschpegel',
  },
  'charge temperature': {
    ro: 'Temperatură încărcare',
    en: 'Charge Temperature',
    de: 'Ladetemperatur',
  },
  'recommend operating temperature': {
    ro: 'Temperatură recomandată de operare',
    en: 'Recommend Operating Temperature',
    de: 'Empfohlene Betriebstemperatur',
  },
  'storage temperature': {
    ro: 'Temperatură depozitare',
    en: 'Storage Temperature',
    de: 'Lagertemperatur',
  },
  altitude: {
    ro: 'Altitudine',
    en: 'Altitude',
    de: 'Höhe',
  },
  warranty: {
    ro: 'Garanție',
    en: 'Warranty',
    de: 'Garantie',
  },
  'chimie celule': {
    ro: 'Chimie celule',
    en: 'Cell chemistry',
    de: 'Zellchemie',
  },
  certificări: {
    ro: 'Certificări',
    en: 'Certification',
    de: 'Zertifizierung',
  },
  certificari: {
    ro: 'Certificări',
    en: 'Certification',
    de: 'Zertifizierung',
  },
  'curent încărcare / descărcare': {
    ro: 'Curent încărcare / descărcare',
    en: 'Charge & Discharge Current',
    de: 'Lade- & Entladestrom',
  },
  'tensiune nominală': {
    ro: 'Tensiune nominală',
    en: 'Nominal Voltage',
    de: 'Nennspannung',
  },
  'tensiune nominala': {
    ro: 'Tensiune nominală',
    en: 'Nominal Voltage',
    de: 'Nennspannung',
  },
  'putere nominală': {
    ro: 'Putere nominală',
    en: 'Rated Output Power',
    de: 'Nennleistung',
  },
  'putere nominala': {
    ro: 'Putere nominală',
    en: 'Rated Output Power',
    de: 'Nennleistung',
  },
  energie: {
    ro: 'Energie',
    en: 'Energy',
    de: 'Energie',
  },
}

function normalizeSpecLabelKey(label: string): string {
  return label.trim().replace(/:$/, '').toLowerCase()
}

export function getProductSheetTemplateStrings(lang: CommercialOfferLanguage): ProductSheetTemplateStrings {
  return UI[lang] ?? UI.ro
}

export function translateProductSheetSpecLabel(label: string, lang: CommercialOfferLanguage): string {
  const key = normalizeSpecLabelKey(label)
  return SPEC_LABELS[key]?.[lang] ?? label.trim()
}

export function translateProductSheetSpecValue(value: string, lang: CommercialOfferLanguage): string {
  const t = getProductSheetTemplateStrings(lang)
  let v = value.trim()
  if (!v) return v

  v = v.replace(/\boptional\b/gi, t.valueOptional)
  v = v.replace(/\byes\b/gi, t.valueYes)
  v = v.replace(/\bno\b/gi, t.valueNo)
  v = v.replace(/\s+times?\b/gi, ` ${t.valueCycles}`)
  v = v.replace(/(\d+)\s+years?\b/gi, (_, n: string) => t.valueYearsCount(n))
  v = v.replace(/\byears?\b/gi, t.valueYears)

  if (lang === 'ro') {
    v = v.replace(/(\d(?:[.,]\d+)?°[CF]?[^·]*?)\s+to\s+/gi, '$1 până la ')
  } else if (lang === 'de') {
    v = v.replace(/(\d(?:[.,]\d+)?°[CF]?[^·]*?)\s+to\s+/gi, '$1 bis ')
  }

  return v
}

export function formatProductSheetDecimalPart(raw: string, lang: CommercialOfferLanguage): string {
  if (lang === 'ro') return raw.replace(/\./g, ',')
  return raw.replace(/,/g, '.')
}
