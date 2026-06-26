import type { LangCode } from './menu'

export type PoliticaDeReturBlock =
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }

export type PoliticaDeReturSection = {
  title: string
  blocks: PoliticaDeReturBlock[]
}

export type PoliticaDeReturTranslations = {
  seoTitle: string
  seoDesc: string
  pageTitle: string
  tocTitle: string
  lastUpdated: string
  sections: PoliticaDeReturSection[]
}

const translations: Record<LangCode, PoliticaDeReturTranslations> = {
  ro: {
    seoTitle: 'Politica de Retur – Baterino România',
    seoDesc:
      'Politica de retur Baterino: dreptul de retragere, termen de 15 zile, condiții de returnare, rambursare și pașii pentru inițierea returului.',
    pageTitle: 'Politica de Retur',
    tocTitle: 'Cuprins',
    lastUpdated: 'Ultima actualizare: 25 Mai 2026',
    sections: [
      {
        title: '1. Dispoziții generale',
        blocks: [
          {
            kind: 'p',
            text: 'Prezenta politică descrie condițiile în care clienții Baterino Energy SRL pot solicita returnarea produselor achiziționate prin site-ul baterino.ro, în conformitate cu legislația aplicabilă în România și cu politica comercială afișată pe site.',
          },
        ],
      },
      {
        title: '2. Dreptul de retragere',
        blocks: [
          {
            kind: 'p',
            text: 'Pentru consumatorii persoane fizice care achiziționează online, dreptul de retragere din contractul la distanță este reglementat de legislația aplicabilă în România, inclusiv **OUG nr. 34/2014** privind drepturile consumatorilor în contractele la distanță.',
          },
        ],
      },
      {
        title: '3. Termenul de retur',
        blocks: [
          {
            kind: 'p',
            text: 'Baterino permite solicitarea returului produsului în termen de **15 zile calendaristice** de la data primirii produsului de către dumneavoastră (sau de o terță parte desemnată de dumneavoastră), în limitele prevăzute de lege și în conformitate cu politica comercială afișată pe site.',
          },
        ],
      },
      {
        title: '4. Condiții pentru produse returnate',
        blocks: [
          {
            kind: 'p',
            text: 'Produsele returnate trebuie să respecte condițiile legale și comerciale privind starea produsului, ambalajului și accesoriilor. La primire, Baterino poate verifica conformitatea cu aceste condiții.',
          },
          {
            kind: 'ul',
            items: [
              'Produsul trebuie returnat în starea în care a fost livrat, cu ambalajul original, accesoriile și documentele aferente, acolo unde este cazul.',
              'Detalii suplimentare și documentație (ex. fotografii) pot fi solicitate prin formularul de retur pentru verificarea conformității.',
              'Produsele care nu îndeplinesc condițiile legale sau comerciale pot fi refuzate sau pot face obiectul unui proces de evaluare suplimentar.',
            ],
          },
        ],
      },
      {
        title: '5. Rambursarea',
        blocks: [
          {
            kind: 'p',
            text: 'După recepționarea coletului de retur și confirmarea conformității cu politica de retur, rambursarea contravalorii produsului se realizează, de regulă, în **maximum 5 zile lucrătoare** de la această confirmare.',
          },
          {
            kind: 'p',
            text: 'Rambursarea se efectuează prin aceeași metodă de plată folosită la comandă sau prin transfer bancar către un cont indicat de dumneavoastră, după caz.',
          },
        ],
      },
      {
        title: '6. Inițierea returului',
        blocks: [
          {
            kind: 'p',
            text: 'Pentru a iniția un retur, utilizați pagina **Returnare produse** din site, completați pașii indicați și transmiteți cererea.',
          },
          {
            kind: 'p',
            text: 'Echipa Baterino vă poate confirma primirea cererii și pașii următori, inclusiv adresa de expediere pentru retur, dacă este cazul.',
          },
        ],
      },
    ],
  },
  en: {
    seoTitle: 'Return Policy – Baterino Romania',
    seoDesc:
      'Baterino return policy: right of withdrawal, 15-day window, return conditions, refunds and how to start a return.',
    pageTitle: 'Return Policy',
    tocTitle: 'Table of contents',
    lastUpdated: 'Last updated: 25 May 2026',
    sections: [
      {
        title: '1. General provisions',
        blocks: [
          {
            kind: 'p',
            text: 'This policy describes the conditions under which customers of Baterino Energy SRL may request the return of products purchased through baterino.ro, in accordance with applicable Romanian law and the commercial policy published on the website.',
          },
        ],
      },
      {
        title: '2. Right of withdrawal',
        blocks: [
          {
            kind: 'p',
            text: 'For individual consumers who purchase online, the right of withdrawal from distance contracts is governed by applicable Romanian law, including **Government Emergency Ordinance no. 34/2014** on consumer rights in distance contracts.',
          },
        ],
      },
      {
        title: '3. Return period',
        blocks: [
          {
            kind: 'p',
            text: 'Baterino allows you to request a return within **15 calendar days** from the date you (or a third party designated by you) physically receive the product, within the limits set by law and in line with the commercial policy published on the website.',
          },
        ],
      },
      {
        title: '4. Conditions for returned products',
        blocks: [
          {
            kind: 'p',
            text: 'Returned products must meet the legal and commercial requirements regarding product condition, packaging and accessories. On receipt, Baterino may verify compliance with these conditions.',
          },
          {
            kind: 'ul',
            items: [
              'The product must be returned in the condition in which it was delivered, with original packaging, accessories and related documents where applicable.',
              'Additional details and documentation (e.g. photos) may be requested via the return form to verify compliance.',
              'Products that do not meet legal or commercial conditions may be refused or subject to further assessment.',
            ],
          },
        ],
      },
      {
        title: '5. Refunds',
        blocks: [
          {
            kind: 'p',
            text: 'After we receive the return parcel and confirm compliance with the return policy, we will refund the product value, as a rule within **5 business days** from that confirmation.',
          },
          {
            kind: 'p',
            text: 'Refunds are made using the same payment method as the original order or by bank transfer to an account you provide, as applicable.',
          },
        ],
      },
      {
        title: '6. Starting a return',
        blocks: [
          {
            kind: 'p',
            text: 'To start a return, use the **Product returns** page on the website, follow the steps and submit your request.',
          },
          {
            kind: 'p',
            text: 'The Baterino team may confirm receipt of your request and next steps, including a return shipping address where applicable.',
          },
        ],
      },
    ],
  },
}

export function getPoliticaDeReturTranslations(lang: LangCode): PoliticaDeReturTranslations {
  return translations[lang] ?? translations.ro
}
