import type { CSSProperties } from 'react'

function SkeletonBar({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} style={style} aria-hidden />
}

export function ProfileDropdownSkeleton({ ariaLabel }: { ariaLabel: string }) {
  const widths = ['72%', '58%', '85%', '64%', '48%', '55%']
  return (
    <div className="space-y-2.5 px-4 py-3" aria-busy="true" aria-label={ariaLabel}>
      {widths.map((width, i) => (
        <div key={i} className="flex gap-2">
          <SkeletonBar className="h-3.5 w-[5.5rem] shrink-0" />
          <SkeletonBar className="h-3.5 min-w-0 flex-1" style={{ maxWidth: width }} />
        </div>
      ))}
    </div>
  )
}

export function DashboardWelcomeSkeleton({ ariaLabel }: { ariaLabel: string }) {
  return (
    <span
      className="inline-block h-8 w-56 max-w-full animate-pulse rounded-lg bg-gray-200"
      aria-busy="true"
      aria-label={ariaLabel}
    />
  )
}

export function DashboardStatSkeleton({ ariaLabel }: { ariaLabel: string }) {
  return (
    <div
      className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-center"
      aria-busy="true"
      aria-label={ariaLabel}
    >
      <SkeletonBar className="mx-auto h-8 w-12" />
      <SkeletonBar className="mx-auto mt-2 h-3 w-20" />
    </div>
  )
}

export function LeadsTableRowSkeleton() {
  const tdClass = 'px-3 py-2.5 sm:px-4 sm:py-3'
  return (
    <tr className="border-b border-slate-100 last:border-b-0">
      <td className={tdClass}>
        <SkeletonBar className="h-4 w-28" />
      </td>
      <td className={tdClass}>
        <SkeletonBar className="h-4 w-32" />
      </td>
      <td className={tdClass}>
        <SkeletonBar className="h-4 w-24" />
      </td>
      <td className={tdClass}>
        <SkeletonBar className="h-4 w-36" />
      </td>
      <td className={tdClass}>
        <SkeletonBar className="h-4 w-24" />
      </td>
      <td className={tdClass}>
        <SkeletonBar className="h-4 w-20" />
      </td>
      <td className={tdClass}>
        <SkeletonBar className="h-4 w-24" />
      </td>
      <td className={tdClass}>
        <SkeletonBar className="h-6 w-16 rounded-full" />
      </td>
      <td className={`${tdClass} text-center`}>
        <SkeletonBar className="mx-auto h-8 w-12 rounded-lg" />
      </td>
    </tr>
  )
}

export function LeadsTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <LeadsTableRowSkeleton key={i} />
      ))}
    </>
  )
}
