import type { LangCode } from './menu'

export type ReducereProgram = {
  photo: string
  programLabel: string   // e.g. "PROGRAMUL TVA-UL DE 9%"
  title: string
  descriereScurta?: string  // short description for home page card
  description: string
  ctaLabel: string
  ctaTo: string
  termsLabel: string
  topIcon?: string       // optional icon shown on photo
  stiaiCa?: { title: string; text: string }  // info popover on icon click
  durataProgram?: string // e.g. "Permanent", "12 luni"
  discountPercent?: number // e.g. 12, 15, 5, 7
}

export type ReduceriTranslations = {
  heroTitle: string
  heroSubtitle: string
  programs: ReducereProgram[]
  howTitle: string
  howSteps: string[]      // 3 shared steps
  ctaBarTitle: string
  ctaBarDesc: string
  ctaBarBtn: string
  seoTitle: string
  seoDesc: string
}

const IMG = (f: string) => `/images/programe%20reduceri/${f}`
const CTA = '/login'

const translations: Record<LangCode, ReduceriTranslations> = {
  ro: {
    heroTitle: 'REDUCERILE BATERINO',
    heroSubtitle: 'Reduceri create pentru oameni, pentru comunitate și pentru independența energetică a fiecăruia dintre noi.',
    programs: [
      {
        photo: IMG('tva-cum-era.webp'),
        programLabel: 'PROGRAMUL TVA-UL DE 9%',
        title: '12% REDUCERE LA ORICE PRODUS',
        descriereScurta: 'Beneficiezi de 12% reducere din prețul fără TVA, la orice produs.',
        description: 'Eliminarea TVA-ului de 9% a generat scumpiri în lanț, inclusiv în piața bateriilor.\n\nNoi am ales să protejăm clienții, nu marja de profit: **beneficiezi de 12% reducere din prețul fără TVA, la orice produs.**',
        ctaLabel: 'CREEAZĂ CONT',
        ctaTo: CTA,
        termsLabel: 'Termeni și Condiții Reducere',
        durataProgram: 'Permanent',
        discountPercent: 12,
      },
      {
        photo: IMG('energie-pentru-parinti.webp'),
        programLabel: 'PROGRAMUL ENERGIE PENTRU PĂRINȚI',
        title: '15% REDUCERE PENTRU PENSIONARI',
        descriereScurta: '15% reducere din prețul fără TVA la orice produs Baterino pentru pensionari.',
        description: 'Pentru că fiecare leu din pensie contează pentru seniorii noștri, am creat un program dedicat lor.\n\n**Beneficiezi de 15% reducere din prețul fără TVA la orice produs Baterino**, dacă faci dovada pensionării și ești beneficiarul produsului.',
        ctaLabel: 'CREEAZĂ CONT',
        ctaTo: CTA,
        termsLabel: 'Termeni și Condiții Reducere',
        topIcon: '/images/programe%20reduceri/smiley-face-icon.svg',
        stiaiCa: {
          title: 'Știai că?',
          text: 'La Baterino, pensionarii au prioritate zero la suport tehnic. Pentru că știm că nu au răbdare atunci când ceva nu funcționează.',
        },
        durataProgram: 'Permanent',
        discountPercent: 15,
      },
      {
        photo: IMG('prietenie-cu-energie.webp'),
        programLabel: 'PROGRAMUL ȘTIU DE LA VECINU\'',
        title: '5% REDUCERE PENTRU PRIETENI ȘI VECINI',
        descriereScurta: 'Primești 5% reducere cu un cod oferit de un client Baterino.',
        description: 'Mereu îi sunai pe vecinu\' să îți dea borma șina. Acum sună-l să îți dea un cod de reducere Baterino.\n\n**Primești 5% reducere** atunci când folosești un cod oferit de un client Baterino. Codul este disponibil în contul fiecărui client și poate fi oferit unui client nou, la prima comandă.',
        ctaLabel: 'CREEAZĂ CONT',
        ctaTo: CTA,
        termsLabel: 'Termeni și Condiții Reducere',
        topIcon: '/images/programe%20reduceri/smiley-face-icon.svg',
        stiaiCa: {
          title: 'Știai că?',
          text: 'Dacă chiar nu găsești niciun prieten care să fie deja client, îl poți adăuga pe Baterino ca prieten pe Facebook, Instagram sau LinkedIn și să îi ceri lui un cod de reducere.',
        },
        durataProgram: 'Permanent',
        discountPercent: 5,
      },
      {
        photo: IMG('viata-la-tara-campanie-baterino.webp'),
        programLabel: 'PROGRAMUL VIAȚA LA ȚARĂ',
        title: '7% REDUCERE DACĂ LOCUIEȘTI LA ȚARĂ',
        descriereScurta: '7% reducere din prețul fără TVA dacă locuiești într-o comună sau sat.',
        description: 'Viața la țară înseamnă tradiție și grijă pentru casă. Suntem alături de cei care investesc în siguranța și confortul gospodăriei lor.\n\n**Beneficiezi de 7% reducere din prețul fără TVA** dacă factura este emisă pe numele beneficiarului final, iar în buletinul acestuia este trecut domiciliul într-o comună sau sat.',
        ctaLabel: 'CREEAZĂ CONT',
        ctaTo: CTA,
        termsLabel: 'Termeni și Condiții Reducere',
        durataProgram: 'Permanent',
        discountPercent: 7,
      },
    ],
    howTitle: 'CUM APLIC REDUCERILE BATERINO?',
    howSteps: [
      'Creează cont și alege produsul.',
      'Selectează programul de reducere din pagina produsului.',
      'Prețul se actualizează automat după aplicare.',
    ],
    ctaBarTitle: 'Calitate mai accesibilă ca niciodată',
    ctaBarDesc: 'Misiunea noastră este să oferim produse de calitate la prețuri accesibile. Alegem împreună soluția potrivită pentru tine.',
    ctaBarBtn: 'VEZI PRODUSE',
    seoTitle: 'Reduceri & Oferte',
    seoDesc: 'Programe de reducere Baterino: TVA-ul de 9%, Energie pentru Părinți, Știu de la Vecinu\' și Viața la Țară. Reduceri reale pentru oameni reali.',
  },
  en: {
    heroTitle: 'BATERINO DISCOUNTS',
    heroSubtitle: 'Discounts created for people, for community and for the energy independence of each of us.',
    programs: [
      {
        photo: IMG('tva-cum-era.webp'),
        programLabel: 'THE 9% VAT PROGRAMME',
        title: '12% DISCOUNT ON ANY PRODUCT',
        description: 'The removal of the 9% VAT generated a chain of price increases, including in the battery market.\n\nWe chose to protect our clients, not our profit margin: you benefit from a 12% discount off the VAT-exclusive price on any product.',
        ctaLabel: 'CREATE ACCOUNT',
        ctaTo: CTA,
        termsLabel: 'Discount Terms & Conditions',
      },
      {
        photo: IMG('energie-pentru-parinti.webp'),
        programLabel: 'ENERGY FOR PARENTS PROGRAMME',
        title: '15% DISCOUNT FOR PENSIONERS',
        description: 'Because every penny of a pension counts for our seniors, we created a dedicated programme for them.\n\nYou benefit from a 15% discount off the VAT-exclusive price on any Baterino product, if you provide proof of retirement and you are the product beneficiary.',
        ctaLabel: 'CREATE ACCOUNT',
        ctaTo: CTA,
        termsLabel: 'Discount Terms & Conditions',
        topIcon: '/images/programe%20reduceri/smiley-face-icon.svg',
        stiaiCa: {
          title: 'Did you know?',
          text: 'At Baterino, pensioners get priority zero technical support. Because we know they have no patience when something isn\'t working.',
        },
        discountPercent: 15,
      },
      {
        photo: IMG('prietenie-cu-energie.webp'),
        programLabel: 'I HEARD IT FROM THE NEIGHBOUR',
        title: '5% DISCOUNT FOR FRIENDS & NEIGHBOURS',
        description: 'You used to call your neighbour for a hand. Now call them for a Baterino discount code.\n\nGet 5% off when you use a code shared by a Baterino client. The code is available in every client\'s account and can be given to a new customer on their first order.',
        ctaLabel: 'CREATE ACCOUNT',
        ctaTo: CTA,
        termsLabel: 'Discount Terms & Conditions',
        topIcon: '/images/programe%20reduceri/smiley-face-icon.svg',
        stiaiCa: {
          title: 'Did you know?',
          text: 'If you can\'t find a friend who is already a Baterino client, you can add Baterino as a friend on Facebook, Instagram or LinkedIn and ask for a discount code.',
        },
      },
      {
        photo: IMG('viata-la-tara-campanie-baterino.webp'),
        programLabel: 'RURAL LIFE PROGRAMME',
        title: '7% DISCOUNT IF YOU LIVE IN A VILLAGE',
        description: 'Rural life means tradition and care for home. We support those who invest in the safety and comfort of their household.\n\nYou benefit from a 7% discount off the VAT-exclusive price if the invoice is issued in the name of the end beneficiary whose registered address is in a commune or village.',
        ctaLabel: 'CREATE ACCOUNT',
        ctaTo: CTA,
        termsLabel: 'Discount Terms & Conditions',
      },
    ],
    howTitle: 'HOW DO I APPLY BATERINO DISCOUNTS?',
    howSteps: [
      'Create an account and choose your product.',
      'Select the discount programme on the product page.',
      'The price updates automatically after applying.',
    ],
    ctaBarTitle: 'Quality more affordable than ever',
    ctaBarDesc: 'Our mission is to offer quality products at accessible prices. Together we find the right solution for you.',
    ctaBarBtn: 'VIEW PRODUCTS',
    seoTitle: 'Discounts & Offers',
    seoDesc: 'Baterino discount programmes: 9% VAT, Energy for Parents, Heard from the Neighbour and Rural Life. Real discounts for real people.',
  },
}

export function getReduceriTranslations(lang: LangCode): ReduceriTranslations {
  return translations[lang] ?? translations.ro
}
