import { useEffect, useMemo, useState } from 'react'
import type { PublicProduct } from '../../lib/api'
import type { ProductDetailTranslations } from '../../i18n/product-detail'
import type { LangCode } from '../../i18n/menu'
import { getIndustrialBessTemplateTranslations } from '../../i18n/industrial-bess-template'
import {
  INDUSTRIAL_SPEC_FIELDS,
  normalizeIndustrialTechnicalSpecs,
  type IndustrialModelSpecEntry,
} from '../../lib/industrialTechnicalSpec'
import { buildProductFlatTechRows } from '../../lib/productFlatTechSpecs'

type Props = {
  product: PublicProduct
  tr: ProductDetailTranslations
  langCode: string
}

function entryHasSpecs(entry: IndustrialModelSpecEntry): boolean {
  return Object.values(entry.specs ?? {}).some((v) => String(v ?? '').trim())
}

function modelSpecRows(entry: IndustrialModelSpecEntry, specLabel: (key: string) => string): [string, string][] {
  return INDUSTRIAL_SPEC_FIELDS.map((field) => {
    const value = String(entry.specs[field.key] ?? '').trim()
    return [specLabel(field.key), value] as [string, string]
  }).filter(([, value]) => value)
}

function SpecTable({ rows }: { rows: [string, string][] }) {
  return (
    <table className="w-full border-collapse text-[13.5px]">
      <tbody>
        {rows.map(([key, val]) => (
          <tr key={key} className="border-b border-[#e8eaf0]">
            <td className="py-2.5 pr-3 text-[#6a7281]">{key}</td>
            <td className="py-2.5 text-right font-semibold text-[#0f1422]">{val}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function PartnerProductTechnicalSpecsPanel({ product, tr, langCode }: Props) {
  const industrialTr = getIndustrialBessTemplateTranslations(langCode as LangCode)
  const specLabel = (key: string) => industrialTr.techSpecByKey[key] ?? key

  const modelEntries = useMemo(() => {
    const raw =
      product.technicalSpecsModels ??
      (product as { technical_specs_models?: unknown }).technical_specs_models
    const normalized = normalizeIndustrialTechnicalSpecs(raw)
    return (normalized?.entries ?? []).filter(entryHasSpecs)
  }, [product])

  const [selectedIdx, setSelectedIdx] = useState(0)

  useEffect(() => {
    setSelectedIdx(0)
  }, [product.id])

  if (modelEntries.length > 0) {
    const safeIdx = Math.min(selectedIdx, modelEntries.length - 1)
    const entry = modelEntries[safeIdx]!
    const nominalEnergy = String(entry.specs.nominalEnergy ?? '').trim()
    const modelLabel = entry.modelName.trim() || `${industrialTr.modelLabel} ${safeIdx + 1}`
    const rows = modelSpecRows(entry, specLabel).filter(
      ([label]) => !(nominalEnergy && label === specLabel('nominalEnergy')),
    )

    return (
      <div className="animate-[fadeIn_.2s_ease] space-y-4">
        {modelEntries.length > 1 ? (
          <div
            className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label={industrialTr.modelLabel}
          >
            {modelEntries.map((e, i) => {
              const label = e.modelName.trim() || `${industrialTr.modelLabel} ${i + 1}`
              const active = i === safeIdx
              return (
                <button
                  key={`${e.modelName}-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedIdx(i)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                    active
                      ? 'border-[#0f1422] bg-[#0f1422] text-white'
                      : 'border-[#e8eaf0] bg-white text-[#4d6079] hover:border-[#d9dde6] hover:text-[#0f1422]'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        ) : (
          <p className="m-0 text-[11px] font-bold uppercase tracking-[0.1em] text-[#4d6079]">{modelLabel}</p>
        )}

        {nominalEnergy ? (
          <div className="rounded-[11px] border border-[#e8eaf0] bg-gradient-to-b from-[#f8fafc] to-white px-4 py-3">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6a7281]">
              {specLabel('nominalEnergy')}
            </p>
            <p className="m-0 mt-1 text-xl font-extrabold tabular-nums tracking-tight text-[#0f1422]">
              {nominalEnergy}
            </p>
            {modelEntries.length > 1 ? (
              <p className="m-0 mt-1 text-[13px] font-semibold text-[#4d6079]">{modelLabel}</p>
            ) : null}
          </div>
        ) : null}

        {rows.length > 0 ? (
          <SpecTable rows={rows} />
        ) : (
          <p className="m-0 py-4 text-center text-sm text-[#6a7281]">{tr.techSpecsEmpty}</p>
        )}
      </div>
    )
  }

  const flatRows = buildProductFlatTechRows(product, tr)
  if (flatRows.length === 0) {
    return <p className="m-0 py-6 text-center text-sm text-[#6a7281]">{tr.techSpecsEmpty}</p>
  }

  return (
    <div className="animate-[fadeIn_.2s_ease]">
      <SpecTable rows={flatRows} />
    </div>
  )
}
