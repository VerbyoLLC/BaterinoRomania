const { parsePartnerChannelType } = require('../lib/partner-channel.js')
const {
  formatAgentDisplayName,
  formatPartnerDisplayName,
  defaultPartnerPortalUrl,
} = require('./partner-welcome-email.js')

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

function defaultPartnerProductsUrl() {
  const base = envTrim('FRONTEND_URL')
  if (base) return `${base.replace(/\/+$/, '')}/partner/produse`
  const login = defaultPartnerPortalUrl()
  if (login.includes('/login')) return login.replace(/\/login\/?$/, '/partner/produse')
  return 'https://app.baterino.com/partner/produse'
}

function defaultPartnerContractUrl() {
  const base = envTrim('FRONTEND_URL')
  if (base) return `${base.replace(/\/+$/, '')}/partner`
  const login = defaultPartnerPortalUrl()
  if (login.includes('/login')) return login.replace(/\/login\/?$/, '/partner')
  return 'https://app.baterino.com/partner'
}

function formatAgentInitials(agent) {
  if (!agent) return 'BP'
  const a = String(agent.firstName || '').trim().charAt(0) || ''
  const b = String(agent.lastName || '').trim().charAt(0) || ''
  return (a + b).toUpperCase() || 'BP'
}

function formatAgentRole(agent) {
  if (!agent) return 'Consultant parteneri'
  return String(agent.agentKind || '').trim().toLowerCase() === 'ai' ? 'Asistent virtual' : 'Agent de vânzări'
}

function formatPhoneDisplay(raw) {
  const t = String(raw ?? '').trim()
  if (!t) return '—'
  const d = t.replace(/\D/g, '')
  if (d.length >= 10 && d.startsWith('40')) {
    return `+${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}`.trim()
  }
  return t
}

function telHref(raw) {
  const d = String(raw ?? '').replace(/\D/g, '')
  if (!d) return ''
  if (d.startsWith('40')) return `tel:+${d}`
  if (d.startsWith('0')) return `tel:+40${d.slice(1)}`
  return `tel:+${d}`
}

function tierLabelForPartnerChannel(channel) {
  const ch = parsePartnerChannelType(channel)
  if (ch === 'distributor') return 'Partener Distribuitor'
  if (ch === 'hybrid') return 'Partener Hibrid'
  return 'Partener Instalator'
}

function formatDiscountPercent(pct) {
  const n = Number(pct)
  if (Number.isNaN(n)) return '0'
  return Number.isInteger(n) ? String(n) : String(n).replace(/\.0+$/, '')
}

/**
 * Email trimis partenerului când reducerea este aprobată și prețurile devin active.
 * @param {{
 *   partnerName?: string
 *   companyName: string
 *   discountPercent: number
 *   tierLabel?: string
 *   agent?: { firstName?: string, lastName?: string, email?: string, phone?: string, whatsapp?: string, agentKind?: string } | null
 *   contractUrl?: string
 *   portalUrl?: string
 * }} opts
 */
function getPartnerDiscountApprovedTemplate(opts) {
  const partnerName = escapeHtml(opts.partnerName || 'Partener')
  const companyName = escapeHtml(opts.companyName || 'compania ta')
  const discountPct = escapeHtml(formatDiscountPercent(opts.discountPercent))
  const tierLabel = escapeHtml(opts.tierLabel || 'Partener Baterino')
  const agent = opts.agent || null
  const agentName = escapeHtml(formatAgentDisplayName(agent))
  const agentInitials = escapeHtml(formatAgentInitials(agent))
  const agentRole = escapeHtml(formatAgentRole(agent))
  const agentEmail = escapeHtml(String(agent?.email || '').trim() || 'parteneri@baterino.ro')
  const agentEmailMailto = escapeHtml(`mailto:${String(agent?.email || '').trim() || 'parteneri@baterino.ro'}`)
  const agentPhoneRaw = String(agent?.phone || agent?.whatsapp || '').trim()
  const agentPhone = escapeHtml(formatPhoneDisplay(agentPhoneRaw))
  const agentPhoneTel = escapeHtml(telHref(agentPhoneRaw) || '#')
  const contractUrl = escapeHtml(opts.contractUrl || defaultPartnerContractUrl())
  const portalUrl = escapeHtml(opts.portalUrl || defaultPartnerProductsUrl())

  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>Prețurile tale de partener sunt active</title>
</head>
<body style="margin:0;padding:0;background:#eef1f7;font-family:'DM Sans',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

<!-- preheader (hidden) -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#eef1f7;">
  Reducerea ta este activă și prețurile personalizate sunt disponibile în portal. Mai rămâne să semnăm contractul.
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
              &#10003;&nbsp; Reducere aprobată
            </div>
            <h1 style="margin:0 0 10px;font-size:23px;line-height:1.25;color:#0a0e1a;font-weight:700;">
              Prețurile tale de partener sunt active, ${partnerName}!
            </h1>
            <p style="margin:0;font-size:14.5px;line-height:1.6;color:#46506b;">
              Am stabilit împreună reducerea pentru <strong style="color:#0a0e1a;">${companyName}</strong>. De acum, când te conectezi în portal vezi prețurile tale personalizate, fără TVA, la fiecare produs.
            </p>
          </td>
        </tr>

        <!-- discount highlight -->
        <tr>
          <td style="padding:22px 28px 4px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:14px;background:#0a0e1a;background-image:linear-gradient(120deg,#1e46b4,#0a1230);">
              <tr>
                <td style="padding:18px 22px;">
                  <div style="font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:#9fb2ff;font-weight:700;margin-bottom:4px;">Reducerea ta de partener</div>
                  <div style="font-size:30px;font-weight:700;color:#ffffff;line-height:1;">${discountPct}%&nbsp;<span style="font-size:14px;font-weight:600;color:#cdd9ff;">&middot; ${tierLabel}</span></div>
                  <div style="font-size:12px;color:#aebbe6;margin-top:6px;">Aplicată automat la toate produsele eligibile, în portal.</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- agent card -->
        <tr>
          <td style="padding:22px 28px 4px;">
            <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#1e46b4;">
              Contactul tău direct la Baterino
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fc;border:1px solid #e6eaf2;border-radius:14px;">
              <tr>
                <td width="68" valign="top" style="padding:16px 0 16px 16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                    <td width="52" height="52" align="center" valign="middle" style="background:#1e46b4;border-radius:50%;color:#ffffff;font-size:18px;font-weight:700;">${agentInitials}</td>
                  </tr></table>
                </td>
                <td valign="middle" style="padding:16px 16px 16px 4px;">
                  <div style="font-size:15px;font-weight:700;color:#0a0e1a;">${agentName}</div>
                  <div style="font-size:12px;color:#6b7488;margin-bottom:8px;">${agentRole} &middot; Baterino Partener</div>
                  <div style="font-size:12.5px;line-height:1.7;">
                    <a href="${agentEmailMailto}" style="color:#1e46b4;text-decoration:none;font-weight:600;">${agentEmail}</a><br>
                    <a href="${agentPhoneTel}" style="color:#0a0e1a;text-decoration:none;font-weight:600;">${agentPhone}</a>
                  </div>
                </td>
              </tr>
            </table>
            <p style="margin:9px 2px 0;font-size:11.5px;color:#9aa3b5;line-height:1.5;">
              ${agentName} te însoțește pe tot parcursul colaborării &mdash; comenzi, livrări și suport.
            </p>
          </td>
        </tr>

        <!-- next step: contract -->
        <tr>
          <td style="padding:24px 28px 6px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eff2f8;">
              <tr><td style="padding-top:22px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#1e46b4;">Următorul pas</p>
                <h2 style="margin:0 0 8px;font-size:18px;color:#0a0e1a;font-weight:700;">Semnăm contractul de parteneriat</h2>
                <p style="margin:0;font-size:13.5px;line-height:1.6;color:#46506b;">
                  Mai e un singur pas până la finalizare: semnezi contractul de parteneriat, care confirmă oficial colaborarea și condițiile comerciale. După semnare, poți plasa comenzi <strong style="color:#0a0e1a;">oricând, automat</strong>, la prețurile tale preferențiale.
                </p>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td align="center" style="padding:22px 28px 8px;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="background:#0a0e1a;border-radius:11px;">
                  <a href="${contractUrl}" target="_blank" style="display:inline-block;padding:14px 34px;font-size:14.5px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:11px;">
                    Semnează contractul de parteneriat &rarr;
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:13px 0 0;font-size:12px;color:#6b7488;">
              Sau <a href="${portalUrl}" target="_blank" style="color:#1e46b4;text-decoration:none;font-weight:600;">vezi-ți prețurile în portal</a> &rarr;
            </p>
          </td>
        </tr>

        <!-- footer -->
        <tr>
          <td style="background:#f6f8fc;padding:20px 28px;border-top:1px solid #eff2f8;">
            <p style="margin:0;font-size:11px;line-height:1.6;color:#9aa3b5;">
              Baterino Energy SRL &middot; Otopeni, Ilfov, România<br>
              Ai primit acest e-mail pentru că reducerea ta de partener a fost activată în portalul Baterino.
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
  getPartnerDiscountApprovedTemplate,
  formatAgentInitials,
  formatAgentRole,
  tierLabelForPartnerChannel,
  defaultPartnerContractUrl,
  defaultPartnerProductsUrl,
  formatPartnerDisplayName,
}
