/** @typedef {'installer' | 'distributor' | 'hybrid'} PartnerChannelType */

/**
 * @param {unknown} v
 * @returns {PartnerChannelType}
 */
function parsePartnerChannelType(v) {
  const s = String(v ?? '').trim().toLowerCase()
  if (s === 'distributor' || s === 'distribuitor') return 'distributor'
  if (s === 'hybrid') return 'hybrid'
  return 'installer'
}

/**
 * @param {PartnerChannelType} channel
 * @returns {string}
 */
function activityTypesFromPartnerChannel(channel) {
  if (channel === 'distributor') return 'distribuitor'
  if (channel === 'hybrid') return 'instalator,distribuitor'
  return 'instalator'
}

/**
 * @param {string | string[] | null | undefined} activityTypes
 * @returns {PartnerChannelType}
 */
function derivePartnerChannelTypeFromActivities(activityTypes) {
  const parts = Array.isArray(activityTypes)
    ? activityTypes.map((x) => String(x || '').trim().toLowerCase())
    : String(activityTypes || '')
        .split(',')
        .map((x) => x.trim().toLowerCase())
        .filter(Boolean)
  const hasInst = parts.includes('instalator')
  const hasDist = parts.includes('distribuitor')
  if (hasInst && hasDist) return 'hybrid'
  if (hasDist) return 'distributor'
  return 'installer'
}

/**
 * @param {PartnerChannelType | string | null | undefined} channel
 * @returns {{ min: number, max: number }}
 */
function partnerDiscountLimitsForChannel(channel) {
  const ch = parsePartnerChannelType(channel)
  if (ch === 'distributor' || ch === 'hybrid') return { min: 0, max: 30 }
  return { min: 0, max: 15 }
}

module.exports = {
  parsePartnerChannelType,
  activityTypesFromPartnerChannel,
  derivePartnerChannelTypeFromActivities,
  partnerDiscountLimitsForChannel,
}
