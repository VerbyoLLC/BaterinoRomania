/**
 * Cloudflare R2 (S3-compatible) upload utility.
 * Stores product images and PDF documents.
 */
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

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
 * Generate a unique key for an uploaded file.
 * @param {string} originalName - Original filename
 * @param {string} prefix - Folder prefix, e.g. "products" or "docs"
 * @param {string} [mimetype] - MIME type for fallback extension
 * @returns {string}
 */
function generateKey(originalName, prefix = 'uploads', mimetype) {
  let ext = originalName?.match(/\.[a-zA-Z0-9]+$/)?.[0] || ''
  if (!ext && mimetype) ext = MIME_TO_EXT[mimetype] || ''
  const safeName = Buffer.from(originalName || 'file', 'latin1')
    .toString('utf8')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
  const base = `${Date.now()}-${safeName}`.replace(/\.[^.]+$/, '')
  return `${prefix}/${base}${ext}`
}

module.exports = { uploadToR2, generateKey, isR2Configured }
