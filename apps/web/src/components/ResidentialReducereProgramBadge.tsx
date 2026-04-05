import type { PublicProduct } from '../lib/api'
import { productHasEligibleReducerePrograms } from '../lib/api'

type Props = {
  product: PublicProduct
  label: string
  className?: string
}

/** Badge „Program de reducere” când produsul are programe bifate în admin. */
export default function ResidentialReducereProgramBadge({ product, label, className = '' }: Props) {
  if (!productHasEligibleReducerePrograms(product)) return null
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-violet-900 font-['Inter'] ${className}`.trim()}
    >
      {label}
    </span>
  )
}
