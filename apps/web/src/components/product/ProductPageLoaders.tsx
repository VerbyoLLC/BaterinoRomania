import { useEffect, useRef, useState } from 'react'
import {
  INDUSTRIAL_BREADCRUMB_NAV_CLASS,
  INDUSTRIAL_PRODUCT_ARTICLE_CLASS,
} from '../../lib/industrialProductPageLayout'

/**
 * Loading UIs for product detail: industrial (carousel + centered hero) vs residential (gallery + specs column).
 * Keep these visually distinct — do not reuse residential placeholders for industrial routes.
 */

/** Main slide image for industrial carousel — Baterino logo while loading (same idea as catalog card skeletons). */
export function IndustrialCarouselSlideImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  useEffect(() => {
    setLoaded(false)
    const check = () => {
      if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) setLoaded(true)
    }
    check()
    const t = window.setTimeout(check, 50)
    return () => window.clearTimeout(t)
  }, [src])
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
          <img
            src="/images/shared/baterino-logo-black.svg"
            alt=""
            className="h-14 w-28 object-contain opacity-30 animate-pulse sm:h-16 sm:w-32"
            aria-hidden
          />
        </div>
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`relative h-full w-full object-cover transition-opacity duration-300 sm:h-auto sm:w-auto sm:max-h-full sm:max-w-full sm:object-contain ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
    </div>
  )
}

/** Single placeholder matching industrial model configuration cards (configurații disponibile). */
export function IndustrialModelConfigurationCardSkeleton() {
  return (
    <div className="flex min-h-[200px] min-w-0 w-full flex-col rounded-[10px] border border-neutral-200 bg-white px-4 py-4 shadow-sm">
      <div className="rounded-lg border border-slate-200/80 bg-gradient-to-b from-slate-50 to-white px-3 py-3 sm:px-3.5 sm:py-3.5">
        <div className="h-2.5 w-28 rounded bg-neutral-200 sm:h-3 sm:w-32" />
        <div className="mt-2 h-7 w-[70%] max-w-[160px] rounded bg-neutral-200 sm:mt-2.5 sm:h-8" />
      </div>
      <div className="mt-4 grid min-w-0 w-full grid-cols-2 gap-x-3 gap-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="min-w-0 space-y-2">
            <div className="h-3 w-20 rounded bg-neutral-200 sm:w-24" />
            <div className="h-3.5 w-full rounded bg-neutral-200 sm:h-4" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Row of model boxes + nav placeholders — matches loaded industrial product layout. */
export function IndustrialModelConfigurationsRowSkeleton() {
  return (
    <div className="mx-auto mb-10 w-full min-w-0 max-w-[1200px] sm:mb-12">
      <div className="mx-auto mb-3 h-3 w-44 rounded bg-neutral-200 sm:h-3.5 sm:w-52" />
      <div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row lg:flex-nowrap lg:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="min-w-0 w-full lg:flex-1 lg:basis-0">
            <IndustrialModelConfigurationCardSkeleton />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end gap-1.5">
        <div className="h-10 w-10 shrink-0 rounded-full bg-neutral-200" />
        <div className="h-10 w-10 shrink-0 rounded-full bg-neutral-200" />
      </div>
    </div>
  )
}

/** Industrial CMS / lithtech-style layout — wide carousel, overview + contact card, tabbed grid */
export function IndustrialProductPageSkeleton() {
  return (
    <div className={`${INDUSTRIAL_PRODUCT_ARTICLE_CLASS} animate-pulse`}>
      <nav className={INDUSTRIAL_BREADCRUMB_NAV_CLASS}>
        <div className="h-4 w-14 rounded bg-neutral-200" />
        <span className="text-neutral-300">/</span>
        <div className="h-4 w-20 rounded bg-neutral-200" />
        <span className="text-neutral-300">/</span>
        <div className="h-4 w-40 max-w-[45%] rounded bg-neutral-200" />
      </nav>
      <header className="mb-8 text-center sm:mb-10">
        <div className="mx-auto mb-3 h-4 w-48 max-w-[90%] rounded bg-neutral-200 sm:mb-4" />
        <div className="mx-auto mb-2 h-9 w-full max-w-xl rounded-lg bg-neutral-200 sm:h-11" />
        <div className="mx-auto mt-4 h-5 w-2/3 max-w-lg rounded bg-neutral-200" />
      </header>
      <div className="mb-4 flex w-[calc(100%+2.5rem)] max-w-none flex-col -mx-5 sm:mx-auto sm:mb-5 sm:w-full sm:max-w-[1200px]">
        <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden border-y border-neutral-200 bg-neutral-100 sm:aspect-[1200/520] sm:rounded-[10px] sm:border sm:border-neutral-200">
          <img
            src="/images/shared/baterino-logo-black.svg"
            alt=""
            className="h-16 w-32 max-w-[45%] object-contain opacity-[0.14] sm:h-20 sm:w-40"
            aria-hidden
          />
        </div>
        <div className="mt-3 flex justify-center gap-2 sm:hidden" aria-hidden>
          <div className="h-2 w-8 rounded-full bg-neutral-300" />
          <div className="h-2 w-2 rounded-full bg-neutral-200" />
          <div className="h-2 w-2 rounded-full bg-neutral-200" />
        </div>
      </div>
      <IndustrialModelConfigurationsRowSkeleton />
      <section className="border-t border-gray-100 pt-10 sm:pt-12">
        <div className="mb-6 h-8 w-40 rounded bg-neutral-200 sm:mb-8" />
        <div className="mb-10 grid grid-cols-1 items-start gap-8 lg:mb-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="h-4 w-full rounded bg-neutral-200" />
            <div className="h-4 w-full rounded bg-neutral-200" />
            <div className="h-4 max-w-[83%] rounded bg-neutral-200" />
          </div>
          <div className="h-48 rounded-[10px] bg-neutral-200 lg:h-56" />
        </div>
      </section>
      <section className="mt-12 border-t border-gray-100 pt-10 sm:mt-16 sm:pt-12">
        <div className="mb-6 flex flex-wrap gap-2 border-b border-neutral-200 pb-px">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-28 rounded-t-lg bg-neutral-200 sm:w-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 rounded-[10px] bg-neutral-200" />
          ))}
        </div>
      </section>
    </div>
  )
}

/** Classic residential product — left column copy/specs, right gallery + thumbnails */
export function ResidentialProductPageSkeleton() {
  return (
    <div className="max-w-content mx-auto px-5 lg:px-3 pt-6 pb-24">
      <nav className="mb-8 flex animate-pulse items-center gap-2 text-sm text-gray-400">
        <div className="h-4 w-16 rounded bg-neutral-200" />
        <span>/</span>
        <div className="h-4 w-20 rounded bg-neutral-200" />
        <span>/</span>
        <div className="h-4 w-24 rounded bg-neutral-200" />
      </nav>
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12">
        <div className="flex flex-col gap-5 lg:col-span-5">
          <div className="h-8 w-3/4 animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
          <div className="space-y-3 border-t border-zinc-100 pt-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-2">
                <div className="h-4 w-32 animate-pulse rounded bg-neutral-200" />
                <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
              </div>
            ))}
          </div>
          <div className="h-12 w-48 animate-pulse rounded bg-neutral-200" />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-6 lg:col-start-7">
          <div className="relative flex h-[320px] items-center justify-center overflow-hidden rounded-[10px] bg-neutral-100 lg:h-[460px]">
            <img
              src="/images/shared/baterino-logo-black.svg"
              alt=""
              className="h-20 w-40 max-w-[55%] animate-pulse object-contain opacity-30"
              aria-hidden
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-[10px] bg-neutral-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
