import { normalizeIndustrialTechnicalSpecs, type IndustrialModelSpecEntry } from './industrialTechnicalSpec'

/**
 * Server (Server Components / route handlers): absolute Railway URL from `API_URL`.
 * Client (browser): relative `/api`, rewritten to Railway by next.config.ts.
 */
function resolveApiBase(): string {
  if (typeof window === 'undefined') {
    const envRaw = process.env.API_URL
    if (envRaw && envRaw.trim()) {
      let base = envRaw.trim().replace(/\/+$/, '')
      if (base.endsWith('/admin')) base = base.slice(0, -6)
      if (/^https?:\/\//i.test(base) && !/\/api$/i.test(base)) base = `${base}/api`
      return base
    }
    return 'http://localhost:3005/api'
  }
  return '/api'
}

export const API_BASE = resolveApiBase()

function notifyAuthChanged() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('baterino-auth-change'))
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
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
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth_token')
  notifyAuthChanged()
}

function publicFetchHeaders(): HeadersInit {
  const h: Record<string, string> = {}
  const token = getAuthToken()
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

// ── Products / catalog ──────────────────────────────────────────────────

export function getProductCardImageUrl(
  product: Pick<PublicProduct, 'images'> & { cardImage?: string | null },
): string {
  const card = String(product.cardImage ?? '').trim()
  if (card) return card
  const imgs = Array.isArray(product.images) ? product.images : []
  return imgs[0] || '/images/shared/HP2000-all-in-one.webp'
}

export type ProductCategory = {
  id: string
  slug: string
  name: string
  order: number
  createdAt: string
}

export type PublicProduct = {
  id: string
  slug?: string | null
  title: string
  tipProdus: 'rezidential' | 'industrial'
  categorie?: string | null
  categoryId?: string | null
  category?: ProductCategory | null
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
  technicalSpecsModels?: unknown
  images: string[]
  salePrice?: string | number | null
  mapPrice?: string | number | null
  landedPrice?: string | number | null
  vat?: string | number | null
  priceVisibility?: 'hidden' | 'public' | 'partner_only'
  pricePresentation?: 'simple' | 'detailed'
  catalogStockStatus?: 'in_stock' | 'out_of_stock' | 'coming_soon' | 'on_order' | null
  catalogDeliveryBadge?: '24h' | '48h' | '7_14d' | '60d' | null
  catalogTransportBadge?: 'free' | 'paid' | null
  catalogInstallBadge?: 'baterino' | 'partner' | null
  reducereProgramIds?: string[]
  promovarePeContPartener?: boolean
  promovarePromotie?: boolean
  tensiuneNominala?: string | null
  locatieMontaj?: string | null
  capacitate?: string | null
  compozitie?: string | null
  cicluriDescarcare?: string | null
  conectivitateWifi?: boolean
  conectivitateBluetooth?: boolean
  energieNominala?: string | null
  garantie?: string | null
  [key: string]: unknown
}

export function isPromoCatalogProduct(product: Pick<PublicProduct, 'promovarePromotie'>): boolean {
  return product.promovarePromotie === true
}

export function isPartnerAccountPromotedProduct(
  product: Pick<PublicProduct, 'promovarePeContPartener'>,
): boolean {
  return product.promovarePeContPartener === true
}

export function getPublicCatalogProductHref(
  product: Pick<PublicProduct, 'id' | 'slug' | 'category'>,
): string {
  return `/produse/${[product.category?.slug, product.slug || product.id].filter(Boolean).join('/')}`
}

/** Public catalog cards: partners open „Partener” products in `/partner/produse` (preț + coș). */
export function getCatalogProductHrefForViewer(
  product: Pick<PublicProduct, 'id' | 'slug' | 'category' | 'promovarePeContPartener' | 'promovarePromotie'>,
  viewerRole?: 'admin' | 'client' | 'partener' | 'sales_agent' | null,
): string {
  if (
    viewerRole === 'partener' &&
    isPartnerAccountPromotedProduct(product) &&
    !isPromoCatalogProduct(product)
  ) {
    return `/partner/produse?detail=${encodeURIComponent(product.id)}`
  }
  return getPublicCatalogProductHref(product)
}

function trimCatalogSpecPart(v: unknown): string | undefined {
  if (v == null) return undefined
  const s = String(v).trim()
  return s || undefined
}

function pickIndustrialCatalogModelEntry(entries: IndustrialModelSpecEntry[]): IndustrialModelSpecEntry | undefined {
  let best: IndustrialModelSpecEntry | undefined
  let bestKwh = -1
  for (const entry of entries) {
    const hasSpecs = Object.values(entry.specs || {}).some((v) => String(v).trim())
    if (!entry.modelName && !hasSpecs) continue
    const energy = entry.specs?.nominalEnergy
    const match = String(energy ?? '').match(/([\d.,]+)\s*kWh/i)
    const kwh = match ? parseFloat(match[1].replace(',', '.')) : 0
    if (kwh > bestKwh) {
      bestKwh = kwh
      best = entry
    } else if (!best) {
      best = entry
    }
  }
  return best
}

function getIndustrialCatalogProductSpecLines(product: PublicProduct): { specLine1: string; specLine2: string } {
  const data = normalizeIndustrialTechnicalSpecs(product.technicalSpecsModels)
  const entry = data?.entries?.length ? pickIndustrialCatalogModelEntry(data.entries) : undefined

  if (entry?.specs) {
    const s = entry.specs
    const line1Parts = [
      trimCatalogSpecPart(s.nominalVoltage),
      trimCatalogSpecPart(s.nominalCapacity),
      trimCatalogSpecPart(s.chemistry),
    ].filter(Boolean) as string[]
    const line2Parts = [
      trimCatalogSpecPart(s.maxOutputPower),
      trimCatalogSpecPart(s.coolingMethod),
      trimCatalogSpecPart(s.cycleLife),
    ].filter(Boolean) as string[]
    return {
      specLine1: line1Parts.length > 0 ? line1Parts.join(' · ') : '—',
      specLine2: line2Parts.length > 0 ? line2Parts.join(' · ') : '—',
    }
  }

  const specLine1 =
    [product.tensiuneNominala, product.capacitate, product.compozitie].filter(Boolean).join(' · ') || '—'
  const specLine2 = [product.cicluriDescarcare, product.garantie].filter(Boolean).join(' · ') || '—'
  return { specLine1, specLine2 }
}

export function getCatalogProductSpecLines(product: PublicProduct): { specLine1: string; specLine2: string } {
  if (product.tipProdus === 'industrial') {
    return getIndustrialCatalogProductSpecLines(product)
  }
  const conectivitate =
    [product.conectivitateWifi && 'WiFi', product.conectivitateBluetooth && 'Bluetooth']
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

export const CATALOG_CURRENCY_CODES = ['EUR', 'RON', 'IDR', 'MYR', 'PHP', 'USD'] as const
export type CatalogCurrencyCode = (typeof CATALOG_CURRENCY_CODES)[number]

export function normalizeCatalogCurrencyCode(v: unknown): CatalogCurrencyCode {
  const s = String(v ?? '').trim().toUpperCase()
  return (CATALOG_CURRENCY_CODES as readonly string[]).includes(s) ? (s as CatalogCurrencyCode) : 'RON'
}

export function formatResidentialCatalogPriceDisplay(
  product: PublicProduct,
  langCode: string,
  currencySuffix: string = 'RON',
): string | null {
  const vis = (product.priceVisibility as string) || 'public'
  if (vis !== 'public') return null
  const sale = catalogNum(product.salePrice)
  if (sale == null || sale <= 0) return null
  const vat = catalogNum(product.vat)
  const unit = vat != null && vat > 0 ? sale * (1 + vat / 100) : sale
  const locale = langCode === 'en' ? 'en-GB' : 'ro-RO'
  return `${Math.round(unit).toLocaleString(locale, { maximumFractionDigits: 0 })} ${currencySuffix}`
}

export function formatResidentialCatalogNetPriceDisplay(
  product: PublicProduct,
  langCode: string,
  currencySuffix: string = 'RON',
): string | null {
  const vis = (product.priceVisibility as string) || 'public'
  if (vis !== 'public') return null
  const sale = catalogNum(product.salePrice)
  if (sale == null || sale <= 0) return null
  const locale = langCode === 'en' ? 'en-GB' : 'ro-RO'
  return `${Math.round(sale).toLocaleString(locale, { maximumFractionDigits: 0 })} ${currencySuffix}`
}

export type CatalogStockStatus = 'in_stock' | 'out_of_stock' | 'coming_soon' | 'on_order'

export function residentialProductStockUnavailable(
  product: Pick<PublicProduct, 'tipProdus' | 'catalogStockStatus'>,
): boolean {
  if (String(product.tipProdus || '').toLowerCase() !== 'rezidential') return false
  const s = product.catalogStockStatus as CatalogStockStatus | undefined | null
  return s === 'out_of_stock' || s === 'coming_soon'
}

export function residentialCatalogUsesPartnerPriceCta(product: PublicProduct): boolean {
  if (String(product.tipProdus || '').toLowerCase() === 'industrial') return false
  if (residentialProductStockUnavailable(product)) return false
  const vis = (product.priceVisibility as string) || 'public'
  return vis === 'partner_only' || vis === 'hidden'
}

/** Catalog listing: product has a public RRP shown on cards (not quote-on-request / partner-only). */
export function catalogProductHasRrp(product: PublicProduct): boolean {
  if (residentialProductStockUnavailable(product)) return false
  if (
    String(product.tipProdus || '').toLowerCase() !== 'industrial' &&
    residentialCatalogUsesPartnerPriceCta(product)
  ) {
    return false
  }
  const vis = (product.priceVisibility as string) || 'public'
  if (vis !== 'public') return false
  const sale = catalogNum(product.salePrice)
  return sale != null && sale > 0
}

export function catalogProductShowsPublicPrice(
  product: PublicProduct,
  langCode: string,
  currencySuffix: string = 'RON',
): boolean {
  if (residentialProductStockUnavailable(product)) return false
  if (
    String(product.tipProdus || '').toLowerCase() !== 'industrial' &&
    residentialCatalogUsesPartnerPriceCta(product)
  ) {
    return false
  }
  const price = formatResidentialCatalogPriceDisplay(product, langCode, currencySuffix)
  return price != null && String(price).trim() !== ''
}

export function getResidentialCatalogStockListingCta(
  product: Pick<PublicProduct, 'tipProdus' | 'catalogStockStatus'>,
  labels: { outOfStock: string; comingSoon: string },
): string | null {
  if (!residentialProductStockUnavailable(product)) return null
  const s = product.catalogStockStatus as CatalogStockStatus
  if (s === 'out_of_stock') return labels.outOfStock
  return labels.comingSoon
}

export function normalizeProductReducereProgramIds(product: { reducereProgramIds?: unknown }): string[] {
  const raw = product.reducereProgramIds
  if (raw == null || !Array.isArray(raw)) return []
  return [
    ...new Set(
      raw.filter((x): x is string => typeof x === 'string' && String(x).trim() !== '').map((s) => String(s).trim()),
    ),
  ]
}

export function productHasEligibleReducerePrograms(product: PublicProduct): boolean {
  if (String(product.tipProdus || '').toLowerCase() !== 'rezidential') return false
  return normalizeProductReducereProgramIds(product).length > 0
}

/** Lista produselor publicate (fără auth) */
export async function getProducts(): Promise<PublicProduct[]> {
  const res = await fetch(`${API_BASE}/products`, { headers: publicFetchHeaders(), next: { revalidate: 300 } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la încărcare.')
  return Array.isArray(json) ? json : []
}

// ── Currency ─────────────────────────────────────────────────────────────

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

// ── Cookie consent ───────────────────────────────────────────────────────

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

// ── Client cart ──────────────────────────────────────────────────────────

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

// ── Department phones ────────────────────────────────────────────────────

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

// ── Case studies (public) ────────────────────────────────────────────────

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
  description: string
  image: string
  imageAlt: string
  images: string[]
  imageCount: number
  specs: CaseStudySpec[]
  tags: string[]
  isActive: boolean
  sortOrder: number
}

export async function getPublicCaseStudies(lang: string): Promise<CaseStudyRow[]> {
  const res = await fetch(`${API_BASE}/case-studies?locale=${encodeURIComponent(lang)}`, { cache: 'no-store' })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la încărcarea studiilor de caz.')
  return Array.isArray(json) ? json : []
}

// ── Page SEO overrides (admin-configurable) ─────────────────────────────

export type PageSeoDto = {
  pageKey: string
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  ogImage: string
}

export async function getPageSeoAll(): Promise<PageSeoDto[]> {
  try {
    const res = await fetch(`${API_BASE}/page-seo`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const json = await res.json().catch(() => [])
    return Array.isArray(json) ? json : []
  } catch {
    return []
  }
}
