/**
 * Previzualizare HTML: pornește API-ul, apoi deschide în browser
 *   http://localhost:3001/api/referral-invite-template
 * (PORT din env sau 3001.) Opțional: ?sender=Nume+Prenume&code=BAT-123
 * În producție preview-ul este oprit; pentru excepții: BATERINO_DEBUG_REFERRAL_EMAIL=1
 */
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

/** Rând beneficiu: layout pe &lt;table&gt; + icon PNG (Outlook nu suportă bine flex și Unicode ✓). */
function benefitRow(iconSrc, title, bodyHtml) {
  const ic = escapeHtmlAttr(iconSrc)
  const t = escapeHtml(title)
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px;border-collapse:separate;border-spacing:0;">
  <tr>
    <td style="background:#f7f7f7;border-radius:10px;border-left:3px solid #1a1a2e;padding:0;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td width="48" valign="middle" style="padding:14px 8px 14px 14px;">
            <img src="${ic}" width="28" height="28" alt="" style="display:block;border:0;width:28px;height:28px;" />
          </td>
          <td valign="top" style="padding:14px 16px 14px 4px;">
            <div class="benefit-title">${t}</div>
            <div class="benefit-desc">${bodyHtml}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

/**
 * Email către prieten: cod recomandare trimis în numele clientului.
 * @param {{ senderName: string, referralCode: string, registerUrl: string, assetBaseUrl: string }} p
 */
function getReferralInviteTemplate({
  senderName,
  referralCode,
  registerUrl,
  assetBaseUrl,
}) {
  const name = escapeHtml(senderName || 'Un client Baterino')
  const code = escapeHtml(referralCode)
  const url = escapeHtmlAttr(registerUrl)
  const safeSite = escapeHtml(SITE_NAME)
  // Path fără spații — unii clienți de email tratează prost %20 în URL; fișier duplicat în web/public/images/email/
  const logoSrc = escapeHtmlAttr(
    `${String(assetBaseUrl || '').replace(/\/$/, '')}/images/email/baterino-white-logo.png`,
  )
  const iconCheckSrc = escapeHtmlAttr(
    `${String(assetBaseUrl || '').replace(/\/$/, '')}/images/email/benefit-check.png`,
  )

  return `
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cod de reducere ${safeSite}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: #f0f0eb;
      font-family: 'DM Sans', Arial, Helvetica, sans-serif;
      padding: 40px 20px;
      color: #1a1a2e;
    }

    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
    }

    .header {
      background-color: #1a1a2e;
      border-radius: 16px 16px 0 0;
      padding: 28px 40px;
    }

    .logo-img {
      display: block;
      height: auto;
      max-height: 26px;
      width: auto;
      max-width: 112px;
    }

    .header-subtitle {
      font-size: 11px;
      color: #ffffff !important;
      letter-spacing: 2px;
      text-transform: uppercase;
      font-weight: 500;
      margin-bottom: 6px;
      opacity: 1 !important;
    }

    .header-tag {
      font-size: 16px;
      color: #e8a020;
      letter-spacing: 3px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .body {
      background-color: #ffffff;
      padding: 48px 40px;
    }

    .greeting {
      font-size: 15px;
      color: #555;
      margin-bottom: 12px;
      font-weight: 300;
    }

    .intro {
      font-size: 17px;
      line-height: 1.6;
      color: #1a1a2e;
      margin-bottom: 32px;
      font-weight: 400;
    }

    .intro strong {
      color: #1a1a2e;
      font-weight: 600;
    }

    .code-block {
      background: #f7f7f7;
      border-radius: 12px;
      padding: 28px 32px;
      margin-bottom: 40px;
      text-align: center;
    }

    .code-badge {
      display: inline-block;
      background-color: #e8a020;
      color: #1a1a2e;
      font-size: 13px;
      font-weight: 700;
      padding: 8px 20px;
      border-radius: 20px;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 18px;
    }

    .code-label {
      font-size: 11px;
      color: #888;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 12px;
      font-weight: 500;
    }

    .code-value-box {
      background: #f7f7f7;
      border: 1.5px dashed rgba(232,160,32,0.5);
      border-radius: 10px;
      padding: 16px 24px;
      display: inline-block;
      margin-bottom: 16px;
    }

    .code-value {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 30px;
      color: #1a1a2e;
      letter-spacing: 5px;
    }

    .copy-btn {
      display: inline-block;
      background-color: #e8a020;
      color: #1a1a2e !important;
      font-size: 13px;
      font-weight: 600;
      padding: 10px 24px;
      border-radius: 8px;
      text-decoration: none;
      letter-spacing: 0.5px;
    }

    .divider {
      height: 1px;
      background: #f0f0eb;
      margin: 36px 0;
    }

    .section-title {
      font-size: 12px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #e8a020;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .section-heading {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 22px;
      color: #1a1a2e;
      margin-bottom: 14px;
    }

    .section-text {
      font-size: 15px;
      line-height: 1.7;
      color: #555;
      font-weight: 300;
    }

    .benefits {
      margin-top: 36px;
    }

    .benefit-title {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 2px;
    }

    .benefit-desc {
      font-size: 13px;
      color: #777;
      font-weight: 300;
      line-height: 1.5;
    }

    .cta-block {
      margin-top: 40px;
      background: #f7f7f7;
      border-radius: 12px;
      padding: 32px;
      text-align: center;
    }

    .cta-text {
      font-size: 15px;
      color: #1a1a2e;
      margin-bottom: 20px;
      font-weight: 400;
      line-height: 1.6;
    }

    .cta-button {
      display: inline-block;
      background-color: #1a1a2e;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      padding: 14px 32px;
      border-radius: 8px;
      letter-spacing: 0.5px;
    }

    .footer {
      background-color: #1a1a2e;
      border-radius: 0 0 16px 16px;
      padding: 24px 40px;
      text-align: center;
    }

    .footer-text {
      font-size: 12px;
      color: #ffffff;
      line-height: 1.6;
      font-weight: 300;
    }

    .footer-text a {
      color: #ffffff;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">

    <div class="header">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <td align="left" valign="middle" style="vertical-align:middle;padding:0;width:1%;">
            <img class="logo-img" src="${logoSrc}" width="112" height="23" alt="Baterino" style="display:block;border:0;width:112px;max-width:112px;height:auto;max-height:26px;" />
          </td>
          <td align="right" valign="middle" style="vertical-align:middle;padding:0 0 0 16px;text-align:right;">
            <div class="header-subtitle" style="color:#ffffff;opacity:1;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;text-align:right;">Programul de reducere</div>
            <div class="header-tag" style="color:#e8a020;font-size:16px;letter-spacing:3px;text-transform:uppercase;font-weight:600;text-align:right;">Știu de la vecinu'</div>
          </td>
        </tr>
      </table>
    </div>

    <div class="body">

      <p class="greeting">Salut,</p>
      <p class="intro">
        <strong>${name}</strong> ți-a trimis un cod personal de reducere de <strong>5%</strong> pentru a-ți achiziționa o baterie LiFePO<sub>4</sub> de pe platforma Baterino.
      </p>

      <div class="code-block">
        <div class="code-badge">5% Reducere</div>
        <div class="code-label">Codul tău de reducere</div>
        <div class="code-value-box">
          <div class="code-value">${code}</div>
        </div>
        <br>
        <a class="copy-btn" href="${url}">Folosește codul pe site</a>
      </div>

      <div class="divider"></div>

      <div class="section-title">Programul de Reduceri</div>
      <div class="section-heading">„Știu de la vecinu'"</div>
      <p class="section-text">
        Este programul nostru prin care clienții Baterino pot oferi coduri de reducere prietenilor, vecinilor și familiei. Codul tău este dovada că cineva s-a gândit la tine.
      </p>

      <div class="divider"></div>

      <div class="section-title">Despre noi</div>
      <div class="section-heading">Cine suntem?</div>
      <p class="section-text">
        Suntem importatori și distribuitori de sisteme de stocare a energiei, cu prezență în România, Europa și Asia. Credem că autonomia energetică nu ar trebui să fie un privilegiu — de aceea oferim soluții LiFePO<sub>4</sub> de calitate superioară, durabile și accesibile, adaptate nevoilor reale ale fiecărui client.
        <br><br>
        După livrare, rămânem alături de tine. Serviciile noastre post-vânzare sunt construite în jurul clientului final — pentru că o baterie bună înseamnă și un partener de încredere pe termen lung.
      </p>

      <div class="divider"></div>

      <div class="section-title">Avantaje</div>
      <div class="section-heading">De ce să cumperi de la Baterino?</div>

      <div class="benefits">
        ${benefitRow(iconCheckSrc, 'Produse certificate', 'Baterii LiFePO<sub>4</sub> testate și omologate, cu BMS integrat și protecție completă.')}
        ${benefitRow(iconCheckSrc, 'Garanție 10 ani', 'Una dintre cele mai lungi garanții din industrie, pentru liniștea ta pe termen lung.')}
        ${benefitRow(iconCheckSrc, 'Livrare în toată România', 'Logistică coordonată, fără bătăi de cap.')}
        ${benefitRow(iconCheckSrc, 'Suport tehnic dedicat', 'Echipă disponibilă pentru întrebări despre instalare, compatibilitate și utilizare.')}
        ${benefitRow(iconCheckSrc, 'Prețuri accesibile', 'Cel mai bun raport calitate-preț de pe piața românească.')}
        ${benefitRow(iconCheckSrc, 'Programul Baterino SWAP', 'În caz de defecțiune tehnică, înlocuim bateria rapid, fără birocrație.')}
      </div>

      <div class="cta-block">
        <p class="cta-text">Folosește codul la prima comandă și reducerea de <strong>5%</strong> se aplică automat.</p>
        <a href="${url}" class="cta-button">Creează cont și folosește codul →</a>
      </div>

    </div>

    <div class="footer">
      <p class="footer-text">
        Mesaj trimis automat la solicitarea unui client ${safeSite}.<br>
        Dacă nu dorești să primești astfel de mesaje, poți ignora acest email.<br><br>
        <a href="${escapeHtmlAttr(assetBaseUrl || '')}">baterino.ro</a>
      </p>
    </div>

  </div>
</body>
</html>
  `.trim()
}

module.exports = { getReferralInviteTemplate }
