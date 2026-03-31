import { INDUSTRIAL_SPEC_FIELDS, type IndustrialTechnicalSpecsData } from '../lib/industrialTechnicalSpec'

type Props = {
  data: IndustrialTechnicalSpecsData
}

export default function IndustrialTechnicalSpecTable({ data }: Props) {
  const { entries } = data
  const n = entries.length
  if (n === 0) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm font-['Inter'] text-gray-800">
        <tbody>
          <tr className="bg-neutral-100">
            <th
              scope="row"
              className="border border-neutral-200 px-3 py-2 text-left text-slate-900 font-semibold"
            >
              Model
            </th>
            {entries.map((e, j) => (
              <td
                key={`model-${j}`}
                className="border border-neutral-200 px-2 py-2 text-center font-semibold text-slate-900"
              >
                {e.modelName || '—'}
              </td>
            ))}
          </tr>
          {INDUSTRIAL_SPEC_FIELDS.map((field, i) => (
            <tr
              key={field.key}
              className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50/80'}
            >
              <th
                scope="row"
                className="border border-neutral-200 px-3 py-2 text-left text-slate-900 font-medium"
              >
                {field.label}
              </th>
              {entries.map((e, j) => (
                <td key={`${field.key}-${j}`} className="border border-neutral-200 px-2 py-2 text-center">
                  {e.specs[field.key] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
