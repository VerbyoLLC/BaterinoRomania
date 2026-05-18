/**
 * Cloudflare R2 (S3-compatible) upload utility.
 * Stores product images and PDF documents.
 */
const crypto = require('crypto')
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3')

let s3Client = null

function getR2Client() {
  if (!s3Client) {
    const endpoint = process.env.R2_ENDPOINT
    const accessKeyId = process.env.R2_ACCESS_KEY_ID
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error('R2 credentials missing. Set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in .env')
    }
    s3Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    })
  }
  return s3Client
}

function isR2Configured() {
  return !!(
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET &&
    process.env.R2_PUBLIC_URL
  )
}

/**
 * Upload a file buffer to R2 and return the public URL.
 * @param {Buffer} buffer - File content
 * @param {string} key - Object key (path in bucket), e.g. "products/123-image.jpg"
 * @param {string} contentType - MIME type, e.g. "image/jpeg", "application/pdf"
 * @param {object} [opts]
 * @param {string} [opts.contentDisposition] - ex. `attachment; filename="proforma-001.pdf"` (forces download in browser)
 * @param {string} [opts.cacheControl] - ex. `public, max-age=31536000, immutable`
 * @returns {Promise<string>} Public URL of the uploaded file
 */
async function uploadToR2(buffer, key, contentType, opts = {}) {
  const bucket = process.env.R2_BUCKET
  const publicUrlBase = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '')

  if (!bucket || !publicUrlBase) {
    throw new Error('R2_BUCKET and R2_PUBLIC_URL must be set in .env')
  }

  const client = getR2Client()
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ...(opts.contentDisposition ? { ContentDisposition: opts.contentDisposition } : {}),
      ...(opts.cacheControl ? { CacheControl: opts.cacheControl } : {}),
    })
  )

  return `${publicUrlBase}/${key}`
}

const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
}

/**
 * Sanitize product title for use as R2 folder name.
 * @param {string} title - Product title
 * @returns {string} Safe folder name
 */
function sanitizeFolderName(title) {
  if (!title || typeof title !== 'string') return 'produs'
  return title
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'produs'
}

/**
 * Slugify product title for image filename: lowercase, hyphenated.
 * e.g. "Acumulator sisteme fotovoltaice" -> "acumulator-sisteme-fotovoltaice"
 */
function slugifyForFilename(title) {
  if (!title || typeof title !== 'string') return 'produs'
  return title
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'produs'
}

/**
 * Generate a unique key for an uploaded file.
 * @param {string} originalName - Original filename
 * @param {string} prefix - Folder prefix, e.g. "products" or "docs"
 * @param {string} [mimetype] - MIME type for fallback extension
 * @param {string} [productFolder] - Product title (sanitized) as folder name
 * @param {number} [imageIndex] - 1-based index for images (e.g. 1, 2, 3) -> filename slug-#.ext
 * @returns {string}
 */
function generateKey(originalName, prefix = 'uploads', mimetype, productFolder, imageIndex) {
  let ext = originalName?.match(/\.[a-zA-Z0-9]+$/)?.[0] || ''
  if (!ext && mimetype) ext = MIME_TO_EXT[mimetype] || ''
  const productSlug = productFolder ? sanitizeFolderName(productFolder) : null
  const folder = productSlug ? `${prefix}/${productSlug}` : prefix

  if (imageIndex != null && mimetype && mimetype.startsWith('image/')) {
    const slug = productFolder ? slugifyForFilename(productFolder) : 'imagine'
    const imgExt = ext || (MIME_TO_EXT[mimetype] || '.jpg')
    return `${folder}/${slug}-${imageIndex}${imgExt}`
  }

  const safeName = Buffer.from(originalName || 'file', 'latin1')
    .toString('utf8')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
  const base = `${Date.now()}-${safeName}`.replace(/\.[^.]+$/, '')
  return `${folder}/${base}${ext}`
}

/**
 * Extract R2 object key from a public URL.
 * @param {string} url - Full public URL, e.g. "https://media.baterino.ro/products/foo/image.jpg"
 * @returns {string|null} Object key or null if URL is not from our R2
 */
function urlToKey(url) {
  if (!url || typeof url !== 'string') return null
  const base = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '')
  if (!base || !url.startsWith(base)) return null
  const key = url.slice(base.length).replace(/^\//, '')
  return key || null
}

/**
 * Descarcă conţinutul unui obiect R2 ca Buffer Node.js.
 * Folosit pentru streamingul certificatelor private prin API.
 * @param {string} key - Object key (path in bucket)
 * @returns {Promise<Buffer>}
 */
async function downloadFromR2(key) {
  const bucket = process.env.R2_BUCKET
  if (!bucket) throw new Error('R2_BUCKET not set')
  const client = getR2Client()
  const out = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
  if (!out?.Body) throw new Error('R2 object body missing')
  /* `Body` este un stream Node.js (Readable) când rulăm în Node. */
  const chunks = []
  for await (const chunk of out.Body) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

/**
 * Delete an object from R2 by key.
 * @param {string} key - Object key (path in bucket)
 */
async function deleteFromR2(key) {
  if (!key) return
  const bucket = process.env.R2_BUCKET
  if (!bucket) throw new Error('R2_BUCKET not set')
  const client = getR2Client()
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}

/** R2 has no real folders; prefix is `orders/<Prisma order id>/`. */
const ORDERS_PREFIX = 'orders'

/**
 * @param {string} orderDbId - GuestResidentialOrder.id (cuid)
 * @returns {string} Safe key prefix, e.g. orders/clxyz...
 */
function orderFolderPrefix(orderDbId) {
  const s = String(orderDbId || '').trim()
  if (!/^c[a-z0-9]{24}$/i.test(s)) {
    throw new Error('Invalid order id for R2 path')
  }
  return `${ORDERS_PREFIX}/${s}`
}

/**
 * Creates the order “folder” in R2 by uploading a tiny placeholder. Later PDFs use the same prefix, e.g. `proforma.pdf`.
 * @param {string} orderDbId
 * @returns {Promise<string>} Public URL of the placeholder object
 */
async function ensureGuestOrderFolder(orderDbId) {
  const base = orderFolderPrefix(orderDbId)
  const key = `${base}/.placeholder`
  const buf = Buffer.from('Reserved for order documents.\n', 'utf8')
  return uploadToR2(buf, key, 'text/plain')
}

/**
 * Suggested key for a future PDF (or other doc) under this order.
 * @param {string} orderDbId
 * @param {string} [filename] - default proforma.pdf
 * @returns {string} R2 object key (not full URL)
 */
function guestOrderDocumentKey(orderDbId, filename = 'proforma.pdf') {
  const base = orderFolderPrefix(orderDbId)
  const safe = String(filename || 'proforma.pdf')
    .replace(/[/\\]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${base}/${safe || 'document.pdf'}`
}

/**
 * Cheie R2 pentru proforma PDF generată automat — același prefix `orders/<id>/`
 * ca factura / proforma încărcată manual, astfel toate PDF-urile comenzii stau într-un singur „folder”.
 * @param {string} orderDbId - id Prisma (cuid)
 * @param {string} [orderNumber] - nr. comandă afișat (pentru nume fișier)
 * @returns {string}
 */
function proformaPdfKey(orderDbId, orderNumber = '') {
  const base = orderFolderPrefix(orderDbId)
  const safeNum = String(orderNumber || 'comanda')
    .replace(/[/\\]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 80) || 'comanda'
  return `${base}/proforma-${safeNum}.pdf`
}

/** Fotografii instalatori profil public: `PublicProfiles/<NumeFirma>/<fișier>`. „Folderul“ este sanitizarea numelui companiei. */
const PUBLIC_PROFILES_PREFIX = 'PublicProfiles'

/**
 * Cheie obiect R2 pentru logo sau lucrare (imagini în profilul public instalator).
 * @param {string} companyName
 * @param {'logo' | 'work'} mediaKind
 * @param {string} mimetype
 */
function buildPartnerPublicProfileObjectKey(companyName, mediaKind, mimetype) {
  const folder = sanitizeFolderName(companyName || 'partener')
  const ext = MIME_TO_EXT[mimetype] || '.jpg'
  const stamp = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
  if (mediaKind === 'logo') {
    return `${PUBLIC_PROFILES_PREFIX}/${folder}/logo-${stamp}${ext}`
  }
  return `${PUBLIC_PROFILES_PREFIX}/${folder}/lucrare-${stamp}${ext}`
}

/** Prefix R2 pentru certificatele de garanţie. Folderul per certificat
 *  foloseşte cuid-ul `WarehouseSavedItem.id` (neghicibil), iar fişierul
 *  păstrează SN-ul ca nume — astfel utilizatorul primeşte un fişier cu
 *  nume semnificativ la download, dar URL-ul R2 nu poate fi enumerat
 *  doar pe baza SN-urilor publice ale produselor. */
const WARRANTY_CERTIFICATES_PREFIX = 'warranty-certificates'

/**
 * Sanitizare strictă pentru un serial number folosit ca nume de fişier
 * (păstrează doar alfanumerice + `-` şi `_`, capătă lungime maximă).
 */
function sanitizeSerialNumber(sn) {
  const cleaned = String(sn || '')
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 80)
  return cleaned || 'certificat'
}

/**
 * Cheia R2 pentru PDF-ul certificatului de garanţie.
 * Format: `warranty-certificates/<savedItemId cuid>/<SN>.pdf`.
 *
 * URL-ul R2 nu trebuie expus în UI — este folosit doar server-side, pentru
 * stream-ul prin endpoint-ul autentificat `/warranty-certificate/download`.
 */
function warrantyCertificateKey(savedItemId, serialNumber) {
  const id = String(savedItemId || '').trim()
  if (!/^[A-Za-z0-9_-]+$/.test(id) || id.length < 8) {
    throw new Error('Invalid savedItemId for warranty certificate key')
  }
  const safeSn = sanitizeSerialNumber(serialNumber)
  return `${WARRANTY_CERTIFICATES_PREFIX}/${id}/${safeSn}.pdf`
}

const RETUR_PREFIX = 'retur'

/**
 * Cheie R2 pentru fotografie stare produs: `retur/<orderSlug>-<returId>/photo-NN.ext`
 * (orderSlug din număr comandă, ușor de recunoscut în bucket).
 */
function buildReturConditionPhotoKey(orderNumber, returId, photoIndex1Based, mimetype) {
  const orderSeg = sanitizeFolderName(orderNumber || 'order').slice(0, 48) || 'order'
  const ext = MIME_TO_EXT[mimetype] || '.jpg'
  const idx = Math.max(1, Math.floor(Number(photoIndex1Based)) || 1)
  return `${RETUR_PREFIX}/${orderSeg}-${returId}/photo-${String(idx).padStart(2, '0')}${ext}`
}

module.exports = {
  uploadToR2,
  downloadFromR2,
  generateKey,
  sanitizeFolderName,
  buildPartnerPublicProfileObjectKey,
  isR2Configured,
  urlToKey,
  deleteFromR2,
  orderFolderPrefix,
  ensureGuestOrderFolder,
  guestOrderDocumentKey,
  proformaPdfKey,
  warrantyCertificateKey,
  sanitizeSerialNumber,
  buildReturConditionPhotoKey,
}
