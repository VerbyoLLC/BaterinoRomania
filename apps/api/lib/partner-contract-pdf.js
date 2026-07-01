/**
 * HTML + PDF pentru Acordul de Parteneriat Baterino.
 * PDF-ul este generat la semnarea digitală și arhivat în R2.
 */
const crypto = require('crypto')
const { renderWarrantyPdf } = require('./warranty-pdf')
const {
  derivePartnerChannelTypeFromActivities,
  parsePartnerChannelType,
} = require('./partner-channel.js')

const BATERINO = {
  legalName: 'BATERINO ENERGY S.R.L.',
  address: 'Str. 23 August Nr. 244-43A, Camera 1, Oraș Otopeni, Jud. Ilfov, România',
  tradeRegister: '—',
  cui: '42707733',
  representative: 'Razvan Nechifor',
  representativeRole: 'Administrator',
}

const CONSENT_TEXT = 'Am citit și sunt de acord cu termenii prezentului Acord de Parteneriat.'

const PARTNER_CONTRACT_FOOTER_TEMPLATE =
  '<div style="width:100%;font-size:8.5pt;color:#6b7280;font-family:Segoe UI,Arial,sans-serif;text-align:center;padding:0 14mm;">Pagina <span class="pageNumber"></span></div>'

const PARTNER_CONTRACT_PDF_RENDER_OPTS = {
  displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate: PARTNER_CONTRACT_FOOTER_TEMPLATE,
  margin: { top: '0', right: '0', bottom: '12mm', left: '0' },
}

function renderPartnerContractPdfBuffer(html) {
  return renderWarrantyPdf(html, PARTNER_CONTRACT_PDF_RENDER_OPTS)
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatRoDate(date) {
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatRoDateTime(date) {
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return '—'
  const local = d.toLocaleString('ro-RO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const utc = d.toISOString()
  return `${local} (UTC: ${utc})`
}

function buildContractNumber(partnerId) {
  const tail = String(partnerId || '')
    .replace(/[^a-z0-9]/gi, '')
    .slice(-8)
    .toUpperCase()
  return `AP-${tail || '00000000'}`
}

function buildPartnerAddress(partner) {
  const parts = [
    partner.companyStreet,
    partner.companyCity,
    partner.companyCounty,
    partner.companyPostalCode,
  ]
    .map((s) => String(s || '').trim())
    .filter(Boolean)
  if (parts.length) return parts.join(', ')
  return String(partner.address || '').trim() || '—'
}

function partnerChannelTypeLabelRo(partner) {
  const channel = partner?.partnerChannelType
    ? parsePartnerChannelType(partner.partnerChannelType)
    : derivePartnerChannelTypeFromActivities(partner?.activityTypes)
  if (channel === 'distributor') return 'Distribuitor'
  if (channel === 'hybrid') return 'Instalator și Distribuitor'
  return 'Instalator'
}

/**
 * Amprentă SHA-256 a conținutului contractului la momentul semnării (audit SES).
 * @param {object} partner
 * @param {Date|string} signedAt
 * @param {{ signerRole?: string, signerIp?: string }} opts
 */
function computeDocumentFingerprint(partner, signedAt, opts = {}) {
  const signedIso = signedAt instanceof Date ? signedAt.toISOString() : new Date(signedAt).toISOString()
  const payload = JSON.stringify({
    version: '2026-06',
    contractNumber: buildContractNumber(partner.id),
    baterino: BATERINO,
    partner: {
      companyName: partner.companyName,
      cui: partner.cui,
      tradeRegisterNumber: partner.tradeRegisterNumber,
      address: buildPartnerAddress(partner),
      partnerChannelType: partnerChannelTypeLabelRo(partner),
      contactFirstName: partner.contactFirstName,
      contactLastName: partner.contactLastName,
      signerRole: opts.signerRole || '',
    },
    consentText: CONSENT_TEXT,
    signedAt: signedIso,
    signerIp: opts.signerIp || '',
  })
  return crypto.createHash('sha256').update(payload, 'utf8').digest('hex')
}

/**
 * @param {object} partner
 * @param {Date|string|null} signedAt
 * @param {{ draft?: boolean, signerRole?: string, signerIp?: string, documentFingerprint?: string }} [opts]
 */
function buildPartnerContractHtml(partner, signedAt, opts = {}) {
  const draft = opts.draft === true
  const signerRole = String(opts.signerRole || '').trim()
  const signerIp = String(opts.signerIp || '').trim()
  const documentFingerprint =
    String(opts.documentFingerprint || '').trim() ||
    (!draft && signedAt ? computeDocumentFingerprint(partner, signedAt, { signerRole, signerIp }) : '')

  const contractNumber = buildContractNumber(partner.id)
  const contractDate = draft ? new Date() : signedAt instanceof Date ? signedAt : new Date(signedAt)
  const contractDateLabel = formatRoDate(contractDate)

  const companyName = escapeHtml(partner.companyName || '—')
  const cui = escapeHtml(partner.cui || '—')
  const tradeRegister = escapeHtml(partner.tradeRegisterNumber || '—')
  const address = escapeHtml(buildPartnerAddress(partner))
  const contactFirstName = escapeHtml(partner.contactFirstName || '—')
  const contactLastName = escapeHtml(partner.contactLastName || '—')
  const contactRole = escapeHtml(signerRole || '—')
  const repName = escapeHtml(
    [partner.contactFirstName, partner.contactLastName].filter(Boolean).join(' ') || '—',
  )
  const channelLabel = escapeHtml(partnerChannelTypeLabelRo(partner))

  const signedAtLabel = draft ? '—' : formatRoDateTime(signedAt)
  const consentEscaped = escapeHtml(CONSENT_TEXT)

  const draftBanner = draft
    ? '<p class="draft-banner">Document pentru consultare — nesemnat. Semnează digital în platforma Baterino Partener.</p>'
    : ''

  const checkboxMark = draft ? '☐' : '☑'
  const auditIp = draft ? '—' : escapeHtml(signerIp || '—')
  const auditHash = draft ? '—' : escapeHtml(documentFingerprint || '—')
  const auditTimestamp = draft ? '—' : escapeHtml(signedAt instanceof Date ? signedAt.toISOString() : String(signedAt))

  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <title>Acord de Parteneriat Baterino — ${companyName}</title>
  <style>
    @page { size: A4; margin: 16mm 14mm 18mm; }
    * { box-sizing: border-box; }
    body {
      font-family: "Segoe UI", Arial, sans-serif;
      color: #0a0e1a;
      font-size: 9.5pt;
      line-height: 1.5;
      margin: 0;
    }
    h1 {
      font-size: 16pt;
      text-align: center;
      margin: 0 0 4mm;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    .doc-meta {
      text-align: center;
      font-size: 10pt;
      font-weight: 600;
      margin: 0 0 6mm;
      color: #374151;
    }
    hr {
      border: none;
      border-top: 1px solid #d1d5db;
      margin: 5mm 0;
    }
    h2 {
      font-size: 10.5pt;
      margin: 5mm 0 2mm;
      page-break-after: avoid;
    }
    p { margin: 0 0 2.5mm; text-align: justify; }
    ul { margin: 1.5mm 0 3mm 5mm; padding: 0; }
    li { margin-bottom: 1.5mm; text-align: justify; }
    strong { font-weight: 700; }
    .parties { margin: 3mm 0 4mm; }
    .party-block { margin-bottom: 3mm; }
    .article { margin-bottom: 3mm; page-break-inside: avoid; }
    .sub { margin-left: 0; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 3mm 0;
      font-size: 9pt;
    }
    th, td {
      border: 1px solid #d1d5db;
      padding: 2mm 3mm;
      text-align: left;
      vertical-align: top;
    }
    th { background: #f3f4f6; width: 42%; font-weight: 600; }
    .sign-section {
      margin-top: 6mm;
      padding-top: 4mm;
      border-top: 1px solid #d1d5db;
      page-break-inside: avoid;
    }
    .consent-row {
      display: flex;
      align-items: flex-start;
      gap: 3mm;
      margin: 3mm 0 4mm;
      font-weight: 600;
    }
    .consent-box { font-size: 14pt; line-height: 1; }
    .audit {
      margin-top: 4mm;
      padding: 3mm 4mm;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      font-size: 8.5pt;
      color: #374151;
    }
    .audit p { margin: 0 0 1.5mm; text-align: left; }
    .baterino-sign {
      margin-top: 8mm;
      page-break-inside: avoid;
    }
    .draft-banner {
      background: #fffbeb;
      border: 1px solid #fcd34d;
      color: #92400e;
      padding: 3mm 4mm;
      border-radius: 4px;
      font-size: 9pt;
      font-weight: 600;
      margin-bottom: 5mm;
      text-align: center;
    }
    .signed-badge {
      display: inline-block;
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
      border-radius: 4px;
      padding: 1.5mm 3mm;
      font-size: 9pt;
      font-weight: 700;
      margin-top: 2mm;
    }
  </style>
</head>
<body>
  ${draftBanner}

  <h1>Acord de Parteneriat Baterino</h1>
  <p class="doc-meta"><strong>Nr. ${escapeHtml(contractNumber)}</strong> din data de <strong>${escapeHtml(contractDateLabel)}</strong></p>

  <hr>

  <h2>Părțile</h2>
  <div class="parties">
    <p class="party-block"><strong>1. ${escapeHtml(BATERINO.legalName)}</strong>, societate cu sediul în ${escapeHtml(BATERINO.address)}, înregistrată la Registrul Comerțului sub nr. ${escapeHtml(BATERINO.tradeRegister)}, CUI ${escapeHtml(BATERINO.cui)}, reprezentată legal prin <strong>${escapeHtml(BATERINO.representative)}</strong>, în calitate de <strong>${escapeHtml(BATERINO.representativeRole)}</strong>, denumită în continuare <strong>„Baterino"</strong>,</p>
    <p>și</p>
    <p class="party-block"><strong>2. ${companyName}</strong>, în calitate de <strong>${channelLabel}</strong>, cu sediul în ${address}, înregistrată la Registrul Comerțului sub nr. ${tradeRegister}, CUI ${cui}, reprezentată prin <strong>${repName}</strong>, în calitate de <strong>${contactRole}</strong>, denumită în continuare <strong>„Partenerul"</strong>,</p>
    <p>denumite împreună <strong>„Părțile"</strong> și individual <strong>„Partea"</strong>,</p>
    <p>au convenit încheierea prezentului Acord de Parteneriat (<strong>„Acordul"</strong>), în următoarele condiții:</p>
  </div>

  <hr>

  <div class="article">
    <h2>Articolul 1 — Definiții</h2>
    <ul>
      <li><strong>Produse</strong> — sistemele de stocare a energiei (BESS), bateriile LiFePO₄ și echipamentele conexe comercializate de Baterino.</li>
      <li><strong>Platformă</strong> — portalul de parteneri disponibil pe baterino.ro, prin care Partenerul plasează cereri și comenzi.</li>
      <li><strong>Preț de partener</strong> — prețul preferențial aplicat Partenerului, rezultat din reducerea personalizată alocată de Baterino.</li>
      <li><strong>PVR (Preț de vânzare recomandat)</strong> — prețul recomandat de vânzare către clientul final.</li>
      <li><strong>MAP (Preț minim de publicitate)</strong> — prețul minim sub care Partenerul nu poate afișa public Produsele.</li>
      <li><strong>Cerere de ofertă</strong> — solicitarea prin care Partenerul transmite Baterino intenția de achiziție înainte de activarea prețului de partener.</li>
    </ul>
  </div>

  <div class="article">
    <h2>Articolul 2 — Obiectul Acordului</h2>
    <p><strong>2.1.</strong> Prezentul Acord stabilește cadrul comercial în baza căruia Partenerul, în calitate de <strong>Distribuitor</strong> și/sau <strong>Instalator</strong>, comercializează și/sau instalează Produsele Baterino.</p>
    <p><strong>2.2.</strong> Acordul nu creează un raport de exclusivitate, agenție, asociere sau societate între Părți, dacă acest lucru nu este prevăzut expres în scris.</p>
    <p><strong>2.3.</strong> Prezentul Acord se completează cu Termenii și Condiționările generale baterino.ro; în caz de conflict pe aspectele de parteneriat B2B, prezentul Acord prevalează.</p>
  </div>

  <div class="article">
    <h2>Articolul 3 — Statutul de Partener</h2>
    <p><strong>3.1.</strong> Calitatea de Partener se dobândește în baza: (a) înregistrării contului pe Platformă, (b) aprobării de către Baterino în urma verificării (KYC), și (c) semnării prezentului Acord.</p>
    <p><strong>3.2.</strong> Partenerul acționează în nume și pe cont propriu. Nu are dreptul de a reprezenta, angaja sau obliga Baterino față de terți în lipsa unui mandat scris expres.</p>
    <p><strong>3.3.</strong> Baterino își rezervă dreptul de a accepta sau respinge orice cerere de parteneriat și de a stabili nivelul comercial alocat fiecărui Partener.</p>
  </div>

  <div class="article">
    <h2>Articolul 4 — Prețul de partener și reducerile</h2>
    <p><strong>4.1.</strong> Prețul de partener se activează după plasarea primei comenzi și alocarea de către Baterino a unei reduceri personalizate, comunicată Partenerului prin Platformă.</p>
    <p><strong>4.2.</strong> Reducerea se stabilește în funcție de volum, gama de Produse și condițiile comerciale agreate, putând fi revizuită periodic de Baterino, cu notificare prealabilă. Comenzile confirmate anterior rămân la prețul agreat.</p>
    <p><strong>4.3.</strong> Reducerile nu sunt cumulative cu alte promoții, dacă nu se prevede expres în scris.</p>
    <p><strong>4.4.</strong> Prețul de partener, nivelurile de reducere și condițiile comerciale sunt <strong>confidențiale</strong>, conform Articolului 10.</p>
  </div>

  <div class="article">
    <h2>Articolul 5 — Comenzi, plată și livrare</h2>
    <p><strong>5.1.</strong> Comenzile se plasează prin Platformă. Contractul de vânzare aferent fiecărei comenzi se încheie la confirmarea expresă a Baterino și/sau la emiterea facturii.</p>
    <p><strong>5.2.</strong> Condițiile de plată (avans, termen, modalitate) sunt cele indicate în ofertă/proformă. Pentru Produsele realizate la comandă, Baterino poate solicita avans.</p>
    <p><strong>5.3.</strong> Proprietatea asupra Produselor se transferă la plata integrală. Riscul se transferă la predarea către Partener sau către transportatorul desemnat de acesta.</p>
  </div>

  <div class="article">
    <h2>Articolul 6 — Obligațiile Partenerului</h2>
    <p><strong>6.1.</strong> Partenerul se obligă să:</p>
    <ul>
      <li>comercializeze și să instaleze Produsele cu respectarea standardelor de calitate, siguranță și a documentației tehnice;</li>
      <li>respecte PVR și MAP în comunicarea către clienții finali;</li>
      <li>nu afișeze public prețuri sub MAP;</li>
      <li>respecte legislația aplicabilă activității sale, inclusiv obligațiile fiscale și de protecție a consumatorului față de proprii clienți;</li>
      <li>protejeze imaginea și reputația Baterino.</li>
    </ul>
    <p><strong>6.2.</strong> <strong>Instalatorii</strong> execută montajul și punerea în funcțiune prin personal calificat, cu autorizările, calificările și asigurările necesare, conform normelor tehnice și de securitate aplicabile sistemelor BESS.</p>
    <p><strong>6.3.</strong> Partenerul nu poate acorda, promite sau modifica reduceri, garanții ori condiții comerciale în numele Baterino fără acordul scris prealabil al acestuia.</p>
  </div>

  <div class="article">
    <h2>Articolul 7 — Mărci și proprietate intelectuală</h2>
    <p><strong>7.1.</strong> Baterino acordă Partenerului un drept neexclusiv, netransferabil și revocabil de a utiliza mărcile, logo-urile și materialele Baterino exclusiv în scopul promovării și vânzării Produselor, pe durata Acordului.</p>
    <p><strong>7.2.</strong> La încetarea Acordului, Partenerul încetează orice utilizare a elementelor de brand Baterino.</p>
  </div>

  <div class="article">
    <h2>Articolul 8 — Garanție și suport post-vânzare</h2>
    <p><strong>8.1.</strong> Produsele beneficiază de garanția comunicată pe pagina de produs și în certificatul de garanție. Instalarea de către persoane neautorizate sau nerespectarea instrucțiunilor de montaj poate atrage pierderea garanției.</p>
    <p><strong>8.2.</strong> Baterino asigură suport tehnic și de service prin echipa locală, inclusiv programul <strong>SWAP</strong> (baterie de înlocuire temporară pe durata reparației), în condițiile comunicate.</p>
    <p><strong>8.3. Obligația de recuperare și înlocuire la client (SWAP).</strong> În cazul defectării unui Produs aflat în garanție, la un client căruia Partenerul i-a vândut și/sau instalat Produsul, Partenerul are obligația de a:</p>
    <ul>
      <li>recupera bateria defectă de la clientul respectiv;</li>
      <li>înlocui bateria defectă cu o baterie funcțională la locația clientului, asigurând continuitatea funcționării sistemului;</li>
      <li>asigura transportul bateriei defecte către Baterino, în vederea trimiterii în service, cu respectarea normelor de ambalare și de transport aplicabile bateriilor (mărfuri periculoase — ADR Clasa 9).</li>
    </ul>
    <p><strong>8.4. Înlocuirea de către Baterino.</strong> În schimbul bateriei defecte predate către Baterino pentru service, Baterino livrează Partenerului o baterie nouă, astfel încât Partenerul să poată onora înlocuirea la client. Condițiile, termenele și costurile de transport aferente acestui schimb sunt cele agreate între Părți; pentru Produsele aflate în garanție și utilizate conform documentației tehnice, schimbul se realizează fără costul Produsului de înlocuire.</p>
  </div>

  <div class="article">
    <h2>Articolul 9 — Obligațiile Baterino</h2>
    <p><strong>9.1.</strong> Baterino se obligă să: pună la dispoziție Platforma și prețul de partener alocat; asigure stocul și livrarea conform condițiilor agreate; ofere suport tehnic, manuale și materiale de instruire; și să promoveze Partenerul ca partener autorizat în rețeaua Baterino, după caz.</p>
  </div>

  <div class="article">
    <h2>Articolul 10 — Confidențialitate</h2>
    <p><strong>10.1.</strong> Părțile păstrează confidențialitatea asupra informațiilor comerciale, prețurilor de partener, reducerilor și a oricăror date schimbate în executarea Acordului, pe durata acestuia și 3 ani după încetare.</p>
  </div>

  <div class="article">
    <h2>Articolul 11 — Durată și încetare</h2>
    <p><strong>11.1.</strong> Acordul se încheie pe durată nedeterminată și produce efecte de la data semnării.</p>
    <p><strong>11.2.</strong> Oricare Parte poate denunța unilateral Acordul cu un preaviz scris de 30 de zile.</p>
    <p><strong>11.3.</strong> Acordul poate înceta de drept, fără preaviz și fără intervenția instanței (pact comisoriu), în caz de încălcare gravă a obligațiilor, neremediată în 15 zile de la notificare.</p>
  </div>

  <div class="article">
    <h2>Articolul 12 — Răspundere și forță majoră</h2>
    <p><strong>12.1.</strong> Răspunderea fiecărei Părți se limitează, în măsura permisă de lege, la prejudiciul direct și previzibil. Nu se răspunde pentru prejudicii indirecte sau pierderi de profit.</p>
    <p><strong>12.2.</strong> Niciuna dintre Părți nu răspunde pentru neexecutarea cauzată de forță majoră sau caz fortuit, în condițiile legii.</p>
  </div>

  <div class="article">
    <h2>Articolul 13 — Protecția datelor</h2>
    <p><strong>13.1.</strong> Părțile prelucrează datele cu caracter personal în conformitate cu Regulamentul (UE) 2016/679 (GDPR) și legislația națională, fiecare în calitate de operator independent pentru datele pe care le prelucrează în scopuri proprii.</p>
  </div>

  <div class="article">
    <h2>Articolul 14 — Legea aplicabilă și litigii</h2>
    <p><strong>14.1.</strong> Prezentul Acord este guvernat de legea română. Litigiile se soluționează pe cale amiabilă, iar în caz contrar de către instanțele competente de la sediul Baterino.</p>
  </div>

  <div class="article">
    <h2>Articolul 15 — Dispoziții finale</h2>
    <p><strong>15.1.</strong> Orice modificare a Acordului se face în scris, prin act adițional acceptat de ambele Părți.</p>
    <p><strong>15.2.</strong> Prezentul Acord, împreună cu Termenii și Condiționările baterino.ro, constituie întregul acord dintre Părți cu privire la parteneriat.</p>
  </div>

  <hr>

  <div class="sign-section">
    <h2>Semnătură electronică (SES)</h2>
    <p>Prin bifarea casetei de mai jos și completarea datelor, reprezentantul Partenerului semnează prezentul Acord prin semnătură electronică simplă (SES), cu valoare juridică conform Regulamentului (UE) nr. 910/2014 (eIDAS) și legislației aplicabile.</p>

    <div class="consent-row">
      <span class="consent-box">${checkboxMark}</span>
      <span><strong>${consentEscaped}</strong></span>
    </div>

    <table>
      <tr><th>Nume</th><td>${contactLastName}</td></tr>
      <tr><th>Prenume</th><td>${contactFirstName}</td></tr>
      <tr><th>Funcție în cadrul Partenerului</th><td>${contactRole}</td></tr>
      <tr><th>Denumire Partener</th><td>${companyName}</td></tr>
      <tr><th>Data și ora semnării</th><td>${escapeHtml(signedAtLabel)}</td></tr>
    </table>

    <div class="audit">
      <p><strong>Registru de audit (completat automat de Platformă):</strong></p>
      <p>Marcaj temporal server (UTC): ${auditTimestamp}</p>
      <p>Adresă IP semnatar: ${auditIp}</p>
      <p>Amprentă document (SHA-256): ${auditHash}</p>
      <p>Textul consimțământului afișat: ${consentEscaped}</p>
    </div>

    ${draft ? '' : '<p class="signed-badge">Semnat digital</p>'}
  </div>

  <div class="baterino-sign">
    <p><strong>Pentru Baterino Energy S.R.L.</strong><br>
    ${escapeHtml(BATERINO.representative)}, ${escapeHtml(BATERINO.representativeRole)}</p>
  </div>
</body>
</html>`
}

/**
 * @param {object} partner
 * @param {Date|string} signedAt
 * @returns {Promise<Buffer>}
 */
async function renderPartnerContractPdf(partner, signedAt, opts = {}) {
  const html = buildPartnerContractHtml(partner, signedAt, opts)
  return renderPartnerContractPdfBuffer(html)
}

/** PDF draft for partners who have not signed yet (read before sign). */
async function renderPartnerContractPreviewPdf(partner) {
  const html = buildPartnerContractHtml(partner, null, { draft: true })
  return renderPartnerContractPdfBuffer(html)
}

module.exports = {
  buildPartnerContractHtml,
  renderPartnerContractPdf,
  renderPartnerContractPreviewPdf,
  computeDocumentFingerprint,
  formatRoDate,
  CONSENT_TEXT,
}
