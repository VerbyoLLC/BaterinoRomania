/**
 * Residential product detail: one spec label + value.
 * Variations mirror ProductRezidential desktop list vs mobile tiled grid.
 */
export type ResidentialProductSpecCardVariant = 'plain' | 'tile'

export type ResidentialProductSpecCardProps = {
  label: string
  value: string
  variant?: ResidentialProductSpecCardVariant
}

export function ResidentialProductSpecCard({
  label,
  value,
  variant = 'plain',
}: ResidentialProductSpecCardProps) {
  const body = (
    <>
      <span className="block text-[11px] font-bold uppercase tracking-wide text-neutral-500 font-['Inter']">
        {label}
      </span>
      <span className="mt-1.5 block text-sm font-semibold text-neutral-900 font-['Inter'] leading-snug break-words">
        {value}
      </span>
    </>
  )

  if (variant === 'tile') {
    return <li className="min-w-0 rounded-[10px] bg-[#f7f7f7] px-3 py-3">{body}</li>
  }

  return <li className="min-w-0">{body}</li>
}
