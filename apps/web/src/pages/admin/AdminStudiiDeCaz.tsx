import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createAdminCaseStudy,
  deleteAdminCaseStudy,
  getAdminCaseStudies,
  getAuthToken,
  updateAdminCaseStudy,
  uploadCaseStudyImage,
  type CaseStudyRow,
  type CaseStudySpec,
} from '../../lib/api'
import CaseStudyCard from '../../components/studii/CaseStudyCard'

type LocaleCode = 'ro' | 'en' | 'zh'

type FormState = {
  slug: string
  category: string
  title: string
  location: string
  images: string[]
  imageAlt: string
  specs: CaseStudySpec[]
  tagsText: string
  isActive: boolean
}

const LOCALES: { id: LocaleCode; label: string }[] = [
  { id: 'ro', label: 'RO' },
  { id: 'en', label: 'EN' },
  { id: 'zh', label: 'ZH' },
]

const CATEGORY_OPTIONS = ['INDUSTRIAL', 'REZIDENTIAL', 'MEDICAL', 'MARITIM', 'RESIDENTIAL']
const MAX_GALLERY_IMAGES = 6

function slugifyClient(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function isJpegFile(file: File): boolean {
  const mt = file.type.toLowerCase()
  const name = file.name.toLowerCase()
  return mt === 'image/jpeg' || mt === 'image/jpg' || name.endsWith('.jpg') || name.endsWith('.jpeg')
}

const labelClass = "block text-xs font-medium font-['Inter'] text-gray-700 mb-0.5"
const inputClass =
  "w-full h-9 px-2.5 rounded-lg border border-zinc-200 text-sm font-['Inter'] focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"

function emptySpecs(): CaseStudySpec[] {
  return [
    { label: '', value: '', highlight: true },
    { label: '', value: '', highlight: false },
    { label: '', value: '', highlight: false },
    { label: '', value: '', highlight: false },
  ]
}

function emptyForm(): FormState {
  return {
    slug: '',
    category: 'INDUSTRIAL',
    title: '',
    location: '',
    images: [],
    imageAlt: '',
    specs: emptySpecs(),
    tagsText: '',
    isActive: true,
  }
}

function rowToForm(row: CaseStudyRow): FormState {
  const specs = emptySpecs()
  row.specs.slice(0, 4).forEach((s, i) => {
    specs[i] = { label: s.label, value: s.value, highlight: s.highlight === true }
  })
  const images =
    row.images?.length > 0 ? [...row.images] : row.image ? [row.image] : []
  return {
    slug: row.slug,
    category: row.category,
    title: row.title,
    location: row.location,
    images,
    imageAlt: row.imageAlt,
    specs,
    tagsText: row.tags.join('\n'),
    isActive: row.isActive !== false,
  }
}

function formToPayload(form: FormState, locale: LocaleCode) {
  const specs = form.specs
    .map((s) => ({
      label: s.label.trim(),
      value: s.value.trim(),
      highlight: s.highlight === true,
    }))
    .filter((s) => s.label || s.value)
  const tags = form.tagsText
    .split(/\r?\n|,/)
    .map((t) => t.trim())
    .filter(Boolean)
  const images = form.images.map((u) => u.trim()).filter(Boolean).slice(0, MAX_GALLERY_IMAGES)

  return {
    locale,
    slug: form.slug.trim(),
    category: form.category.trim(),
    title: form.title.trim(),
    location: form.location.trim(),
    images,
    image: images[0] || '',
    imageAlt: form.imageAlt.trim() || form.title.trim(),
    specs,
    tags,
    isActive: form.isActive,
  }
}

type PanelMode = null | { type: 'new' } | { type: 'edit'; id: string }

export default function AdminStudiiDeCaz() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<FormState>(emptyForm())

  const [locale, setLocale] = useState<LocaleCode>('ro')
  const [rows, setRows] = useState<CaseStudyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)

  const [panel, setPanel] = useState<PanelMode>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [deleteTarget, setDeleteTarget] = useState<CaseStudyRow | null>(null)

  const patchForm = useCallback((patch: Partial<FormState> | ((prev: FormState) => Partial<FormState>)) => {
    setForm((prev) => {
      const delta = typeof patch === 'function' ? patch(prev) : patch
      const next = { ...prev, ...delta }
      formRef.current = next
      return next
    })
  }, [])

  useEffect(() => {
    formRef.current = form
  }, [form])

  const refreshList = useCallback(async () => {
    const data = await getAdminCaseStudies(locale)
    setRows(data)
    setListError(null)
  }, [locale])

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/admin/login', { replace: true })
      return
    }
    setLoading(true)
    getAdminCaseStudies(locale)
      .then((data) => {
        setRows(data)
        setListError(null)
      })
      .catch((e) => setListError(e instanceof Error ? e.message : 'Eroare la încărcare.'))
      .finally(() => setLoading(false))
  }, [locale, navigate])

  const openNew = () => {
    const next = emptyForm()
    formRef.current = next
    setForm(next)
    setSaveError(null)
    setPanel({ type: 'new' })
  }

  const openEdit = (row: CaseStudyRow) => {
    const next = rowToForm(row)
    formRef.current = next
    setForm(next)
    setSaveError(null)
    setPanel({ type: 'edit', id: row.id })
  }

  const closePanel = () => {
    setPanel(null)
    setSaveError(null)
    const next = emptyForm()
    formRef.current = next
    setForm(next)
  }

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    patchForm({ [key]: value } as Partial<FormState>)
  }

  const updateSpec = (index: number, patch: Partial<CaseStudySpec>) => {
    patchForm((f) => ({
      specs: f.specs.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }))
  }

  const resolveCaseSlugFrom = (state: FormState) => {
    const fromSlug = slugifyClient(state.slug)
    if (fromSlug) return fromSlug
    return slugifyClient(state.title)
  }

  const resolveCaseSlug = useCallback(() => resolveCaseSlugFrom(formRef.current), [])

  const onGallerySelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    e.target.value = ''
    if (!fileList?.length) return

    const currentForm = formRef.current
    const caseSlug = resolveCaseSlugFrom(currentForm)
    if (!caseSlug) {
      setSaveError('Completează slug-ul sau titlul înainte de upload.')
      return
    }

    const existingImages = currentForm.images
    const remaining = MAX_GALLERY_IMAGES - existingImages.length
    if (remaining <= 0) {
      setSaveError(`Maxim ${MAX_GALLERY_IMAGES} fotografii JPG.`)
      return
    }

    const files = Array.from(fileList).slice(0, remaining)
    const invalid = files.find((f) => !isJpegFile(f))
    if (invalid) {
      setSaveError('Doar fișiere JPG/JPEG sunt acceptate.')
      return
    }

    setUploading(true)
    setSaveError(null)
    setUploadProgress(null)
    const uploaded: string[] = []
    let nextIndex = existingImages.length + 1

    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Se încarcă ${i + 1}/${files.length}…`)
        const { url } = await uploadCaseStudyImage(files[i], caseSlug, nextIndex)
        uploaded.push(url)
        nextIndex += 1
      }
      patchForm((f) => ({
        images: [...f.images, ...uploaded].slice(0, MAX_GALLERY_IMAGES),
        ...(!f.slug.trim() && caseSlug ? { slug: caseSlug } : {}),
      }))
    } catch (err) {
      if (uploaded.length > 0) {
        patchForm((f) => ({
          images: [...f.images, ...uploaded].slice(0, MAX_GALLERY_IMAGES),
        }))
      }
      setSaveError(err instanceof Error ? err.message : 'Eroare la upload imagine.')
    } finally {
      setUploading(false)
      setUploadProgress(null)
    }
  }

  const removeGalleryImage = (index: number) => {
    patchForm((f) => ({
      images: f.images.filter((_, i) => i !== index),
    }))
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setSaveError(null)
    if (!form.title.trim()) {
      setSaveError('Titlul este obligatoriu.')
      return
    }
    const payload = formToPayload(form, locale)
    setSaving(true)
    try {
      if (panel?.type === 'new') {
        await createAdminCaseStudy(payload)
      } else if (panel?.type === 'edit') {
        await updateAdminCaseStudy(panel.id, payload)
      } else {
        return
      }
      await refreshList()
      closePanel()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Eroare la salvare.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteAdminCaseStudy(deleteTarget.id)
      if (panel?.type === 'edit' && panel.id === deleteTarget.id) closePanel()
      await refreshList()
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Eroare la ștergere.')
    } finally {
      setDeleteTarget(null)
    }
  }

  const previewItem = {
    category: form.category || 'INDUSTRIAL',
    title: form.title || 'Titlu studiu de caz',
    location: form.location || 'Locație',
    image: form.images[0] || '/images/divizii/industrial/centre-de-date.jpg',
    imageAlt: form.imageAlt || form.title,
    imageCount: form.images.length,
    specs: form.specs.filter((s) => s.label.trim() || s.value.trim()),
    tags: form.tagsText
      .split(/\r?\n|,/)
      .map((t) => t.trim())
      .filter(Boolean),
  }

  const galleryFull = form.images.length >= MAX_GALLERY_IMAGES

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Studii de caz</h1>
          <p className="text-gray-500 text-sm font-['Inter'] m-0">
            Adaugă, editează sau șterge studii de caz afișate pe pagina publică{' '}
            <span className="font-medium text-slate-700">/studii-de-caz</span>.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="shrink-0 rounded-[10px] bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white font-['Inter'] hover:bg-slate-700 transition-colors"
        >
          + Adaugă studiu de caz
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        {LOCALES.map((loc) => (
          <button
            key={loc.id}
            type="button"
            onClick={() => setLocale(loc.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold font-['Inter'] transition-colors ${
              locale === loc.id
                ? 'bg-slate-900 text-white'
                : 'bg-neutral-100 text-slate-700 hover:bg-neutral-200'
            }`}
          >
            {loc.label}
          </button>
        ))}
      </div>

      {listError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-['Inter']">
          {listError}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm font-['Inter']">Se încarcă…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-gray-500 text-sm font-['Inter'] mb-4">
            Nu există studii de caz pentru limba {locale.toUpperCase()}.
          </p>
          <button
            type="button"
            onClick={openNew}
            className="rounded-[10px] border border-slate-300 px-4 py-2 text-sm font-semibold font-['Inter'] hover:bg-neutral-50"
          >
            Adaugă primul studiu de caz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <div key={row.id} className="flex flex-col gap-3">
              <CaseStudyCard
                category={row.category}
                title={row.title}
                location={row.location}
                image={row.image}
                imageAlt={row.imageAlt}
                imageCount={row.imageCount}
                specs={row.specs}
                tags={row.tags}
                galleryLabel="Galerie"
              />
              <div className="flex flex-wrap items-center gap-2 px-1">
                {!row.isActive ? (
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                    Ascuns
                  </span>
                ) : null}
                <span className="text-xs text-neutral-500 font-['Inter'] truncate flex-1">{row.slug}</span>
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold font-['Inter'] hover:bg-neutral-50"
                >
                  Editează
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(row)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 font-['Inter'] hover:bg-red-50"
                >
                  Șterge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {panel ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={closePanel} role="presentation">
          <div
            className="flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-study-panel-title"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 id="case-study-panel-title" className="text-lg font-bold font-['Inter'] text-slate-900">
                {panel.type === 'new' ? 'Studiu de caz nou' : 'Editează studiu de caz'}
              </h2>
              <button
                type="button"
                onClick={closePanel}
                className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
                aria-label="Închide"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {saveError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 font-['Inter']">
                    {saveError}
                  </div>
                ) : null}

                <div className="rounded-xl border border-gray-200 bg-neutral-50 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 font-['Inter']">
                    Previzualizare
                  </p>
                  <div className="pointer-events-none max-w-[280px] mx-auto scale-[0.92] origin-top">
                    <CaseStudyCard {...previewItem} galleryLabel="Galerie" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className={labelClass}>Slug (URL)</label>
                    <input
                      className={inputClass}
                      value={form.slug}
                      onChange={(e) => updateForm('slug', e.target.value)}
                      placeholder="ex. 3-mwh-ups-skovde"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className={labelClass}>Categorie</label>
                    <select
                      className={inputClass}
                      value={form.category}
                      onChange={(e) => updateForm('category', e.target.value)}
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Titlu</label>
                  <input
                    className={inputClass}
                    value={form.title}
                    onChange={(e) => updateForm('title', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Locație</label>
                  <input
                    className={inputClass}
                    value={form.location}
                    onChange={(e) => updateForm('location', e.target.value)}
                    placeholder="ex. Skövde, Suedia"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label className={`${labelClass} mb-0`}>
                      Fotografii galerie (JPG, max {MAX_GALLERY_IMAGES})
                    </label>
                    <span className="text-xs text-neutral-500 font-['Inter'] tabular-nums">
                      {form.images.length}/{MAX_GALLERY_IMAGES}
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-neutral-500 font-['Inter']">
                    Fișierele se salvează în R2:{' '}
                    <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">
                      study-cases/{resolveCaseSlug() || 'slug'}/…
                    </code>
                    . Prima imagine apare pe card.
                  </p>

                  {form.images.length > 0 ? (
                    <ul className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3 m-0 p-0 list-none">
                      {form.images.map((url, index) => (
                        <li key={`${url}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                          <img src={url} alt="" className="h-full w-full object-cover" />
                          {index === 0 ? (
                            <span className="absolute left-1.5 top-1.5 rounded bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                              Copertă
                            </span>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80"
                            aria-label="Elimină fotografia"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mb-3 flex aspect-[16/10] items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-xs text-neutral-500 font-['Inter']">
                      Nicio fotografie încă
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={uploading || galleryFull}
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold font-['Inter'] hover:bg-neutral-50 disabled:opacity-50"
                    >
                      {uploading ? 'Se încarcă…' : galleryFull ? 'Galerie completă' : '+ Adaugă JPG'}
                    </button>
                    {uploadProgress ? (
                      <span className="text-xs text-neutral-500 font-['Inter']">{uploadProgress}</span>
                    ) : null}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,.jpg,.jpeg"
                    multiple
                    className="hidden"
                    onChange={onGallerySelected}
                  />
                </div>

                <div>
                  <label className={labelClass}>Text alternativ imagine (copertă)</label>
                  <input
                    className={inputClass}
                    value={form.imageAlt}
                    onChange={(e) => updateForm('imageAlt', e.target.value)}
                  />
                </div>

                <fieldset className="space-y-3 rounded-xl border border-gray-200 p-3">
                  <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-neutral-600 font-['Inter']">
                    Specificații (grid 2×2)
                  </legend>
                  {form.specs.map((spec, i) => (
                    <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                      <div>
                        <label className={labelClass}>Etichetă {i + 1}</label>
                        <input
                          className={inputClass}
                          value={spec.label}
                          onChange={(e) => updateSpec(i, { label: e.target.value })}
                          placeholder="ex. Capacitate"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Valoare {i + 1}</label>
                        <input
                          className={inputClass}
                          value={spec.value}
                          onChange={(e) => updateSpec(i, { value: e.target.value })}
                          placeholder="ex. 3 MWh"
                        />
                      </div>
                      <label className="flex items-center gap-2 pb-2 text-xs font-medium text-slate-700 font-['Inter'] sm:pb-2">
                        <input
                          type="checkbox"
                          checked={spec.highlight === true}
                          onChange={(e) => updateSpec(i, { highlight: e.target.checked })}
                        />
                        Evidențiat
                      </label>
                    </div>
                  ))}
                </fieldset>

                <div>
                  <label className={labelClass}>Etichete (câte una pe linie)</label>
                  <textarea
                    className={`${inputClass} min-h-[88px] h-auto py-2`}
                    value={form.tagsText}
                    onChange={(e) => updateForm('tagsText', e.target.value)}
                    placeholder={'UPS Backup\nC&I\nSolar+Storage'}
                  />
                </div>

                <label className="flex items-center gap-2 text-sm font-medium text-slate-800 font-['Inter']">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => updateForm('isActive', e.target.checked)}
                  />
                  Publicat pe site
                </label>
              </div>

              <div className="flex shrink-0 gap-3 border-t border-gray-200 px-5 py-4">
                <button
                  type="button"
                  onClick={closePanel}
                  className="flex-1 rounded-[10px] border border-gray-300 px-4 py-2.5 text-sm font-semibold font-['Inter'] hover:bg-neutral-50"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-[10px] bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white font-['Inter'] hover:bg-slate-700 disabled:opacity-50"
                >
                  {saving ? 'Se salvează…' : 'Salvează'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold font-['Inter'] text-slate-900 mb-2">Ștergi studiul de caz?</h3>
            <p className="text-sm text-neutral-600 font-['Inter'] mb-6">
              „{deleteTarget.title}” va fi șters definitiv din limba {locale.toUpperCase()}.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold font-['Inter']"
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white font-['Inter'] hover:bg-red-700"
              >
                Șterge
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
