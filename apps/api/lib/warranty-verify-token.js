/**
 * Token semnat (HMAC-SHA256) pentru linkul QR de pe certificatul de garanție.
 * Payload: { v: 1, sn, exp } — fără secret nu se poate falsifica un SN nou.
 */

const crypto = require('crypto')
const {
  normalizeWarehouseSerialNumber,
  isValidWarehouseSerialNumber,
} = require('./warehouse-serial.js')

function ttlSeconds() {
  const def = 10 * 365 * 24 * 60 * 60
  const n = parseInt(String(process.env.WARRANTY_VERIFY_TOKEN_TTL_SEC || String(def)), 10)
  if (!Number.isFinite(n) || n < 120) return def
  return Math.min(n, 50 * 365 * 24 * 60 * 60)
}

/**
 * @param {string} serialNumber
 * @param {string} secret
 * @returns {string | null}
 */
function mintWarrantyVerifyToken(serialNumber, secret) {
  const s = String(secret || '').trim()
  if (!s) return null
  const sn = normalizeWarehouseSerialNumber(String(serialNumber || '').trim())
  if (!isValidWarehouseSerialNumber(sn)) return null
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds()
  const body = JSON.stringify({ v: 1, sn, exp })
  const payload = Buffer.from(body, 'utf8').toString('base64url')
  const sig = crypto.createHmac('sha256', s).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

/**
 * @param {string} token
 * @param {string} secret
 * @returns {{ sn: string } | null}
 */
function parseWarrantyVerifyToken(token, secret) {
  const s = String(secret || '').trim()
  if (!s || !token) return null
  const raw = String(token).trim()
  const dot = raw.indexOf('.')
  if (dot < 1 || dot >= raw.length - 1) return null
  const payload = raw.slice(0, dot)
  const sig = raw.slice(dot + 1)
  const expected = crypto.createHmac('sha256', s).update(payload).digest('base64url')
  const a = Buffer.from(sig, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  if (a.length !== b.length) return null
  try {
    if (!crypto.timingSafeEqual(a, b)) return null
  } catch {
    return null
  }
  let json
  try {
    json = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return null
  }
  if (!json || json.v !== 1 || typeof json.sn !== 'string' || typeof json.exp !== 'number') return null
  if (json.exp < Math.floor(Date.now() / 1000)) return null
  const sn = normalizeWarehouseSerialNumber(String(json.sn).trim())
  if (!isValidWarehouseSerialNumber(sn)) return null
  return { sn }
}

module.exports = {
  mintWarrantyVerifyToken,
  parseWarrantyVerifyToken,
  ttlSeconds,
}
