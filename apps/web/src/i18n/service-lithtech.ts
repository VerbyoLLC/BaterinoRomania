import type { LangCode } from './menu'

export type ServiceLithtechTranslations = {
  seoTitle: string
  seoDesc: string
  heroTitle: string
  heroSubtitle: string
  heroCta: string
  aboutTitle: string
  aboutText: string
  productsTitle: string
  products: { title: string; desc: string }[]
  servicesTitle: string
  services: { title: string; desc: string }[]
  whyTitle: string
  whyPoints: { title: string; desc: string }[]
  ctaTitle: string
  ctaSubtitle: string
  ctaButton: string
}

const ro: ServiceLithtechTranslations = {
  seoTitle: 'Service Oficial LithTech România – Centru Autorizat de Reparații Baterii',
  seoDesc:
    'Baterino este centrul oficial de service și reparații LithTech în România. Diagnosticăm și reparăm baterii rezidențiale EcoHome, sisteme BESS industriale și sisteme all-in-one LithTech.',
  heroTitle: 'Service Oficial LithTech în România',
  heroSubtitle:
    'Ai un produs LithTech care necesită service sau reparații? Baterino este partenerul autorizat LithTech în România — diagnosticăm, reparăm și întreținem întreaga gamă de produse LithTech.',
  heroCta: 'Contactează suportul',
  aboutTitle: 'Centrul Autorizat LithTech din România',
  aboutText:
    'Baterino Energy SRL este importatorul și distribuitorul exclusiv al produselor LithTech în România. Aceasta înseamnă că tehnicenii noștri sunt instruiți direct de LithTech, folosim piese de schimb originale și oferim garanție pe lucrările efectuate. Nu lăsați produsul dvs. LithTech pe mâna unor service-uri neautorizate care pot anula garanția.',
  productsTitle: 'Produse LithTech pe care le deservim',
  products: [
    {
      title: 'Baterii rezidențiale EcoHome',
      desc: 'Seria EcoHome 5kWh, 10kWh și 16kWh — diagnosticare BMS, înlocuire celule, actualizare firmware, testare capacitate.',
    },
    {
      title: 'Sisteme BESS Industriale',
      desc: 'Containere BESS 100kWh–1MWh+ — inspecție și mentenanță preventivă, diagnosticare EMS, reparații cabinet, testare sistem complet.',
    },
    {
      title: 'Sisteme All-in-One',
      desc: 'Seria HP All-in-One și TA/TB — service integrat invertor + baterie, actualizări software, reparații conexiuni și BMS.',
    },
  ],
  servicesTitle: 'Ce tipuri de service oferim',
  services: [
    {
      title: 'Diagnosticare',
      desc: 'Identificăm exact problema folosind echipamente și software LithTech originale.',
    },
    {
      title: 'Reparații',
      desc: 'Înlocuim componente defecte cu piese originale LithTech, cu garanție pe lucrare.',
    },
    {
      title: 'Mentenanță preventivă',
      desc: 'Inspecție periodică, curățare, testare capacitate și actualizare firmware pentru a prelungi durata de viață a sistemului.',
    },
    {
      title: 'Consultanță tehnică',
      desc: 'Nu ești sigur ce problemă are sistemul tău? Sunăm gratuit și îți explicăm pașii următori.',
    },
  ],
  whyTitle: 'De ce service autorizat și nu un service oarecare?',
  whyPoints: [
    {
      title: 'Garanția rămâne validă',
      desc: 'Service-ul neautorizat anulează garanția LithTech. La noi, garanția rămâne intactă.',
    },
    {
      title: 'Piese originale',
      desc: 'Folosim exclusiv piese de schimb originale LithTech, nu componente aftermarket.',
    },
    {
      title: 'Tehnicieni instruiți',
      desc: 'Echipa noastră este instruită direct de inginerii LithTech din Shenzhen.',
    },
    {
      title: 'Acoperire națională',
      desc: 'Intervenim în toată România. Livrare și returnare prin curier pentru sisteme rezidențiale.',
    },
  ],
  ctaTitle: 'Ai nevoie de service LithTech?',
  ctaSubtitle:
    'Sună-ne și îți spunem în câteva minute dacă problema ta poate fi rezolvată și care sunt pașii următori.',
  ctaButton: 'Trimite solicitare service LithTech',
}

const en: ServiceLithtechTranslations = {
  seoTitle: 'Official LithTech Service Center Romania – Authorised Battery Repairs',
  seoDesc:
    'Baterino is the official LithTech service and repair centre in Romania. We diagnose and repair EcoHome residential batteries, industrial BESS systems and LithTech all-in-one systems.',
  heroTitle: 'Official LithTech Service in Romania',
  heroSubtitle:
    'Do you have a LithTech product that needs service or repair? Baterino is the authorised LithTech partner in Romania — we diagnose, repair and maintain the full LithTech product range.',
  heroCta: 'Contact support',
  aboutTitle: 'The Authorised LithTech Centre in Romania',
  aboutText:
    'Baterino Energy SRL is the exclusive importer and distributor of LithTech products in Romania. This means our technicians are trained directly by LithTech, we use genuine spare parts and we provide a warranty on all work performed. Do not leave your LithTech product with unauthorised repair shops that may void the warranty.',
  productsTitle: 'LithTech products we service',
  products: [
    {
      title: 'EcoHome residential batteries',
      desc: 'EcoHome 5kWh, 10kWh and 16kWh series — BMS diagnostics, cell replacement, firmware updates, capacity testing.',
    },
    {
      title: 'Industrial BESS systems',
      desc: 'BESS containers 100kWh–1MWh+ — preventive inspection and maintenance, EMS diagnostics, cabinet repairs, full system testing.',
    },
    {
      title: 'All-in-One systems',
      desc: 'HP All-in-One and TA/TB series — integrated inverter + battery service, software updates, connection and BMS repairs.',
    },
  ],
  servicesTitle: 'Types of service we offer',
  services: [
    {
      title: 'Diagnostics',
      desc: 'We pinpoint the exact issue using original LithTech equipment and software.',
    },
    {
      title: 'Repairs',
      desc: 'We replace faulty components with genuine LithTech parts, with a warranty on the work.',
    },
    {
      title: 'Preventive maintenance',
      desc: 'Periodic inspection, cleaning, capacity testing and firmware updates to extend system life.',
    },
    {
      title: 'Technical consultation',
      desc: 'Not sure what is wrong with your system? Call us for free and we will explain the next steps.',
    },
  ],
  whyTitle: 'Why choose authorised service instead of any repair shop?',
  whyPoints: [
    {
      title: 'Your warranty stays valid',
      desc: 'Unauthorised service voids the LithTech warranty. With us, your warranty remains intact.',
    },
    {
      title: 'Genuine parts',
      desc: 'We use exclusively original LithTech spare parts, not aftermarket components.',
    },
    {
      title: 'Trained technicians',
      desc: 'Our team is trained directly by LithTech engineers in Shenzhen.',
    },
    {
      title: 'Nationwide coverage',
      desc: 'We operate across Romania. Courier collection and return for residential systems.',
    },
  ],
  ctaTitle: 'Need LithTech service?',
  ctaSubtitle:
    'Call us and we will tell you within minutes whether your issue can be resolved and what the next steps are.',
  ctaButton: 'Submit LithTech service request',
}

const zh: ServiceLithtechTranslations = {
  seoTitle: '罗马尼亚官方LithTech服务中心 – 授权电池维修',
  seoDesc:
    'Baterino是罗马尼亚官方LithTech服务与维修中心。我们诊断并维修EcoHome住宅电池、工业BESS系统以及LithTech一体机系统。',
  heroTitle: '罗马尼亚官方LithTech服务',
  heroSubtitle:
    '您的LithTech产品需要维修或保养吗？Baterino是罗马尼亚LithTech授权合作伙伴——我们诊断、维修并维护全系列LithTech产品。',
  heroCta: '联系支持',
  aboutTitle: '罗马尼亚LithTech授权服务中心',
  aboutText:
    'Baterino Energy SRL是LithTech产品在罗马尼亚的独家进口商和分销商。这意味着我们的技术人员由LithTech直接培训，我们使用原厂备件，并对所有维修工作提供质保。请勿将您的LithTech产品交给可能使保修失效的非授权维修点。',
  productsTitle: '我们服务的LithTech产品',
  products: [
    {
      title: 'EcoHome住宅电池',
      desc: 'EcoHome 5kWh、10kWh和16kWh系列——BMS诊断、电芯更换、固件升级、容量测试。',
    },
    {
      title: '工业BESS系统',
      desc: '100kWh–1MWh+ BESS集装箱——预防性检查与维护、EMS诊断、机柜维修、全系统测试。',
    },
    {
      title: '一体机系统',
      desc: 'HP一体机及TA/TB系列——逆变器+电池集成服务、软件升级、连接与BMS维修。',
    },
  ],
  servicesTitle: '我们提供的服务类型',
  services: [
    {
      title: '诊断',
      desc: '使用LithTech原厂设备和软件精确定位问题。',
    },
    {
      title: '维修',
      desc: '使用LithTech原厂零件更换故障组件，维修工作享有质保。',
    },
    {
      title: '预防性维护',
      desc: '定期检查、清洁、容量测试和固件升级，延长系统使用寿命。',
    },
    {
      title: '技术咨询',
      desc: '不确定系统出了什么问题？免费致电，我们为您说明后续步骤。',
    },
  ],
  whyTitle: '为什么选择授权服务而非普通维修店？',
  whyPoints: [
    {
      title: '保修仍然有效',
      desc: '非授权维修会使LithTech保修失效。在我们这里，您的保修保持有效。',
    },
    {
      title: '原厂零件',
      desc: '我们仅使用LithTech原厂备件，不使用副厂或替代组件。',
    },
    {
      title: '受过培训的技师',
      desc: '我们的团队由深圳LithTech工程师直接培训。',
    },
    {
      title: '全国覆盖',
      desc: '我们在罗马尼亚全境提供服务。住宅系统支持快递取件和返还。',
    },
  ],
  ctaTitle: '需要LithTech服务？',
  ctaSubtitle: '致电我们，几分钟内即可告知您的问题是否可以解决以及后续步骤。',
  ctaButton: '提交LithTech服务申请',
}

const translations: Record<LangCode, ServiceLithtechTranslations> = { ro, en, zh }

export function getServiceLithtechTranslations(lang: LangCode): ServiceLithtechTranslations {
  return translations[lang] ?? translations.ro
}
