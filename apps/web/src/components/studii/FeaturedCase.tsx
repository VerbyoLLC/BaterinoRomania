import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { resolvePublicImageUrl } from '../../lib/productCaseStudies'
import type { CaseStudyModalItem } from './CaseStudyModal'

export type FeaturedCaseItem = CaseStudyModalItem & { slug?: string }

export function categoryLabel(value: string) {
  const lower = value.toLocaleLowerCase('ro-RO')
  return lower.charAt(0).toLocaleUpperCase('ro-RO') + lower.slice(1)
}

export default function FeaturedCase({
  item,
  viewLabel,
  onOpen,
  stacked = false,
  linkCta,
  showDetails = true,
  showAction = true,
}: {
  item: FeaturedCaseItem
  viewLabel: string
  onOpen: () => void
  stacked?: boolean
  /** Replaces the “view project” pill with a link, for example to all case studies. */
  linkCta?: { to: string; label: string }
  /** Spec rows under the description. Hidden on the homepage preview card. */
  showDetails?: boolean
  /** The view-project pill or link. Hidden when the action lives outside the card. */
  showAction?: boolean
}) {
  const highlight = item.specs.find((spec) => spec.highlight) ?? item.specs[0]
  const rest = item.specs.filter((spec) => spec !== highlight).slice(0, 3)

  const shellClass = `group grid w-full overflow-hidden rounded-[16px] bg-[#f3f3f3] text-left ${
    stacked ? '' : 'lg:grid-cols-[1.15fr_0.85fr]'
  }`

  const body = (
    <>
      <span
        className={`relative block overflow-hidden ${
          stacked ? 'aspect-[5/4] w-full' : 'min-h-72 sm:min-h-80 lg:min-h-[460px]'
        }`}
      >
        <img
          src={resolvePublicImageUrl(item.image)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </span>
      <span className={`flex flex-col justify-between gap-8 ${stacked ? 'p-5 sm:p-6' : 'p-6 sm:p-8 lg:p-10'}`}>
        <span>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500 font-['Inter']">
            {categoryLabel(item.category)}
          </span>
          <span className={`mt-3 block font-extrabold leading-tight text-black font-['Inter'] ${stacked ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'}`}>
            {item.title}
          </span>
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 font-['Inter']">
            <MapPin className="size-4 shrink-0" aria-hidden />
            {item.location}
          </span>
          {item.description ? (
            <span className="mt-4 block text-sm font-medium leading-6 text-neutral-600 font-['Inter'] line-clamp-3">
              {item.description}
            </span>
          ) : null}
        </span>
        {showDetails || showAction ? (
        <span>
          {showDetails && highlight ? (
            <span className="block border-t border-neutral-300 pt-5">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 font-['Inter']">
                {highlight.label}
              </span>
              <span className={`mt-1 block font-extrabold leading-none text-black font-['Inter'] ${stacked ? 'text-2xl' : 'text-3xl'}`}>
                {highlight.value}
              </span>
            </span>
          ) : null}
          {showDetails && rest.length > 0 ? (
            <span className="mt-4 grid grid-cols-3 gap-3">
              {rest.map((spec) => (
                <span key={`${spec.label}-${spec.value}`} className="min-w-0">
                  <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500 font-['Inter']">
                    {spec.label}
                  </span>
                  <span className="mt-1 block truncate text-sm font-bold text-black font-['Inter']">{spec.value}</span>
                </span>
              ))}
            </span>
          ) : null}
          {showAction && linkCta ? (
            <Link
              to={linkCta.to}
              onClick={(event) => event.stopPropagation()}
              className="mt-6 inline-flex h-12 w-fit items-center gap-2 rounded-[10px] bg-slate-900 px-7 text-sm font-semibold font-['Inter'] text-white transition-colors hover:bg-slate-800"
            >
              {linkCta.label}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          ) : showAction ? (
            <span className="mt-6 inline-flex h-10 items-center rounded-full border border-neutral-900 px-5 text-sm font-semibold text-neutral-900 font-['Inter'] transition-colors group-hover:bg-neutral-900 group-hover:text-white">
              {viewLabel}
            </span>
          ) : null}
        </span>
        ) : null}
      </span>
    </>
  )

  if (linkCta) {
    return (
      <div className={`${shellClass} cursor-pointer`} onClick={onOpen}>
        {body}
      </div>
    )
  }

  return (
    <button type="button" onClick={onOpen} className={shellClass}>
      {body}
    </button>
  )
}

export function FeaturedCaseSkeleton({ stacked = false }: { stacked?: boolean }) {
  return (
    <div
      className={`grid overflow-hidden rounded-[16px] bg-[#f3f3f3] ${stacked ? '' : 'lg:grid-cols-[1.15fr_0.85fr]'}`}
      aria-hidden
    >
      <div className={`animate-pulse bg-neutral-200 ${stacked ? 'aspect-[5/4] w-full' : 'min-h-72 sm:min-h-80 lg:min-h-[460px]'}`} />
      <div className={`flex flex-col gap-4 ${stacked ? 'p-5 sm:p-6' : 'p-6 sm:p-8 lg:p-10'}`}>
        <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />
        <div className="h-8 w-4/5 animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-40 animate-pulse rounded bg-neutral-200" />
        <div className="mt-6 h-3 w-20 animate-pulse rounded bg-neutral-200" />
        <div className="h-9 w-32 animate-pulse rounded bg-neutral-200" />
      </div>
    </div>
  )
}
