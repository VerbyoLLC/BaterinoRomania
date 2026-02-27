// In dev, Vite proxies /api to localhost:3001. No CORS needed.
const API_BASE = '/api'

export type AuthUser = { id: string; email: string; role: string }

export async function signup(email: string, password: string, role: 'client' | 'partener') {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Eroare de rețea'
    throw new Error(`Nu s-a putut conecta la API (${API_BASE}). Pornește API-ul: npm run dev:api`)
  }
  const text = await res.text()
  let data: { error?: string } = {}
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
