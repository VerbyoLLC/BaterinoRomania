import type { LangCode } from './menu'

export type MedicalTranslations = {
  // Hero
  heroTitle: string
  heroTagline: string
  // Nav labels
  navStocare: string
  navSisteme: string
  navAplicatii: string
  // Section 1 – Stocare
  sectionStocareTitle: string
  introP1: string
  introP2: string
  examplesTitle: string
  introExamples: string
  ctaSuport: string
  // Feature cards (5)
  cardGarantie: string
  cardProiectare: string
  cardSolutii: string
  cardInstalare: string
  cardService: string
  // Section 2 – Sisteme
  sectionSistemeTitle: string
  product1Name: string; product1Spec: string
  product2Name: string; product2Spec: string
  // Section 3 – Aplicații
  sectionAplicatiiTitle: string
  sectionAplicatiiDesc: string
  aplicatiiImagistica: string
  aplicatiiStomatologice: string
  aplicatiiRecoltare: string
  aplicatiiDentare: string
  aplicatiiSpitale: string
  aplicatiiDializa: string
  aplicatiiAmbulanta: string
  // CTA
  ctaTitle: string
  ctaDesc: string
  ctaButton: string
}

const translations: Record<LangCode, MedicalTranslations> = {
  ro: {
    heroTitle: 'STOCARE ENERGIE SECTOR MEDICAL',
    heroTagline: 'Soluții de stocare dedicate exclusiv infrastructurii medicale din România',
    navStocare: 'Stocare',
    navSisteme: 'Sisteme',
    navAplicatii: 'Aplicații',
    sectionStocareTitle: 'STOCARE ENERGIE PENTRU MEDIUL MEDICAL DIN ROMÂNIA',
    introP1:
      'Baterino MED este divizia noastra dedicata sectorului medical, cu **echipă specializată în evaluarea și implementarea soluțiilor de stocare a energiei pentru unități medicale din România.** Suntem singurul distribuitor cu structură dedicată exclusiv acestui domeniu.',
    introP2:
      'Implementăm soluții pentru **clinici de imagistică (CT, RM), cabinete stomatologice, laboratoare, centre de analiză și unități spitalicești.** Asigurăm conformitatea echipamentelor cu normele și protocoalele aplicabile.',
    examplesTitle: 'Exemple:',
    introExamples:
      'Cabinet stomatologic: 10–20 kWh pentru 1–2 circuite de flux, 30 kl/lună\nCentru clinice / imagistică CT: 15–30 kWh în creștere față de instalare\nClinică imagistică (Radiologie / Eco): 20–60 kWh pentru 1–3 circuite, în rol de continuitate a infrastructurii',
    ctaSuport: 'Suport complet, de la proiectare la mentenanță',
    cardGarantie: 'Garanție extinsă\n10 ani',
    cardProiectare: 'Proiectare tehnică dedicată',
    cardSolutii: 'Soluții\npersonalizate',
    cardInstalare: 'Instalare realizată de Baterino',
    cardService: 'Service și suport\nîn România',
    sectionSistemeTitle: 'SISTEME DE STOCARE LiFePo4 HIGH VOLTAGE MEDICAL',
    product1Name: 'Stackable LiFePo4 HV', product1Spec: '20,48 kWh – 40,96 kWh',
    product2Name: 'BESS', product2Spec: '60 kWh',
    sectionAplicatiiTitle: 'APLICAȚII REALE ALE SISTEMELOR BATERINO',
    sectionAplicatiiDesc:
      'Sistemele noastre de stocare a energiei sunt integrate în unități din infrastructura critică de sănătate, unde fiabilitatea și continuitatea energetică sunt esențiale.',
    aplicatiiImagistica: 'CLINICI IMAGISTICĂ CT',
    aplicatiiStomatologice: 'CABINETE STOMATOLOGICE',
    aplicatiiRecoltare: 'CENTRE DE RECOLTARE',
    aplicatiiDentare: 'LABORATOARE DENTARE',
    aplicatiiSpitale: 'CLINICI ȘI SPITALE MEDII',
    aplicatiiDializa: 'CENTRE DE DIALIZĂ',
    aplicatiiAmbulanta: 'STAȚII DE AMBULANȚĂ',
    ctaTitle: 'Discutați cu echipa noastră',
    ctaDesc:
      'Evaluăm, dimensionăm și implementăm soluții de stocare care protejează și susțin activitățile medicale critice.',
    ctaButton: 'SOLICITĂ EVALUARE TEHNICĂ',
  },
  en: {
    heroTitle: 'ENERGY STORAGE – MEDICAL SECTOR',
    heroTagline: 'Storage solutions dedicated exclusively to Romania\'s medical infrastructure',
    navStocare: 'Storage',
    navSisteme: 'Systems',
    navAplicatii: 'Applications',
    sectionStocareTitle: 'ENERGY STORAGE FOR THE MEDICAL ENVIRONMENT IN ROMANIA',
    introP1:
      'Baterino MED is our division dedicated to the medical sector, with a **team specialised in evaluating and implementing energy storage solutions for medical facilities in Romania.** We are the only distributor with a structure dedicated exclusively to this field.',
    introP2:
      'We implement solutions for **imaging clinics (CT, MRI), dental practices, laboratories, analysis centres and hospital units.** We ensure equipment compliance with applicable norms and protocols.',
    examplesTitle: 'Examples:',
    introExamples:
      'Dental practice: 10–20 kWh for 1–2 circuits, ~30 kl/month\nCT imaging centre: 15–30 kWh increasing from baseline\nImaging clinic (Radiology / Ultrasound): 20–60 kWh for 1–3 circuits, infrastructure continuity role',
    ctaSuport: 'Full support, from design to maintenance',
    cardGarantie: 'Extended\n10-year warranty',
    cardProiectare: 'Dedicated technical design',
    cardSolutii: 'Custom\nsolutions',
    cardInstalare: 'Installation by Baterino',
    cardService: 'Service & support\nin Romania',
    sectionSistemeTitle: 'LiFePo4 HIGH VOLTAGE MEDICAL STORAGE SYSTEMS',
    product1Name: 'Stackable LiFePo4 HV', product1Spec: '20.48 kWh – 40.96 kWh',
    product2Name: 'BESS', product2Spec: '60 kWh',
    sectionAplicatiiTitle: 'REAL APPLICATIONS OF BATERINO SYSTEMS',
    sectionAplicatiiDesc:
      'Our energy storage systems are integrated into critical healthcare infrastructure units where reliability and energy continuity are essential.',
    aplicatiiImagistica: 'CT IMAGING CLINICS',
    aplicatiiStomatologice: 'DENTAL PRACTICES',
    aplicatiiRecoltare: 'SAMPLE COLLECTION CENTRES',
    aplicatiiDentare: 'DENTAL LABORATORIES',
    aplicatiiSpitale: 'CLINICS & MEDIUM HOSPITALS',
    aplicatiiDializa: 'DIALYSIS CENTRES',
    aplicatiiAmbulanta: 'AMBULANCE STATIONS',
    ctaTitle: 'Talk to our team',
    ctaDesc:
      'We evaluate, size and implement storage solutions that protect and sustain critical medical activities.',
    ctaButton: 'REQUEST TECHNICAL ASSESSMENT',
  },
  zh: {
    heroTitle: '医疗领域储能',
    heroTagline: '专为罗马尼亚医疗基础设施提供的储能解决方案',
    navStocare: '储能',
    navSisteme: '系统',
    navAplicatii: '应用',
    sectionStocareTitle: '罗马尼亚医疗环境储能',
    introP1:
      'Baterino MED是我们专注于医疗领域的事业部，拥有**专业团队，负责为罗马尼亚医疗机构评估和实施储能解决方案。**我们是唯一专门从事该领域的分销商。',
    introP2:
      '我们为**影像诊所（CT、MRI）、牙科诊所、实验室、分析中心和医院单元**实施解决方案，确保设备符合适用规范和协议。',
    examplesTitle: '示例：',
    introExamples:
      '牙科诊所：10–20 kWh，1–2 回路，约30 kl/月\nCT影像中心：15–30 kWh（逐步增长）\n影像诊所（放射/超声）：20–60 kWh，1–3回路，基础设施连续性角色',
    ctaSuport: '全面支持，从设计到维护',
    cardGarantie: '延长\n10年质保',
    cardProiectare: '专属技术设计',
    cardSolutii: '定制化\n解决方案',
    cardInstalare: 'Baterino 安装实施',
    cardService: '罗马尼亚\n支持与服务',
    sectionSistemeTitle: 'LiFePo4高压医疗储能系统',
    product1Name: '堆叠式 LiFePo4 HV', product1Spec: '20.48 kWh – 40.96 kWh',
    product2Name: 'BESS', product2Spec: '60 kWh',
    sectionAplicatiiTitle: 'BATERINO系统的实际应用',
    sectionAplicatiiDesc:
      '我们的储能系统集成于关键医疗基础设施中，可靠性与能源连续性是其核心优势。',
    aplicatiiImagistica: 'CT影像诊所',
    aplicatiiStomatologice: '牙科诊所',
    aplicatiiRecoltare: '采样中心',
    aplicatiiDentare: '口腔实验室',
    aplicatiiSpitale: '诊所与中型医院',
    aplicatiiDializa: '透析中心',
    aplicatiiAmbulanta: '急救站',
    ctaTitle: '与我们的团队沟通',
    ctaDesc: '我们评估、设计并实施储能方案，保护和支持关键医疗活动。',
    ctaButton: '申请技术评估',
  },
}

export function getMedicalTranslations(lang: LangCode): MedicalTranslations {
  return translations[lang] ?? translations.ro
}
