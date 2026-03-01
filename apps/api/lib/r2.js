/**
 * Cloudflare R2 (S3-compatible) upload utility.
 * Stores product images and PDF documents.
 */
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3')

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
 * @returns {Promise<string>} Public URL of the uploaded file
 */
async function uploadToR2(buffer, key, contentType) {
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

module.exports = { uploadToR2, generateKey, sanitizeFolderName, isR2Configured, urlToKey, deleteFromR2 }
