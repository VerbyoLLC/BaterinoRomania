/**
 * HTML proforma invoice template — layout aligned with typical RO SmartBill-style proformas
 * (PROFORMA, serie/nr, furnizor, client, tabel TVA, termen plată, semnături).
 * Use with HTML→PDF (e.g. Puppeteer) or print-to-PDF in browser.
 */

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function fmtMoney(n) {
  const x = Number(n)
  if (!Number.isFinite(x)) return '0.00'
  return x.toFixed(2)
}

/** Absolute logo URL for print/PDF (browser nu poate încărca fișiere locale din API). */
function defaultProformaLogoUrl() {
  const base = String(process.env.FRONTEND_URL || process.env.BATERINO_ASSET_ORIGIN || 'https://baterino.ro')
    .trim()
    .replace(/\/$/, '')
  return `${base}/images/shared/baterino-logo-black.svg`
}

/**
 * @param {object} params
 * @param {string} params.series - ex. DIP, BAT
 * @param {string} params.number - ex. 0155 sau referință comandă
 * @param {string} params.dateStr - dd/mm/yyyy
 * @param {number} params.vatRatePercent
 * @param {object} params.supplier - { name, regCom, cui, address, ibanRon, bankName, ibanEur?, bankEur?, email?, web?, capitalSocial? }
 * @param {object} params.client - { name, regCom, cui, address, county }
 * @param {Array<{ index: number, name: string, um: string, qty: number, unitPriceExcl: number, lineTotalExcl: number, lineVat: number }>} params.lines
 * @param {string} params.paymentDueStr - dd/mm/yyyy
 * @param {string} [params.note]
 * @param {string} [params.preparedBy]
 * @param {string} [params.logoUrl] - ex. https://baterino.ro/images/shared/baterino-logo-black.svg
 * @returns {string} full HTML document
 */
function buildProformaHtml(params) {
  const {
    series,
    number,
    dateStr,
    vatRatePercent,
    supplier,
    client,
    lines,
    paymentDueStr,
    note = '',
    preparedBy = '',
    logoUrl: logoUrlParam,
  } = params
  const logoUrl = escapeHtml((logoUrlParam && String(logoUrlParam).trim()) || defaultProformaLogoUrl())

  let totalExcl = 0
  let totalVat = 0
  let totalIncl = 0
  for (const L of lines) {
    totalExcl += Number(L.lineTotalExcl) || 0
    totalVat += Number(L.lineVat) || 0
    totalIncl += (Number(L.lineTotalExcl) || 0) + (Number(L.lineVat) || 0)
  }

  const lineRows = lines
    .map(
      (L) => `
    <tr>
      <td class="c">${escapeHtml(String(L.index))}</td>
      <td class="l">${escapeHtml(L.name)}</td>
      <td class="c">${escapeHtml(L.um)}</td>
      <td class="r">${escapeHtml(fmtMoney(L.qty))}</td>
      <td class="r">${escapeHtml(fmtMoney(L.unitPriceExcl))}</td>
      <td class="r">${escapeHtml(fmtMoney(L.lineTotalExcl))}</td>
      <td class="r">${escapeHtml(fmtMoney(L.lineVat))}</td>
    </tr>`,
    )
    .join('')

  const sup = supplier || {}
  const cl = client || {}
  const ibanEurLine =
    sup.ibanEur && String(sup.ibanEur).trim()
      ? `<div class="small">IBAN(EUR) ${escapeHtml(sup.ibanEur)}${sup.bankEur ? ` ; ${escapeHtml(sup.bankEur)}` : ''}</div>`
      : ''

  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8" />
  <title>Proformă ${escapeHtml(series)} ${escapeHtml(number)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111; margin: 0; padding: 24px; }
    .wrap { max-width: 800px; margin: 0 auto; }
    .top { display: flex; align-items: flex-start; gap: 20px; margin-bottom: 18px; }
    .logo-col { flex-shrink: 0; padding-top: 2px; }
    .logo-col img.logo { height: 44px; width: auto; max-width: 150px; display: block; object-fit: contain; }
    .title-col { flex: 1; min-width: 0; }
    h1 { font-size: 18px; letter-spacing: 0.05em; margin: 0 0 8px 0; }
    .meta { margin-bottom: 0; line-height: 1.5; }
    .parties { display: flex; gap: 16px; align-items: stretch; margin-bottom: 16px; }
    .party { flex: 1; min-width: 0; border: 1px solid #333; padding: 10px 12px; line-height: 1.45; }
    .party-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #444; margin-bottom: 6px; }
    .block { margin-bottom: 14px; line-height: 1.45; }
    .block-title { font-weight: 700; margin-bottom: 4px; }
    table.grid { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 10px; }
    table.grid th, table.grid td { border: 1px solid #333; padding: 6px 5px; vertical-align: top; }
    table.grid th { background: #f0f0f0; font-weight: 700; text-align: center; }
    td.l { text-align: left; }
    td.r { text-align: right; }
    td.c { text-align: center; }
    .totals { margin: 12px 0; text-align: right; line-height: 1.6; }
    .totals strong { font-size: 12px; }
    .sign { margin-top: 32px; display: flex; gap: 24px; justify-content: space-between; }
    .sign-col { flex: 1; border-top: 1px solid #999; padding-top: 6px; min-height: 56px; font-size: 10px; color: #444; }
    .small { font-size: 10px; color: #333; margin-top: 16px; line-height: 1.45; }
    @media print {
      body { padding: 12px; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top">
      <div class="logo-col">
        <img class="logo" src="${logoUrl}" alt="Baterino" width="150" height="44" />
      </div>
      <div class="title-col">
        <h1>PROFORMA</h1>
        <div class="meta">
          Seria <strong>${escapeHtml(series)}</strong> nr. <strong>${escapeHtml(number)}</strong><br />
          Data (zi/luna/an): ${escapeHtml(dateStr)}<br />
          Cotă TVA: ${escapeHtml(String(vatRatePercent))}%
        </div>
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <div class="party-label">Furnizor</div>
        <div class="block-title">${escapeHtml(sup.name || '')}</div>
        ${sup.regCom ? `Reg. com.: ${escapeHtml(sup.regCom)}<br />` : ''}
        CIF: ${escapeHtml(sup.cui || '—')}<br />
        Adresă: ${escapeHtml(sup.address || '—')}<br />
        ${sup.ibanRon ? `IBAN(RON) ${escapeHtml(sup.ibanRon)}<br />` : ''}
        ${sup.bankName ? `Bancă: ${escapeHtml(sup.bankName)}` : ''}
      </div>
      <div class="party">
        <div class="party-label">Client</div>
        <div class="block-title">${escapeHtml(cl.name || '—')}</div>
        ${cl.regCom ? `Reg. com.: ${escapeHtml(cl.regCom)}<br />` : ''}
        CIF: ${cl.cui ? escapeHtml(cl.cui) : '—'}<br />
        Adresă: ${escapeHtml(cl.address || '—')}<br />
        ${cl.county ? `Județ: ${escapeHtml(cl.county)}` : ''}
      </div>
    </div>

    <table class="grid">
      <thead>
        <tr>
          <th>Nr. crt</th>
          <th>Denumirea produselor sau a serviciilor</th>
          <th>U.M.</th>
          <th>Cant.</th>
          <th>Preț unitar<br />(fără TVA)<br />-Lei-</th>
          <th>Valoarea<br />-Lei-</th>
          <th>Valoarea<br />TVA<br />-Lei-</th>
        </tr>
      </thead>
      <tbody>
        ${lineRows}
      </tbody>
    </table>

    <div class="totals">
      Total ${escapeHtml(fmtMoney(totalVat))} &nbsp;&nbsp; ${escapeHtml(fmtMoney(totalExcl))}<br />
      <strong>${escapeHtml(fmtMoney(totalIncl))} Total plată</strong>
    </div>

    <div class="meta">Termen plată: ${escapeHtml(paymentDueStr)}</div>
    ${note ? `<div class="small">${escapeHtml(note)}</div>` : ''}

    <div class="meta" style="margin-top:14px;">
      Întocmit de: ${escapeHtml(preparedBy || '—')}
    </div>

    <div class="sign">
      <div class="sign-col">Semnătură și<br />ștampilă<br />furnizorului</div>
      <div class="sign-col">Semnătură de primire:</div>
    </div>

    <div class="small">
      ${sup.name ? `${escapeHtml(sup.name)}` : ''}
      ${sup.capitalSocial ? `<br />Capital social: ${escapeHtml(sup.capitalSocial)}` : ''}
      ${sup.email ? `<br />Email: ${escapeHtml(sup.email)}` : ''}${sup.web ? `; Adresa web: ${escapeHtml(sup.web)}` : ''}
      ${ibanEurLine}
    </div>
  </div>
</body>
</html>`
}

function numDecimal(v) {
  if (v == null || v === '') return 0
  return parseFloat(String(v).replace(/\s/g, '').replace(',', '.')) || 0
}

/**
 * Map DB row + company snapshot to buildProformaHtml params.
 * @param {object} order - Prisma GuestResidentialOrder-like
 * @param {object} company - BaterinoCompany + bankAccounts[]
 * @param {object} [opts]
 * @param {string} [opts.proformaSeries] - default env BATERINO_PROFORMA_SERIA or BAT
 * @param {string} [opts.proformaNumber] - default order.orderNumber
 * @param {string} [opts.supplierRegCom] - optional, not în schema Prisma încă
 * @param {string} [opts.supplierEmail] - optional
 * @param {string} [opts.supplierWeb] - optional
 * @param {string} [opts.supplierCapital] - optional
 */
function mapGuestResidentialOrderToProforma(order, company, opts = {}) {
  const accounts = Array.isArray(company?.bankAccounts)
    ? [...company.bankAccounts].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    : []
  const ibanRonRow =
    accounts.find((a) => /RON/i.test(String(a.iban || '')) || /RON/i.test(String(a.bankName || ''))) || accounts[0]
  const ibanEurRow = accounts.find((a) => /EUR/i.test(String(a.iban || '')) || /EUR/i.test(String(a.bankName || '')))

  const vatRate = numDecimal(order.vatPercent) || 21
  const qty = Math.max(1, parseInt(String(order.quantity), 10) || 1)
  const unitIncl = numDecimal(order.unitPriceInclVat)
  const lineIncl = numDecimal(order.lineTotalInclVat) || unitIncl * qty
  const unitExcl = unitIncl > 0 ? unitIncl / (1 + vatRate / 100) : 0
  const lineExcl = unitExcl * qty
  const lineVat = lineIncl - lineExcl

  const d = order.createdAt ? new Date(order.createdAt) : new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const dateStr = `${dd}/${mm}/${yyyy}`

  const series = opts.proformaSeries || process.env.BATERINO_PROFORMA_SERIA || 'BAT'
  const number = opts.proformaNumber || order.orderNumber || order.id

  const clientName = `${order.lastName || ''} ${order.firstName || ''}`.trim()
  const clientAddress = [order.billAddress, order.billCity, order.billPostal].filter(Boolean).join(', ')

  const supplier = {
    name: company?.name || 'Baterino SRL',
    regCom: opts.supplierRegCom || process.env.BATERINO_REG_COM || '',
    cui:
      company?.cui && String(company.cui).trim()
        ? `RO${String(company.cui).replace(/^RO/i, '').trim()}`
        : '—',
    address: company?.address || '',
    ibanRon: ibanRonRow?.iban || '',
    bankName: ibanRonRow?.bankName || '',
    ibanEur: ibanEurRow?.iban || '',
    bankEur: ibanEurRow?.bankName || '',
    email: opts.supplierEmail || process.env.BATERINO_OFFICE_EMAIL || '',
    web: opts.supplierWeb || process.env.BATERINO_WEB || '',
    capitalSocial: opts.supplierCapital || process.env.BATERINO_CAPITAL_SOCIAL || '',
  }

  const client = {
    name: clientName,
    regCom: '',
    cui: '',
    address: clientAddress,
    county: order.billCounty || '',
  }

  const lines = [
    {
      index: 1,
      name: order.productTitle || 'Produs',
      um: 'buc',
      qty,
      unitPriceExcl: unitExcl,
      lineTotalExcl: lineExcl,
      lineVat,
    },
  ]

  return {
    series,
    number,
    dateStr,
    vatRatePercent: vatRate,
    supplier,
    client,
    lines,
    paymentDueStr: dateStr,
    note: `Referință comandă: ${order.orderNumber}. Email: ${order.email}. Tel: +40 ${order.phone}`,
    preparedBy: '—',
  }
}

function buildGuestOrderProformaHtml(order, company, opts) {
  return buildProformaHtml(mapGuestResidentialOrderToProforma(order, company, opts))
}

/** Dummy data for local preview — same shape as SmartBill-style proformas. */
function buildSampleProformaPreviewHtml() {
  return buildProformaHtml({
    series: 'DIP',
    number: '0155',
    dateStr: '01/04/2026',
    vatRatePercent: 21,
    supplier: {
      name: 'Baterino SRL',
      regCom: 'J40/12345/2020',
      cui: 'RO12345678',
      address: 'Str. Exemplu nr. 1, Mun. București, Sector 1',
      ibanRon: 'RO84BTRLRONCRT0123456789',
      bankName: 'Banca Transilvania',
      ibanEur: 'RO34BTRLEURCRT0987654321',
      bankEur: 'Banca Transilvania — cont EUR',
      email: 'office@baterino.ro',
      web: 'https://baterino.ro',
      capitalSocial: '200 lei',
    },
    client: {
      name: 'Popescu Ion',
      regCom: '',
      cui: '—',
      address: 'Str. Clientului nr. 10, București, cod 010101',
      county: 'București',
    },
    lines: [
      {
        index: 1,
        name: 'Sistem stocare energie BESS (exemplu catalog)',
        um: 'buc',
        qty: 1,
        unitPriceExcl: 48595.04,
        lineTotalExcl: 48595.04,
        lineVat: 10204.96,
      },
    ],
    paymentDueStr: '15/04/2026',
    note: 'Previzualizare șablon — date fictive.',
    preparedBy: '—',
  })
}

module.exports = {
  escapeHtml,
  buildProformaHtml,
  mapGuestResidentialOrderToProforma,
  buildGuestOrderProformaHtml,
  buildSampleProformaPreviewHtml,
}
