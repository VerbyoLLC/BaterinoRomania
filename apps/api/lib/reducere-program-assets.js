/** Normalize static asset paths for ReducereProgram (post-WebP migration). */

function normalizeReducereProgramAssetUrl(url) {
  if (url == null) return url
  let t = String(url).trim()
  if (!t) return t

  // Folder was renamed/encoded during WebP migration.
  t = t.replace('/images/programe reduceri/', '/images/programe%20reduceri/')

  // Local static images were converted JPG/PNG → WebP; DB may still store .jpg.
  if (t.startsWith('/images/') && /\.jpe?g$/i.test(t)) {
    t = t.replace(/\.jpe?g$/i, '.webp')
  }

  return t
}

module.exports = { normalizeReducereProgramAssetUrl }
