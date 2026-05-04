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

function divider() {
  return '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />'
}

/**
 * După aprobarea contului de partener de către echipa Baterino.
 * @param {{ loginUrl: string }} opts
 */
function getPartnerAccountApprovedTemplate({ loginUrl }) {
  const url = escapeHtml(loginUrl || 'https://app.baterino.com/login')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cont partener aprobat – ${escapeHtml(SITE_NAME)}</title>
</head>
<body style="margin: 0; padding: 24px; background: #f5f5f5;">
  <div style="${baseStyles()} background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <p style="margin: 0 0 20px; color: #334155; font-size: 16px;">
      Bună ziua,
    </p>
    <p style="margin: 0 0 20px; color: #334155;">
      Ești oficial parte din rețeaua Baterino — și suntem încântați să te avem alături de noi.
    </p>
    <p style="margin: 0 0 20px; color: #334155;">
      Cererea ta de parteneriat a fost analizată și aprobată. Contul tău este acum activ și poți începe imediat.
    </p>
    <p style="margin: 0 0 24px;">
      <a href="${url}" style="display: inline-block; color: #0f766e; font-weight: 600; font-size: 16px; text-decoration: none;">👉 ACCESEAZĂ CONTUL TĂU</a>
    </p>
    ${divider()}
    <p style="margin: 0 0 16px; color: #0f172a; font-weight: 700; font-size: 14px; letter-spacing: 0.02em;">
      CA PARTENER BATERINO, BENEFICIEZI DE:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 0 0 12px;">
      <tr>
        <td style="vertical-align: top; width: 28px; color: #334155; font-size: 16px;">✅</td>
        <td style="padding-bottom: 16px;">
          <p style="margin: 0 0 6px; color: #0f172a; font-weight: 600;">Prețuri competitive</p>
          <p style="margin: 0; color: #334155; font-size: 15px;">
            Acces la produse LiFePO<sub>4</sub> de calitate superioară la prețuri care îți permit marje sănătoase pe piața locală.
          </p>
        </td>
      </tr>
      <tr>
        <td style="vertical-align: top; width: 28px; color: #334155; font-size: 16px;">✅</td>
        <td style="padding-bottom: 16px;">
          <p style="margin: 0 0 6px; color: #0f172a; font-weight: 600;">Responsabilitate față de clientul final</p>
          <p style="margin: 0; color: #334155; font-size: 15px;">
            Tu ești fața brandului în piața ta. Îți oferim toate instrumentele necesare pentru a oferi o experiență impecabilă clienților tăi.
          </p>
        </td>
      </tr>
      <tr>
        <td style="vertical-align: top; width: 28px; color: #334155; font-size: 16px;">✅</td>
        <td style="padding-bottom: 16px;">
          <p style="margin: 0 0 6px; color: #0f172a; font-weight: 600;">Suport tehnic dedicat</p>
          <p style="margin: 0; color: #334155; font-size: 15px;">
            Echipa noastră tehnică este disponibilă pentru a te sprijini pre-vânzare, la instalare și post-vânzare — oriunde te afli.
          </p>
        </td>
      </tr>
      <tr>
        <td style="vertical-align: top; width: 28px; color: #334155; font-size: 16px;">✅</td>
        <td style="padding-bottom: 0;">
          <p style="margin: 0 0 6px; color: #0f172a; font-weight: 600;">Promovarea afacerii tale</p>
          <p style="margin: 0; color: #334155; font-size: 15px;">
            Baterino investește activ în vizibilitatea partenerilor săi: materiale de marketing, prezență digitală și suport în piața locală.
          </p>
        </td>
      </tr>
    </table>
    ${divider()}
    <p style="margin: 0 0 24px; color: #334155;">
      Dacă ai întrebări sau ai nevoie de asistență pentru a începe, nu ezita să ne contactezi direct.
    </p>
    <p style="margin: 0; color: #334155;">
      Cu stimă,<br />
      Echipa Baterino<br />
      <a href="mailto:partneri@baterino.ro" style="color: #0f766e;">partneri@baterino.ro</a>
    </p>
  </div>
</body>
</html>
  `.trim()
}

module.exports = { getPartnerAccountApprovedTemplate }
