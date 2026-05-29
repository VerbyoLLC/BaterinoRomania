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
    heroTitle: 'Studii de caz',
    heroDesc:
      'Proiecte reale în care sisteme de stocare a energiei Baterino și LithTech asigură autonomie, siguranță și eficiență operațională.',
    galleryPhotosAria: 'Număr de fotografii în galerie',
    cases: [
      {
        slug: '3-mwh-ups-skovde',
        category: 'INDUSTRIAL',
        title: '3 MWh UPS Cabinet Battery System',
        location: 'Skövde, Suedia',
        image: '/images/divizii/industrial/centre-de-date.jpg',
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
        image: '/images/divizii/industrial/ferme-solare.jpg',
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
        image: '/images/divizii/industrial/centre-logistica.jpg',
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
        image: '/images/slider2/slide2.jpg',
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
        image: '/images/slider2/slide4-261kwh-bess.jpg',
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
        image: '/images/slider2/slider3.jpg',
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
        image: '/images/divizii/industrial/centre-de-date.jpg',
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
        image: '/images/divizii/industrial/ferme-solare.jpg',
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
        image: '/images/divizii/industrial/centre-logistica.jpg',
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
        image: '/images/slider2/slide2.jpg',
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
        image: '/images/slider2/slide4-261kwh-bess.jpg',
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
        image: '/images/slider2/slider3.jpg',
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

  zh: {
    seoTitle: '案例研究 – Baterino 罗马尼亚',
    seoDesc: '采用LithTech系统的真实储能项目——工业、住宅、医疗与航海领域。',
    heroTitle: '案例研究',
    heroDesc: 'Baterino与LithTech储能系统在真实项目中的应用，提供自主性、安全性与运营效率。',
    galleryPhotosAria: '图库照片数量',
    cases: [
      {
        slug: '3-mwh-ups-skovde',
        category: '工业',
        title: '3 MWh UPS机柜电池系统',
        location: '瑞典 Skövde',
        image: '/images/divizii/industrial/centre-de-date.jpg',
        imageAlt: '工业设施中的3 MWh UPS机柜电池系统',
        imageCount: 3,
        specs: [
          { label: '容量', value: '3 MWh', highlight: true },
          { label: '太阳能', value: '1 MWp' },
          { label: '系统类型', value: '室内机柜' },
          { label: '国家', value: '瑞典' },
        ],
        tags: ['UPS备份', '工商业', 'FFR/FCR', '光储一体'],
      },
      {
        slug: 'bess-ferma-solara-romania',
        category: '工业',
        title: '与光伏电站集成的BESS',
        location: '罗马尼亚 Dolj',
        image: '/images/divizii/industrial/ferme-solare.jpg',
        imageAlt: '光伏电站与工业BESS系统',
        imageCount: 5,
        specs: [
          { label: '容量', value: '2.6 MWh', highlight: true },
          { label: '太阳能', value: '1.2 MWp' },
          { label: '应用', value: '能源套利' },
          { label: '国家', value: '罗马尼亚' },
        ],
        tags: ['BESS', '光储一体', '电网服务', '工商业'],
      },
      {
        slug: 'stocare-centru-logistic',
        category: '工业',
        title: '物流中心储能系统',
        location: '罗马尼亚 Ilfov',
        image: '/images/divizii/industrial/centre-logistica.jpg',
        imageAlt: '物流中心储能系统',
        imageCount: 4,
        specs: [
          { label: '容量', value: '500 kWh', highlight: true },
          { label: '功率', value: '250 kW' },
          { label: '系统类型', value: '户外集装箱' },
          { label: '行业', value: '物流' },
        ],
        tags: ['削峰', '工商业', 'LiFePO4', '备份'],
      },
      {
        slug: 'ecohome-rezidential-cluj',
        category: '住宅',
        title: 'EcoHome 10 kWh — 住宅自发自用',
        location: '罗马尼亚 克卢日-纳波卡',
        image: '/images/slider2/slide2.jpg',
        imageAlt: '住宅安装的EcoHome电池',
        imageCount: 2,
        specs: [
          { label: '储能', value: '10 kWh', highlight: true },
          { label: '太阳能', value: '6 kWp' },
          { label: '系统类型', value: '壁挂式' },
          { label: '国家', value: '罗马尼亚' },
        ],
        tags: ['EcoHome', 'LiFePO4', '自发自用', '住宅'],
      },
      {
        slug: 'bess-medical-imagistica',
        category: '医疗',
        title: '影像诊所BESS系统',
        location: '罗马尼亚 布加勒斯特',
        image: '/images/slider2/slide4-261kwh-bess.jpg',
        imageAlt: '关键医疗基础设施BESS系统',
        imageCount: 3,
        specs: [
          { label: '容量', value: '261 kWh', highlight: true },
          { label: '应用', value: '关键负载备份' },
          { label: '系统类型', value: '室内机柜' },
          { label: '国家', value: '罗马尼亚' },
        ],
        tags: ['医疗', 'UPS备份', '关键负载', 'BESS'],
      },
      {
        slug: 'stocare-maritim-port',
        category: '航海',
        title: '港口基础设施储能',
        location: '罗马尼亚 康斯坦察',
        image: '/images/slider2/slider3.jpg',
        imageAlt: '航海应用储能系统',
        imageCount: 2,
        specs: [
          { label: '容量', value: '1 MWh', highlight: true },
          { label: '应用', value: '港口与码头' },
          { label: '系统类型', value: '海事集装箱' },
          { label: '国家', value: '罗马尼亚' },
        ],
        tags: ['航海', '工商业', 'LiFePO4', '电网支持'],
      },
    ],
  },
}

export function getStudiiDeCazTranslations(lang: LangCode): StudiiDeCazTranslations {
  return translations[lang] ?? translations.ro
}
