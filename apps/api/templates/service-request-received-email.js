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

function row(label, value) {
  return `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#475569;width:150px;">${escapeHtml(label)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#1e293b;">${escapeHtml(value || '—')}</td>
    </tr>
  `
}

/**
 * Email trimis utilizatorului după crearea unei cereri de service.
 * Conține ID-ul cererii și un rezumat al produsului + problemei descrise.
 */
function getServiceRequestReceivedTemplate({
  requestNumber,
  firstName,
  productTitle,
  serialNumber,
  modelNumber,
  problemDescription,
}) {
  const greetingName = String(firstName || '').trim()
  const greeting = greetingName ? `Bună, ${escapeHtml(greetingName)}!` : 'Bună ziua,'
  const problemHtml = String(problemDescription || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cerere service primită – ${escapeHtml(SITE_NAME)}</title>
</head>
<body style="margin: 0; padding: 24px; background: #f5f5f5;">
  <div style="${baseStyles()} background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <h1 style="margin: 0 0 16px; font-size: 22px; color: #1a1a1a;">
      ${greeting}
    </h1>
    <p style="margin: 0 0 20px; color: #334155;">
      Am primit cererea ta pentru produsul de mai jos, împreună cu detaliile transmise. Echipa Divizia de Service a luat în lucru problema semnalată și revenim cu un răspuns în cel mai scurt timp.
    </p>

    <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
      <span style="font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Număr cerere</span>
      <div style="font-size: 22px; font-weight: 700; letter-spacing: 2px; color: #1e293b; margin-top: 8px; font-family: 'Courier New', monospace;">
        ${escapeHtml(requestNumber)}
      </div>
    </div>

    <h2 style="margin: 24px 0 12px; font-size: 16px; color: #0f172a;">Detalii produs</h2>
    <table style="width:100%;border-collapse:collapse;">
      ${row('Produs', productTitle)}
      ${row('SN', serialNumber)}
      ${row('Model', modelNumber)}
    </table>

    <div style="margin-top:20px;padding:16px;background:#f8fafc;border-radius:8px;border-left:4px solid #0f172a;">
      <div style="font-weight:600;color:#475569;margin-bottom:8px;">Problema descrisă:</div>
      <div style="white-space:pre-wrap;color:#1e293b;">${problemHtml || '—'}</div>
    </div>

    <p style="margin: 24px 0 0; color: #334155;">
      Te rugăm să păstrezi acest număr pentru referință. Dacă avem nevoie de detalii suplimentare, te vom contacta pe email sau telefonic.
    </p>

    <p style="margin: 24px 0 0; color: #334155;">
      Cu drag,<br />
      Divizia de Service – ${escapeHtml(SITE_NAME)}
    </p>
  </div>
</body>
</html>
  `.trim()
}

module.exports = { getServiceRequestReceivedTemplate }
