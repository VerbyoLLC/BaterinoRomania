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
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#475569;width:160px;">${escapeHtml(label)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#1e293b;">${display}</td>
    </tr>
  `
}

function orderSourceLabel(source) {
  const s = String(source || '').toLowerCase()
  if (s === 'client') return 'Client'
  if (s === 'partner' || s === 'partener') return 'Partener'
  return 'Invitat'
}

function formatMoney(amount, currency) {
  const n = Number(amount)
  if (!Number.isFinite(n)) return '—'
  return `${n.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency || 'RON'}`
}

/**
 * @param {{
 *   orderNumber: string,
 *   orderSource: string,
 *   email: string,
 *   phone?: string,
 *   firstName?: string,
 *   lastName?: string,
 *   companyName?: string | null,
 *   buyerType?: string,
 *   currency?: string,
 *   totalInclVat?: number,
 *   lines?: Array<{ productTitle?: string, quantity?: number, lineTotalInclVat?: string | null }>,
 *   createdAt?: Date | string,
 * }} order
 */
function getAdminNewOrderNotificationTemplate(order) {
  const name = `${String(order.lastName || '').trim()} ${String(order.firstName || '').trim()}`.trim()
  const lines = Array.isArray(order.lines) ? order.lines : []
  const linesHtml = lines
    .map((L) => {
      const qty = L.quantity != null ? String(L.quantity) : '—'
      const title = escapeHtml(L.productTitle || '—')
      const lineTotal = L.lineTotalInclVat != null ? formatMoney(L.lineTotalInclVat, order.currency) : '—'
      return `<li style="margin-bottom:6px;"><strong>${title}</strong> — ${qty} buc. · ${escapeHtml(lineTotal)}</li>`
    })
    .join('')

  const createdAt =
    order.createdAt != null
      ? new Date(order.createdAt).toLocaleString('ro-RO')
      : new Date().toLocaleString('ro-RO')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Comandă nouă – ${escapeHtml(SITE_NAME)}</title>
</head>
<body style="margin: 0; padding: 24px; background: #f5f5f5;">
  <div style="${baseStyles()} background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <h1 style="margin: 0 0 8px; font-size: 22px; color: #1a1a1a;">
      Comandă nouă
    </h1>
    <p style="margin: 0 0 24px; color: #64748b; font-size: 14px;">
      O comandă nouă a fost plasată în ${escapeHtml(SITE_NAME)}.
    </p>
    <table style="width:100%;border-collapse:collapse;">
      ${row('Nr. comandă', order.orderNumber)}
      ${row('Sursă', orderSourceLabel(order.orderSource))}
      ${row('Client', name)}
      ${row('Email', order.email)}
      ${row('Telefon', order.phone ? `+40 ${String(order.phone).replace(/\D/g, '').slice(-9)}` : '')}
      ${order.buyerType === 'company' && order.companyName ? row('Firmă', order.companyName) : ''}
      ${row('Total cu TVA', formatMoney(order.totalInclVat, order.currency))}
    </table>
    ${
      linesHtml
        ? `
    <div style="margin-top:20px;padding:16px;background:#f8fafc;border-radius:8px;border-left:4px solid #d97706;">
      <div style="font-weight:600;color:#475569;margin-bottom:8px;">Produse:</div>
      <ul style="margin:0;padding-left:18px;color:#1e293b;">${linesHtml}</ul>
    </div>`
        : ''
    }
    <p style="margin: 24px 0 12px; font-size: 14px;">
      <a href="${escapeHtml(FRONTEND_URL)}/admin/orders" style="color:#0f172a;font-weight:600;">Deschide comenzile în admin</a>
    </p>
    <p style="margin: 0; font-size: 12px; color: #94a3b8;">
      Plasată la: ${escapeHtml(createdAt)}
    </p>
  </div>
</body>
</html>
  `.trim()
}

module.exports = { getAdminNewOrderNotificationTemplate }
