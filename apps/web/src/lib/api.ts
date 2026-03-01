// Dev pe localhost/127.0.0.1: folosește direct API-ul. Prod: VITE_API_URL sau /api (proxy Vercel).
const API_BASE =
  (import.meta.env.VITE_API_URL as string) ||
  (import.meta.env.DEV && typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3001/api'
    : '/api')

/** Produs public (pagina /produse) */
export type PublicProduct = {
  id: string
  title: string
  tipProdus: 'rezidential' | 'industrial'
  categorie?: string | null
  description?: string | null
  images: string[]
  salePrice: string | number
  tensiuneNominala?: string | null
  capacitate?: string | null
  compozitie?: string | null
  cicluriDescarcare?: string | null
  conectivitateWifi?: boolean
  conectivitateBluetooth?: boolean
  energieNominala?: string | null
  [key: string]: unknown
}

/** Lista produselor publicate (fără auth) */
export async function getProducts(): Promise<PublicProduct[]> {
  const res = await fetch(`${API_BASE}/products`)
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la încărcare.')
  return Array.isArray(json) ? json : []
}

/** Un singur produs publicat (fără auth) */
export async function getProduct(id: string): Promise<PublicProduct> {
  const res = await fetch(`${API_BASE}/products/${id}`)
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

export function setAuthToken(token: string) {
  localStorage.setItem('auth_token', token)
}

export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token')
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
  tipProdus: 'rezidential' | 'industrial'
  categorie?: string
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
  images: string[]
  documenteTehnice: { descriere: string; url: string }[]
  faq: { q: string; a: string }[]
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
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` }
  headers['X-Product-Folder'] = folder
  if (imageIndex != null) headers['X-Image-Index'] = String(imageIndex)
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers,
    body: formData,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Eroare la încărcarea fișierului.')
  return json
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
  const res = await fetch(url, { headers: authHeaders() })
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
