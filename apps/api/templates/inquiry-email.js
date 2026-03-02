const SITE_NAME = process.env.SITE_NAME || 'Baterino Romania'

const DOMAIN_LABELS = {
  rezidential: 'Rezidențial',
  industrial: 'Industrial',
  medical: 'Medical',
  maritim: 'Maritim',
}

const REQUEST_TYPE_LABELS = {
  sales: 'Vânzări',
  technical: 'Tehnic',
  service: 'Service',
  partnership: 'Parteneriat',
}

function baseStyles() {
  return "font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1a1a1a;line-height:1.6;max-width:560px;margin:0 auto"
}

function row(label, value) {
  return `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#475569;width:140px;">${label}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#1e293b;">${value || '—'}</td>
    </tr>
  `
}

/** Internal notification for alexander@baterino.ro and razvan@baterino.ro */
function getInquiryNotificationTemplate(inquiry) {
  const domainLabel = DOMAIN_LABELS[inquiry.domain] || inquiry.domain
  const requestTypeLabel = REQUEST_TYPE_LABELS[inquiry.requestType] || inquiry.requestType

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact nou – ${SITE_NAME}</title>
</head>
<body style="margin: 0; padding: 24px; background: #f5f5f5;">
  <div style="${baseStyles()} background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <h1 style="margin: 0 0 24px; font-size: 22px; color: #1a1a1a;">
      Solicitare nouă de contact
    </h1>
    <table style="width:100%;border-collapse:collapse;">
      ${row('Nume', inquiry.name)}
      ${row('Companie', inquiry.company)}
      ${row('Email', inquiry.email)}
      ${row('Divizie', domainLabel)}
      ${row('Tip solicitare', requestTypeLabel)}
      ${row('Nr. înregistrare', inquiry.registrationNumber || '—')}
      ${row('IP', inquiry.ip || '—')}
    </table>
    <div style="margin-top:20px;padding:16px;background:#f8fafc;border-radius:8px;border-left:4px solid #0f172a;">
      <div style="font-weight:600;color:#475569;margin-bottom:8px;">Mesaj:</div>
      <div style="white-space:pre-wrap;color:#1e293b;">${(inquiry.message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>
    <p style="margin: 24px 0 0; font-size: 12px; color: #94a3b8;">
      Trimis la: ${inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleString('ro-RO') : '—'}
    </p>
  </div>
</body>
</html>
  `.trim()
}

/** User confirmation with registration number (from no-reply@baterino.ro) */
function getInquiryConfirmationTemplate(inquiry) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmare solicitare – ${SITE_NAME}</title>
</head>
<body style="margin: 0; padding: 24px; background: #f5f5f5;">
  <div style="${baseStyles()} background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <h1 style="margin: 0 0 16px; font-size: 24px; color: #1a1a1a;">
      Buna ziua, ${(inquiry.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}!
    </h1>
    <p style="margin: 0 0 24px; color: #555;">
      Am primit solicitarea ta și te vom contacta în cel mai scurt timp.
    </p>
    <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0;">
      <span style="font-size: 18px; font-weight: 600; color: #64748b;">Nr. înregistrare</span>
      <div style="font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #1e293b; margin-top: 8px;">
        ${inquiry.registrationNumber || '—'}
      </div>
    </div>
    <p style="margin: 0; font-size: 14px; color: #64748b;">
      Păstrează acest număr pentru referință. Echipa noastră va răspunde în maxim 24 de ore.
    </p>
    <p style="margin: 24px 0 0; font-size: 12px; color: #94a3b8;">
      ${SITE_NAME}
    </p>
  </div>
</body>
</html>
  `.trim()
}

module.exports = { getInquiryNotificationTemplate, getInquiryConfirmationTemplate }
