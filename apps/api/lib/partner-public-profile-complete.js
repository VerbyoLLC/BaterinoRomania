/** Aliniat cu checklist-ul din PartnerPublicProfile (Profil Public). */

const MIN_PARTNER_PUBLIC_SERVICES = 2

/**
 * @param {unknown} raw
 * @returns {string[]}
 */
function parseWorkPhotosList(raw) {
  if (raw == null || raw === '') return []
  if (Array.isArray(raw)) {
    return raw
      .map((x) => {
        if (typeof x === 'string') return x.trim()
        if (x != null && typeof x === 'object' && typeof x.url === 'string') return x.url.trim()
        return ''
      })
      .filter(Boolean)
  }
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw)
      return parseWorkPhotosList(p)
    } catch {
      return []
    }
  }
  return []
}

/**
 * @param {unknown} servicesRaw
 * @returns {string[]}
 */
function parsePartnerServicesList(servicesRaw) {
  if (Array.isArray(servicesRaw)) {
    return servicesRaw.map((s) => String(s).trim()).filter(Boolean)
  }
  return String(servicesRaw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * @param {Record<string, unknown> | null | undefined} p
 */
function hasAtLeastOnePartnerSocialNetwork(p) {
  if (!p) return false
  return !!(
    String(p.facebookUrl ?? '').trim() ||
    String(p.linkedinUrl ?? '').trim() ||
    String(p.instagramUrl ?? '').trim() ||
    String(p.tiktokUrl ?? '').trim()
  )
}

/**
 * @param {Record<string, unknown> | null | undefined} p
 */
function isPartnerPublicProfileFullyComplete(p) {
  if (!p) return false
  const servicii = parsePartnerServicesList(p.services)
  const workPhotos = parseWorkPhotosList(p.workPhotos)

  return !!(
    String(p.publicSlug ?? '').trim() &&
    String(p.logoUrl ?? '').trim() &&
    String(p.publicName ?? '').trim() &&
    String(p.street ?? '').trim() &&
    String(p.county ?? '').trim() &&
    String(p.city ?? '').trim() &&
    String(p.description ?? '').trim() &&
    servicii.length >= MIN_PARTNER_PUBLIC_SERVICES &&
    String(p.publicPhone ?? '').trim() &&
    String(p.website ?? '').trim() &&
    hasAtLeastOnePartnerSocialNetwork(p) &&
    workPhotos.length > 0
  )
}

module.exports = {
  isPartnerPublicProfileFullyComplete,
  parseWorkPhotosList,
  hasAtLeastOnePartnerSocialNetwork,
  MIN_PARTNER_PUBLIC_SERVICES,
}
