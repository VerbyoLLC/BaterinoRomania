const SITE_NAME = process.env.SITE_NAME || 'Baterino Romania'

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function getAdminPasswordResetNotificationTemplate({ adminEmail, resetUrl }) {
  const safeAdminEmail = escapeHtml(adminEmail)
  const safeResetUrl = escapeHtml(resetUrl)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset parolă admin – ${SITE_NAME}</title>
</head>
<body style="margin: 0; padding: 24px; background: #f5f5f5; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#fff;padding:32px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);color:#1a1a1a;line-height:1.6;">
    <h1 style="margin:0 0 16px;font-size:22px;">Reset parolă panou admin</h1>
    <p style="margin:0 0 16px;color:#555;">
      A fost solicitată resetarea parolei pentru contul de administrator <strong>${safeAdminEmail}</strong> pe ${SITE_NAME}.
    </p>
    <p style="margin:0 0 24px;color:#555;">
      Link-ul de mai jos poate fi folosit pentru a seta o parolă nouă. Nu îl trimiteți persoanelor neautorizate.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${safeResetUrl}" style="display:inline-block;background:#1e293b;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;">
        Resetează parola admin
      </a>
    </div>
    <p style="margin:0;font-size:14px;color:#64748b;">
      Link-ul expiră în 30 de minute. Dacă nu recunoașteți solicitarea, ignorați acest email.
    </p>
  </div>
</body>
</html>
  `.trim()
}

module.exports = { getAdminPasswordResetNotificationTemplate }
