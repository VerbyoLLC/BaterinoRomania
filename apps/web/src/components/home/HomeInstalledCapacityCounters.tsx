import type { HomeTranslations } from '../../i18n/home'

const COUNTERS = [
  {
    mw: 20,
    titleKey: 'capacityCounter1Title' as const,
    subtitleKey: 'capacityCounter1Subtitle' as const,
  },
  {
    mw: 4,
    titleKey: 'capacityCounter2Title' as const,
    subtitleKey: null,
  },
  {
    mw: 8,
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
  /** White figures laid over a photo, instead of boxed cards. */
  onImage?: boolean
}

/** Installed capacity stats (MW) — five counters. */
export default function HomeInstalledCapacityCounters({ tr, onImage = false }: HomeInstalledCapacityCountersProps) {
  return (
    <div className={onImage ? 'w-full' : 'my-8 w-full lg:my-10'}>
      <div className={onImage ? 'flex flex-wrap items-start justify-center gap-x-6 gap-y-6 sm:gap-x-10' : 'grid grid-cols-2 items-stretch gap-3 sm:gap-4 lg:grid-cols-5'}>
        {COUNTERS.map(({ mw, titleKey, subtitleKey }, index) => {
          const isTotal = index === 0

          return (
            <div
              key={titleKey}
              className={
                onImage
                  ? 'flex w-[42%] flex-col items-center px-1 text-center text-white sm:w-[30%] lg:w-auto lg:min-w-[7.5rem] lg:flex-1'
                  : `flex h-full min-h-[7.5rem] flex-col items-center justify-center rounded-[10px] px-3 py-5 text-center sm:min-h-[8.25rem] sm:px-4 sm:py-6 ${
                      isTotal
                        ? 'col-span-2 bg-slate-900 text-white shadow-md lg:col-span-1'
                        : 'border border-neutral-200/90 bg-white shadow-sm'
                    }`
              }
            >
              <p
                className={`m-0 flex items-baseline justify-center gap-1 font-extrabold font-['Inter'] tabular-nums leading-none ${
                  onImage || isTotal ? 'text-white' : 'text-slate-900'
                }`}
              >
                <span className={onImage ? 'text-3xl sm:text-4xl lg:text-5xl' : 'text-3xl sm:text-4xl'}>{mw}</span>
                <span
                  className={`text-sm font-bold sm:text-base ${
                    onImage ? 'text-white/80' : isTotal ? 'text-white/70' : 'text-neutral-400'
                  }`}
                >
                  {tr.capacityMwUnit}
                </span>
              </p>
              <p
                className={`m-0 mt-2 max-w-[9.5rem] font-semibold font-['Inter'] leading-snug sm:mt-3 ${
                  onImage
                    ? 'text-xs text-white sm:text-sm'
                    : `text-[10px] uppercase tracking-[0.08em] sm:text-[11px] sm:tracking-wide ${isTotal ? 'text-white' : 'text-slate-800'}`
                }`}
              >
                {tr[titleKey]}
              </p>
              {subtitleKey ? (
                <p className={`m-0 mt-1 text-[11px] font-medium leading-tight sm:text-xs ${onImage || isTotal ? 'text-white/70' : 'text-neutral-500'}`}>
                  {tr[subtitleKey]}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
