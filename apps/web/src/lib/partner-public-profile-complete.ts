/** Aliniat cu checklist-ul din PartnerPublicProfile și validarea API. */

export const MIN_PARTNER_PUBLIC_SERVICES = 2

export type PartnerPublicProfileCompletionInput = {
  publicSlug?: string | null
  logoUrl?: string | null
  publicName?: string | null
  street?: string | null
  county?: string | null
  city?: string | null
  description?: string | null
  services?: string | string[] | null
  publicPhone?: string | null
  website?: string | null
  facebookUrl?: string | null
  linkedinUrl?: string | null
  instagramUrl?: string | null
  tiktokUrl?: string | null
  workPhotos?: string[] | string | null
}

function parseWorkPhotosList(raw: PartnerPublicProfileCompletionInput['workPhotos']): string[] {
  if (raw == null) return []
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x).trim()).filter(Boolean)
  }
  const s = String(raw).trim()
  if (!s) return []
  try {
    const p = JSON.parse(s) as unknown
    return Array.isArray(p) ? p.map((x) => String(x).trim()).filter(Boolean) : []
  } catch {
    return []
  }
}

export function parsePartnerServicesList(services: PartnerPublicProfileCompletionInput['services']): string[] {
  if (Array.isArray(services)) {
    return services.map((s) => String(s).trim()).filter(Boolean)
  }
  return String(services ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function hasAtLeastOnePartnerSocialNetwork(p: PartnerPublicProfileCompletionInput): boolean {
  return !!(
    String(p.facebookUrl ?? '').trim() ||
    String(p.linkedinUrl ?? '').trim() ||
    String(p.instagramUrl ?? '').trim() ||
    String(p.tiktokUrl ?? '').trim()
  )
}

export function isPartnerPublicProfileFullyComplete(p: PartnerPublicProfileCompletionInput): boolean {
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
