import type { LangCode } from './menu'

export type SigurantaTranslations = {
  supertitle: string
  heroTitle: string
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
}

const translations: Record<LangCode, SigurantaTranslations> = {
  ro: {
    supertitle: 'PROMISIUNEA NOASTRĂ ESTE',
    heroTitle: 'SĂ ÎȚI FURNIZĂM PRODUSE DE CALITATE ȘI SERVICII DE ÎNCREDERE',
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
  },
  en: {
    supertitle: 'OUR PROMISE IS',
    heroTitle: 'TO PROVIDE YOU WITH QUALITY PRODUCTS AND RELIABLE SERVICES',
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
  },
  zh: {
    supertitle: '我们的承诺是',
    heroTitle: '为您提供优质产品和可靠服务',
    swapTitle: 'BATERINO换电服务',
    swapDesc: '我们在三大核心支柱上构建Baterino服务：**信任、稳定性和性能**。通过**Baterino换电服务**，**我们在整个诊断和维修过程中为您提供备用电池——相同型号或更优型号**——确保您的系统不间断运行。',
    suportTitle: '支持与维护',
    suportDesc: '我们在罗马尼亚为住宅和工业客户提供**服务和维护**。我们的技术团队迅速处理**干预、定期检查和安装后支持**，确保您的系统长期以最佳参数运行。',
    testareTitle: '先进产品测试',
    testareDesc: '我们与标杆技术合作伙伴**LithTech**合作，这使我们能够在进口并提供给客户之前**对每种电池型号进行两个月的测试**。我们在真实条件下验证**性能、物理组成和稳定性**，只将经过验证的安全解决方案推向市场。',
    garantieTitle: '10年产品质保',
    garantieDesc: 'Baterino销售的每款产品均享有**10年延长保修**，体现了我们对所分销技术的信心以及我们对每个系统所施加的**高质量标准**。',
    serviceTitle: '罗马尼亚服务、诊断与维修',
    serviceDesc: '我们与战略合作伙伴**LithTech**共同**在罗马尼亚开设了快速维护和干预中心**，配备了诊断和维修所需的全部设备。本地服务的存在使我们能够提供高质量服务，并在出现任何问题时**显著缩短干预时间**。',
    ctaTitle: '与我们的团队沟通',
    ctaDesc: '我们评估和设计高效安全的储能解决方案，根据您的需求量身定制。',
    ctaBtn1: '查看产品',
    ctaBtn2: '联系我们',
  },
}

export function getSigurantaTranslations(lang: LangCode): SigurantaTranslations {
  return translations[lang] ?? translations.ro
}
