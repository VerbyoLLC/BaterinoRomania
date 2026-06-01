import { API_BASE } from './api'
import type { PublicProductModelRow } from './api'
import type { IndustrialModelSpecEntry } from './industrialTechnicalSpec'

/** Match a configuration card `modelName` to a catalog row (model number or display name). */
export function resolveIndustrialModelBrochureUrl(
  entry: Pick<IndustrialModelSpecEntry, 'modelName'>,
  catalog: PublicProductModelRow[],
): string | null {
  const q = String(entry.modelName ?? '').trim().toLowerCase()
  if (!q || catalog.length === 0) return null
  const match = catalog.find((r) => {
    const num = String(r.modelNumber ?? '').trim().toLowerCase()
    const name = String(r.name ?? '').trim().toLowerCase()
    const combined = `${num} ${name}`.trim()
    return q === num || q === name || q === combined
  })
  const url = match?.technicalBrochureUrl
  return url && String(url).trim() ? String(url).trim() : null
}

/** Force download via API proxy (same pattern as residential technical documents). */
export function technicalBrochureDownloadHref(pdfUrl: string): string {
  const apiBase =
    import.meta.env.DEV && typeof window !== 'undefined'
      ? 'http://localhost:3001/api'
      : typeof window !== 'undefined'
        ? `${window.location.origin}/api`
        : API_BASE
  return `${apiBase}/download-proxy?url=${encodeURIComponent(pdfUrl)}`
}

export function technicalBrochureDownloadFilename(modelName: string): string {
  const base =
    String(modelName ?? '')
      .trim()
      .replace(/[^a-zA-Z0-9-_ăâîșțĂÂÎȘȚ\s]/g, '')
      .replace(/\s+/g, '-') || 'detalii-tehnice'
  return `${base}.pdf`
}
