/** Canonical production origin — always www + HTTPS (matches Vercel host redirect). */
export const SITE_ORIGIN = 'https://www.baterino.ro' as const

export const SITE_NAME = 'Baterino Romania' as const

/** Absolute URL for a site path (`/` or `/produse/...`). */
export function absoluteUrl(path = '/'): string {
  if (!path || path === '/') return `${SITE_ORIGIN}/`
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}

/** Normalize optional env / legacy non-www hosts to the canonical origin. */
export function normalizeSiteOrigin(raw?: string | null): string {
  const fallback = SITE_ORIGIN
  if (!raw) return fallback
  try {
    const u = new URL(raw.trim())
    if (u.hostname === 'baterino.ro' || u.hostname === 'www.baterino.ro') {
      return SITE_ORIGIN
    }
    return `${u.protocol}//${u.host}`.replace(/\/$/, '')
  } catch {
    return fallback
  }
}
