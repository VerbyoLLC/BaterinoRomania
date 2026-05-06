const SITE_NAME = process.env.SITE_NAME || 'Baterino Romania'

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeHtmlAttr(s) {
  return escapeHtml(s).replace(/'/g, '&#39;')
}

/**
 * Email către prieten: cod recomandare trimis în numele clientului.
 * @param {{ senderName: string, referralCode: string, registerUrl: string }} p
 */
function getReferralInviteTemplate({ senderName, referralCode, registerUrl }) {
  const name = escapeHtml(senderName || 'Un client Baterino')
  const code = escapeHtml(referralCode)
  const url = escapeHtmlAttr(registerUrl)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>5% reducere – Cod recomandare – ${SITE_NAME}</title>
</head>
<body style="margin: 0; padding: 24px; background: #f5f5f5;">
  <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1a1a1a;line-height:1.6;max-width:560px;margin:0 auto;background:#fff;padding:32px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    <p style="margin:0 0 16px;font-size:16px;">Bună,</p>
    <p style="margin:0 0 16px;font-size:16px;">
      <strong>${name}</strong> ți-a trimis codul său de <strong>5% reducere</strong> ${SITE_NAME}, din programul „Știu de la vecinu’”.
    </p>
    <div style="margin:24px 0;padding:16px 20px;background:#f8fafc;border-radius:10px;border-left:4px solid #0f172a;font-family:Consolas,Monaco,monospace;font-size:20px;font-weight:700;letter-spacing:0.05em;color:#0f172a;">
      ${code}
    </div>
    <p style="margin:0 0 16px;font-size:15px;color:#334155;">
      Poți folosi acest cod la <strong>prima ta comandă</strong>, conform termenilor programului de recomandare.
    </p>
    <p style="margin:24px 0 0;">
      <a href="${url}" style="display:inline-block;padding:12px 24px;background:#0f172a;color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">Creează cont sau autentifică-te</a>
    </p>
    <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">
      Mesaj trimis automat la solicitarea unui client ${SITE_NAME}.
    </p>
  </div>
</body>
</html>
  `.trim()
}

module.exports = { getReferralInviteTemplate }
