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
  viewAll: string
  clearFilters: string
  productsVoltageAll: string
  productsVoltageLow: string
  productsVoltageHigh: string
  productsLocationAll: string
  productsLocationIndoor: string
  productsLocationOutdoor: string
  pretLabel: string
  currency: string
  noResults: string
  productsComingSoon: string
  loadingProducts: string
  disponibilPentruParteneri: string
  /** Residential card: replaces price when visibility is partner-only / hidden */
  catalogDisponibilParteneriPrice: string
  /** Residential card under price; `{pct}` = VAT % */
  catalogIncludesVatWithPct: string
  /** Residential card under price; `{price}` = net amount + currency */
  catalogPretFaraTva: string
  /** Partner catalog card: label under net unit price */
  catalogLabelPretFaraTva: string
  /** Partner catalog card: label under gross unit price */
  catalogLabelPretCuTva: string
  /** Partner catalog card: PRP / RRP (catalog list incl. VAT) */
  catalogLabelPrp: string
  /** Partner catalog card: MAP (minimum advertised price net) */
  catalogLabelMap: string
  /** Partner PRP/RRP info modal */
  catalogPrpInfoModalTitle: string
  catalogPrpInfoModalBody: string
  catalogMapInfoModalTitle: string
  catalogMapInfoModalBody: string
  catalogPriceInfoModalClose: string
  catalogPrpInfoAria: string
  catalogMapInfoAria: string
  /** Residential card image corner */
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
  catalogAddToCart: string
  catalogViewDetails: string
  catalogRequestQuote: string
  catalogPriceOnRequest: string
  catalogPriceOnRequestNote: string
  /** Catalog Produse: linie sub preț brut — `{price}` = sumă + monedă */
  catalogNetPriceLine: string
  /** Pagină produs: text sub eticheta stoc */
  catalogStockUnavailableDetailNote: string
  /** Panou parteneri: sub eticheta stoc când nu se poate comanda */
  catalogStockPartnerFooterNote: string
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
    viewAll: 'Vezi tot',
    clearFilters: 'Anulează filtrele',
    productsVoltageAll: 'Tensiune',
    productsVoltageLow: 'Tensiune joasă',
    productsVoltageHigh: 'Tensiune înaltă',
    productsLocationAll: 'Locație',
    productsLocationIndoor: 'Interior',
    productsLocationOutdoor: 'Exterior',
    pretLabel: 'Preț',
    currency: 'RON',
    noResults: 'Niciun produs nu corespunde filtrelor selectate.',
    productsComingSoon: 'Site-ul este în curs de actualizare. Produsele vor fi disponibile în curând.',
    loadingProducts: 'Se încarcă produsele…',
    disponibilPentruParteneri: 'VEZI DETALII',
    catalogDisponibilParteneriPrice: 'Disponibil Partneri',
    catalogIncludesVatWithPct: 'Include TVA {pct}%',
    catalogPretFaraTva: 'Preț fără TVA: {price}',
    catalogLabelPretFaraTva: 'Preț fără TVA',
    catalogLabelPretCuTva: 'Preț cu TVA',
    catalogLabelPrp: 'PRP',
    catalogLabelMap: 'MAP',
    catalogPrpInfoModalTitle: 'Preț de Vânzare Recomandat',
    catalogPrpInfoModalBody:
      'Preț orientativ recomandat de Baterino (importator) pentru vânzarea către clientul final în România. Conform legislației UE, nu este obligatoriu.',
    catalogMapInfoModalTitle: 'Preț Minim de Publicitate',
    catalogMapInfoModalBody:
      'Prețul minim la care acest produs poate fi afișat sau promovat public pe piața din România, conform contractului de partener. Se referă strict la prețul publicat — nu la prețul final negociat cu clientul. Scopul este menținerea unui nivel de preț coerent pe piață și protejarea marjelor partenerilor noștri.',
    catalogPriceInfoModalClose: 'Închide',
    catalogPrpInfoAria: 'Informații despre PRP',
    catalogMapInfoAria: 'Informații despre MAP',
    catalogBadgeStocCategory: 'Stoc',
    catalogBadgeLivrareCategory: 'Livrare',
    catalogBadgeTransportCategory: 'Transport',
    catalogBadgeInstalareCategory: 'Instalare',
    catalogStockInStock: 'În Stoc',
    catalogStockOutOfStock: 'Stoc epuizat',
    catalogStockComingSoon: 'În curând',
    catalogStockOnOrder: 'La comandă',
    catalogDelivery24h: '24 ore',
    catalogDelivery48h: '48 ore',
    catalogDelivery7_14d: '7 - 14 zile',
    catalogDelivery60d: '60 de zile',
    catalogTransportFree: 'Gratuit',
    catalogTransportPaid: 'Contra cost',
    catalogInstallBaterino: 'Baterino',
    catalogInstallPartner: 'Partener',
    catalogReducereBadge: 'Programe Reduceri',
    catalogAddToCart: 'Adaugă în coș',
    catalogViewDetails: 'Vezi detalii',
    catalogRequestQuote: 'Cere ofertă',
    catalogPriceOnRequest: 'La cerere',
    catalogPriceOnRequestNote: 'Se stabilește pe configurație',
    catalogNetPriceLine: '{price} fără TVA',
    catalogStockUnavailableDetailNote: 'Acest produs nu este disponibil pentru comandă în acest moment.',
    catalogStockPartnerFooterNote: 'Momentan indisponibil pentru comenzi în contul partener.',
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
    viewAll: 'See all',
    clearFilters: 'Clear filters',
    productsVoltageAll: 'Voltage',
    productsVoltageLow: 'Low Voltage',
    productsVoltageHigh: 'High Voltage',
    productsLocationAll: 'Location',
    productsLocationIndoor: 'Indoor',
    productsLocationOutdoor: 'Outdoor',
    pretLabel: 'Price',
    currency: 'RON',
    noResults: 'No products match the selected filters.',
    productsComingSoon: 'The site is being updated. Products will be available soon.',
    loadingProducts: 'Loading products…',
    disponibilPentruParteneri: 'VIEW DETAILS',
    catalogDisponibilParteneriPrice: 'Available to partners',
    catalogIncludesVatWithPct: 'Includes VAT {pct}%',
    catalogPretFaraTva: 'Price excl. VAT: {price}',
    catalogLabelPretFaraTva: 'Price excl. VAT',
    catalogLabelPretCuTva: 'Price incl. VAT',
    catalogLabelPrp: 'RRP',
    catalogLabelMap: 'MAP',
    catalogPrpInfoModalTitle: 'Recommended Selling Price',
    catalogPrpInfoModalBody:
      'Guidance price recommended by Baterino (importer) for sales to end customers in Romania. Under EU law, it is not mandatory.',
    catalogMapInfoModalTitle: 'Minimum Advertised Price',
    catalogMapInfoModalBody:
      'The minimum price at which this product may be publicly displayed or promoted on the Romanian market, under your partner agreement. It applies strictly to the published price — not the final price negotiated with the customer. The aim is to maintain consistent market pricing and protect our partners’ margins.',
    catalogPriceInfoModalClose: 'Close',
    catalogPrpInfoAria: 'RRP information',
    catalogMapInfoAria: 'MAP information',
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
    catalogAddToCart: 'Add to cart',
    catalogViewDetails: 'View details',
    catalogRequestQuote: 'Request quote',
    catalogPriceOnRequest: 'On request',
    catalogPriceOnRequestNote: 'Based on configuration',
    catalogNetPriceLine: '{price} excl. VAT',
    catalogStockUnavailableDetailNote: 'This product is not available to order at the moment.',
    catalogStockPartnerFooterNote: 'Currently unavailable for partner portal orders.',
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
}

export function getProduseTranslations(lang: LangCode): ProduseTranslations {
  return translations[lang] ?? translations.ro
}
