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


const translations: Record<LangCode, ServiceLithtechTranslations> = { ro, en }

export function getServiceLithtechTranslations(lang: LangCode): ServiceLithtechTranslations {
  return translations[lang] ?? translations.ro
}
