/**
 * Email de confirmare comandă rezidențială + atașament proformă PDF.
 *
 * Trimis imediat după plasare. Conține:
 *  - antet cu numărul comenzii
 *  - sumarul produselor (titlu, qty, preț unitar TVA inclus, total linie)
 *  - total general (TVA inclus)
 *  - adresa de livrare (PJ: distinctă; PF: aceeași cu facturarea)
 *  - blocul „Cum să plătești prin transfer bancar” (beneficiar, IBAN, sumă, referință, termen)
 *  - notă despre atașamentul PDF
 */

const SITE_NAME = process.env.SITE_NAME || 'Baterino Romania'
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://baterino.ro').replace(/\/$/, '')

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function fmtMoneyRo(n) {
  const x = Number(n)
  if (!Number.isFinite(x)) return '0,00'
  const parts = x.toFixed(2).split('.')
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${intPart},${parts[1]}`
}

function fmtQty(n) {
  const x = Number(n)
  if (!Number.isFinite(x)) return '0'
  if (Math.abs(x - Math.round(x)) < 1e-9) return String(Math.round(x))
  return fmtMoneyRo(x)
}

function safeCurrency(c) {
  const s = String(c || 'RON').trim().toUpperCase()
  return /^[A-Z]{3}$/.test(s) ? s : 'RON'
}

function joinDelimited(parts) {
  return parts
    .map((p) => String(p ?? '').trim())
    .filter(Boolean)
    .join(', ')
}

function baseStyles() {
  return "font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1a1a1a;line-height:1.55;max-width:640px;margin:0 auto"
}

function lineRow(line, currency) {
  const qty = fmtQty(line.quantity)
  const unit = fmtMoneyRo(line.unitPriceInclVat)
  const total = fmtMoneyRo(line.lineTotalInclVat || Number(line.unitPriceInclVat) * Number(line.quantity))
  return `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;">
        <div style="font-weight:600;">${escapeHtml(line.productTitle || 'Produs')}</div>
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#334155;text-align:center;white-space:nowrap;">${escapeHtml(qty)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#334155;text-align:right;white-space:nowrap;">${escapeHtml(unit)} ${escapeHtml(currency)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:600;text-align:right;white-space:nowrap;">${escapeHtml(total)} ${escapeHtml(currency)}</td>
    </tr>
  `
}

function deliveryAddressBlock(order) {
  const isCompany = String(order.buyerType || '').toLowerCase() === 'company'
  const useDelivery = order.deliveryDifferent && order.delAddress
  const street = String((useDelivery ? order.delAddress : order.billAddress) || '').trim()
  const county = String((useDelivery ? order.delCounty : order.billCounty) || '').trim()
  const city = String((useDelivery ? order.delCity : order.billCity) || '').trim()
  const postal = String((useDelivery ? order.delPostal : order.billPostal) || '').trim()
  const recipient = isCompany
    ? joinDelimited([`${order.firstName || ''} ${order.lastName || ''}`, order.companyName])
    : `${order.firstName || ''} ${order.lastName || ''}`.trim()
  const cityLine = joinDelimited([city && `Oraș: ${city}`, county && `Județ: ${county}`, postal && `Cod poștal: ${postal}`])
  return `
    <div style="margin:20px 0 0;padding:16px;background:#f8fafc;border-radius:10px;border-left:4px solid #0f172a;">
      <div style="font-weight:600;color:#475569;margin-bottom:6px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">Adresă livrare</div>
      ${recipient ? `<div style="color:#0f172a;font-weight:600;margin-bottom:4px;">${escapeHtml(recipient)}</div>` : ''}
      ${street ? `<div style="color:#334155;">${escapeHtml(street)}</div>` : ''}
      ${cityLine ? `<div style="color:#334155;">${escapeHtml(cityLine)}</div>` : ''}
      <div style="color:#334155;">România</div>
    </div>
  `
}

function paymentBlock({ supplierName, supplierCui, ibanRon, bankName, totalIncl, currency, reference, paymentDueStr }) {
  const rows = []
  if (supplierName) rows.push(['Beneficiar', supplierName])
  if (supplierCui) rows.push(['CUI', supplierCui])
  if (ibanRon) rows.push(['IBAN', ibanRon])
  if (bankName) rows.push(['Bancă', bankName])
  rows.push(['Sumă de plată', `${fmtMoneyRo(totalIncl)} ${currency}`])
  rows.push(['Referință plată', reference])
  if (paymentDueStr) rows.push(['Termen plată', paymentDueStr])

  const html = rows
    .map(
      ([k, v]) => `
      <tr>
        <td style="padding:6px 0;color:#64748b;font-size:13px;width:160px;">${escapeHtml(k)}</td>
        <td style="padding:6px 0;color:#0f172a;font-weight:600;font-size:13px;">${escapeHtml(v)}</td>
      </tr>`,
    )
    .join('')

  return `
    <div style="margin:24px 0 0;padding:20px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;">
      <h2 style="margin:0 0 12px;font-size:16px;color:#0f172a;">Cum să plătești prin transfer bancar</h2>
      <p style="margin:0 0 14px;color:#475569;font-size:13px;">
        Folosește datele de mai jos pentru a iniția plata din internet banking sau de la bancă. La descrierea plății adaugă <strong style="color:#0f172a;">${escapeHtml(reference)}</strong> ca să identificăm rapid comanda.
      </p>
      <table style="width:100%;border-collapse:collapse;">${html}</table>
      <p style="margin:14px 0 0;color:#64748b;font-size:12px;line-height:1.55;">
        Proforma atașată conține toate detaliile. După confirmarea plății îți pregătim comanda și revenim cu actualizări pe email.
      </p>
    </div>
  `
}

/**
 * @param {{
 *   order: any,
 *   lines: Array<{ productTitle: string, quantity: number, unitPriceInclVat: any, lineTotalInclVat: any, vatPercent: any }>,
 *   currency: string,
 *   supplier: { name: string, cui: string, ibanRon: string, bankName: string },
 *   payment: { reference: string, paymentDueStr: string },
 *   totalIncl: number,
 * }} params
 */
function getResidentialOrderProformaTemplate(params) {
  const { order, lines, supplier, payment, totalIncl } = params
  const currency = safeCurrency(params.currency || order.currency)
  const firstName = String(order.firstName || '').trim()
  const greetName = firstName ? escapeHtml(firstName) : 'salut'
  const linesHtml = lines.map((L) => lineRow(L, currency)).join('')

  const ordersUrl = `${FRONTEND_URL}/cont/comenzi`

  return `
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmare comandă ${escapeHtml(order.orderNumber || '')} – ${escapeHtml(SITE_NAME)}</title>
</head>
<body style="margin:0;padding:24px;background:#f5f5f5;">
  <div style="${baseStyles()};background:#fff;padding:32px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    <h1 style="margin:0 0 8px;font-size:22px;color:#0f172a;">Mulțumim pentru comandă, ${greetName}!</h1>
    <p style="margin:0 0 18px;color:#475569;font-size:14px;">
      Comanda ta a fost înregistrată. Atașat la acest email găsești proforma în PDF; păstrează-o pentru referință.
    </p>

    <div style="background:#f8fafc;border:1px dashed #cbd5e1;border-radius:10px;padding:16px;text-align:center;margin:0 0 22px;">
      <div style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#64748b;">Număr comandă</div>
      <div style="font-size:22px;font-weight:700;letter-spacing:2px;color:#0f172a;margin-top:6px;">${escapeHtml(order.orderNumber || '')}</div>
    </div>

    <h2 style="margin:24px 0 8px;font-size:15px;color:#0f172a;">Detalii comandă</h2>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
      <thead>
        <tr style="background:#f1f5f9;">
          <th style="padding:10px 12px;text-align:left;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#475569;">Produs</th>
          <th style="padding:10px 12px;text-align:center;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#475569;white-space:nowrap;">Cant.</th>
          <th style="padding:10px 12px;text-align:right;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#475569;white-space:nowrap;">Preț unitar</th>
          <th style="padding:10px 12px;text-align:right;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#475569;white-space:nowrap;">Total linie</th>
        </tr>
      </thead>
      <tbody>${linesHtml}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding:14px 12px;text-align:right;font-size:13px;color:#475569;font-weight:600;">Total comandă (TVA inclus)</td>
          <td style="padding:14px 12px;text-align:right;font-size:15px;color:#0f172a;font-weight:700;white-space:nowrap;">${escapeHtml(fmtMoneyRo(totalIncl))} ${escapeHtml(currency)}</td>
        </tr>
      </tfoot>
    </table>

    ${deliveryAddressBlock(order)}

    ${paymentBlock({
      supplierName: supplier.name,
      supplierCui: supplier.cui,
      ibanRon: supplier.ibanRon,
      bankName: supplier.bankName,
      totalIncl,
      currency,
      reference: order.orderNumber || '',
      paymentDueStr: payment.paymentDueStr,
    })}

    <p style="margin:24px 0 0;color:#475569;font-size:13px;line-height:1.6;">
      Vezi statusul comenzii oricând în <a href="${escapeHtml(ordersUrl)}" style="color:#0f172a;font-weight:600;">contul tău Baterino</a>. Dacă ai întrebări, răspunde la acest email și te ajutăm cât putem de repede.
    </p>

    <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">${escapeHtml(SITE_NAME)}</p>
  </div>
</body>
</html>
  `.trim()
}

module.exports = { getResidentialOrderProformaTemplate }
