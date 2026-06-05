import { getProductCardImageUrl, type AdminProduct, type AdminProductModelRow } from './api'

/** Same shape as `SheetTechnicalRow` in AdminProductSheetA4 — kept here to avoid importing from pages. */
export type ParsedTechnicalDescriptionRow = { kind: 'section' | 'pair'; label: string; value: string }

/** Aliniază parsing-ul cu Magazin → Modele (descriere tehnică pe linii). */
export function parseTechnicalDescriptionRows(text: string): ParsedTechnicalDescriptionRow[] {
  const lines = String(text ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const out: ParsedTechnicalDescriptionRow[] = []
  for (const line of lines) {
    const idx = line.indexOf(':')
    if (idx <= 0) {
      out.push({ kind: 'section', label: line, value: '' })
      continue
    }
    const label = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    if (!value) out.push({ kind: 'section', label, value: '' })
    else out.push({ kind: 'pair', label, value })
  }
  return out
}

function normalizeSku(s: string): string {
  return s.trim().toLowerCase()
}

export function resolveCatalogForModel(
  model: AdminProductModelRow,
  products: AdminProduct[],
): { title: string; imageUrl: string; matchedProduct: AdminProduct | null } {
  const keyModelNumber = normalizeSku(model.modelNumber)
  const keySku = normalizeSku(model.sku || '')
  const matched =
    products.find((p) => {
      const pSku = normalizeSku(String(p.sku ?? ''))
      return pSku === keyModelNumber || (keySku && pSku === keySku)
    }) ?? null
  const title =
    (matched?.title && matched.title.trim()) || model.name.trim() || model.modelNumber
  let imageUrl = ''
  if (matched) {
    imageUrl = getProductCardImageUrl({
      images: Array.isArray(matched.images) ? matched.images : [],
      cardImage: String((matched as { cardImage?: string | null }).cardImage ?? '').trim() || null,
    })
  }
  if (!imageUrl) {
    imageUrl = String(model.productImageUrl ?? '').trim()
  }
  if (!imageUrl) {
    imageUrl = String(model.imageUrl ?? '').trim()
  }
  if (!imageUrl) {
    imageUrl = getProductCardImageUrl({ images: [], cardImage: null })
  }
  return { title, imageUrl, matchedProduct: matched }
}
