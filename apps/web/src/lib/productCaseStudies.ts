export type ProductCaseStudyExample = { title: string; subtitle: string; location: string; image: string }

export const MAX_PRODUCT_CASE_STUDIES = 6

/** Normalize product installation case studies from API/admin. */
export function normalizeProductCaseStudyExamples(raw: unknown): ProductCaseStudyExample[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null
      const row = entry as Record<string, unknown>
      const title = String(row.title ?? '').trim()
      const subtitle = String(row.subtitle ?? row.subTitle ?? '').trim()
      const location = String(row.location ?? '').trim()
      const image = String(row.image ?? row.picture ?? '').trim()
      if (!title && !subtitle && !location && !image) return null
      return { title, subtitle, location, image }
    })
    .filter((item): item is ProductCaseStudyExample => item != null)
    .slice(0, MAX_PRODUCT_CASE_STUDIES)
}
