import { partnerDiscountConfigured } from './api'

const PARTNER_PROFILE_HINT_KEY = 'baterino.partner.profileHint.v1'

export type PartnerProfileHint = {
  discountConfigured: boolean
  contractSigned: boolean
}

export function readPartnerProfileHint(): PartnerProfileHint | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(PARTNER_PROFILE_HINT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PartnerProfileHint>
    if (typeof parsed.discountConfigured !== 'boolean' || typeof parsed.contractSigned !== 'boolean') {
      return null
    }
    return {
      discountConfigured: parsed.discountConfigured,
      contractSigned: parsed.contractSigned,
    }
  } catch {
    return null
  }
}

export function writePartnerProfileHintFromProfile(profile: {
  partnerDiscountPercent?: number | null
  partnerContractSignedAt?: string | null
}): void {
  if (typeof window === 'undefined') return
  try {
    const hint: PartnerProfileHint = {
      discountConfigured: partnerDiscountConfigured(profile.partnerDiscountPercent),
      contractSigned: Boolean(String(profile.partnerContractSignedAt ?? '').trim()),
    }
    window.sessionStorage.setItem(PARTNER_PROFILE_HINT_KEY, JSON.stringify(hint))
  } catch {
    /* ignore quota / private mode */
  }
}
