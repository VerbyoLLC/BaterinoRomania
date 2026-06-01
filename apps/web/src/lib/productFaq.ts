export type ProductFaqItem = { q: string; a: string }

/** Normalize product FAQ from API/admin (supports legacy question/answer keys). */
export function normalizeProductFaq(raw: unknown): ProductFaqItem[] {
  let items: unknown[] = []
  if (Array.isArray(raw)) {
    items = raw
  } else if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed)) items = parsed
    } catch {
      return []
    }
  }
  return items
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null
      const row = entry as Record<string, unknown>
      const q = String(row.q ?? row.question ?? '').trim()
      const a = String(row.a ?? row.answer ?? '').trim()
      if (!q && !a) return null
      return { q, a }
    })
    .filter((item): item is ProductFaqItem => item != null)
}
