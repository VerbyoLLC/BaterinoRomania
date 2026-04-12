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

/** Street / address lines: letters, digits, limited safe punctuation (no quotes / brackets / SQL-like tokens). */
export function sanitizeAddressField(value: string): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[^\p{L}\p{N}\s.,'\-/#]/gu, '')
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
