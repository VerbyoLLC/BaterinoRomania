import type { LangCode } from './menu'

export type ClientOrdersTranslations = {
  loading: string
  errorGeneric: string
  title: string
  /** Subtitlu sub titlu (empty state), ca pagina Partener „Servicii”. */
  pageSubtitle: string
  orderCount: string
  /** Mesaj scurt legacy / accesibilitate; cardul gol folosește titlul + descrierea detaliată. */
  empty: string
  emptyStateCardTitle: string
  emptyStateLine1: string
  emptyStateLine2: string
  /** CTA din empty state → catalog produse. */
  seeProducts: string
  /** Table column headers (desktop row layout). */
  colDate: string
  colProduct: string
  colQuantity: string
  colPrice: string
  colStatus: string
  colDownload: string
  colCancel: string
  orderRefShort: string
  /** Second row: order reference + copy. */
  colOrderNumber: string
  copyOrderNumber: string
  copied: string
  downloadProforma: string
  /** CTA prezent înainte de „Descarcă proforma” pentru comenzile cu plata în așteptare. */
  payOnline: string
  /** Mesaj afișat când plata online încă nu este integrată. */
  payOnlineComingSoon: string
  /** Modal "Plătește prin Transfer bancar". */
  payModalAboveTitle: string
  payModalTitle: string
  payModalSubtitle: string
  payModalCompanyLabel: string
  payModalBankAccountLabel: string
  payModalBankNameLabel: string
  payModalAmountLabel: string
  payModalDescriptionLabel: string
  payModalClose: string
  payModalLoading: string
  payModalErrorGeneric: string
  payModalCopy: string
  payModalCopied: string
  cancelOrder: string
  cancelConfirm: string
  cancelling: string
  /** În timpul `fetch`-ului către API înainte de salvarea blobului (proforma). */
  downloading: string
  downloadInvoice: string
  downloadingInvoice: string
  invoicePending: string
  /** WhatsApp CTA next to cancel; prefill uses {orderNumber}, {orderDate}, {clientEmail}. */
  orderHelpWhatsapp: string
  whatsappHelpPrefill: string
  /** Status: de_platit (încă nu s-a emis proforma). */
  stDePlatit: string
  /** Status: tot `de_platit` în DB, dar proforma emisă — afișare fixă, nu se poate schimba din UI. */
  stAsteptarePlata: string
  stPreluata: string
  stInPregatire: string
  stInCursLivrare: string
  stLivrata: string
  stAnulata: string
  totalWithVat: string
  /** Total linie cu TVA inclus — afișat ca o singură sumă, fără sub-etichete. */
  priceItemInclVat: string
  orderTotalsHeading: string
  /** Rânduri rezumat comandă (sumă linii). */
  priceOrderExclVat: string
  priceOrderVat: string
  /** Linie comandă: etichetă scurtă lângă suma reducerii (cu TVA). */
  orderLineDiscount: string
}

const ro: ClientOrdersTranslations = {
  loading: 'Se încarcă comenzile…',
  errorGeneric: 'Eroare la încărcarea comenzilor.',
  title: 'Comenzile mele',
  pageSubtitle: 'Gestionează și urmărește comenzile tale.',
  orderCount: '{n} comenzi',
  empty: 'Încă nu ai plasat comenzi.',
  emptyStateCardTitle: 'Nicio comandă încă',
  emptyStateLine1: 'Nu ai plasat nicio comandă până acum.',
  emptyStateLine2:
    'După ce finalizezi o comandă din catalogul rezidențial, o vei vedea aici, cu status și documente.',
  seeProducts: 'Vezi produse',
  colDate: 'Data',
  colProduct: 'Produs',
  colQuantity: 'Cantitate',
  colPrice: 'Preț',
  colStatus: 'Status comandă',
  colDownload: 'Document',
  colCancel: 'Anulare',
  orderRefShort: 'Nr.',
  colOrderNumber: 'Nr. comandă',
  copyOrderNumber: 'Copiază numărul comenzii',
  copied: 'Copiat',
  downloadProforma: 'Descarcă proforma',
  payOnline: 'Plătește Online',
  payOnlineComingSoon:
    'Plata online va fi disponibilă în curând. Între timp poți achita prin transfer bancar (detaliile sunt în proformă).',
  payModalAboveTitle: 'Plătește prin',
  payModalTitle: 'Transfer bancar',
  payModalSubtitle:
    'Din aplicația ta bancară execută un transfer folosind datele de mai jos:',
  payModalCompanyLabel: 'Nume companie',
  payModalBankAccountLabel: 'Cont bancar',
  payModalBankNameLabel: 'Bancă',
  payModalAmountLabel: 'Suma de plată',
  payModalDescriptionLabel: 'Descriere plată',
  payModalClose: 'Închide',
  payModalLoading: 'Se încarcă datele bancare…',
  payModalErrorGeneric: 'Nu am putut încărca datele bancare.',
  payModalCopy: 'Copiază',
  payModalCopied: 'Copiat',
  cancelOrder: 'Anulează comanda',
  cancelConfirm: 'Sigur vrei să anulezi comanda? Poți face asta doar înainte de plată.',
  cancelling: 'Se anulează…',
  downloading: 'Descărcare…',
  downloadInvoice: 'Descarcă factura',
  downloadingInvoice: 'Se descarcă…',
  invoicePending: 'Factura în curs',
  orderHelpWhatsapp: 'Ajutor comandă',
  whatsappHelpPrefill:
    'Salut. Aș dori ajutor pentru comanda cu numărul {orderNumber} din data de {orderDate}. Contul meu de client este {clientEmail}.',
  stDePlatit: 'De plătit',
  stAsteptarePlata: 'Așteptare plată',
  stPreluata: 'Preluată',
  stInPregatire: 'În pregătire',
  stInCursLivrare: 'În curs de livrare',
  stLivrata: 'Livrată',
  stAnulata: 'Anulată',
  totalWithVat: 'Total cu TVA',
  priceItemInclVat: 'Total cu TVA',
  orderTotalsHeading: 'Total comandă',
  priceOrderExclVat: 'Preț produse (fără TVA)',
  priceOrderVat: 'TVA produse',
  orderLineDiscount: 'Reducere',
}

const en: ClientOrdersTranslations = {
  loading: 'Loading your orders…',
  errorGeneric: 'Could not load orders.',
  title: 'My orders',
  pageSubtitle: 'Manage and track your orders.',
  orderCount: '{n} orders',
  empty: 'You have not placed any orders yet.',
  emptyStateCardTitle: 'No orders yet',
  emptyStateLine1: 'You have not placed any orders yet.',
  emptyStateLine2:
    'After you complete an order from the residential catalogue, it will appear here with status and documents.',
  seeProducts: 'View products',
  colDate: 'Date',
  colProduct: 'Product',
  colQuantity: 'Qty',
  colPrice: 'Price',
  colStatus: 'Order status',
  colDownload: 'Document',
  colCancel: 'Cancel',
  orderRefShort: 'No.',
  colOrderNumber: 'Order no.',
  copyOrderNumber: 'Copy order number',
  copied: 'Copied',
  downloadProforma: 'Download proforma',
  payOnline: 'Pay Online',
  payOnlineComingSoon:
    'Online payment will be available soon. In the meantime you can pay by bank transfer (details are in the proforma).',
  payModalAboveTitle: 'Pay via',
  payModalTitle: 'Bank transfer',
  payModalSubtitle:
    'Open your banking app and start a transfer using the details below:',
  payModalCompanyLabel: 'Company name',
  payModalBankAccountLabel: 'Bank account',
  payModalBankNameLabel: 'Bank',
  payModalAmountLabel: 'Amount to pay',
  payModalDescriptionLabel: 'Payment description',
  payModalClose: 'Close',
  payModalLoading: 'Loading bank details…',
  payModalErrorGeneric: 'Could not load bank details.',
  payModalCopy: 'Copy',
  payModalCopied: 'Copied',
  cancelOrder: 'Cancel order',
  cancelConfirm: 'Cancel this order? You can only cancel before payment.',
  cancelling: 'Cancelling…',
  downloading: 'Downloading…',
  downloadInvoice: 'Download invoice',
  downloadingInvoice: 'Downloading…',
  invoicePending: 'Invoice pending',
  orderHelpWhatsapp: 'Order help',
  whatsappHelpPrefill:
    'Hi. I would like help with order number {orderNumber} from {orderDate}. My client account email is {clientEmail}.',
  stDePlatit: 'Payment due',
  stAsteptarePlata: 'Awaiting payment',
  stPreluata: 'Received',
  stInPregatire: 'Being prepared',
  stInCursLivrare: 'Out for delivery',
  stLivrata: 'Delivered',
  stAnulata: 'Cancelled',
  totalWithVat: 'Total incl. VAT',
  priceItemInclVat: 'Total price (incl. VAT)',
  orderTotalsHeading: 'Order total',
  priceOrderExclVat: 'Product price (excl. VAT)',
  priceOrderVat: 'Product VAT',
  orderLineDiscount: 'Discount',
}


export function getClientOrdersTranslations(lang: LangCode): ClientOrdersTranslations {
  if (lang === 'en') return en
  return ro
}

export type FulfillmentStatusLabelOptions = {
  /** Dacă există proforma emisă (`proformaUrl`), statusul `de_platit` se afișează ca „Așteptare plată”. */
  hasProforma?: boolean
}

export function fulfillmentStatusLabel(
  tr: ClientOrdersTranslations,
  status: string,
  options?: FulfillmentStatusLabelOptions,
): string {
  const s = String(status || 'de_platit').trim()
  if (s === 'de_platit' && options?.hasProforma) {
    return tr.stAsteptarePlata
  }
  switch (s) {
    case 'preluata':
      return tr.stPreluata
    case 'in_pregatire':
      return tr.stInPregatire
    case 'in_curs_livrare':
      return tr.stInCursLivrare
    case 'livrata':
      return tr.stLivrata
    case 'anulata':
      return tr.stAnulata
    case 'de_platit':
    default:
      return tr.stDePlatit
  }
}

export function fulfillmentStatusBadgeClass(status: string): string {
  switch (status) {
    case 'livrata':
      return 'bg-emerald-100 text-emerald-900 border-emerald-200/80'
    case 'anulata':
      return 'bg-slate-200 text-slate-700 border-slate-300/80'
    case 'in_curs_livrare':
      return 'bg-sky-100 text-sky-900 border-sky-200/80'
    case 'in_pregatire':
      return 'bg-amber-100 text-amber-950 border-amber-200/80'
    case 'preluata':
      return 'bg-violet-100 text-violet-900 border-violet-200/80'
    case 'de_platit':
    default:
      return 'bg-orange-50 text-orange-900 border-orange-200/80'
  }
}

/** Left stripe / dot accent (card-row layout). */
export function fulfillmentStatusAccentClass(status: string): string {
  switch (status) {
    case 'livrata':
      return 'bg-emerald-500'
    case 'anulata':
      return 'bg-slate-400'
    case 'in_curs_livrare':
      return 'bg-sky-500'
    case 'in_pregatire':
      return 'bg-amber-500'
    case 'preluata':
      return 'bg-violet-500'
    case 'de_platit':
    default:
      return 'bg-amber-400'
  }
}

/** Coloured left border for status on dark backgrounds. */
export function fulfillmentStatusBorderLeftClass(status: string): string {
  switch (status) {
    case 'livrata':
      return 'border-l-emerald-400'
    case 'anulata':
      return 'border-l-slate-500'
    case 'in_curs_livrare':
      return 'border-l-sky-400'
    case 'in_pregatire':
      return 'border-l-amber-500'
    case 'preluata':
      return 'border-l-violet-400'
    case 'de_platit':
    default:
      return 'border-l-amber-300'
  }
}
