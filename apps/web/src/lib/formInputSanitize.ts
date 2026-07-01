/**
 * Normalize a phone value loaded from the API into E.164 format for PhoneInput.
 * Legacy DB values are stored as 9 bare digits (no country code) → prepend +40.
 * Values already in E.164 (+XXXXXXX) are returned as-is.
 */
export function loadPhoneE164(raw: string | null | undefined): string {
  if (!raw) return ''
  const s = String(raw).trim()
  if (!s) return ''
  if (/^\d{9}$/.test(s)) return `+40${s}`
  return s
}

/** Validate that a PhoneInput value has enough digits to be a real number. */
export function isPhoneE164Valid(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 7
}

/** Nine national digits after +40, shown as XXX XXX XXX while typing. */
export function formatRoNational9Display(digits: string): string {
  const d = digits.replace(/\D/g, '').slice(0, 9)
  const a = d.slice(0, 3)
  const b = d.slice(3, 6)
  const c = d.slice(6, 9)
  const parts: string[] = []
  if (a.length) parts.push(a)
  if (b.length) parts.push(b)
  if (c.length) parts.push(c)
  return parts.join(' ')
}

/** Person name (given / family): Unicode letters and spaces only — no digits or punctuation. */
export function sanitizePersonName(value: string): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[^\p{L}\s]/gu, '')
    .replace(/\s+/g, ' ')
}

/** Telefon: doar cifre (elimină +, spații, litere). Max 16 pentru prefix internațional. */
export function sanitizePhoneDigitsOnly(value: string): string {
  return value.replace(/\D/g, '').slice(0, 16)
}

/** Telefon / WhatsApp în profil public: doar cifre și „+” (o singură dată, la început). */
export function sanitizePhonePlusOnly(value: string): string {
  const cleaned = value.replace(/[^\d+]/g, '')
  const digits = cleaned.replace(/\+/g, '')
  const hasLeadingPlus = cleaned.startsWith('+')
  const combined = (hasLeadingPlus ? '+' : '') + digits
  return combined.slice(0, 20)
}

/** Street / address lines: letters, digits, limited safe punctuation (no quotes / brackets / SQL-like tokens). */
export function sanitizeAddressField(value: string): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[^\p{L}\p{N}\s.,'\-/#]/gu, '')
}

/** Partner street lines (stradă / sediu): no `.` `,` `|` — keeps concatenated addresses unambiguous. */
export function sanitizeStreetLine(value: string): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[.,|]/g, '')
    .replace(/[^\p{L}\p{N}\s'\-/#]/gu, '')
}

/** Cod poștal RO: doar cifre, maxim 6. */
export function sanitizeRoPostalCode(value: string): string {
  return value.replace(/\D/g, '').slice(0, 6)
}

/** Cod poștal RO complet: exact 6 cifre. */
export function isRoPostalCodeValid(value: string): boolean {
  return /^\d{6}$/.test(String(value ?? '').trim())
}

/** Postal / ZIP style: letters, digits, space, hyphen. */
export function sanitizePostalField(value: string): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[^\p{L}\p{N}\s\-]/gu, '')
}

/** Email field: remove control chars only; rely on browser + server email validation. */
export function sanitizeEmailTyping(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, '')
}

const PRICE_INPUT_LOCALE = 'en-US' as const
const PRICE_INPUT_FRACTION_DIGITS = { minimumFractionDigits: 2, maximumFractionDigits: 2 } as const

/**
 * Parse a price input value to number — strips thousand commas (en-US), e.g. `20,000.00` → 20000.
 */
export function parsePriceInput(value: string): number {
  let raw = String(value ?? '')
    .trim()
    .replace(/[\s\u00a0\u202f]/g, '')

  if (!raw) return 0

  // Comma without dot: en-US thousands (`20,000`, `1,234,567`) or ro-RO decimal (`20,50`)
  if (raw.includes(',') && !raw.includes('.')) {
    const commaCount = (raw.match(/,/g) || []).length
    if (commaCount > 1) {
      raw = raw.replace(/,/g, '')
    } else {
      const lastComma = raw.lastIndexOf(',')
      const fracPart = raw.slice(lastComma + 1).replace(/\D/g, '')
      // Single comma + exactly 3 fractional digits → en-US thousands (not `20,50`)
      if (fracPart.length === 3 && /^\d{3}$/.test(fracPart)) {
        raw = raw.replace(/,/g, '')
      } else {
        const intPart = raw.slice(0, lastComma).replace(/\./g, '').replace(/,/g, '')
        const normalized = fracPart.length > 0 ? `${intPart || '0'}.${fracPart}` : intPart
        const legacy = parseFloat(normalized)
        if (Number.isFinite(legacy)) return legacy
      }
    }
  }

  // Legacy ro-RO thousands with dots only: `20.000`
  if (raw.includes('.') && !raw.includes(',')) {
    const dotCount = (raw.match(/\./g) || []).length
    const [intPart, fracPart = ''] = raw.split('.')
    if (
      dotCount > 1 ||
      (dotCount === 1 && fracPart.length === 3 && intPart.replace(/\D/g, '').length <= 3)
    ) {
      const legacy = parseFloat(raw.replace(/\./g, ''))
      if (Number.isFinite(legacy)) return legacy
    }
  }

  raw = raw.replace(/,/g, '')
  const n = parseFloat(raw)
  return Number.isFinite(n) ? n : 0
}

function formatPriceIntegerDigits(digits: string): string {
  const d = digits.replace(/\D/g, '').slice(0, 12)
  if (!d) return ''
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/** While typing: format thousands with commas; one decimal point (max 2 fractional digits). */
export function sanitizePriceInputTyping(value: string): string {
  let s = String(value ?? '')
    .normalize('NFKC')
    .replace(/[\s\u00a0\u202f]/g, '')
    .replace(/[^\d.,]/g, '')

  const dotIdx = s.indexOf('.')
  if (dotIdx !== -1) {
    const intDigits = s.slice(0, dotIdx).replace(/,/g, '').replace(/\D/g, '')
    const decDigits = s.slice(dotIdx + 1).replace(/\D/g, '').slice(0, 2)
    const intFormatted = formatPriceIntegerDigits(intDigits)
    if (decDigits.length > 0) return `${intFormatted}.${decDigits}`
    const trailingDot = String(value ?? '').trimEnd().endsWith('.')
    return trailingDot ? `${intFormatted}.` : intFormatted
  }

  return formatPriceIntegerDigits(s.replace(/,/g, ''))
}

/** Display price in inputs on blur: `20,000.00`, `100,000.00`. */
export function formatPriceInputDisplay(raw: string | number): string {
  if (raw === '' || raw == null) return ''
  const n = typeof raw === 'number' ? raw : parsePriceInput(String(raw))
  if (!Number.isFinite(n)) return ''
  return n.toLocaleString(PRICE_INPUT_LOCALE, PRICE_INPUT_FRACTION_DIGITS)
}

/** Website URL: trim; dacă lipsește schema, adaugă https:// la salvare. Gol rămâne gol. */
export function normalizePartnerWebsite(raw: string): string {
  let s = String(raw ?? '').trim()
  if (!s) return ''
  if (s.length > 512) s = s.slice(0, 512)
  if (/^https?:\/\//i.test(s)) return s
  return `https://${s.replace(/^\/+/, '')}`
}

/** Afișare în câmpuri care cer doar domeniul (fără https://). */
export function partnerWebsiteForInput(raw: string): string {
  let s = String(raw ?? '').trim()
  if (!s) return ''
  if (s.length > 512) s = s.slice(0, 512)
  return s.replace(/^https?:\/\//i, '').replace(/^\/+/, '')
}

/** Validare domeniu website (acceptă domeniu simplu sau URL complet). */
export function isPartnerWebsiteSyntaxValid(raw: string): boolean {
  const normalized = normalizePartnerWebsite(raw)
  if (!normalized) return false
  try {
    const u = new URL(normalized)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false
    const host = u.hostname.toLowerCase()
    if (!host || host.length < 3) return false
    if (!host.includes('.')) return false
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(host)) return false
    return true
  } catch {
    return false
  }
}
