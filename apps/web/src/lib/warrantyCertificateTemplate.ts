/**
 * Şablon HTML pentru Certificatul de Garanţie generat la „Generează certificat
 * de garanţie”. Folosit de pagina de preview admin
 * (`/admin/warranty-certificate-preview`) pentru a putea atribui sursele de
 * date pe fiecare placeholder. Aceeaşi funcţie poate fi reutilizată ulterior
 * server-side pentru randare → PDF (Puppeteer / wkhtmltopdf etc).
 */

export type WarrantyCertificateFieldKey =
  | 'CERT_NUMBER'
  | 'BRAND'
  | 'CAPACITATE'
  | 'SERIAL_NUMBER'
  | 'MODEL_COD'
  | 'TENSIUNE'
  | 'DATA_FABRICATIEI'
  | 'DATA_VANZARII'
  | 'FURNIZOR_NUME'
  | 'FURNIZOR_CUI'
  | 'FURNIZOR_ADRESA'
  | 'FURNIZOR_TELEFON'
  | 'FURNIZOR_WEB'
  | 'BENEFICIAR_NUME'
  | 'BENEFICIAR_CUI'
  | 'BENEFICIAR_ADRESA'
  | 'BENEFICIAR_TELEFON'
  | 'UTILIZATOR_NUME'
  | 'UTILIZATOR_CNP_CUI'
  | 'UTILIZATOR_ADRESA'
  | 'UTILIZATOR_TELEFON'
  | 'PERIOADA'
  | 'PERIOADA_LUNI'
  | 'CICLURI'
  | 'REPREZENTANT_NUME'
  | 'BENEFICIAR_SEMNATAR'

export type WarrantyCertificateValues = Record<WarrantyCertificateFieldKey, string>

export type WarrantyCertificateFieldDef = {
  key: WarrantyCertificateFieldKey
  label: string
  /** Sursa de date sugerată (cum se va popula automat la generare). */
  source: string
  /** Valoare exemplu folosită implicit pe pagina de preview. */
  sample: string
  /** Grupare logică pentru UI. */
  group:
    | 'produs'
    | 'furnizor'
    | 'beneficiar'
    | 'utilizator'
    | 'garantie'
    | 'semnaturi'
}

export const WARRANTY_CERTIFICATE_FIELDS: WarrantyCertificateFieldDef[] = [
  {
    key: 'CERT_NUMBER',
    label: 'Număr certificat',
    source: 'Auto: CG-{anul itemului}-{itemNumber 5 cifre}',
    sample: 'CG-2026-00011',
    group: 'produs',
  },
  {
    key: 'BRAND',
    label: 'Brand baterie',
    source: 'Product.brand',
    sample: 'Baterino',
    group: 'produs',
  },
  {
    key: 'CAPACITATE',
    label: 'Capacitate (kWh)',
    source: 'Product.energieNominala',
    sample: '16.07',
    group: 'produs',
  },
  {
    key: 'SERIAL_NUMBER',
    label: 'Număr serie (S/N)',
    source: 'WarehouseSavedItem.serialNumber',
    sample: 'LJC5131400325070043',
    group: 'produs',
  },
  {
    key: 'MODEL_COD',
    label: 'Model / Cod produs',
    source: 'WarehouseSavedItem.modelNumber',
    sample: 'TR8500WX',
    group: 'produs',
  },
  {
    key: 'TENSIUNE',
    label: 'Tensiune nominală (V)',
    source:
      'Product.technicalSpecsModels[modelNumber].nominalVoltage (industrial) · fallback Product.tensiuneNominala',
    sample: '51.2',
    group: 'produs',
  },
  {
    key: 'DATA_FABRICATIEI',
    label: 'Data fabricaţiei',
    source: 'WarehouseSavedItem.producedOn',
    sample: '03/2025',
    group: 'produs',
  },
  {
    key: 'DATA_VANZARII',
    label: 'Data vânzării',
    source: 'ResidentialOrder.createdAt (dd.MM.yyyy)',
    sample: '07.05.2026',
    group: 'produs',
  },
  {
    key: 'FURNIZOR_NUME',
    label: 'Furnizor / Importator – Denumire',
    source: 'BaterinoCompany.name (admin → Setări → Date companie)',
    sample: 'Baterino Energy SRL',
    group: 'furnizor',
  },
  {
    key: 'FURNIZOR_CUI',
    label: 'Furnizor / Importator – CUI',
    source: 'BaterinoCompany.cui',
    sample: '42707733',
    group: 'furnizor',
  },
  {
    key: 'FURNIZOR_ADRESA',
    label: 'Furnizor / Importator – Adresă',
    source: 'BaterinoCompany.address (multi-line normalizat la o singură linie)',
    sample: '23 AUGUST, Nr. 244-43A, CAMERA 1, Oraș Otopeni, Jud. Ilfov, ROMANIA',
    group: 'furnizor',
  },
  {
    key: 'FURNIZOR_TELEFON',
    label: 'Furnizor / Importator – Telefon',
    source: 'DepartmentPhone.general (admin → Setări → Numere de telefon → General)',
    sample: '0726 665 544',
    group: 'furnizor',
  },
  {
    key: 'FURNIZOR_WEB',
    label: 'Furnizor / Importator – Web',
    source: 'Hardcodat: baterino.ro',
    sample: 'baterino.ro',
    group: 'furnizor',
  },
  {
    key: 'BENEFICIAR_NUME',
    label: 'Beneficiar (distribuitor) – Denumire',
    source: 'Partner.companyName (admin → Companii) match pe WarehouseSavedItem.distributor',
    sample: 'Dynamic Industry SRL',
    group: 'beneficiar',
  },
  {
    key: 'BENEFICIAR_CUI',
    label: 'Beneficiar (distribuitor) – CUI / Nr. Reg. Com.',
    source: 'Partner.cui · Partner.tradeRegisterNumber',
    sample: 'RO41531883 · J23/2196/2019',
    group: 'beneficiar',
  },
  {
    key: 'BENEFICIAR_ADRESA',
    label: 'Beneficiar (distribuitor) – Adresă',
    source: 'Partner.companyStreet/City/County/PostalCode (fallback Partner.address)',
    sample: 'Str. Aurel Vlaicu Nr.13, Afumati, Jud. Ilfov, 077012',
    group: 'beneficiar',
  },
  {
    key: 'BENEFICIAR_TELEFON',
    label: 'Beneficiar (distribuitor) – Telefon / E-mail',
    source: 'Partner.phone · User.email (cont partener)',
    sample: '0726 665 544 · contact@dynamic-industry.ro',
    group: 'beneficiar',
  },
  {
    key: 'UTILIZATOR_NUME',
    label: 'Utilizator final (client) – Nume / Denumire',
    source: 'ClientProfile.firstName + lastName (cel ce generează certificatul)',
    sample: 'Ion Energie',
    group: 'utilizator',
  },
  {
    key: 'UTILIZATOR_CNP_CUI',
    label: 'Utilizator final – CNP / CUI',
    source: 'B2C: CNP (manual / opţional) · B2B: Partner.cui',
    sample: '—',
    group: 'utilizator',
  },
  {
    key: 'UTILIZATOR_ADRESA',
    label: 'Utilizator final – Adresă',
    source: 'ClientProfile.delAddress fallback billAddress',
    sample: 'Str. Florilor 12, Sector 3, București',
    group: 'utilizator',
  },
  {
    key: 'UTILIZATOR_TELEFON',
    label: 'Utilizator final – Telefon / E-mail',
    source: 'ClientProfile.phone + User.email',
    sample: '0721 123 456 · ion@example.com',
    group: 'utilizator',
  },
  {
    key: 'PERIOADA',
    label: 'Perioadă garanţie (ani)',
    source: 'Product.garantie (ani)',
    sample: '10',
    group: 'garantie',
  },
  {
    key: 'PERIOADA_LUNI',
    label: 'Perioadă garanţie (luni)',
    source: 'PERIOADA × 12',
    sample: '120',
    group: 'garantie',
  },
  {
    key: 'CICLURI',
    label: 'Garanţie capacitate (cicluri)',
    source:
      'Product.technicalSpecsModels[modelNumber].cycleLife (industrial) · fallback Product.cicluriDescarcare',
    sample: '≥ 8000 cicluri la ≥ 80% capacitate',
    group: 'garantie',
  },
  {
    key: 'REPREZENTANT_NUME',
    label: 'Reprezentant furnizor',
    source: 'Setări admin (BaterinoCompany)',
    sample: 'Răzvan Popescu',
    group: 'semnaturi',
  },
  {
    key: 'BENEFICIAR_SEMNATAR',
    label: 'Semnatar receptor (Beneficiar / Client)',
    source: 'Implicit = Utilizator final (UTILIZATOR_NUME)',
    sample: 'Ion Energie',
    group: 'semnaturi',
  },
]

function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const TEMPLATE_HTML = `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Certificat de Garanție – Baterino</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Nunito+Sans:wght@400;700&display=swap" rel="stylesheet">
<style>
  :root {
    --ink: #0e0e0e;
    --ink-mid: #444;
    --ink-soft: #888;
    --ink-faint: #bbb;
    --rule: #e0e0e0;
    --bg: #fafaf8;
    --paper: #ffffff;
    --accent: #1a3a5c;
    --accent-light: #e8eef5;
    --green: #14532d;
    --green-bg: #f0fdf4;
    --red: #7f1d1d;
    --red-bg: #fef2f2;
    --sans: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    --display: 'Nunito Sans', 'Inter', system-ui, sans-serif;
    --mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    font-family: var(--sans);
    color: var(--ink);
    min-height: 100vh;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 40px 20px;
  }

  .page {
    background: var(--paper);
    width: 794px;
    padding: 52px 56px 56px;
    box-shadow: 0 2px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);
    position: relative;
  }

  .page::before, .page::after {
    content: '';
    position: absolute;
    width: 32px;
    height: 32px;
    border-color: var(--accent);
    border-style: solid;
  }
  .page::before { top: 18px; left: 18px; border-width: 2px 0 0 2px; }
  .page::after  { bottom: 18px; right: 18px; border-width: 0 2px 2px 0; }

  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 36px;
    gap: 24px;
  }

  .header-left { flex: 1; }

  .logo-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .brand-logo {
    height: 32px;
    width: auto;
    display: block;
  }

  .cert-eyebrow {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 4px;
  }

  .cert-title {
    font-family: var(--display);
    font-weight: 700;
    font-size: 28px;
    color: var(--ink);
    line-height: 1.1;
    margin-bottom: 8px;
    letter-spacing: -0.01em;
  }

  .cert-meta {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--ink-mid);
    letter-spacing: 0.04em;
    border-left: 3px solid var(--accent);
    padding-left: 10px;
  }

  .cert-number {
    display: inline-block;
    margin-top: 8px;
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.08em;
    color: var(--accent);
    background: var(--accent-light);
    padding: 4px 10px;
    border-radius: 999px;
    font-weight: 500;
  }

  .qr-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .qr-label {
    font-family: var(--mono);
    font-size: 8.5px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
    text-align: center;
  }

  .qr-img {
    width: 100px;
    height: 100px;
    border: 1px solid var(--rule);
    padding: 5px;
    background: white;
    display: block;
  }

  .rule {
    border: none;
    border-top: 1px solid var(--rule);
    margin: 0 0 28px;
  }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

  .card {
    border: 1px solid var(--rule);
    padding: 14px 16px;
  }

  .card.span2 { grid-column: 1 / -1; }

  .card-label {
    font-family: var(--mono);
    font-size: 8.5px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-soft);
    padding-bottom: 8px;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--rule);
  }

  .field { margin-bottom: 7px; }
  .field:last-child { margin-bottom: 0; }
  .field-key {
    font-size: 9px;
    color: var(--ink-soft);
    margin-bottom: 1px;
    font-weight: 400;
  }
  .field-val {
    font-size: 12px;
    color: var(--ink);
    font-weight: 500;
    font-family: var(--sans);
  }
  .field-val.dynamic {
    color: var(--ink-faint);
    font-style: italic;
    font-weight: 300;
  }

  .disclaimer {
    background: #f7f7f5;
    border: 1px solid #d8d8d4;
    border-left: 3px solid var(--accent);
    padding: 14px 18px;
    margin-bottom: 16px;
  }

  .disclaimer p {
    font-size: 10.5px;
    color: var(--ink-mid);
    line-height: 1.65;
    font-style: italic;
  }
  .disclaimer p + p { margin-top: 6px; }

  .coverage-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }

  .coverage-card { border: 1px solid var(--rule); padding: 14px 16px; }

  .coverage-title {
    font-family: var(--mono);
    font-size: 8.5px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding-bottom: 8px;
    margin-bottom: 8px;
    border-bottom: 1px solid var(--rule);
  }
  .coverage-title.yes { color: var(--green); }
  .coverage-title.no  { color: var(--red); }

  .coverage-item {
    font-size: 10px;
    color: var(--ink-mid);
    line-height: 1.55;
    padding-left: 12px;
    position: relative;
    margin-bottom: 3px;
  }
  .coverage-item::before {
    content: '—';
    position: absolute;
    left: 0;
    color: var(--ink-faint);
    font-size: 9px;
  }

  .procedure { border: 1px solid var(--rule); padding: 14px 16px; margin-bottom: 16px; }

  .procedure-title {
    font-family: var(--mono);
    font-size: 8.5px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin-bottom: 14px;
  }

  .steps { display: flex; gap: 0; position: relative; }
  .steps::before {
    content: '';
    position: absolute;
    top: 14px;
    left: 14px;
    right: 14px;
    height: 1px;
    background: var(--rule);
  }

  .step { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 7px; position: relative; z-index: 1; }

  .step-num {
    width: 28px; height: 28px;
    background: var(--accent);
    color: white;
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 500;
    display: flex; align-items: center; justify-content: center;
  }
  .step-text {
    font-size: 9px;
    color: var(--ink-mid);
    text-align: center;
    line-height: 1.4;
    padding: 0 4px;
    max-width: 100px;
  }

  .sig-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }

  .sig-box { border: 1px solid var(--rule); padding: 14px 16px; }

  .sig-role {
    font-family: var(--mono);
    font-size: 8.5px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin-bottom: 4px;
  }
  .sig-name {
    font-size: 13px;
    color: var(--ink);
    margin-bottom: 28px;
    font-weight: 600;
    font-family: var(--display);
    letter-spacing: -0.005em;
  }
  .sig-line {
    border-top: 1px solid var(--ink-faint);
    padding-top: 5px;
    font-size: 8.5px;
    color: var(--ink-faint);
    font-style: italic;
  }

  .footer {
    border-top: 1px solid var(--rule);
    padding-top: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .footer-text {
    font-size: 9px;
    color: var(--ink-faint);
    line-height: 1.6;
    font-style: italic;
  }

  .doc-id {
    font-family: var(--mono);
    font-size: 8.5px;
    color: var(--ink-faint);
    letter-spacing: 0.06em;
    white-space: nowrap;
  }

  /* Highlight injectat numai în mod „evidenţiere câmpuri” pe pagina admin. */
  /* PLACEHOLDER_STYLE_SLOT */

  /* A4: 210mm × 297mm. Margini interne 12mm pe toate laturile.
     Tipărirea (Ctrl+P → Save as PDF) generează exact 2 pagini A4. */
  @page { size: A4; margin: 12mm; }
  @media print {
    body {
      background: white;
      padding: 0;
      min-height: 0;
      display: block;
    }
    .page {
      box-shadow: none;
      width: 100%;
      max-width: none;
      padding: 0;
      border: none;
    }
    .page::before, .page::after { display: none; }

    .page-break {
      display: block;
      page-break-before: always;
      break-before: page;
      height: 0;
    }

    .card, .coverage-card, .disclaimer, .procedure, .sig-box {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .sig-row, .coverage-grid, .grid-2, .grid-3 {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .header { page-break-after: avoid; break-after: avoid; }
  }
  .page-break { display: none; }
</style>
</head>
<body>

<div class="page">

  <div class="header">
    <div class="header-left">
      <div class="logo-row">
        <img src="{{LOGO_URL}}" alt="Baterino" class="brand-logo">
      </div>
      <div class="cert-eyebrow">Document oficial · Garanție produs</div>
      <div class="cert-title">Certificat de Garanție</div>
      <div class="cert-meta">
        Baterie {{BRAND}} LiFePO4 &nbsp;·&nbsp; {{CAPACITATE}} kWh &nbsp;·&nbsp; SN: {{SERIAL_NUMBER}}
      </div>
      <div class="cert-number">Nr. certificat · {{CERT_NUMBER}}</div>
    </div>
    <div class="qr-block">
      <div class="qr-label">Verificare garanție live</div>
      <img class="qr-img" src="{{QR_DATA_URL}}" alt="QR Verificare Garanție · {{SERIAL_NUMBER}}">
    </div>
  </div>

  <hr class="rule">

  <div class="grid-2" style="margin-bottom:16px">
    <div class="card">
      <div class="card-label">Date produs</div>
      <div class="field"><div class="field-key">Denumire</div><div class="field-val">Baterie LiFePO4 (Litiu Fier Fosfat)</div></div>
      <div class="field"><div class="field-key">Model / Cod produs</div><div class="field-val dynamic">{{MODEL_COD}}</div></div>
      <div class="field"><div class="field-key">Capacitate nominală</div><div class="field-val dynamic">{{CAPACITATE}} kWh</div></div>
      <div class="field"><div class="field-key">Tensiune nominală</div><div class="field-val dynamic">{{TENSIUNE}} V</div></div>
      <div class="field"><div class="field-key">Data fabricației</div><div class="field-val dynamic">{{DATA_FABRICATIEI}}</div></div>
      <div class="field"><div class="field-key">Data vânzării</div><div class="field-val dynamic">{{DATA_VANZARII}}</div></div>
    </div>
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div class="card" style="flex:1">
        <div class="card-label">Furnizor / Importator</div>
        <div class="field"><div class="field-key">Firmă</div><div class="field-val dynamic">{{FURNIZOR_NUME}}</div></div>
        <div class="field"><div class="field-key">CUI</div><div class="field-val dynamic">{{FURNIZOR_CUI}}</div></div>
        <div class="field"><div class="field-key">Adresă</div><div class="field-val dynamic">{{FURNIZOR_ADRESA}}</div></div>
        <div class="field"><div class="field-key">Telefon</div><div class="field-val dynamic">{{FURNIZOR_TELEFON}}</div></div>
        <div class="field"><div class="field-key">Web</div><div class="field-val dynamic">{{FURNIZOR_WEB}}</div></div>
      </div>
      <div class="card" style="flex:1">
        <div class="card-label">Producător</div>
        <div class="field"><div class="field-key">Firmă</div><div class="field-val">Shenzhen Lithtech Energy Co., Ltd</div></div>
        <div class="field"><div class="field-key">Web</div><div class="field-val">ltc-energy.com</div></div>
      </div>
    </div>
  </div>

  <div class="grid-2" style="margin-bottom:16px">
    <div class="card">
      <div class="card-label">Beneficiar</div>
      <div class="field"><div class="field-key">Nume / Denumire</div><div class="field-val dynamic">{{BENEFICIAR_NUME}}</div></div>
      <div class="field"><div class="field-key">CUI / Nr. Reg. Com.</div><div class="field-val dynamic">{{BENEFICIAR_CUI}}</div></div>
      <div class="field"><div class="field-key">Adresă</div><div class="field-val dynamic">{{BENEFICIAR_ADRESA}}</div></div>
      <div class="field"><div class="field-key">Telefon / E-mail</div><div class="field-val dynamic">{{BENEFICIAR_TELEFON}}</div></div>
    </div>
    <div class="card">
      <div class="card-label">Utilizator final</div>
      <div class="field"><div class="field-key">Nume / Denumire</div><div class="field-val dynamic">{{UTILIZATOR_NUME}}</div></div>
      <div class="field"><div class="field-key">CNP / CUI</div><div class="field-val dynamic">{{UTILIZATOR_CNP_CUI}}</div></div>
      <div class="field"><div class="field-key">Adresă</div><div class="field-val dynamic">{{UTILIZATOR_ADRESA}}</div></div>
      <div class="field"><div class="field-key">Telefon / E-mail</div><div class="field-val dynamic">{{UTILIZATOR_TELEFON}}</div></div>
    </div>
  </div>

  <div class="page-break" aria-hidden="true"></div>

  <div class="card span2" style="margin-bottom:16px">
    <div class="card-label">Condiții de garanție</div>
    <div class="grid-3">
      <div class="field"><div class="field-key">Perioadă</div><div class="field-val dynamic">{{PERIOADA}} ani / {{PERIOADA_LUNI}} luni de la data vânzării</div></div>
      <div class="field"><div class="field-key">Garanție capacitate</div><div class="field-val dynamic">{{CICLURI}}</div></div>
      <div class="field"><div class="field-key">Unitate service autorizată</div><div class="field-val">Baterino Energy SRL</div></div>
    </div>
  </div>

  <div class="disclaimer">
    <p>Garanția este valabilă exclusiv dacă instalarea bateriei a fost realizată de un instalator autorizat/atestat. În lipsa dovezii de instalare autorizată, furnizorul își rezervă dreptul de a refuza orice solicitare în garanție.</p>
    <p>Garanția acoperă defectele de material și de fabricație, în condițiile utilizării normale a produsului, conform specificațiilor tehnice din manualul de utilizare.</p>
  </div>

  <div class="coverage-grid">
    <div class="coverage-card">
      <div class="coverage-title yes">Ce acoperă garanția</div>
      <div class="coverage-item">Defecte de fabricație ale celulelor LiFePO4</div>
      <div class="coverage-item">Defecțiuni BMS datorate fabricației</div>
      <div class="coverage-item">Scăderea capacității sub 80% din nominal</div>
      <div class="coverage-item">Defecte ale carcasei cauzate de fabricație</div>
      <div class="coverage-item">Erori de conectică / terminale livrate</div>
    </div>
    <div class="coverage-card">
      <div class="coverage-title no">Ce nu acoperă garanția</div>
      <div class="coverage-item">Utilizare necorespunzătoare, supraîncărcare</div>
      <div class="coverage-item">Modificări neautorizate sau reparații terți</div>
      <div class="coverage-item">Daune fizice: lovituri, căderi, deteriorări mecanice</div>
      <div class="coverage-item">Expunere la umezeală, coroziune, medii agresive</div>
      <div class="coverage-item">Fluctuații de tensiune sau instalare incorectă</div>
    </div>
  </div>

  <div class="procedure">
    <div class="procedure-title">Procedura de garanție</div>
    <div class="steps">
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-text">Contactează furnizorul cu certificatul și dovada de cumpărare</div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-text">Completează formularul de reclamație RMA</div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-text">Returnează produsul în ambalaj original</div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-text">Soluționare în maximum 30 de zile calendaristice</div>
      </div>
    </div>
  </div>

  <div class="sig-row">
    <div class="sig-box">
      <div class="sig-role">Reprezentant furnizor</div>
      <div class="sig-name">{{REPREZENTANT_NUME}}</div>
      <div class="sig-line">Semnătură și ștampilă</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">Beneficiar / Client</div>
      <div class="sig-name">{{BENEFICIAR_SEMNATAR}}</div>
      <div class="sig-line">Semnătură</div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-text">
      Certificat valabil numai împreună cu factura / bonul fiscal de achiziție.<br>
      Garanția este personală și netransferabilă. Păstrați acest document pe toată durata perioadei de garanție.
    </div>
    <div class="doc-id">{{CERT_NUMBER}}</div>
  </div>

</div>

</body>
</html>`

const HIGHLIGHT_CSS = `
  .__ph {
    background: #fff7c2;
    border: 1px dashed #d4a72c;
    padding: 0 4px;
    border-radius: 4px;
    color: #7a5a00 !important;
    font-style: normal !important;
    font-weight: 600 !important;
  }
`

/**
 * Returnează URL-ul absolut pentru logo. Folosit ca asset în `<img>`-ul din
 * header-ul certificatului. Pe preview admin folosim originul curent (Vite
 * serveşte `/images/shared/baterino-logo-black.svg` din public/), iar pentru
 * SSR/non-browser facem fallback la baterino.ro.
 */
function resolveLogoUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/images/shared/baterino-logo-black.svg`
  }
  return 'https://baterino.ro/images/shared/baterino-logo-black.svg'
}

/**
 * QR placeholder pentru pagina de preview admin. La generarea reală a
 * certificatului (server-side), `QR_DATA_URL` e suprascris cu un PNG generat
 * dinamic care codifică `https://<host>/verificare-garantie?sn=<SN>`.
 */
const SAMPLE_QR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUoAAAFKAQAAAABTUiuoAAACO0lEQVR4nO2aT6rjMAyHP9Xdu/AO8I7i3GzONDdIjvJu4CwHEjQL2a4LZWgH2hgqL0KafguB+OmfJcqDZzk9SoKjjjp6glXKmQAWOcNywR71r/Mgtn44imoOqqqqJN0g5aBAUNUclKRqbzofbqujhhb1EFRnQOf4p0iNtYpuFFs/GT3f+ygpo7J8b28wwNH/RncpKUtESPn9Bjj6z2PaKmX8+qWS8kWAsLFI2CAqsL7OAEefRHer++qnoKQM8itjKhO5vNYARx88cq87ro4LfeLy7ngIdD3DctlFplWkpqygqrmmsXFs/XAUVeuyQDUDxM3ear+14f3WKCjWGENoj+JBnaNa+wVR3VsjoMUzmkFnmpjsbEBUdW+NgrbJ0zUcVpfNQH3zSDgEWnRkUS9qr605XlXm2hoCrbVFy1s22q3z3ZK3XFtjoLWisIFuaCqr3urqjcNtdbRGPftR3dNVHrHFycNtdbT1W6GmpxtZ1fbLI+EQaF8Tlrx1vZfkJkQebqujJ4hlGlhcttYrL7vfiluHvsYARx8+pcHKZfJunbDpLQNNb66tAdC+o9IMV79Vl9U1DffW8Wjrt6Cb4PZ6C14TDoOeaddYwvqlLFNAINjfyroL6ee8DWCro1xjXX87Qj/k8JpwSLSVgymDTDaN2kWmuL3HAEefQK1a30WmqMpyqQJLP76rOwR6s/MESPoNugjoMoHY9tO3a2sYtO082YZGHcTDLqS8S4cebutno3d3nu4e33ly1NFn0L/FLtr+z4/PwQAAAABJRU5ErkJggg=='

/**
 * Construieşte HTML-ul certificatului folosind valorile primite. Când
 * `highlight = true`, fiecare placeholder este învelit într-un `<span>` galben
 * pentru ca pe pagina de preview să se vadă exact poziţia fiecărui câmp.
 */
export function buildWarrantyCertificateHtml(
  values: Partial<WarrantyCertificateValues>,
  options: { highlight?: boolean; logoUrl?: string; qrDataUrl?: string } = {},
): string {
  const highlight = options.highlight === true
  let html = TEMPLATE_HTML

  for (const def of WARRANTY_CERTIFICATE_FIELDS) {
    const raw = values[def.key] ?? ''
    const safe = escapeHtml(raw)
    const replacement = highlight
      ? `<span class="__ph">${safe || `{{${def.key}}}`}</span>`
      : safe
    const re = new RegExp(`\\{\\{${def.key}\\}\\}`, 'g')
    html = html.replace(re, replacement)
  }

  /* LOGO_URL şi QR_DATA_URL nu sunt câmpuri user-editable: le rezolvăm automat
     (logo = origin curent, QR = placeholder static pentru preview). */
  const logoUrl = escapeHtml(options.logoUrl?.trim() || resolveLogoUrl())
  html = html.replace(/\{\{LOGO_URL\}\}/g, logoUrl)

  const qrDataUrl = escapeHtml(options.qrDataUrl?.trim() || SAMPLE_QR_DATA_URL)
  html = html.replace(/\{\{QR_DATA_URL\}\}/g, qrDataUrl)

  html = html.replace('/* PLACEHOLDER_STYLE_SLOT */', highlight ? HIGHLIGHT_CSS : '')
  return html
}

/** Valori implicite folosite în pagina de preview admin. */
export function getWarrantyCertificateSampleValues(): WarrantyCertificateValues {
  const out = {} as WarrantyCertificateValues
  for (const f of WARRANTY_CERTIFICATE_FIELDS) {
    out[f.key] = f.sample
  }
  return out
}
