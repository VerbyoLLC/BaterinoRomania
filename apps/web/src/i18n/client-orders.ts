import type { LangCode } from './menu'

export type ClientOrdersTranslations = {
  loading: string
  errorGeneric: string
  title: string
  orderCount: string
  empty: string
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
  cancelOrder: string
  cancelConfirm: string
  cancelling: string
  downloading: string
  downloadInvoice: string
  downloadingInvoice: string
  invoicePending: string
  /** WhatsApp CTA next to cancel; prefill uses {orderNumber} and {orderDate}. */
  orderHelpWhatsapp: string
  whatsappHelpPrefill: string
  /** Status: de_platit */
  stDePlatit: string
  stPreluata: string
  stInPregatire: string
  stInCursLivrare: string
  stLivrata: string
  stAnulata: string
  totalWithVat: string
}

const ro: ClientOrdersTranslations = {
  loading: 'Se încarcă comenzile…',
  errorGeneric: 'Eroare la încărcarea comenzilor.',
  title: 'Comenzile mele',
  orderCount: '{n} comenzi',
  empty: 'Încă nu ai plasat comenzi.',
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
  cancelOrder: 'Anulează comanda',
  cancelConfirm: 'Sigur vrei să anulezi comanda? Poți face asta doar înainte de plată.',
  cancelling: 'Se anulează…',
  downloading: 'Se pregătește…',
  downloadInvoice: 'Descarcă factura',
  downloadingInvoice: 'Se descarcă…',
  invoicePending: 'Factura în curs',
  orderHelpWhatsapp: 'Ajutor comandă',
  whatsappHelpPrefill:
    'Aș dori ajutor pentru comanda cu numărul {orderNumber} din data de {orderDate}.',
  stDePlatit: 'De plătit',
  stPreluata: 'Preluată',
  stInPregatire: 'În pregătire',
  stInCursLivrare: 'În curs de livrare',
  stLivrata: 'Livrată',
  stAnulata: 'Anulată',
  totalWithVat: 'Total cu TVA',
}

const en: ClientOrdersTranslations = {
  loading: 'Loading your orders…',
  errorGeneric: 'Could not load orders.',
  title: 'My orders',
  orderCount: '{n} orders',
  empty: 'You have not placed any orders yet.',
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
  cancelOrder: 'Cancel order',
  cancelConfirm: 'Cancel this order? You can only cancel before payment.',
  cancelling: 'Cancelling…',
  downloading: 'Preparing…',
  downloadInvoice: 'Download invoice',
  downloadingInvoice: 'Downloading…',
  invoicePending: 'Invoice pending',
  orderHelpWhatsapp: 'Order help',
  whatsappHelpPrefill:
    'I would like help with order number {orderNumber} from {orderDate}.',
  stDePlatit: 'Awaiting payment',
  stPreluata: 'Received',
  stInPregatire: 'Being prepared',
  stInCursLivrare: 'Out for delivery',
  stLivrata: 'Delivered',
  stAnulata: 'Cancelled',
  totalWithVat: 'Total incl. VAT',
}

const zh: ClientOrdersTranslations = {
  loading: '正在加载订单…',
  errorGeneric: '订单加载失败。',
  title: '我的订单',
  orderCount: '{n} 笔订单',
  empty: '您还没有下单。',
  colDate: '日期',
  colProduct: '产品',
  colQuantity: '数量',
  colPrice: '价格',
  colStatus: '订单状态',
  colDownload: '单据',
  colCancel: '取消',
  orderRefShort: '单号',
  colOrderNumber: '订单编号',
  copyOrderNumber: '复制订单号',
  copied: '已复制',
  downloadProforma: '下载形式发票',
  cancelOrder: '取消订单',
  cancelConfirm: '确定取消该订单？仅在付款前可取消。',
  cancelling: '正在取消…',
  downloading: '正在准备…',
  downloadInvoice: '下载发票',
  downloadingInvoice: '正在下载…',
  invoicePending: '发票处理中',
  orderHelpWhatsapp: '订单协助',
  whatsappHelpPrefill: '我需要协助，订单编号为 {orderNumber}，下单日期为 {orderDate}。',
  stDePlatit: '待付款',
  stPreluata: '已接单',
  stInPregatire: '备货中',
  stInCursLivrare: '配送中',
  stLivrata: '已送达',
  stAnulata: '已取消',
  totalWithVat: '含税合计',
}

export function getClientOrdersTranslations(lang: LangCode): ClientOrdersTranslations {
  if (lang === 'en') return en
  if (lang === 'zh') return zh
  return ro
}

export function fulfillmentStatusLabel(
  tr: ClientOrdersTranslations,
  status: string,
): string {
  switch (status) {
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
