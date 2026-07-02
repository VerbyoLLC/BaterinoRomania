import { Link } from 'react-router-dom'
import { Images, MapPin } from 'lucide-react'
import type { MouseEventHandler, ReactNode } from 'react'

export type CaseStudyCardSpec = {
  label: string
  value: string
  /** Highlight value (e.g. capacity) in brand blue */
  highlight?: boolean
}

export type CaseStudyCardProps = {
  category: string
  title: string
  location: string
  image: string
  imageAlt: string
  specs: CaseStudyCardSpec[]
  tags: string[]
  imageCount?: number
  galleryLabel?: string
  to?: string
  onClick?: MouseEventHandler<HTMLElement>
}

function CardShell({
  to,
  onClick,
  children,
}: {
  to?: string
  onClick?: MouseEventHandler<HTMLElement>
  children: ReactNode
}) {
  const className =
    'group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow duration-300 hover:shadow-md'

  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    )
  }

  if (onClick) {
    return (
      <article className={`${className} cursor-pointer`} onClick={onClick}>
        {children}
      </article>
    )
  }

  return <article className={className}>{children}</article>
}

export default function CaseStudyCard({
  category,
  title,
  location,
  image,
  imageAlt,
  specs,
  tags,
  imageCount,
  galleryLabel,
  to,
  onClick,
}: CaseStudyCardProps) {
  const gridSpecs = specs.slice(0, 4)

  return (
    <CardShell to={to} onClick={onClick}>
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
        <img
          src={image}
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
        {imageCount != null && imageCount > 0 ? (
          <div
            className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-lg bg-black/55 px-2.5 py-1.5 text-white backdrop-blur-sm"
            aria-label={galleryLabel}
          >
            <Images className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="text-xs font-semibold tabular-nums font-['Inter']">{imageCount}</span>
          </div>
        ) : null}
        <img
          src="/images/shared/lithtech-logo-white 3.webp"
          alt=""
          aria-hidden
          className="absolute bottom-3 right-3 z-10 h-5 w-auto max-w-[88px] object-contain opacity-95"
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <span className="inline-flex w-fit rounded-md bg-sky-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-sky-900 font-['Inter']">
          {category}
        </span>

        <div className="flex flex-col gap-2">
          <h2 className="m-0 text-lg font-bold leading-snug text-slate-900 font-['Inter'] sm:text-xl">
            {title}
          </h2>
          <p className="m-0 inline-flex items-center gap-1.5 text-sm text-neutral-500 font-['Inter']">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            <span>{location}</span>
          </p>
        </div>

        {gridSpecs.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5">
            {gridSpecs.map((spec) => (
              <div
                key={`${spec.label}-${spec.value}`}
                className="min-w-0 rounded-lg bg-neutral-100 px-3 py-2.5"
              >
                <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-400 font-['Inter'] sm:text-[11px]">
                  {spec.label}
                </p>
                <p
                  className={`m-0 mt-1 text-sm font-bold leading-tight font-['Inter'] sm:text-[15px] ${
                    spec.highlight ? 'text-sky-900' : 'text-slate-900'
                  }`}
                >
                  {spec.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {tags.length > 0 ? (
          <ul className="m-0 mt-auto flex list-none flex-wrap gap-2 p-0">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600 font-['Inter']"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </CardShell>
  )
}

export function CaseStudyCardSkeleton() {
  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white animate-pulse"
      aria-hidden
    >
      <div className="relative aspect-[16/10] w-full bg-neutral-200" />

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="h-6 w-24 rounded-md bg-neutral-200" />

        <div className="flex flex-col gap-2">
          <div className="h-6 w-full max-w-[92%] rounded bg-neutral-200" />
          <div className="h-6 w-3/4 max-w-[75%] rounded bg-neutral-200" />
          <div className="mt-0.5 flex items-center gap-1.5">
            <div className="h-4 w-4 shrink-0 rounded-full bg-neutral-200" />
            <div className="h-4 w-32 rounded bg-neutral-200" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-neutral-100 px-3 py-2.5">
              <div className="h-3 w-16 rounded bg-neutral-200" />
              <div className="mt-2 h-4 w-20 rounded bg-neutral-200" />
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          <div className="h-7 w-20 rounded-md border border-neutral-200 bg-neutral-100" />
          <div className="h-7 w-16 rounded-md border border-neutral-200 bg-neutral-100" />
          <div className="h-7 w-24 rounded-md border border-neutral-200 bg-neutral-100" />
        </div>
      </div>
    </article>
  )
}
