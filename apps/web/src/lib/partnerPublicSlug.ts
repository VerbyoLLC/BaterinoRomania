/** Aliniată cu slugify-ul din apps/api/lib/partner-public-slug.js (preview client-side). */

const DIAC_REPLACE: Record<string, string> = {
  ă: 'a',
  â: 'a',
  î: 'i',
  ș: 's',
  ş: 's',
  ț: 't',
  ţ: 't',
  Ă: 'a',
  Â: 'a',
  Î: 'i',
  Ș: 's',
  Ț: 't',
  ä: 'a',
  ö: 'o',
  ü: 'u',
  Ä: 'a',
  Ö: 'o',
  Ü: 'u',
}

const MAX_SLUG_LEN = 72

function stripAsciiLower(s: string): string {
  let out = ''
  for (const ch of s) {
    const r = DIAC_REPLACE[ch]
    out += r !== undefined ? r : ch
  }
  try {
    return out.normalize('NFD').replace(/\p{M}/gu, '')
  } catch {
    return out
  }
}

export function slugifyPartnerPublicHandle(raw: string, maxLen = MAX_SLUG_LEN): string {
  let s = stripAsciiLower(String(raw ?? '').trim().toLowerCase())
  if (s.startsWith('@')) s = s.slice(1).trim()
  s = s
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
  if (s.length > maxLen) s = s.slice(0, maxLen).replace(/-+$/g, '')
  return s
}
