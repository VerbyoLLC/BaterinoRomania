/**
 * Fields match the industrial template technical spec table (one row per label; values are per model).
 * Stable `key` for JSON; `label` for UI / public table.
 */
export const INDUSTRIAL_SPEC_FIELDS: readonly { key: string; label: string }[] = [
  { key: 'energySystem', label: 'Energy System' },
  { key: 'nominalVoltage', label: 'Nominal Voltage' },
  { key: 'nominalCapacity', label: 'Nominal Capacity' },
  { key: 'nominalEnergy', label: 'Nominal Energy' },
  { key: 'systemConfiguration', label: 'System Configuration' },
  { key: 'cellType', label: 'Cell Type' },
  { key: 'chemistry', label: 'Chemistry' },
  { key: 'cycleLife', label: 'Cycle life' },
  { key: 'batteryModule', label: 'Battery Module' },
  { key: 'batteryCluster', label: 'Battery Cluster' },
  { key: 'maxOutputPower', label: 'Max Output Power' },
  { key: 'ratedOutputVoltage', label: 'Rated Output Voltage' },
  { key: 'acAccessMethod', label: 'AC Access Method' },
  { key: 'ratedGridFrequency', label: 'Rated Grid Frequency' },
  { key: 'conversionEfficiency', label: 'Conversion Efficiency' },
  { key: 'coolingMethod', label: 'Cooling Method' },
  { key: 'communication', label: 'Communication' },
  { key: 'waterproof', label: 'Waterproof' },
  { key: 'corrosionLevel', label: 'Corrosion Level' },
  { key: 'noiseLevel', label: 'Noise Level' },
  { key: 'chargeTemperature', label: 'Charge Temperature' },
  { key: 'dischargeTemperature', label: 'Discharge Temperature' },
  { key: 'storageTemperature', label: 'Storage Temperature' },
  { key: 'altitude', label: 'Altitude' },
  { key: 'certification', label: 'Certification' },
  { key: 'warranty', label: 'Warranty' },
  { key: 'dimensions', label: 'Dimensions [L×W×H]' },
  { key: 'weight', label: 'Weight' },
] as const

export type IndustrialModelSpecEntry = {
  modelName: string
  specs: Record<string, string>
}

export type IndustrialTechnicalSpecsData = {
  entries: IndustrialModelSpecEntry[]
}

const SPEC_KEYS = INDUSTRIAL_SPEC_FIELDS.map((f) => f.key)
const LABEL_TO_KEY = new Map(INDUSTRIAL_SPEC_FIELDS.map((f) => [f.label, f.key]))

export function emptySpecsRecord(): Record<string, string> {
  return Object.fromEntries(SPEC_KEYS.map((k) => [k, '']))
}

export function createEmptyIndustrialModelEntry(): IndustrialModelSpecEntry {
  return { modelName: '', specs: emptySpecsRecord() }
}

export function createEmptyIndustrialTechnicalSpecs(): IndustrialTechnicalSpecsData {
  return { entries: [] }
}

/** --- Legacy shape: { models: string[], rows: [{ label, merged?, values? }] } --- */
type LegacyRow = { label?: string; merged?: unknown; values?: unknown }

function normalizeFromLegacy(o: { models: unknown[]; rows: LegacyRow[] }): IndustrialTechnicalSpecsData | null {
  const modelNames = o.models.map((m) => String(m ?? '').trim())
  if (modelNames.length === 0) return null
  const rows = Array.isArray(o.rows) ? o.rows : []
  const entries: IndustrialModelSpecEntry[] = modelNames.map((modelName, colIdx) => {
    const specs = emptySpecsRecord()
    for (const row of rows) {
      const label = String(row?.label ?? '')
      const key = LABEL_TO_KEY.get(label)
      if (!key) continue
      if (row.merged != null && row.merged !== '') {
        specs[key] = String(row.merged)
      } else if (Array.isArray(row.values)) {
        specs[key] = String(row.values[colIdx] ?? '')
      }
    }
    return { modelName, specs }
  })
  return { entries }
}

export function normalizeIndustrialTechnicalSpecs(raw: unknown): IndustrialTechnicalSpecsData | null {
  if (raw == null) return null
  let parsed: unknown = raw
  if (typeof raw === 'string') {
    const t = raw.trim()
    if (!t) return null
    try {
      parsed = JSON.parse(t) as unknown
    } catch {
      return null
    }
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  const o = parsed as Record<string, unknown>

  if (Array.isArray(o.entries)) {
    const entries: IndustrialModelSpecEntry[] = []
    for (const item of o.entries) {
      if (!item || typeof item !== 'object') continue
      const ent = item as { modelName?: unknown; specs?: unknown }
      const modelName = String(ent.modelName ?? '').trim()
      const specsIn = ent.specs && typeof ent.specs === 'object' ? (ent.specs as Record<string, unknown>) : {}
      const specs = emptySpecsRecord()
      for (const k of SPEC_KEYS) {
        if (k in specsIn && specsIn[k] != null) specs[k] = String(specsIn[k])
      }
      entries.push({ modelName, specs })
    }
    return { entries }
  }

  if (Array.isArray(o.models) && Array.isArray(o.rows)) {
    return normalizeFromLegacy({ models: o.models, rows: o.rows as LegacyRow[] })
  }

  return null
}
