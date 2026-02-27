const SITE_NAME = process.env.SITE_NAME || 'Baterino Romania'

function baseStyles() {
  return "font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1a1a1a;line-height:1.6;max-width:480px;margin:0 auto"
}

function getPasswordResetTemplate({ resetUrl, email }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resetează parola – ${SITE_NAME}</title>
</head>
<body style="margin: 0; padding: 24px; background: #f5f5f5;">
  <div style="${baseStyles()} background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <h1 style="margin: 0 0 16px; font-size: 24px; color: #1a1a1a;">
      Resetează parola
    </h1>
    <p style="margin: 0 0 24px; color: #555;">
      Ai solicitat resetarea parolei pentru contul tău pe ${SITE_NAME}. Apasă butonul de mai jos pentru a-ți seta o parolă nouă.
    </p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${resetUrl}" style="display: inline-block; background: #1e293b; color: #fff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px;">
        Resetează parola
      </a>
    </div>
    <p style="margin: 0; font-size: 14px; color: #64748b;">
      Link-ul expiră în 30 de minute. Dacă nu ai cerut resetarea parolei, poți ignora acest email.
    </p>
    <p style="margin: 24px 0 0; font-size: 12px; color: #94a3b8;">
      Trimis la: ${email}
    </p>
  </div>
</body>
</html>
  `.trim()
}

module.exports = { getPasswordResetTemplate }
