const SITE_NAME = process.env.SITE_NAME || 'Baterino Romania'

function envTrim(name, fallback = '') {
  const v = process.env[name]
  if (v == null || v === '') return fallback
  return String(v).trim()
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function defaultPartnerPortalUrl() {
  const explicit = envTrim('PARTNER_LOGIN_URL')
  if (explicit) return explicit
  const base = envTrim('FRONTEND_URL')
  if (base) return `${base.replace(/\/+$/, '')}/login`
  return 'https://app.baterino.com/login'
}

function defaultSupportEmail() {
  return envTrim('PARTNER_SUPPORT_EMAIL') || envTrim('SUPPORT_EMAIL') || 'suport@baterino.ro'
}

function defaultSupportPhone() {
  return envTrim('BATERINO_SUPPORT_PHONE') || envTrim('BATERINO_OFFICE_PHONE') || '+40 770 106 374'
}

function formatAgentDisplayName(agent) {
  if (!agent) return 'Echipa Baterino Partener'
  const first = String(agent.firstName || '').trim()
  const last = String(agent.lastName || '').trim()
  const full = [first, last].filter(Boolean).join(' ')
  return full || 'Echipa Baterino Partener'
}

function formatPartnerDisplayName(partner) {
  const first = String(partner?.contactFirstName || '').trim()
  const last = String(partner?.contactLastName || '').trim()
  const full = [first, last].filter(Boolean).join(' ')
  return full || first || 'Partener'
}

/**
 * Email de bun venit trimis partenerului după înregistrarea contului (profil companie creat).
 * @param {{
 *   partnerName?: string
 *   companyName: string
 *   portalUrl?: string
 *   agentName?: string
 *   supportEmail?: string
 *   supportPhone?: string
 * }} opts
 */
function getPartnerWelcomeTemplate(opts) {
  const partnerName = escapeHtml(opts.partnerName || 'Partener')
  const companyName = escapeHtml(opts.companyName || 'compania ta')
  const portalUrl = escapeHtml(opts.portalUrl || defaultPartnerPortalUrl())
  const agentName = escapeHtml(opts.agentName || 'Echipa Baterino Partener')
  const supportEmail = escapeHtml(opts.supportEmail || defaultSupportEmail())
  const supportPhone = escapeHtml(opts.supportPhone || defaultSupportPhone())
  const supportMailto = escapeHtml(`mailto:${opts.supportEmail || defaultSupportEmail()}`)

  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>Bine ai venit la Baterino Partener</title>
</head>
<body style="margin:0;padding:0;background:#eef1f7;font-family:'DM Sans',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

<!-- preheader (hidden) -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#eef1f7;">
  Contul tău de partener a fost creat cu succes. Iată cum obții prețul tău personalizat.
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f7;">
  <tr>
    <td align="center" style="padding:28px 14px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e6eaf2;">

        <!-- header -->
        <tr>
          <td style="background:#0a0e1a;padding:22px 28px;">
            <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:.02em;">BATERINO</span>
            <span style="color:#6f7da0;font-size:12px;font-weight:600;letter-spacing:.18em;margin-left:8px;">PARTENER</span>
          </td>
        </tr>

        <!-- hero -->
        <tr>
          <td style="padding:32px 28px 6px;">
            <div style="display:inline-block;background:#e8f7f0;color:#15a05f;font-size:12px;font-weight:700;border-radius:20px;padding:6px 13px;margin-bottom:18px;">
              &#10003;&nbsp; Cont creat cu succes
            </div>
            <h1 style="margin:0 0 10px;font-size:23px;line-height:1.25;color:#0a0e1a;font-weight:700;">
              Bine ai venit, ${partnerName}!
            </h1>
            <p style="margin:0;font-size:14.5px;line-height:1.6;color:#46506b;">
              Contul de partener pentru <strong style="color:#0a0e1a;">${companyName}</strong> a fost înregistrat și ai deja acces în portalul Baterino Partener. Urmează câțiva pași simpli până la prețul tău personalizat.
            </p>
          </td>
        </tr>

        <!-- why no prices yet -->
        <tr>
          <td style="padding:20px 28px 4px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fc;border:1px solid #e6eaf2;border-radius:12px;">
              <tr>
                <td style="padding:14px 16px;font-size:13px;line-height:1.55;color:#46506b;">
                  Ca partener, <strong style="color:#0a0e1a;">prețurile sunt personalizate</strong> &mdash; le stabilim împreună, în funcție de profilul tău și de prima comandă. De aceea, în portal vezi gama completă, dar prețul tău apare după ce vorbim.
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- next steps -->
        <tr>
          <td style="padding:24px 28px 6px;">
            <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#1e46b4;">
              Ce ai de făcut în continuare
            </p>

            <!-- step 1 -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="42" valign="top" style="padding-bottom:16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                    <td width="30" height="30" align="center" valign="middle" style="background:#eef2fe;border-radius:8px;color:#1e46b4;font-size:14px;font-weight:700;">1</td>
                  </tr></table>
                </td>
                <td valign="top" style="padding-bottom:16px;">
                  <div style="font-size:14px;font-weight:700;color:#0a0e1a;">Loghează-te în cont</div>
                  <div style="font-size:12.5px;color:#6b7488;line-height:1.5;">Ai deja acces în portalul de partener Baterino.</div>
                </td>
              </tr>
            </table>
            <!-- step 2 -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="42" valign="top" style="padding-bottom:16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                    <td width="30" height="30" align="center" valign="middle" style="background:#eef2fe;border-radius:8px;color:#1e46b4;font-size:14px;font-weight:700;">2</td>
                  </tr></table>
                </td>
                <td valign="top" style="padding-bottom:16px;">
                  <div style="font-size:14px;font-weight:700;color:#0a0e1a;">Creează prima comandă</div>
                  <div style="font-size:12.5px;color:#6b7488;line-height:1.5;">Alegi produsele și cantitățile dorite și ne trimiți comanda.</div>
                </td>
              </tr>
            </table>
            <!-- step 3 -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="42" valign="top" style="padding-bottom:16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                    <td width="30" height="30" align="center" valign="middle" style="background:#eef2fe;border-radius:8px;color:#1e46b4;font-size:14px;font-weight:700;">3</td>
                  </tr></table>
                </td>
                <td valign="top" style="padding-bottom:16px;">
                  <div style="font-size:14px;font-weight:700;color:#0a0e1a;">Te sunăm înapoi să ne cunoaștem</div>
                  <div style="font-size:12.5px;color:#6b7488;line-height:1.5;">În maxim 1 zi lucrătoare te contactăm personal.</div>
                </td>
              </tr>
            </table>
            <!-- step 4 -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="42" valign="top" style="padding-bottom:16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                    <td width="30" height="30" align="center" valign="middle" style="background:#eef2fe;border-radius:8px;color:#1e46b4;font-size:14px;font-weight:700;">4</td>
                  </tr></table>
                </td>
                <td valign="top" style="padding-bottom:16px;">
                  <div style="font-size:14px;font-weight:700;color:#0a0e1a;">Stabilim împreună reducerea ta</div>
                  <div style="font-size:12.5px;color:#6b7488;line-height:1.5;">Prețul tău de partener, personalizat în funcție de comandă.</div>
                </td>
              </tr>
            </table>
            <!-- step 5 -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="42" valign="top" style="padding-bottom:16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                    <td width="30" height="30" align="center" valign="middle" style="background:#eef2fe;border-radius:8px;color:#1e46b4;font-size:14px;font-weight:700;">5</td>
                  </tr></table>
                </td>
                <td valign="top" style="padding-bottom:16px;">
                  <div style="font-size:14px;font-weight:700;color:#0a0e1a;">Semnăm contractul de parteneriat</div>
                  <div style="font-size:12.5px;color:#6b7488;line-height:1.5;">Oficializăm colaborarea și activăm prețurile tale.</div>
                </td>
              </tr>
            </table>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
              <tr>
                <td style="background:#e8f7f0;border:1px solid #cdeede;border-radius:12px;padding:13px 15px;">
                  <div style="font-size:13px;line-height:1.55;color:#0d6b48;">
                    &#9889;&nbsp; După ce primești reducerea și prețurile preferențiale, poți comanda <strong style="color:#0a4a32;">oricând, automat</strong>, direct prin platformă.
                  </div>
                </td>
              </tr>
            </table>
  </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td align="center" style="padding:26px 28px 8px;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="background:#0a0e1a;border-radius:11px;">
                  <a href="${portalUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:14.5px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:11px;">
                    Loghează-te în cont &rarr;
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:12px 0 0;font-size:11.5px;color:#9aa3b5;">
              Prima comandă nu este obligatorie &mdash; prețul și condițiile le stabilim împreună înainte de confirmare.
            </p>
          </td>
        </tr>

        <!-- support -->
        <tr>
          <td style="padding:18px 28px 8px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eff2f8;">
              <tr>
                <td style="padding-top:18px;font-size:12.5px;line-height:1.6;color:#6b7488;">
                  Contul tău este gestionat de <strong style="color:#0a0e1a;">${agentName}</strong>. Ai întrebări? Scrie-ne la
                  <a href="${supportMailto}" style="color:#1e46b4;text-decoration:none;font-weight:600;">${supportEmail}</a>
                  sau sună la <strong style="color:#0a0e1a;">${supportPhone}</strong>.
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- footer -->
        <tr>
          <td style="background:#f6f8fc;padding:20px 28px;border-top:1px solid #eff2f8;">
            <p style="margin:0;font-size:11px;line-height:1.6;color:#9aa3b5;">
              Baterino Energy SRL &middot; Otopeni, Ilfov, România<br>
              Acest e-mail a fost trimis pentru că ai creat un cont de partener pe portalul Baterino.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`
}

module.exports = {
  getPartnerWelcomeTemplate,
  formatAgentDisplayName,
  formatPartnerDisplayName,
  defaultPartnerPortalUrl,
  defaultSupportEmail,
  defaultSupportPhone,
}
