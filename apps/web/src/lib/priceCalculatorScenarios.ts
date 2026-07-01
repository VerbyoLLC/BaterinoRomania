import type { PriceCalcChannel, PriceCalcInputs, PriceCalcMode } from './priceCalculator'

export type PriceCalcScenario = {
  id: string
  name: string
  productTag: string
  inputs: PriceCalcInputs
  mode: PriceCalcMode
  channel: PriceCalcChannel
  savedAt: number
}

const STORAGE_KEY = 'baterino.admin.price-calculator.scenarios.v1'

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === 'object'
}

function parseScenario(raw: unknown): PriceCalcScenario | null {
  if (!isRecord(raw)) return null
  const inputs = raw.inputs
  if (!isRecord(inputs)) return null
  const id = String(raw.id ?? '').trim()
  const name = String(raw.name ?? '').trim()
  if (!id || !name) return null
  const num = (k: string) => {
    const n = Number(inputs[k])
    return Number.isFinite(n) ? n : 0
  }
  const mode = raw.mode === 'profit' ? 'profit' : 'rrp'
  const channelRaw = String(raw.channel ?? 'full')
  const channel: PriceCalcChannel =
    channelRaw === 'direct' ||
    channelRaw === 'installer' ||
    channelRaw === 'distributor' ||
    channelRaw === 'full'
      ? channelRaw
      : 'full'
  return {
    id,
    name,
    productTag: String(raw.productTag ?? '').trim(),
    inputs: {
      rrp: num('rrp'),
      map: num('map'),
      vat: num('vat'),
      landed: num('landed'),
      profit: num('profit'),
      cushion: num('cushion'),
      dinst: num('dinst'),
      ddist: num('ddist'),
      fx: num('fx') || 5.24,
    },
    mode,
    channel,
    savedAt: Number(raw.savedAt) || Date.now(),
  }
}

export function readPriceCalcScenarios(): PriceCalcScenario[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map(parseScenario).filter((s): s is PriceCalcScenario => s != null)
  } catch {
    return []
  }
}

export function writePriceCalcScenarios(scenarios: PriceCalcScenario[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios))
  } catch {
    /* quota / private mode */
  }
}

export function createPriceCalcScenario(
  payload: Omit<PriceCalcScenario, 'id' | 'savedAt'>,
): PriceCalcScenario {
  return {
    ...payload,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    savedAt: Date.now(),
  }
}
