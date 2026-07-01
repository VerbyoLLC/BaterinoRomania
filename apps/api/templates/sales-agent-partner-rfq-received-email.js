const SITE_NAME = process.env.SITE_NAME || 'Baterino Romania'
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://baterino.ro').replace(/\/$/, '')

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function baseStyles() {
  return "font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1a1a1a;line-height:1.6;max-width:560px;margin:0 auto"
}

function row(label, value) {
  const display = value != null && String(value).trim() !== '' ? escapeHtml(value) : '—'
  return `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#475569;width:160px;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#1e293b;">${display}</td>
    </tr>
  `
}

/**
 * @param {{
 *   agentFirstName?: string
 *   referenceNumber: string
 *   companyName: string
 *   contactName: string
 *   contactPhone?: string
 *   contactEmail: string
 *   lines: Array<{ productTitle?: string, quantity?: number }>
 *   createdAt?: Date | string
 *   ordersUrl?: string
 * }} opts
 */
function getSalesAgentPartnerRfqReceivedTemplate(opts) {
  const greeting = String(opts.agentFirstName || '').trim()
    ? `Bună ziua, ${escapeHtml(opts.agentFirstName)},`
    : 'Bună ziua,'

  const lines = Array.isArray(opts.lines) ? opts.lines : []
  const linesHtml = lines
    .map((L) => {
      const qty = L.quantity != null ? String(L.quantity) : '—'
      const title = escapeHtml(L.productTitle || '—')
      return `<li style="margin-bottom:6px;"><strong>${title}</strong> — ${escapeHtml(qty)} buc.</li>`
    })
    .join('')

  const createdAt =
    opts.createdAt != null
      ? new Date(opts.createdAt).toLocaleString('ro-RO')
      : new Date().toLocaleString('ro-RO')

  const ordersUrl = escapeHtml(opts.ordersUrl || `${FRONTEND_URL}/admin/orders`)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cerere de ofertă partener – ${escapeHtml(SITE_NAME)}</title>
</head>
<body style="margin: 0; padding: 24px; background: #f5f5f5;">
  <div style="${baseStyles()} background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <h1 style="margin: 0 0 8px; font-size: 22px; color: #0f172a;">
      Cerere de ofertă nouă
    </h1>
    <p style="margin: 0 0 24px; color: #64748b; font-size: 14px;">
      Un partener alocat ție a trimis o cerere de ofertă (RFQ) în ${escapeHtml(SITE_NAME)}.
    </p>
    <p style="margin: 0 0 24px; color: #334155; font-size: 16px;">
      ${greeting}
    </p>
    <table style="width:100%;border-collapse:collapse;">
      ${row('Referință', opts.referenceNumber)}
      ${row('Companie', opts.companyName)}
      ${row('Contact', opts.contactName)}
      ${row('Telefon', opts.contactPhone)}
      ${row('Email cont', opts.contactEmail)}
    </table>
    ${
      linesHtml
        ? `
    <div style="margin-top:20px;padding:16px;background:#fffbeb;border-radius:8px;border-left:4px solid #d97706;">
      <div style="font-weight:600;color:#475569;margin-bottom:8px;">Produse solicitate:</div>
      <ul style="margin:0;padding-left:18px;color:#1e293b;">${linesHtml}</ul>
    </div>`
        : ''
    }
    <p style="margin: 24px 0 12px; font-size: 14px;">
      <a href="${ordersUrl}" style="color:#0f766e;font-weight:600;">Deschide comenzile în admin</a>
    </p>
    <p style="margin: 0; font-size: 12px; color: #94a3b8;">
      Trimisă la: ${escapeHtml(createdAt)}
    </p>
  </div>
</body>
</html>
  `.trim()
}

module.exports = { getSalesAgentPartnerRfqReceivedTemplate }
