const SITE_NAME = process.env.SITE_NAME || 'Baterino Romania'

function baseStyles() {
  return "font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1a1a1a;line-height:1.6;max-width:520px;margin:0 auto"
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** CTA button + fallback link for email clients that strip buttons. */
function getVerifyLinkTemplate({ verifyUrl, email, role }) {
  const isPartner = role === 'partener'
  const title = isPartner ? 'Bine ai venit, Partener!' : 'Bine ai venit!'
  const intro = isPartner
    ? `Ai creat un cont de instalator/distribuitor pe ${SITE_NAME}. Apasă butonul de mai jos pentru a-ți confirma adresa de email și a activa contul.`
    : `Ai creat un cont client pe ${SITE_NAME}. Apasă butonul de mai jos pentru a-ți confirma adresa de email și a activa contul.`
  const safeUrl = escapeHtml(verifyUrl)
  const safeEmail = escapeHtml(email)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmă contul – ${SITE_NAME}</title>
</head>
<body style="margin: 0; padding: 24px; background: #f5f5f5;">
  <div style="${baseStyles()} background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <h1 style="margin: 0 0 16px; font-size: 24px; color: #1a1a1a;">
      ${title}
    </h1>
    <p style="margin: 0 0 24px; color: #555;">
      ${intro}
    </p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${safeUrl}" style="display: inline-block; background: #0f172a; color: #fff !important; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 10px;">
        Confirmă contul
      </a>
    </div>
    <p style="margin: 0 0 12px; font-size: 13px; color: #64748b;">
      Linkul expiră în 15 minute. Dacă nu ai creat tu acest cont, poți ignora acest email.
    </p>
    <p style="margin: 0; font-size: 12px; color: #94a3b8; word-break: break-all;">
      Dacă butonul nu merge, copiază această adresă în browser:<br/>
      <a href="${safeUrl}" style="color: #475569;">${safeUrl}</a>
    </p>
    <p style="margin: 24px 0 0; font-size: 12px; color: #94a3b8;">
      Trimis la: ${safeEmail}
    </p>
  </div>
</body>
</html>
  `.trim()
}

module.exports = { getVerifyLinkTemplate }
