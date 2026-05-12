/**
 * Limitare viteză pentru GET /api/warranty-verify (enumerare SN din query).
 * Fereastră fixă 60s / IP; limită configurabilă prin WARRANTY_VERIFY_MAX_PER_IP_PER_MIN.
 */

const WINDOW_MS = 60_000

function maxPerWindow() {
  const n = parseInt(String(process.env.WARRANTY_VERIFY_MAX_PER_IP_PER_MIN || '40'), 10)
  if (!Number.isFinite(n) || n < 1) return 40
  return Math.min(500, Math.max(1, n))
}

/** ip -> { start: number, count: number } */
const buckets = new Map()

function pruneBuckets() {
  const now = Date.now()
  const maxAge = WINDOW_MS * 3
  for (const [k, v] of buckets) {
    if (now - v.start > maxAge) buckets.delete(k)
  }
}

function getClientIp(req) {
  const raw = String(req.ip || req.socket?.remoteAddress || 'unknown').trim()
  return raw.slice(0, 128) || 'unknown'
}

/**
 * @returns {{ allowed: boolean, retryAfterSec: number }}
 */
function checkWarrantyVerifyRateLimit(req) {
  if (String(process.env.WARRANTY_VERIFY_RATE_LIMIT_DISABLED || '').trim() === '1') {
    return { allowed: true, retryAfterSec: 0 }
  }
  if (Math.random() < 0.02) pruneBuckets()

  const ip = getClientIp(req)
  const now = Date.now()
  const max = maxPerWindow()
  let b = buckets.get(ip)
  if (!b || now - b.start >= WINDOW_MS) {
    b = { start: now, count: 0 }
    buckets.set(ip, b)
  }
  b.count += 1
  if (b.count > max) {
    const elapsed = now - b.start
    const retryAfterSec = Math.max(1, Math.ceil((WINDOW_MS - elapsed) / 1000))
    return { allowed: false, retryAfterSec }
  }
  return { allowed: true, retryAfterSec: 0 }
}

/** Middleware Express: 429 dacă limita e depășită. */
function warrantyVerifyRateLimitMiddleware(req, res, next) {
  const { allowed, retryAfterSec } = checkWarrantyVerifyRateLimit(req)
  if (allowed) return next()
  res.setHeader('Retry-After', String(retryAfterSec))
  return res.status(429).json({
    code: 'rate_limited',
    error:
      'Prea multe verificări de pe aceeași conexiune într-un interval scurt. Așteaptă un minut și încearcă din nou.',
  })
}

module.exports = {
  warrantyVerifyRateLimitMiddleware,
  checkWarrantyVerifyRateLimit,
}
