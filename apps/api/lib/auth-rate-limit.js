/**
 * Rate limiting for auth endpoints.
 * IP-based fixed-window limiters (same pattern as warranty-verify-rate-limit.js)
 * plus per-email OTP attempt tracking with lockout and code invalidation.
 */

const OTP_MAX_ATTEMPTS = 5        // wrong attempts before code is cleared
const OTP_WINDOW_MS    = 15 * 60_000  // reset attempt counter after 15 min of inactivity

/** email -> { count: number, windowStart: number } */
const otpAttemptBuckets = new Map()

function getClientIp(req) {
  const raw = String(req.ip || req.socket?.remoteAddress || 'unknown').trim()
  return raw.slice(0, 128) || 'unknown'
}

/** Create an Express middleware that limits to `max` requests per `windowMs` per IP. */
function createIpLimiter({ windowMs, max, errorMessage }) {
  const buckets = new Map()

  function prune() {
    const now = Date.now()
    for (const [k, v] of buckets) {
      if (now - v.start > windowMs * 3) buckets.delete(k)
    }
  }

  return function rateLimitMiddleware(req, res, next) {
    if (Math.random() < 0.02) prune()
    const ip = getClientIp(req)
    const now = Date.now()
    let b = buckets.get(ip)
    if (!b || now - b.start >= windowMs) {
      b = { start: now, count: 0 }
      buckets.set(ip, b)
    }
    b.count++
    if (b.count > max) {
      const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - b.start)) / 1000))
      res.setHeader('Retry-After', String(retryAfterSec))
      return res.status(429).json({ code: 'rate_limited', error: errorMessage })
    }
    return next()
  }
}

// ── Per-endpoint IP limiters ────────────────────────────────────────────────

const ERR = 'Prea multe încercări. Încearcă din nou mai târziu.'

/** POST /api/auth/login — 10 req / IP / 60s */
const loginLimiter = createIpLimiter({ windowMs: 60_000, max: 10, errorMessage: ERR })

/** POST /api/auth/signup — 5 req / IP / 60s */
const signupLimiter = createIpLimiter({ windowMs: 60_000, max: 5, errorMessage: ERR })

/** POST /api/auth/forgot-password — 5 req / IP / 15min */
const forgotPasswordLimiter = createIpLimiter({ windowMs: 15 * 60_000, max: 5, errorMessage: ERR })

/** POST /api/auth/resend-code — 3 req / IP / 10min */
const resendCodeLimiter = createIpLimiter({ windowMs: 10 * 60_000, max: 3, errorMessage: ERR })

/** POST /api/auth/verify — 10 req / IP / 60s (OTP lockout handled per-email below) */
const verifyIpLimiter = createIpLimiter({ windowMs: 60_000, max: 10, errorMessage: ERR })

/** POST /api/auth/reset-password — 10 req / IP / 60s */
const resetPasswordLimiter = createIpLimiter({ windowMs: 60_000, max: 10, errorMessage: ERR })

/** POST /api/auth/google — 20 req / IP / 60s */
const googleAuthLimiter = createIpLimiter({ windowMs: 60_000, max: 20, errorMessage: ERR })

// ── Per-email OTP attempt tracking ─────────────────────────────────────────

function pruneOtpBuckets() {
  const now = Date.now()
  for (const [k, v] of otpAttemptBuckets) {
    if (now - v.windowStart > OTP_WINDOW_MS * 2) otpAttemptBuckets.delete(k)
  }
}

/**
 * Call after a wrong OTP code.
 * Returns { shouldClearCode: boolean } — when true, the route handler must
 * clear verificationCode + verificationCodeExpiresAt in the DB before responding.
 */
function recordOtpFailure(email) {
  if (Math.random() < 0.05) pruneOtpBuckets()
  const now = Date.now()
  let b = otpAttemptBuckets.get(email)
  if (!b || now - b.windowStart >= OTP_WINDOW_MS) {
    b = { count: 0, windowStart: now }
    otpAttemptBuckets.set(email, b)
  }
  b.count++
  return { shouldClearCode: b.count >= OTP_MAX_ATTEMPTS }
}

/**
 * Call after a successful OTP verification to reset the attempt counter.
 */
function clearOtpAttempts(email) {
  otpAttemptBuckets.delete(email)
}

module.exports = {
  loginLimiter,
  signupLimiter,
  forgotPasswordLimiter,
  resendCodeLimiter,
  verifyIpLimiter,
  resetPasswordLimiter,
  googleAuthLimiter,
  recordOtpFailure,
  clearOtpAttempts,
}
