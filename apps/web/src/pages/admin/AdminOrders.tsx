import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getAdminDeletedOrders,
  getAdminGuestResidentialOrders,
  getAdminPartnerRfqRequests,
  patchAdminOrderFulfillmentStatus,
  formatPartnerActivityTypeLabel,
  type AdminDeletedOrderRow,
  type AdminGuestResidentialOrderRow,
  type AdminPartnerRfqRequestRow,
} from '../../lib/api'

const FULFILLMENT_OPTIONS: { value: string; label: string }[] = [
  { value: 'de_platit', label: 'De plătit' },
  { value: 'preluata', label: 'Preluată' },
  { value: 'in_pregatire', label: 'În pregătire' },
  { value: 'in_curs_livrare', label: 'În curs de livrare' },
  { value: 'livrata', label: 'Livrată' },
  { value: 'anulata', label: 'Anulată' },
]

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPhoneDigits(digits: string): string {
  const d = String(digits || '').replace(/\D/g, '').slice(-9)
  if (d.length !== 9) return digits || '—'
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
}

function formatMoney(amount: string | null, currency: string): string {
  if (amount == null || amount === '') return '—'
  const n = Number(String(amount).replace(',', '.'))
  if (!Number.isFinite(n)) return String(amount)
  return `${n.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency || 'RON'}`
}

function orderSourceLabel(
  source: string,
  channel?: Pick<AdminGuestResidentialOrderRow, 'partnerChannelType' | 'activityTypes'>,
): { label: string; className: string } {
  const s = String(source || '').toLowerCase()
  if (s === 'client') return { label: 'Client', className: 'bg-emerald-100 text-emerald-900' }
  if (s === 'partner' || s === 'partener') {
    const sub =
      channel != null
        ? formatPartnerActivityTypeLabel({
            partnerChannelType: channel.partnerChannelType,
            activityTypes:
              channel.activityTypes != null && channel.activityTypes !== ''
                ? String(channel.activityTypes)
                : null,
          })
        : '—'
    const label = sub && sub !== '—' ? `Partener — ${sub}` : 'Partener'
    return { label, className: 'bg-sky-100 text-sky-900' }
  }
  if (s === 'partner_rfq') return { label: 'Cerere ofertă partener', className: 'bg-indigo-100 text-indigo-900' }
  return { label: 'Invitat', className: 'bg-slate-200 text-slate-800' }
}

function deletionReasonLabel(reason: string): string {
  const r = String(reason || '').toLowerCase()
  if (r === 'account_deleted') return 'Cont șters'
  if (r === 'orphaned_cleanup') return 'Curățare comenzi orfane'
  return reason || '—'
}

function hasInvoiceUrl(o: AdminGuestResidentialOrderRow): boolean {
  return Boolean(o.clientInvoiceUrl && String(o.clientInvoiceUrl).trim())
}

function hasProformaUrl(o: AdminGuestResidentialOrderRow): boolean {
  return Boolean(o.proformaUrl && String(o.proformaUrl).trim())
}

function normalizeStatus(o: AdminGuestResidentialOrderRow): string {
  const stRaw = String(o.fulfillmentStatus || 'de_platit')
  return FULFILLMENT_OPTIONS.some((x) => x.value === stRaw) ? stRaw : 'de_platit'
}

/** Etichetă în `<select>`: `de_platit` + proforma emisă → „Așteptare plată” (valoarea rămâne `de_platit`). */
function fulfillmentOptionLabel(o: AdminGuestResidentialOrderRow, optionValue: string): string {
  if (optionValue === 'de_platit' && hasProformaUrl(o)) return 'Așteptare plată'
  return FULFILLMENT_OPTIONS.find((x) => x.value === optionValue)?.label ?? optionValue
}

function rfqStatusLabel(status: string): string {
  switch (String(status || 'pending')) {
    case 'in_review':
      return 'În analiză'
    case 'answered':
      return 'Răspuns trimis'
    case 'closed':
      return 'Închisă'
    case 'pending':
    default:
      return 'În așteptare'
  }
}

type AdminActiveRow =
  | { kind: 'order'; data: AdminGuestResidentialOrderRow }
  | { kind: 'rfq'; data: AdminPartnerRfqRequestRow }

function orderTypeBadge(kind: AdminActiveRow['kind']): { label: string; className: string } {
  return kind === 'rfq'
    ? { label: 'RFQ', className: 'bg-indigo-100 text-indigo-900' }
    : { label: 'Comandă', className: 'bg-slate-200 text-slate-800' }
}

function rfqProductSummary(o: AdminPartnerRfqRequestRow): string {
  const lines = o.lines || []
  if (lines.length === 0) return o.productTitle || '—'
  if (lines.length === 1) return `${lines[0].quantity}× ${lines[0].productTitle}`
  return lines.map((line) => `${line.quantity}× ${line.productTitle}`).join(', ')
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminGuestResidentialOrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patchingId, setPatchingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active')
  const [deletedOrders, setDeletedOrders] = useState<AdminDeletedOrderRow[]>([])
  const [rfqOrders, setRfqOrders] = useState<AdminPartnerRfqRequestRow[]>([])
  const [deletedLoaded, setDeletedLoaded] = useState(false)
  const [deletedLoading, setDeletedLoading] = useState(false)
  const [deletedError, setDeletedError] = useState<string | null>(null)
  const [deletedSearch, setDeletedSearch] = useState('')
  const [detailKind, setDetailKind] = useState<'active' | 'deleted' | 'rfq'>('active')
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null)
  const [invoiceModal, setInvoiceModal] = useState<{
    order: AdminGuestResidentialOrderRow
    previousStatus: string
  } | null>(null)
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)
  const [invoiceSubmitting, setInvoiceSubmitting] = useState(false)
  const [docUploading, setDocUploading] = useState<'proforma' | 'invoice' | null>(null)

  const detailIsDeleted = detailKind === 'deleted'
  const detailIsRfq = detailKind === 'rfq'
  const detailOrder: AdminGuestResidentialOrderRow | null =
    detailOrderId && detailKind === 'active'
      ? orders.find((r) => r.id === detailOrderId) ?? null
      : null
  const detailDeletedOrder: AdminDeletedOrderRow | null =
    detailOrderId && detailIsDeleted
      ? deletedOrders.find((r) => r.id === detailOrderId) ?? null
      : null
  const detailRfq: AdminPartnerRfqRequestRow | null =
    detailOrderId && detailIsRfq ? rfqOrders.find((r) => r.id === detailOrderId) ?? null : null
  const detailPanelOrder = detailOrder ?? detailDeletedOrder

  const activeRows = useMemo<AdminActiveRow[]>(() => {
    const merged: AdminActiveRow[] = [
      ...orders.map((data) => ({ kind: 'order' as const, data })),
      ...rfqOrders.map((data) => ({ kind: 'rfq' as const, data })),
    ]
    merged.sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime())
    return merged
  }, [orders, rfqOrders])

  const loadDeletedOrders = useCallback(() => {
    setDeletedLoading(true)
    setDeletedError(null)
    getAdminDeletedOrders()
      .then((data) => {
        setDeletedOrders(data)
        setDeletedLoaded(true)
      })
      .catch((err) => setDeletedError(err instanceof Error ? err.message : 'Eroare la încărcare.'))
      .finally(() => setDeletedLoading(false))
  }, [])

  const openDeletedTab = useCallback(() => {
    setActiveTab('deleted')
    if (!deletedLoaded && !deletedLoading) loadDeletedOrders()
  }, [deletedLoaded, deletedLoading, loadDeletedOrders])

  const filteredDeletedOrders = useMemo(() => {
    const q = deletedSearch.trim().toLowerCase()
    if (!q) return deletedOrders
    return deletedOrders.filter((o) =>
      [o.orderNumber, `${o.lastName} ${o.firstName}`, o.email, o.productTitle, o.originalUserId]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [deletedOrders, deletedSearch])

  const closeDetail = useCallback(() => {
    setDetailOrderId(null)
    setDetailKind('active')
  }, [])

  const handleFulfillmentChange = useCallback(
    async (o: AdminGuestResidentialOrderRow, next: string) => {
      const prev = normalizeStatus(o)
      if (next === 'in_pregatire' && prev !== 'in_pregatire' && !hasInvoiceUrl(o)) {
        setInvoiceModal({ order: o, previousStatus: prev })
        return
      }
      setPatchingId(o.id)
      setOrders((rows) => rows.map((r) => (r.id === o.id ? { ...r, fulfillmentStatus: next } : r)))
      try {
        const out = await patchAdminOrderFulfillmentStatus(o.id, next)
        setOrders((rows) =>
          rows.map((r) =>
            r.id === o.id
              ? {
                  ...r,
                  fulfillmentStatus: next,
                  ...(out.clientInvoiceUrl !== undefined ? { clientInvoiceUrl: out.clientInvoiceUrl } : {}),
                  ...(out.proformaUrl !== undefined ? { proformaUrl: out.proformaUrl } : {}),
                }
              : r,
          ),
        )
      } catch (err) {
        setOrders((rows) => rows.map((r) => (r.id === o.id ? { ...r, fulfillmentStatus: prev } : r)))
        window.alert(err instanceof Error ? err.message : 'Nu s-a putut salva statusul.')
      } finally {
        setPatchingId(null)
      }
    },
    [],
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [orderData, rfqData] = await Promise.all([
          getAdminGuestResidentialOrders(),
          getAdminPartnerRfqRequests(),
        ])
        if (!cancelled) {
          setOrders(orderData)
          setRfqOrders(rfqData)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Eroare la încărcare.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  function closeInvoiceModal() {
    setInvoiceModal(null)
    setInvoiceFile(null)
    setInvoiceSubmitting(false)
  }

  async function submitInvoiceModal() {
    if (!invoiceModal || !invoiceFile) {
      window.alert('Selectează fișierul PDF al facturii pentru client.')
      return
    }
    setInvoiceSubmitting(true)
    try {
      const out = await patchAdminOrderFulfillmentStatus(
        invoiceModal.order.id,
        'in_pregatire',
        invoiceFile,
      )
      setOrders((rows) =>
        rows.map((r) =>
          r.id === invoiceModal.order.id
            ? {
                ...r,
                fulfillmentStatus: 'in_pregatire',
                clientInvoiceUrl: out.clientInvoiceUrl ?? r.clientInvoiceUrl ?? null,
                proformaUrl: out.proformaUrl ?? r.proformaUrl ?? null,
              }
            : r,
        ),
      )
      closeInvoiceModal()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Încărcarea a eșuat.')
      setInvoiceSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col p-6 sm:p-8 lg:p-10">
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Comenzi</h1>
        <p className="text-gray-500 text-sm font-['Inter'] mb-6">
          Comenzi rezidențiale (flux invitat și client autentificat).
        </p>
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500 font-['Inter']">Se încarcă...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8 lg:p-10">
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Comenzi</h1>
        <p className="text-red-600 text-sm font-['Inter']">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0 p-4 sm:p-6 lg:p-8">
      {detailPanelOrder || detailRfq ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4"
          role="presentation"
          onClick={closeDetail}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            role="dialog"
            aria-labelledby="order-detail-title"
            onClick={(e) => e.stopPropagation()}
          >
            {detailRfq ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <h2 id="order-detail-title" className="text-lg font-bold text-slate-900 font-['Inter'] shrink-0">
                    Detalii cerere de ofertă
                  </h2>
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 font-['Inter'] shrink-0"
                    onClick={closeDetail}
                  >
                    Închide
                  </button>
                </div>
                <div className="space-y-4 pt-4 text-sm font-['Inter']">
                  <section className="rounded-xl bg-[#f7f7f7] p-4 space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Referință</p>
                      <p className="mt-0.5 font-mono text-sm font-semibold text-slate-900">{detailRfq.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Data</p>
                      <p className="mt-0.5 text-slate-900">{formatDateTime(detailRfq.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
                      <p className="mt-1">
                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200/80">
                          {rfqStatusLabel(detailRfq.fulfillmentStatus || 'pending')}
                        </span>
                      </p>
                    </div>
                  </section>
                  <section className="rounded-xl bg-[#f7f7f7] p-4 space-y-3">
                    <p className="text-sm font-semibold text-slate-800 pb-1">Partener</p>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Companie</p>
                      <p className="mt-0.5 text-slate-900">{detailRfq.companyName?.trim() || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contact</p>
                      <p className="mt-0.5 text-slate-900">
                        {`${detailRfq.lastName} ${detailRfq.firstName}`.trim() || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Telefon</p>
                      <p className="mt-0.5 text-slate-900">{formatPhoneDigits(detailRfq.phone)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
                      <p className="mt-0.5 text-slate-900 break-all">{detailRfq.email}</p>
                    </div>
                  </section>
                  <section className="rounded-xl bg-[#f7f7f7] p-4 space-y-3">
                    <p className="text-sm font-semibold text-slate-800 pb-1">Produse solicitate</p>
                    <ul className="m-0 list-none space-y-2 p-0">
                      {(detailRfq.lines || []).map((line) => (
                        <li key={line.id} className="text-slate-800">
                          <span className="font-semibold tabular-nums">{line.quantity}×</span> {line.productTitle}
                          {line.productSlug ? (
                            <span className="mt-0.5 block font-mono text-xs text-slate-500">{line.productSlug}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </>
            ) : detailPanelOrder ? (
              <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <h2 id="order-detail-title" className="text-lg font-bold text-slate-900 font-['Inter'] shrink-0">
                Detalii comandă
              </h2>
              <div className="flex flex-wrap items-center justify-end gap-3 min-w-0 sm:ml-auto">
                {detailIsDeleted ? (
                  <span className="inline-flex items-center rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-900">
                    Comandă arhivată
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="detail-fulfillment"
                      className="text-xs font-semibold text-slate-600 font-['Inter'] whitespace-nowrap"
                    >
                      Status comandă
                    </label>
                    <select
                      id="detail-fulfillment"
                      className="min-w-[11rem] max-w-[14rem] rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-medium text-slate-900 disabled:opacity-50"
                      value={normalizeStatus(detailPanelOrder)}
                      disabled={patchingId === detailPanelOrder.id}
                      onChange={(e) => void handleFulfillmentChange(detailPanelOrder, e.target.value)}
                    >
                      {FULFILLMENT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {fulfillmentOptionLabel(detailPanelOrder, opt.value)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 font-['Inter'] shrink-0"
                  onClick={closeDetail}
                >
                  Închide
                </button>
              </div>
            </div>

            <div className="space-y-4 text-sm font-['Inter']">
              {/* 1. Număr comandă, dată, sursă */}
              <section
                className="rounded-xl bg-[#f7f7f7] p-4 space-y-3"
                aria-label="Identificare comandă"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Număr comandă</p>
                  <p className="mt-0.5 font-mono text-sm font-semibold text-slate-900">{detailPanelOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Data</p>
                  <p className="mt-0.5 text-slate-900">{formatDateTime(detailPanelOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sursă</p>
                  <p className="mt-1">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${orderSourceLabel(detailPanelOrder.orderSource, detailPanelOrder).className}`}
                    >
                      {orderSourceLabel(detailPanelOrder.orderSource, detailPanelOrder).label}
                    </span>
                  </p>
                </div>
              </section>

              {/* 2. Client */}
              <section className="rounded-xl bg-[#f7f7f7] p-4 space-y-3" aria-label="Date client">
                <p className="text-sm font-semibold text-slate-800 pb-1">Client</p>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nume</p>
                  <p className="mt-0.5 text-slate-900">
                    {`${detailPanelOrder.lastName} ${detailPanelOrder.firstName}`.trim() || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Telefon</p>
                  <p className="mt-0.5 text-slate-900">{formatPhoneDigits(detailPanelOrder.phone)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
                  <p className="mt-0.5 text-slate-900 break-all">{detailPanelOrder.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Adresă facturare</p>
                  <p className="mt-0.5 text-slate-800 whitespace-pre-wrap">
                    {[
                      detailPanelOrder.billAddress,
                      [detailPanelOrder.billPostal, detailPanelOrder.billCity].filter(Boolean).join(' '),
                      detailPanelOrder.billCounty,
                    ]
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Adresă livrare</p>
                  <p className="mt-0.5 text-slate-800 whitespace-pre-wrap">
                    {detailPanelOrder.deliveryDifferent
                      ? [
                          detailPanelOrder.delAddress,
                          [detailPanelOrder.delPostal, detailPanelOrder.delCity].filter(Boolean).join(' '),
                          detailPanelOrder.delCounty,
                        ]
                          .filter(Boolean)
                          .join(', ') || '—'
                      : 'La fel ca adresa de facturare'}
                  </p>
                </div>
              </section>

              {/* Facturi: proforma + factură */}
              <section className="rounded-xl bg-[#f7f7f7] p-4 space-y-4" aria-label="Facturi">
                <p className="text-sm font-semibold text-slate-800">Facturi</p>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Proforma</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
                    {hasProformaUrl(detailPanelOrder) ? (
                      <span className="text-emerald-700 font-semibold text-sm">Încărcată ✓</span>
                    ) : (
                      <span className="text-slate-400 text-sm">—</span>
                    )}
                    {detailPanelOrder.proformaUrl ? (
                      <a
                        href={detailPanelOrder.proformaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-sky-700 hover:underline"
                      >
                        Deschide PDF
                      </a>
                    ) : null}
                    {detailIsDeleted ? null : (
                    <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50">
                      {docUploading === 'proforma' ? 'Se încarcă…' : 'Încarcă PDF'}
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        className="sr-only"
                        disabled={docUploading !== null}
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          e.target.value = ''
                          if (!f || !detailPanelOrder) return
                          setDocUploading('proforma')
                          void (async () => {
                            try {
                              const out = await patchAdminOrderFulfillmentStatus(
                                detailPanelOrder.id,
                                normalizeStatus(detailPanelOrder),
                                undefined,
                                f,
                              )
                              setOrders((rows) =>
                                rows.map((r) =>
                                  r.id === detailPanelOrder.id
                                    ? {
                                        ...r,
                                        proformaUrl: out.proformaUrl ?? r.proformaUrl ?? null,
                                        clientInvoiceUrl: out.clientInvoiceUrl ?? r.clientInvoiceUrl ?? null,
                                      }
                                    : r,
                                ),
                              )
                            } catch (err) {
                              window.alert(err instanceof Error ? err.message : 'Încărcarea a eșuat.')
                            } finally {
                              setDocUploading(null)
                            }
                          })()
                        }}
                      />
                    </label>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Factură</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
                    {hasInvoiceUrl(detailPanelOrder) ? (
                      <span className="text-emerald-700 font-semibold text-sm">Încărcată ✓</span>
                    ) : (
                      <span className="text-slate-400 text-sm">—</span>
                    )}
                    {detailPanelOrder.clientInvoiceUrl ? (
                      <a
                        href={detailPanelOrder.clientInvoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-sky-700 hover:underline"
                      >
                        Deschide PDF
                      </a>
                    ) : null}
                    {!detailIsDeleted && !hasInvoiceUrl(detailPanelOrder) && normalizeStatus(detailPanelOrder) === 'in_pregatire' ? (
                      <button
                        type="button"
                        className="text-sm font-semibold text-amber-800 underline-offset-2 hover:underline"
                        onClick={() =>
                          setInvoiceModal({
                            order: detailPanelOrder,
                            previousStatus: normalizeStatus(detailPanelOrder),
                          })
                        }
                      >
                        Încarcă (pas obligatoriu)
                      </button>
                    ) : null}
                    {detailIsDeleted ? null : (
                    <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50">
                      {docUploading === 'invoice' ? 'Se încarcă…' : 'Încarcă / înlocuiește PDF'}
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        className="sr-only"
                        disabled={docUploading !== null}
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          e.target.value = ''
                          if (!f || !detailPanelOrder) return
                          setDocUploading('invoice')
                          void (async () => {
                            try {
                              const out = await patchAdminOrderFulfillmentStatus(
                                detailPanelOrder.id,
                                normalizeStatus(detailPanelOrder),
                                f,
                              )
                              setOrders((rows) =>
                                rows.map((r) =>
                                  r.id === detailPanelOrder.id
                                    ? {
                                        ...r,
                                        clientInvoiceUrl: out.clientInvoiceUrl ?? r.clientInvoiceUrl ?? null,
                                        proformaUrl: out.proformaUrl ?? r.proformaUrl ?? null,
                                      }
                                    : r,
                                ),
                              )
                            } catch (err) {
                              window.alert(err instanceof Error ? err.message : 'Încărcarea a eșuat.')
                            } finally {
                              setDocUploading(null)
                            }
                          })()
                        }}
                      />
                    </label>
                    )}
                  </div>
                </div>
              </section>

              {detailIsDeleted ? (
                <section className="rounded-xl bg-rose-50 border border-rose-100 p-4 space-y-3" aria-label="Date arhivare">
                  <p className="text-sm font-semibold text-rose-900">Arhivare (cont șters)</p>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Motiv</p>
                    <p className="mt-0.5 text-rose-900">
                      {deletionReasonLabel((detailPanelOrder as AdminDeletedOrderRow).deletionReason)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Arhivată la</p>
                    <p className="mt-0.5 text-rose-900">
                      {(detailPanelOrder as AdminDeletedOrderRow).archivedAt
                        ? formatDateTime((detailPanelOrder as AdminDeletedOrderRow).archivedAt as string)
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">ID cont original</p>
                    <p className="mt-0.5 font-mono text-xs text-rose-900 break-all">
                      {(detailPanelOrder as AdminDeletedOrderRow).originalUserId || '—'}
                    </p>
                  </div>
                </section>
              ) : null}

              {/* 3. Detalii comandă (linii, total) */}
              <section
                className="rounded-xl bg-[#f7f7f7] p-4 space-y-4"
                aria-label="Detalii comandă"
              >
                <p className="text-sm font-semibold text-slate-800">Detalii comandă</p>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Linii comandă</p>
                  {detailPanelOrder.lines && detailPanelOrder.lines.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-slate-200/80 bg-white">
                      <table className="w-full text-left text-xs font-['Inter']">
                        <thead className="bg-white border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2 font-semibold text-slate-700">Produs</th>
                            <th className="px-3 py-2 font-semibold text-slate-700 text-right">Cant.</th>
                            <th className="px-3 py-2 font-semibold text-slate-700 text-right">Preț u. cu TVA</th>
                            <th className="px-3 py-2 font-semibold text-slate-700 text-right">Total cu TVA</th>
                            <th className="px-3 py-2 font-semibold text-slate-700 text-right">TVA %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {detailPanelOrder.lines.map((L) => (
                            <tr key={L.id}>
                              <td className="px-3 py-2 text-slate-900">
                                <span className="line-clamp-3">{L.productTitle}</span>
                                {L.productSlug ? (
                                  <span className="block text-[11px] text-slate-500 font-mono mt-0.5">{L.productSlug}</span>
                                ) : null}
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums">{L.quantity}</td>
                              <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">
                                {formatMoney(L.unitPriceInclVat, detailPanelOrder.currency)}
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums font-medium whitespace-nowrap">
                                {formatMoney(L.lineTotalInclVat, detailPanelOrder.currency)}
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums text-slate-600 whitespace-nowrap">
                                {L.vatPercent != null ? `${L.vatPercent}%` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium text-slate-900">{detailPanelOrder.productTitle}</span>
                      {detailPanelOrder.productSlug ? (
                        <span className="block text-xs text-slate-500 font-mono mt-0.5">{detailPanelOrder.productSlug}</span>
                      ) : null}
                    </p>
                  )}
                  <p className="mt-3 text-right text-sm font-['Inter']">
                    <span className="text-slate-500">Total comandă cu TVA: </span>
                    <span className="font-semibold text-slate-900">
                      {formatMoney(detailPanelOrder.orderTotalInclVat ?? detailPanelOrder.lineTotalInclVat, detailPanelOrder.currency)}
                    </span>
                  </p>
                </div>
              </section>
            </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {invoiceModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="presentation"
          onClick={() => !invoiceSubmitting && closeInvoiceModal()}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            role="dialog"
            aria-labelledby="invoice-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="invoice-modal-title" className="text-lg font-bold text-slate-900 font-['Inter']">
              Factură client (PDF)
            </h2>
            <p className="mt-2 text-sm text-slate-600 font-['Inter']">
              Comanda <span className="font-mono font-semibold">{invoiceModal.order.orderNumber}</span>
              {invoiceModal.previousStatus === 'in_pregatire'
                ? ' este deja în „În pregătire”, dar lipsește factura. '
                : ' trece în „În pregătire”. '}
              Încarcă factura PDF pe care o va descărca clientul din cont.
            </p>
            <label className="mt-4 block text-sm font-medium text-slate-700 font-['Inter']">
              Fișier PDF
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="mt-1 block w-full text-sm text-slate-700"
                disabled={invoiceSubmitting}
                onChange={(e) => setInvoiceFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={invoiceSubmitting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 font-['Inter']"
                onClick={() => !invoiceSubmitting && closeInvoiceModal()}
              >
                Anulează
              </button>
              <button
                type="button"
                disabled={invoiceSubmitting || !invoiceFile}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 font-['Inter']"
                onClick={() => void submitInvoiceModal()}
              >
                {invoiceSubmitting ? 'Se încarcă…' : 'Salvează status și factura'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex-shrink-0 mb-4">
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900">Comenzi</h1>
        <p className="text-gray-500 text-sm font-['Inter'] mt-0.5">
          {activeTab === 'active'
            ? `Comenzi rezidențiale și cereri de ofertă partener — ${activeRows.length} în listă (${orders.length} comenzi, ${rfqOrders.length} RFQ, max. 500). La „În pregătire” este obligatoriu PDF-ul facturii (R2 configurat pe API).`
            : 'Comenzi mutate în arhivă la ștergerea contului. Datele sunt păstrate (fiscal), dar comenzile nu mai apar în „comenzile mele” și nu pot fi re-asociate unui cont nou.'}
        </p>
      </div>

      <div className="flex-shrink-0 mb-4 flex flex-wrap items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold font-['Inter'] transition-colors ${
            activeTab === 'active'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Comenzi active ({activeRows.length})
        </button>
        <button
          type="button"
          onClick={openDeletedTab}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold font-['Inter'] transition-colors ${
            activeTab === 'deleted'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Comenzi șterse{deletedLoaded ? ` (${deletedOrders.length})` : ''}
        </button>
      </div>

      {activeTab === 'deleted' ? (
        <div className="flex-shrink-0 mb-3">
          <input
            type="search"
            value={deletedSearch}
            onChange={(e) => setDeletedSearch(e.target.value)}
            placeholder="Caută după nr. comandă, nume, email, produs…"
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none font-['Inter']"
          />
        </div>
      ) : null}

      {activeTab === 'deleted' ? (
        <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
          {deletedLoading ? (
            <div className="p-8 text-center text-gray-500 text-sm font-['Inter']">Se încarcă…</div>
          ) : deletedError ? (
            <div className="p-8 text-center text-red-600 text-sm font-['Inter']">{deletedError}</div>
          ) : filteredDeletedOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm font-['Inter']">
              {deletedSearch.trim() ? 'Niciun rezultat pentru căutare.' : 'Nu există comenzi șterse.'}
            </div>
          ) : (
            <div className="overflow-auto flex-1">
              <table className="min-w-[1040px] w-full text-left text-sm font-['Inter']">
                <thead className="sticky top-0 z-10 bg-slate-100 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Data comandă</th>
                    <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Arhivată la</th>
                    <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Nr. comandă</th>
                    <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Sursă</th>
                    <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Client</th>
                    <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Email</th>
                    <th className="px-3 py-3 font-semibold text-slate-700 min-w-[180px]">Produs</th>
                    <th className="px-3 py-3 font-semibold text-slate-700 text-right whitespace-nowrap">Total cu TVA</th>
                    <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Motiv</th>
                    <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap text-center">Detalii</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDeletedOrders.map((o) => {
                    const src = orderSourceLabel(o.orderSource, o)
                    const name = `${o.lastName} ${o.firstName}`.trim() || '—'
                    const totalIncl = o.orderTotalInclVat ?? o.lineTotalInclVat
                    return (
                      <tr key={o.id} className="hover:bg-slate-50/80 align-top">
                        <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{formatDateTime(o.createdAt)}</td>
                        <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                          {o.archivedAt ? formatDateTime(o.archivedAt) : '—'}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs text-slate-900 whitespace-nowrap">{o.orderNumber}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${src.className}`}>
                            {src.label}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-900 max-w-[160px]">
                          <span className="line-clamp-2" title={name}>
                            {name}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-700 max-w-[200px] break-all">{o.email}</td>
                        <td className="px-3 py-2.5 text-slate-800">
                          <span className="line-clamp-2" title={o.productTitle}>
                            {o.productTitle}
                          </span>
                          {o.productSlug ? (
                            <span className="block text-xs text-slate-500 mt-0.5 font-mono">{o.productSlug}</span>
                          ) : null}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums font-medium text-slate-900 whitespace-nowrap">
                          {formatMoney(totalIncl, o.currency)}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-rose-100 text-rose-900">
                            {deletionReasonLabel(o.deletionReason)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                            onClick={() => {
                              setDetailKind('deleted')
                              setDetailOrderId(o.id)
                            }}
                          >
                            Vezi
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
        {activeRows.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm font-['Inter']">Nu există comenzi sau cereri de ofertă încă.</div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="min-w-[1040px] w-full text-left text-sm font-['Inter']">
              <thead className="sticky top-0 z-10 bg-slate-100 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Data</th>
                  <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Tip</th>
                  <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Nr. comandă</th>
                  <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap min-w-[11rem]">
                    Status
                  </th>
                  <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Sursă</th>
                  <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Client</th>
                  <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">Email</th>
                  <th className="px-3 py-3 font-semibold text-slate-700 min-w-[180px]">Produs</th>
                  <th className="px-3 py-3 font-semibold text-slate-700 text-right whitespace-nowrap">
                    Total cu TVA
                  </th>
                  <th className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap text-center">Detalii</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeRows.map((row) => {
                  const typeBadge = orderTypeBadge(row.kind)
                  if (row.kind === 'rfq') {
                    const o = row.data
                    const name = `${o.lastName} ${o.firstName}`.trim() || '—'
                    const company = o.companyName?.trim() || ''
                    const clientLabel = company || name
                    const clientSub = company && name !== '—' ? name : null
                    const src = orderSourceLabel(o.orderSource, o)
                    return (
                      <tr key={`rfq-${o.id}`} className="hover:bg-slate-50/80 align-top">
                        <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{formatDateTime(o.createdAt)}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${typeBadge.className}`}>
                            {typeBadge.label}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs text-slate-900 whitespace-nowrap">{o.orderNumber}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap align-top">
                          <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200/80">
                            {rfqStatusLabel(o.fulfillmentStatus || 'pending')}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${src.className}`}>
                            {src.label}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-900 max-w-[180px]">
                          <span className="line-clamp-2" title={clientLabel}>
                            {clientLabel}
                          </span>
                          {clientSub ? (
                            <span className="block text-xs text-slate-500 mt-0.5 line-clamp-1" title={clientSub}>
                              {clientSub}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-3 py-2.5 text-slate-700 max-w-[200px] break-all">{o.email}</td>
                        <td className="px-3 py-2.5 text-slate-800">
                          <span className="line-clamp-2" title={rfqProductSummary(o)}>
                            {rfqProductSummary(o)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums font-medium text-slate-400 whitespace-nowrap">
                          —
                        </td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                            onClick={() => {
                              setDetailKind('rfq')
                              setDetailOrderId(o.id)
                            }}
                          >
                            Vezi
                          </button>
                        </td>
                      </tr>
                    )
                  }

                  const o = row.data
                  const src = orderSourceLabel(o.orderSource, o)
                  const name = `${o.lastName} ${o.firstName}`.trim() || '—'
                  const st = normalizeStatus(o)
                  const totalIncl = o.orderTotalInclVat ?? o.lineTotalInclVat
                  return (
                    <tr key={`order-${o.id}`} className="hover:bg-slate-50/80 align-top">
                      <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{formatDateTime(o.createdAt)}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${typeBadge.className}`}>
                          {typeBadge.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-900 whitespace-nowrap">{o.orderNumber}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap align-top">
                        <select
                          className="max-w-[11rem] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-900 disabled:opacity-50"
                          value={st}
                          disabled={patchingId === o.id}
                          onChange={(e) => void handleFulfillmentChange(o, e.target.value)}
                        >
                          {FULFILLMENT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {fulfillmentOptionLabel(o, opt.value)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${src.className}`}>
                          {src.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-900 max-w-[160px]">
                        <span className="line-clamp-2" title={name}>
                          {name}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 max-w-[200px] break-all">{o.email}</td>
                      <td className="px-3 py-2.5 text-slate-800">
                        <span className="line-clamp-2" title={o.productTitle}>
                          {o.productTitle}
                        </span>
                        {o.productSlug ? (
                          <span className="block text-xs text-slate-500 mt-0.5 font-mono">{o.productSlug}</span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums font-medium text-slate-900 whitespace-nowrap">
                        {formatMoney(totalIncl, o.currency)}
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                          onClick={() => {
                            setDetailKind('active')
                            setDetailOrderId(o.id)
                          }}
                        >
                          Vezi
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}
    </div>
  )
}
