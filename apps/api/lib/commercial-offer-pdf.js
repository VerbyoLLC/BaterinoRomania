/**
 * PDF ofertă comercială — același pipeline ca proforma: HTML self-contained + Puppeteer.
 */

const fs = require('fs')
const path = require('path')
const { renderWarrantyPdf } = require('./warranty-pdf.js')

const MAX_HTML_BYTES = 12 * 1024 * 1024
const WEB_PUBLIC_ROOT = path.resolve(__dirname, '..', '..', 'web', 'public')
const IMG_SRC_RE = /(<img\b[^>]*?\ssrc=)(["'])([^"']+)\2/gi
const IMAGE_FETCH_TIMEOUT_MS = 10_000
const MAX_INLINE_IMAGE_BYTES = 3 * 1024 * 1024

function resolveAssetOrigin() {
  return String(
    process.env.FRONTEND_URL || process.env.BATERINO_ASSET_ORIGIN || 'https://baterino.ro',
  )
    .trim()
    .replace(/\/$/, '')
}

function mimeFromExt(ext) {
  switch (ext.toLowerCase()) {
    case '.svg':
      return 'image/svg+xml'
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.webp':
      return 'image/webp'
    case '.gif':
      return 'image/gif'
    default:
      return 'application/octet-stream'
  }
}

function tryLoadLocalPublicAsset(relativePath) {
  const rel = String(relativePath || '').replace(/^\/+/, '')
  if (!rel || rel.includes('..')) return null
  const filePath = path.resolve(WEB_PUBLIC_ROOT, rel.split('/').join(path.sep))
  if (!filePath.startsWith(WEB_PUBLIC_ROOT)) return null
  try {
    if (!fs.existsSync(filePath)) return null
    const buf = fs.readFileSync(filePath)
    const mime = mimeFromExt(path.extname(filePath))
    return `data:${mime};base64,${buf.toString('base64')}`
  } catch {
    return null
  }
}

async function urlToDataUrl(src) {
  const raw = String(src ?? '').trim()
  if (!raw || raw.startsWith('data:')) return raw

  if (raw.startsWith('/')) {
    const local = tryLoadLocalPublicAsset(raw)
    if (local) return local
  }

  let fetchUrl = raw
  if (fetchUrl.startsWith('//')) fetchUrl = `https:${fetchUrl}`
  else if (fetchUrl.startsWith('/')) fetchUrl = `${resolveAssetOrigin()}${fetchUrl}`

  try {
    const res = await fetch(fetchUrl, {
      redirect: 'follow',
      signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS),
    })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length > MAX_INLINE_IMAGE_BYTES) return null
    let mime = String(res.headers.get('content-type') || '')
      .split(';')[0]
      .trim()
    if (!mime || mime === 'application/octet-stream') {
      try {
        mime = mimeFromExt(path.extname(new URL(fetchUrl).pathname))
      } catch {
        mime = 'application/octet-stream'
      }
    }
    return `data:${mime};base64,${buf.toString('base64')}`
  } catch {
    return null
  }
}

/**
 * Înlocuiește src-urile <img> cu data URI ca PDF-ul să fie self-contained
 * (Puppeteer nu depinde de fetch HTTP către frontend / R2).
 */
async function inlineImagesInHtml(html) {
  const uniqueSrcs = new Set()
  for (const match of html.matchAll(IMG_SRC_RE)) {
    const src = match[3]
    if (src && !src.startsWith('data:')) uniqueSrcs.add(src)
  }

  const cache = new Map()
  await Promise.all(
    [...uniqueSrcs].map(async (src) => {
      const dataUrl = await urlToDataUrl(src)
      if (dataUrl) cache.set(src, dataUrl)
    }),
  )

  return html.replace(IMG_SRC_RE, (full, prefix, quote, src) => {
    if (!src || src.startsWith('data:')) return full
    const replaced = cache.get(src)
    return replaced ? `${prefix}${quote}${replaced}${quote}` : full
  })
}

function sanitizeCommercialOfferHtml(html) {
  let s = String(html ?? '')
  s = s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  s = s.replace(/\s+on\w+\s*=\s*(['"])[^'"]*\1/gi, '')
  s = s.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '')
  s = s.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
  s = s.replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '')
  s = s.replace(/<embed\b[^>]*\/?>/gi, '')
  return s
}

function assertHtmlSizeWithinLimit(html) {
  if (String(html ?? '').length > MAX_HTML_BYTES) {
    throw new Error('Documentul HTML este prea mare pentru export PDF.')
  }
}

function safePdfFilename(raw) {
  const base = String(raw ?? 'oferta-comerciala')
    .trim()
    .replace(/[^\w.-]+/g, '_')
    .slice(0, 120)
  return base.toLowerCase().endsWith('.pdf') ? base : `${base || 'oferta-comerciala'}.pdf`
}

/**
 * @param {string} html - document HTML complet (<!DOCTYPE html>…)
 * @param {{ filename?: string, timeoutMs?: number }} [opts]
 * @returns {Promise<{ buffer: Buffer, filename: string }>}
 */
async function renderCommercialOfferPdfFromHtml(html, opts = {}) {
  const safeHtml = sanitizeCommercialOfferHtml(html)
  if (!/<html[\s>]/i.test(safeHtml)) {
    throw new Error('HTML invalid pentru PDF (lipsește <html>).')
  }
  const selfContainedHtml = await inlineImagesInHtml(safeHtml)
  assertHtmlSizeWithinLimit(selfContainedHtml)
  const pdfBuffer = await renderWarrantyPdf(selfContainedHtml, { timeoutMs: opts.timeoutMs ?? 45_000 })
  if (
    !Buffer.isBuffer(pdfBuffer) ||
    pdfBuffer.length < 5 ||
    pdfBuffer.slice(0, 5).toString('latin1') !== '%PDF-'
  ) {
    throw new Error('PDF invalid (lipsește header %PDF-).')
  }
  return {
    buffer: pdfBuffer,
    filename: safePdfFilename(opts.filename),
  }
}

module.exports = {
  sanitizeCommercialOfferHtml,
  renderCommercialOfferPdfFromHtml,
  safePdfFilename,
  inlineImagesInHtml,
  urlToDataUrl,
}
