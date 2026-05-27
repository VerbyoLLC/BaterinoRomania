import { Fragment } from 'react'
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

/** Installed capacity stats (MW) — compact single-row layout. */
export default function HomeInstalledCapacityCounters({ tr }: HomeInstalledCapacityCountersProps) {
  return (
    <section className="my-12 lg:my-16 w-full" aria-label={tr.capacitySectionTitle}>
      <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="mx-auto flex w-max max-w-full justify-center">
          {COUNTERS.map(({ mw, titleKey, subtitleKey }, index) => (
            <Fragment key={titleKey}>
              {index > 0 ? (
                <div className="mx-1 w-px shrink-0 self-center bg-zinc-200 h-8 sm:mx-1.5 sm:h-9" aria-hidden />
              ) : null}
              <div className="flex shrink-0 flex-col items-center px-2 py-2 text-center sm:px-2.5 sm:py-2.5">
                <p className="text-black font-extrabold font-['Inter'] tabular-nums leading-none">
                  <span className="text-lg sm:text-xl">{mw}</span>
                  <span className="ml-0.5 text-xs font-bold text-gray-500 sm:text-sm">{tr.capacityMwUnit}</span>
                </p>
                <p className="mt-1.5 max-w-[6.5rem] text-[9px] font-semibold font-['Inter'] uppercase leading-tight tracking-wide text-black sm:mt-2 sm:max-w-[7rem] sm:text-[10px]">
                  {tr[titleKey]}
                </p>
                {subtitleKey ? (
                  <p className="mt-0.5 max-w-[6.5rem] text-[8px] font-normal font-['Inter'] leading-tight text-gray-500 sm:text-[9px]">
                    {tr[subtitleKey]}
                  </p>
                ) : null}
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
