const SITE_NAME = process.env.SITE_NAME || 'Baterino Romania'

function baseStyles() {
  return "font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1a1a1a;line-height:1.6;max-width:480px;margin:0 auto"
}

function getClientTemplate({ code, email }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cod verificare – ${SITE_NAME}</title>
</head>
<body style="margin: 0; padding: 24px; background: #f5f5f5;">
  <div style="${baseStyles()} background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <h1 style="margin: 0 0 16px; font-size: 24px; color: #1a1a1a;">
      Bine ai venit, Client!
    </h1>
    <p style="margin: 0 0 24px; color: #555;">
      Ai creat un cont nou pe ${SITE_NAME}. Folosește codul de mai jos pentru a-ți activa contul.
    </p>
    <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0;">
      <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1e293b;">
        ${code}
      </span>
    </div>
    <p style="margin: 0; font-size: 14px; color: #64748b;">
      Codul expiră în 15 minute. Dacă nu ai cerut acest cod, poți ignora acest email.
    </p>
    <p style="margin: 24px 0 0; font-size: 12px; color: #94a3b8;">
      Trimis la: ${email}
    </p>
  </div>
</body>
</html>
  `.trim()
}

function getPartnerTemplate({ code, email }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cod verificare – ${SITE_NAME}</title>
</head>
<body style="margin: 0; padding: 24px; background: #f5f5f5;">
  <div style="${baseStyles()} background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <h1 style="margin: 0 0 16px; font-size: 24px; color: #1a1a1a;">
      Bine ai venit, Partener!
    </h1>
    <p style="margin: 0 0 24px; color: #555;">
      Ai creat un cont de instalator/distribuitor pe ${SITE_NAME}. Folosește codul de mai jos pentru a-ți activa contul.
    </p>
    <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0;">
      <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1e293b;">
        ${code}
      </span>
    </div>
    <p style="margin: 0; font-size: 14px; color: #64748b;">
      Codul expiră în 15 minute. Dacă nu ai cerut acest cod, poți ignora acest email.
    </p>
    <p style="margin: 24px 0 0; font-size: 12px; color: #94a3b8;">
      Trimis la: ${email}
    </p>
  </div>
</body>
</html>
  `.trim()
}

module.exports = { getClientTemplate, getPartnerTemplate }
