import { useEffect, useRef } from 'react'
import { WAREHOUSE_SN_BODY_DIGITS, WAREHOUSE_SN_FACTORY_PREFIX } from '../../lib/api'

export const SN_GROUP_SIZE = 4
const SN_GROUP_COUNT = WAREHOUSE_SN_BODY_DIGITS / SN_GROUP_SIZE
const SN_GROUP_PLACEHOLDERS = ['5131', '4003', '2507', '0001']

export const EMPTY_SN_GROUPS: string[] = Array.from({ length: SN_GROUP_COUNT }, () => '')

/** Splits contiguous SN digits into the four 4-digit groups (used to prefill the inputs). */
export function serialDigitsToGroups(digits: string): string[] {
  const d = String(digits ?? '').replace(/\D/g, '').slice(0, WAREHOUSE_SN_BODY_DIGITS)
  return EMPTY_SN_GROUPS.map((_, i) => d.slice(i * SN_GROUP_SIZE, (i + 1) * SN_GROUP_SIZE))
}

/** LJC prefix + four 4-digit boxes; typing or pasting past a box spills into the next ones. */
export default function WarehouseSerialGroupsInput({
  groups,
  onChange,
  autoFocus = false,
}: {
  groups: string[]
  onChange: (groups: string[]) => void
  autoFocus?: boolean
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!autoFocus) return
    const id = window.setTimeout(() => inputRefs.current[0]?.focus(), 50)
    return () => window.clearTimeout(id)
  }, [autoFocus])

  const changeGroup = (index: number, raw: string) => {
    const next = [...groups]
    let rest = raw.replace(/\D/g, '')
    let last = index
    for (let g = index; g < SN_GROUP_COUNT && (g === index || rest); g++) {
      next[g] = rest.slice(0, SN_GROUP_SIZE)
      rest = rest.slice(SN_GROUP_SIZE)
      last = g
    }
    onChange(next)
    const focusIndex = next[last].length === SN_GROUP_SIZE ? Math.min(last + 1, SN_GROUP_COUNT - 1) : last
    if (focusIndex !== index) inputRefs.current[focusIndex]?.focus()
  }

  const keyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Backspace' || groups[index] || index === 0) return
    e.preventDefault()
    const next = [...groups]
    next[index - 1] = next[index - 1].slice(0, -1)
    onChange(next)
    inputRefs.current[index - 1]?.focus()
  }

  return (
    <div className="flex items-stretch gap-1.5 sm:gap-2">
      <span
        className="flex shrink-0 items-center rounded-xl border border-gray-300 bg-slate-100 px-2.5 font-mono text-sm font-semibold text-slate-700 sm:px-3"
        aria-hidden
      >
        {WAREHOUSE_SN_FACTORY_PREFIX}
      </span>
      {groups.map((group, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label={`Cifrele ${i * SN_GROUP_SIZE + 1}–${(i + 1) * SN_GROUP_SIZE} după ${WAREHOUSE_SN_FACTORY_PREFIX}`}
          value={group}
          onChange={(e) => changeGroup(i, e.target.value)}
          onKeyDown={(e) => keyDown(i, e)}
          onFocus={(e) => e.target.select()}
          placeholder={SN_GROUP_PLACEHOLDERS[i]}
          className="w-0 min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-1 py-2.5 text-center font-mono text-base text-slate-900 shadow-sm placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      ))}
    </div>
  )
}
