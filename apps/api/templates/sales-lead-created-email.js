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

/**
 * @param {{ createdByName: string, lead: Record<string, unknown> }} params
 */
function getSalesLeadCreatedNotificationTemplate({ createdByName, lead }) {
  const createdAt = lead.createdAt
    ? new Date(String(lead.createdAt)).toLocaleString('ro-RO')
    : '—'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New lead added by ${escapeHtml(createdByName)}</title>
</head>
<body style="margin: 0; padding: 24px; background: #f5f5f5;">
  <div style="${baseStyles()} background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <h1 style="margin: 0 0 8px; font-size: 22px; color: #1a1a1a;">
      New lead added by ${escapeHtml(createdByName)}
    </h1>
    <p style="margin: 0 0 24px; color: #64748b; font-size: 14px;">
      A team member added a new sales lead in ${escapeHtml(SITE_NAME)}.
    </p>
    <table style="width:100%;border-collapse:collapse;">
      ${row('Name', lead.name)}
      ${row('Email', lead.email)}
      ${row('Phone', lead.phone)}
      ${row('WhatsApp', lead.whatsapp)}
      ${row('Company', lead.companyName)}
      ${row('Work email', lead.workEmail)}
      ${row('Job title', lead.jobTitle)}
      ${row('Country', lead.country)}
      ${row('Website', lead.website)}
      ${row('Source', lead.source)}
      ${row('Status', lead.status)}
      ${row('Customer type', lead.customerType)}
      ${row('Product line', lead.productLine)}
      ${row('Monthly volume', lead.monthlyVolume)}
    </table>
    ${
      lead.message && String(lead.message).trim()
        ? `
    <div style="margin-top:20px;padding:16px;background:#f8fafc;border-radius:8px;border-left:4px solid #0f172a;">
      <div style="font-weight:600;color:#475569;margin-bottom:8px;">Message:</div>
      <div style="white-space:pre-wrap;color:#1e293b;">${escapeHtml(lead.message)}</div>
    </div>`
        : ''
    }
    <p style="margin: 24px 0 12px; font-size: 14px;">
      <a href="${escapeHtml(FRONTEND_URL)}/admin/oferte/leads" style="color:#0f172a;font-weight:600;">Open leads (admin)</a>
      &nbsp;·&nbsp;
      <a href="${escapeHtml(FRONTEND_URL)}/sales-agent/leads" style="color:#0f172a;font-weight:600;">Open leads (agent)</a>
    </p>
    <p style="margin: 0; font-size: 12px; color: #94a3b8;">
      Created at: ${escapeHtml(createdAt)}
    </p>
  </div>
</body>
</html>
  `.trim()
}

module.exports = { getSalesLeadCreatedNotificationTemplate }
