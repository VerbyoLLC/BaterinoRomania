import type { IndustrialBessTemplateTranslations } from '../../i18n/industrial-bess-template'
import type { IndustrialModelSpecEntry } from '../../lib/industrialTechnicalSpec'

/** Layout / typography presets for industrial configuration cards. */
export type IndustrialModelConfigurationVariant = 'default' | 'compact'

function IndustrialModelEnergyHighlight({
  specLabel,
  nominalEnergyVal,
  isCompact,
  stretchHeight,
  valueElement: ValueEl = 'p',
  valueId,
}: {
  specLabel: (key: string) => string
  nominalEnergyVal: string
  isCompact: boolean
  stretchHeight?: boolean
  valueElement?: 'p' | 'h2'
  valueId?: string
}) {
  const valueClass = `m-0 mt-1.5 min-w-0 font-extrabold font-['Inter'] tracking-tight text-slate-900 leading-tight tabular-nums break-words ${
    isCompact ? 'text-lg sm:text-xl' : 'text-2xl sm:text-[26px] leading-none'
  }`

  return (
    <div
      className={`rounded-lg border border-slate-200/80 bg-gradient-to-b from-slate-50 to-white ${
        isCompact ? 'px-2.5 py-2.5 sm:px-3 sm:py-3' : 'px-3 py-3 sm:px-3.5 sm:py-3.5'
      } ${
        stretchHeight ? 'flex min-h-[6.25rem] shrink-0 flex-col justify-center sm:min-h-[6.75rem]' : ''
      }`}
    >
      <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 font-['Inter'] sm:text-xs">
        {specLabel('nominalEnergy')}
      </p>
      {ValueEl === 'h2' ? (
        <h2 id={valueId} className={valueClass}>
          {nominalEnergyVal}
        </h2>
      ) : (
        <p className={valueClass}>{nominalEnergyVal}</p>
      )}
    </div>
  )
}

/** Mobile bottom-sheet header — nominal energy (same treatment as {@link IndustrialModelConfigurationCard}) + model line. */
export type IndustrialModelConfigurationSheetHeaderProps = {
  entry: IndustrialModelSpecEntry
  specLabel: (key: string) => string
  /** `aria-labelledby` target for the sheet title (nominal energy value). */
  titleId: string
}

export function IndustrialModelConfigurationSheetHeader({
  entry,
  specLabel,
  titleId,
}: IndustrialModelConfigurationSheetHeaderProps) {
  const nominalEnergyVal = String(entry.specs.nominalEnergy ?? '').trim() || '—'

  return (
    <div className="min-w-0 flex-1 pr-2">
      <IndustrialModelEnergyHighlight
        specLabel={specLabel}
        nominalEnergyVal={nominalEnergyVal}
        isCompact={false}
        stretchHeight={false}
        valueElement="h2"
        valueId={titleId}
      />
      <p className="m-0 mt-2 break-words font-['Inter'] text-base font-semibold leading-snug text-slate-800">
        {entry.modelName || '—'}
      </p>
    </div>
  )
}

export type IndustrialModelConfigurationCardProps = {
  entry: IndustrialModelSpecEntry
  tr: IndustrialBessTemplateTranslations
  specLabel: (key: string) => string
  /**
   * Visual density. When omitted, derived from `manyModels`:
   * `manyModels === true` → `compact`.
   */
  variant?: IndustrialModelConfigurationVariant
  /** @deprecated Prefer `variant="compact"` — compact padding/typography when many models on mobile. */
  manyModels?: boolean
  /** Mobile: opens full spec sheet */
  onPress?: () => void
  /** Desktop: WhatsApp / expand interaction */
  onCardClick?: () => void
  isCardExpanded?: boolean
  /** Desktop slider/grid: equal-height cell */
  stretchHeight?: boolean
}

export function IndustrialModelConfigurationCard({
  entry,
  tr,
  specLabel,
  variant: variantProp,
  manyModels = false,
  onPress,
  onCardClick,
  isCardExpanded,
  stretchHeight,
}: IndustrialModelConfigurationCardProps) {
  const variant: IndustrialModelConfigurationVariant = variantProp ?? (manyModels ? 'compact' : 'default')
  const isCompact = variant === 'compact'

  const nominalEnergyVal = String(entry.specs.nominalEnergy ?? '').trim() || '—'
  const detailCells = [
    { label: tr.modelLabel, value: entry.modelName },
    { label: specLabel('nominalVoltage'), value: String(entry.specs.nominalVoltage ?? '').trim() || '—' },
    { label: specLabel('maxOutputPower'), value: String(entry.specs.maxOutputPower ?? '').trim() || '—' },
    { label: specLabel('cycleLife'), value: String(entry.specs.cycleLife ?? '').trim() || '—' },
  ] as const

  const pressableClass =
    'cursor-pointer touch-manipulation text-left active:scale-[0.995] hover:border-neutral-300 hover:shadow-md hover:shadow-slate-900/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2'

  const shellClass = `flex min-h-0 min-w-0 w-full flex-col rounded-[10px] border border-neutral-200 bg-white shadow-sm transition-all duration-200 ease-out ${
    stretchHeight ? 'h-full' : ''
  } ${
    onPress || onCardClick ? pressableClass : 'hover:border-neutral-300 hover:shadow-md hover:shadow-slate-900/8'
  } ${onCardClick && isCardExpanded ? 'border-slate-900 ring-1 ring-slate-900/15' : ''} ${
    isCompact ? 'px-3 py-3 sm:px-3 sm:py-3.5' : 'px-4 py-4'
  }`

  const inner = (
    <>
      <IndustrialModelEnergyHighlight
        specLabel={specLabel}
        nominalEnergyVal={nominalEnergyVal}
        isCompact={isCompact}
        stretchHeight={stretchHeight}
      />
      <div
        className={`mt-4 grid min-h-0 w-full grid-cols-2 gap-x-3 gap-y-4 ${stretchHeight ? 'min-h-0 flex-1 content-start' : ''}`}
      >
        {detailCells.map((cell, j) => (
          <div key={`${cell.label}-${j}`} className="min-w-0">
            <p className="m-0 text-xs font-medium text-neutral-500 font-['Inter'] leading-tight sm:text-[13px]">
              {cell.label}
            </p>
            <p
              className={`m-0 mt-1 font-semibold text-neutral-900 font-['Inter'] leading-snug break-words ${
                isCompact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
              }`}
            >
              {cell.value}
            </p>
          </div>
        ))}
      </div>
    </>
  )

  if (onPress) {
    return (
      <button type="button" className={shellClass} onClick={onPress}>
        {inner}
      </button>
    )
  }

  if (onCardClick) {
    return (
      <button
        type="button"
        className={shellClass}
        onClick={onCardClick}
        aria-expanded={Boolean(isCardExpanded)}
      >
        {inner}
      </button>
    )
  }

  return <div className={shellClass}>{inner}</div>
}
