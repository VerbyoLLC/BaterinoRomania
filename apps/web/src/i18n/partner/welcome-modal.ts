import type { LangCode } from '../menu'

export type PartnerWelcomeModalTranslations = {
  closeAria: string
  brandLabel: string
  accountCreatedBadge: string
  title: string
  titleNameSuffix: string
  introBefore: string
  introBold: string
  introAfter: string
  benefitsTitle: string
  benefit1Title: string
  benefit1Body: string
  benefit2Title: string
  benefit2Body: string
  benefit3Title: string
  benefit3Body: string
  benefit4Title: string
  benefit4Body: string
  stepsTitle: string
  step1Title: string
  step1Badge: string
  step1Body: string
  step2Title: string
  step2Body: string
  step3Title: string
  step3Body: string
  dontShowAgain: string
  helpBefore: string
  helpLink: string
  exploreCatalog: string
}

const ro: PartnerWelcomeModalTranslations = {
  closeAria: 'Închide',
  brandLabel: 'BATERINO PARTENER',
  accountCreatedBadge: 'Cont creat',
  title: 'Bun venit în rețeaua de parteneri Baterino',
  titleNameSuffix: ', {name}.',
  introBefore: 'Contul tău este activ. Mai e ',
  introBold: 'un singur pas',
  introAfter: ' până vezi prețurile de partener și poți comanda — prima ta comandă.',
  benefitsTitle: 'De ce Baterino',
  benefit1Title: 'Preț de partener pe volum',
  benefit1Body: 'Reducere reală, ajustată după cât comanzi.',
  benefit2Title: 'Stoc în România',
  benefit2Body: 'Livrare în 24–48h din depozitul local.',
  benefit3Title: 'Service local + SWAP',
  benefit3Body: 'Echipă în RO și baterie de schimb pe durata reparației.',
  benefit4Title: 'Promovarea afacerii tale',
  benefit4Body: 'Te listăm ca partener autorizat în rețeaua Baterino și îți trimitem clienți din zona ta.',
  stepsTitle: 'Cum îți activezi prețul de partener',
  step1Title: 'Plasează prima comandă',
  step1Badge: 'PASUL TĂU ACUM',
  step1Body:
    'Adaugi produsele în cerere și o trimiți echipei Baterino — fără preț de partener încă, doar reperele de catalog.',
  step2Title: 'Îți activăm reducerea',
  step2Body: 'Stabilim prețul tău de partener pe volum și revenim în max. 1 zi lucrătoare.',
  step3Title: 'Comanzi direct, la prețul tău',
  step3Body: 'Din acel moment vezi toate prețurile și comanzi din coș, fără să ne mai contactezi de fiecare dată.',
  dontShowAgain: 'Nu mai afișa acest mesaj',
  helpBefore: 'Ai întrebări înainte de prima comandă? ',
  helpLink: 'Scrie-ne →',
  exploreCatalog: 'Explorează catalogul',
}

const en: PartnerWelcomeModalTranslations = {
  closeAria: 'Close',
  brandLabel: 'BATERINO PARTNER',
  accountCreatedBadge: 'Account created',
  title: 'Welcome to the Baterino partner network',
  titleNameSuffix: ', {name}.',
  introBefore: 'Your account is active. There is ',
  introBold: 'one more step',
  introAfter: ' before you see partner prices and can order — your first order.',
  benefitsTitle: 'Why Baterino',
  benefit1Title: 'Volume-based partner pricing',
  benefit1Body: 'Real discount, adjusted to how much you order.',
  benefit2Title: 'Stock in Romania',
  benefit2Body: '24–48h delivery from our local warehouse.',
  benefit3Title: 'Local service + SWAP',
  benefit3Body: 'Romanian team and a swap battery while yours is repaired.',
  benefit4Title: 'Business promotion',
  benefit4Body: 'We list you as an authorized partner and send customers from your area.',
  stepsTitle: 'How to activate your partner price',
  step1Title: 'Place your first order',
  step1Badge: 'YOUR STEP NOW',
  step1Body:
    'Add products to your request and send it to the Baterino team — no partner price yet, only catalog reference prices.',
  step2Title: 'We activate your discount',
  step2Body: 'We set your volume partner price and get back to you within 1 business day.',
  step3Title: 'Order directly at your price',
  step3Body: 'From then on you see all prices and order from the cart without contacting us each time.',
  dontShowAgain: 'Do not show this message again',
  helpBefore: 'Questions before your first order? ',
  helpLink: 'Contact us →',
  exploreCatalog: 'Browse catalog',
}

const translations: Record<LangCode, PartnerWelcomeModalTranslations> = { ro, en }

export function getPartnerWelcomeModalTranslations(lang: LangCode): PartnerWelcomeModalTranslations {
  return translations[lang] ?? ro
}
