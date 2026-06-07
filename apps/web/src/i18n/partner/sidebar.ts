import type { LangCode } from '../menu'

export type PartnerSidebarAdvantageRow = { label: string; sub: string }

export type PartnerSidebarSupportItem = { id: string; label: string; sub: string }

export type PartnerSidebarTranslations = {
  reducereEyebrow: string
  reducereTitle: string
  reducereBenefit: string
  reducereNoDiscount: string
  reducereContact: string
  inverterTitle: string
  inverterBody: string
  inverterOpenLabel: string
  partnerAdvantagesTitle: string
  partnerAdvantageRows: PartnerSidebarAdvantageRow[]
  sigurantaTitle: string
  sigurantaItems: PartnerSidebarAdvantageRow[]
  suportTitle: string
  suportItems: PartnerSidebarSupportItem[]
  suportCta: string
}

const ro: PartnerSidebarTranslations = {
  reducereEyebrow: 'Reducere partener',
  reducereTitle: 'Reducere',
  reducereBenefit: 'Beneficiezi de o reducere de {pct}% la toate produsele.',
  reducereNoDiscount: 'Nicio reducere configurată momentan.',
  reducereContact: 'Contactați-ne pentru a stabili condițiile de parteneriat.',
  inverterTitle: 'Compatibilitate invertoare',
  inverterBody: 'Verifică dacă bateriile noastre sunt compatibile cu invertoarele clienților tăi.',
  inverterOpenLabel: 'Deschide căutarea de compatibilitate invertoare',
  partnerAdvantagesTitle: 'Avantaje Partener',
  partnerAdvantageRows: [
    {
      label: 'Reduceri parteneri',
      sub: 'Prețuri preferențiale și condiții clare dedicate partenerilor Baterino.',
    },
    {
      label: 'Promovare afacere',
      sub: 'Vizibilitate pe platformă și acces la clienți din zona ta care caută instalatori.',
    },
    {
      label: 'Prețuri predictibile',
      sub: 'Structură stabilă și marje ușor de anticipat pentru fiecare proiect.',
    },
    {
      label: 'Produse de calitate',
      sub: 'Baterii certificate, verificate tehnic și acoperite de garanție extinsă.',
    },
  ],
  sigurantaTitle: 'Siguranța Clientului Tău',
  sigurantaItems: [
    { label: '', sub: 'Produsele sunt acoperite de garanție extinsă de 10 ani.' },
    { label: '', sub: 'Compatibile cu 99% dintre invertoarele de pe piață.' },
    { label: '', sub: 'Retur gratuit în primele 15 zile de la achiziție.' },
    { label: '', sub: 'Înlocuire rapidă a bateriei în caz de defecțiune.' },
  ],
  suportTitle: 'Suport Tehnic',
  suportItems: [
    {
      id: 'service',
      label: 'Suport & Service',
      sub: 'Echipă dedicată pentru întrebări tehnice și service în România.',
    },
    {
      id: 'install',
      label: 'Asistență instalare',
      sub: 'Sprijin la montaj, verificarea conexiunilor și punerea în funcțiune pentru fiecare proiect.',
    },
    {
      id: 'docs',
      label: 'Documentație tehnică',
      sub: 'Fișe de montaj, datasheet-uri și proceduri actualizate, disponibile la cerere.',
    },
  ],
  suportCta: 'Contactează suportul →',
}

const en: PartnerSidebarTranslations = {
  reducereEyebrow: 'Partner discount',
  reducereTitle: 'Discount',
  reducereBenefit: 'You benefit from a {pct}% discount on all products.',
  reducereNoDiscount: 'No discount configured at the moment.',
  reducereContact: 'Contact us to set up partnership terms.',
  inverterTitle: 'Inverter compatibility',
  inverterBody: "Check whether our batteries are compatible with your customers' inverters.",
  inverterOpenLabel: 'Open inverter compatibility search',
  partnerAdvantagesTitle: 'Partner advantages',
  partnerAdvantageRows: [
    {
      label: 'Partner discounts',
      sub: 'Preferential pricing and transparent terms for Baterino partners.',
    },
    {
      label: 'Business promotion',
      sub: 'Platform visibility and homeowner demand in your service area.',
    },
    {
      label: 'Predictable pricing',
      sub: 'Stable structures and margins you can plan around on every job.',
    },
    {
      label: 'Quality products',
      sub: 'Certified batteries, technically validated with strong warranty backing.',
    },
  ],
  sigurantaTitle: 'Your customer safety',
  sigurantaItems: [
    { label: '', sub: 'Products are covered by an extended 10-year warranty.' },
    { label: '', sub: 'Compatible with 99% of inverters on the market.' },
    { label: '', sub: 'Free returns within the first 15 days after purchase.' },
    { label: '', sub: 'Fast battery replacement in case of a defect.' },
  ],
  suportTitle: 'Technical support',
  suportItems: [
    {
      id: 'service',
      label: 'Support & service',
      sub: 'Dedicated team for technical questions and servicing in Romania.',
    },
    {
      id: 'install',
      label: 'Installation assistance',
      sub: 'Help with mounting, connection checks and commissioning on every installation.',
    },
    {
      id: 'docs',
      label: 'Technical documentation',
      sub: 'Mounting guides, datasheets and up-to-date procedures available on request.',
    },
  ],
  suportCta: 'Contact support →',
}


const translations: Record<LangCode, PartnerSidebarTranslations> = { ro, en }

export function getPartnerSidebarTranslations(lang: LangCode): PartnerSidebarTranslations {
  return translations[lang] ?? translations.ro
}
