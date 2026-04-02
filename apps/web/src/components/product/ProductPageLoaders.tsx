import { useEffect, useRef, useState } from 'react'
import {
  INDUSTRIAL_BREADCRUMB_NAV_CLASS,
  INDUSTRIAL_PRODUCT_ARTICLE_CLASS,
} from '../../lib/industrialProductPageLayout'

/**
 * Loading UIs for product detail: industrial (carousel + centered hero) vs residential (gallery + specs column).
 * Keep these visually distinct — do not reuse residential placeholders for industrial routes.
 */

/** Main slide image for industrial carousel — neutral shimmer until load (not the residential Baterino logo). */
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
    <div className="relative flex max-h-full max-w-full items-center justify-center">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
          <div className="h-14 w-24 animate-pulse rounded-md bg-neutral-200/90 sm:h-16 sm:w-32" />
        </div>
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`relative max-h-full max-w-full object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
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
      <div className="relative mx-auto mb-12 aspect-[1200/520] w-full max-w-[1200px] overflow-hidden rounded-[10px] bg-neutral-200 sm:mb-14" />
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
          <div className="flex h-[320px] items-center justify-center rounded-[10px] bg-neutral-100 lg:h-[460px]">
            <div className="h-24 w-24 animate-pulse rounded-full bg-neutral-200/80" />
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
