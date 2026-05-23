import { useCallback, useEffect, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { useToast } from '../../contexts/ToastContext'
import {
  dateLocaleForLang,
  getSalesAgentLeadNewTranslations,
  LEAD_STATUS_SELECT_VALUES,
  leadSourceLabel,
  leadStatusLabel,
  leadStatusSelectValue,
  type LeadStatusSelectValue,
  type SalesAgentLeadsTranslations,
} from '../../i18n/sales-agent'
import type { LangCode } from '../../i18n/menu'
import {
  getAdminSalesLeads,
  getSalesAgentLeads,
  getSalesLeadActivities,
  postSalesLeadComment,
  markSalesLeadViewed,
  markSalesLeadCommentsSeen,
  patchSalesLeadStatus,
  getAuthUserId,
  type SalesLeadActivity,
  type SalesLeadRow,
  type SalesLeadsAudience,
} from '../../lib/api'
import { LeadsTableSkeleton } from '../../pages/sales-agent/SalesAgentSkeletons'

function formatDateTime(iso: string, locale: string, emptyValue: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return emptyValue
  return d.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusSelectClass(status: SalesLeadRow['status']): string {
  switch (status) {
    case 'contactat':
      return 'bg-sky-50 text-sky-900 border-sky-200'
    case 'dead':
      return 'bg-slate-100 text-slate-700 border-slate-300'
    case 'oferta':
      return 'bg-violet-50 text-violet-900 border-violet-200'
    case 'inchis':
      return 'bg-slate-100 text-slate-700 border-slate-300'
    default:
      return 'bg-amber-50 text-amber-900 border-amber-200'
  }
}

function UnreadDot({ label }: { label: string }) {
  return (
    <span
      className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#1e46b4]"
      title={label}
      aria-label={label}
    />
  )
}

type LeadStatusSelectProps = {
  row: SalesLeadRow
  tr: SalesAgentLeadsTranslations
  audience: SalesLeadsAudience
  onUpdated: (lead: SalesLeadRow) => void
  onError: (message: string) => void
}

function LeadStatusSelect({ row, tr, audience, onUpdated, onError }: LeadStatusSelectProps) {
  const [saving, setSaving] = useState(false)
  const current = leadStatusSelectValue(row.status)
  const options: Array<{ value: SalesLeadRow['status']; label: string }> = [
    ...LEAD_STATUS_SELECT_VALUES.map((value) => ({
      value,
      label: leadStatusLabel(tr, value),
    })),
  ]
  if (!LEAD_STATUS_SELECT_VALUES.includes(current as LeadStatusSelectValue)) {
    options.push({ value: row.status, label: leadStatusLabel(tr, row.status) })
  }

  async function handleChange(nextStatus: SalesLeadRow['status']) {
    if (nextStatus === row.status || saving) return
    setSaving(true)
    try {
      const updated = await patchSalesLeadStatus(row.id, nextStatus, audience)
      onUpdated(updated)
    } catch (err) {
      onError(err instanceof Error ? err.message : tr.statusUpdateError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <select
      value={row.status}
      disabled={saving}
      aria-label={tr.colStatus}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => void handleChange(e.target.value as SalesLeadRow['status'])}
      className={`max-w-full rounded-lg border px-2 py-1.5 text-xs font-semibold font-['Inter'] focus:border-[#1e46b4] focus:outline-none focus:ring-2 focus:ring-[#1e46b4]/20 disabled:opacity-60 ${statusSelectClass(row.status)}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

function createdByLabel(row: SalesLeadRow, emptyValue: string): string {
  const name = row.createdByName?.trim()
  if (name) return name
  const email = row.createdByEmail?.trim()
  if (email) return email
  return emptyValue
}

function activityAuthorLabel(activity: SalesLeadActivity, emptyValue: string): string {
  const name = activity.userName?.trim()
  if (name) return name
  const email = activity.userEmail?.trim()
  if (email) return email
  return emptyValue
}

function isOwnComment(activity: SalesLeadActivity, currentUserId: string | null): boolean {
  return Boolean(currentUserId && activity.userId === currentUserId)
}

function commentAuthorClass(activity: SalesLeadActivity, currentUserId: string | null): string {
  return isOwnComment(activity, currentUserId)
    ? "text-sm font-semibold text-black font-['Inter']"
    : "text-sm font-semibold text-[#1e46b4] font-['Inter']"
}

function displayValue(value: string | null | undefined, empty: string): string {
  const v = value?.trim()
  return v || empty
}

function DetailField({ label, value, empty }: { label: string; value: string; empty: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500 font-['Inter']">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-900 break-words font-['Inter']">{displayValue(value, empty)}</dd>
    </div>
  )
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 font-['Inter']">{title}</h3>
      <dl className="space-y-3">{children}</dl>
    </section>
  )
}

type LeadInfoPanelProps = {
  lead: SalesLeadRow
  locale: string
  tr: SalesAgentLeadsTranslations
  langCode: LangCode
  onClose: () => void
  onOpenComments: () => void
}

function LeadInfoPanel({ lead, locale, tr, langCode, onClose, onOpenComments }: LeadInfoPanelProps) {
  const trNew = getSalesAgentLeadNewTranslations(langCode)

  return (
    <div
      className="fixed inset-0 z-[120] flex justify-end bg-slate-900/40"
      onClick={onClose}
      role="presentation"
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={tr.detailPanelTitle}
        className="flex h-full w-full max-w-md flex-col bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold font-['Inter'] text-slate-900">{tr.detailPanelTitle}</h2>
            <p className="mt-1 truncate text-sm font-medium text-slate-700 font-['Inter']">{lead.name}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusSelectClass(lead.status)}`}
              >
                {leadStatusLabel(tr, lead.status)}
              </span>
              <time className="text-xs text-slate-500 font-['Inter'] tabular-nums">
                {formatDateTime(lead.createdAt, locale, tr.emptyValue)}
              </time>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tr.closePanel}
            className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <DetailSection title={tr.detailSectionQualification}>
            <DetailField label={trNew.customerTypeLabel} value={lead.customerType} empty={tr.emptyValue} />
            <DetailField label={trNew.productLineLabel} value={lead.productLine} empty={tr.emptyValue} />
            <DetailField label={trNew.monthlyVolumeLabel} value={lead.monthlyVolume} empty={tr.emptyValue} />
          </DetailSection>

          <DetailSection title={tr.detailSectionContact}>
            <DetailField label={trNew.fullNameLabel} value={lead.name} empty={tr.emptyValue} />
            <DetailField label={trNew.emailLabel} value={lead.email} empty={tr.emptyValue} />
            <DetailField label={trNew.workEmailLabel} value={lead.workEmail} empty={tr.emptyValue} />
            <DetailField label={trNew.phoneLabel} value={lead.phone} empty={tr.emptyValue} />
            <DetailField label={trNew.whatsappLabel} value={lead.whatsapp} empty={tr.emptyValue} />
          </DetailSection>

          <DetailSection title={tr.detailSectionCompany}>
            <DetailField label={trNew.companyNameLabel} value={lead.companyName} empty={tr.emptyValue} />
            <DetailField label={trNew.jobTitleLabel} value={lead.jobTitle} empty={tr.emptyValue} />
            <DetailField label={trNew.countryLabel} value={lead.country} empty={tr.emptyValue} />
            <DetailField label={trNew.websiteLabel} value={lead.website} empty={tr.emptyValue} />
          </DetailSection>

          <DetailSection title={tr.detailSectionDetails}>
            <DetailField
              label={trNew.messageLabel}
              value={lead.message}
              empty={tr.emptyValue}
            />
            <DetailField
              label={trNew.sourceLabel}
              value={lead.source?.trim() ? leadSourceLabel(tr, lead.source) : ''}
              empty={tr.emptyValue}
            />
            <DetailField label={tr.colCreatedBy} value={createdByLabel(lead, tr.emptyValue)} empty={tr.emptyValue} />
            <DetailField
              label={tr.detailUpdatedAt}
              value={formatDateTime(lead.updatedAt, locale, tr.emptyValue)}
              empty={tr.emptyValue}
            />
          </DetailSection>
        </div>

        <div className="border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onOpenComments}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold font-['Inter'] text-slate-800 shadow-sm hover:bg-slate-50"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {tr.detailViewComments}
            {(lead.activityCount ?? 0) > 0 ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs tabular-nums text-slate-600">
                {lead.activityCount}
              </span>
            ) : null}
          </button>
        </div>
      </aside>
    </div>
  )
}

type LeadCommentsPanelProps = {
  lead: SalesLeadRow
  audience: SalesLeadsAudience
  locale: string
  tr: SalesAgentLeadsTranslations
  onClose: () => void
  onCommentAdded: () => void
  onLeadUpdated: (lead: SalesLeadRow) => void
}

function LeadCommentsPanel({ lead, audience, locale, tr, onClose, onCommentAdded, onLeadUpdated }: LeadCommentsPanelProps) {
  const toast = useToast()
  const [activities, setActivities] = useState<SalesLeadActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    markSalesLeadCommentsSeen(lead.id, audience)
      .then((updated) => {
        if (!cancelled) onLeadUpdated(updated)
      })
      .catch(() => {
        /* non-blocking */
      })
    return () => {
      cancelled = true
    }
  }, [audience, lead.id, onLeadUpdated])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getSalesLeadActivities(lead.id, audience)
      .then((rows) => {
        if (!cancelled) setActivities(rows)
      })
      .catch((e: unknown) => {
        if (!cancelled) toast.error(e instanceof Error ? e.message : tr.commentsLoadError)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [audience, lead.id, tr.commentsLoadError, toast])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = comment.trim()
    if (!text || submitting) return
    setSubmitting(true)
    try {
      const activity = await postSalesLeadComment(lead.id, text, audience)
      setActivities((prev) => [...prev, activity])
      setComment('')
      toast.success(tr.commentPostSuccess)
      onCommentAdded()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tr.commentPostError)
    } finally {
      setSubmitting(false)
    }
  }

  const commentActivities = activities.filter((a) => a.type === 'comment' && a.comment.trim())
  const currentUserId = getAuthUserId()

  return (
    <div
      className="fixed inset-0 z-[120] flex justify-end bg-slate-900/40"
      onClick={onClose}
      role="presentation"
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={tr.commentsPanelTitle}
        className="flex h-full w-full max-w-md flex-col bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold font-['Inter'] text-slate-900">{tr.commentsPanelTitle}</h2>
            <p className="mt-1 truncate text-sm font-medium text-slate-700 font-['Inter']">{lead.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tr.closePanel}
            className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="space-y-3" aria-busy="true" aria-label={tr.loading}>
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="mb-2 h-3 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : commentActivities.length === 0 ? (
            <p className="text-sm text-slate-500 font-['Inter']">{tr.commentsEmpty}</p>
          ) : (
            <ul className="space-y-3">
              {commentActivities.map((activity) => (
                <li key={activity.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                  <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                    <span className={commentAuthorClass(activity, currentUserId)}>
                      {activityAuthorLabel(activity, tr.emptyValue)}
                    </span>
                    <time
                      className="text-xs text-slate-500 font-['Inter'] tabular-nums"
                      dateTime={activity.createdAt}
                    >
                      {formatDateTime(activity.createdAt, locale, tr.emptyValue)}
                    </time>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-slate-700 font-['Inter']">{activity.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-slate-200 px-5 py-4">
          <label htmlFor="lead-comment" className="sr-only">
            {tr.commentPlaceholder}
          </label>
          <textarea
            id="lead-comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={tr.commentPlaceholder}
            className="mb-3 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-['Inter'] text-slate-900 placeholder:text-slate-400 focus:border-[#1e46b4] focus:outline-none focus:ring-2 focus:ring-[#1e46b4]/20"
          />
          <button
            type="submit"
            disabled={submitting || !comment.trim()}
            className="inline-flex w-full items-center justify-center rounded-lg bg-[#1e46b4] px-4 py-2.5 text-sm font-semibold font-['Inter'] text-white shadow-sm hover:bg-[#163899] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? tr.commentSubmitting : tr.commentSubmit}
          </button>
        </form>
      </aside>
    </div>
  )
}

export type SalesLeadsTableProps = {
  audience: SalesLeadsAudience
  tr: SalesAgentLeadsTranslations
  langCode: LangCode
}

export function SalesLeadsTable({ audience, tr, langCode }: SalesLeadsTableProps) {
  const toast = useToast()
  const locale = dateLocaleForLang(langCode)
  const [leads, setLeads] = useState<SalesLeadRow[]>([])
  const [loading, setLoading] = useState(true)
  const [infoLead, setInfoLead] = useState<SalesLeadRow | null>(null)
  const [commentsLead, setCommentsLead] = useState<SalesLeadRow | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const rows = audience === 'admin' ? await getAdminSalesLeads() : await getSalesAgentLeads()
        if (!cancelled) setLeads(rows)
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : tr.loadError)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [audience, tr.loadError, toast])

  const handleLeadUpdated = useCallback((updated: SalesLeadRow) => {
    setLeads((prev) => prev.map((row) => (row.id === updated.id ? updated : row)))
    setInfoLead((current) => (current?.id === updated.id ? updated : current))
    setCommentsLead((current) => (current?.id === updated.id ? updated : current))
  }, [])

  function bumpActivityCount(leadId: string) {
    setLeads((prev) =>
      prev.map((row) => (row.id === leadId ? { ...row, activityCount: (row.activityCount ?? 0) + 1 } : row)),
    )
    setCommentsLead((current) =>
      current?.id === leadId ? { ...current, activityCount: (current.activityCount ?? 0) + 1 } : current,
    )
    setInfoLead((current) =>
      current?.id === leadId ? { ...current, activityCount: (current.activityCount ?? 0) + 1 } : current,
    )
  }

  function openComments(lead: SalesLeadRow) {
    setInfoLead(null)
    setCommentsLead(lead)
  }

  function openInfoLead(lead: SalesLeadRow) {
    setInfoLead(lead)
    void markSalesLeadViewed(lead.id, audience)
      .then(handleLeadUpdated)
      .catch(() => {
        /* non-blocking */
      })
  }

  function handleRowKeyDown(e: KeyboardEvent<HTMLTableRowElement>, lead: SalesLeadRow) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openInfoLead(lead)
    }
  }

  const colSpan = 9

  const thClass = 'px-3 py-2.5 font-semibold sm:px-4 sm:py-3'
  const tdClass = 'px-3 py-2.5 sm:px-4 sm:py-3'

  return (
    <>
      <div className="w-full min-w-0 max-w-full">
        <section className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
          <div className="w-full max-w-full overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[68rem] text-left text-sm font-['Inter']">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/90 text-slate-600">
                  <th className={`${thClass} whitespace-nowrap`}>{tr.colDate}</th>
                  <th className={thClass}>{tr.colName}</th>
                  <th className={`${thClass} w-32`}>{tr.colCompany}</th>
                  <th className={`${thClass} whitespace-nowrap`}>{tr.colEmail}</th>
                  <th className={`${thClass} whitespace-nowrap`}>{tr.colPhone}</th>
                  <th className={`${thClass} w-24`}>{tr.colSource}</th>
                  <th className={`${thClass} whitespace-nowrap w-36`}>{tr.colCreatedBy}</th>
                  <th className={`${thClass} whitespace-nowrap w-24`}>{tr.colStatus}</th>
                  <th className={`${thClass} whitespace-nowrap w-20 text-center`}>
                    <span className="sr-only">{tr.colComments}</span>
                    <svg className="mx-auto h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </th>
                </tr>
              </thead>
              <tbody aria-busy={loading} aria-label={loading ? tr.loading : undefined}>
                {loading ? (
                  <LeadsTableSkeleton />
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={colSpan} className="px-4 py-16 text-center text-slate-500">
                      {tr.emptyState}
                    </td>
                  </tr>
                ) : (
                  leads.map((row) => (
                    <tr
                      key={row.id}
                      tabIndex={0}
                      role="button"
                      aria-label={row.name}
                      onClick={() => openInfoLead(row)}
                      onKeyDown={(e) => handleRowKeyDown(e, row)}
                      className="border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50/60 focus-visible:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1e46b4]/30"
                    >
                      <td className={`${tdClass} text-slate-700 whitespace-nowrap`}>
                        {formatDateTime(row.createdAt, locale, tr.emptyValue)}
                      </td>
                      <td className={`${tdClass} text-slate-900 font-medium max-w-[140px]`}>
                        <span className="inline-flex min-w-0 items-center gap-2">
                          {row.isNew ? <UnreadDot label={tr.unreadLead} /> : null}
                          <span className="truncate">{row.name}</span>
                        </span>
                      </td>
                      <td className={`${tdClass} text-slate-700 max-w-[128px] truncate`}>
                        {row.companyName?.trim() || tr.emptyValue}
                      </td>
                      <td className={`${tdClass} text-slate-700 max-w-[180px] truncate`}>
                        {row.email?.trim() ? (
                          <a
                            href={`mailto:${row.email.trim()}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#1e46b4] hover:text-[#163899] hover:underline"
                          >
                            {row.email.trim()}
                          </a>
                        ) : (
                          tr.emptyValue
                        )}
                      </td>
                      <td className={`${tdClass} text-slate-700 whitespace-nowrap tabular-nums`}>
                        {row.phone?.trim() ? (
                          <a
                            href={`tel:${row.phone.trim().replace(/\s/g, '')}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#1e46b4] hover:text-[#163899] hover:underline"
                          >
                            {row.phone.trim()}
                          </a>
                        ) : (
                          tr.emptyValue
                        )}
                      </td>
                      <td className={`${tdClass} text-slate-700`}>
                        {row.source?.trim() ? leadSourceLabel(tr, row.source) : tr.emptyValue}
                      </td>
                      <td
                        className={`${tdClass} text-slate-700 max-w-[144px] truncate`}
                        title={createdByLabel(row, tr.emptyValue)}
                      >
                        {createdByLabel(row, tr.emptyValue)}
                      </td>
                      <td className={`${tdClass} whitespace-nowrap`} onClick={(e) => e.stopPropagation()}>
                        <LeadStatusSelect
                          row={row}
                          tr={tr}
                          audience={audience}
                          onUpdated={handleLeadUpdated}
                          onError={(message) => toast.error(message)}
                        />
                      </td>
                      <td className={`${tdClass} whitespace-nowrap text-center`}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            openComments(row)
                          }}
                          aria-label={tr.colComments}
                          className={`inline-flex items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 ${
                            row.hasUnreadComments
                              ? 'border-[#1e46b4] ring-2 ring-[#1e46b4]/30'
                              : 'border-slate-200'
                          }`}
                        >
                          <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.8}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          {(row.activityCount ?? 0) > 0 ? (
                            <span className="tabular-nums">{row.activityCount}</span>
                          ) : null}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {infoLead ? (
        <LeadInfoPanel
          lead={infoLead}
          locale={locale}
          tr={tr}
          langCode={langCode}
          onClose={() => setInfoLead(null)}
          onOpenComments={() => openComments(infoLead)}
        />
      ) : null}

      {commentsLead ? (
        <LeadCommentsPanel
          lead={commentsLead}
          audience={audience}
          locale={locale}
          tr={tr}
          onClose={() => setCommentsLead(null)}
          onCommentAdded={() => bumpActivityCount(commentsLead.id)}
          onLeadUpdated={handleLeadUpdated}
        />
      ) : null}
    </>
  )
}
