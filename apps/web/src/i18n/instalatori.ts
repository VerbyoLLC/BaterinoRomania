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
    feat1Intro: 'Ca importatori direcți, eliminăm intermediarii, lucrăm cu volume mari și stabilim strategia de preț împreună cu partenerii noștri. Toate astea se traduc în prețuri mici pentru distribuitori și instalatori — ceea ce face ca marja ta de profitabilitate să crească semnificativ.',
    feat1Cards: [
      'Prețuri stabile și predictibile',
      'Marjă crescută cu volumul',
      'Acces la proiecte C&I',
      'Fără competiție neloială din partea noastră',
      'Protecție comercială',
    ],
    feat2Title: 'Preluăm responsabilitatea clientului final.',
    feat2Intro: 'Clientul tău final poate cere ajutor direct la noi prin platforma Baterino în cazul în care apar probleme. Preluăm integral responsabilitatea tehnică și comercială — tu nu ești lăsat singur în fața niciunei situații.',
    feat2Cards: [
      'Service în România',
      'Înlocuire rapidă',
      'Sistem SWAP — zero downtime',
      'Garanție 10 ani, gestionată de noi',
    ],
    feat3Title: 'POZIȚIONARE BRAND ȘI MARKETING',
    feat3Intro: 'Ca importatori exclusivi, investim în construirea și protejarea brandului LithTech în România — în beneficiul direct al partenerilor noștri.',
    feat3Cards: [
      'Campanii de marketing național',
      'Credibilitate construită pentru tine',
      'Strategie de prețuri controlată',
    ],
    feat4Title: 'GENERĂM LEAD-URI ȘI CLIENȚI PENTRU TINE',
    feat4Intro: 'Fiecare client care intră în ecosistemul Baterino este o oportunitate pentru partenerii noștri. Îți trimitem clienții direct — tu te ocupi de instalare.',
    feat4Cards: [
      'Recomandăm instalatori locali',
      'Vizibilitate în platforma Baterino',
      'Comenzi de mentenanță directe',
      'Parteneriat pe termen lung',
    ],
    ctaTitle: 'Devino partener Baterino',
    ctaDesc: 'Construim împreună o rețea solidă de distribuție și instalare. Scrie-ne și îți prezentăm condițiile de parteneriat.',
    ctaBtn1: 'DEVINO PARTNER',
    ctaBtn2: 'DESCARCĂ OFERTA',
    seoTitle: 'Distribuitori & Instalatori | Baterino Romania',
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
    feat1Intro: 'As direct importers, we eliminate intermediaries, work at scale and set pricing strategy together with our partners. This translates into lower costs for distributors and installers — driving a significant increase in your profit margin.',
    feat1Cards: [
      'Stable and predictable prices',
      'Margin grows with volume',
      'Access to C&I projects',
      'No unfair competition from our side',
      'Commercial protection',
    ],
    feat2Title: 'We take full responsibility for the end client.',
    feat2Intro: 'Your end client can request help directly from us through the Baterino platform if issues arise. We take full technical and commercial responsibility — you are never left alone in any situation.',
    feat2Cards: [
      'Service in Romania',
      'Fast replacement',
      'SWAP system — zero downtime',
      '10-year warranty, managed by us',
    ],
    feat3Title: 'BRAND POSITIONING & MARKETING',
    feat3Intro: 'As exclusive importers, we invest in building and protecting the LithTech brand in Romania — for the direct benefit of our partners.',
    feat3Cards: [
      'National marketing campaigns',
      'Credibility built for you',
      'Controlled pricing strategy',
    ],
    feat4Title: 'WE GENERATE LEADS & CLIENTS FOR YOU',
    feat4Intro: 'Every client who enters the Baterino ecosystem is an opportunity for our partners. We send clients directly to you — you handle the installation.',
    feat4Cards: [
      'We recommend local installers',
      'Visibility in the Baterino platform',
      'Direct maintenance orders',
      'Long-term partnership',
    ],
    ctaTitle: 'Become a Baterino Partner',
    ctaDesc: 'Together we build a strong distribution and installation network. Contact us and we\'ll walk you through our partnership terms.',
    ctaBtn1: 'BECOME A PARTNER',
    ctaBtn2: 'DOWNLOAD OFFER',
    seoTitle: 'Distributors & Installers | Baterino Romania',
    seoDesc: 'Become a Baterino partner and benefit from stable prices, 24/7 technical support, 10-year warranty and lead generation. Official LithTech importer in Romania.',
  },
}

export function getInstallatoriTranslations(lang: LangCode): InstallatoriTranslations {
  return translations[lang] ?? translations.ro
}
