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

/** @param {'ro'|'en'|'zh'} locale */
function getReturRequestReceivedTemplate({
  locale,
  registrationNumber,
  firstName,
  orderNumber,
  productBrand,
  productModel,
}) {
  const lc = ['ro', 'en', 'zh'].includes(locale) ? locale : 'ro'
  const greetingName = String(firstName || '').trim()

  const t = {
    ro: {
      greeting: greetingName ? `Bună, ${escapeHtml(greetingName)}!` : 'Bună ziua,',
      lead: `Cererea ta de retur a fost înregistrată cu seria <strong>${escapeHtml(registrationNumber)}</strong>. Te rugăm să o folosești la orice corespondență cu noi.`,
      emailNote: 'Acest mesaj confirmă primirea cererii la adresa de email indicată în formular.',
      next: 'Echipa noastră te va contacta în curând cu pașii următori.',
      detailsTitle: 'Rezumat cerere',
      orderLabel: 'Număr comandă',
      productLabel: 'Produs',
    },
    en: {
      greeting: greetingName ? `Hello ${escapeHtml(greetingName)},` : 'Hello,',
      lead: `Your return request has been registered under reference <strong>${escapeHtml(registrationNumber)}</strong>. Please quote it in any communication with us.`,
      emailNote: 'This message confirms that we received your request at the email address you provided.',
      next: 'Our team will contact you shortly with the next steps.',
      detailsTitle: 'Request summary',
      orderLabel: 'Order number',
      productLabel: 'Product',
    },
    zh: {
      greeting: greetingName ? `${escapeHtml(greetingName)}，您好！` : '您好，',
      lead: `您的退货申请已登记，受理编号为 <strong>${escapeHtml(registrationNumber)}</strong>。与我们联系时请提供此编号。`,
      emailNote: '本邮件用于确认我们已收到您在表单中填写的邮箱所提交的申请。',
      next: '我们的团队将尽快与您联系并说明后续步骤。',
      detailsTitle: '申请摘要',
      orderLabel: '订单号',
      productLabel: '产品',
    },
  }[lc]

  const productLine = [productBrand, productModel].filter(Boolean).join(' — ') || '—'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(registrationNumber)} – ${escapeHtml(SITE_NAME)}</title>
</head>
<body style="margin: 0; padding: 24px; background: #f5f5f5;">
  <div style="${baseStyles()} background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <h1 style="margin: 0 0 16px; font-size: 22px; color: #1a1a1a;">
      ${t.greeting}
    </h1>
    <p style="margin: 0 0 12px; color: #334155;">
      ${t.lead}
    </p>
    <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
      <span style="font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">${lc === 'zh' ? '受理编号' : lc === 'en' ? 'Reference' : 'Serie înregistrare'}</span>
      <div style="font-size: 22px; font-weight: 700; letter-spacing: 2px; color: #1e293b; margin-top: 8px; font-family: 'Courier New', monospace;">
        ${escapeHtml(registrationNumber)}
      </div>
    </div>
    <p style="margin: 0 0 8px; color: #334155;">${t.emailNote}</p>
    <p style="margin: 0 0 20px; color: #334155;">${t.next}</p>

    <h2 style="margin: 24px 0 12px; font-size: 16px; color: #0f172a;">${t.detailsTitle}</h2>
    <table style="width:100%;border-collapse:collapse;">
      ${row(t.orderLabel, orderNumber)}
      ${row(t.productLabel, productLine)}
    </table>

    <p style="margin: 28px 0 0; font-size: 13px; color: #64748b;">
      ${escapeHtml(SITE_NAME)}
    </p>
  </div>
</body>
</html>
`
}

function subjectForLocale(locale, registrationNumber) {
  const lc = ['ro', 'en', 'zh'].includes(locale) ? locale : 'ro'
  if (lc === 'en') return `Return request ${registrationNumber} – ${SITE_NAME}`
  if (lc === 'zh') return `退货申请已受理 ${registrationNumber} – ${SITE_NAME}`
  return `Cerere retur înregistrată ${registrationNumber} – ${SITE_NAME}`
}

module.exports = { getReturRequestReceivedTemplate, subjectForLocale }
