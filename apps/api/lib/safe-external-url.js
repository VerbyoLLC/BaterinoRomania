/**
 * Partner-entered website and social links. Only http(s) is stored.
 * A missing scheme is treated as https. javascript:, data:, and other schemes become ''.
 */
function sanitizeExternalUrl(value) {
  if (value === undefined) return undefined
  if (value === null) return null
  const t = String(value).trim()
  if (!t) return ''
  const withScheme = /^https?:\/\//i.test(t) ? t : `https://${t}`
  let parsed
  try {
    parsed = new URL(withScheme)
  } catch {
    return ''
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return ''
  if (!parsed.hostname) return ''
  return parsed.href
}

module.exports = { sanitizeExternalUrl }
