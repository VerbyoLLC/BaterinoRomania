/** API istoric / bug: în DB au putut intra obiecte `{ url }` în loc de string-uri HTTPS. Unifică pentru <img src>. */
export function normalizePartnerWorkPhotos(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const out: string[] = []
  for (const item of raw) {
    if (typeof item === 'string') {
      const t = item.trim()
      if (t) out.push(t)
      continue
    }
    if (item && typeof item === 'object' && 'url' in item) {
      const u = (item as { url?: unknown }).url
      if (typeof u === 'string' && u.trim()) out.push(u.trim())
    }
  }
  return out.slice(0, 8)
}
