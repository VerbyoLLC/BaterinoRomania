import type { LangCode } from './menu'

export type Product = {
  id: string
  name: string
  image: string
  spec1: string       // e.g. "51.2V • 100Ah • LiFePO4"
  spec2: string       // e.g. "5,000 Cicluri • WiFi • Bluetooth"
  price: number       // RON
  sector: string[]    // e.g. ['rezidential', 'industrial']
  kwh: number
  volti: number
  invertor: string[]  // e.g. ['huawei', 'solaredge']
}

export type ProduseTranslations = {
  heroTitle: string
  heroSubtitle: string
  filterSector: string
  filterCapacitate: string
  filterVolti: string
  filterInvertor: string
  howToChoose: string
  pretLabel: string
  currency: string
  noResults: string
  seoTitle: string
  seoDesc: string
  sectorOptions: { value: string; label: string }[]
  kwOptions:     { value: number; label: string }[]
  voltiOptions:  { value: number; label: string }[]
  invertorOptions: { value: string; label: string }[]
}

/** Static products removed – use getProducts() from api.ts for DB products */
export const PRODUCTS: Product[] = []

const translations: Record<LangCode, ProduseTranslations> = {
  ro: {
    heroTitle: 'BATERII LIFEPO4',
    heroSubtitle: 'Sisteme LiFePO4 scalabile, integrate cu panouri fotovoltaice și optimizate pentru autonomie reală.',
    filterSector: 'Sector',
    filterCapacitate: 'Capacitate',
    filterVolti: 'Volți',
    filterInvertor: 'Compatibilitate Invertor',
    howToChoose: 'Cum aleg bateria?',
    pretLabel: 'Preț',
    currency: 'RON',
    noResults: 'Niciun produs nu corespunde filtrelor selectate.',
    seoTitle: 'Baterii LiFePO4',
    seoDesc: 'Sisteme de stocare a energiei LiFePO4 pentru uz rezidential, industrial, medical și maritim. Importator oficial LithTech în România.',
    sectorOptions: [
      { value: '', label: 'Toate sectoarele' },
      { value: 'rezidential', label: 'Rezidențial' },
      { value: 'industrial', label: 'Industrial' },
      { value: 'medical', label: 'Medical' },
      { value: 'maritim', label: 'Maritim' },
    ],
    kwOptions: [
      { value: 0, label: 'Toate capacitățile' },
      { value: 5, label: '5 kWh' },
      { value: 10, label: '10 kWh' },
      { value: 15, label: '15 kWh' },
      { value: 60, label: '60 kWh' },
      { value: 100, label: '100 kWh' },
      { value: 200, label: '200+ kWh' },
    ],
    voltiOptions: [
      { value: 0, label: 'Toți volții' },
      { value: 51, label: '51.2V' },
    ],
    invertorOptions: [
      { value: '', label: 'Toate invertoarele' },
      { value: 'huawei', label: 'Huawei' },
      { value: 'solaredge', label: 'SolarEdge' },
      { value: 'sma', label: 'SMA' },
      { value: 'fronius', label: 'Fronius' },
      { value: 'victron', label: 'Victron' },
    ],
  },
  en: {
    heroTitle: 'LIFEPO4 BATTERIES',
    heroSubtitle: 'Scalable LiFePO4 systems, integrated with solar panels and optimised for real energy autonomy.',
    filterSector: 'Sector',
    filterCapacitate: 'Capacity',
    filterVolti: 'Voltage',
    filterInvertor: 'Inverter Compatibility',
    howToChoose: 'How do I choose?',
    pretLabel: 'Price',
    currency: 'RON',
    noResults: 'No products match the selected filters.',
    seoTitle: 'LiFePO4 Batteries',
    seoDesc: 'LiFePO4 energy storage systems for residential, industrial, medical and marine use. Official LithTech importer in Romania.',
    sectorOptions: [
      { value: '', label: 'All sectors' },
      { value: 'rezidential', label: 'Residential' },
      { value: 'industrial', label: 'Industrial' },
      { value: 'medical', label: 'Medical' },
      { value: 'maritim', label: 'Marine' },
    ],
    kwOptions: [
      { value: 0, label: 'All capacities' },
      { value: 5, label: '5 kWh' },
      { value: 10, label: '10 kWh' },
      { value: 15, label: '15 kWh' },
      { value: 60, label: '60 kWh' },
      { value: 100, label: '100 kWh' },
      { value: 200, label: '200+ kWh' },
    ],
    voltiOptions: [
      { value: 0, label: 'All voltages' },
      { value: 51, label: '51.2V' },
    ],
    invertorOptions: [
      { value: '', label: 'All inverters' },
      { value: 'huawei', label: 'Huawei' },
      { value: 'solaredge', label: 'SolarEdge' },
      { value: 'sma', label: 'SMA' },
      { value: 'fronius', label: 'Fronius' },
      { value: 'victron', label: 'Victron' },
    ],
  },
  zh: {
    heroTitle: 'LIFEPO4电池',
    heroSubtitle: '可扩展的LiFePO4系统，与光伏板集成，为真实能源自主而优化。',
    filterSector: '行业',
    filterCapacitate: '容量',
    filterVolti: '电压',
    filterInvertor: '逆变器兼容性',
    howToChoose: '如何选择电池？',
    pretLabel: '价格',
    currency: 'RON',
    noResults: '没有符合所选过滤条件的产品。',
    seoTitle: 'LiFePO4电池',
    seoDesc: '用于住宅、工业、医疗和海事的LiFePO4储能系统。罗马尼亚官方LithTech进口商。',
    sectorOptions: [
      { value: '', label: '所有行业' },
      { value: 'rezidential', label: '住宅' },
      { value: 'industrial', label: '工业' },
      { value: 'medical', label: '医疗' },
      { value: 'maritim', label: '海事' },
    ],
    kwOptions: [
      { value: 0, label: '所有容量' },
      { value: 5, label: '5 kWh' },
      { value: 10, label: '10 kWh' },
      { value: 15, label: '15 kWh' },
      { value: 60, label: '60 kWh' },
      { value: 100, label: '100 kWh' },
      { value: 200, label: '200+ kWh' },
    ],
    voltiOptions: [
      { value: 0, label: '所有电压' },
      { value: 51, label: '51.2V' },
    ],
    invertorOptions: [
      { value: '', label: '所有逆变器' },
      { value: 'huawei', label: 'Huawei' },
      { value: 'solaredge', label: 'SolarEdge' },
      { value: 'sma', label: 'SMA' },
      { value: 'fronius', label: 'Fronius' },
      { value: 'victron', label: 'Victron' },
    ],
  },
}

export function getProduseTranslations(lang: LangCode): ProduseTranslations {
  return translations[lang] ?? translations.ro
}
