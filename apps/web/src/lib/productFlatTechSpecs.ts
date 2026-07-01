import type { PublicProduct } from './api'
import type { ProductDetailTranslations } from '../i18n/product-detail'

function whToKwhDisplay(wh: string | null | undefined): string | null {
  if (!wh) return null
  const numStr = String(wh).replace(/\s*Wh$/i, '').replace(',', '.').replace(/\s/g, '')
  const num = parseFloat(numStr)
  if (Number.isNaN(num)) return wh
  const kwh = num / 1000
  return `${kwh % 1 === 0 ? kwh.toFixed(0) : kwh.toFixed(2)} kWh`
}

/** Flat product-level technical rows (residential / single-model products). */
export function buildProductFlatTechRows(
  p: PublicProduct,
  tr: ProductDetailTranslations,
): [string, string][] {
  const rows: [string, string][] = []
  const add = (k: string, v: unknown) => {
    const s = v != null ? String(v).trim() : ''
    if (s) rows.push([k, s])
  }
  const energieDisplay = whToKwhDisplay(p.energieNominala)
  if (energieDisplay) rows.push([tr.specEnergieNominala, energieDisplay])
  add(tr.specCapacitate, p.capacitate)
  add(tr.techCurentMaxDescarcare, (p as { curentMaxDescarcare?: string }).curentMaxDescarcare)
  add(tr.techCurentMaxIncarcare, (p as { curentMaxIncarcare?: string }).curentMaxIncarcare)
  add(tr.specCicluriDescarcare, p.cicluriDescarcare)
  add(tr.techAdancimeDescarcare, (p as { adancimeDescarcare?: string }).adancimeDescarcare)
  add(tr.specGreutate, (p as { greutate?: string }).greutate)
  add(tr.techDimensiuni, (p as { dimensiuni?: string }).dimensiuni)
  add(tr.techProtectie, (p as { protectie?: string }).protectie)
  add(tr.techCertificari, (p as { certificari?: string }).certificari)
  add(tr.techGarantie, p.garantie)
  add(tr.techTensiuneNominala, p.tensiuneNominala)
  add(tr.techEficientaCiclu, (p as { eficientaCiclu?: string }).eficientaCiclu)
  add(tr.techTemperaturaFunctionare, (p as { temperaturaFunctionare?: string }).temperaturaFunctionare)
  add(tr.techTemperaturaStocare, (p as { temperaturaStocare?: string }).temperaturaStocare)
  add(tr.techUmiditate, (p as { umiditate?: string }).umiditate)
  return rows
}
