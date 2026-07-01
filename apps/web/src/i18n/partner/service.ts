import type { LangCode } from '../menu'

export type PartnerServiceAdvantage = { title: string; subtitle: string }

export type PartnerServiceTimelineStep = {
  label: string
  sub?: string
  state: 'done' | 'current' | 'todo'
}

export type PartnerServiceTranslations = {
  title: string
  pageSubtitle: string
  emptyTitle: string
  emptyBody: string
  loadingAria: string
  formTitle: string
  formIntro: string
  stepSnTitle: string
  stepSnHint: string
  stepSnLabel: string
  stepSnSearch: string
  stepSnSearching: string
  stepSnNotFound: string
  stepSnInvalid: string
  stepDetailsTitle: string
  stepDetailsChangeSn: string
  fieldProblemLabel: string
  fieldProblemPlaceholder: string
  fieldClientNameLabel: string
  fieldClientNamePlaceholder: string
  fieldClientNameOptional: string
  fieldLocationLabel: string
  fieldLocationPlaceholder: string
  submitRequest: string
  submittingRequest: string
  successTitle: string
  successBody: string
  successNewRequest: string
  recentRequestsTitle: string
  recentRequestsEmpty: string
  requestStatusOpen: string
  requestStatusInProgress: string
  requestStatusResolved: string
  requestStatusClosed: string
  activeRequestWarning: string
  step1Small: string
  step1Label: string
  step2Small: string
  step2Label: string
  step3Small: string
  step3Label: string
  snFormatPin: string
  whereFindSn: string
  snCounter: string
  snCounterComplete: string
  snHintInline: string
  snIncompleteHint: string
  productFoundTitle: string
  productFoundSubtitle: string
  recentEmptyTitle: string
  recentEmptyBody: string
  activeRequestsBadge: string
  preDiscountSectionTitle: string
  preDiscountSectionIntro: string
  preDiscountHeroTitle: string
  preDiscountHeroBodyPrefix: string
  preDiscountHeroBodyHighlight: string
  preDiscountHeroBodySuffix: string
  preDiscountTicketChipId: string
  preDiscountTicketChipProduct: string
  preDiscountTicketChipStatus: string
  preDiscountHeroCta: string
  preDiscountAdvantages: PartnerServiceAdvantage[]
  preDiscountPreviewHeading: string
  preDiscountPreviewFoot: string
  preDiscountPreviewTicketId: string
  preDiscountPreviewStatus: string
  preDiscountPreviewProductName: string
  preDiscountPreviewProductSn: string
  preDiscountPreviewIssueLabel: string
  preDiscountPreviewIssueText: string
  preDiscountTimelineSteps: PartnerServiceTimelineStep[]
  contractGateSubtitle: string
}

const roTimeline: PartnerServiceTimelineStep[] = [
  { label: 'Sesizare primită', sub: '12 iun, 09:14', state: 'done' },
  { label: 'În analiză tehnică', sub: '12 iun, 16:30', state: 'done' },
  { label: 'În reparație', sub: 'Tehnician alocat · ETA 3 zile', state: 'current' },
  { label: 'Rezolvată', state: 'todo' },
]

const enTimeline: PartnerServiceTimelineStep[] = [
  { label: 'Request received', sub: 'Jun 12, 09:14', state: 'done' },
  { label: 'Technical review', sub: 'Jun 12, 16:30', state: 'done' },
  { label: 'In repair', sub: 'Technician assigned · ETA 3 days', state: 'current' },
  { label: 'Resolved', state: 'todo' },
]

const ro: PartnerServiceTranslations = {
  title: 'Reparatii',
  pageSubtitle: 'Suport tehnic și reparații pentru partenerii Baterino',
  emptyTitle: 'Service și mentenanță',
  emptyBody: 'Aici vei gestiona cererile de service pentru produsele vândute. Funcționalitate în curând.',
  loadingAria: 'Se încarcă secțiunea Reparații',
  formTitle: 'Raportează un produs pentru service',
  formIntro:
    'Introdu numărul de serie al produsului, apoi completează detaliile sesizării. Identificăm automat modelul și garanția.',
  stepSnTitle: 'Pasul 1 — Număr de serie',
  stepSnHint: 'Format: LJC + 16 cifre (de pe eticheta produsului sau certificatul de garanție).',
  stepSnLabel: 'Număr de serie',
  stepSnSearch: 'Caută produsul',
  stepSnSearching: 'Se caută…',
  stepSnNotFound: 'Numărul de serie nu a fost găsit în sistem.',
  stepSnInvalid: 'Introdu un număr de serie valid (LJC + 16 cifre).',
  stepDetailsTitle: 'Pasul 2 — Detalii sesizare',
  stepDetailsChangeSn: 'Schimbă SN',
  fieldProblemLabel: 'Problema / defect raportat',
  fieldProblemPlaceholder: 'Descrie simptomele, codurile de eroare sau alte detalii relevante…',
  fieldClientNameLabel: 'Nume client final',
  fieldClientNamePlaceholder: 'ex. Ion Popescu',
  fieldClientNameOptional: 'opțional',
  fieldLocationLabel: 'Locația produsului',
  fieldLocationPlaceholder: 'ex. Otopeni, Ilfov — str. Exemplu nr. 10',
  submitRequest: 'Trimite cererea',
  submittingRequest: 'Se trimite…',
  successTitle: 'Cerere trimisă',
  successBody: 'Am înregistrat sesizarea. Vei primi confirmarea pe email de la service@baterino.ro.',
  successNewRequest: 'Raportează alt produs',
  recentRequestsTitle: 'Cererile tale recente',
  recentRequestsEmpty: 'Nu ai trimis încă cereri de service.',
  requestStatusOpen: 'Nouă',
  requestStatusInProgress: 'În desfășurare',
  requestStatusResolved: 'Rezolvată',
  requestStatusClosed: 'Închisă',
  activeRequestWarning: 'Există deja o cerere activă pentru acest SN:',
  step1Small: 'Pasul 1',
  step1Label: 'Număr de serie',
  step2Small: 'Pasul 2',
  step2Label: 'Detaliile sesizării',
  step3Small: 'Pasul 3',
  step3Label: 'Trimitere',
  snFormatPin: 'Format LJC + 16 cifre',
  whereFindSn: 'Unde găsesc seria?',
  snCounter: '{n} / 16 cifre',
  snCounterComplete: '16 / 16 cifre ✓',
  snHintInline: 'Seria este pe eticheta produsului sau în certificatul de garanție.',
  snIncompleteHint: 'Introdu toate cele 16 cifre pentru a căuta produsul.',
  productFoundTitle: 'Produs identificat — continuă la Pasul 2',
  productFoundSubtitle: 'Model recunoscut și asociat contului tău de partener.',
  recentEmptyTitle: 'Nicio cerere trimisă încă',
  recentEmptyBody: 'Cererile pe care le trimiți apar aici, cu status în timp real și istoricul reparației.',
  activeRequestsBadge: '{n} active',
  preDiscountSectionTitle: 'Suport tehnic direct, fără intermediari',
  preDiscountSectionIntro:
    'Ca partener Baterino, ai linie directă către echipa noastră tehnică. Raportezi produsele defecte sau care necesită reparații și urmărești rezolvarea, totul dintr-un singur loc.',
  preDiscountHeroTitle: 'Raportează un produs',
  preDiscountHeroBodyPrefix: 'Deschizi o sesizare pentru orice produs defect sau care necesită reparații. Echipa tehnică o preia rapid și ',
  preDiscountHeroBodyHighlight: 'gestionează garanția și RMA-ul în locul tău',
  preDiscountHeroBodySuffix: '.',
  preDiscountTicketChipId: 'REP-2026-0042',
  preDiscountTicketChipProduct: 'EcoHome16 16kWh',
  preDiscountTicketChipStatus: 'În reparație',
  preDiscountHeroCta: 'Raportează un produs defect',
  preDiscountAdvantages: [
    {
      title: 'Acces direct la suport tehnic',
      subtitle: 'Vorbești direct cu specialiștii Baterino, fără call-center sau intermediari.',
    },
    {
      title: 'Raportezi produse defecte',
      subtitle: 'Deschizi o sesizare cu descriere și poze, în câteva minute.',
    },
    {
      title: 'Produse pentru reparație',
      subtitle: 'Trimiți spre reparație unitățile care nu mai funcționează corect și primești o soluție.',
    },
    {
      title: 'Urmărești statusul în timp real',
      subtitle: 'Vezi fiecare etapă: primită, în analiză, în reparație, rezolvată.',
    },
    {
      title: 'Garanție gestionată de noi',
      subtitle: 'Verificăm garanția și ne ocupăm de procesul RMA în locul tău.',
    },
    {
      title: 'Piese și înlocuiri prioritare',
      subtitle: 'Acces prioritar la piese de schimb și unități de înlocuire, pentru downtime minim.',
    },
  ],
  preDiscountPreviewHeading: 'Previzualizare — o sesizare de reparație',
  preDiscountPreviewFoot: 'Așa urmărești fiecare reparație, pas cu pas — din portal.',
  preDiscountPreviewTicketId: '#REP-2026-0042',
  preDiscountPreviewStatus: 'În reparație',
  preDiscountPreviewProductName: 'EcoHome16 — Baterie Solară LiFePO₄ 16kWh',
  preDiscountPreviewProductSn: 'SN: BAT-EH16-2025-0317',
  preDiscountPreviewIssueLabel: 'Defect raportat:',
  preDiscountPreviewIssueText: 'Nu mai încarcă peste 80% și afișează cod eroare E-04.',
  preDiscountTimelineSteps: roTimeline,
  contractGateSubtitle:
    'Semnează contractul de parteneriat pentru a deschide sesizări de reparație, garanție și urmărirea statusului în portal.',
}

const en: PartnerServiceTranslations = {
  title: 'Repairs',
  pageSubtitle: 'Technical support and repairs for Baterino partners',
  emptyTitle: 'Service & maintenance',
  emptyBody: 'You will manage service requests for sold products here. Coming soon.',
  loadingAria: 'Loading repairs section',
  formTitle: 'Report a product for service',
  formIntro:
    'Enter the product serial number, then fill in the request details. We automatically identify the model and warranty.',
  stepSnTitle: 'Step 1 — Serial number',
  stepSnHint: 'Format: LJC + 16 digits (from the product label or warranty certificate).',
  stepSnLabel: 'Serial number',
  stepSnSearch: 'Find product',
  stepSnSearching: 'Searching…',
  stepSnNotFound: 'Serial number was not found in the system.',
  stepSnInvalid: 'Enter a valid serial number (LJC + 16 digits).',
  stepDetailsTitle: 'Step 2 — Request details',
  stepDetailsChangeSn: 'Change SN',
  fieldProblemLabel: 'Problem / reported defect',
  fieldProblemPlaceholder: 'Describe symptoms, error codes or other relevant details…',
  fieldClientNameLabel: 'End customer name',
  fieldClientNamePlaceholder: 'e.g. John Smith',
  fieldClientNameOptional: 'optional',
  fieldLocationLabel: 'Product location',
  fieldLocationPlaceholder: 'e.g. Otopeni, Ilfov — 10 Example Street',
  submitRequest: 'Submit request',
  submittingRequest: 'Submitting…',
  successTitle: 'Request sent',
  successBody: 'We registered your ticket. You will receive confirmation by email from service@baterino.ro.',
  successNewRequest: 'Report another product',
  recentRequestsTitle: 'Your recent requests',
  recentRequestsEmpty: 'You have not submitted any service requests yet.',
  requestStatusOpen: 'New',
  requestStatusInProgress: 'In progress',
  requestStatusResolved: 'Resolved',
  requestStatusClosed: 'Closed',
  activeRequestWarning: 'There is already an active request for this SN:',
  step1Small: 'Step 1',
  step1Label: 'Serial number',
  step2Small: 'Step 2',
  step2Label: 'Request details',
  step3Small: 'Step 3',
  step3Label: 'Submit',
  snFormatPin: 'Format LJC + 16 digits',
  whereFindSn: 'Where do I find the serial?',
  snCounter: '{n} / 16 digits',
  snCounterComplete: '16 / 16 digits ✓',
  snHintInline: 'The serial is on the product label or warranty certificate.',
  snIncompleteHint: 'Enter all 16 digits to search for the product.',
  productFoundTitle: 'Product identified — continue to Step 2',
  productFoundSubtitle: 'Model recognised and linked to your partner account.',
  recentEmptyTitle: 'No requests submitted yet',
  recentEmptyBody: 'Requests you submit appear here with real-time status and repair history.',
  activeRequestsBadge: '{n} active',
  preDiscountSectionTitle: 'Direct technical support, no middlemen',
  preDiscountSectionIntro:
    'As a Baterino partner, you have a direct line to our technical team. Report defective products or units needing repair and track resolution — all in one place.',
  preDiscountHeroTitle: 'Report a product',
  preDiscountHeroBodyPrefix:
    'Open a ticket for any defective product or unit needing repair. Our technical team picks it up quickly and ',
  preDiscountHeroBodyHighlight: 'handles warranty and RMA on your behalf',
  preDiscountHeroBodySuffix: '.',
  preDiscountTicketChipId: 'REP-2026-0042',
  preDiscountTicketChipProduct: 'EcoHome16 16kWh',
  preDiscountTicketChipStatus: 'In repair',
  preDiscountHeroCta: 'Report a defective product',
  preDiscountAdvantages: [
    {
      title: 'Direct access to technical support',
      subtitle: 'Speak directly with Baterino specialists — no call centre or middlemen.',
    },
    {
      title: 'Report defective products',
      subtitle: 'Open a ticket with description and photos in minutes.',
    },
    {
      title: 'Products sent for repair',
      subtitle: 'Send units that no longer work correctly and get a solution.',
    },
    {
      title: 'Track status in real time',
      subtitle: 'See every stage: received, under review, in repair, resolved.',
    },
    {
      title: 'Warranty handled by us',
      subtitle: 'We verify warranty coverage and manage the RMA process for you.',
    },
    {
      title: 'Priority parts and replacements',
      subtitle: 'Priority access to spare parts and replacement units for minimal downtime.',
    },
  ],
  preDiscountPreviewHeading: 'Preview — a repair ticket',
  preDiscountPreviewFoot: 'This is how you track each repair, step by step — from the portal.',
  preDiscountPreviewTicketId: '#REP-2026-0042',
  preDiscountPreviewStatus: 'In repair',
  preDiscountPreviewProductName: 'EcoHome16 — LiFePO₄ Solar Battery 16kWh',
  preDiscountPreviewProductSn: 'SN: BAT-EH16-2025-0317',
  preDiscountPreviewIssueLabel: 'Reported defect:',
  preDiscountPreviewIssueText: 'No longer charges above 80% and displays error code E-04.',
  preDiscountTimelineSteps: enTimeline,
  contractGateSubtitle:
    'Sign the partnership contract to open repair requests, warranty claims and status tracking in the portal.',
}

const translations: Record<LangCode, PartnerServiceTranslations> = { ro, en }

export function getPartnerServiceTranslations(lang: LangCode): PartnerServiceTranslations {
  return translations[lang] ?? translations.ro
}
