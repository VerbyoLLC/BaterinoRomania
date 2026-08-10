import type { LangCode } from './menu'

export type SigurantaTranslations = {
  supertitle: string
  heroTitle: string
  heroSubtitle: string
  pillarsEyebrow: string
  pillarTrust: string
  pillarStability: string
  pillarPerformance: string
  // Feature 1 – SWAP
  swapTitle: string
  swapDesc: string
  // Feature 2 – Suport
  suportTitle: string
  suportDesc: string
  // Feature 3 – Testare
  testareTitle: string
  testareDesc: string
  // Feature 4 – Garantie
  garantieTitle: string
  garantieDesc: string
  // Feature 5 – Service (full width)
  serviceTitle: string
  serviceDesc: string
  // CTA
  ctaTitle: string
  ctaDesc: string
  ctaBtn1: string
  ctaBtn2: string
  readMore: string
  modalClose: string
}

const translations: Record<LangCode, SigurantaTranslations> = {
  ro: {
    supertitle: 'PROMISIUNEA NOASTRĂ ESTE',
    heroTitle: 'SĂ ÎȚI FURNIZĂM PRODUSE DE CALITATE ȘI SERVICII DE ÎNCREDERE',
    heroSubtitle:
      'Import direct LithTech, testare riguroasă, garanție de 10 ani și service local — tot ce ai nevoie ca sistemul tău să funcționeze fără griji.',
    pillarsEyebrow: 'Serviciile Baterino se bazează pe',
    pillarTrust: 'Încredere',
    pillarStability: 'Stabilitate',
    pillarPerformance: 'Performanță',
    swapTitle: 'SERVICIUL BATERINO SWAP',
    swapDesc: 'Am construit serviciile Baterino pe trei piloni esențiali: **încredere, stabilitate și performanță**. Prin serviciul **Baterino SWAP**, **îți oferim o baterie la schimb — același model sau unul superior — pe toată durata procesului de diagnoză și reparație**, astfel încât sistemul tău să rămână funcțional fără întreruperi.',
    suportTitle: 'SUPORT ȘI MENTENANȚĂ',
    suportDesc: 'Asigurăm **service și mentenanță în România**, atât pentru clienții rezidențiali, cât și pentru cei industriali. Echipa noastră tehnică gestionează rapid **intervențiile, verificările periodice și suportul post-instalare**, pentru ca sistemul tău să funcționeze la parametri optimi pe termen lung.',
    testareTitle: 'TESTARE AVANSATĂ A PRODUSELOR',
    testareDesc: 'Colaborăm cu un partener tehnologic etalon, **LithTech**, ceea ce ne permite să **testăm fiecare model de baterie timp de două luni** înainte de a-l importa și pune la dispoziția clienților noștri. Verificăm **performanța, compoziția fizică și stabilitatea** în condiții reale, pentru a aduce pe piață doar soluții validate și sigure.',
    garantieTitle: 'GARANȚIA 10 ANI A PRODUSELOR',
    garantieDesc: 'Fiecare produs comercializat de Baterino beneficiază de o **garanție extinsă de 10 ani**, reflectând încrederea noastră în tehnologia pe care o distribuim și în **standardele ridicate de calitate** pe care le impunem fiecărui sistem.',
    serviceTitle: 'SERVICE, DIAGNOZĂ ȘI REPARAȚII ÎN ROMÂNIA',
    serviceDesc: 'Împreună cu partenerul nostru strategic, **LithTech**, **am deschis în România un centru de mentenanță și intervenție rapidă**, dotat cu toate echipamentele necesare pentru diagnoză și reparații. Prezența unui service local ne permite să oferim servicii de înaltă calitate și să **reducem semnificativ timpul de intervenție** în cazul unor eventuale probleme.',
    ctaTitle: 'Discutați cu echipa noastră',
    ctaDesc: 'Evaluăm și dimensionăm soluții energetice pentru operare eficientă și sigură, adaptate nevoilor dumneavoastră.',
    ctaBtn1: 'VEZI PRODUSE',
    ctaBtn2: 'DISCUTĂ CU NOI',
    readMore: 'Citește mai mult',
    modalClose: 'Închide',
  },
  en: {
    supertitle: 'OUR PROMISE IS',
    heroTitle: 'TO PROVIDE YOU WITH QUALITY PRODUCTS AND RELIABLE SERVICES',
    heroSubtitle:
      'Direct LithTech import, rigorous testing, a 10-year warranty and local service — everything you need for worry-free operation.',
    pillarsEyebrow: 'Baterino services are built on',
    pillarTrust: 'Trust',
    pillarStability: 'Stability',
    pillarPerformance: 'Performance',
    swapTitle: 'BATERINO SWAP SERVICE',
    swapDesc: 'We have built Baterino services on three essential pillars: **trust, stability and performance**. Through the **Baterino SWAP** service, **we offer you a replacement battery — the same model or a superior one — throughout the entire diagnosis and repair process**, so your system stays operational without interruption.',
    suportTitle: 'SUPPORT & MAINTENANCE',
    suportDesc: 'We provide **service and maintenance in Romania** for both residential and industrial clients. Our technical team rapidly handles **interventions, periodic checks and post-installation support**, ensuring your system operates at optimal parameters in the long term.',
    testareTitle: 'ADVANCED PRODUCT TESTING',
    testareDesc: 'We partner with a benchmark technology partner, **LithTech**, which allows us to **test every battery model for two months** before importing and making it available to our clients. We verify **performance, physical composition and stability** under real conditions, bringing only validated and safe solutions to market.',
    garantieTitle: '10-YEAR PRODUCT WARRANTY',
    garantieDesc: 'Every product commercialised by Baterino benefits from an **extended 10-year warranty**, reflecting our confidence in the technology we distribute and the **high quality standards** we impose on every system.',
    serviceTitle: 'SERVICE, DIAGNOSTICS & REPAIRS IN ROMANIA',
    serviceDesc: 'Together with our strategic partner **LithTech**, **we have opened a rapid maintenance and intervention centre in Romania**, equipped with all the tools needed for diagnostics and repairs. A local service presence allows us to deliver high-quality services and **significantly reduce intervention time** in the event of any issues.',
    ctaTitle: 'Talk to our team',
    ctaDesc: 'We evaluate and size energy solutions for efficient and safe operation, tailored to your needs.',
    ctaBtn1: 'VIEW PRODUCTS',
    ctaBtn2: 'CONTACT US',
    readMore: 'Read more',
    modalClose: 'Close',
  },
}

export function getSigurantaTranslations(lang: LangCode): SigurantaTranslations {
  return translations[lang] ?? translations.ro
}
