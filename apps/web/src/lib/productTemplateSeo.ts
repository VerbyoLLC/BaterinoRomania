import type { LangCode } from '../i18n/menu'
import type { PublicProduct } from './api'

type TemplateSeoInput = Pick<
  PublicProduct,
  'tipProdus' | 'title' | 'description' | 'subtitle' | 'overview' | 'seoTitle' | 'seoDescription' | 'seoOgImage'
>

const MAX_DESC = 168

const FALLBACK_DESCRIPTION: Record<LangCode, { residential: string; industrial: string }> = {
  ro: {
    residential:
      'Baterie LiFePO4 pentru locuințe — siguranță, durată de viață lungă și suport local Baterino.',
    industrial:
      'Soluții de stocare a energiei industriale și BESS — consultanță, integrare și suport Baterino în România.',
  },
  en: {
    residential:
      'LiFePO4 home batteries — safety, long cycle life, and local support from Baterino Romania.',
    industrial:
      'Industrial energy storage and BESS solutions — engineering, integration, and support from Baterino.',
  },
  zh: {
    residential: '住宅 LifePO₄ 储能电池 — 安全、长寿命与 Baterino 本地支持。',
    industrial: '工业与集装箱储能（BESS）解决方案 — Baterino 提供集成与支持。',
  },
}

function clip(s: string, max: number): string {
  const t = s.trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut) + '…'
}

function derivedTitle(product: Pick<PublicProduct, 'title'>, lang: LangCode): string {
  return (
    String(product.title || '').trim() ||
    (lang === 'ro' ? 'Produs' : lang === 'zh' ? '产品' : 'Product')
  )
}

function derivedDescription(product: TemplateSeoInput, lang: LangCode): string {
  const mergedBody = [product.description, product.overview, product.subtitle]
    .map((x) => (x != null ? String(x).trim() : ''))
    .find(Boolean)

  if (mergedBody) {
    return clip(mergedBody.replace(/\s+/g, ' '), MAX_DESC)
  }

  const fb = FALLBACK_DESCRIPTION[lang] ?? FALLBACK_DESCRIPTION.ro
  const isIndustrial = product.tipProdus === 'industrial'
  return clip(isIndustrial ? fb.industrial : fb.residential, MAX_DESC)
}

export type ProductTemplateSeoResult = {
  title: string
  description: string
  /** Passed to `<SEO ogImage={...}>` when set */
  ogImage?: string
}

/**
 * Product page meta: optional per-product seoTitle / seoDescription / seoOgImage;
 * otherwise derives from template (tipProdus) + title + body copy. Price fields are ignored.
 */
export function getProductTemplateSeo(product: TemplateSeoInput, lang: LangCode): ProductTemplateSeoResult {
  const customTitle = String(product.seoTitle ?? '').trim()
  const customDesc = String(product.seoDescription ?? '').trim()
  const customOg = String(product.seoOgImage ?? '').trim()

  const title = customTitle || derivedTitle(product, lang)
  const description = customDesc
    ? clip(customDesc.replace(/\s+/g, ' '), MAX_DESC)
    : derivedDescription(product, lang)

  const ogImage = customOg || undefined

  return { title, description, ...(ogImage ? { ogImage } : {}) }
}
