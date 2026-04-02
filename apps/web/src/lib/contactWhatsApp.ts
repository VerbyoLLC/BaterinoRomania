/** Digits only (no +) for https://wa.me/... links — fallback dacă admin nu completează */
export const CONTACT_WHATSAPP_WAME = '40770106374'

export const FALLBACK_PHONE_DISPLAY = '+40 770 106 374'
export const FALLBACK_PHONE_TEL_HREF = '+40770106374'

/** Normalizează pentru `https://wa.me/<digits>` */
export function digitsForWaMe(stored: string | undefined | null): string {
  const d = String(stored ?? '').replace(/\D/g, '')
  return d || CONTACT_WHATSAPP_WAME
}

/** Text afișat pe butonul de apel */
export function formatPhoneDisplay(stored: string | undefined | null): string {
  const t = String(stored ?? '').trim()
  return t || FALLBACK_PHONE_DISPLAY
}

/** Valoare pentru atributul `href` pe link-uri `tel:` */
export function telHrefFromStored(stored: string | undefined | null): string {
  const raw = String(stored ?? '').trim()
  if (!raw) return FALLBACK_PHONE_TEL_HREF
  const digits = raw.replace(/\D/g, '')
  if (!digits) return FALLBACK_PHONE_TEL_HREF
  if (digits.startsWith('40')) return `+${digits}`
  if (raw.startsWith('+')) return `+${digits}`
  if (digits.length === 10 && digits.startsWith('0')) return `+40${digits.slice(1)}`
  return `+${digits}`
}
