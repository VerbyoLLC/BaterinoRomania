import type { LangCode } from '../i18n/menu'
import { getCatalogProductSpecLines, type PublicProduct } from '../lib/api'
import { normalizeIndustrialTechnicalSpecs } from '../lib/industrialTechnicalSpec'

export type CartLineSpecs = {
  /** Technical summary under product title (catalog / model specs — never marketing subtitle). */
  primaryLine?: string
  secondaryLine?: string
  energieNominala?: string
  capacitate?: string
  cicluriDescarcare?: string
  garantie?: string
}

function trimStr(v: unknown): string | undefined {
  if (v == null) return undefined
  const s = String(v).trim()
  return s || undefined
}

function isMeaningfulSpec(value: string | undefined): value is string {
  if (!value) return false
  const t = value.trim()
  return t !== '' && t !== '—' && t !== '-'
}

function buildIndustrialCartSummary(product: PublicProduct): { line1?: string; line2?: string } {
  const data = normalizeIndustrialTechnicalSpecs(product.technicalSpecsModels)
  const first = data?.entries?.find((e) => e.modelName || Object.values(e.specs || {}).some((v) => String(v).trim()))
  if (!first) return {}
  const s = first.specs || {}
  const line1Parts = [s.nominalEnergy, s.nominalVoltage, s.nominalCapacity, s.chemistry]
    .map((v) => trimStr(v))
    .filter(Boolean)
  const line2Parts = [s.cycleLife, s.coolingMethod, s.warranty, s.dimensions]
    .map((v) => trimStr(v))
    .filter(Boolean)
  return {
    line1: line1Parts.length > 0 ? line1Parts.join(' • ') : trimStr(first.modelName),
    line2: line2Parts.length > 0 ? line2Parts.join(' • ') : undefined,
  }
}

function extractIndustrialGridFields(product: PublicProduct): Pick<
  CartLineSpecs,
  'energieNominala' | 'capacitate' | 'cicluriDescarcare' | 'garantie'
> {
  const data = normalizeIndustrialTechnicalSpecs(product.technicalSpecsModels)
  const first = data?.entries?.find((e) => Object.values(e.specs || {}).some((v) => String(v).trim()))
  if (!first?.specs) return {}
  const s = first.specs
  return {
    energieNominala: trimStr(s.nominalEnergy),
    capacitate: trimStr(s.nominalCapacity),
    cicluriDescarcare: trimStr(s.cycleLife),
    garantie: trimStr(s.warranty),
  }
}

export function extractCartLineSpecsFromProduct(row: PublicProduct): CartLineSpecs {
  const isIndustrial = row.tipProdus === 'industrial'
  const fromIndustrial = isIndustrial ? extractIndustrialGridFields(row) : {}

  const energieNominala = trimStr(row.energieNominala) || fromIndustrial.energieNominala
  const capacitate = trimStr(row.capacitate) || fromIndustrial.capacitate
  const cicluriDescarcare = trimStr(row.cicluriDescarcare) || fromIndustrial.cicluriDescarcare
  const garantie = trimStr(row.garantie) || fromIndustrial.garantie

  const gridValues = [energieNominala, capacitate, cicluriDescarcare, garantie].filter(Boolean)
  if (gridValues.length >= 2) {
    return { energieNominala, capacitate, cicluriDescarcare, garantie }
  }

  const { specLine1, specLine2 } = getCatalogProductSpecLines(row)
  let line1 = isMeaningfulSpec(specLine1) ? specLine1.trim() : undefined
  const line2 = isMeaningfulSpec(specLine2) ? specLine2.trim() : undefined

  if (!line1) line1 = energieNominala

  const industrialSummary = isIndustrial ? buildIndustrialCartSummary(row) : {}
  if (!line1) line1 = industrialSummary.line1

  let secondaryLine: string | undefined
  if (line2 && line2 !== line1) {
    secondaryLine = line2
  } else if (industrialSummary.line2 && industrialSummary.line2 !== line1) {
    secondaryLine = industrialSummary.line2
  }

  return {
    primaryLine: line1,
    secondaryLine,
    energieNominala,
    capacitate,
    cicluriDescarcare,
    garantie,
  }
}

function specLabels(lang: LangCode) {
  if (lang === 'en') {
    return {
      energie: 'Nominal energy',
      capacitate: 'Capacity',
      cicluri: 'Discharge cycles',
      garantie: 'Warranty',
    }
  }

  return {
    energie: 'Energie nominală',
    capacitate: 'Capacitate',
    cicluri: 'Cicluri de descărcare',
    garantie: 'Garanție',
  }
}

export function CartLineSpecDetails({
  specs,
  lang,
}: {
  specs: CartLineSpecs | null | undefined
  lang: LangCode
}) {
  if (!specs) return null

  const hasSummary = Boolean(specs.primaryLine || specs.secondaryLine)

  const L = specLabels(lang)
  const gridItems = [
    { label: L.energie, value: specs.energieNominala },
    { label: L.capacitate, value: specs.capacitate },
    { label: L.cicluri, value: specs.cicluriDescarcare },
    { label: L.garantie, value: specs.garantie },
  ].filter((x): x is { label: string; value: string } => Boolean(x.value))

  if (!hasSummary && gridItems.length === 0) return null

  if (hasSummary) {
    return (
      <div className="mt-1.5 space-y-0.5">
        {specs.primaryLine ? (
          <p className="m-0 text-center text-sm font-normal leading-snug text-slate-600 font-['Inter'] sm:text-left">
            {specs.primaryLine}
          </p>
        ) : null}
        {specs.secondaryLine ? (
          <p className="m-0 text-center text-xs font-normal leading-snug text-slate-500 font-['Inter'] sm:text-left">
            {specs.secondaryLine}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-4">
      {gridItems.map(({ label, value }) => (
        <div key={label} className="text-center sm:text-left">
          <dt className="text-[0.65rem] font-bold uppercase tracking-wide text-slate-500 font-['Inter']">{label}</dt>
          <dd className="mt-1 text-sm font-semibold leading-snug text-slate-900 font-['Inter']">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
