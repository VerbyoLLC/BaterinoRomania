import type { ReducereProgram } from '../i18n/reduceri'
import type { LangCode } from '../i18n/menu'

// Dev pe localhost/127.0.0.1: folosește direct API-ul. Prod: VITE_API_URL sau /api (proxy Vercel).
const API_BASE =
  (import.meta.env.VITE_API_URL as string) ||
  (import.meta.env.DEV && typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3001/api'
    : '/api')

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
  tensiuneNominala?: string | null
  capacitate?: string | null
  compozitie?: string | null
  cicluriDescarcare?: string | null
  conectivitateWifi?: boolean
  conectivitateBluetooth?: boolean
  energieNominala?: string | null
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

export async function signup(email: string, password: string, role: 'client' | 'partener') {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    })
  } catch {
    throw new Error(`Nu s-a putut conecta la API (${API_BASE}). Pornește API-ul: npm run dev:api`)
  }
  const text = await res.text()
  let data: { error?: string; debug?: string } = {}
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

export async function resendVerificationCode(email: string) {
  const res = await fetch(`${API_BASE}/auth/resend-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Eroare la retrimiterea codului.')
  return data
}

export async function verifyCode(email: string, code: string) {
  const res = await fetch(`${API_BASE}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
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

export type ReducereProgramRow = ReducereProgram & { id: string; locale?: string; sortOrder?: number }

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
