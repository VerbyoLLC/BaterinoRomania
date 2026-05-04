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

/** Website URL: trim; dacă lipsește schema, adaugă https:// pentru domenii simple. Gol rămâne gol. */
export function normalizePartnerWebsite(raw: string): string {
  let s = String(raw ?? '').trim()
  if (!s) return ''
  if (s.length > 512) s = s.slice(0, 512)
  if (/^https?:\/\//i.test(s)) return s
  return `https://${s.replace(/^\/+/, '')}`
}
