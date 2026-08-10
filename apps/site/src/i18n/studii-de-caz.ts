import type { LangCode } from './menu'
import type { CaseStudyCardSpec } from '../components/studii/CaseStudyCard'

export type CaseStudyEntry = {
  slug: string
  category: string
  title: string
  location: string
  image: string
  imageAlt: string
  imageCount: number
  specs: CaseStudyCardSpec[]
  tags: string[]
}

export type StudiiDeCazTranslations = {
  seoTitle: string
  seoDesc: string
  heroTitle: string
  heroDesc: string
  galleryPhotosAria: string
  cases: CaseStudyEntry[]
}

const translations: Record<LangCode, StudiiDeCazTranslations> = {
  ro: {
    seoTitle: 'Studii de caz – Baterino România',
    seoDesc:
      'Proiecte reale de stocare a energiei implementate cu sisteme LithTech — industrial, rezidențial, medical și maritim.',
    heroTitle: 'Proiecte Industriale',
    heroDesc:
      'Importăm, furnizăm și instalăm sistemele de stocare a energiei cu baterii LiFePo4 pentru mediul industrial în România și Europa.',
    galleryPhotosAria: 'Număr de fotografii în galerie',
    cases: [
      {
        slug: '3-mwh-ups-skovde',
        category: 'INDUSTRIAL',
        title: '3 MWh UPS Cabinet Battery System',
        location: 'Skövde, Suedia',
        image: '/images/divizii/industrial/centre-de-date.webp',
        imageAlt: 'Sistem de baterii UPS 3 MWh în cabinet industrial',
        imageCount: 3,
        specs: [
          { label: 'Capacitate', value: '3 MWh', highlight: true },
          { label: 'Solar PV', value: '1 MWp' },
          { label: 'Tip sistem', value: 'Cabinet interior' },
          { label: 'Țară', value: 'Suedia' },
        ],
        tags: ['UPS Backup', 'C&I', 'FFR/FCR', 'Solar+Storage'],
      },
      {
        slug: 'bess-ferma-solara-romania',
        category: 'INDUSTRIAL',
        title: 'BESS integrat cu parc fotovoltaic',
        location: 'Dolj, România',
        image: '/images/divizii/industrial/ferme-solare.webp',
        imageAlt: 'Parc fotovoltaic cu sistem BESS industrial',
        imageCount: 5,
        specs: [
          { label: 'Capacitate', value: '2,6 MWh', highlight: true },
          { label: 'Solar PV', value: '1,2 MWp' },
          { label: 'Aplicație', value: 'Arbitraj energie' },
          { label: 'Țară', value: 'România' },
        ],
        tags: ['BESS', 'Solar+Storage', 'Grid services', 'C&I'],
      },
      {
        slug: 'stocare-centru-logistic',
        category: 'INDUSTRIAL',
        title: 'Stocare pentru centre logistice',
        location: 'Ilfov, România',
        image: '/images/divizii/industrial/centre-logistica.webp',
        imageAlt: 'Sistem de stocare energie pentru centru logistic',
        imageCount: 4,
        specs: [
          { label: 'Capacitate', value: '500 kWh', highlight: true },
          { label: 'Putere', value: '250 kW' },
          { label: 'Tip sistem', value: 'Container outdoor' },
          { label: 'Sector', value: 'Logistică' },
        ],
        tags: ['Peak shaving', 'C&I', 'LiFePO4', 'Backup'],
      },
      {
        slug: 'ecohome-rezidential-cluj',
        category: 'REZIDENTIAL',
        title: 'EcoHome 10 kWh — autoconsum rezidențial',
        location: 'Cluj-Napoca, România',
        image: '/images/slider2/slide2.webp',
        imageAlt: 'Baterie rezidențială EcoHome instalată la domiciliu',
        imageCount: 2,
        specs: [
          { label: 'Stocare', value: '10 kWh', highlight: true },
          { label: 'Solar PV', value: '6 kWp' },
          { label: 'Tip sistem', value: 'Wall-mounted' },
          { label: 'Țară', value: 'România' },
        ],
        tags: ['EcoHome', 'LiFePO4', 'Autoconsum', 'Rezidențial'],
      },
      {
        slug: 'bess-medical-imagistica',
        category: 'MEDICAL',
        title: 'BESS pentru clinică de imagistică',
        location: 'București, România',
        image: '/images/slider2/slide4-261kwh-bess.webp',
        imageAlt: 'Sistem BESS pentru infrastructură medicală critică',
        imageCount: 3,
        specs: [
          { label: 'Capacitate', value: '261 kWh', highlight: true },
          { label: 'Aplicație', value: 'Backup critic' },
          { label: 'Tip sistem', value: 'Indoor cabinet' },
          { label: 'Țară', value: 'România' },
        ],
        tags: ['Medical', 'UPS Backup', 'Critical load', 'BESS'],
      },
      {
        slug: 'stocare-maritim-port',
        category: 'MARITIM',
        title: 'Stocare energie pentru infrastructură portuară',
        location: 'Constanța, România',
        image: '/images/slider2/slider3.webp',
        imageAlt: 'Sistem de stocare energie pentru aplicații maritime',
        imageCount: 2,
        specs: [
          { label: 'Capacitate', value: '1 MWh', highlight: true },
          { label: 'Aplicație', value: 'Port & terminal' },
          { label: 'Tip sistem', value: 'Container marin' },
          { label: 'Țară', value: 'România' },
        ],
        tags: ['Maritim', 'C&I', 'LiFePO4', 'Grid support'],
      },
    ],
  },

  en: {
    seoTitle: 'Case studies – Baterino Romania',
    seoDesc:
      'Real energy storage projects delivered with LithTech systems — industrial, residential, medical and maritime.',
    heroTitle: 'Case studies',
    heroDesc:
      'Real-world projects where Baterino and LithTech storage systems deliver autonomy, safety and operational efficiency.',
    galleryPhotosAria: 'Number of gallery photos',
    cases: [
      {
        slug: '3-mwh-ups-skovde',
        category: 'INDUSTRIAL',
        title: '3 MWh UPS Cabinet Battery System',
        location: 'Skövde, Sweden',
        image: '/images/divizii/industrial/centre-de-date.webp',
        imageAlt: '3 MWh UPS cabinet battery system in an industrial facility',
        imageCount: 3,
        specs: [
          { label: 'Capacity', value: '3 MWh', highlight: true },
          { label: 'Solar PV', value: '1 MWp' },
          { label: 'System type', value: 'Indoor cabinet' },
          { label: 'Country', value: 'Sweden' },
        ],
        tags: ['UPS Backup', 'C&I', 'FFR/FCR', 'Solar+Storage'],
      },
      {
        slug: 'bess-ferma-solara-romania',
        category: 'INDUSTRIAL',
        title: 'BESS integrated with solar farm',
        location: 'Dolj, Romania',
        image: '/images/divizii/industrial/ferme-solare.webp',
        imageAlt: 'Solar farm with industrial BESS system',
        imageCount: 5,
        specs: [
          { label: 'Capacity', value: '2.6 MWh', highlight: true },
          { label: 'Solar PV', value: '1.2 MWp' },
          { label: 'Application', value: 'Energy arbitrage' },
          { label: 'Country', value: 'Romania' },
        ],
        tags: ['BESS', 'Solar+Storage', 'Grid services', 'C&I'],
      },
      {
        slug: 'stocare-centru-logistic',
        category: 'INDUSTRIAL',
        title: 'Storage for logistics centres',
        location: 'Ilfov, Romania',
        image: '/images/divizii/industrial/centre-logistica.webp',
        imageAlt: 'Energy storage system for a logistics centre',
        imageCount: 4,
        specs: [
          { label: 'Capacity', value: '500 kWh', highlight: true },
          { label: 'Power', value: '250 kW' },
          { label: 'System type', value: 'Outdoor container' },
          { label: 'Sector', value: 'Logistics' },
        ],
        tags: ['Peak shaving', 'C&I', 'LiFePO4', 'Backup'],
      },
      {
        slug: 'ecohome-rezidential-cluj',
        category: 'RESIDENTIAL',
        title: 'EcoHome 10 kWh — residential self-consumption',
        location: 'Cluj-Napoca, Romania',
        image: '/images/slider2/slide2.webp',
        imageAlt: 'EcoHome residential battery installed at home',
        imageCount: 2,
        specs: [
          { label: 'Storage', value: '10 kWh', highlight: true },
          { label: 'Solar PV', value: '6 kWp' },
          { label: 'System type', value: 'Wall-mounted' },
          { label: 'Country', value: 'Romania' },
        ],
        tags: ['EcoHome', 'LiFePO4', 'Self-consumption', 'Residential'],
      },
      {
        slug: 'bess-medical-imagistica',
        category: 'MEDICAL',
        title: 'BESS for imaging clinic',
        location: 'Bucharest, Romania',
        image: '/images/slider2/slide4-261kwh-bess.webp',
        imageAlt: 'BESS system for critical medical infrastructure',
        imageCount: 3,
        specs: [
          { label: 'Capacity', value: '261 kWh', highlight: true },
          { label: 'Application', value: 'Critical backup' },
          { label: 'System type', value: 'Indoor cabinet' },
          { label: 'Country', value: 'Romania' },
        ],
        tags: ['Medical', 'UPS Backup', 'Critical load', 'BESS'],
      },
      {
        slug: 'stocare-maritim-port',
        category: 'MARITIM',
        title: 'Energy storage for port infrastructure',
        location: 'Constanța, Romania',
        image: '/images/slider2/slider3.webp',
        imageAlt: 'Energy storage system for maritime applications',
        imageCount: 2,
        specs: [
          { label: 'Capacity', value: '1 MWh', highlight: true },
          { label: 'Application', value: 'Port & terminal' },
          { label: 'System type', value: 'Marine container' },
          { label: 'Country', value: 'Romania' },
        ],
        tags: ['Maritime', 'C&I', 'LiFePO4', 'Grid support'],
      },
    ],
  },

}

export function getStudiiDeCazTranslations(lang: LangCode): StudiiDeCazTranslations {
  return translations[lang] ?? translations.ro
}
