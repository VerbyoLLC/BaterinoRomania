const SITE_NAME = process.env.SITE_NAME || 'Baterino Romania'

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function baseStyles() {
  return "font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1a1a1a;line-height:1.6;max-width:560px;margin:0 auto"
}

/** După trimiterea completă a formularului de partener (activitate + contact); cont încă neaprobat. */
function getPartnerApplicationReceivedTemplate({ companyName }) {
  const company = escapeHtml(companyName?.trim() || '')
  const companyPhrase = company ? ` (${company})` : ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cerere partener – ${escapeHtml(SITE_NAME)}</title>
</head>
<body style="margin: 0; padding: 24px; background: #f5f5f5;">
  <div style="${baseStyles()} background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <p style="margin: 0 0 20px; color: #334155; font-size: 16px;">
      Bună ziua,
    </p>
    <p style="margin: 0 0 20px; color: #334155;">
      Suntem bucuroși să îți confirmăm că am primit cererea ta de a deveni partener Baterino${companyPhrase} — un prim pas important într-o colaborare pe care ne dorim să o construim împreună.
    </p>
    <p style="margin: 0 0 12px; color: #334155; font-weight: 600;">
      Iată ce urmează:
    </p>
    <ol style="margin: 0 0 20px; padding-left: 20px; color: #334155;">
      <li style="margin-bottom: 10px;">Analizăm cererea ta — echipa noastră verifică informațiile trimise.</li>
      <li style="margin-bottom: 10px;">Îți atribuim un agent dedicat — vei avea o persoană de contact directă care te va ghida pe tot parcursul procesului.</li>
      <li style="margin-bottom: 10px;">Te contactăm telefonic — dacă nu răspunzi, îți trimitem un email, iar tu ne poți contacta oricând la momentul potrivit pentru tine.</li>
      <li style="margin-bottom: 0;">Aprobăm contul tău — și ești gata să faci parte din rețeaua Baterino.</li>
    </ol>
    <p style="margin: 0 0 24px; color: #334155;">
      Îți mulțumim că ai ales să faci parte din rețeaua Baterino.
    </p>
    <p style="margin: 0; color: #334155;">
      Cu drag,<br />
      Echipa Baterino Romania
    </p>
  </div>
</body>
</html>
  `.trim()
}

module.exports = { getPartnerApplicationReceivedTemplate }
