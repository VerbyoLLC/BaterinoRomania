const SITE_NAME = process.env.SITE_NAME || 'Baterino Romania'

function baseStyles() {
  return "font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1a1a1a;line-height:1.6;max-width:480px;margin:0 auto"
}

function getAccountDeletedTemplate({ email }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cont șters – ${SITE_NAME}</title>
</head>
<body style="margin: 0; padding: 24px; background: #f5f5f5;">
  <div style="${baseStyles()} background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <h1 style="margin: 0 0 16px; font-size: 24px; color: #1a1a1a;">
      Contul tău a fost șters
    </h1>
    <p style="margin: 0 0 24px; color: #555;">
      Contul tău de partener pe ${SITE_NAME} a fost șters conform solicitării tale.
    </p>
    <ul style="margin: 0 0 24px; padding-left: 20px; color: #555;">
      <li>Toate datele personale au fost șterse permanent</li>
      <li>Nu vei mai primi niciun fel de corespondență din partea noastră</li>
    </ul>
    <p style="margin: 0; font-size: 14px; color: #64748b;">
      Dacă dorești să devii din nou partener Baterino, poți crea un cont nou oricând.
    </p>
    <p style="margin: 24px 0 0; font-size: 12px; color: #94a3b8;">
      Trimis la: ${email}
    </p>
  </div>
</body>
</html>
  `.trim()
}

module.exports = { getAccountDeletedTemplate }
