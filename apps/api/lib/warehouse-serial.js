/** Extrage numărul de serie din textul QR (SN:…, JSON, URL ?sn=) sau întreg conținutul. */
function parseSerialFromQrPayload(raw) {
  const s = String(raw ?? '').trim()
  if (!s) return ''
  const prefixed = /^SN:\s*(.+)$/i.exec(s)
  if (prefixed) return prefixed[1].trim().slice(0, 512)
  if (s.startsWith('{')) {
    try {
      const j = JSON.parse(s)
      const sn = j.SN ?? j.sn ?? j.serialNumber ?? j.serial
      if (typeof sn === 'string' && sn.trim()) return sn.trim().slice(0, 512)
    } catch {
      // ignore
    }
  }
  try {
    const u = new URL(s)
    const q = u.searchParams.get('SN') || u.searchParams.get('sn')
    if (q && q.trim()) return q.trim().slice(0, 512)
  } catch {
    // not a URL
  }
  return s.slice(0, 512)
}

const WAREHOUSE_SN_FACTORY_PREFIX = 'LJC'
const WAREHOUSE_SN_BODY_DIGITS = 16

function normalizeWarehouseSerialNumber(raw) {
  let t = String(raw ?? '')
    .replace(/\s/g, '')
    .toUpperCase()
  if (!t) return ''
  if (t.startsWith(WAREHOUSE_SN_FACTORY_PREFIX)) {
    return WAREHOUSE_SN_FACTORY_PREFIX + t.slice(WAREHOUSE_SN_FACTORY_PREFIX.length).replace(/\s/g, '')
  }
  return `${WAREHOUSE_SN_FACTORY_PREFIX}${t}`
}

function isValidWarehouseSerialNumber(serial) {
  return new RegExp(`^${WAREHOUSE_SN_FACTORY_PREFIX}\\d{${WAREHOUSE_SN_BODY_DIGITS}}$`).test(String(serial ?? ''))
}

/**
 * 16 cifre după LJC (numerotate 1–16): cifrele 9–10 = anul (YY → 20YY), 11–12 = luna.
 * Ex. …250905… → 09/2025 (nu MMYY la poz. 7–10).
 */
function deriveProducedOnFromSerial(serialNumber) {
  let digits = String(serialNumber ?? '').replace(/\D/g, '')
  if (digits.length > WAREHOUSE_SN_BODY_DIGITS) {
    digits = digits.slice(-WAREHOUSE_SN_BODY_DIGITS)
  }
  if (digits.length < WAREHOUSE_SN_BODY_DIGITS) return ''
  const year = digits.slice(8, 10) // cifre 9–10
  const month = digits.slice(10, 12) // cifre 11–12
  if (!/^\d{2}$/.test(month) || !/^\d{2}$/.test(year)) return ''
  const m = parseInt(month, 10)
  if (m < 1 || m > 12) return ''
  return `${month}/20${year}`
}

const SN_INVALID_MESSAGE =
  'SN invalid. Format: LJC (fabrică) + 16 cifre — tensiune 2, capacitate 4, cifre 9–10 an (YY) / 11–12 lună, lot 6 (ex. LJC5120001125090001). La manual poți introduce doar cele 16 cifre după LJC.'

module.exports = {
  parseSerialFromQrPayload,
  normalizeWarehouseSerialNumber,
  isValidWarehouseSerialNumber,
  deriveProducedOnFromSerial,
  WAREHOUSE_SN_FACTORY_PREFIX,
  WAREHOUSE_SN_BODY_DIGITS,
  SN_INVALID_MESSAGE,
}
