import type { LangCode } from '../i18n/menu'
import type { PublicProduct } from '../lib/api'

export type CartLineSpecs = {
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

export function extractCartLineSpecsFromProduct(row: PublicProduct): CartLineSpecs {
  return {
    energieNominala: trimStr(row.energieNominala),
    capacitate: trimStr(row.capacitate),
    cicluriDescarcare: trimStr(row.cicluriDescarcare),
    garantie: trimStr(row.garantie),
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
  if (lang === 'zh') {
    return {
      energie: '标称能量',
      capacitate: '容量',
      cicluri: '放电循环',
      garantie: '保修',
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
  const L = specLabels(lang)
  const items = [
    { label: L.energie, value: specs.energieNominala },
    { label: L.capacitate, value: specs.capacitate },
    { label: L.cicluri, value: specs.cicluriDescarcare },
    { label: L.garantie, value: specs.garantie },
  ].filter((x): x is { label: string; value: string } => Boolean(x.value))
  if (items.length === 0) return null

  return (
    <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-4">
      {items.map(({ label, value }) => (
        <div key={label}>
          <dt className="text-[0.65rem] font-bold uppercase tracking-wide text-slate-500 font-['Inter']">{label}</dt>
          <dd className="mt-1 text-sm font-semibold leading-snug text-slate-900 font-['Inter']">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
