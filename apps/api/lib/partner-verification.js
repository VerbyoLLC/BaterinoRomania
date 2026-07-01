/**
 * Partener „verificat” admin: reducere partener alocată + persoană de suport (agent) atribuită.
 */
function computePartnerIsApproved(partnerDiscountPercent, assignedSalesAgentId) {
  const pct =
    partnerDiscountPercent != null && partnerDiscountPercent !== ''
      ? Number(partnerDiscountPercent)
      : null
  const hasDiscount = pct != null && Number.isFinite(pct) && pct > 0
  const hasSupportAgent = Boolean(String(assignedSalesAgentId || '').trim())
  return hasDiscount && hasSupportAgent
}

module.exports = { computePartnerIsApproved }
