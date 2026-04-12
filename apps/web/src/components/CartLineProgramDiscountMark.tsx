import { Tag } from 'lucide-react'
import type { CartLine } from '../contexts/CartContext'
import { cartLineDiscountPercent } from '../contexts/CartContext'
import type { CartProgramDiscountTranslations } from '../i18n/cart-program-discount'

type Props = {
  line: Pick<CartLine, 'reducereProgramId' | 'reducereDiscountPercent'>
  programLabelById: Record<string, string>
  tr: CartProgramDiscountTranslations
}

export function cartLineHasProgramDiscount(line: Pick<CartLine, 'reducereDiscountPercent'>): boolean {
  return cartLineDiscountPercent(line) > 0
}

export function CartLineProgramDiscountMark({ line, programLabelById, tr }: Props) {
  if (!cartLineHasProgramDiscount(line)) return null
  const pct = cartLineDiscountPercent(line)
  const id = line.reducereProgramId?.trim()
  const resolved = id ? programLabelById[id] : undefined
  const program = resolved?.trim() || tr.discountProgramFallbackName
  const badge = tr.discountProgramBadge.replace('{program}', program).replace('{pct}', String(pct))

  return (
    <div className="mt-2 space-y-1.5">
      <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-emerald-200/90 bg-emerald-50/90 px-2.5 py-1 text-left text-xs font-semibold leading-snug text-emerald-950 font-['Inter'] ring-1 ring-emerald-100/80">
        <Tag className="h-3.5 w-3.5 shrink-0 text-emerald-800" strokeWidth={2.25} aria-hidden />
        <span className="min-w-0">{badge}</span>
      </span>
      <p className="m-0 max-w-xl text-[0.7rem] leading-snug text-slate-600 font-['Inter']">{tr.discountDocumentsNotice}</p>
    </div>
  )
}
