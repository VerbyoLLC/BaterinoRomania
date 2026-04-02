import { useState, useRef, useEffect, useCallback } from 'react'
import type { ReducereProgram } from '../../i18n/reduceri'
import {
  getAdminReducerePrograms,
  createAdminReducereProgram,
  updateAdminReducereProgram,
  deleteAdminReducereProgram,
  uploadAdminFile,
  type ReducereProgramRow,
} from '../../lib/api'

type DraftProgram = ReducereProgram & { isDraft: true; id: string }

function renderBold(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1
      ? <span key={i} className="font-bold">{part}</span>
      : <span key={i}>{part}</span>
  )
}

function SmileyPopover({ icon, info }: { icon: string; info?: { title: string; text: string } }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={ref} className="absolute bottom-3 right-3">
      {open && info && (
        <div className="absolute bottom-11 right-0 w-72 rounded-[5px] overflow-hidden z-10 shadow-lg">
          <div className="bg-white/70 backdrop-blur-sm px-3 py-3">
            <p className="text-black text-base font-bold font-['Nunito_Sans'] mb-1.5">{info.title}</p>
            <p className="text-black text-sm font-medium font-['Nunito_Sans'] leading-5">{info.text}</p>
          </div>
        </div>
      )}
      <button type="button" onClick={() => setOpen((o) => !o)} className="p-1 group" aria-label="Info">
        <img src={icon} alt="" className="h-8 w-8 object-contain transition-transform duration-200 group-hover:scale-125" />
      </button>
    </div>
  )
}

const labelClass = "block text-xs font-medium font-['Inter'] text-gray-700 mb-0.5"
const inputClass = "w-full h-9 px-2.5 rounded-lg border border-zinc-200 text-sm font-['Inter'] focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"

type EditingTarget = null | 'new' | { type: 'program'; id: string } | { type: 'draft'; id: string }

export default function AdminDiscounts() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [apiPrograms, setApiPrograms] = useState<ReducereProgramRow[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [editingTarget, setEditingTarget] = useState<EditingTarget>(null)
  const [baseline, setBaseline] = useState<ReducereProgramRow | null>(null)
  const [isClosingPanel, setIsClosingPanel] = useState(false)
  const [drafts, setDrafts] = useState<DraftProgram[]>([])
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'program'; id: string } | { type: 'draft'; id: string } | null>(null)

  const [form, setForm] = useState({
    programLabel: '',
    title: '',
    descriereScurta: '',
    description: '',
    stiaiCaEnabled: false,
    stiaiCaTitle: '',
    stiaiCaText: '',
    durataProgram: '',
    discountPercent: '',
  })

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const refreshList = useCallback(async () => {
    try {
      const rows = await getAdminReducerePrograms('ro')
      setApiPrograms(rows)
      setListError(null)
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Eroare la reîncărcare.')
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setListLoading(true)
    getAdminReducerePrograms('ro')
      .then((rows) => {
        if (!cancelled) {
          setApiPrograms(rows)
          setListError(null)
        }
      })
      .catch((e) => {
        if (!cancelled) setListError(e instanceof Error ? e.message : 'Eroare la încărcare.')
      })
      .finally(() => {
        if (!cancelled) setListLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const update = (key: keyof typeof form, value: string | number | boolean) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const handleFile = (file: File | null) => {
    setPhotoFile(file)
    setPhotoPreview((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
      return file ? URL.createObjectURL(file) : null
    })
  }

  const clearUploadedPhotoKeepBaseline = () => {
    setPhotoFile(null)
    setPhotoPreview((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
      return baseline?.photo ?? null
    })
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f?.type.startsWith('image/')) handleFile(f)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => setIsDragging(false)

  const resetForm = () => {
    setForm({
      programLabel: '',
      title: '',
      descriereScurta: '',
      description: '',
      stiaiCaEnabled: false,
      stiaiCaTitle: '',
      stiaiCaText: '',
      durataProgram: '',
      discountPercent: '',
    })
    handleFile(null)
    setBaseline(null)
    setPhotoPreview(null)
  }

  const loadFormFromProgram = (p: ReducereProgram | ReducereProgramRow | DraftProgram) => {
    setForm({
      programLabel: p.programLabel,
      title: p.title,
      descriereScurta: p.descriereScurta ?? '',
      description: p.description ?? '',
      stiaiCaEnabled: !!p.stiaiCa,
      stiaiCaTitle: p.stiaiCa?.title ?? '',
      stiaiCaText: p.stiaiCa?.text ?? '',
      durataProgram: p.durataProgram ?? '',
      discountPercent: p.discountPercent != null ? String(p.discountPercent) : '',
    })
    setPhotoFile(null)
    setPhotoPreview((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
      return p.photo
    })
  }

  const handleEditClick = (p: ReducereProgramRow | DraftProgram, target: EditingTarget) => {
    if ('isDraft' in p && p.isDraft) {
      setBaseline(null)
      loadFormFromProgram(p)
    } else {
      setBaseline(p as ReducereProgramRow)
      loadFormFromProgram(p)
    }
    setEditingTarget(target)
    setSaveError(null)
  }

  const handleAddNew = () => {
    resetForm()
    setEditingTarget('new')
    setSaveError(null)
  }

  const handleClosePanel = () => {
    setIsClosingPanel(true)
  }

  const handlePanelTransitionEnd = (e: React.TransitionEvent) => {
    if (e.target !== e.currentTarget) return
    if (isClosingPanel) {
      setEditingTarget(null)
      setIsClosingPanel(false)
      resetForm()
    }
  }

  const saveAsDraft = () => {
    const draft: DraftProgram = {
      id: `draft-${Date.now()}`,
      isDraft: true,
      photo: photoPreview ?? '/images/programe%20reduceri/tva-cum-era.jpg',
      programLabel: form.programLabel || '(Fără nume)',
      title: form.title || '',
      descriereScurta: form.descriereScurta || undefined,
      description: form.description || '',
      ctaLabel: 'CREEAZĂ CONT',
      ctaTo: '/login',
      termsLabel: 'Termeni și Condiții Reducere',
      durataProgram: form.durataProgram || undefined,
      discountPercent: form.discountPercent ? Number(form.discountPercent) : undefined,
      stiaiCa: form.stiaiCaEnabled ? { title: form.stiaiCaTitle, text: form.stiaiCaText } : undefined,
    }
    setDrafts((d) => [...d, draft])
    resetForm()
    handleClosePanel()
  }

  const handleCancel = () => {
    setCancelConfirmOpen(true)
  }

  const handleCancelConfirm = (saveDraft: boolean) => {
    setCancelConfirmOpen(false)
    if (saveDraft) saveAsDraft()
    else handleClosePanel()
  }

  const handleDeleteClick = (target: { type: 'program'; id: string } | { type: 'draft'; id: string }) => {
    setDeleteTarget(target)
  }

  const handleDeleteConfirm = async (confirmed: boolean) => {
    if (!deleteTarget || !confirmed) {
      setDeleteTarget(null)
      return
    }
    if (deleteTarget.type === 'draft') {
      setDrafts((d) => d.filter((x) => x.id !== deleteTarget.id))
      setDeleteTarget(null)
      return
    }
    try {
      await deleteAdminReducereProgram(deleteTarget.id)
      await refreshList()
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Eroare la ștergere.')
    }
    setDeleteTarget(null)
  }

  const handleSaveProgram = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setSaveError(null)
    const pctRaw = form.discountPercent.trim()
    let discountPercent: number | null = null
    if (pctRaw !== '') {
      const n = Number(pctRaw)
      if (!Number.isFinite(n) || n < 0 || n > 100) {
        setSaveError('Procentul de reducere trebuie să fie între 0 și 100.')
        return
      }
      discountPercent = Math.round(n)
    }

    let photoUrl = photoPreview?.trim() || ''
    setSaving(true)
    try {
      if (photoFile) {
        const { url } = await uploadAdminFile(photoFile, 'reduceri')
        photoUrl = url
      }
    } catch (err) {
      setSaving(false)
      setSaveError(err instanceof Error ? err.message : 'Eroare la încărcarea imaginii.')
      return
    }

    if (!photoUrl) {
      setSaving(false)
      setSaveError('Adaugă o fotografie (sau încarcă din nou).')
      return
    }

    const stiaiCa =
      form.stiaiCaEnabled && (form.stiaiCaTitle.trim() || form.stiaiCaText.trim())
        ? { title: form.stiaiCaTitle.trim(), text: form.stiaiCaText.trim() }
        : null

    const body: Record<string, unknown> = {
      photo: photoUrl,
      programLabel: form.programLabel.trim(),
      title: form.title.trim(),
      descriereScurta: form.descriereScurta.trim() || null,
      description: form.description.trim(),
      durataProgram: form.durataProgram.trim() || null,
      discountPercent,
      stiaiCa,
      ctaLabel: baseline?.ctaLabel ?? 'CREEAZĂ CONT',
      ctaTo: baseline?.ctaTo ?? '/login',
      termsLabel: baseline?.termsLabel ?? 'Termeni și Condiții Reducere',
      topIcon: baseline?.topIcon ?? null,
    }

    try {
      if (editingTarget === 'new') {
        await createAdminReducereProgram({ ...body, locale: 'ro' })
      } else if (editingTarget?.type === 'draft') {
        await createAdminReducereProgram({ ...body, locale: 'ro' })
        setDrafts((d) => d.filter((x) => x.id !== editingTarget.id))
      } else if (editingTarget?.type === 'program') {
        await updateAdminReducereProgram(editingTarget.id, body)
      } else {
        setSaving(false)
        return
      }
      await refreshList()
      handleClosePanel()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Eroare la salvare.')
    } finally {
      setSaving(false)
    }
  }

  const allPrograms: Array<ReducereProgramRow | DraftProgram> = [...apiPrograms, ...drafts]
  const panelOpen = editingTarget !== null || isClosingPanel

  return (
    <div className={`flex flex-col w-full min-h-0 ${panelOpen ? 'h-[calc(100vh-4rem)] lg:h-screen overflow-hidden' : ''}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white shrink-0">
        <h1 className="text-xl font-bold font-['Inter'] text-black">Programe Reduceri</h1>
        <div className="flex items-center gap-2">
          {listError && (
            <button
              type="button"
              onClick={() => {
                setListLoading(true)
                refreshList().catch((e) => setListError(e instanceof Error ? e.message : 'Eroare')).finally(() => setListLoading(false))
              }}
              className="text-sm text-red-600 underline font-['Inter']"
            >
              Reîncearcă încărcarea
            </button>
          )}
          {!panelOpen && (
            <button
              type="button"
              onClick={handleAddNew}
              className="h-9 px-5 bg-slate-900 text-white rounded-lg text-sm font-semibold font-['Inter'] hover:bg-slate-700 transition-colors"
            >
              + Adaugă program nou
            </button>
          )}
        </div>
      </div>

      {listError && (
        <div className="mx-5 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 font-['Inter']">
          {listError} Asigură-te că API-ul rulează și că există rânduri în baza de date (ex.{' '}
          <code className="text-xs">npx prisma db seed</code> în apps/api).
        </div>
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className={`w-1/2 min-w-0 shrink-0 p-5 overflow-y-auto ${panelOpen ? 'overflow-hidden' : ''}`}>
          {listLoading ? (
            <p className="text-sm text-gray-500 font-['Inter']">Se încarcă programele…</p>
          ) : apiPrograms.length === 0 && drafts.length === 0 ? (
            <p className="text-sm text-gray-600 font-['Inter']">Niciun program în baza de date. Folosește „Adaugă program nou” sau rulează seed-ul.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
              {allPrograms.map((p) => {
                const isDraft = 'isDraft' in p && p.isDraft
                const deleteTargetItem = isDraft
                  ? { type: 'draft' as const, id: (p as DraftProgram).id }
                  : { type: 'program' as const, id: (p as ReducereProgramRow).id }
                const editTarget: EditingTarget = isDraft
                  ? { type: 'draft', id: (p as DraftProgram).id }
                  : { type: 'program', id: (p as ReducereProgramRow).id }
                const programName = p.programLabel.replace(/^PROGRAMUL\s*/i, '')
                return (
                  <div key={isDraft ? (p as DraftProgram).id : (p as ReducereProgramRow).id} className="flex flex-col h-full">
                    <div className="flex flex-col flex-1 bg-neutral-100 rounded-[10px] overflow-hidden transition-shadow duration-300 hover:shadow-md">
                      <div className="relative h-48 flex-shrink-0">
                        <div className="absolute inset-0 bg-zinc-300" />
                        <img src={p.photo} alt={programName} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40" />
                        <img
                          src="/images/programe reduceri/baterino-white-logo.png"
                          alt="Baterino"
                          className="absolute top-3 right-3 h-5 w-auto object-contain"
                        />
                        {p.topIcon && <SmileyPopover icon={p.topIcon} info={p.stiaiCa} />}
                        {isDraft && (
                          <span className="absolute top-3 left-3 text-[10px] font-bold font-['Inter'] text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded">
                            DRAFT
                          </span>
                        )}
                        <div className="absolute left-5 bottom-[46px] text-white text-base font-medium font-['Nunito_Sans']">
                          PROGRAMUL
                        </div>
                        <div className="absolute left-5 right-5 bottom-4 text-white text-xl font-bold font-['Inter'] leading-8">
                          {programName}
                        </div>
                      </div>
                      <div className="flex flex-col px-[27px] pt-4 pb-6">
                        <h3 className="text-black text-xl font-bold font-['Inter'] leading-8 mb-3">{p.title}</h3>
                        <div className="text-gray-700 text-base font-medium font-['Nunito_Sans'] leading-6">
                          {p.description.split('\n\n').map((para, i) => (
                            <p key={i} className={i > 0 ? 'mt-4' : ''}>
                              {renderBold(para)}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-5">
                      <button
                        type="button"
                        onClick={() => handleEditClick(p as ReducereProgramRow | DraftProgram, editTarget)}
                        className="flex-1 h-12 rounded-[10px] border border-zinc-300 text-base font-medium font-['Inter'] text-gray-700 hover:bg-zinc-50 transition-colors"
                      >
                        Editează
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(deleteTargetItem)}
                        className="flex-1 h-12 rounded-[10px] border border-red-200 text-base font-medium font-['Inter'] text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Șterge
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="w-1/2 shrink-0 overflow-hidden border-l border-gray-200 bg-white overflow-y-auto">
          <div
            className={`w-full min-h-full p-6 sm:p-8 shadow-lg transition-transform duration-300 ease-out ${
              isClosingPanel ? '-translate-x-full' : editingTarget ? 'translate-x-0' : '-translate-x-full'
            }`}
            onTransitionEnd={handlePanelTransitionEnd}
          >
            <form className="flex flex-col gap-3" onSubmit={handleSaveProgram}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold font-['Inter'] text-black">
                  {editingTarget === 'new' ? 'Adaugă program nou' : 'Editează program'}
                </h2>
                <button
                  type="button"
                  onClick={handleClosePanel}
                  className="text-gray-500 hover:text-slate-900 p-1"
                  aria-label="Închide"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {saveError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 font-['Inter']">
                  {saveError}
                </div>
              )}

              <div>
                <label className={labelClass}>Foto</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragging ? 'border-slate-500 bg-slate-50/50' : 'border-zinc-300 hover:border-zinc-400'
                  }`}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                  />
                  {photoPreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={photoPreview} alt="" className="max-h-24 object-contain rounded" />
                      <span className="text-xs text-gray-500">{photoFile?.name ?? 'Imagine curentă'}</span>
                      {photoFile ? (
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation()
                            clearUploadedPhotoKeepBaseline()
                          }}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Renunță la imaginea nouă
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Trage sau click pentru a încărca imagine</p>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>Procent reducere</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.discountPercent}
                  onChange={(e) => update('discountPercent', e.target.value)}
                  placeholder="12"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Nume program</label>
                <input
                  type="text"
                  value={form.programLabel}
                  onChange={(e) => update('programLabel', e.target.value)}
                  placeholder="PROGRAMUL TVA-UL DE 9%"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Titlu (lângă foto)</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder="12% REDUCERE LA ORICE PRODUS"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Descriere scurtă (pe cardul de pe home)</label>
                <input
                  type="text"
                  value={form.descriereScurta}
                  onChange={(e) => update('descriereScurta', e.target.value)}
                  placeholder="Scurtă, pentru cardul de pe pagina principală..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Descriere lungă (**text** = bold)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Descriere lungă pentru pagina Reduceri..."
                  rows={3}
                  className={`${inputClass} h-auto py-2 min-h-[72px]`}
                />
              </div>

              <div>
                <label className={labelClass}>Durată program</label>
                <input
                  type="text"
                  value={form.durataProgram}
                  onChange={(e) => update('durataProgram', e.target.value)}
                  placeholder="Permanent"
                  className={inputClass}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="stiaiCa"
                  checked={form.stiaiCaEnabled}
                  onChange={(e) => update('stiaiCaEnabled', e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-slate-600 focus:ring-slate-500"
                />
                <label htmlFor="stiaiCa" className="text-sm font-medium font-['Inter'] text-gray-700 cursor-pointer">
                  Știai că?
                </label>
              </div>

              {form.stiaiCaEnabled && (
                <div className="flex flex-col gap-3 pl-6 border-l-2 border-zinc-200">
                  <div>
                    <label className={labelClass}>Titlu</label>
                    <input
                      type="text"
                      value={form.stiaiCaTitle}
                      onChange={(e) => update('stiaiCaTitle', e.target.value)}
                      placeholder="Știai că?"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Text</label>
                    <textarea
                      value={form.stiaiCaText}
                      onChange={(e) => update('stiaiCaText', e.target.value)}
                      placeholder="Text informativ..."
                      rows={2}
                      className={`${inputClass} h-auto py-2 min-h-[56px]`}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="h-9 px-6 bg-slate-900 text-white rounded-lg text-sm font-semibold font-['Inter'] hover:bg-slate-700 transition-colors disabled:opacity-60"
                >
                  {saving ? 'Se salvează…' : 'Salvează program'}
                </button>
                <button
                  type="button"
                  onClick={saveAsDraft}
                  disabled={saving}
                  className="h-9 px-6 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-sm font-medium font-['Inter'] hover:bg-amber-100 transition-colors disabled:opacity-60"
                >
                  Draft
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="h-9 px-6 rounded-lg border border-zinc-200 text-sm font-medium font-['Inter'] text-gray-700 hover:bg-zinc-50 transition-colors disabled:opacity-60"
                >
                  Anulează
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-['Inter'] text-gray-800 mb-4">Ești sigur că vrei să ștergi acest program?</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void handleDeleteConfirm(true)}
                className="flex-1 h-9 rounded-lg bg-red-600 text-white text-sm font-medium font-['Inter'] hover:bg-red-700 transition-colors"
              >
                Da, șterge
              </button>
              <button
                type="button"
                onClick={() => handleDeleteConfirm(false)}
                className="flex-1 h-9 rounded-lg border border-zinc-200 text-sm font-medium font-['Inter'] text-gray-700 hover:bg-zinc-50 transition-colors"
              >
                Nu
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => setCancelConfirmOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-['Inter'] text-gray-800 mb-4">Salvezi programul ca draft înainte de a închide?</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleCancelConfirm(true)}
                className="flex-1 h-9 rounded-lg bg-amber-500 text-white text-sm font-medium font-['Inter'] hover:bg-amber-600 transition-colors"
              >
                Da, salvează ca draft
              </button>
              <button
                type="button"
                onClick={() => handleCancelConfirm(false)}
                className="flex-1 h-9 rounded-lg border border-zinc-200 text-sm font-medium font-['Inter'] text-gray-700 hover:bg-zinc-50 transition-colors"
              >
                Nu, renunță
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
