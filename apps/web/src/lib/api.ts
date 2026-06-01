import type { ReducereProgram } from '../i18n/reduceri'
import type { LangCode } from '../i18n/menu'
import { isPartnerPublicProfileFullyComplete } from './partner-public-profile-complete'

/**
 * Origine pentru `${API_BASE}/admin/...` → server Express `/api/admin/...`.
 * - Fără env: dev → localhost:3001/api; prod (Vercel) → `/api` (rewrite către Railway).
 * - VITE_API_URL: trebuie să fie rădăcina cu `/api`, ex. `https://xxx.up.railway.app/api`.
 *   Dacă lipsește `/api` pe un URL absolut, îl adăugăm automat. Dacă env se termină în `/admin`, îl tăiem (altfel URL-urile devin `/api/admin/admin/...`).
 */
function resolveApiBase(): string {
  const envRaw = import.meta.env.VITE_API_URL as string | undefined
  if (envRaw != null && String(envRaw).trim() !== '') {
    let base = String(envRaw).trim().replace(/\/+$/, '')
    if (base.endsWith('/admin')) {
      base = base.slice(0, -6)
    }
    if (/^https?:\/\//i.test(base) && !/\/api$/i.test(base)) {
      base = `${base}/api`
    }
    return base
  }
  if (
    import.meta.env.DEV &&
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:3001/api'
  }
  return '/api'
}

export const API_BASE = resolveApiBase()

/** Payload pentru trimiterea formularului de contact */
export type InquiryPayload = {
  name: string
  company: string
  email: string
  domain: 'rezidential' | 'industrial' | 'medical' | 'maritim'
  requestType: 'sales' | 'technical' | 'service' | 'partnership'
  message: string
}

/** Trimite solicitarea de contact și returnează nr. înregistrare */
export async function submitInquiry(payload: InquiryPayload): Promise<{ message: string; registrationNumber: string }> {
  const res = await fetch(`${API_BASE}/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la trimiterea solicitării.')
  return json
}

/** Eroare la POST /api/retur; `code` vine din JSON când există (ex. retur_photos_count). */
export class ReturSubmitError extends Error {
  readonly code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'ReturSubmitError'
    this.code = code
  }
}

/** Payload multipart POST /api/retur (câmpuri text + 2–6 fișiere `photos`). */
export type SubmitReturPayload = {
  lastName: string
  firstName: string
  street: string
  county: string
  city: string
  postal: string
  phone: string
  email: string
  orderNumber: string
  receiptDate: string
  serialNumber: string
  productBrand: string
  productModel: string
  returnReason: string
  returnReasonOther: string
  condUninstalled: boolean
  condSeals: boolean
  condPackaging: boolean
  pickupStreet: string
  pickupCounty: string
  pickupCity: string
  pickupPostal: string
  refundTitular: string
  refundIban: string
  policyAccepted: boolean
  declarationAccepted: boolean
  locale: string
}

/** Trimite cererea de retur; opțional Bearer din `getAuthToken()` pentru client autentificat. */
export async function submitProductRetur(
  payload: SubmitReturPayload,
  photos: File[],
): Promise<{ id: number; registrationNumber: string }> {
  const fd = new FormData()
  const entries: [keyof SubmitReturPayload, string][] = [
    ['lastName', payload.lastName],
    ['firstName', payload.firstName],
    ['street', payload.street],
    ['county', payload.county],
    ['city', payload.city],
    ['postal', payload.postal],
    ['phone', payload.phone],
    ['email', payload.email],
    ['orderNumber', payload.orderNumber],
    ['receiptDate', payload.receiptDate],
    ['serialNumber', payload.serialNumber],
    ['productBrand', payload.productBrand],
    ['productModel', payload.productModel],
    ['returnReason', payload.returnReason],
    ['returnReasonOther', payload.returnReasonOther],
    ['condUninstalled', payload.condUninstalled ? 'true' : 'false'],
    ['condSeals', payload.condSeals ? 'true' : 'false'],
    ['condPackaging', payload.condPackaging ? 'true' : 'false'],
    ['pickupStreet', payload.pickupStreet],
    ['pickupCounty', payload.pickupCounty],
    ['pickupCity', payload.pickupCity],
    ['pickupPostal', payload.pickupPostal],
    ['refundTitular', payload.refundTitular],
    ['refundIban', payload.refundIban],
    ['policyAccepted', payload.policyAccepted ? 'true' : 'false'],
    ['declarationAccepted', payload.declarationAccepted ? 'true' : 'false'],
    ['locale', payload.locale],
  ]
  for (const [k, v] of entries) {
    fd.append(k, v)
  }
  for (const file of photos) {
    fd.append('photos', file)
  }
  const headers: HeadersInit = {}
  const token = getAuthToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${API_BASE}/retur`, { method: 'POST', headers, body: fd })
  const json = (await res.json().catch(() => ({}))) as {
    id?: number
    registrationNumber?: string
    error?: string
    code?: string
  }
  if (!res.ok) {
    const msg =
      typeof json.error === 'string' && json.error.trim() ? json.error.trim() : 'Eroare la trimiterea cererii.'
    const code = typeof json.code === 'string' && json.code.trim() ? json.code.trim() : undefined
    throw new ReturSubmitError(msg, code)
  }
  if (typeof json.id !== 'number' || !Number.isFinite(json.id)) {
    throw new Error('Răspuns invalid de la server.')
  }
  const registrationNumber =
    typeof json.registrationNumber === 'string' && json.registrationNumber.trim()
      ? json.registrationNumber.trim()
      : `BTRT-${String(json.id).padStart(6, '0')}`
  return { id: json.id, registrationNumber }
}

/** Public: eligibilitate retur după SN în stocuri + data recepție (≤15 zile). */
export type ReturSerialEligibilityResponse = {
  eligible: boolean
  /** Prezent doar când `eligible === true`: zz-ll-aaaa din stocuri. */
  clientReceiptDate?: string | null
  productModelId?: string | null
  brand?: string | null
  modelName?: string | null
  modelNumber?: string | null
}

export async function getPublicReturSerialEligibility(serialNumber: string): Promise<ReturSerialEligibilityResponse> {
  const sn = encodeURIComponent(String(serialNumber ?? '').trim())
  const res = await fetch(`${API_BASE}/public/retur-serial-eligibility?sn=${sn}`, { cache: 'no-store' })
  const json = (await res.json().catch(() => ({}))) as {
    eligible?: boolean
    clientReceiptDate?: string | null
    productModelId?: string | null
    brand?: string | null
    modelName?: string | null
    modelNumber?: string | null
    error?: string
    code?: string
  }
  if (res.status === 429) {
    throw new Error(
      typeof json.error === 'string' && json.error.trim()
        ? json.error.trim()
        : 'Prea multe verificări într-un interval scurt. Încearcă din nou peste un minut.',
    )
  }
  if (!res.ok) {
    const msg =
      typeof json.error === 'string' && json.error.trim() ? json.error.trim() : 'Nu am putut verifica numărul de serie.'
    throw new Error(msg)
  }
  const eligible = Boolean(json.eligible)
  const out: ReturSerialEligibilityResponse = { eligible }
  if (eligible) {
    if (typeof json.clientReceiptDate === 'string' && json.clientReceiptDate.trim()) {
      out.clientReceiptDate = json.clientReceiptDate.trim()
    }
    if (typeof json.productModelId === 'string' && json.productModelId.trim()) {
      out.productModelId = json.productModelId.trim()
    } else {
      out.productModelId = null
    }
    if (typeof json.brand === 'string' && json.brand.trim()) {
      out.brand = json.brand.trim()
    } else {
      out.brand = null
    }
    if (typeof json.modelName === 'string' && json.modelName.trim()) {
      out.modelName = json.modelName.trim()
    } else {
      out.modelName = null
    }
    if (typeof json.modelNumber === 'string' && json.modelNumber.trim()) {
      out.modelNumber = json.modelNumber.trim()
    } else {
      out.modelNumber = null
    }
  }
  return out
}

/** Linie coș → același POST ca produs unic. */
export type GuestResidentialOrderLineInput = {
  productIdOrSlug: string
  quantity: number
  /** ID program din CMS; aplicat la total dacă e permis pentru produs. */
  reducereProgramId?: string | null
}

/** Payload POST /api/guest-residential-orders (comandă invitat, flux /comanda). */
export type GuestResidentialOrderPayload = {
  /** Dacă e setat și nevid, înlocuiește perechea productIdOrSlug + quantity. */
  items?: GuestResidentialOrderLineInput[]
  productIdOrSlug?: string
  quantity?: number
  email: string
  /** Ultimele 9 cifre naționale (fără +40). */
  phone: string
  nume: string
  prenume: string
  /**
   * 'person' (Persoană fizică) → billAddress = adresa Pas 3 (livrare = facturare).
   * 'company' (Persoană juridică) → company* = facturare, delAddress = adresa de livrare din Pas 3.
   */
  buyerType?: 'person' | 'company'
  /** PF / fallback: adresa din Pasul 3 (folosită și ca livrare când differentDeliveryAddress=false). */
  billAddress: string
  billCounty: string
  billCity: string
  billPostal: string
  differentDeliveryAddress: boolean
  delAddress?: string
  delCounty?: string
  delCity?: string
  delPostal?: string
  /** PJ: datele firmei pentru factură (oglindite ca bill* pe rândul de comandă). */
  companyName?: string
  companyCui?: string
  companyAddress?: string
  companyCounty?: string
  companyCity?: string
  companyPostal?: string
}

export type GuestResidentialOrderResponse = {
  orderNumber: string
  /** ID rând Prisma — folosit în R2 la prefixul `orders/{orderId}/`. */
  orderId?: string
  email: string
  /** Aliniat cu DB: guest | client */
  orderSource?: 'guest' | 'client' | 'partner'
  message?: string
}

export async function submitGuestResidentialOrder(
  payload: GuestResidentialOrderPayload,
): Promise<GuestResidentialOrderResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getAuthToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const buyerType: 'person' | 'company' = payload.buyerType === 'company' ? 'company' : 'person'
  const body: Record<string, unknown> = {
    email: payload.email,
    phone: payload.phone,
    nume: payload.nume,
    prenume: payload.prenume,
    buyerType,
    billAddress: payload.billAddress,
    billCounty: payload.billCounty,
    billCity: payload.billCity,
    billPostal: payload.billPostal,
    differentDeliveryAddress: payload.differentDeliveryAddress,
    delAddress: payload.differentDeliveryAddress ? payload.delAddress : undefined,
    delCounty: payload.differentDeliveryAddress ? payload.delCounty : undefined,
    delCity: payload.differentDeliveryAddress ? payload.delCity : undefined,
    delPostal: payload.differentDeliveryAddress ? payload.delPostal : undefined,
  }
  if (buyerType === 'company') {
    body.companyName = payload.companyName
    body.companyCui = payload.companyCui
    body.companyAddress = payload.companyAddress
    body.companyCounty = payload.companyCounty
    body.companyCity = payload.companyCity
    body.companyPostal = payload.companyPostal
  }
  if (payload.items && payload.items.length > 0) {
    body.items = payload.items.map((x) => {
      const row: Record<string, unknown> = {
        productIdOrSlug: x.productIdOrSlug,
        quantity: x.quantity,
      }
      const rid = x.reducereProgramId != null ? String(x.reducereProgramId).trim() : ''
      if (rid && !rid.startsWith('local-')) row.reducereProgramId = rid
      return row
    })
  } else {
    body.productIdOrSlug = payload.productIdOrSlug
    body.quantity = payload.quantity
  }
  const res = await fetch(`${API_BASE}/guest-residential-orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  const json = (await res.json().catch(() => ({}))) as { error?: string } & Partial<GuestResidentialOrderResponse>
  if (!res.ok) throw new Error(json.error || 'Eroare la înregistrarea comenzii.')
  if (!json.orderNumber) throw new Error('Răspuns invalid de la server.')
  const src = json.orderSource
  return {
    orderNumber: json.orderNumber,
    orderId: typeof json.orderId === 'string' ? json.orderId : undefined,
    email: String(json.email || payload.email),
    orderSource: src === 'client' || src === 'guest' || src === 'partner' ? src : undefined,
    message: json.message,
  }
}

/** Imagine afișată pe carduri (listă produse, acasă, panou parteneri) */
export function getProductCardImageUrl(
  product: Pick<PublicProduct, 'images'> & { cardImage?: string | null }
): string {
  const card = String(product.cardImage ?? '').trim()
  if (card) return card
  const imgs = Array.isArray(product.images) ? product.images : []
  return imgs[0] || '/images/shared/HP2000-all-in-one.png'
}

/** Produs public (pagina /produse) */
export type PublicProduct = {
  id: string
  slug?: string | null
  title: string
  tipProdus: 'rezidential' | 'industrial'
  categorie?: string | null
  description?: string | null
  subtitle?: string | null
  overview?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoOgImage?: string | null
  cardImage?: string | null
  keyAdvantages?: { title: string; image: string }[]
  faq?: { q: string; a: string }[]
  caseStudyExamples?: { title: string; subtitle: string; location: string; image: string }[]
  documenteTehnice?: { descriere: string; url: string }[]
  technicalSpecsModels?: CreateProductPayload['technicalSpecsModels']
  images: string[]
  salePrice?: string | number | null
  partnerSalePrice?: string | number | null
  landedPrice?: string | number | null
  vat?: string | number | null
  /** hidden | public | partner_only */
  priceVisibility?: 'hidden' | 'public' | 'partner_only'
  /** simple | detailed (UI only) */
  pricePresentation?: 'simple' | 'detailed'
  /** Rezidențial: etichetă în colțul imaginii pe card catalog */
  catalogStockStatus?: 'in_stock' | 'out_of_stock' | 'coming_soon' | 'on_order' | null
  /** Rezidențial: etichetă livrare pe card catalog */
  catalogDeliveryBadge?: '24h' | '48h' | '7_14d' | '60d' | null
  /** Rezidențial / industrial: etichetă transport pe card catalog */
  catalogTransportBadge?: 'free' | 'paid' | null
  /** Industrial: etichetă instalare pe card catalog */
  catalogInstallBadge?: 'baterino' | 'partner' | null
  /** Rezidențial: id-uri programe reducere (CMS); gol = toate programele în dropdown (comportament vechi) */
  reducereProgramIds?: string[]
  /** Admin: prioritate în catalog partener */
  promovarePeContPartener?: boolean
  tensiuneNominala?: string | null
  capacitate?: string | null
  compozitie?: string | null
  cicluriDescarcare?: string | null
  conectivitateWifi?: boolean
  conectivitateBluetooth?: boolean
  energieNominala?: string | null
  garantie?: string | null
  [key: string]: unknown
}

/** Două linii de specificații pentru cardurile din catalog (Produse / Acasă). */
export function getCatalogProductSpecLines(product: PublicProduct): { specLine1: string; specLine2: string } {
  const conectivitate = [
    product.conectivitateWifi && 'WiFi',
    product.conectivitateBluetooth && 'Bluetooth',
  ]
    .filter(Boolean)
    .join(' • ') || '—'
  const specLine1 =
    [product.tensiuneNominala, product.capacitate, product.compozitie].filter(Boolean).join(' • ') || '—'
  const specLine2 = [product.cicluriDescarcare, conectivitate].filter(Boolean).join(' • ') || '—'
  return { specLine1, specLine2 }
}

function catalogNum(v: string | number | null | undefined): number | null {
  if (v == null || v === '') return null
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/** Monede permise pentru prețuri catalog (admin); afișate ca sufix lângă sumă. */
export const CATALOG_CURRENCY_CODES = ['EUR', 'RON', 'IDR', 'MYR', 'PHP', 'USD'] as const
export type CatalogCurrencyCode = (typeof CATALOG_CURRENCY_CODES)[number]

export function normalizeCatalogCurrencyCode(v: unknown): CatalogCurrencyCode {
  const s = String(v ?? '').trim().toUpperCase()
  return (CATALOG_CURRENCY_CODES as readonly string[]).includes(s) ? (s as CatalogCurrencyCode) : 'RON'
}

/** Public catalog: VAT-inclusive price when `priceVisibility` is public and sale price is set. */
export function formatResidentialCatalogPriceDisplay(
  product: PublicProduct,
  langCode: string,
  /** Cod monedă afișat lângă sumă (din setări admin); implicit RON */
  currencySuffix: string = 'RON',
): string | null {
  const vis = (product.priceVisibility as string) || 'public'
  if (vis !== 'public') return null
  const sale = catalogNum(product.salePrice)
  if (sale == null || sale <= 0) return null
  const vat = catalogNum(product.vat)
  const unit = vat != null && vat > 0 ? sale * (1 + vat / 100) : sale
  const locale = langCode === 'en' ? 'en-GB' : langCode === 'zh' ? 'zh-CN' : 'ro-RO'
  return `${Math.round(unit).toLocaleString(locale, { maximumFractionDigits: 0 })} ${currencySuffix}`
}

/** Partner catalog: validated unit from partnerSalePrice (catalog/net); fallback salePrice; NaN if missing. */
export function getPartnerCatalogSaleUnitNumeric(
  product: Pick<PublicProduct, 'salePrice' | 'partnerSalePrice'>,
): number {
  const partner = catalogNum(product.partnerSalePrice)
  if (partner != null && partner > 0) return partner
  const sale = catalogNum(product.salePrice)
  return sale != null && sale > 0 ? sale : NaN
}

/** Partner UI / cart: unit price including VAT when product VAT % > 0 (same rule as residential catalog). */
export function getPartnerDisplayUnitPriceWithVat(product: PublicProduct): number {
  const sale = getPartnerCatalogSaleUnitNumeric(product)
  if (Number.isNaN(sale)) return NaN
  const vat = catalogNum(product.vat)
  return vat != null && vat > 0 ? sale * (1 + vat / 100) : sale
}

/** VAT % applied on partner-inclusive price display; null if catalog shows net-only for this product. */
export function getPartnerCatalogVatPercentForDisplay(product: PublicProduct): number | null {
  const v = catalogNum(product.vat)
  return v != null && v > 0 ? v : null
}

export type CatalogStockStatus = 'in_stock' | 'out_of_stock' | 'coming_soon' | 'on_order'

/** Rezidențial: stoc epuizat sau în curând — fără preț parteneri, fără chip „disponibil parteneri”. */
export function residentialProductStockUnavailable(
  product: Pick<PublicProduct, 'tipProdus' | 'catalogStockStatus'>,
): boolean {
  if (String(product.tipProdus || '').toLowerCase() !== 'rezidential') return false
  const s = product.catalogStockStatus as CatalogStockStatus | undefined | null
  return s === 'out_of_stock' || s === 'coming_soon'
}

/** Residential listing: show „Disponibil Parteneri”-style CTA instead of price (partner_only / hidden). */
export function residentialCatalogUsesPartnerPriceCta(product: PublicProduct): boolean {
  if (String(product.tipProdus || '').toLowerCase() === 'industrial') return false
  if (residentialProductStockUnavailable(product)) return false
  const vis = (product.priceVisibility as string) || 'public'
  return vis === 'partner_only' || vis === 'hidden'
}

/** Rezidențial: text pentru butonul din locul prețului (fără badge pe imagine). */
export function getResidentialCatalogStockListingCta(
  product: Pick<PublicProduct, 'tipProdus' | 'catalogStockStatus'>,
  labels: { outOfStock: string; comingSoon: string },
): string | null {
  if (!residentialProductStockUnavailable(product)) return null
  const s = product.catalogStockStatus as CatalogStockStatus
  if (s === 'out_of_stock') return labels.outOfStock
  return labels.comingSoon
}

/** Id-uri program reducere salvate pe produs (doar string-uri valide, unice). */
export function normalizeProductReducereProgramIds(product: {
  reducereProgramIds?: unknown
}): string[] {
  const raw = product.reducereProgramIds
  if (raw == null) return []
  if (!Array.isArray(raw)) return []
  return [
    ...new Set(
      raw.filter((x): x is string => typeof x === 'string' && String(x).trim() !== '').map((s) => String(s).trim()),
    ),
  ]
}

/** Produs rezidențial cu cel puțin un program bifat în admin (badge + filtrare dropdown). */
export function productHasEligibleReducerePrograms(product: PublicProduct): boolean {
  if (String(product.tipProdus || '').toLowerCase() !== 'rezidential') return false
  return normalizeProductReducereProgramIds(product).length > 0
}

/** VAT % for catalog caption; falls back to 21 when missing (ROM default). */
export function getResidentialCatalogVatPercentLabel(product: PublicProduct): string {
  const vat = catalogNum(product.vat)
  if (vat == null || vat <= 0) return '21'
  if (Number.isInteger(vat)) return String(vat)
  const rounded = Math.round(vat * 100) / 100
  return String(rounded).replace(/\.?0+$/, '')
}

/** Lista produselor publicate (fără auth) */
export async function getProducts(): Promise<PublicProduct[]> {
  const res = await fetch(`${API_BASE}/products`, { headers: publicFetchHeaders() })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la încărcare.')
  return Array.isArray(json) ? json : []
}

/** Rând minimal din catalogul de modele (GET public, fără specificații tehnice). */
export type PublicProductModelRow = {
  id: string
  name: string
  brand: string
  series: string
  modelNumber: string
  usageType: 'industrial' | 'residential'
  /** Set when a PDF exists in R2 for this model (Product Technical Brochures). */
  technicalBrochureUrl?: string | null
}

export async function getPublicProductModels(): Promise<PublicProductModelRow[]> {
  const res = await fetch(`${API_BASE}/public/product-models`, { headers: publicFetchHeaders() })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((json as { error?: string }).error || 'Eroare la încărcarea modelelor.')
  if (!Array.isArray(json)) return []
  return json as PublicProductModelRow[]
}

/** Un singur produs publicat (fără auth). Acceptă id sau slug pentru SEO. */
export async function getProduct(idOrSlug: string): Promise<PublicProduct> {
  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(idOrSlug)}`, {
    headers: publicFetchHeaders(),
    cache: 'no-store',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Produs negăsit.')
  return json
}

/**
 * Same as getProduct, but never sends Authorization — matches what a logged-out visitor
 * sees on the PDP (applyPublicPricePolicy with no JWT). Use for guest checkout.
 */
export async function getProductAsGuest(idOrSlug: string): Promise<PublicProduct> {
  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(idOrSlug)}`, {
    headers: {},
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Produs negăsit.')
  return json
}

export type WarrantyVerifyResponse =
  | {
      found: true
      serialNumber: string
      brand: string | null
      title: string
      modelNumber: string
      imageUrl: string | null
    }
  | { found: false; serialNumber: string }

export type WarrantyVerifyFetchArg = string | { token: string }

/** Verificare publică SN sau token semnat (?t=). Fără Authorization — același răspuns pentru toți. */
export async function fetchWarrantyVerify(arg: WarrantyVerifyFetchArg): Promise<
  | { ok: true; data: WarrantyVerifyResponse }
  | {
      ok: false
      error: string
      invalidSerial?: boolean
      invalidToken?: boolean
      tokenNotConfigured?: boolean
      rateLimited?: boolean
    }
> {
  const params = new URLSearchParams()
  let fallbackSerial = ''
  if (typeof arg === 'object' && arg && typeof arg.token === 'string') {
    params.set('t', arg.token)
  } else {
    const serialNumber = typeof arg === 'string' ? arg : ''
    fallbackSerial = serialNumber
    params.set('sn', serialNumber)
  }
  const res = await fetch(`${API_BASE}/warranty-verify?${params}`, {
    headers: {},
  })
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (res.status === 400) {
    const err =
      typeof json.error === 'string'
        ? json.error
        : json.code === 'invalid_token'
          ? 'Link invalid.'
          : 'SN invalid.'
    return {
      ok: false,
      error: err,
      invalidSerial: json.code === 'invalid_serial',
      invalidToken: json.code === 'invalid_token',
    }
  }
  if (res.status === 503 && json.code === 'token_not_configured') {
    return {
      ok: false,
      error:
        typeof json.error === 'string'
          ? json.error
          : 'Verificarea cu link semnat nu este disponibilă.',
      tokenNotConfigured: true,
    }
  }
  if (res.status === 429) {
    return {
      ok: false,
      error: typeof json.error === 'string' ? json.error : 'Prea multe cereri. Încearcă din nou peste un minut.',
      rateLimited: true,
    }
  }
  if (!res.ok) {
    return {
      ok: false,
      error: typeof json.error === 'string' ? json.error : 'Eroare la verificare.',
    }
  }
  const serialFromJson = String(json.serialNumber ?? fallbackSerial)
  if (json.found === true) {
    const brandRaw = json.brand != null ? String(json.brand).trim() : ''
    return {
      ok: true,
      data: {
        found: true,
        serialNumber: serialFromJson,
        brand: brandRaw ? brandRaw : null,
        title: String(json.title ?? ''),
        modelNumber: String(json.modelNumber ?? ''),
        imageUrl: json.imageUrl != null && String(json.imageUrl).trim() ? String(json.imageUrl) : null,
      },
    }
  }
  return {
    ok: true,
    data: {
      found: false,
      serialNumber: serialFromJson,
    },
  }
}

/** Verifică dacă API-ul răspunde. Folosește API_BASE (VITE_API_URL în prod). */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const r = await fetch(`${API_BASE}/health`)
    return r.ok
  } catch {
    return false
  }
}

export type AuthUser = { id: string; email: string; role: string }

export type SignupResponse = {
  message?: string
  email?: string
  /** false dacă trimiterea emailului de confirmare a eșuat sau mailul nu e configurat */
  verificationSent?: boolean
}

export async function signup(
  email: string,
  password: string,
  role: 'client' | 'partener',
  nextPath?: string,
  options?: { marketingEmailOptIn?: boolean },
): Promise<SignupResponse> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        role,
        acceptedTerms: true,
        ...(nextPath ? { next: nextPath } : {}),
        ...(options?.marketingEmailOptIn === true ? { marketingEmailOptIn: true } : {}),
      }),
    })
  } catch {
    throw new Error(`Nu s-a putut conecta la API (${API_BASE}). Pornește API-ul: npm run dev:api`)
  }
  const text = await res.text()
  let data: { error?: string; debug?: string; message?: string; email?: string; verificationSent?: boolean } = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    if (!res.ok) throw new Error(`API a returnat eroare ${res.status}. Răspuns: ${text.slice(0, 100)}`)
  }
  if (!res.ok) {
    const msg = data.debug || data.error || `Eroare ${res.status}`
    throw new Error(msg)
  }
  return data
}

export async function resendVerificationCode(email: string, nextPath?: string) {
  const res = await fetch(`${API_BASE}/auth/resend-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, ...(nextPath ? { next: nextPath } : {}) }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Eroare la retrimiterea emailului.')
  return data
}

export async function verifyEmailToken(token: string): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${API_BASE}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Eroare la verificare.')
  return data as { token: string; user: AuthUser }
}

/** Verificare înregistrare cu cod din 6 cifre (client / partener). */
export async function verifySignupCode(
  email: string,
  code: string,
): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${API_BASE}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), code }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Eroare la verificare.')
  return data as { token: string; user: AuthUser }
}

export async function requestPasswordReset(email: string) {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Eroare la trimiterea link-ului de resetare.')
  return data
}

export async function resetPassword(token: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Eroare la resetarea parolei.')
  return data
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Eroare la autentificare.')
  return data as { token: string; user: AuthUser }
}

export type GoogleAuthOptions = {
  /** Obligatoriu la crearea unui cont nou cu Google (semnal explicit din UI). */
  acceptedTerms?: boolean
  /** Consimțământ explicit pentru comunicări comerciale prin email. */
  marketingEmailOptIn?: boolean
  /** `signup`: email deja înregistrat → 409. `login`: fără cont existent → 404 (nicio creare de cont). */
  intent?: 'signup' | 'login'
}

export async function googleAuth(
  idToken: string,
  role: 'client' | 'partener' = 'client',
  options?: GoogleAuthOptions,
): Promise<{
  token: string
  user: AuthUser
  needsPartnerProfile?: boolean
  partnerSignupPath?: string
}> {
  const payload: Record<string, unknown> = { idToken, role }
  if (options?.acceptedTerms === true) {
    payload.acceptedTerms = true
  }
  if (options?.marketingEmailOptIn === true) {
    payload.marketingEmailOptIn = true
  }
  if (options?.intent === 'signup' || options?.intent === 'login') {
    payload.intent = options.intent
  }
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(
      (data as { error?: string }).error || 'Eroare la autentificare cu Google.',
    ) as Error & { apiCode?: string }
    const code = (data as { code?: string }).code
    if (code) err.apiCode = code
    throw err
  }
  return data as {
    token: string
    user: AuthUser
    needsPartnerProfile?: boolean
    partnerSignupPath?: string
  }
}

export type ClientProfilePayload = {
  firstName: string
  lastName: string
  phone: string
  billAddress: string
  billCounty: string
  billCity: string
  billPostal: string
  deliveryDifferent: boolean
  delAddress?: string
  delCounty?: string
  delCity?: string
  delPostal?: string
  /** Facturare persoană juridică (opțional). */
  companyName: string
  companyCui: string
  companyAddress: string
  companyCounty: string
  companyCity: string
  companyPostal: string
}

export type ClientProfileDto = ClientProfilePayload

export type ClientProfileSaveSection = 'personal' | 'address' | 'company'

export type EmailNotificationPreferences = {
  marketingEmailOptIn: boolean
}

export async function getEmailNotificationPreferences(): Promise<EmailNotificationPreferences> {
  const res = await fetch(`${API_BASE}/account/email-notifications`, {
    headers: authHeaders(),
    cache: 'no-store',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error((json as { error?: string }).error || 'Eroare.')
  }
  return {
    marketingEmailOptIn: (json as EmailNotificationPreferences).marketingEmailOptIn === true,
  }
}

export async function patchEmailNotificationPreferences(
  prefs: EmailNotificationPreferences,
): Promise<EmailNotificationPreferences> {
  const res = await fetch(`${API_BASE}/account/email-notifications`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ marketingEmailOptIn: prefs.marketingEmailOptIn === true }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error((json as { error?: string }).error || 'Eroare la salvare.')
  }
  return {
    marketingEmailOptIn: (json as EmailNotificationPreferences).marketingEmailOptIn === true,
  }
}

/** Jurnal consimțământ cookie (best-effort; preferința locală rămâne sursa pentru UI). */
export async function recordCookieConsent(analytics: boolean): Promise<void> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getAuthToken()
  if (token) headers.Authorization = `Bearer ${token}`
  try {
    await fetch(`${API_BASE}/consent/cookie`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ analytics }),
    })
  } catch {
    /* ignore — banner choice still stored in cookie */
  }
}

export async function getClientProfile(): Promise<{
  createdAt: string
  email: string
  referralCode: string | null
  referralInviteEmailsSent: number
  referralCodeRedemptionsCount: number
  /** False when the account uses Google sign-in only (no local password). */
  hasPassword: boolean
  profile: ClientProfileDto | null
}> {
  const res = await fetch(`${API_BASE}/client/profile`, { headers: authHeaders(), cache: 'no-store' })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error((json as { error?: string }).error || 'Eroare.')
  }
  return {
    ...(json as {
      createdAt: string
      email: string
      referralCode: string | null
      referralInviteEmailsSent: number
      referralCodeRedemptionsCount: number
      profile: ClientProfileDto | null
    }),
    hasPassword: (json as { hasPassword?: boolean }).hasPassword === true,
  }
}

/** Trimite codul de recomandare pe email către un prieten (program „Știu de la vecinu’”). */
export async function postClientReferralInviteEmail(friendEmail: string): Promise<{
  message: string
  referralInviteEmailsSent?: number
}> {
  const res = await fetch(`${API_BASE}/client/referral/send-email`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ friendEmail: friendEmail.trim() }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    if (res.status === 404) {
      const body = json as { error?: string; path?: string }
      throw new Error(
        body?.error === 'Rută negăsită'
          ? 'Serviciul de invitații nu este încă disponibil pe server (backend învechit). Redeploy API-ul (Railway) cu ultima versiune sau verifică că URL-ul API din VITE_API_URL este corect.'
          : body?.error || 'Endpoint negăsit.',
      )
    }
    throw new Error((json as { error?: string }).error || 'Eroare la trimiterea emailului.')
  }
  return json as { message: string; referralInviteEmailsSent?: number }
}

/** Validare cod recomandare (public) pentru programul „Știu de la vecinu’”. */
export async function validateReferralCode(
  referralCode: string,
): Promise<{ valid: true; referralCode: string; discountPercent: number; message?: string }> {
  const res = await fetch(`${API_BASE}/referral/validate-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ referralCode }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((json as { error?: string }).error || 'Cod invalid sau eroare la validare.')
  }
  return json as { valid: true; referralCode: string; discountPercent: number; message?: string }
}

/** Linie coș — aliniată cu `CartLine` din CartContext. */
export type ClientCartLine = {
  productId: string
  slug: string
  title: string
  qty: number
  imageUrl?: string
  reducereProgramId?: string
  reducereDiscountPercent?: number
}

export async function getClientCart(): Promise<{ lines: ClientCartLine[] }> {
  const res = await fetch(`${API_BASE}/client/cart`, { headers: authHeaders(), cache: 'no-store' })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error((json as { error?: string }).error || 'Eroare.')
  }
  return json as { lines: ClientCartLine[] }
}

export async function putClientCart(lines: ClientCartLine[]): Promise<{ lines: ClientCartLine[] }> {
  const res = await fetch(`${API_BASE}/client/cart`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ lines }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error((json as { error?: string }).error || 'Eroare.')
  }
  return json as { lines: ClientCartLine[] }
}

export async function putClientProfile(
  payload: ClientProfilePayload,
  section: ClientProfileSaveSection,
): Promise<{ referralCode: string | null; profile: ClientProfileDto }> {
  const res = await fetch(`${API_BASE}/client/profile`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({
      section,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone,
      billAddress: payload.billAddress,
      billCounty: payload.billCounty,
      billCity: payload.billCity,
      billPostal: payload.billPostal,
      deliveryDifferent: payload.deliveryDifferent,
      delAddress: payload.deliveryDifferent ? payload.delAddress : undefined,
      delCounty: payload.deliveryDifferent ? payload.delCounty : undefined,
      delCity: payload.deliveryDifferent ? payload.delCity : undefined,
      delPostal: payload.deliveryDifferent ? payload.delPostal : undefined,
      companyName: payload.companyName,
      companyCui: payload.companyCui,
      companyAddress: payload.companyAddress,
      companyCounty: payload.companyCounty,
      companyCity: payload.companyCity,
      companyPostal: payload.companyPostal,
    }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error((json as { error?: string }).error || 'Eroare la salvare.')
  }
  return json as { referralCode: string | null; profile: ClientProfileDto }
}

export async function postClientChangePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE}/client/change-password`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error((json as { error?: string }).error || 'Parolă incorectă.')
    throw new Error((json as { error?: string }).error || 'Eroare.')
  }
}

export async function postAdminChangePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/change-password`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error((json as { error?: string }).error || 'Parolă incorectă.')
    throw new Error((json as { error?: string }).error || 'Eroare.')
  }
}

export type AdminAccountDto = {
  email: string
  role: string
  firstName: string
  lastName: string
  phone: string
}

export async function getAdminAccount(): Promise<AdminAccountDto> {
  const res = await fetch(`${API_BASE}/admin/account`, {
    headers: authHeaders(),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((json as { error?: string }).error || 'Eroare la încărcarea contului.')
  return json as AdminAccountDto
}

export async function patchAdminAccount(payload: {
  firstName: string
  lastName: string
  phone: string
}): Promise<AdminAccountDto> {
  const res = await fetch(`${API_BASE}/admin/account`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((json as { error?: string }).error || 'Eroare la salvare.')
  return json as AdminAccountDto
}

export async function postClientChangeEmail(
  newEmail: string,
  currentPassword: string,
): Promise<{ token: string; email: string }> {
  const res = await fetch(`${API_BASE}/client/change-email`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      newEmail: newEmail.trim(),
      currentPassword,
    }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error((json as { error?: string }).error || 'Parolă incorectă.')
    throw new Error((json as { error?: string }).error || 'Eroare.')
  }
  const token = (json as { token?: string }).token
  const email = (json as { email?: string }).email
  if (!token || !email) throw new Error('Răspuns invalid.')
  return { token, email }
}

export type ClientOrderLine = {
  id: string
  productId: string
  productSlug: string | null
  productTitle: string
  quantity: number
  unitPriceInclVat: string | null
  lineTotalInclVat: string | null
  /** Preț catalog (cu TVA) înainte de reducere — prezent doar dacă comanda a beneficiat de discount. */
  listUnitPriceInclVat?: string | null
  listLineTotalInclVat?: string | null
  vatPercent: string | null
  /** Populated by API from catalog (card / first image). */
  imageUrl?: string | null
  /** Din catalog curent — tensiune • capacitate • compoziție și cicluri • Wi-Fi/Bluetooth */
  catalogSpecLine1?: string | null
  catalogSpecLine2?: string | null
}

export type OrderFulfillmentStatus =
  | 'de_platit'
  | 'preluata'
  | 'in_pregatire'
  | 'in_curs_livrare'
  | 'livrata'
  | 'anulata'

export type ClientOrderRow = {
  orderKind: string
  id: string
  orderNumber: string
  orderSource: string
  /** Implicit `de_platit` dacă lipsește (API vechi înainte de migrare). */
  fulfillmentStatus?: OrderFulfillmentStatus | string
  email: string
  phone: string
  lastName: string
  firstName: string
  billAddress: string
  billCounty: string
  billCity: string
  billPostal: string
  deliveryDifferent: boolean
  delAddress: string | null
  delCounty: string | null
  delCity: string | null
  delPostal: string | null
  currency: string
  createdAt: string
  lines: ClientOrderLine[]
  lineCount?: number
  orderTotalInclVat?: string | null
  /** Factură PDF încărcată de admin (comenzi în „în pregătire” și ulterior). */
  clientHasInvoice?: boolean
  /** Proforma PDF încărcată de admin (opțional). */
  proformaUrl?: string | null
}

export type ClientPaymentBankDetails = {
  companyName: string
  bankAccount: string
  bankName: string
}

export async function getPartnerPaymentBankDetails(): Promise<ClientPaymentBankDetails> {
  const res = await fetch(`${API_BASE}/partner/payment-bank-details`, {
    headers: authHeaders(),
    cache: 'no-store',
  })
  const json = (await res.json().catch(() => ({}))) as Partial<ClientPaymentBankDetails> & {
    error?: string
  }
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error(json.error || 'Eroare la încărcarea datelor bancare.')
  }
  return {
    companyName: String(json.companyName || '').trim(),
    bankAccount: String(json.bankAccount || '').trim(),
    bankName: String(json.bankName || '').trim(),
  }
}

export async function getClientPaymentBankDetails(): Promise<ClientPaymentBankDetails> {
  const res = await fetch(`${API_BASE}/client/payment-bank-details`, {
    headers: authHeaders(),
    cache: 'no-store',
  })
  const json = (await res.json().catch(() => ({}))) as Partial<ClientPaymentBankDetails> & {
    error?: string
  }
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error(json.error || 'Eroare la încărcarea datelor bancare.')
  }
  return {
    companyName: String(json.companyName || '').trim(),
    bankAccount: String(json.bankAccount || '').trim(),
    bankName: String(json.bankName || '').trim(),
  }
}

export async function getClientOrders(): Promise<ClientOrderRow[]> {
  const res = await fetch(`${API_BASE}/client/orders`, { headers: authHeaders(), cache: 'no-store' })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error((json as { error?: string }).error || 'Eroare.')
  }
  return Array.isArray(json) ? json : []
}

/** Comenzi rezidențiale ale partenerului autentificat (aceeași formă ca `ClientOrderRow`). */
export async function getPartnerOrders(): Promise<ClientOrderRow[]> {
  const res = await fetch(`${API_BASE}/partner/orders`, { headers: authHeaders(), cache: 'no-store' })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error((json as { error?: string }).error || 'Eroare.')
  }
  return Array.isArray(json) ? json : []
}

export type ClientRegisteredTechnicalDoc = {
  descriere: string
  url: string
}

export type ClientRegisteredProductDto = {
  savedItemId: string
  serialNumber: string
  modelNumber: string
  warehouseIn: string
  /** Indică dacă există un certificat PDF salvat şi descărcabil. URL-ul real
   *  R2 nu este expus în UI — descărcarea se face prin endpoint autentificat
   *  care streamează fişierul cu `Content-Disposition: attachment`. */
  warrantyCertificateAvailable: boolean
  /** ISO timestamp ultimei generări (null până la prima generare). */
  warrantyCertificateGeneratedAt: string | null
  product: {
    id: string
    title: string
    slug: string
    imageUrl: string | null
    documenteTehnice: ClientRegisteredTechnicalDoc[]
  } | null
}

export async function getClientRegisteredProducts(): Promise<ClientRegisteredProductDto[]> {
  const res = await fetch(`${API_BASE}/client/registered-products`, {
    headers: authHeaders(),
    cache: 'no-store',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error((json as { error?: string }).error || 'Eroare.')
  }
  return Array.isArray(json) ? json : []
}

export type ServiceRequestDto = {
  id: string
  requestNumber: string
  accountType: 'client' | 'partener' | string
  userId: string | null
  firstName: string
  lastName: string
  email: string
  phone: string
  serialNumber: string
  modelNumber: string
  productTitle: string
  savedItemId: string | null
  problemDescription: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | string
  createdAt: string
  updatedAt: string
}

/** Statusuri care contează ca cerere „în desfășurare” pe UI client. */
export const SERVICE_REQUEST_ACTIVE_STATUSES: ReadonlyArray<string> = ['open', 'in_progress']

export function isServiceRequestActive(s: ServiceRequestDto): boolean {
  return SERVICE_REQUEST_ACTIVE_STATUSES.includes(String(s.status))
}

export async function getClientServiceRequests(): Promise<ServiceRequestDto[]> {
  const res = await fetch(`${API_BASE}/client/service-requests`, {
    headers: authHeaders(),
    cache: 'no-store',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error((json as { error?: string }).error || 'Eroare.')
  }
  return Array.isArray(json) ? (json as ServiceRequestDto[]) : []
}

export type CreateServiceRequestResult =
  | { ok: true; request: ServiceRequestDto }
  | { ok: false; code: 'already_active'; request: ServiceRequestDto; error: string }
  | { ok: false; code: 'error'; error: string }

export async function createClientServiceRequest(body: {
  savedItemId: string
  problemDescription: string
}): Promise<CreateServiceRequestResult> {
  const res = await fetch(`${API_BASE}/client/service-requests`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  const json = (await res.json().catch(() => ({}))) as {
    error?: string
    code?: string
    serviceRequest?: ServiceRequestDto
  } & Partial<ServiceRequestDto>
  if (res.status === 409 && json.code === 'service_request_already_active' && json.serviceRequest) {
    return {
      ok: false,
      code: 'already_active',
      request: json.serviceRequest,
      error: json.error || 'Există deja o cerere activă.',
    }
  }
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    return { ok: false, code: 'error', error: json.error || 'Eroare.' }
  }
  return { ok: true, request: json as ServiceRequestDto }
}

export async function getAdminServiceRequests(): Promise<ServiceRequestDto[]> {
  const res = await fetch(`${API_BASE}/admin/service-requests`, {
    headers: authHeaders(),
    cache: 'no-store',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error((json as { error?: string }).error || 'Eroare.')
  }
  return Array.isArray(json) ? (json as ServiceRequestDto[]) : []
}

export async function patchAdminServiceRequestStatus(
  id: string,
  status: 'open' | 'in_progress' | 'resolved' | 'closed',
): Promise<ServiceRequestDto> {
  const res = await fetch(
    `${API_BASE}/admin/service-requests/${encodeURIComponent(id)}/status`,
    {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    },
  )
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error((json as { error?: string }).error || 'Eroare.')
  }
  return json as ServiceRequestDto
}

export type ReturRequestDto = {
  id: number
  /** Serie publică (ex. BTRT-000042), derivată din id. */
  registrationNumber: string
  createdAt: string
  updatedAt: string
  userId: string | null
  submitSource: string
  lastName: string
  firstName: string
  street: string
  county: string
  city: string
  postal: string
  phone: string
  email: string
  orderNumber: string
  receiptDate: string
  serialNumber: string
  productBrand: string
  productModel: string
  returnReason: string
  returnReasonOther: string
  condUninstalled: boolean
  condSeals: boolean
  condPackaging: boolean
  pickupStreet: string
  pickupCounty: string
  pickupCity: string
  pickupPostal: string
  refundTitular: string
  refundIban: string
  policyAccepted: boolean
  declarationAccepted: boolean
  locale: string
  conditionPhotoUrls: string[]
  status: string
}

export async function getAdminReturRequests(): Promise<ReturRequestDto[]> {
  const res = await fetch(`${API_BASE}/admin/retur`, {
    headers: authHeaders(),
    cache: 'no-store',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error((json as { error?: string }).error || 'Eroare.')
  }
  return Array.isArray(json) ? (json as ReturRequestDto[]) : []
}

export async function patchAdminReturStatus(
  id: number,
  status: 'pending' | 'reviewed' | 'closed',
): Promise<ReturRequestDto> {
  const res = await fetch(`${API_BASE}/admin/retur/${encodeURIComponent(String(id))}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error((json as { error?: string }).error || 'Eroare.')
  }
  return json as ReturRequestDto
}

export async function claimClientRegisteredProduct(body: {
  serialNumber?: string
  qrRaw?: string
}): Promise<ClientRegisteredProductDto> {
  const res = await fetch(`${API_BASE}/client/registered-products/claim`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error((json as { error?: string }).error || 'Eroare.')
  }
  return json as ClientRegisteredProductDto
}

export type ClientWarrantyCertificateResult =
  | { ok: true; kind: 'pdf'; pdfBlob: Blob; filename: string }
  | { ok: true; kind: 'html'; htmlBlob: Blob; filename: string }
  | { ok: false; code: string; error: string; fields?: string[] }

function filenameFromContentDisposition(headerValue: string, fallback: string): string {
  const m = headerValue.match(/filename="([^"]+)"/i)
  return m?.[1] || fallback
}

/**
 * Generează certificatul de garanție și răspunde cu PDF-ul (force-download).
 * URL-ul R2 nu este niciodată expus clientului; PDF-ul este streamuit ca blob
 * prin acest endpoint autentificat. Se salvează intern în R2 pentru download
 * ulterior prin `downloadClientRegisteredProductWarrantyCertificate`.
 */
export async function postClientRegisteredProductWarrantyCertificate(
  savedItemId: string,
): Promise<ClientWarrantyCertificateResult> {
  const res = await fetch(
    `${API_BASE}/client/registered-products/${encodeURIComponent(savedItemId)}/warranty-certificate`,
    { method: 'POST', headers: authHeaders() },
  )
  const contentType = (res.headers.get('Content-Type') || '').toLowerCase()
  const dispo = res.headers.get('Content-Disposition') || ''

  if (res.ok && contentType.includes('application/pdf')) {
    const pdfBlob = await res.blob()
    return {
      ok: true,
      kind: 'pdf',
      pdfBlob,
      filename: filenameFromContentDisposition(dispo, `certificat-${savedItemId}.pdf`),
    }
  }

  /* Cazul dev fără R2: răspuns HTML inline (legacy). */
  if (res.ok && contentType.includes('text/html')) {
    const htmlBlob = await res.blob()
    return {
      ok: true,
      kind: 'html',
      htmlBlob,
      filename: filenameFromContentDisposition(
        dispo,
        `certificat-garantie-${savedItemId}.html`,
      ),
    }
  }
  const json = (await res.json().catch(() => ({}))) as {
    error?: string
    code?: string
    fields?: string[]
  }
  const code = String(json.code || '')
  if (res.status === 400 && code === 'profile_incomplete') {
    return {
      ok: false,
      code,
      error: json.error || '',
      fields: Array.isArray(json.fields) ? json.fields : undefined,
    }
  }
  if (res.status === 501 && code === 'warranty_not_implemented') {
    return { ok: false, code, error: json.error || '' }
  }
  throw new Error(json.error || 'Eroare.')
}

/**
 * Descarcă PDF-ul certificatului existent din R2 prin endpoint autentificat.
 * Răspunsul are `Content-Disposition: attachment` — browser-ul forţează salvare
 * pe disc. URL-ul R2 nu este expus.
 */
export async function downloadClientRegisteredProductWarrantyCertificate(
  savedItemId: string,
): Promise<{ pdfBlob: Blob; filename: string }> {
  const res = await fetch(
    `${API_BASE}/client/registered-products/${encodeURIComponent(savedItemId)}/warranty-certificate/download`,
    { headers: authHeaders() },
  )
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string }
    if (res.status === 401) throw new Error('Sesiune expirată.')
    throw new Error(json.error || 'Nu am putut descărca certificatul.')
  }
  const dispo = res.headers.get('Content-Disposition') || ''
  const pdfBlob = await res.blob()
  return {
    pdfBlob,
    filename: filenameFromContentDisposition(dispo, `certificat-${savedItemId}.pdf`),
  }
}

export async function cancelClientOrder(orderId: string): Promise<{ fulfillmentStatus: string }> {
  const res = await fetch(`${API_BASE}/client/orders/${encodeURIComponent(orderId)}/cancel`, {
    method: 'POST',
    headers: authHeaders(),
  })
  const json = (await res.json().catch(() => ({}))) as { error?: string; fulfillmentStatus?: string }
  if (!res.ok) throw new Error(json.error || 'Nu am putut anula comanda.')
  return { fulfillmentStatus: String(json.fulfillmentStatus || 'anulata') }
}

export async function cancelPartnerOrder(orderId: string): Promise<{ fulfillmentStatus: string }> {
  const res = await fetch(`${API_BASE}/partner/orders/${encodeURIComponent(orderId)}/cancel`, {
    method: 'POST',
    headers: authHeaders(),
  })
  const json = (await res.json().catch(() => ({}))) as { error?: string; fulfillmentStatus?: string }
  if (!res.ok) throw new Error(json.error || 'Nu am putut anula comanda.')
  return { fulfillmentStatus: String(json.fulfillmentStatus || 'anulata') }
}

/**
 * Generează (la nevoie) și descarcă proforma PDF prin API (`?download=1`),
 * ca blob în browser — evită blocarea pop-up-ului la deschiderea URL-ului R2 după `fetch` async.
 */
export async function downloadPartnerOrderProforma(
  orderId: string,
  orderNumber: string,
): Promise<{ downloadUrl: string }> {
  const token = getAuthToken()
  const h: Record<string, string> = {}
  if (token) h['Authorization'] = `Bearer ${token}`
  const res = await fetch(
    `${API_BASE}/partner/orders/${encodeURIComponent(orderId)}/proforma?download=1`,
    { headers: h },
  )
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(json.error || 'Nu am putut genera proforma.')
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `proforma-${orderNumber.replace(/[^\w.-]+/g, '_')}.pdf`
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  return { downloadUrl: '' }
}

export async function downloadClientOrderProforma(
  orderId: string,
  orderNumber: string,
): Promise<{ downloadUrl: string }> {
  const token = getAuthToken()
  const h: Record<string, string> = {}
  if (token) h['Authorization'] = `Bearer ${token}`
  const res = await fetch(
    `${API_BASE}/client/orders/${encodeURIComponent(orderId)}/proforma?download=1`,
    { headers: h },
  )
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(json.error || 'Nu am putut genera proforma.')
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `proforma-${orderNumber.replace(/[^\w.-]+/g, '_')}.pdf`
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  return { downloadUrl: '' }
}

/** Descarcă factura PDF (după ce comanda e în „în pregătire” și admin a încărcat factura). */
export async function downloadClientOrderInvoice(orderId: string, orderNumber: string): Promise<void> {
  const token = getAuthToken()
  const h: Record<string, string> = {}
  if (token) h['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}/client/orders/${encodeURIComponent(orderId)}/invoice`, {
    headers: h,
  })
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(json.error || 'Nu am putut descărca factura.')
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `factura-${orderNumber.replace(/[^\w.-]+/g, '_')}.pdf`
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function downloadPartnerOrderInvoice(orderId: string, orderNumber: string): Promise<void> {
  const token = getAuthToken()
  const h: Record<string, string> = {}
  if (token) h['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}/partner/orders/${encodeURIComponent(orderId)}/invoice`, {
    headers: h,
  })
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(json.error || 'Nu am putut descărca factura.')
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `factura-${orderNumber.replace(/[^\w.-]+/g, '_')}.pdf`
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function notifyAuthChanged() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('baterino-auth-change'))
}

export function setAuthToken(token: string) {
  localStorage.setItem('auth_token', token)
  notifyAuthChanged()
}

export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token')
}

export function getAuthRole(): 'admin' | 'client' | 'partener' | 'sales_agent' | null {
  const token = getAuthToken()
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { role?: string }
    const r = payload.role
    if (r === 'admin' || r === 'client' || r === 'partener' || r === 'sales_agent') return r
    return null
  } catch {
    return null
  }
}

function publicFetchHeaders(): HeadersInit {
  const h: Record<string, string> = {}
  const token = getAuthToken()
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

/** Extrage email-ul din token (pentru afișare). Returnează null dacă token invalid/lipsă. */
export function getAuthEmail(): string | null {
  const token = getAuthToken()
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.email ?? null
  } catch {
    return null
  }
}

/** ID utilizator din JWT (pentru coș persistent per client). */
export function getAuthUserId(): string | null {
  const token = getAuthToken()
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { userId?: string }
    const id = payload.userId
    return typeof id === 'string' && id.trim() ? id.trim() : null
  } catch {
    return null
  }
}

export function clearAuth() {
  localStorage.removeItem('auth_token')
  notifyAuthChanged()
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

export type PartnerProfile = {
  companyName?: string
  cui?: string
  address?: string
  /** Sediu social — adresă înregistrare */
  companyStreet?: string
  companyCity?: string
  companyCounty?: string
  companyPostalCode?: string
  /** Livrare implicită (magazin / depozit), distinctă de sediu și de adresa din profil public */
  deliveryStreet?: string | null
  deliveryCounty?: string | null
  deliveryCity?: string | null
  deliveryPostalCode?: string | null
  tradeRegisterNumber?: string
  activityTypes?: string[]
  contactFirstName?: string
  contactLastName?: string
  phone?: string
  logoUrl?: string | null
  publicName?: string
  street?: string
  county?: string
  city?: string
  zipCode?: string
  description?: string
  services?: string[]
  publicPhone?: string
  whatsapp?: string
  website?: string
  facebookUrl?: string
  linkedinUrl?: string
  instagramUrl?: string
  tiktokUrl?: string
  isPublic?: boolean
  /** Galerie foto lucrări — array de URL-uri / base64 (max 8). */
  workPhotos?: string[] | null
  /** Handle pagină publică /companii-instalatori-fotovoltaice/{publicSlug}; API-ul rămâne /public/companii/… */
  publicSlug?: string | null
}

export type PublicPartnerCompanyProfile = {
  publicSlug: string
  companyName: string
  publicName?: string | null
  logoUrl?: string | null
  street?: string | null
  county?: string | null
  city?: string | null
  zipCode?: string | null
  description?: string | null
  services?: string[]
  publicPhone?: string | null
  whatsapp?: string | null
  website?: string | null
  facebookUrl?: string | null
  linkedinUrl?: string | null
  instagramUrl?: string | null
  tiktokUrl?: string | null
  workPhotos: string[]
}

export async function getPublicPartnerCompanyProfile(handleParam: string): Promise<PublicPartnerCompanyProfile> {
  let seg = decodeURIComponent(handleParam.trim())
  if (seg.startsWith('@')) seg = seg.slice(1).trim()
  if (!seg) throw new Error('Profil negăsit.')
  const res = await fetch(`${API_BASE}/public/companii/${encodeURIComponent(seg)}`)
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error || 'Profil negăsit.')
  return json as PublicPartnerCompanyProfile
}

export async function savePartnerProfile(data: PartnerProfile) {
  const body = { ...data }
  const res = await fetch(`${API_BASE}/partner/profile`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la salvarea profilului.')
  return json
}

/** Încarcă logo sau foto lucrări în R2: `PublicProfiles/<nume-firma>/`. Necesită numele companiei setat în profil. */
export async function uploadPartnerPublicMedia(file: File, kind: 'logo' | 'work'): Promise<{ url: string }> {
  const token = getAuthToken()
  const form = new FormData()
  form.append('file', file)
  form.append('kind', kind)
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${API_BASE}/partner/public-profile/media`, {
    method: 'POST',
    headers,
    body: form,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la încărcarea fișierului.')
  return json as { url: string }
}

/** Agent de vânzări atribuit partenerului — inclus în GET /partner/profile când există. */
export type SalesAgentKind = 'human' | 'ai'

export type PartnerAssignedSalesAgent = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  whatsapp: string
  agentKind?: SalesAgentKind
}

/** GET /partner/profile — profil partener + flag-uri și agent atribuit. */
export type PartnerProfileGetResponse = PartnerProfile & {
  id?: string
  userId?: string
  isApproved?: boolean
  isSuspended?: boolean
  assignedSalesAgentId?: string | null
  assignedSalesAgent?: PartnerAssignedSalesAgent | null
  partnerDiscountPercent?: number | null
}

export async function getPartnerProfile(): Promise<PartnerProfileGetResponse> {
  const res = await fetch(`${API_BASE}/partner/profile`, {
    headers: authHeaders(),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la citirea profilului.')
  return json as PartnerProfileGetResponse
}

export type PartnerPublicSlugAvailability = {
  slug: string
  available: boolean
  isCurrent?: boolean
  reason?: 'empty' | 'invalid' | 'taken'
}

/** Verifică dacă handle-ul paginii publice este liber (sau e cel curent al partenerului). */
export async function checkPartnerPublicSlugAvailability(slug: string): Promise<PartnerPublicSlugAvailability> {
  const q = encodeURIComponent(String(slug ?? '').trim())
  const res = await fetch(`${API_BASE}/partner/public-slug/availability?slug=${q}`, {
    headers: authHeaders(),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((json as { error?: string }).error || 'Eroare la verificarea adresei.')
  return json as PartnerPublicSlugAvailability
}

export type PartnerProfileOnboardingFields = {
  companyName?: string | null
  cui?: string | null
  activityTypes?: string | string[] | null
  contactFirstName?: string | null
  phone?: string | null
}

function partnerActivityTypesFilled(activityTypes: PartnerProfileOnboardingFields['activityTypes']): boolean {
  if (Array.isArray(activityTypes)) return activityTypes.some((t) => String(t || '').trim())
  return Boolean(String(activityTypes || '').trim())
}

/** Ruta de onboarding dacă profilul e incomplet; `null` dacă poate intra în panou. */
export function getPartnerOnboardingRedirect(
  p: PartnerProfileOnboardingFields,
): '/signup/parteneri/profil' | '/signup/parteneri/profil-public' | null {
  if (!String(p.companyName || '').trim() || !String(p.cui || '').trim()) {
    return '/signup/parteneri/profil'
  }
  if (
    !partnerActivityTypesFilled(p.activityTypes) ||
    !String(p.contactFirstName || '').trim() ||
    !String(p.phone || '').trim()
  ) {
    return '/signup/parteneri/profil-public'
  }
  return null
}

/** După login cu parolă: unde merge un partener (onboarding vs dashboard). Necesită token deja setat. */
export async function getPartnerPostLoginPath(): Promise<string> {
  try {
    const p = await getPartnerProfile()
    return getPartnerOnboardingRedirect(p) ?? '/partner'
  } catch {
    return '/signup/parteneri/profil'
  }
}

export async function deletePartnerAccount() {
  const res = await fetch(`${API_BASE}/partner/account`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la ștergerea contului.')
  return json
}

export function clientDataExportFilename(email: string): string {
  const safe = String(email || 'cont')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._+-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120)
  return `baterino-datele-mele-${safe || 'cont'}.json`
}

/** GDPR Art. 20 — descarcă JSON cu toate datele personale ale clientului. */
export async function downloadClientDataExport(
  accountEmail?: string,
): Promise<{ blob: Blob; filename: string }> {
  const res = await fetch(`${API_BASE}/client/export-data`, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'include',
    cache: 'no-store',
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error((json as { error?: string }).error || 'Eroare la exportul datelor.')
  }
  const blob = await res.blob()
  const cd = res.headers.get('Content-Disposition') || ''
  const quoted = /filename="([^"]+)"/i.exec(cd)
  const filename =
    quoted?.[1] ||
    (accountEmail?.trim() ? clientDataExportFilename(accountEmail) : 'baterino-datele-mele.json')
  return { blob, filename }
}

/** Șterge definitiv contul client. Parola e necesară doar dacă există parolă locală (nu cont doar Google). */
export async function deleteClientAccount(currentPassword?: string) {
  const body =
    currentPassword !== undefined && currentPassword !== ''
      ? { currentPassword }
      : {}
  const res = await fetch(`${API_BASE}/client/account`, {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la ștergerea contului.')
  return json
}

export type AdminCompany = {
  id: string
  userId: string
  companyName: string
  cui: string
  address: string | null
  companyStreet: string | null
  companyCity: string | null
  companyCounty: string | null
  companyPostalCode: string | null
  tradeRegisterNumber: string | null
  activityTypes: string
  contactFirstName: string
  contactLastName: string
  phone: string
  publicName: string | null
  street: string | null
  county: string | null
  city: string | null
  zipCode: string | null
  description: string | null
  services: string | null
  publicPhone: string | null
  whatsapp: string | null
  website: string | null
  facebookUrl: string | null
  linkedinUrl: string | null
  instagramUrl?: string | null
  tiktokUrl?: string | null
  logoUrl: string | null
  publicSlug?: string | null
  workPhotos?: string | null
  isPublic: boolean
  isSuspended: boolean
  isApproved: boolean
  partnerDiscountPercent: number | null
  /** SalesAgent.id — agent de vânzări atribuit la aprobare. */
  assignedSalesAgentId?: string | null
  createdAt: string
  user: { email: string }
}

export type ApproveAdminCompanyPayload = {
  partnerDiscountPercent?: number | null
  assignedSalesAgentId?: string | null
}

export async function approveAdminCompany(
  id: string,
  payload?: ApproveAdminCompanyPayload,
): Promise<AdminCompany> {
  const res = await fetch(`${API_BASE}/admin/companies/${encodeURIComponent(id)}/approve`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload ?? {}),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la aprobare.')
  return json
}

export async function updateAdminCompanyDiscount(id: string, discountPercent: number | null): Promise<AdminCompany> {
  const res = await fetch(`${API_BASE}/admin/companies/${id}/discount`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ discountPercent }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la actualizare.')
  return json
}

/** Profilul public e complet (aceleași reguli ca în panoul partener / toggle „Profil public”). */
export function isPublicProfileComplete(c: AdminCompany): boolean {
  return isPartnerPublicProfileFullyComplete({
    publicSlug: c.publicSlug,
    logoUrl: c.logoUrl,
    publicName: c.publicName,
    street: c.street,
    county: c.county,
    city: c.city,
    description: c.description,
    services: c.services,
    publicPhone: c.publicPhone,
    website: c.website,
    facebookUrl: c.facebookUrl,
    linkedinUrl: c.linkedinUrl,
    instagramUrl: c.instagramUrl,
    tiktokUrl: c.tiktokUrl,
    workPhotos: c.workPhotos,
  })
}

export async function suspendAdminCompany(id: string, suspended: boolean): Promise<AdminCompany> {
  const res = await fetch(`${API_BASE}/admin/companies/${id}/suspend`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ suspended }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la actualizare.')
  return json
}

/** Șterge definitiv partenerul aprobat și contul utilizator din baza de date. */
export async function deleteApprovedAdminCompany(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/companies/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la ștergere.')
}

/** Test conexiune API + Prisma (fără auth). Pentru diagnostic. */
export async function testApiDb(): Promise<{ ok: boolean; partnersCount?: number; error?: string }> {
  const base = (import.meta.env.VITE_API_URL as string) ||
    (import.meta.env.DEV && typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:3001/api'
      : '/api')
  try {
    const res = await fetch(`${base}/debug/db`)
    const json = await res.json().catch(() => ({}))
    if (res.ok) return json
    return { ok: false, error: json.error || `HTTP ${res.status}` }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Eroare de rețea' }
  }
}

export type CreateProductPayload = {
  brand?: string
  title: string
  sku: string
  description?: string
  subtitle?: string
  overview?: string
  seoTitle?: string | null
  seoDescription?: string | null
  seoOgImage?: string | null
  keyAdvantages?: { title: string; image: string }[]
  tipProdus: 'rezidential' | 'industrial'
  categorie?: string
  priceVisibility?: 'hidden' | 'public' | 'partner_only'
  pricePresentation?: 'simple' | 'detailed'
  /** Doar rezidențial; la industrial se trimite null din admin */
  catalogStockStatus?: 'in_stock' | 'out_of_stock' | 'coming_soon' | 'on_order' | null
  /** Doar rezidențial; la industrial se trimite null din admin */
  catalogDeliveryBadge?: '24h' | '48h' | '7_14d' | '60d' | null
  /** Doar rezidențial; la industrial se trimite null din admin */
  catalogTransportBadge?: 'free' | 'paid' | null
  /** Doar industrial; la rezidențial se trimite null din admin */
  catalogInstallBadge?: 'baterino' | 'partner' | null
  /** Prioritate afișare în cont client / partener */
  promovarePeContClient?: boolean
  promovarePeContPartener?: boolean
  reducereProgramIds?: string[]
  salePrice: string | number
  partnerSalePrice?: string | number
  vat: string | number
  energieNominala?: string
  capacitate?: string
  curentMaxDescarcare?: string
  curentMaxIncarcare?: string
  cicluriDescarcare?: string
  adancimeDescarcare?: string
  greutate?: string
  compozitie?: string
  dimensiuni?: string
  protectie?: string
  conectivitateWifi?: boolean
  conectivitateBluetooth?: boolean
  protectieFoc?: string
  certificari?: string
  garantie?: string
  tensiuneNominala?: string
  eficientaCiclu?: string
  temperaturaFunctionare?: string
  temperaturaStocare?: string
  umiditate?: string
  /** URL imagine card listă; opțional */
  cardImage?: string | null
  images: string[]
  documenteTehnice: { descriere: string; url: string }[]
  faq: { q: string; a: string }[]
  caseStudyExamples?: { title: string; subtitle: string; location: string; image: string }[]
  alimentaModalContent?: { title: string; intro?: string; sections: Array<{ label: string; items: string[] }> } | null
  /** Specificații tehnice șablon industrial: fiecare intrare = un model + toate câmpurile */
  technicalSpecsModels?: {
    entries: Array<{ modelName: string; specs: Record<string, string> }>
  } | null
}

export async function uploadAdminFile(
  file: File,
  productFolder?: string,
  imageIndex?: number,
  options?: { prefix?: string },
): Promise<{ url: string }> {
  const token = getAuthToken()
  if (!token) throw new Error('Trebuie să fii autentificat.')
  const formData = new FormData()
  const folder = productFolder || 'produs'
  formData.append('folder', folder)
  if (imageIndex != null) formData.append('imageIndex', String(imageIndex))
  formData.append('file', file)
  const params = new URLSearchParams({ folder })
  if (imageIndex != null) params.set('imageIndex', String(imageIndex))
  if (options?.prefix) params.set('prefix', options.prefix)
  const uploadUrl = `${API_BASE}/admin/upload?${params}`
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options?.prefix ? { 'X-Upload-Prefix': options.prefix } : {}),
    },
    body: formData,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la încărcarea fișierului.')
  return json
}

/** Upload JPG to R2 under study-cases/{slug}/ */
export async function uploadCaseStudyImage(
  file: File,
  caseSlug: string,
  imageIndex: number,
): Promise<{ url: string }> {
  return uploadAdminFile(file, caseSlug, imageIndex, { prefix: 'study-cases' })
}

export type ReducereProgramRow = ReducereProgram & {
  id: string
  locale?: string
  sortOrder?: number
  /** Present on admin list; public list only returns active rows */
  isActive?: boolean
}

export async function getPublicReducerePrograms(lang: LangCode): Promise<ReducereProgramRow[]> {
  const res = await fetch(`${API_BASE}/reducere-programs?locale=${encodeURIComponent(lang)}`, { cache: 'no-store' })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la încărcarea programelor.')
  return Array.isArray(json) ? json : []
}

export async function getAdminReducerePrograms(locale: string = 'ro'): Promise<ReducereProgramRow[]> {
  const res = await fetch(`${API_BASE}/admin/reducere-programs?locale=${encodeURIComponent(locale)}`, {
    headers: authHeaders(),
    cache: 'no-store',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error(json.error || 'Eroare la încărcarea programelor.')
  }
  return Array.isArray(json) ? json : []
}

export async function createAdminReducereProgram(body: Record<string, unknown>): Promise<ReducereProgramRow> {
  const res = await fetch(`${API_BASE}/admin/reducere-programs`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error(json.error || 'Eroare la creare.')
  }
  return json
}

export async function updateAdminReducereProgram(
  id: string,
  body: Record<string, unknown>,
): Promise<ReducereProgramRow> {
  const res = await fetch(`${API_BASE}/admin/reducere-programs/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error(json.error || 'Eroare la salvare.')
  }
  return json
}

export async function deleteAdminReducereProgram(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/reducere-programs/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json.error || 'Eroare la ștergere.')
  }
}

export type CaseStudySpec = {
  label: string
  value: string
  highlight?: boolean
}

export type CaseStudyRow = {
  id: string
  locale: string
  slug: string
  category: string
  title: string
  location: string
  image: string
  imageAlt: string
  images: string[]
  imageCount: number
  specs: CaseStudySpec[]
  tags: string[]
  isActive: boolean
  sortOrder: number
}

export type CaseStudyPayload = {
  locale?: string
  slug?: string
  category?: string
  title?: string
  location?: string
  image?: string
  images?: string[]
  imageAlt?: string
  imageCount?: number
  specs?: CaseStudySpec[]
  tags?: string[]
  isActive?: boolean
  sortOrder?: number
}

export async function getPublicCaseStudies(lang: LangCode): Promise<CaseStudyRow[]> {
  const res = await fetch(`${API_BASE}/case-studies?locale=${encodeURIComponent(lang)}`, { cache: 'no-store' })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la încărcarea studiilor de caz.')
  return Array.isArray(json) ? json : []
}

export async function getAdminCaseStudies(locale: string = 'ro'): Promise<CaseStudyRow[]> {
  const res = await fetch(`${API_BASE}/admin/case-studies?locale=${encodeURIComponent(locale)}`, {
    headers: authHeaders(),
    cache: 'no-store',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error(json.error || 'Eroare la încărcarea studiilor de caz.')
  }
  return Array.isArray(json) ? json : []
}

export async function createAdminCaseStudy(body: CaseStudyPayload): Promise<CaseStudyRow> {
  const res = await fetch(`${API_BASE}/admin/case-studies`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error(json.error || 'Eroare la creare.')
  }
  return json
}

export async function updateAdminCaseStudy(id: string, body: CaseStudyPayload): Promise<CaseStudyRow> {
  const res = await fetch(`${API_BASE}/admin/case-studies/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error(json.error || 'Eroare la salvare.')
  }
  return json
}

export async function deleteAdminCaseStudy(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/case-studies/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json.error || 'Eroare la ștergere.')
  }
}

export type AdminProduct = {
  id: string
  status: string
  brand?: string | null
  title: string
  sku: string
  description?: string | null
  images: string[]
  capacitate?: string | null
  tensiuneNominala?: string | null
  compozitie?: string | null
  cicluriDescarcare?: string | null
  conectivitateWifi?: boolean
  conectivitateBluetooth?: boolean
  salePrice?: string | number
  reducereProgramIds?: unknown
  [key: string]: unknown
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const url = `${API_BASE}/admin/products`
  const res = await fetch(url, { headers: authHeaders(), cache: 'no-store' })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = json.error || 'Eroare la încărcare.'
    const err = new Error(msg) as Error & { status?: number; path?: string }
    err.status = res.status
    err.path = json.path
    throw err
  }
  return Array.isArray(json) ? json : (json.data ?? json.products ?? [])
}

/** Cod fabrică implicit pentru SN depozit (introducere manuală: se completează câmpul fără acest prefix). */
export const WAREHOUSE_SN_FACTORY_PREFIX = 'LJC'

/** LJC + 16 cifre: în corpul de 16 cifre, poz. 9–10 = an (YY), 11–12 = lună; + tensiune, capacitate, lot (aliniat cu `deriveProducedOnFromSerial` din API). */
export const WAREHOUSE_SN_BODY_DIGITS = 16

/** Aliniat cu API: SN:…, JSON cu SN/sn/serialNumber, URL ?sn=, altfel text integral. */
export function parseWarehouseQrSerial(raw: string): string {
  const s = String(raw ?? '').trim()
  if (!s) return ''
  const prefixed = /^SN:\s*(.+)$/i.exec(s)
  if (prefixed) return prefixed[1].trim().slice(0, 512)
  if (s.startsWith('{')) {
    try {
      const j = JSON.parse(s) as Record<string, unknown>
      const sn = j.SN ?? j.sn ?? j.serialNumber ?? j.serial
      if (typeof sn === 'string' && sn.trim()) return sn.trim().slice(0, 512)
    } catch {
      // ignore
    }
  }
  try {
    const u = new URL(s)
    const q = u.searchParams.get('SN') || u.searchParams.get('sn')
    if (q && q.trim()) return q.trim().slice(0, 512)
  } catch {
    // not a URL
  }
  return s.slice(0, 512)
}

/** Token semnat din lipire URL (?t= / ?token=) sau string raw `payload.sig` (QR certificat). */
export function extractWarrantyVerifyTokenFromPaste(raw: string): string | null {
  const s = String(raw ?? '').trim()
  if (!s) return null
  try {
    const u = new URL(s)
    const t = u.searchParams.get('t') || u.searchParams.get('token')
    if (t && t.trim()) return t.trim().slice(0, 4096)
  } catch {
    // not a URL
  }
  if (!/\s/.test(s) && s.includes('.')) {
    const dot = s.indexOf('.')
    if (dot > 0 && dot < s.length - 1 && s.indexOf('.', dot + 1) === -1) {
      const left = s.slice(0, dot)
      const right = s.slice(dot + 1)
      if (
        left.length >= 8 &&
        right.length >= 8 &&
        /^[A-Za-z0-9_-]+$/.test(left) &&
        /^[A-Za-z0-9_-]+$/.test(right)
      ) {
        return s.slice(0, 4096)
      }
    }
  }
  return null
}

/** Spații, cratime, punct, underscore, unicode dashes — ex. `LJC - 5120 - 0011 - 2511 - 0009`. */
function stripWarehouseSerialDisplayFormatting(s: string): string {
  return String(s ?? '')
    .toUpperCase()
    .replace(/[\s\-_.\u2010-\u2015]+/g, '')
}

/** Elimină formatare afișare, majuscule; păstrează doar cifre după LJC; dacă lipsește prefixul fabrică, îl adaugă. */
export function normalizeWarehouseSerialNumber(raw: string): string {
  let t = stripWarehouseSerialDisplayFormatting(raw)
  if (!t) return ''
  const p = WAREHOUSE_SN_FACTORY_PREFIX
  if (t.startsWith(p)) {
    const body = t.slice(p.length).replace(/\D/g, '')
    return `${p}${body}`
  }
  const digits = t.replace(/\D/g, '')
  return `${p}${digits}`
}

export function isValidWarehouseSerialNumber(serial: string): boolean {
  return new RegExp(`^${WAREHOUSE_SN_FACTORY_PREFIX}\\d{${WAREHOUSE_SN_BODY_DIGITS}}$`).test(String(serial ?? ''))
}

/** Din valoarea decodificată (QR / lipire), întoarce doar cele 16 cifre după LJC când e posibil. */
export function warehouseSerialToBodyDigits(parsed: string): string {
  const normalized = normalizeWarehouseSerialNumber(parseWarehouseQrSerial(parsed))
  if (isValidWarehouseSerialNumber(normalized)) return normalized.slice(WAREHOUSE_SN_FACTORY_PREFIX.length)
  const digits = parseWarehouseQrSerial(parsed).replace(/\D/g, '')
  if (digits.length >= WAREHOUSE_SN_BODY_DIGITS) return digits.slice(-WAREHOUSE_SN_BODY_DIGITS)
  return digits.slice(0, WAREHOUSE_SN_BODY_DIGITS)
}

export type WarehouseStockUnitRow = {
  id: string
  productId: string
  serialNumber: string
  warehouseReceivedAt: string
  entryMethod: 'qr_scan' | 'manual' | string
  rawQrPayload?: string | null
  createdAt: string
  updatedAt: string
  product?: { id: string; title: string; sku: string }
}

/** Valori API pentru coloana Locație (Stocuri → Lista). */
export type WarehouseSavedItemLocation =
  | 'depozit'
  | 'distribuitor'
  | 'client_final'
  | 'service'

export type WarehouseSavedItemRow = {
  id: string
  itemNumber: number | null
  warehouseStockUnitId: string
  /** Marcă din catalog (produs legat de unitatea din depozit). */
  brand?: string | null
  modelNumber: string
  serialNumber: string
  producedOn: string
  warehouseIn: string
  location?: WarehouseSavedItemLocation | string | null
  distributor?: string | null
  client?: string | null
  /** Set when `client` matches a User id (înregistrare din cont). */
  clientAccount?: { email: string; firstName: string; lastName: string }
  /** Există un certificat PDF generat (descărcabil prin endpoint autentificat). */
  warrantyCertificateAvailable?: boolean
  /** ISO timestamp ultimei generări (null până la prima generare). */
  warrantyCertificateGeneratedAt?: string | null
  /** Numărul certificatului (CG-YYYY-NNNNN), `null` dacă nu este generat. */
  warrantyCertificateNumber?: string | null
  /** Data recepției de către client (text, ex. zz-ll-aaaa) sau ISO din fluxuri viitoare. */
  clientReceiptDate?: string | null
  createdAt: string
  updatedAt: string
}

export async function getAdminWarehouseStockUnits(limit = 100): Promise<WarehouseStockUnitRow[]> {
  const res = await fetch(`${API_BASE}/admin/warehouse-stock-units?limit=${encodeURIComponent(String(limit))}`, {
    headers: authHeaders(),
    cache: 'no-store',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error((json as { error?: string }).error || 'Eroare la încărcarea stocurilor.')
  }
  return Array.isArray(json) ? json : []
}

export async function getAdminWarehouseSavedItems(limit = 200): Promise<WarehouseSavedItemRow[]> {
  const res = await fetch(`${API_BASE}/admin/warehouse-saved-items?limit=${encodeURIComponent(String(limit))}`, {
    headers: authHeaders(),
    cache: 'no-store',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error((json as { error?: string }).error || 'Eroare la încărcarea listei de stocuri.')
  }
  return Array.isArray(json) ? (json as WarehouseSavedItemRow[]) : []
}

export async function deleteAdminWarehouseSavedItem(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/warehouse-saved-items/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (res.status === 204) return
  const json = await res.json().catch(() => ({}))
  if (res.status === 401) throw new Error('Sesiune expirată.')
  if (res.status === 403) throw new Error('Acces restricționat. Doar administratorii pot șterge înregistrări din depozit.')
  if (res.status === 404) throw new Error((json as { error?: string }).error || 'Înregistrarea nu există.')
  throw new Error((json as { error?: string }).error || 'Eroare la ștergere.')
}

/**
 * Admin: descarcă PDF-ul certificatului de garanţie pentru orice item din
 * depozit. Răspunsul are `Content-Disposition: attachment` (force download).
 */
export async function downloadAdminWarehouseWarrantyCertificate(
  id: string,
): Promise<{ pdfBlob: Blob; filename: string }> {
  const res = await fetch(
    `${API_BASE}/admin/warehouse-saved-items/${encodeURIComponent(id)}/warranty-certificate/download`,
    { headers: authHeaders() },
  )
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string }
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error(json.error || 'Nu am putut descărca certificatul.')
  }
  const dispo = res.headers.get('Content-Disposition') || ''
  const m = dispo.match(/filename="([^"]+)"/i)
  const filename = m?.[1] || `certificat-${id}.pdf`
  const pdfBlob = await res.blob()
  return { pdfBlob, filename }
}

export async function createWarehouseStockUnit(payload: {
  /** Catalog product id (legacy). */
  productId?: string
  /** Row id from admin Modele (`product_models`); API resolves catalog product by SKU = modelNumber. */
  productModelId?: string
  serialNumber: string
  entryMethod: 'qr_scan' | 'manual'
  qrRaw?: string | null
}): Promise<WarehouseStockUnitRow> {
  const res = await fetch(`${API_BASE}/admin/warehouse-stock-units`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      ...(payload.productId ? { productId: payload.productId } : {}),
      ...(payload.productModelId ? { productModelId: payload.productModelId } : {}),
      serialNumber: payload.serialNumber,
      entryMethod: payload.entryMethod,
      qrRaw: payload.qrRaw ?? undefined,
    }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    if (res.status === 409) {
      throw new Error(
        (json as { error?: string }).error ||
          'Acest număr de serie (SN) există deja în depozit. Folosește un alt SN sau verifică în Stocuri → Lista.',
      )
    }
    throw new Error((json as { error?: string }).error || 'Eroare la înregistrare.')
  }
  return json as WarehouseStockUnitRow
}

/** Rând din tabelul DB `product_models` (modele produs / specificații). */
export type AdminProductModelRow = {
  id: string
  name: string
  brand: string
  series: string
  modelNumber: string
  technicalDescription: string
  usageType: 'industrial' | 'residential'
  imageUrl?: string | null
  /** When true, model is listed in Stocuri → Add Item. */
  availableForStock: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type UpdateAdminProductModelPayload = {
  name: string
  brand: string
  series: string
  modelNumber: string
  technicalDescription: string
  usageType: 'industrial' | 'residential'
  imageUrl?: string | null
  availableForStock: boolean
}

export async function getAdminProductModels(): Promise<AdminProductModelRow[]> {
  const res = await fetch(`${API_BASE}/admin/product-models`, {
    headers: authHeaders(),
    cache: 'no-store',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    const body = json as { error?: string; path?: string }
    if (res.status === 404 && body.path) {
      throw new Error(
        `${body.error || 'Rută negăsită pe API'} — path: ${body.path}. Redeploy backend (Railway) sau setează VITE_API_URL la URL-ul API cu /api la final.`,
      )
    }
    throw new Error(body.error || 'Eroare la încărcarea modelelor.')
  }
  const list = Array.isArray(json) ? json : []
  return list.map((row: AdminProductModelRow) => ({
    ...row,
    availableForStock: row.availableForStock !== false,
  }))
}

export type UploadProductTechnicalBrochureResponse = {
  url: string
  key: string
  modelNumber: string
  modelName: string
}

/** Încarcă PDF-ul broșurii tehnice în R2 la `Product Technical Brochures/<nume-model>.pdf` (suprascriere la regenerare). */
export async function uploadAdminProductTechnicalBrochurePdf(
  modelId: string,
  pdfFile: File,
): Promise<UploadProductTechnicalBrochureResponse> {
  const token = getAuthToken()
  if (!token) throw new Error('Trebuie să fii autentificat.')
  const formData = new FormData()
  formData.append('file', pdfFile)
  const res = await fetch(
    `${API_BASE}/admin/product-models/${encodeURIComponent(modelId)}/technical-brochure`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    },
  )
  const json = (await res.json().catch(() => ({}))) as { error?: string } & Partial<UploadProductTechnicalBrochureResponse>
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error(json.error || 'Eroare la încărcarea broșurii PDF.')
  }
  return json as UploadProductTechnicalBrochureResponse
}

/** Generează PDF A4 pentru ofertă comercială (Puppeteer pe server, ca proforma). */
export async function downloadAdminCommercialOfferPdf(params: {
  html: string
  filename: string
  /** Implicit true — la generare din formular (salvare în listă) poate fi false. */
  downloadToBrowser?: boolean
  saveRecord?: {
    buyerType: 'person' | 'company'
    clientLabel: string
    clientEmail?: string
    clientPhone?: string
    amountGross: number
    currency: 'RON' | 'EUR'
    productCount: number
  }
  draftSnapshot?: {
    buyerType: 'person' | 'company'
    clientPerson?: { email: string; telefon: string } | null
    clientCompany?: { contactEmail: string; contactTelefon: string } | null
  } | null
  /** Dacă se generează dintr-o ciornă existentă — actualizează rândul în loc de insert. */
  offerId?: string
}): Promise<void> {
  const token = getAuthToken()
  if (!token) throw new Error('Trebuie să fii autentificat.')
  const res = await fetch(`${API_BASE}/admin/commercial-offer/pdf`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      html: params.html,
      filename: params.filename,
      ...(params.saveRecord ? { saveRecord: params.saveRecord } : {}),
      ...(params.draftSnapshot ? { draftSnapshot: params.draftSnapshot } : {}),
      ...(params.offerId ? { offerId: params.offerId } : {}),
    }),
  })
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string }
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error(json.error || 'Nu s-a putut genera PDF-ul ofertei.')
  }
  if (params.downloadToBrowser === false) {
    await res.arrayBuffer()
    return
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = params.filename.replace(/[^\w.-]+/g, '_') || 'oferta-comerciala.pdf'
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export type AdminCommercialOfferRow = {
  id: string
  createdAt: string
  updatedAt: string
  status: 'draft' | 'generated'
  buyerType: 'person' | 'company'
  clientLabel: string
  clientEmail: string
  clientPhone: string
  amountGross: string
  currency: string
  productCount: number
  pdfUrl: string
}

export type AdminCommercialOfferDetail = AdminCommercialOfferRow & {
  draftSnapshot: unknown
}

export async function getAdminCommercialOffers(): Promise<AdminCommercialOfferRow[]> {
  const res = await fetch(`${API_BASE}/admin/commercial-offers`, {
    headers: authHeaders(),
  })
  const json = (await res.json().catch(() => ({}))) as {
    error?: string
    offers?: AdminCommercialOfferRow[]
  }
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error(json.error || 'Nu s-au putut încărca ofertele.')
  }
  return Array.isArray(json.offers) ? json.offers : []
}

export async function getAdminCommercialOffer(id: string): Promise<AdminCommercialOfferDetail> {
  const res = await fetch(`${API_BASE}/admin/commercial-offers/${encodeURIComponent(id)}`, {
    headers: authHeaders(),
  })
  const json = (await res.json().catch(() => ({}))) as {
    error?: string
    offer?: AdminCommercialOfferDetail
  }
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    if (res.status === 404) throw new Error(json.error || 'Oferta nu a fost găsită.')
    throw new Error(json.error || 'Nu s-a putut încărca oferta.')
  }
  if (!json.offer) throw new Error('Răspuns invalid de la server.')
  return json.offer
}

export async function saveAdminCommercialOfferDraft(params: {
  id?: string
  formSnapshot: {
    version: 1
    kind: 'adminOfferForm'
    form: Record<string, unknown>
  }
  meta: {
    buyerType: 'person' | 'company'
    clientLabel: string
    clientEmail?: string
    clientPhone?: string
    amountGross: number
    currency: 'RON' | 'EUR'
    productCount: number
  }
}): Promise<AdminCommercialOfferRow> {
  const res = await fetch(`${API_BASE}/admin/commercial-offers/draft`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...(params.id ? { id: params.id } : {}),
      formSnapshot: params.formSnapshot,
      meta: params.meta,
    }),
  })
  const json = (await res.json().catch(() => ({}))) as {
    error?: string
    offer?: AdminCommercialOfferRow
  }
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error(json.error || 'Nu s-a putut salva ciorna.')
  }
  if (!json.offer) throw new Error('Răspuns invalid de la server.')
  return json.offer
}

export async function updateAdminProductModel(
  id: string,
  payload: UpdateAdminProductModelPayload,
): Promise<AdminProductModelRow> {
  const res = await fetch(`${API_BASE}/admin/product-models/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    if (res.status === 404) throw new Error((json as { error?: string }).error || 'Model negăsit.')
    throw new Error((json as { error?: string }).error || 'Eroare la salvarea modelului.')
  }
  const row = json as AdminProductModelRow
  return { ...row, availableForStock: row.availableForStock !== false }
}

export async function patchAdminProductModelAvailableForStock(
  id: string,
  availableForStock: boolean,
): Promise<AdminProductModelRow> {
  const res = await fetch(`${API_BASE}/admin/product-models/${encodeURIComponent(id)}/available-for-stock`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ availableForStock }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    if (res.status === 404) throw new Error((json as { error?: string }).error || 'Model negăsit.')
    throw new Error((json as { error?: string }).error || 'Eroare la actualizarea disponibilității.')
  }
  const row = json as AdminProductModelRow
  return { ...row, availableForStock: row.availableForStock !== false }
}

/** One product for admin editor — includes nested JSON (e.g. technicalSpecsModels). */
export async function getAdminProduct(id: string): Promise<AdminProduct> {
  const res = await fetch(`${API_BASE}/admin/products/${encodeURIComponent(id)}`, {
    headers: authHeaders(),
    cache: 'no-store',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la încărcare.')
  return json as AdminProduct
}

export async function updateProductStatus(id: string, status: 'draft' | 'published') {
  const res = await fetch(`${API_BASE}/admin/products/${id}/status`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la actualizare.')
  return json
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json.error || 'Eroare la ștergere.')
  }
}

export async function createProduct(payload: CreateProductPayload, status: 'draft' | 'published') {
  const res = await fetch(`${API_BASE}/admin/products`, {
    method: 'POST',
    headers: authHeaders(),
    cache: 'no-store',
    body: JSON.stringify({ ...payload, status }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.')
    if (res.status === 403) throw new Error('Acces restricționat. Doar administratorii pot crea produse.')
    throw new Error(json.error || 'Eroare la salvarea produsului.')
  }
  return json
}

export async function updateProduct(id: string, payload: CreateProductPayload, status: 'draft' | 'published') {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    cache: 'no-store',
    body: JSON.stringify({ ...payload, status }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.')
    if (res.status === 403) throw new Error('Acces restricționat. Doar administratorii pot actualiza produse.')
    throw new Error(json.error || 'Eroare la actualizare.')
  }
  return json
}

export type AdminInquiry = {
  id: string
  registrationNumber: string | null
  name: string
  company: string
  email: string
  domain: string
  requestType: string
  message: string
  ip: string | null
  isRead: boolean
  createdAt: string
}

export type AdminGuestResidentialOrderRow = {
  orderKind?: string
  id: string
  orderNumber: string
  orderSource: string
  fulfillmentStatus?: OrderFulfillmentStatus | string
  email: string
  phone: string
  lastName: string
  firstName: string
  billAddress: string
  billCounty: string
  billCity: string
  billPostal: string
  deliveryDifferent: boolean
  delAddress: string | null
  delCounty: string | null
  delCity: string | null
  delPostal: string | null
  productId?: string
  productSlug: string | null
  productTitle: string
  quantity: number
  currency: string
  unitPriceInclVat: string | null
  lineTotalInclVat: string | null
  vatPercent: string | null
  createdAt: string
  lines?: ClientOrderLine[]
  lineCount?: number
  orderTotalInclVat?: string | null
  clientInvoiceUrl?: string | null
  /** Proforma PDF încărcată de admin (R2). */
  proformaUrl?: string | null
}

export type AdminOrdersDashboardSummary = {
  newOrders: {
    total: number
    client: number
    partner: number
    guest: number
  }
  /** Număr comenzi (rezidențial + legacy) per fulfillmentStatus. */
  byFulfillmentStatus: Record<string, number>
}

export type AdminServiceDashboardSummary = {
  service: { newOpen: number }
  retur: { newPending: number }
}

export type AdminDashboardSummary = {
  notifications: {
    newOrders: number
    offerDrafts: number
    offersRecent: number
    newLeads: number
    leadsUnreadComments: number
    serviceRequests: number
    returRequests: number
    unreadMessages: number
    partnersPending: number
    newClients: number
  }
  statistics: {
    clients: number
    partners: number
    partnersPending: number
    leads: number
    offersGenerated: number
    agents: number
    newOrders: number
  }
  orders: {
    newOrders: {
      total: number
      client: number
      partner: number
      guest: number
    }
  }
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const res = await fetch(`${API_BASE}/admin/dashboard-summary`, {
    headers: authHeaders(),
    cache: 'no-store',
  })
  const json = (await res.json().catch(() => ({}))) as AdminDashboardSummary & { error?: string }
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error(json.error || 'Eroare la încărcarea dashboard-ului.')
  }
  const n = (json.notifications && typeof json.notifications === 'object'
    ? json.notifications
    : {}) as Partial<AdminDashboardSummary['notifications']>
  const s = (json.statistics && typeof json.statistics === 'object'
    ? json.statistics
    : {}) as Partial<AdminDashboardSummary['statistics']>
  const o = (json.orders?.newOrders && typeof json.orders.newOrders === 'object'
    ? json.orders.newOrders
    : {}) as Partial<AdminDashboardSummary['orders']['newOrders']>
  return {
    notifications: {
      newOrders: Number(n.newOrders) || 0,
      offerDrafts: Number(n.offerDrafts) || 0,
      offersRecent: Number(n.offersRecent) || 0,
      newLeads: Number(n.newLeads) || 0,
      leadsUnreadComments: Number(n.leadsUnreadComments) || 0,
      serviceRequests: Number(n.serviceRequests) || 0,
      returRequests: Number(n.returRequests) || 0,
      unreadMessages: Number(n.unreadMessages) || 0,
      partnersPending: Number(n.partnersPending) || 0,
      newClients: Number(n.newClients) || 0,
    },
    statistics: {
      clients: Number(s.clients) || 0,
      partners: Number(s.partners) || 0,
      partnersPending: Number(s.partnersPending) || 0,
      leads: Number(s.leads) || 0,
      offersGenerated: Number(s.offersGenerated) || 0,
      agents: Number(s.agents) || 0,
      newOrders: Number(s.newOrders) || 0,
    },
    orders: {
      newOrders: {
        total: Number(o.total) || 0,
        client: Number(o.client) || 0,
        partner: Number(o.partner) || 0,
        guest: Number(o.guest) || 0,
      },
    },
  }
}

export async function getAdminServiceDashboardSummary(): Promise<AdminServiceDashboardSummary> {
  const res = await fetch(`${API_BASE}/admin/service-dashboard-summary`, {
    headers: authHeaders(),
    cache: 'no-store',
  })
  const json = (await res.json().catch(() => ({}))) as AdminServiceDashboardSummary & { error?: string }
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error(json.error || 'Eroare la încărcarea statisticilor service.')
  }
  const service = json.service && typeof json.service === 'object' ? json.service : null
  const retur = json.retur && typeof json.retur === 'object' ? json.retur : null
  return {
    service: { newOpen: Number(service?.newOpen) || 0 },
    retur: { newPending: Number(retur?.newPending) || 0 },
  }
}

export async function getAdminOrdersDashboardSummary(): Promise<AdminOrdersDashboardSummary> {
  const res = await fetch(`${API_BASE}/admin/orders-dashboard-summary`, {
    headers: authHeaders(),
    cache: 'no-store',
  })
  const json = (await res.json().catch(() => ({}))) as AdminOrdersDashboardSummary & { error?: string }
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error(json.error || 'Eroare la încărcarea statisticilor comenzi.')
  }
  const newOrders = json.newOrders && typeof json.newOrders === 'object' ? json.newOrders : null
  const byFulfillmentStatus =
    json.byFulfillmentStatus && typeof json.byFulfillmentStatus === 'object' ? json.byFulfillmentStatus : {}
  return {
    newOrders: {
      total: Number(newOrders?.total) || 0,
      client: Number(newOrders?.client) || 0,
      partner: Number(newOrders?.partner) || 0,
      guest: Number(newOrders?.guest) || 0,
    },
    byFulfillmentStatus: Object.fromEntries(
      Object.entries(byFulfillmentStatus).map(([k, v]) => [k, Number(v) || 0]),
    ),
  }
}

export async function getAdminGuestResidentialOrders(): Promise<AdminGuestResidentialOrderRow[]> {
  const res = await fetch(`${API_BASE}/admin/orders`, {
    headers: authHeaders(),
    cache: 'no-store',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    const body = json as { error?: string; path?: string }
    if (res.status === 404 && body.path) {
      throw new Error(
        `${body.error || 'Rută negăsită pe API'} — path: ${body.path}. Redeploy backend (Railway) sau setează VITE_API_URL la URL-ul API cu /api la final.`,
      )
    }
    throw new Error(body.error || 'Eroare la încărcarea comenzilor.')
  }
  return Array.isArray(json) ? json : []
}

export async function patchAdminOrderFulfillmentStatus(
  orderId: string,
  fulfillmentStatus: OrderFulfillmentStatus | string,
  clientInvoice?: File | null,
  proforma?: File | null,
): Promise<{ clientInvoiceUrl?: string | null; proformaUrl?: string | null }> {
  const token = getAuthToken()
  let res: Response
  if (clientInvoice || proforma) {
    const fd = new FormData()
    fd.append('fulfillmentStatus', fulfillmentStatus)
    if (clientInvoice) fd.append('clientInvoice', clientInvoice)
    if (proforma) fd.append('proforma', proforma)
    const h: Record<string, string> = {}
    if (token) h['Authorization'] = `Bearer ${token}`
    res = await fetch(`${API_BASE}/admin/orders/${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      headers: h,
      body: fd,
    })
  } else {
    res = await fetch(`${API_BASE}/admin/orders/${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ fulfillmentStatus }),
    })
  }
  const json = (await res.json().catch(() => ({}))) as {
    error?: string
    clientInvoiceUrl?: string | null
    proformaUrl?: string | null
  }
  if (!res.ok) throw new Error(json.error || 'Eroare la actualizarea statusului.')
  return { clientInvoiceUrl: json.clientInvoiceUrl, proformaUrl: json.proformaUrl }
}

export async function getAdminInquiries(): Promise<AdminInquiry[]> {
  const res = await fetch(`${API_BASE}/admin/inquiries`, { headers: authHeaders() })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la încărcarea mesajelor.')
  return Array.isArray(json) ? json : []
}

export async function getAdminInquiriesUnreadCount(): Promise<number> {
  const res = await fetch(`${API_BASE}/admin/inquiries/unread-count`, { headers: authHeaders() })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) return 0
  return typeof json.count === 'number' ? json.count : 0
}

export async function markInquiryRead(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/inquiries/${id}/read`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare.')
}

export type AdminClientProfile = {
  firstName: string
  lastName: string
  phone: string
  billAddress: string
  billCounty: string
  billCity: string
  billPostal: string
  deliveryDifferent: boolean
  delAddress: string | null
  delCounty: string | null
  delCity: string | null
  delPostal: string | null
  companyName: string
  companyCui: string
  companyAddress: string
  companyCounty: string
  companyCity: string
  companyPostal: string
}

export type AdminClientRow = {
  id: string
  email: string
  referralCode: string | null
  createdAt: string
  updatedAt: string
  emailVerified: boolean
  orderCount: number
  profile: AdminClientProfile | null
}

export async function getAdminClients(): Promise<AdminClientRow[]> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/admin/clients`, { headers: authHeaders() })
  } catch {
    throw new Error('Nu s-a putut conecta la API. Pornește API-ul: cd apps/api && node index.js')
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.')
    if (res.status === 403) throw new Error('Acces restricționat. Doar administratorii pot accesa această pagină.')
    throw new Error(json.error || `Eroare la încărcarea clienților (${res.status})`)
  }
  return Array.isArray(json) ? json : []
}

export type AdminSalesAgent = {
  id: string
  lastName: string
  firstName: string
  phone: string
  whatsapp: string
  email: string
  program: string
  county: string
  city: string
  sector: string
  agentKind: SalesAgentKind
  isSuspended: boolean
  userId?: string | null
  /** Număr parteneri cu assignedSalesAgentId = acest agent. */
  partnerCount?: number
  createdAt: string
  updatedAt: string
}

export function isAdminAgentAssignable(a: AdminSalesAgent): boolean {
  return a.isSuspended !== true
}

export type AdminAgentPartnerCompany = {
  id: string
  companyName: string
  companyCounty: string | null
  companyCity: string | null
  cui: string
  /** Email cont utilizator (companie). */
  companyEmail: string
  /** Comenzi rezidențiale plasate cu acest cont. */
  orderCount: number
}

export type SalesAgentMeResponse = {
  user: {
    id: string
    email: string
    role: string
    firstName: string
    lastName: string
    phone: string
  }
  agent: AdminSalesAgent | null
}

export async function getSalesAgentMe(): Promise<SalesAgentMeResponse> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/sales-agent/me`, { headers: authHeaders() })
  } catch {
    throw new Error('Nu s-a putut conecta la API. Pornește API-ul: cd apps/api && node index.js')
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.')
    if (res.status === 403) throw new Error(json.error || 'Acces restricționat.')
    throw new Error(json.error || `Eroare la încărcarea profilului (${res.status})`)
  }
  return json as SalesAgentMeResponse
}

export type UpdateSalesAgentProfilePayload = {
  lastName: string
  firstName: string
  phone: string
  whatsapp: string
  email: string
  program: string
  county: string
  city: string
  sector: string
}

export async function updateSalesAgentProfile(payload: UpdateSalesAgentProfilePayload): Promise<SalesAgentMeResponse> {
  const res = await fetch(`${API_BASE}/sales-agent/me`, {
    method: 'PATCH',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.')
    if (res.status === 403) throw new Error((json as { error?: string }).error || 'Acces restricționat.')
    throw new Error((json as { error?: string }).error || 'Nu s-au putut salva datele.')
  }
  return json as SalesAgentMeResponse
}

export type SalesLeadRow = {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  email: string
  phone: string
  source: string
  status: 'nou' | 'contactat' | 'oferta' | 'inchis' | 'dead'
  customerType: string
  productLine: string
  monthlyVolume: string
  whatsapp: string
  message: string
  companyName: string
  workEmail: string
  jobTitle: string
  country: string
  website: string
  createdByUserId: string | null
  createdByName: string
  createdByEmail: string
  activityCount: number
  isNew: boolean
  hasUnreadComments: boolean
}

export type SalesLeadActivity = {
  id: string
  createdAt: string
  type: 'comment' | 'status_change'
  comment: string
  fromStatus: string
  toStatus: string
  userId: string
  userName: string
  userEmail: string
}

export type SalesLeadsAudience = 'admin' | 'sales-agent'

export type CreateSalesLeadPayload = {
  name: string
  email?: string
  phone?: string
  source?: string
  status?: SalesLeadRow['status']
  customerType?: string
  productLine?: string
  monthlyVolume?: string
  whatsapp?: string
  message?: string
  companyName?: string
  workEmail?: string
  jobTitle?: string
  country?: string
  website?: string
}

export type SalesLeadStats = {
  totalLeads: number
  yourLeads: number
  contributions: number
}

function salesAgentLeadsApiError(
  res: Response,
  json: { error?: string; path?: string },
  fallback: string,
): Error {
  if (res.status === 401) return new Error('Sesiune expirată.')
  if (res.status === 403) return new Error(json.error || 'Acces restricționat.')
  if (res.status === 404 && json.path) {
    return new Error(
      `${json.error || 'Rută negăsită pe API'} — path: ${json.path}. Backend-ul de producție nu are încă rutele Leads; redeploy API-ul (Railway) cu ultima versiune.`,
    )
  }
  return new Error(json.error || fallback)
}

export async function getSalesAgentLeadStats(): Promise<SalesLeadStats> {
  const res = await fetch(`${API_BASE}/sales-agent/leads/stats`, { headers: authHeaders() })
  const json = (await res.json().catch(() => ({}))) as { error?: string; stats?: SalesLeadStats; path?: string }
  if (!res.ok) {
    throw salesAgentLeadsApiError(res, json, 'Nu s-au putut încărca statisticile leads.')
  }
  const stats = json.stats
  return {
    totalLeads: stats?.totalLeads ?? 0,
    yourLeads: stats?.yourLeads ?? 0,
    contributions: stats?.contributions ?? 0,
  }
}

export async function getSalesAgentLeads(): Promise<SalesLeadRow[]> {
  const res = await fetch(`${API_BASE}/sales-agent/leads`, { headers: authHeaders() })
  const json = (await res.json().catch(() => ({}))) as { error?: string; leads?: SalesLeadRow[]; path?: string }
  if (!res.ok) {
    throw salesAgentLeadsApiError(res, json, 'Nu s-au putut încărca leads.')
  }
  return Array.isArray(json.leads) ? json.leads : []
}

export async function getAdminSalesLeads(): Promise<SalesLeadRow[]> {
  const res = await fetch(`${API_BASE}/admin/leads`, { headers: authHeaders() })
  const json = (await res.json().catch(() => ({}))) as { error?: string; leads?: SalesLeadRow[] }
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.')
    if (res.status === 403) throw new Error(json.error || 'Acces restricționat.')
    throw new Error(json.error || 'Nu s-au putut încărca leads.')
  }
  return Array.isArray(json.leads) ? json.leads : []
}

function salesLeadsApiBase(audience: SalesLeadsAudience): string {
  return audience === 'admin' ? `${API_BASE}/admin/leads` : `${API_BASE}/sales-agent/leads`
}

export async function getSalesLeadActivities(
  leadId: string,
  audience: SalesLeadsAudience,
): Promise<SalesLeadActivity[]> {
  const id = String(leadId || '').trim()
  if (!id) throw new Error('ID lead lipsă.')
  const res = await fetch(`${salesLeadsApiBase(audience)}/${encodeURIComponent(id)}/activities`, {
    headers: authHeaders(),
  })
  const json = (await res.json().catch(() => ({}))) as { error?: string; activities?: SalesLeadActivity[] }
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error(json.error || 'Acces restricționat.')
    if (res.status === 404) throw new Error(json.error || 'Lead negăsit.')
    throw new Error(json.error || 'Nu s-au putut încărca comentariile.')
  }
  return Array.isArray(json.activities) ? json.activities : []
}

export async function postSalesLeadComment(
  leadId: string,
  comment: string,
  audience: SalesLeadsAudience,
): Promise<SalesLeadActivity> {
  const id = String(leadId || '').trim()
  const text = String(comment || '').trim()
  if (!id) throw new Error('ID lead lipsă.')
  if (!text) throw new Error('Comentariul este obligatoriu.')
  const res = await fetch(`${salesLeadsApiBase(audience)}/${encodeURIComponent(id)}/comments`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comment: text }),
  })
  const json = (await res.json().catch(() => ({}))) as { error?: string; activity?: SalesLeadActivity }
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error(json.error || 'Acces restricționat.')
    if (res.status === 404) throw new Error(json.error || 'Lead negăsit.')
    throw new Error(json.error || 'Nu s-a putut salva comentariul.')
  }
  if (!json.activity) throw new Error('Răspuns invalid de la server.')
  return json.activity
}

export async function markSalesLeadViewed(leadId: string, audience: SalesLeadsAudience): Promise<SalesLeadRow> {
  const id = String(leadId || '').trim()
  if (!id) throw new Error('ID lead lipsă.')
  const res = await fetch(`${salesLeadsApiBase(audience)}/${encodeURIComponent(id)}/viewed`, {
    method: 'POST',
    headers: authHeaders(),
  })
  const json = (await res.json().catch(() => ({}))) as { error?: string; lead?: SalesLeadRow }
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error(json.error || 'Acces restricționat.')
    if (res.status === 404) throw new Error(json.error || 'Lead negăsit.')
    throw new Error(json.error || 'Nu s-a putut marca lead-ul.')
  }
  if (!json.lead) throw new Error('Răspuns invalid de la server.')
  return json.lead
}

export async function markSalesLeadCommentsSeen(
  leadId: string,
  audience: SalesLeadsAudience,
): Promise<SalesLeadRow> {
  const id = String(leadId || '').trim()
  if (!id) throw new Error('ID lead lipsă.')
  const res = await fetch(`${salesLeadsApiBase(audience)}/${encodeURIComponent(id)}/comments-seen`, {
    method: 'POST',
    headers: authHeaders(),
  })
  const json = (await res.json().catch(() => ({}))) as { error?: string; lead?: SalesLeadRow }
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error(json.error || 'Acces restricționat.')
    if (res.status === 404) throw new Error(json.error || 'Lead negăsit.')
    throw new Error(json.error || 'Nu s-a putut marca comentariile.')
  }
  if (!json.lead) throw new Error('Răspuns invalid de la server.')
  return json.lead
}

export async function patchSalesLeadStatus(
  leadId: string,
  status: SalesLeadRow['status'],
  audience: SalesLeadsAudience,
): Promise<SalesLeadRow> {
  const id = String(leadId || '').trim()
  if (!id) throw new Error('ID lead lipsă.')
  const res = await fetch(`${salesLeadsApiBase(audience)}/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })
  const json = (await res.json().catch(() => ({}))) as { error?: string; lead?: SalesLeadRow }
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error(json.error || 'Acces restricționat.')
    if (res.status === 404) throw new Error(json.error || 'Lead negăsit.')
    throw new Error(json.error || 'Nu s-a putut actualiza statusul.')
  }
  if (!json.lead) throw new Error('Răspuns invalid de la server.')
  return json.lead
}

export async function createAdminLead(payload: CreateSalesLeadPayload): Promise<SalesLeadRow> {
  const res = await fetch(`${API_BASE}/admin/leads`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const json = (await res.json().catch(() => ({}))) as { error?: string; lead?: SalesLeadRow }
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.')
    if (res.status === 403) throw new Error(json.error || 'Acces restricționat.')
    throw new Error(json.error || 'Nu s-a putut crea lead-ul.')
  }
  if (!json.lead) throw new Error('Răspuns invalid de la server.')
  return json.lead
}

export async function createSalesAgentLead(payload: CreateSalesLeadPayload): Promise<SalesLeadRow> {
  const res = await fetch(`${API_BASE}/sales-agent/leads`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const json = (await res.json().catch(() => ({}))) as { error?: string; lead?: SalesLeadRow; path?: string }
  if (!res.ok) {
    throw salesAgentLeadsApiError(res, json, 'Nu s-a putut crea lead-ul.')
  }
  if (!json.lead) throw new Error('Răspuns invalid de la server.')
  return json.lead
}

export async function getAdminAgents(): Promise<AdminSalesAgent[]> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/admin/agents`, { headers: authHeaders() })
  } catch {
    throw new Error('Nu s-a putut conecta la API. Pornește API-ul: cd apps/api && node index.js')
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.')
    if (res.status === 403) throw new Error('Acces restricționat. Doar administratorii pot accesa această pagină.')
    throw new Error(json.error || `Eroare la încărcarea agenților (${res.status})`)
  }
  return Array.isArray(json) ? json : []
}

export async function getAdminAgentPartners(agentId: string): Promise<AdminAgentPartnerCompany[]> {
  const id = String(agentId || '').trim()
  if (!id) throw new Error('ID agent lipsă.')
  let res: Response
  try {
    res = await fetch(`${API_BASE}/admin/agents/${encodeURIComponent(id)}/partners`, {
      headers: authHeaders(),
    })
  } catch {
    throw new Error('Nu s-a putut conecta la API. Pornește API-ul: cd apps/api && node index.js')
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.')
    if (res.status === 403) throw new Error('Acces restricționat. Doar administratorii pot accesa această pagină.')
    throw new Error((json as { error?: string }).error || `Eroare la încărcarea partenerilor (${res.status})`)
  }
  return Array.isArray(json) ? json : []
}

export type CreateAdminAgentPayload = {
  lastName: string
  firstName: string
  phone: string
  whatsapp: string
  email: string
  program: string
  county: string
  city: string
  sector: string
  agentKind: SalesAgentKind
}

export type UpdateAdminAgentPayload = CreateAdminAgentPayload

export async function createAdminAgent(payload: CreateAdminAgentPayload): Promise<AdminSalesAgent> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/admin/agents`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error('Nu s-a putut conecta la API. Pornește API-ul: cd apps/api && node index.js')
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.')
    if (res.status === 403) throw new Error('Acces restricționat. Doar administratorii pot accesa această pagină.')
    throw new Error((json as { error?: string }).error || `Eroare la crearea agentului (${res.status})`)
  }
  return json as AdminSalesAgent
}

export async function updateAdminAgent(id: string, payload: UpdateAdminAgentPayload): Promise<AdminSalesAgent> {
  const agentId = String(id || '').trim()
  if (!agentId) throw new Error('ID agent lipsă.')
  let res: Response
  try {
    res = await fetch(`${API_BASE}/admin/agents/${encodeURIComponent(agentId)}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error('Nu s-a putut conecta la API. Pornește API-ul: cd apps/api && node index.js')
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.')
    if (res.status === 403) throw new Error('Acces restricționat. Doar administratorii pot accesa această pagină.')
    throw new Error((json as { error?: string }).error || `Eroare la actualizarea agentului (${res.status})`)
  }
  return json as AdminSalesAgent
}

export async function suspendAdminAgent(id: string, suspended: boolean): Promise<AdminSalesAgent> {
  const agentId = String(id || '').trim()
  if (!agentId) throw new Error('ID agent lipsă.')
  let res: Response
  try {
    res = await fetch(`${API_BASE}/admin/agents/${encodeURIComponent(agentId)}/suspend`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ suspended }),
    })
  } catch {
    throw new Error('Nu s-a putut conecta la API. Pornește API-ul: cd apps/api && node index.js')
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.')
    if (res.status === 403) throw new Error('Acces restricționat. Doar administratorii pot accesa această pagină.')
    throw new Error((json as { error?: string }).error || `Eroare la suspendare (${res.status})`)
  }
  return json as AdminSalesAgent
}

export async function deleteAdminAgent(id: string): Promise<void> {
  const agentId = String(id || '').trim()
  if (!agentId) throw new Error('ID agent lipsă.')
  let res: Response
  try {
    res = await fetch(`${API_BASE}/admin/agents/${encodeURIComponent(agentId)}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
  } catch {
    throw new Error('Nu s-a putut conecta la API. Pornește API-ul: cd apps/api && node index.js')
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.')
    if (res.status === 403) throw new Error('Acces restricționat. Doar administratorii pot accesa această pagină.')
    throw new Error((json as { error?: string }).error || `Eroare la ștergerea agentului (${res.status})`)
  }
}

/** Șterge un cont client din admin (testare). */
export async function deleteAdminClient(userId: string): Promise<void> {
  const id = String(userId || '').trim()
  if (!id) throw new Error('ID lipsă.')
  let res: Response
  try {
    res = await fetch(`${API_BASE}/admin/clients/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
  } catch {
    throw new Error('Nu s-a putut conecta la API. Pornește API-ul: cd apps/api && node index.js')
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.')
    if (res.status === 403) throw new Error('Acces restricționat. Doar administratorii pot șterge clienți.')
    throw new Error(json.error || `Eroare la ștergere (${res.status})`)
  }
}

export async function getAdminCompany(id: string): Promise<AdminCompany> {
  const pid = String(id || '').trim()
  if (!pid) throw new Error('ID companie lipsă.')
  let res: Response
  try {
    res = await fetch(`${API_BASE}/admin/companies/${encodeURIComponent(pid)}`, {
      headers: authHeaders(),
    })
  } catch {
    throw new Error('Nu s-a putut conecta la API. Pornește API-ul: cd apps/api && node index.js')
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.')
    if (res.status === 403) throw new Error('Acces restricționat. Doar administratorii pot accesa această pagină.')
    throw new Error((json as { error?: string }).error || `Eroare la încărcarea companiei (${res.status})`)
  }
  return json as AdminCompany
}

export async function getAdminCompanies(): Promise<AdminCompany[]> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/admin/companies`, { headers: authHeaders() })
  } catch (err) {
    throw new Error('Nu s-a putut conecta la API. Pornește API-ul: cd apps/api && node index.js')
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.')
    if (res.status === 403) throw new Error('Acces restricționat. Doar administratorii pot accesa această pagină.')
    if (res.status === 502 || res.status === 503) throw new Error('API-ul nu răspunde. Pornește API-ul cu: npm run dev:api')
    const detail = json.path ? ` (path: ${json.path})` : ''
    throw new Error((json.error || `Eroare la încărcarea companiilor (${res.status})`) + detail)
  }
  return Array.isArray(json) ? json : []
}

export type DepartmentPhoneKey = 'general' | 'rezidential' | 'industrial' | 'medical' | 'maritim'

export type DepartmentPhoneRow = {
  department: DepartmentPhoneKey
  phone: string
  whatsapp: string
}

/** Date publice pentru link-uri tel / WhatsApp (fără auth). */
export async function getPublicDepartmentPhones(): Promise<DepartmentPhoneRow[]> {
  try {
    const res = await fetch(`${API_BASE}/department-phones`, { headers: publicFetchHeaders() })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) return []
    return Array.isArray(json) ? json : []
  } catch {
    return []
  }
}

export async function getAdminDepartmentPhones(): Promise<DepartmentPhoneRow[]> {
  const res = await fetch(`${API_BASE}/admin/department-phones`, { headers: authHeaders() })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = typeof json.error === 'string' ? json.error : 'Eroare la încărcarea numerelor de telefon.'
    if (res.status === 404) {
      const p = typeof json.path === 'string' ? json.path : ''
      throw new Error(
        `${msg}${p ? ` (${p})` : ''} — API-ul de producție pare fără această rută; redeploy backend (Railway) cu ultimul cod și rulează migrarea Prisma pentru DepartmentPhone.`
      )
    }
    throw new Error(msg)
  }
  return Array.isArray(json) ? json : []
}

export async function saveAdminDepartmentPhones(rows: DepartmentPhoneRow[]): Promise<DepartmentPhoneRow[]> {
  const res = await fetch(`${API_BASE}/admin/department-phones`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(rows),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la salvare.')
  return Array.isArray(json) ? json : []
}

export async function getCatalogCurrency(): Promise<{ currency: CatalogCurrencyCode }> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/catalog-currency`)
  } catch {
    throw new Error('Nu s-a putut conecta la API.')
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(typeof json.error === 'string' ? json.error : 'Eroare la încărcarea monedei.')
  return { currency: normalizeCatalogCurrencyCode(json.currency) }
}

export async function getAdminCatalogCurrency(): Promise<{ currency: CatalogCurrencyCode }> {
  const res = await fetch(`${API_BASE}/admin/catalog-currency`, { headers: authHeaders() })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = typeof json.error === 'string' ? json.error : 'Eroare la încărcarea monedei.'
    throw new Error(msg)
  }
  return { currency: normalizeCatalogCurrencyCode(json.currency) }
}

export async function saveAdminCatalogCurrency(currency: CatalogCurrencyCode): Promise<{ currency: CatalogCurrencyCode }> {
  const res = await fetch(`${API_BASE}/admin/catalog-currency`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ currency }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(typeof json.error === 'string' ? json.error : 'Eroare la salvare.')
  return { currency: normalizeCatalogCurrencyCode(json.currency) }
}

/** Stored as RON / EUR / USD (API normalizes EURO → EUR). */
export type CompanyBankCurrency = 'RON' | 'EUR' | 'USD'

export type CompanyBankAccount = {
  id: string
  bankName: string
  iban: string
  swift: string
  accountName: string
  currency: CompanyBankCurrency
}

function normalizeCompanyBankCurrency(raw: unknown): CompanyBankCurrency {
  const s = String(raw ?? '')
    .trim()
    .toUpperCase()
  if (s === 'USD') return 'USD'
  if (s === 'EUR' || s === 'EURO') return 'EUR'
  return 'RON'
}

export type AdminCompanyData = {
  name: string
  cui: string
  address: string
  representativeName: string
  bankAccounts: CompanyBankAccount[]
}

function normalizeAdminCompanyData(json: unknown): AdminCompanyData {
  if (!json || typeof json !== 'object') {
    return { name: 'Baterino SRL', cui: '', address: '', representativeName: '', bankAccounts: [] }
  }
  const o = json as Record<string, unknown>
  const rawAccounts = Array.isArray(o.bankAccounts) ? o.bankAccounts : []
  const bankAccounts: CompanyBankAccount[] = rawAccounts.slice(0, 20).map((a) => {
    const row = a && typeof a === 'object' ? (a as Record<string, unknown>) : {}
    const ibanRaw = row.iban ?? row.IBAN
    const swiftRaw = row.swift ?? row.SWIFT ?? row.bic ?? row.BIC
    return {
      id: typeof row.id === 'string' && row.id.trim() ? row.id.trim() : crypto.randomUUID(),
      bankName: typeof row.bankName === 'string' ? row.bankName : '',
      iban: typeof ibanRaw === 'string' ? ibanRaw : '',
      swift: typeof swiftRaw === 'string' ? swiftRaw : '',
      accountName: typeof row.accountName === 'string' ? row.accountName : '',
      currency: normalizeCompanyBankCurrency(row.currency),
    }
  })
  return {
    name: typeof o.name === 'string' ? o.name : '',
    cui: typeof o.cui === 'string' ? o.cui : '',
    address: typeof o.address === 'string' ? o.address : '',
    representativeName: typeof o.representativeName === 'string' ? o.representativeName : '',
    bankAccounts,
  }
}

export async function getAdminCompanyData(): Promise<AdminCompanyData> {
  const res = await fetch(`${API_BASE}/admin/company-data`, { headers: authHeaders() })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = typeof json.error === 'string' ? json.error : 'Eroare la încărcarea datelor companiei.'
    throw new Error(msg)
  }
  return normalizeAdminCompanyData(json)
}

export async function saveAdminCompanyData(data: AdminCompanyData): Promise<AdminCompanyData> {
  const res = await fetch(`${API_BASE}/admin/company-data`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(typeof json.error === 'string' ? json.error : 'Eroare la salvare.')
  return normalizeAdminCompanyData(json)
}
