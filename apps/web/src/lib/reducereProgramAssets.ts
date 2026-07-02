/** Normalize static ReducereProgram image paths (legacy .jpg → .webp). */

export function normalizeReducereProgramAssetUrl(url: string | null | undefined): string {
  if (url == null) return ''
  let t = String(url).trim()
  if (!t) return t

  t = t.replace('/images/programe reduceri/', '/images/programe%20reduceri/')

  if (t.startsWith('/images/') && /\.jpe?g$/i.test(t)) {
    t = t.replace(/\.jpe?g$/i, '.webp')
  }

  return t
}
