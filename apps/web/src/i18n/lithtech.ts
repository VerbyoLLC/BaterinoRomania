import type { LangCode } from './menu'

export type LithTechTranslations = {
  // Page supertitle
  supertitle: string
  // Section A – Partnership intro
  sectionALeftBrand: string
  sectionALeftTitle: string
  sectionARightBrand: string
  sectionARightTitle: string
  // Section B – Technology
  sectionBLeftTitle: string
  tech1Title: string; tech1Desc: string
  tech2Title: string; tech2Desc: string
  tech3Title: string; tech3Desc: string
  sectionBRightTitle: string
  impl1Title: string; impl1Desc: string
  impl2Title: string; impl2Desc: string
  impl3Title: string; impl3Desc: string
  // Section C – Safety images
  sectionCLeftBrand: string
  sectionCLeftTitle: string
  sectionCRightBrand: string
  sectionCRightTitle: string
  // Section D – Control & Support
  sectionDLeftTitle: string
  ctrl1Title: string; ctrl1Desc: string
  ctrl2Title: string; ctrl2Desc: string
  ctrl3Title: string; ctrl3Desc: string
  sectionDRightTitle: string
  suport1Title: string; suport1Desc: string
  suport2Title: string; suport2Desc: string
  suport3Title: string; suport3Desc: string
  // CTA
  ctaTitle: string
  ctaDesc: string
  ctaBtn1: string
  ctaBtn2: string
  loadMore: string
}

const translations: Record<LangCode, LithTechTranslations> = {
  ro: {
    supertitle: 'IMPORTATOR ȘI PARTENER STRATEGIC CU LITHTECH',
    sectionALeftBrand: 'LITHTECH',
    sectionALeftTitle: 'PRODUCE TEHNOLOGIA',
    sectionARightBrand: 'BATERINO',
    sectionARightTitle: 'O IMPLEMENTEAZĂ',
    sectionBLeftTitle: 'TEHNOLOGIE DE STOCARE',
    tech1Title: 'Baterie de înaltă performanță',
    tech1Desc: 'Lithtech furnizează baterii litiu avansate, cu densitate energetică ridicată, durată lungă de viață (număr mare de cicluri) și optimizare inteligentă prin sistem BMS.',
    tech2Title: 'Baterie solid-state',
    tech2Desc: 'Dezvoltă baterii solid-state de nouă generație, cu siguranță superioară și stabilitate termică îmbunătățită, pentru sistemele energetice ale viitorului.',
    tech3Title: 'Celulă de combustibil cu hidrogen',
    tech3Desc: 'Explorează soluții bazate pe celule de combustibil cu hidrogen pentru a oferi o energie curată și eficientă, destinată aplicațiilor portabile și soluțiilor de back-up.',
    sectionBRightTitle: 'IMPLEMENTARE ȘI INFRASTRUCTURĂ',
    impl1Title: 'Distribuție și logistică națională',
    impl1Desc: 'Asigurăm importul, stocarea și livrarea rapidă prin depozite poziționate strategic în România, către instalatori și distribuitori.',
    impl2Title: 'Integrare și compatibilitate sisteme',
    impl2Desc: 'Configurăm și validăm compatibilitatea bateriilor cu invertoarele și sistemele existente.',
    impl3Title: 'Implementare proiecte energetice',
    impl3Desc: 'Dezvoltăm și coordonăm proiecte rezidențiale, industriale, medicale și maritime — de la consultanță la punere în funcțiune.',
    sectionCLeftBrand: 'LITHTECH',
    sectionCLeftTitle: 'CREEAZĂ PRODUSE SIGURE',
    sectionCRightBrand: 'BATERINO',
    sectionCRightTitle: 'ÎȚI OFERĂ SIGURANȚĂ',
    sectionDLeftTitle: 'CONTROL ȘI SIGURANȚA BATERIEI',
    ctrl1Title: 'Siguranță a produsului',
    ctrl1Desc: 'Lithtech proiectează fiecare sistem cu protecție pe mai multe niveluri, pentru a asigura o funcționare stabilă și fiabilă.',
    ctrl2Title: 'EMS – Sistem de monitorizare a energiei',
    ctrl2Desc: 'Sistemul EMS al Lithtech echilibrează consumul de energie între sisteme, maximizând eficiența și performanța.',
    ctrl3Title: 'BMS – Sistem de management al bateriei',
    ctrl3Desc: 'Sistemul BMS dezvoltat de Lithtech asigură o operare sigură și eficientă, prin monitorizare în timp real și control inteligent.',
    sectionDRightTitle: 'SUPORT & RESPONSABILITATE',
    suport1Title: 'Service și mentenanță în România',
    suport1Desc: 'Avem departament propriu de diagnoză, intervenție și reparații locale.',
    suport2Title: 'Sistem SWAP – înlocuire rapidă',
    suport2Desc: 'Asigurăm continuitatea funcționalității prin înlocuirea imediată a produsului în caz de probleme sau pe toată durata în care acesta se află în service.',
    suport3Title: 'Suport tehnic și relație cu clientul final',
    suport3Desc: 'Gestionăm garanțiile, suportul 24/7 și comunicarea cu utilizatorul final, reducând riscul pentru parteneri.',
    ctaTitle: 'Discutați cu echipa noastră',
    ctaDesc: 'Prin alianțe strategice solide, asigurăm stabilitate operațională și calitate constantă în fiecare proiect livrat.',
    ctaBtn1: 'VEZI PRODUSE',
    ctaBtn2: 'DISCUTĂ CU NOI',
    loadMore: 'VEZI MAI MULT',
  },
  en: {
    supertitle: 'IMPORTER AND STRATEGIC PARTNER WITH LITHTECH',
    sectionALeftBrand: 'LITHTECH',
    sectionALeftTitle: 'PRODUCES THE TECHNOLOGY',
    sectionARightBrand: 'BATERINO',
    sectionARightTitle: 'IMPLEMENTS IT',
    sectionBLeftTitle: 'STORAGE TECHNOLOGY',
    tech1Title: 'High-performance battery',
    tech1Desc: 'Lithtech supplies advanced lithium batteries with high energy density, long service life (high cycle count) and intelligent optimisation via BMS.',
    tech2Title: 'Solid-state battery',
    tech2Desc: 'Develops next-generation solid-state batteries with superior safety and improved thermal stability for future energy systems.',
    tech3Title: 'Hydrogen fuel cell',
    tech3Desc: 'Explores hydrogen fuel-cell solutions to provide clean, efficient energy for portable applications and back-up systems.',
    sectionBRightTitle: 'IMPLEMENTATION & INFRASTRUCTURE',
    impl1Title: 'National distribution & logistics',
    impl1Desc: 'We handle import, storage and fast delivery through strategically located warehouses across Romania, to installers and distributors.',
    impl2Title: 'System integration & compatibility',
    impl2Desc: 'We configure and validate battery compatibility with existing inverters and systems.',
    impl3Title: 'Energy project implementation',
    impl3Desc: 'We develop and coordinate residential, industrial, medical and maritime projects — from consultancy to commissioning.',
    sectionCLeftBrand: 'LITHTECH',
    sectionCLeftTitle: 'CREATES SAFE PRODUCTS',
    sectionCRightBrand: 'BATERINO',
    sectionCRightTitle: 'DELIVERS SAFETY TO YOU',
    sectionDLeftTitle: 'BATTERY CONTROL & SAFETY',
    ctrl1Title: 'Product safety',
    ctrl1Desc: 'Lithtech designs every system with multi-level protection to ensure stable and reliable operation.',
    ctrl2Title: 'EMS – Energy Monitoring System',
    ctrl2Desc: 'Lithtech\'s EMS balances energy consumption across systems, maximising efficiency and performance.',
    ctrl3Title: 'BMS – Battery Management System',
    ctrl3Desc: 'Lithtech\'s BMS ensures safe and efficient operation through real-time monitoring and intelligent control.',
    sectionDRightTitle: 'SUPPORT & RESPONSIBILITY',
    suport1Title: 'Service & maintenance in Romania',
    suport1Desc: 'We have our own diagnostics, intervention and local repair department.',
    suport2Title: 'SWAP System – fast replacement',
    suport2Desc: 'We ensure operational continuity through immediate product replacement in case of issues or during the full service period.',
    suport3Title: 'Technical support & end-customer relations',
    suport3Desc: 'We manage warranties, 24/7 support and end-user communication, reducing risk for partners.',
    ctaTitle: 'Talk to our team',
    ctaDesc: 'Through solid strategic alliances, we ensure operational stability and consistent quality in every project delivered.',
    ctaBtn1: 'VIEW PRODUCTS',
    ctaBtn2: 'CONTACT US',
    loadMore: 'VIEW MORE',
  },
  zh: {
    supertitle: 'LITHTECH独家进口商与战略合作伙伴',
    sectionALeftBrand: 'LITHTECH',
    sectionALeftTitle: '生产技术',
    sectionARightBrand: 'BATERINO',
    sectionARightTitle: '负责实施',
    sectionBLeftTitle: '储能技术',
    tech1Title: '高性能电池',
    tech1Desc: 'Lithtech提供高能量密度、长使用寿命（高循环次数）的先进锂电池，并通过BMS实现智能优化。',
    tech2Title: '固态电池',
    tech2Desc: '开发具有更高安全性和改良热稳定性的新一代固态电池，面向未来储能系统。',
    tech3Title: '氢燃料电池',
    tech3Desc: '探索基于氢燃料电池的解决方案，为便携式应用和备用系统提供清洁高效的能源。',
    sectionBRightTitle: '实施与基础设施',
    impl1Title: '全国分销与物流',
    impl1Desc: '我们通过在罗马尼亚战略性布局的仓库，负责进口、存储和快速交付，面向安装商和分销商。',
    impl2Title: '系统集成与兼容性',
    impl2Desc: '我们配置并验证电池与现有逆变器和系统的兼容性。',
    impl3Title: '能源项目实施',
    impl3Desc: '我们开发和协调住宅、工业、医疗和海事项目——从咨询到调试投运。',
    sectionCLeftBrand: 'LITHTECH',
    sectionCLeftTitle: '打造安全产品',
    sectionCRightBrand: 'BATERINO',
    sectionCRightTitle: '为您提供安全保障',
    sectionDLeftTitle: '电池控制与安全',
    ctrl1Title: '产品安全',
    ctrl1Desc: 'Lithtech为每个系统设计多层保护，确保稳定可靠运行。',
    ctrl2Title: 'EMS – 能源监控系统',
    ctrl2Desc: 'Lithtech的EMS在系统间平衡能源消耗，最大化效率和性能。',
    ctrl3Title: 'BMS – 电池管理系统',
    ctrl3Desc: 'Lithtech开发的BMS通过实时监控和智能控制确保安全高效运行。',
    sectionDRightTitle: '支持与责任',
    suport1Title: '罗马尼亚服务与维护',
    suport1Desc: '我们拥有自己的诊断、干预和本地维修部门。',
    suport2Title: 'SWAP系统 – 快速更换',
    suport2Desc: '我们通过在问题发生时或整个服务期间立即更换产品来确保运营连续性。',
    suport3Title: '技术支持与最终客户关系',
    suport3Desc: '我们管理保修、24/7支持和最终用户沟通，为合作伙伴降低风险。',
    ctaTitle: '与我们的团队沟通',
    ctaDesc: '通过坚实的战略联盟，我们确保每个交付项目的运营稳定性和持续质量。',
    ctaBtn1: '查看产品',
    ctaBtn2: '联系我们',
    loadMore: '查看更多',
  },
}

export function getLithTechTranslations(lang: LangCode): LithTechTranslations {
  return translations[lang] ?? translations.ro
}
