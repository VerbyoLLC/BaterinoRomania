/** Placeholder matching compact `ReduceriProgramCard` (hideCta) in the programmes modal. */
export function ReduceriProgramCardSkeleton() {
  return (
    <div className="flex h-full flex-col" aria-hidden>
      <div className="flex flex-1 flex-col overflow-hidden rounded-[10px] bg-neutral-100">
        <div className="h-36 shrink-0 animate-pulse bg-neutral-200/90 sm:h-40" />
        <div className="flex flex-col px-3 pb-4 pt-3 sm:px-4">
          <div className="mb-2 h-5 w-4/5 max-w-[12rem] animate-pulse rounded-md bg-neutral-200/90 sm:mb-3 sm:h-6" />
          <div className="h-3 w-full animate-pulse rounded bg-neutral-200/80" />
          <div className="mt-2 h-3 w-full animate-pulse rounded bg-neutral-200/80" />
          <div className="mt-2 h-3 w-[85%] animate-pulse rounded bg-neutral-200/80" />
        </div>
      </div>
    </div>
  )
}
