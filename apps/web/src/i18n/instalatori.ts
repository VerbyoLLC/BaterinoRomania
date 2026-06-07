import type { LangCode } from './menu'

export type InstallatoriTranslations = {
  // Hero header
  supertitle: string
  heroTitle: string
  realizatDe: string
  // Left column
  leftTitle: string
  introText: string
  btn1: string
  btn2: string
  // Image cards (2×2)
  imageCard1: string
  imageCard2: string
  imageCard3: string
  imageCard4: string
  // Features section
  featuresTitle: string
  feat1Title: string
  feat1Intro: string
  feat1Cards: string[]
  feat2Title: string
  feat2Intro: string
  feat2Cards: string[]
  feat3Title: string
  feat3Intro: string
  feat3Cards: string[]
  feat4Title: string
  feat4Intro: string
  feat4Cards: string[]
  // CTA
  ctaTitle: string
  ctaDesc: string
  ctaBtn1: string
  ctaBtn2: string
  // SEO
  seoTitle: string
  seoDesc: string
}

const translations: Record<LangCode, InstallatoriTranslations> = {
  ro: {
    supertitle: 'DEZVOLTĂM REȚEAUA DE',
    heroTitle: 'DISTRIBUITORI ȘI INSTALATORI',
    realizatDe: 'Importator',
    leftTitle: 'MAI MULT PROFIT.\nZERO COMPLICAȚII.',
    introText: 'Oferim condiții comerciale competitive, structură de preț dedicată partenerilor, stoc permanent și suport real în proiecte.\n\nCa **importatori oficiali LithTech**, punem la dispoziție produse verificate, livrare rapidă și infrastructura necesară pentru a-ți dezvolta afacerea în siguranță și cu profit.',
    btn1: 'DEVINO PARTNER',
    btn2: 'DESCARCĂ OFERTA (.pdf)',
    imageCard1: 'STRUCTURĂ DE PREȚ ORIENTATĂ CĂTRE PARTENERI',
    imageCard2: 'STOCURI PERMANENTE ȘI LIVRARE ÎN 48 DE ORE',
    imageCard3: 'PRELUĂM RESPONSABILITATEA CLIENTULUI FINAL',
    imageCard4: 'PRODUSE VERIFICATE CALITATIV ȘI UȘOR DE INSTALAT',
    featuresTitle: 'AVANTAJELE DE A LUCRA CU BATERINO ȘI LITHTECH',
    feat1Title: 'STRUCTURĂ DE PREȚ ORIENTATĂ CĂTRE PARTENERI',
    feat1Intro: 'Ca importatori direcți, controlăm lanțul de distribuție. Asta înseamnă:',
    feat1Cards: [
      'Prețuri stabile, predictibile și accesibile',
      'Marje competitive și reduceri pentru volum',
      'Acces la proiecte industriale de anvergură',
      'Fără competiție neloială din partea noastră',
      'Protecție comercială',
    ],
    feat2Title: 'PRELUĂM RESPONSABILITATEA PRODUSULUI',
    feat2Intro: 'Nu rămâi singur în fața clientului final.',
    feat2Cards: [
      'Service în România și suport tehnic 24/7',
      'Responsabilitate completă asupra produsului',
      'Înlocuire rapidă în caz că apar probleme',
      'Baterie la schimb pe durata diagnozei (sistem SWAP)',
      'Garanție 10 ani gestionată direct de noi',
    ],
    feat3Title: 'POZIȚIONARE BRAND ȘI MARKETING',
    feat3Intro: 'Ca importatori, promovăm și protejăm imaginea LithTech în România.',
    feat3Cards: [
      'Lansăm campanii de marketing pentru produs',
      'Creștem încrederea clienților față de produs',
      'Supraveghem și controlăm strategia de prețuri',
    ],
    feat4Title: 'GENERĂM LEAD-URI ȘI CLIENȚI PENTRU TINE',
    feat4Intro: 'Promovăm partenerii noștri în rețeaua Baterino.',
    feat4Cards: [
      'Recomandăm instalatori locali fiecărui client Baterino',
      'Plasăm compania ta în platforma și aplicația Baterino',
      'Direcționăm către tine comenzile de mentenanță',
      'Construim relații pe termen lung',
    ],
    ctaTitle: 'Devino partener Baterino',
    ctaDesc: 'Construim împreună o rețea solidă de distribuție și instalare. Scrie-ne și îți prezentăm condițiile de parteneriat.',
    ctaBtn1: 'DEVINO PARTNER',
    ctaBtn2: 'DESCARCĂ OFERTA',
    seoTitle: 'Distribuitori & Instalatori',
    seoDesc: 'Devino partener Baterino și beneficiază de prețuri stabile, suport tehnic 24/7, garanție 10 ani și generare de lead-uri. Importator oficial LithTech în România.',
  },
  en: {
    supertitle: 'WE GROW THE NETWORK OF',
    heroTitle: 'DISTRIBUTORS & INSTALLERS',
    realizatDe: 'Importer',
    leftTitle: 'MORE PROFIT.\nZERO COMPLICATIONS.',
    introText: 'We offer competitive commercial terms, a partner-dedicated pricing structure, permanent stock and real project support.\n\nAs **official LithTech importers**, we provide verified products, fast delivery and the infrastructure needed to grow your business safely and profitably.',
    btn1: 'BECOME A PARTNER',
    btn2: 'DOWNLOAD OFFER (.pdf)',
    imageCard1: 'PARTNER-ORIENTED PRICING STRUCTURE',
    imageCard2: 'PERMANENT STOCK & DELIVERY IN 48 HOURS',
    imageCard3: 'WE TAKE RESPONSIBILITY FOR THE END CLIENT',
    imageCard4: 'QUALITY-VERIFIED PRODUCTS, EASY TO INSTALL',
    featuresTitle: 'THE ADVANTAGES OF WORKING WITH BATERINO & LITHTECH',
    feat1Title: 'PARTNER-ORIENTED PRICING STRUCTURE',
    feat1Intro: 'As direct importers, we control the distribution chain. This means:',
    feat1Cards: [
      'Stable, predictable and accessible prices',
      'Competitive margins and volume discounts',
      'Access to large-scale industrial projects',
      'No unfair competition from our side',
      'Commercial protection',
    ],
    feat2Title: 'WE TAKE PRODUCT RESPONSIBILITY',
    feat2Intro: 'You are never left alone facing the end client.',
    feat2Cards: [
      'Service in Romania and technical support 24/7',
      'Full product responsibility',
      'Rapid replacement if issues arise',
      'Swap battery during diagnostics (SWAP system)',
      '10-year warranty managed directly by us',
    ],
    feat3Title: 'BRAND POSITIONING & MARKETING',
    feat3Intro: 'As importers, we promote and protect the LithTech brand in Romania.',
    feat3Cards: [
      'We launch product marketing campaigns',
      'We grow client trust in the product',
      'We oversee and control the pricing strategy',
    ],
    feat4Title: 'WE GENERATE LEADS & CLIENTS FOR YOU',
    feat4Intro: 'We promote our partners in the Baterino network.',
    feat4Cards: [
      'We recommend local installers to every Baterino client',
      'We list your company on the Baterino platform and app',
      'We direct maintenance orders to you',
      'We build long-term relationships',
    ],
    ctaTitle: 'Become a Baterino Partner',
    ctaDesc: 'Together we build a strong distribution and installation network. Contact us and we\'ll walk you through our partnership terms.',
    ctaBtn1: 'BECOME A PARTNER',
    ctaBtn2: 'DOWNLOAD OFFER',
    seoTitle: 'Distributors & Installers',
    seoDesc: 'Become a Baterino partner and benefit from stable prices, 24/7 technical support, 10-year warranty and lead generation. Official LithTech importer in Romania.',
  },
}

export function getInstallatoriTranslations(lang: LangCode): InstallatoriTranslations {
  return translations[lang] ?? translations.ro
}
