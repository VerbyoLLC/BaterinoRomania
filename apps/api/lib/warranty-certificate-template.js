/**
 * Backend renderer pentru Certificatul de Garanție.
 * Citește `templates/warranty-certificate.html` și înlocuiește placeholderii
 * `{{KEY}}` cu valorile primite (HTML-escaped). Rezultatul este HTML standalone
 * care poate fi servit ca attachment / inline (Content-Type: text/html) sau
 * convertit ulterior în PDF (Puppeteer / wkhtmltopdf).
 */

const fs = require('fs')
const path = require('path')

const TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'warranty-certificate.html')

const PLACEHOLDER_KEYS = [
  'BRAND',
  'CAPACITATE',
  'SERIAL_NUMBER',
  'MODEL_COD',
  'TENSIUNE',
  'DATA_FABRICATIEI',
  'DATA_VANZARII',
  'FURNIZOR_NUME',
  'FURNIZOR_CUI',
  'FURNIZOR_ADRESA',
  'FURNIZOR_TELEFON',
  'FURNIZOR_WEB',
  'BENEFICIAR_NUME',
  'BENEFICIAR_CUI',
  'BENEFICIAR_ADRESA',
  'BENEFICIAR_TELEFON',
  'UTILIZATOR_NUME',
  'UTILIZATOR_CNP_CUI',
  'UTILIZATOR_ADRESA',
  'UTILIZATOR_TELEFON',
  'PERIOADA',
  'PERIOADA_LUNI',
  'CICLURI',
  'REPREZENTANT_NUME',
  'BENEFICIAR_SEMNATAR',
  'CERT_NUMBER',
  'LOGO_URL',
  'QR_DATA_URL',
]

/* URL absolut pentru logo. HTML-ul certificatului se deschide în browser
   (tab nou / fişier salvat), aşa că nu putem folosi căi relative. Folosim
   acelaşi pattern ca proforma — `FRONTEND_URL` cu fallback la baterino.ro. */
function defaultWarrantyLogoUrl() {
  const base = String(
    process.env.FRONTEND_URL || process.env.BATERINO_ASSET_ORIGIN || 'https://baterino.ro',
  )
    .trim()
    .replace(/\/$/, '')
  return `${base}/images/shared/baterino-logo-black.svg`
}

let cachedTemplate = null

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function loadTemplate() {
  if (cachedTemplate == null || process.env.NODE_ENV !== 'production') {
    cachedTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf8')
  }
  return cachedTemplate
}

/**
 * Returnează „—” dacă valoarea este goală, pentru a evita placeholderi vizibili.
 */
function dashIfEmpty(v) {
  const s = String(v ?? '').trim()
  return s.length > 0 ? s : '—'
}

/**
 * @param {Partial<Record<typeof PLACEHOLDER_KEYS[number], string>>} values
 */
function buildWarrantyCertificateHtml(values) {
  let html = loadTemplate()
  for (const key of PLACEHOLDER_KEYS) {
    const raw = values && values[key] != null ? values[key] : ''
    const safe = escapeHtml(raw)
    const re = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    html = html.replace(re, safe)
  }
  return html
}

module.exports = {
  PLACEHOLDER_KEYS,
  buildWarrantyCertificateHtml,
  dashIfEmpty,
  defaultWarrantyLogoUrl,
}
