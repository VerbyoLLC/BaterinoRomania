const SITE_NAME = process.env.SITE_NAME || 'Baterino Romania'

const ACTIVITY_LABELS = {
  instalator: 'Instalator',
  distribuitor: 'Distribuitor',
  integrator: 'Integrator sisteme',
  altul: 'Altul',
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function baseStyles() {
  return "font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1a1a1a;line-height:1.6;max-width:560px;margin:0 auto"
}

function row(label, value) {
  const v = escapeHtml(value || '—')
  return `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#475569;width:160px;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#1e293b;">${v}</td>
    </tr>
  `
}

function formatActivityTypes(raw) {
  const parts = String(raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (!parts.length) return '—'
  return parts.map((id) => ACTIVITY_LABELS[id] || id).join(', ')
}

function formatLegalAddress(partner) {
  const line1 = String(partner.companyStreet || partner.address || '').trim()
  const cityLine = [partner.companyPostalCode, partner.companyCity].filter((x) => String(x || '').trim()).join(' ').trim()
  const county = String(partner.companyCounty || '').trim()
  const chunks = [line1, cityLine, county].filter(Boolean)
  return chunks.length ? chunks.join(', ') : '—'
}

/**
 * Notificare agent: partener nou aprobat și atribuit.
 * @param {{
 *   agentFirstName?: string
 *   companyName: string
 *   cui: string
 *   tradeRegisterNumber?: string | null
 *   legalAddress: string
 *   activityTypes: string
 *   contactName: string
 *   contactPhone: string
 *   contactEmail: string
 *   website?: string | null
 *   partnerDiscountPercent: number | null
 *   panelUrl?: string
 * }} opts
 */
function getPartnerAssignedToAgentTemplate(opts) {
  const greeting = String(opts.agentFirstName || '').trim()
    ? `Bună ziua, ${escapeHtml(opts.agentFirstName)},`
    : 'Bună ziua,'

  const discount =
    opts.partnerDiscountPercent != null && !Number.isNaN(Number(opts.partnerDiscountPercent))
      ? `${Number(opts.partnerDiscountPercent)}%`
      : '—'

  const panelUrl = escapeHtml(opts.panelUrl || 'https://app.baterino.com/sales-agent')
  const website = String(opts.website || '').trim()

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Partener nou atribuit – ${escapeHtml(SITE_NAME)}</title>
</head>
<body style="margin: 0; padding: 24px; background: #f5f5f5;">
  <div style="${baseStyles()} background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <h1 style="margin: 0 0 16px; font-size: 22px; color: #0f172a;">
      Partener nou atribuit ție
    </h1>
    <p style="margin: 0 0 24px; color: #334155; font-size: 16px;">
      ${greeting}
    </p>
    <p style="margin: 0 0 24px; color: #334155;">
      Un partener nou a fost aprobat în platformă și ți-a fost alocat. Mai jos găsești datele companiei și reducerea acordată.
    </p>
    <p style="margin: 0 0 12px; padding: 14px 16px; background: #ecfdf5; border-radius: 8px; border-left: 4px solid #0f766e; color: #0f172a; font-size: 16px;">
      <strong>Reducere partener:</strong> ${escapeHtml(discount)}
    </p>
    <table style="width:100%;border-collapse:collapse;margin: 0 0 24px;">
      ${row('Companie', opts.companyName)}
      ${row('CUI', opts.cui)}
      ${opts.tradeRegisterNumber ? row('Nr. Reg. Com.', opts.tradeRegisterNumber) : ''}
      ${row('Adresă sediu', opts.legalAddress)}
      ${row('Tip activitate', formatActivityTypes(opts.activityTypes))}
      ${row('Contact', opts.contactName)}
      ${row('Telefon contact', opts.contactPhone)}
      ${row('Email cont', opts.contactEmail)}
      ${website ? row('Website', website) : ''}
    </table>
    <p style="margin: 0 0 8px;">
      <a href="${panelUrl}" style="display: inline-block; color: #0f766e; font-weight: 600; font-size: 16px; text-decoration: none;">Accesează panoul agent</a>
    </p>
    <p style="margin: 24px 0 0; font-size: 12px; color: #94a3b8;">
      Mesaj automat de la ${escapeHtml(SITE_NAME)}.
    </p>
  </div>
</body>
</html>
  `.trim()
}

module.exports = { getPartnerAssignedToAgentTemplate, formatActivityTypes, formatLegalAddress }
