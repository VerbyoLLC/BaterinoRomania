import type { HomeTranslations } from '../../i18n/home'

const COUNTERS = [
  {
    mw: 20,
    titleKey: 'capacityCounter1Title' as const,
    subtitleKey: 'capacityCounter1Subtitle' as const,
  },
  {
    mw: 8,
    titleKey: 'capacityCounter2Title' as const,
    subtitleKey: null,
  },
  {
    mw: 4,
    titleKey: 'capacityCounter3Title' as const,
    subtitleKey: null,
  },
  {
    mw: 2,
    titleKey: 'capacityCounter4Title' as const,
    subtitleKey: null,
  },
  {
    mw: 1,
    titleKey: 'capacityCounter5Title' as const,
    subtitleKey: null,
  },
] as const

type HomeInstalledCapacityCountersProps = {
  tr: HomeTranslations
}

/** Installed capacity stats (MW) — five boxed counters. */
export default function HomeInstalledCapacityCounters({ tr }: HomeInstalledCapacityCountersProps) {
  return (
    <section className="my-12 w-full lg:my-16" aria-labelledby="capacity-section-title">
      <header className="mx-auto mb-8 max-w-3xl text-center lg:mb-10">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 font-['Inter'] sm:text-xs">
          {tr.capacitySectionEyebrow}
        </p>
        <h2
          id="capacity-section-title"
          className="m-0 mt-2 text-2xl font-bold font-['Inter'] leading-9 text-black sm:text-3xl sm:leading-10"
        >
          {tr.capacitySectionTitle}
        </h2>
        <p className="m-0 mt-3 text-base font-medium font-['Inter'] leading-6 text-gray-600 sm:text-lg sm:leading-7">
          {tr.capacitySectionSubtitle}
        </p>
      </header>

      <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-4 lg:grid-cols-5">
        {COUNTERS.map(({ mw, titleKey, subtitleKey }, index) => {
          const isTotal = index === 0

          return (
            <div
              key={titleKey}
              className={`flex h-full min-h-[7.5rem] flex-col items-center justify-center rounded-[10px] px-3 py-5 text-center sm:min-h-[8.25rem] sm:px-4 sm:py-6 ${
                isTotal
                  ? 'col-span-2 bg-slate-900 text-white shadow-md lg:col-span-1'
                  : 'border border-neutral-200/90 bg-white shadow-sm'
              }`}
            >
              <p
                className={`m-0 flex items-baseline justify-center gap-1 font-extrabold font-['Inter'] tabular-nums leading-none ${
                  isTotal ? 'text-white' : 'text-slate-900'
                }`}
              >
                <span className="text-3xl sm:text-4xl">{mw}</span>
                <span
                  className={`text-sm font-bold sm:text-base ${
                    isTotal ? 'text-white/70' : 'text-neutral-400'
                  }`}
                >
                  {tr.capacityMwUnit}
                </span>
              </p>
              <p
                className={`m-0 mt-3 max-w-[9.5rem] text-[10px] font-semibold font-['Inter'] uppercase leading-snug tracking-[0.08em] sm:text-[11px] sm:tracking-wide ${
                  isTotal ? 'text-white' : 'text-slate-800'
                }`}
              >
                {tr[titleKey]}
              </p>
              <p
                className={`m-0 mt-1 min-h-[1.125rem] text-[10px] font-medium leading-tight sm:text-[11px] ${
                  isTotal ? 'text-white/65' : 'text-neutral-500'
                }`}
              >
                {subtitleKey ? tr[subtitleKey] : '\u00a0'}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
