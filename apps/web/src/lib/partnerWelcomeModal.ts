const PERMANENT_KEY_PREFIX = 'baterino.partner.welcomeModal.dismissed.v1.'
const SESSION_KEY_PREFIX = 'baterino.partner.welcomeModal.session.v1.'

function scopedKey(prefix: string, email: string): string {
  return `${prefix}${email.trim().toLowerCase()}`
}

export function isPartnerWelcomeModalPermanentlyDismissed(email: string | null | undefined): boolean {
  if (typeof window === 'undefined' || !email?.trim()) return false
  try {
    return window.localStorage.getItem(scopedKey(PERMANENT_KEY_PREFIX, email)) === '1'
  } catch {
    return false
  }
}

export function isPartnerWelcomeModalSessionDismissed(email: string | null | undefined): boolean {
  if (typeof window === 'undefined' || !email?.trim()) return false
  try {
    return window.sessionStorage.getItem(scopedKey(SESSION_KEY_PREFIX, email)) === '1'
  } catch {
    return false
  }
}

export function shouldShowPartnerWelcomeModal(email: string | null | undefined): boolean {
  if (!email?.trim()) return false
  if (isPartnerWelcomeModalPermanentlyDismissed(email)) return false
  if (isPartnerWelcomeModalSessionDismissed(email)) return false
  return true
}

export function dismissPartnerWelcomeModalForSession(email: string | null | undefined): void {
  if (typeof window === 'undefined' || !email?.trim()) return
  try {
    window.sessionStorage.setItem(scopedKey(SESSION_KEY_PREFIX, email), '1')
  } catch {
    /* ignore */
  }
}

export function dismissPartnerWelcomeModalPermanently(email: string | null | undefined): void {
  if (typeof window === 'undefined' || !email?.trim()) return
  try {
    window.localStorage.setItem(scopedKey(PERMANENT_KEY_PREFIX, email), '1')
    window.sessionStorage.setItem(scopedKey(SESSION_KEY_PREFIX, email), '1')
  } catch {
    /* ignore */
  }
}
