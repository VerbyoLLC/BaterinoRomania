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
}

export function getMedicalTranslations(lang: LangCode): MedicalTranslations {
  return translations[lang] ?? translations.ro
}
