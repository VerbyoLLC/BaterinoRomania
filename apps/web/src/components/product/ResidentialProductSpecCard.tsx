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
      <span className="block text-sm font-bold uppercase tracking-wide text-neutral-500 font-['Inter']">
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

export type ResidentialTechSpecTableProps = {
  rows: Array<{ label: string; value: string }>
  ariaLabel?: string
}

/** One spec per row: description (left) · value (right), on #f7f7f7. */
export function ResidentialTechSpecTable({ rows, ariaLabel }: ResidentialTechSpecTableProps) {
  if (rows.length === 0) return null
  return (
    <div className="overflow-hidden rounded-[10px] bg-[#f7f7f7]">
      <table className="w-full table-fixed border-collapse text-left" aria-label={ariaLabel}>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={`${row.label}-${i}`}
              className="border-b border-neutral-200/55 last:border-b-0"
            >
              <th
                scope="row"
                className="w-[42%] min-w-0 px-4 py-3 align-top text-sm font-bold uppercase tracking-wide text-neutral-500 font-['Inter'] sm:w-[40%]"
              >
                {row.label}
              </th>
              <td className="min-w-0 px-4 py-3 align-top text-sm font-semibold text-neutral-900 font-['Inter'] leading-snug break-words">
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
