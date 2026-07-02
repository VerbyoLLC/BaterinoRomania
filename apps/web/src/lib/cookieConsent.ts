export const COOKIE_CONSENT_NAME = 'baterino_cookie_consent'
export const GA_MEASUREMENT_ID = 'G-2RMHQMTY9H'

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

export type CookieConsentPreference = {
  analytics: boolean
  decided: boolean
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === 'undefined') return
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`
}

export function readCookieConsent(): CookieConsentPreference {
  const raw = getCookie(COOKIE_CONSENT_NAME)
  if (raw === '1') return { analytics: true, decided: true }
  if (raw === '0') return { analytics: false, decided: true }
  return { analytics: false, decided: false }
}

export function writeCookieConsent(analytics: boolean): void {
  setCookie(COOKIE_CONSENT_NAME, analytics ? '1' : '0', COOKIE_MAX_AGE_SECONDS)
}

let gaLoaded = false

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function loadGoogleAnalytics(): void {
  if (gaLoaded || typeof window === 'undefined' || typeof document === 'undefined') return
  gaLoaded = true

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID)

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)
}

export function applyStoredCookieConsent(): CookieConsentPreference {
  const preference = readCookieConsent()
  if (preference.analytics) {
    loadGoogleAnalytics()
  }
  return preference
}
