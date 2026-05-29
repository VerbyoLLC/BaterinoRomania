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
    <section className="my-12 w-full lg:my-16" aria-label={tr.capacitySectionTitle}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {COUNTERS.map(({ mw, titleKey, subtitleKey }, index) => (
          <div
            key={titleKey}
            className={`flex flex-col items-center justify-center rounded-[10px] bg-neutral-100 px-3 py-4 text-center sm:px-4 sm:py-5 ${
              index === 0 ? 'col-span-2 sm:col-span-1' : ''
            }`}
          >
            <p className="text-black font-extrabold font-['Inter'] tabular-nums leading-none">
              <span className="text-xl sm:text-2xl">{mw}</span>
              <span className="ml-0.5 text-xs font-bold text-gray-500 sm:text-sm">{tr.capacityMwUnit}</span>
            </p>
            <p className="mt-2 max-w-[8rem] text-[10px] font-semibold font-['Inter'] uppercase leading-tight tracking-wide text-black sm:mt-2.5 sm:max-w-[9rem] sm:text-xs">
              {tr[titleKey]}
            </p>
            {subtitleKey ? (
              <p className="mt-0.5 text-[9px] font-normal font-['Inter'] leading-tight text-gray-500 sm:text-[10px]">
                {tr[subtitleKey]}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}
