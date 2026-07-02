import { Clock, Sparkles, Tag, Truck, Wrench } from 'lucide-react'

export type CatalogProductFeatureBadgeData = {
  type: 'stock' | 'delivery' | 'transport' | 'install' | 'reduceri'
  label: string
}

/** Promo chip overlaid on the product image (admin „Promotie” SKUs). */
export function CatalogProductPromoChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-[5px] text-[11px] font-semibold text-sky-800 shadow-[0_2px_6px_-2px_rgba(15,20,34,0.15)]">
      <Sparkles size={12} className="shrink-0 text-sky-600" aria-hidden />
      {label}
    </span>
  )
}

/** Stock / delivery chips overlaid on the product image (Produse page style). */
export function CatalogProductImageChip({ badge }: { badge: CatalogProductFeatureBadgeData }) {
  const isStock = badge.type === 'stock'
  const deliveryOnly =
    badge.type === 'delivery'
      ? badge.label.replace(/^(Livrare|Delivery)\s+/i, '').trim() || badge.label
      : badge.label

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-[5px] text-[11px] font-semibold shadow-[0_2px_6px_-2px_rgba(15,20,34,0.15)] ${
        isStock ? 'text-[#0e8459]' : 'text-[#6a7281]'
      }`}
    >
      {isStock ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#159b6a]" aria-hidden /> : null}
      {badge.type === 'delivery' ? <Clock size={12} aria-hidden /> : null}
      {isStock ? badge.label : deliveryOnly}
    </span>
  )
}

/** Transport / install / reduceri tags below specs (Produse page style). */
export function CatalogProductFeatureBadge({ badge }: { badge: CatalogProductFeatureBadgeData }) {
  const Icon = badge.type === 'transport' ? Truck : badge.type === 'install' ? Wrench : Tag

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8eaf0] bg-[#f4f5f7] px-2.5 py-[5px] text-[11.5px] font-semibold text-[#4d6079]">
      <Icon size={13} className="shrink-0 text-[#159b6a]" aria-hidden />
      {badge.label}
    </span>
  )
}
