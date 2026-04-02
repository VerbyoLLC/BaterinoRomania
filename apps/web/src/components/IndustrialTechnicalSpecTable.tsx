import { useState } from 'react'
import { INDUSTRIAL_SPEC_FIELDS, type IndustrialTechnicalSpecsData } from '../lib/industrialTechnicalSpec'

type Props = {
  data: IndustrialTechnicalSpecsData
  modelLabel?: string
  /** If set, overrides INDUSTRIAL_SPEC_FIELDS labels (e.g. i18n by field key). */
  labelForKey?: (key: string) => string
}

export default function IndustrialTechnicalSpecTable({ data, modelLabel = 'Model', labelForKey }: Props) {
  const { entries } = data
  const n = entries.length
  const [hoverRow, setHoverRow] = useState<number | null>(null)
  const [hoverCol, setHoverCol] = useState<number | null>(null)

  if (n === 0) return null

  const rowLabel = (key: string) => labelForKey?.(key) ?? INDUSTRIAL_SPEC_FIELDS.find((f) => f.key === key)?.label ?? key

  const modelValues = entries.map((e) => e.modelName || '—')

  const dim = (r: number, c: number) => hoverRow === r || (c > 0 && hoverCol === c)

  return (
    <div className="overflow-x-auto">
      <table
        className="w-full min-w-[720px] border-collapse text-sm font-['Inter'] text-gray-800"
        onMouseLeave={() => {
          setHoverRow(null)
          setHoverCol(null)
        }}
      >
        <tbody>
          <tr className={`bg-neutral-100 transition-colors ${hoverRow === 0 ? 'bg-sky-50' : ''}`}>
            <th
              scope="row"
              className="border border-neutral-200 px-3 py-2 text-left text-slate-900 font-semibold"
              onMouseEnter={() => {
                setHoverRow(0)
                setHoverCol(null)
              }}
            >
              {modelLabel}
            </th>
            {modelValues.map((cell, j) => (
              <td
                key={`model-${j}`}
                className={`border border-neutral-200 px-2 py-2 text-center font-semibold text-slate-900 transition-colors ${
                  dim(0, j + 1) ? 'bg-sky-50/90' : ''
                }`}
                onMouseEnter={() => {
                  setHoverRow(0)
                  setHoverCol(j + 1)
                }}
              >
                {cell}
              </td>
            ))}
          </tr>
          {INDUSTRIAL_SPEC_FIELDS.map((field, i) => {
            const rowIdx = i + 1
            const values = entries.map((e) => e.specs[field.key] ?? '')
            const strip = (i % 2 === 0 ? 'bg-white' : 'bg-neutral-50/80') as string
            return (
              <tr
                key={field.key}
                className={`${strip} transition-colors ${hoverRow === rowIdx ? 'bg-sky-50/70' : ''}`}
              >
                <th
                  scope="row"
                  className="border border-neutral-200 px-3 py-2 text-left text-slate-900 font-medium"
                  onMouseEnter={() => {
                    setHoverRow(rowIdx)
                    setHoverCol(null)
                  }}
                >
                  {rowLabel(field.key)}
                </th>
                {values.map((cell, j) => (
                  <td
                    key={`${field.key}-${j}`}
                    className={`border border-neutral-200 px-2 py-2 text-center transition-colors ${
                      dim(rowIdx, j + 1) ? 'bg-sky-50/90' : ''
                    }`}
                    onMouseEnter={() => {
                      setHoverRow(rowIdx)
                      setHoverCol(j + 1)
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
