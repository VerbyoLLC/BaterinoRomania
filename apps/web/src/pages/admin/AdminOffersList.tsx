import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getAdminCommercialOffers,
  deleteAdminCommercialOffer,
  getAdminOfferNotes,
  addAdminOfferNote,
  type AdminCommercialOfferRow,
  type AdminOfferNote,
} from '../../lib/api'
import {
  adminOfferEditPath,
  adminOfferNewFreshPath,
  commercialOfferBuyerTypeLabelRo,
} from '../../lib/commercialOfferDraft'
import { useToast } from '../../contexts/ToastContext'

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatDateShort(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function buyerTypeShortLabel(buyerType: AdminCommercialOfferRow['buyerType']): string {
  return buyerType === 'company' ? 'Companie' : 'P.F.'
}

function formatMoney(amount: string, currency: string): string {
  const n = Number(String(amount).replace(',', '.'))
  if (!Number.isFinite(n)) return '—'
  return `${n.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency || 'RON'}`
}

// ── Notes panel ───────────────────────────────────────────────────────────────

type NotesPanelProps = {
  offer: AdminCommercialOfferRow
  onClose: () => void
  onNoteAdded: (offerId: string) => void
}

function NotesPanel({ offer, onClose, onNoteAdded }: NotesPanelProps) {
  const toast = useToast()
  const [notes, setNotes] = useState<AdminOfferNote[]>([])
  const [loadingNotes, setLoadingNotes] = useState(true)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    setLoadingNotes(true)
    getAdminOfferNotes(offer.id)
      .then((rows) => { if (!cancelled) setNotes(rows) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingNotes(false) })
    return () => { cancelled = true }
  }, [offer.id])

  useEffect(() => {
    if (!loadingNotes) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [notes.length, loadingNotes])

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || saving) return
    setSaving(true)
    try {
      const note = await addAdminOfferNote(offer.id, text)
      setNotes((prev) => [...prev, note])
      setDraft('')
      onNoteAdded(offer.id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Eroare la salvare.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/20"
        aria-hidden
        onClick={onClose}
      />

      {/* panel */}
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl"
        role="complementary"
        aria-label="Notițe ofertă"
      >
        {/* header */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 font-['Inter'] truncate">
              Notițe — {offer.clientLabel || '—'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 font-['Inter']">
              {formatDateShort(offer.updatedAt || offer.createdAt)} · {offer.status === 'draft' ? 'Ciornă' : 'Generată'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Închide"
            className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-4" aria-hidden>
              <path strokeLinecap="round" d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        {/* notes list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {loadingNotes ? (
            <p className="text-sm text-slate-500 font-['Inter']">Se încarcă…</p>
          ) : notes.length === 0 ? (
            <p className="text-sm text-slate-500 font-['Inter']">Nicio notiță încă. Adaugă prima notiță mai jos.</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-slate-800 font-['Inter'] truncate">
                    {note.authorName || 'Admin'}
                  </span>
                  <time className="shrink-0 text-[11px] text-slate-400 font-['Inter'] tabular-nums">
                    {formatDateTime(note.createdAt)}
                  </time>
                </div>
                <p className="text-sm text-slate-700 font-['Inter'] whitespace-pre-wrap leading-relaxed">
                  {note.body}
                </p>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* add note form */}
        <form onSubmit={handleAddNote} className="shrink-0 border-t border-slate-100 px-5 py-4">
          <label htmlFor="offer-note-body" className="block text-xs font-semibold text-slate-700 font-['Inter'] mb-1.5">
            Notiță nouă
          </label>
          <textarea
            id="offer-note-body"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Scrie o notiță…"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm font-['Inter'] text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!draft.trim() || saving}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40 font-['Inter']"
            >
              {saving ? 'Se salvează…' : 'Adaugă notiță'}
            </button>
          </div>
        </form>
      </aside>
    </>
  )
}

// ── Main list ─────────────────────────────────────────────────────────────────

export default function AdminOffersList() {
  const toast = useToast()
  const [offers, setOffers] = useState<AdminCommercialOfferRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [confirmDelete, setConfirmDelete] = useState<'single' | 'bulk' | null>(null)
  const [confirmSingleId, setConfirmSingleId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [notesOffer, setNotesOffer] = useState<AdminCommercialOfferRow | null>(null)

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
        setMenuPos(null)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const rows = await getAdminCommercialOffers()
        if (!cancelled) setOffers(rows)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Eroare la încărcare.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

  const allSelected = offers.length > 0 && selectedIds.size === offers.length
  const someSelected = selectedIds.size > 0 && !allSelected

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(offers.map((o) => o.id)))
  }
  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function openSingleDelete(id: string) {
    setOpenMenuId(null); setMenuPos(null)
    setConfirmSingleId(id)
    setConfirmDelete('single')
  }

  async function handleConfirmDelete() {
    if (deleting) return
    setDeleting(true)
    try {
      const ids = confirmDelete === 'single' && confirmSingleId
        ? [confirmSingleId]
        : Array.from(selectedIds)
      await Promise.all(ids.map((id) => deleteAdminCommercialOffer(id)))
      const deletedSet = new Set(ids)
      setOffers((prev) => prev.filter((o) => !deletedSet.has(o.id)))
      setSelectedIds((prev) => { const n = new Set(prev); ids.forEach((id) => n.delete(id)); return n })
      toast.success(ids.length === 1 ? 'Oferta a fost ștearsă.' : `${ids.length} oferte șterse.`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Eroare la ștergere.')
    } finally {
      setDeleting(false)
      setConfirmDelete(null)
      setConfirmSingleId(null)
    }
  }

  const confirmSingleRow = confirmSingleId ? offers.find((o) => o.id === confirmSingleId) : null

  return (
    <div className="box-border w-full min-w-0 shrink max-w-full p-6 sm:p-8 lg:p-10">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Lista oferte</h1>
          <p className="text-sm text-slate-600 font-['Inter'] max-w-3xl">
            Ciorne și oferte generate — editează ciornele sau descarcă PDF-ul ofertei finalizate.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {selectedIds.size > 0 ? (
            <button
              type="button"
              onClick={() => setConfirmDelete('bulk')}
              className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold font-['Inter'] text-red-700 hover:bg-red-100"
            >
              Șterge selecția ({selectedIds.size})
            </button>
          ) : null}
          <Link
            to={adminOfferNewFreshPath()}
            className="inline-flex items-center justify-center rounded-lg bg-[#1e46b4] px-4 py-2.5 text-sm font-semibold font-['Inter'] text-white shadow-sm hover:bg-[#163899]"
          >
            Ofertă nouă
          </Link>
        </div>
      </div>

      {error ? (
        <p className="mb-4 text-sm font-['Inter'] text-red-800 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">{error}</p>
      ) : null}

      <section className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5 overflow-visible">
        <table className="w-full min-w-0 table-fixed text-left text-sm font-['Inter'] [border-collapse:separate] [border-spacing:0] overflow-hidden rounded-2xl">
          <colgroup>
            <col className="w-[3%]" />
            <col className="w-[9%]" />
            <col className="w-[7%]" />
            <col className="w-[7%]" />
            <col className="w-[13%]" />
            <col className="w-[12%]" />
            <col className="w-[9%]" />
            <col className="w-[11%]" />
            <col className="w-[5%]" />
            <col className="w-[5%]" />
            <col className="w-[5%]" />
            <col className="w-[5%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/90 text-slate-600">
              <th className="px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected }}
                  onChange={toggleAll}
                  aria-label="Selectează tot"
                  className="h-4 w-4 rounded border-slate-300 text-[#1e46b4] focus:ring-[#1e46b4]"
                />
              </th>
              <th className="px-3 py-2.5 font-semibold">Dată</th>
              <th className="px-3 py-2.5 font-semibold">Status</th>
              <th className="px-3 py-2.5 font-semibold">Tip</th>
              <th className="px-3 py-2.5 font-semibold">Client / companie</th>
              <th className="px-3 py-2.5 font-semibold">Email</th>
              <th className="px-3 py-2.5 font-semibold">Telefon</th>
              <th className="px-3 py-2.5 font-semibold">Sumă</th>
              <th className="px-3 py-2.5 font-semibold text-center">Prod.</th>
              <th className="px-3 py-2.5 font-semibold text-center">PDF</th>
              <th className="px-3 py-2.5 font-semibold text-center">Note</th>
              <th className="px-3 py-2.5 font-semibold text-center">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={12} className="px-3 py-12 text-center text-slate-500">Se încarcă…</td></tr>
            ) : offers.length === 0 ? (
              <tr><td colSpan={12} className="px-3 py-12 text-center text-slate-500">Nu există oferte încă.</td></tr>
            ) : (
              offers.map((row) => {
                const isSelected = selectedIds.has(row.id)
                return (
                  <tr key={row.id} className={`border-b border-slate-100 last:border-b-0 ${isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/60'}`}>
                    <td className="px-3 py-2.5">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleRow(row.id)}
                        aria-label={`Selectează oferta ${row.clientLabel || row.id}`}
                        className="h-4 w-4 rounded border-slate-300 text-[#1e46b4] focus:ring-[#1e46b4]" />
                    </td>
                    <td className="px-3 py-2.5 text-slate-700 max-w-0 truncate" title={formatDateTime(row.updatedAt || row.createdAt)}>
                      {formatDateShort(row.updatedAt || row.createdAt)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex max-w-full truncate rounded-full px-2 py-0.5 text-[11px] font-semibold ${row.status === 'draft' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                        {row.status === 'draft' ? 'Ciornă' : 'Generată'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex max-w-full truncate rounded-full px-2 py-0.5 text-[11px] font-semibold ${row.buyerType === 'company' ? 'bg-sky-100 text-sky-900' : 'bg-violet-100 text-violet-900'}`}
                        title={commercialOfferBuyerTypeLabelRo(row.buyerType)}>
                        {buyerTypeShortLabel(row.buyerType)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-900 font-medium max-w-0 truncate" title={row.clientLabel || undefined}>{row.clientLabel || '—'}</td>
                    <td className="px-3 py-2.5 text-slate-700 max-w-0 truncate" title={row.clientEmail || undefined}>
                      {row.clientEmail?.trim() ? (
                        <a href={`mailto:${row.clientEmail.trim()}`} className="block truncate text-[#1e46b4] hover:text-[#163899] hover:underline">{row.clientEmail.trim()}</a>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700 max-w-0 truncate tabular-nums" title={row.clientPhone?.trim() || undefined}>
                      {row.clientPhone?.trim() ? (
                        <a href={`tel:${row.clientPhone.trim().replace(/\s/g, '')}`} className="block truncate text-[#1e46b4] hover:text-[#163899] hover:underline">{row.clientPhone.trim()}</a>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-slate-800 max-w-0 truncate tabular-nums" title={formatMoney(row.amountGross, row.currency)}>
                      {formatMoney(row.amountGross, row.currency)}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700 tabular-nums text-center">{row.productCount}</td>

                    {/* PDF download column */}
                    <td className="px-3 py-2.5 text-center">
                      {row.pdfUrl ? (
                        <a href={row.pdfUrl} target="_blank" rel="noopener noreferrer" download title="Descarcă PDF"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v8m0 0L5.5 7.5M8 10l2.5-2.5M3 13h10" />
                          </svg>
                        </a>
                      ) : <span className="text-slate-300">—</span>}
                    </td>

                    {/* notes column */}
                    <td className="px-3 py-2.5 text-center">
                      <button type="button" onClick={() => setNotesOffer(row)} title="Notițe"
                        className="inline-flex items-center gap-1 rounded-md px-1.5 h-7 text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 shrink-0" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v7A1.5 1.5 0 0112.5 12H9l-3 2.5V12H3.5A1.5 1.5 0 012 10.5v-7z" />
                        </svg>
                        {row.noteCount > 0 ? (
                          <span className="text-[11px] font-semibold tabular-nums text-slate-600">{row.noteCount}</span>
                        ) : null}
                      </button>
                    </td>

                    {/* actions: 3-dot menu */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        {/* 3-dot menu */}
                        <button type="button"
                          onClick={(e) => {
                            if (openMenuId === row.id) { setOpenMenuId(null); setMenuPos(null) }
                            else {
                              const rect = e.currentTarget.getBoundingClientRect()
                              setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
                              setOpenMenuId(row.id)
                            }
                          }}
                          aria-label="Mai multe acțiuni" aria-expanded={openMenuId === row.id}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900">
                          <svg viewBox="0 0 16 16" fill="currentColor" className="size-4" aria-hidden>
                            <circle cx="3" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" /><circle cx="13" cy="8" r="1.5" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </section>

      {/* fixed dropdown */}
      {openMenuId && menuPos ? (() => {
        const row = offers.find((o) => o.id === openMenuId)
        if (!row) return null
        return (
          <div ref={menuRef} style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 50 }}
            className="min-w-[140px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-900/5">
            {row.status === 'draft' ? (
              <Link to={adminOfferEditPath(row.id)} onClick={() => { setOpenMenuId(null); setMenuPos(null) }}
                className="flex w-full items-center px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 font-['Inter']">
                Editează
              </Link>
            ) : null}
            <button type="button" onClick={() => openSingleDelete(row.id)}
              className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 font-['Inter']">
              Șterge
            </button>
          </div>
        )
      })() : null}

      {/* notes panel */}
      {notesOffer ? (
        <NotesPanel
          offer={notesOffer}
          onClose={() => setNotesOffer(null)}
          onNoteAdded={(id) =>
            setOffers((prev) =>
              prev.map((o) => (o.id === id ? { ...o, noteCount: o.noteCount + 1 } : o)),
            )
          }
        />
      ) : null}

      {/* confirm delete dialog */}
      {confirmDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="presentation"
          onClick={(e) => { if (e.target === e.currentTarget && !deleting) setConfirmDelete(null) }}>
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            role="dialog" aria-modal="true" aria-labelledby="delete-offer-title">
            <h2 id="delete-offer-title" className="text-base font-bold text-slate-900 font-['Inter']">
              {confirmDelete === 'bulk' ? `Șterge ${selectedIds.size} oferte?` : 'Șterge oferta?'}
            </h2>
            <p className="mt-2 text-sm text-slate-600 font-['Inter']">
              {confirmDelete === 'bulk'
                ? `Cele ${selectedIds.size} oferte selectate vor fi șterse permanent, inclusiv PDF-urile stocate.`
                : confirmSingleRow
                  ? `Oferta pentru „${confirmSingleRow.clientLabel || '—'}" va fi ștearsă permanent, inclusiv PDF-ul stocat.`
                  : 'Oferta va fi ștearsă permanent, inclusiv PDF-ul stocat.'}
            </p>
            <p className="mt-1 text-xs text-slate-500 font-['Inter']">Această acțiune nu poate fi anulată.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmDelete(null)} disabled={deleting}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 font-['Inter']">
                Anulează
              </button>
              <button type="button" onClick={() => void handleConfirmDelete()} disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 font-['Inter']">
                {deleting ? 'Se șterge…' : 'Șterge'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
