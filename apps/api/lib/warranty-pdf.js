/**
 * Puppeteer wrapper pentru randarea HTML-ului certificatului de garanţie ca PDF.
 *
 * Folosim un singur browser instance reutilizabil per proces (singleton lazy)
 * ca să evităm cold-start-ul Chromium la fiecare request. La repornire de
 * proces, instance-ul este re-creat la prima cerere.
 */
const puppeteer = require('puppeteer')

let browserPromise = null

/**
 * Returnează (sau creează) instance-ul Chromium reutilizabil. Dacă a fost închis
 * accidental (proces zombie), îl re-creăm.
 */
async function getBrowser() {
  if (browserPromise) {
    try {
      const b = await browserPromise
      if (b && b.connected) return b
    } catch {
      /* fall-through ca să recreem */
    }
  }
  browserPromise = puppeteer.launch({
    headless: true,
    /* Argumente standard pentru servere fără sandbox (Railway / Docker / CI). */
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
    /* Permite folosirea unui Chrome / Chromium deja instalat în mediul de
       deploy (`PUPPETEER_EXECUTABLE_PATH` în .env). */
    ...(process.env.PUPPETEER_EXECUTABLE_PATH
      ? { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH }
      : {}),
  })
  return browserPromise
}

/**
 * Randează un string HTML ca PDF A4. HTML-ul trebuie să fie self-contained
 * (CSS inline, fonturi via Google Fonts / data URI, imagini cu URL absolut).
 *
 * Întoarce un Buffer Node.js cu conţinutul PDF-ului.
 *
 * @param {string} html
 * @param {object} [options]
 * @param {number} [options.timeoutMs] - timeout pentru încărcarea paginii (default 30s).
 * @returns {Promise<Buffer>}
 */
async function renderWarrantyPdf(html, options = {}) {
  const timeoutMs = Number.isFinite(options.timeoutMs) ? Number(options.timeoutMs) : 30_000
  const browser = await getBrowser()
  const page = await browser.newPage()
  try {
    /* `domcontentloaded` + `networkidle0` ne asigurăm că fonturile Google /
       imaginile (logo, QR code data: URI) sunt încărcate înainte de print. */
    await page.setContent(html, { waitUntil: ['domcontentloaded', 'networkidle0'], timeout: timeoutMs })
    /* Forţăm aşteptarea fonturilor (evităm fallback la system font). */
    await page.evaluateHandle('document.fonts.ready')
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      /* Marginile sunt deja controlate din `@page { margin: 12mm }` în template. */
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })
    return Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf)
  } finally {
    await page.close().catch(() => {})
  }
}

module.exports = { renderWarrantyPdf }
