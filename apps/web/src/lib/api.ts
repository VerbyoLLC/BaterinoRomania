import type { ReducereProgram } from '../i18n/reduceri'
import type { LangCode } from '../i18n/menu'

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

const API_BASE = resolveApiBase()

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
  billAddress: string
  billCounty: string
  billCity: string
  billPostal: string
  differentDeliveryAddress: boolean
  delAddress?: string
  delCounty?: string
  delCity?: string
  delPostal?: string
}

export type GuestResidentialOrderResponse = {
  orderNumber: string
  /** ID rând Prisma — folosit în R2 la prefixul `orders/{orderId}/`. */
  orderId?: string
  email: string
  /** Aliniat cu DB: guest | client */
  orderSource?: 'guest' | 'client'
  message?: string
}

export async function submitGuestResidentialOrder(
  payload: GuestResidentialOrderPayload,
): Promise<GuestResidentialOrderResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getAuthToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const body: Record<string, unknown> = {
    email: payload.email,
    phone: payload.phone,
    nume: payload.nume,
    prenume: payload.prenume,
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
    orderSource: src === 'client' || src === 'guest' ? src : undefined,
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
  documenteTehnice?: { descriere: string; url: string }[]
  technicalSpecsModels?: CreateProductPayload['technicalSpecsModels']
  images: string[]
  salePrice?: string | number | null
  landedPrice?: string | number | null
  vat?: string | number | null
  /** hidden | public | partner_only */
  priceVisibility?: 'hidden' | 'public' | 'partner_only'
  /** simple | detailed (UI only) */
  pricePresentation?: 'simple' | 'detailed'
  /** Rezidențial: etichetă în colțul imaginii pe card catalog */
  catalogStockStatus?: 'in_stock' | 'out_of_stock' | 'coming_soon' | null
  /** Rezidențial: id-uri programe reducere (CMS); gol = toate programele în dropdown (comportament vechi) */
  reducereProgramIds?: string[]
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

/** Public catalog / Home: VAT-inclusive price for residential cards when `priceVisibility` is public. */
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

export type CatalogStockStatus = 'in_stock' | 'out_of_stock' | 'coming_soon'

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

/** Un singur produs publicat (fără auth). Acceptă id sau slug pentru SEO. */
export async function getProduct(idOrSlug: string): Promise<PublicProduct> {
  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(idOrSlug)}`, {
    headers: publicFetchHeaders(),
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
): Promise<SignupResponse> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role, ...(nextPath ? { next: nextPath } : {}) }),
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

/** Verificare înregistrare cu cod din 4 cifre (client / partener). */
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

export async function googleAuth(
  idToken: string,
  role: 'client' | 'partener',
): Promise<{ token: string; user: AuthUser; needsPartnerProfile?: boolean }> {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, role }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Eroare la autentificare cu Google.')
  return data as { token: string; user: AuthUser; needsPartnerProfile?: boolean }
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
}

export type ClientProfileDto = ClientProfilePayload

export type ClientProfileSaveSection = 'personal' | 'address'

export async function getClientProfile(): Promise<{
  email: string
  referralCode: string | null
  profile: ClientProfileDto | null
}> {
  const res = await fetch(`${API_BASE}/client/profile`, { headers: authHeaders(), cache: 'no-store' })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesiune expirată.')
    if (res.status === 403) throw new Error('Acces restricționat.')
    throw new Error((json as { error?: string }).error || 'Eroare.')
  }
  return json as { email: string; referralCode: string | null; profile: ClientProfileDto | null }
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

export async function postClientChangeEmail(
  newEmail: string,
  currentPassword: string,
): Promise<{ token: string; email: string }> {
  const res = await fetch(`${API_BASE}/client/change-email`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ newEmail: newEmail.trim(), currentPassword }),
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
  vatPercent: string | null
  /** Populated by API from catalog (card / first image). */
  imageUrl?: string | null
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

export async function cancelClientOrder(orderId: string): Promise<{ fulfillmentStatus: string }> {
  const res = await fetch(`${API_BASE}/client/orders/${encodeURIComponent(orderId)}/cancel`, {
    method: 'POST',
    headers: authHeaders(),
  })
  const json = (await res.json().catch(() => ({}))) as { error?: string; fulfillmentStatus?: string }
  if (!res.ok) throw new Error(json.error || 'Nu am putut anula comanda.')
  return { fulfillmentStatus: String(json.fulfillmentStatus || 'anulata') }
}

/** Descarcă HTML proformă (print → PDF din browser). */
export async function downloadClientOrderProforma(orderId: string, orderNumber: string): Promise<void> {
  const res = await fetch(`${API_BASE}/client/orders/${encodeURIComponent(orderId)}/proforma`, {
    headers: authHeaders(),
  })
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(json.error || 'Nu am putut genera proforma.')
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `proforma-${orderNumber.replace(/[^\w.-]+/g, '_')}.html`
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
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

export function getAuthRole(): 'admin' | 'client' | 'partener' | null {
  const token = getAuthToken()
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { role?: string }
    const r = payload.role
    if (r === 'admin' || r === 'client' || r === 'partener') return r
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
  isPublic?: boolean
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

export async function getPartnerProfile() {
  const res = await fetch(`${API_BASE}/partner/profile`, {
    headers: authHeaders(),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la citirea profilului.')
  return json
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

/** Șterge definitiv contul client (necesită parola curentă). Comenzile rămân în sistem fără legătură la cont. */
export async function deleteClientAccount(currentPassword: string) {
  const res = await fetch(`${API_BASE}/client/account`, {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword }),
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
  logoUrl: string | null
  isPublic: boolean
  isSuspended: boolean
  isApproved: boolean
  partnerDiscountPercent: number | null
  createdAt: string
  user: { email: string }
}

export async function approveAdminCompany(id: string): Promise<AdminCompany> {
  const res = await fetch(`${API_BASE}/admin/companies/${id}/approve`, {
    method: 'PATCH',
    headers: authHeaders(),
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

/** Profilul public e complet când partenerul a completat câmpurile obligatorii. */
export function isPublicProfileComplete(c: AdminCompany): boolean {
  return !!(
    c.publicName?.trim() &&
    c.street?.trim() &&
    c.county?.trim() &&
    c.city?.trim() &&
    c.description?.trim() &&
    (c.services?.trim() || c.publicPhone?.trim())
  )
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
  catalogStockStatus?: 'in_stock' | 'out_of_stock' | 'coming_soon' | null
  reducereProgramIds?: string[]
  landedPrice: string | number
  salePrice: string | number
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
  alimentaModalContent?: { title: string; intro?: string; sections: Array<{ label: string; items: string[] }> } | null
  /** Specificații tehnice șablon industrial: fiecare intrare = un model + toate câmpurile */
  technicalSpecsModels?: {
    entries: Array<{ modelName: string; specs: Record<string, string> }>
  } | null
}

export async function uploadAdminFile(file: File, productFolder?: string, imageIndex?: number): Promise<{ url: string }> {
  const token = getAuthToken()
  if (!token) throw new Error('Trebuie să fii autentificat.')
  const formData = new FormData()
  const folder = productFolder || 'produs'
  formData.append('folder', folder)
  if (imageIndex != null) formData.append('imageIndex', String(imageIndex))
  formData.append('file', file)
  const params = new URLSearchParams({ folder })
  if (imageIndex != null) params.set('imageIndex', String(imageIndex))
  const uploadUrl = `${API_BASE}/admin/upload?${params}`
  // Only Authorization here: header values must be ISO-8859-1; product titles may contain UTF-8 (e.g. Romanian).
  // Folder and imageIndex are already in the query string and FormData; the API reads those.
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la încărcarea fișierului.')
  return json
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
): Promise<{ clientInvoiceUrl?: string | null }> {
  const token = getAuthToken()
  let res: Response
  if (clientInvoice) {
    const fd = new FormData()
    fd.append('fulfillmentStatus', fulfillmentStatus)
    fd.append('clientInvoice', clientInvoice)
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
  }
  if (!res.ok) throw new Error(json.error || 'Eroare la actualizarea statusului.')
  return { clientInvoiceUrl: json.clientInvoiceUrl }
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

export type CompanyBankAccount = {
  id: string
  bankName: string
  iban: string
  swift: string
  accountName: string
}

export type AdminCompanyData = {
  name: string
  cui: string
  address: string
  bankAccounts: CompanyBankAccount[]
}

function normalizeAdminCompanyData(json: unknown): AdminCompanyData {
  if (!json || typeof json !== 'object') {
    return { name: 'Baterino SRL', cui: '', address: '', bankAccounts: [] }
  }
  const o = json as Record<string, unknown>
  const rawAccounts = Array.isArray(o.bankAccounts) ? o.bankAccounts : []
  const bankAccounts: CompanyBankAccount[] = rawAccounts.slice(0, 20).map((a) => {
    const row = a && typeof a === 'object' ? (a as Record<string, unknown>) : {}
    return {
      id: typeof row.id === 'string' && row.id.trim() ? row.id.trim() : crypto.randomUUID(),
      bankName: typeof row.bankName === 'string' ? row.bankName : '',
      iban: typeof row.iban === 'string' ? row.iban : '',
      swift: typeof row.swift === 'string' ? row.swift : '',
      accountName: typeof row.accountName === 'string' ? row.accountName : '',
    }
  })
  return {
    name: typeof o.name === 'string' ? o.name : '',
    cui: typeof o.cui === 'string' ? o.cui : '',
    address: typeof o.address === 'string' ? o.address : '',
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
