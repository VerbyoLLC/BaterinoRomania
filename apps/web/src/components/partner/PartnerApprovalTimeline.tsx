import { type ReactNode } from 'react'
import {
  Check,
  Percent,
  UserPlus,
  FileSignature,
  BadgeCheck,
  ListChecks,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** Step 2 — price and discount allocation (RFQ). */
export const PRICE_ALLOCATION_TIMELINE_INDEX = 1
/** Step 3 — contract signing. */
export const CONTRACT_SIGNING_TIMELINE_INDEX = 2

export type TimelineInteractiveStep = {
  stepIndex: number
  ariaLabel: string
  onClick: () => void
}

const APPROVAL_TIMELINE_STEP_ICONS: readonly LucideIcon[] = [
  UserPlus,
  Percent,
  FileSignature,
  BadgeCheck,
]

const TIMELINE_ICON_ACTIVE_CLS =
  'bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-[0_5px_12px_rgba(30,70,180,0.26)]'
const TIMELINE_ICON_COMPLETE_CLS =
  'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_5px_12px_rgba(15,157,111,0.3)]'
const TIMELINE_ICON_UPCOMING_CLS =
  'bg-slate-100 text-slate-400 shadow-[0_4px_14px_-8px_rgba(15,23,42,0.08)]'

export const PARTNER_APPROVAL_SECTION_BOX =
  'rounded-2xl border border-slate-200 bg-white p-4 sm:p-6'

const PARTNER_APPROVAL_SECTION_HEADING =
  'mb-4 flex flex-wrap items-center justify-between gap-2'

const PARTNER_APPROVAL_SECTION_TITLE =
  "m-0 flex min-w-0 flex-1 items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900 font-['Inter'] sm:gap-3 sm:text-2xl"

function PartnerApprovalSectionTitleIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-[0_5px_12px_rgba(30,70,180,0.26)] sm:h-11 sm:w-11"
      aria-hidden
    >
      <Icon className="h-5 w-5" strokeWidth={1.9} />
    </span>
  )
}

function TimelineStepMarker({
  index,
  isComplete,
  isCurrent,
  timelineComplete,
  timelineCurrent,
  timelineUpcoming,
  isInteractive = false,
  onClick,
  interactiveAriaLabel,
}: {
  index: number
  isComplete: boolean
  isCurrent: boolean
  timelineComplete: string
  timelineCurrent: string
  timelineUpcoming: string
  isInteractive?: boolean
  onClick?: () => void
  interactiveAriaLabel?: string
}) {
  const StepIcon = APPROVAL_TIMELINE_STEP_ICONS[index] ?? BadgeCheck
  const shellCls = isComplete
    ? isInteractive
      ? `${TIMELINE_ICON_COMPLETE_CLS} ring-2 ring-emerald-300/50 ring-offset-2 ring-offset-white`
      : TIMELINE_ICON_COMPLETE_CLS
    : isCurrent
      ? `${TIMELINE_ICON_ACTIVE_CLS} ring-2 ring-indigo-400/35 ring-offset-2 ring-offset-white`
      : isInteractive
        ? `${TIMELINE_ICON_UPCOMING_CLS} ring-2 ring-indigo-200 ring-offset-2 ring-offset-white`
        : TIMELINE_ICON_UPCOMING_CLS
  const interactiveCls = isInteractive
    ? 'cursor-pointer transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'
    : ''

  const inner = (
    <>
      {isComplete ? (
        <Check className="h-[18px] w-[18px]" strokeWidth={2.5} aria-hidden />
      ) : (
        <StepIcon className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden />
      )}
      <span className="sr-only">{isComplete ? timelineComplete : isCurrent ? timelineCurrent : timelineUpcoming}</span>
    </>
  )

  if (isInteractive && onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={interactiveAriaLabel}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${shellCls} ${interactiveCls}`}
      >
        {inner}
      </button>
    )
  }

  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${shellCls}`}>
      {inner}
    </div>
  )
}

export function PartnerApprovalTimelineSkeleton({ sectionTitle }: { sectionTitle: string }) {
  return (
    <div
      className={`${PARTNER_APPROVAL_SECTION_BOX} mb-6`}
      aria-busy="true"
      aria-labelledby="partner-approval-timeline-skeleton-heading"
    >
      <div className={PARTNER_APPROVAL_SECTION_HEADING}>
        <h2 id="partner-approval-timeline-skeleton-heading" className={PARTNER_APPROVAL_SECTION_TITLE}>
          <PartnerApprovalSectionTitleIcon icon={ListChecks} />
          <span className="min-w-0">{sectionTitle}</span>
        </h2>
      </div>
      <div className="pointer-events-none mb-5 h-1 w-full rounded-full bg-slate-100 sm:mb-6" />
      <div className="hidden animate-pulse sm:flex sm:w-full sm:items-start">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex min-w-0 flex-1 items-start last:flex-[0_0_auto]">
            <div className="flex min-w-0 flex-1 flex-col items-center">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100" />
              <div className="mt-3 h-3 w-full max-w-[5.5rem] rounded bg-slate-100" />
            </div>
            {i < 4 ? <div className="mx-1.5 mt-[22px] h-[3px] min-w-[0.5rem] flex-1 rounded-full bg-slate-100" /> : null}
          </div>
        ))}
      </div>
      <div className="animate-pulse space-y-0 sm:hidden">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100" />
              {i < 4 ? <div className="my-1.5 min-h-[1.25rem] w-[3px] flex-1 rounded-full bg-slate-100" /> : null}
            </div>
            <div className="flex-1 pb-5 pt-2">
              <div className="h-4 w-[85%] max-w-[14rem] rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PartnerApprovalTimeline({
  steps,
  currentStepIndex,
  sectionTitle,
  ariaLabel,
  timelineComplete,
  timelineCurrent,
  timelineUpcoming,
  interactiveSteps,
  footer,
  className = 'mb-6',
}: {
  steps: readonly string[]
  currentStepIndex: number
  sectionTitle: string
  ariaLabel: string
  timelineComplete: string
  timelineCurrent: string
  timelineUpcoming: string
  interactiveSteps?: TimelineInteractiveStep[]
  footer?: ReactNode
  className?: string
}) {
  const getInteractiveStep = (stepIndex: number) =>
    interactiveSteps?.find((step) => step.stepIndex === stepIndex)

  const progressPct = Math.min(100, Math.max(0, ((currentStepIndex + 0.5) / steps.length) * 100))

  return (
    <section
      className={`${PARTNER_APPROVAL_SECTION_BOX} ${className}`.trim()}
      aria-labelledby="partner-approval-timeline-heading"
    >
      <div className={PARTNER_APPROVAL_SECTION_HEADING}>
        <h2 id="partner-approval-timeline-heading" className={PARTNER_APPROVAL_SECTION_TITLE}>
          <PartnerApprovalSectionTitleIcon icon={ListChecks} />
          <span className="min-w-0">{sectionTitle}</span>
        </h2>
      </div>
      <div className="pointer-events-none mb-5 h-1 w-full rounded-full bg-slate-100 sm:mb-6" aria-hidden>
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 transition-[width] duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <ol className="hidden sm:flex sm:items-start sm:w-full" aria-label={ariaLabel}>
        {steps.map((label, i) => {
          const isComplete = i < currentStepIndex
          const isCurrent = i === currentStepIndex
          const interactive = getInteractiveStep(i)
          return (
            <li key={label} className="flex flex-1 min-w-0 items-start last:flex-[0_0_auto]">
              <div className="flex flex-1 min-w-0 flex-col items-center text-center">
                <TimelineStepMarker
                  index={i}
                  isComplete={isComplete}
                  isCurrent={isCurrent}
                  timelineComplete={timelineComplete}
                  timelineCurrent={timelineCurrent}
                  timelineUpcoming={timelineUpcoming}
                  isInteractive={interactive != null}
                  onClick={interactive?.onClick}
                  interactiveAriaLabel={interactive?.ariaLabel}
                />
                {interactive ? (
                  <button
                    type="button"
                    onClick={interactive.onClick}
                    className={`mt-3 w-full border-0 bg-transparent p-0 text-xs font-['Inter'] leading-tight sm:text-[13px] px-0.5 cursor-pointer transition hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 rounded-md ${
                      isCurrent
                        ? 'font-semibold text-indigo-950'
                        : isComplete
                          ? 'font-medium text-slate-700'
                          : 'font-medium text-slate-500'
                    }`}
                  >
                    {label}
                  </button>
                ) : (
                  <span
                    className={`mt-3 text-xs font-['Inter'] leading-tight sm:text-[13px] px-0.5 ${
                      isCurrent
                        ? 'font-semibold text-indigo-950'
                        : isComplete
                          ? 'font-medium text-slate-700'
                          : 'font-medium text-slate-500'
                    }`}
                  >
                    {label}
                  </span>
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mx-1.5 mt-[22px] h-[3px] min-w-[0.5rem] flex-1 rounded-full ${
                    i < currentStepIndex ? 'bg-indigo-400' : 'bg-slate-200'
                  }`}
                  aria-hidden
                />
              )}
            </li>
          )
        })}
      </ol>

      <ol className="sm:hidden space-y-0 font-['Inter']" aria-label={ariaLabel}>
        {steps.map((label, i) => {
          const isComplete = i < currentStepIndex
          const isCurrent = i === currentStepIndex
          const isLast = i === steps.length - 1
          const interactive = getInteractiveStep(i)
          return (
            <li key={label} className="flex gap-3.5">
              <div className="flex flex-col items-center">
                <TimelineStepMarker
                  index={i}
                  isComplete={isComplete}
                  isCurrent={isCurrent}
                  timelineComplete={timelineComplete}
                  timelineCurrent={timelineCurrent}
                  timelineUpcoming={timelineUpcoming}
                  isInteractive={interactive != null}
                  onClick={interactive?.onClick}
                  interactiveAriaLabel={interactive?.ariaLabel}
                />
                {!isLast && (
                  <div
                    className={`w-[3px] flex-1 min-h-[1.25rem] my-1.5 rounded-full ${
                      i < currentStepIndex ? 'bg-indigo-400' : 'bg-slate-200'
                    }`}
                    aria-hidden
                  />
                )}
              </div>
              <div
                className={`pb-5 pt-2 text-sm leading-snug ${
                  isCurrent ? 'font-semibold text-indigo-950' : isComplete ? 'font-medium text-slate-700' : 'font-medium text-slate-500'
                }`}
              >
                {interactive ? (
                  <button
                    type="button"
                    onClick={interactive.onClick}
                    className={`m-0 w-full border-0 bg-transparent p-0 text-left text-sm leading-snug transition hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 rounded-md ${
                      isCurrent ? 'font-semibold text-indigo-950' : isComplete ? 'font-medium text-slate-700' : 'font-medium text-slate-500'
                    }`}
                  >
                    {label}
                  </button>
                ) : (
                  label
                )}
              </div>
            </li>
          )
        })}
      </ol>
      {footer}
    </section>
  )
}
