import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import RichTextEditor from '../../components/RichTextEditor'
import {
  createAdminBlogPost,
  deleteAdminBlogPost,
  getAdminBlogPostById,
  getAdminBlogPosts,
  getAuthToken,
  isAuthTokenExpired,
  updateAdminBlogPost,
  uploadBlogImage,
  type BlogPostRow,
} from '../../lib/api'

type LocaleCode = 'ro' | 'en'

type FormState = {
  slug: string
  status: 'draft' | 'published'
  title: string
  excerpt: string
  body: string
  coverImage: string
  coverImageAlt: string
  category: string
  tagsText: string
  author: string
  publishedAt: string
  seoTitle: string
  seoDescription: string
}

const LOCALES: { id: LocaleCode; label: string }[] = [
  { id: 'ro', label: 'RO' },
  { id: 'en', label: 'EN' },
]

const CATEGORY_OPTIONS = ['', 'Energie', 'Baterii', 'Solar', 'Industrial', 'Rezidential', 'Medical', 'Maritim', 'Noutăți', 'Sfaturi']

function slugify(raw: string): string {
  return raw.trim().toLowerCase()
    .replace(/ș/g, 's').replace(/ț/g, 't').replace(/ă/g, 'a').replace(/â/g, 'a').replace(/î/g, 'i')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

const labelClass = "block text-xs font-medium font-['Inter'] text-gray-700 mb-0.5"
const inputClass = "w-full h-9 px-2.5 rounded-lg border border-zinc-200 text-sm font-['Inter'] focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
const textareaClass = "w-full px-2.5 py-2 rounded-lg border border-zinc-200 text-sm font-['Inter'] focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-y"

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

function emptyForm(): FormState {
  return { slug: '', status: 'draft', title: '', excerpt: '', body: '', coverImage: '', coverImageAlt: '', category: '', tagsText: '', author: 'Baterino Romania', publishedAt: todayDateString(), seoTitle: '', seoDescription: '' }
}

function rowToForm(row: BlogPostRow): FormState {
  return {
    slug: row.slug,
    status: row.status === 'published' ? 'published' : 'draft',
    title: row.title,
    excerpt: row.excerpt || '',
    body: row.body || '',
    coverImage: row.coverImage || '',
    coverImageAlt: row.coverImageAlt || '',
    category: row.category || '',
    tagsText: (row.tags || []).join('\n'),
    author: row.author || 'Baterino Romania',
    publishedAt: row.publishedAt ? row.publishedAt.slice(0, 10) : todayDateString(),
    seoTitle: row.seoTitle || '',
    seoDescription: row.seoDescription || '',
  }
}

type PanelMode = null | { type: 'new' } | { type: 'edit'; id: string }

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminBlog() {
  const navigate = useNavigate()
  const coverInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<FormState>(emptyForm())
  const backdropMouseDownOnSelf = useRef(false)

  const [locale, setLocale] = useState<LocaleCode>('ro')
  const [rows, setRows] = useState<BlogPostRow[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [panel, setPanel] = useState<PanelMode>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [deleteTarget, setDeleteTarget] = useState<BlogPostRow | null>(null)
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content')

  const patchForm = useCallback((patch: Partial<FormState> | ((p: FormState) => Partial<FormState>)) => {
    setForm((prev) => {
      const delta = typeof patch === 'function' ? patch(prev) : patch
      const next = { ...prev, ...delta }
      formRef.current = next
      return next
    })
  }, [])

  useEffect(() => { formRef.current = form }, [form])

  const refreshList = useCallback(async () => {
    const data = await getAdminBlogPosts(locale)
    setRows(data)
    setListError(null)
  }, [locale])

  useEffect(() => {
    if (!getAuthToken() || isAuthTokenExpired()) { navigate('/admin/login', { replace: true }); return }
    setLoading(true)
    getAdminBlogPosts(locale)
      .then((data) => { setRows(data); setListError(null) })
      .catch((e) => {
        if (e instanceof Error && e.message.includes('401')) { navigate('/admin/login', { replace: true }); return }
        setListError(e instanceof Error ? e.message : 'Eroare la încărcare.')
      })
      .finally(() => setLoading(false))
  }, [locale, navigate])

  const openNew = () => {
    const next = emptyForm()
    formRef.current = next
    setForm(next)
    setSaveError(null)
    setActiveTab('content')
    setPanel({ type: 'new' })
  }

  const openEdit = async (row: BlogPostRow) => {
    setSaveError(null)
    setActiveTab('content')
    const full = await getAdminBlogPostById(row.id).catch(() => null)
    const next = rowToForm(full ?? row)
    formRef.current = next
    setForm(next)
    setPanel({ type: 'edit', id: row.id })
  }

  const closePanel = () => {
    setPanel(null)
    setSaveError(null)
    const next = emptyForm()
    formRef.current = next
    setForm(next)
  }

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => patchForm({ [key]: value })

  const resolveSlug = () => {
    const f = formRef.current
    return slugify(f.slug) || slugify(f.title)
  }

  const onCoverSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const postSlug = resolveSlug()
    if (!postSlug) { setSaveError('Completează slug-ul sau titlul înainte de upload.'); return }
    setUploading(true)
    setSaveError(null)
    try {
      const { url } = await uploadBlogImage(file, postSlug, 1)
      patchForm({ coverImage: url, ...(!formRef.current.slug.trim() ? { slug: postSlug } : {}) })
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Eroare la upload.')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setSaveError(null)
    if (!form.title.trim()) { setSaveError('Titlul este obligatoriu.'); return }
    const tags = form.tagsText.split(/\r?\n|,/).map((t) => t.trim()).filter(Boolean)
    const slug = slugify(form.slug) || slugify(form.title)
    const payload = {
      locale,
      slug,
      status: form.status,
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      body: form.body.trim(),
      coverImage: form.coverImage.trim(),
      coverImageAlt: form.coverImageAlt.trim() || form.title.trim(),
      category: form.category.trim(),
      tags,
      author: form.author.trim() || 'Baterino Romania',
      publishedAt: form.publishedAt || null,
      seoTitle: form.seoTitle.trim(),
      seoDescription: form.seoDescription.trim(),
    }
    setSaving(true)
    try {
      if (panel?.type === 'new') {
        await createAdminBlogPost(payload)
      } else if (panel?.type === 'edit') {
        await updateAdminBlogPost(panel.id, payload)
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
      await deleteAdminBlogPost(deleteTarget.id)
      if (panel?.type === 'edit' && panel.id === deleteTarget.id) closePanel()
      await refreshList()
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Eroare la ștergere.')
    } finally {
      setDeleteTarget(null)
    }
  }

  const togglePublish = async (row: BlogPostRow) => {
    try {
      await updateAdminBlogPost(row.id, { status: row.status === 'published' ? 'draft' : 'published' })
      await refreshList()
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Eroare.')
    }
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Articole blog</h1>
          <p className="text-gray-500 text-sm font-['Inter'] m-0">
            Publică, editează sau șterge articole de pe{' '}
            <span className="font-medium text-slate-700">/blog</span>.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="shrink-0 rounded-[10px] bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white font-['Inter'] hover:bg-slate-700 transition-colors"
        >
          + Articol nou
        </button>
      </div>

      {/* Locale tabs */}
      <div className="mb-6 flex gap-2">
        {LOCALES.map((loc) => (
          <button
            key={loc.id}
            type="button"
            onClick={() => setLocale(loc.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold font-['Inter'] transition-colors ${
              locale === loc.id ? 'bg-slate-900 text-white' : 'bg-neutral-100 text-slate-700 hover:bg-neutral-200'
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
          <p className="text-gray-500 text-sm font-['Inter'] mb-4">Nu există articole pentru {locale.toUpperCase()}.</p>
          <button type="button" onClick={openNew} className="rounded-[10px] border border-slate-300 px-4 py-2 text-sm font-semibold font-['Inter'] hover:bg-neutral-50">
            Adaugă primul articol
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-3 rounded-xl bg-white border border-gray-100 p-3 sm:p-4 hover:shadow-sm transition-shadow">
              {/* Cover thumbnail */}
              <div className="w-16 h-12 sm:w-20 sm:h-14 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100">
                {row.coverImage ? (
                  <img src={row.coverImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold font-['Inter'] text-slate-900 truncate">{row.title}</p>
                <p className="text-xs text-gray-400 font-['Inter'] truncate mt-0.5">/{row.slug} · {formatDate(row.publishedAt || row.createdAt)}</p>
              </div>

              {/* Status badge + actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`hidden sm:inline rounded-md px-2.5 py-1 text-xs font-semibold font-['Inter'] ${
                  row.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {row.status === 'published' ? 'Publicat' : 'Draft'}
                </span>
                <button
                  type="button"
                  onClick={() => togglePublish(row)}
                  title={row.status === 'published' ? 'Trece în draft' : 'Publică'}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold font-['Inter'] hover:bg-neutral-50"
                >
                  {row.status === 'published' ? 'Draft' : 'Publică'}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold font-['Inter'] hover:bg-neutral-50"
                >
                  Editează
                </button>
                <a
                  href={`/blog/${row.slug}${row.status !== 'published' ? `?preview=1&id=${row.id}` : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold font-['Inter'] hover:bg-neutral-50"
                >
                  Previzualizează
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(row)}
                  className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 font-['Inter'] hover:bg-red-50"
                >
                  Șterge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / New panel */}
      {panel ? (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40"
          role="presentation"
          onMouseDown={(e) => { backdropMouseDownOnSelf.current = e.target === e.currentTarget }}
          onMouseUp={(e) => { if (backdropMouseDownOnSelf.current && e.target === e.currentTarget) closePanel() }}
        >
          <div
            className="flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="blog-panel-title"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 id="blog-panel-title" className="text-lg font-bold font-['Inter'] text-slate-900">
                {panel.type === 'new' ? 'Articol nou' : 'Editează articol'}
              </h2>
              <button type="button" onClick={closePanel} className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100" aria-label="Închide">✕</button>
            </div>

            {/* Tabs */}
            <div className="flex shrink-0 border-b border-gray-200 px-5">
              {(['content', 'seo'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-1 mr-6 text-sm font-semibold font-['Inter'] border-b-2 transition-colors ${
                    activeTab === tab ? 'border-slate-900 text-slate-900' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab === 'content' ? 'Conținut' : 'SEO'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {saveError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 font-['Inter']">{saveError}</div>
                ) : null}

                {activeTab === 'content' ? (
                  <>
                    {/* Status */}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 font-['Inter'] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.status === 'published'}
                          onChange={(e) => update('status', e.target.checked ? 'published' : 'draft')}
                          className="w-4 h-4 rounded"
                        />
                        Publicat
                      </label>
                      <span className={`rounded-md px-2.5 py-1 text-xs font-semibold font-['Inter'] ${
                        form.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {form.status === 'published' ? 'Publicat' : 'Draft'}
                      </span>
                    </div>

                    {/* Slug + Category */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Slug (URL)</label>
                        <input className={inputClass} value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="ex. ghid-baterii-solar" />
                      </div>
                      <div>
                        <label className={labelClass}>Categorie</label>
                        <select className={inputClass} value={form.category} onChange={(e) => update('category', e.target.value)}>
                          {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c || '— fără categorie —'}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className={labelClass}>Titlu *</label>
                      <input className={inputClass} value={form.title} onChange={(e) => update('title', e.target.value)} required />
                    </div>

                    {/* Author + Date */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Autor</label>
                        <input className={inputClass} value={form.author} onChange={(e) => update('author', e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Data publicării</label>
                        <input type="date" className={inputClass} value={form.publishedAt} onChange={(e) => update('publishedAt', e.target.value)} />
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className={labelClass}>Rezumat (excerpt)</label>
                      <textarea className={`${textareaClass} min-h-[72px]`} value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} placeholder="Scurt rezumat afișat în listing și în meta description dacă nu ai SEO description setat." />
                    </div>

                    {/* Cover image */}
                    <div>
                      <label className={labelClass}>Imagine copertă</label>
                      {form.coverImage ? (
                        <div className="relative mb-2 aspect-[16/9] w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                          <img src={form.coverImage} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => patchForm({ coverImage: '' })}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80"
                          >✕</button>
                        </div>
                      ) : (
                        <div className="mb-2 flex aspect-[16/9] w-full items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-xs text-neutral-400 font-['Inter']">
                          Nicio imagine
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={uploading}
                          onClick={() => coverInputRef.current?.click()}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold font-['Inter'] hover:bg-neutral-50 disabled:opacity-50"
                        >
                          {uploading ? 'Se încarcă…' : '↑ Încarcă imagine'}
                        </button>
                        <input
                          className={`flex-1 ${inputClass}`}
                          value={form.coverImage}
                          onChange={(e) => update('coverImage', e.target.value)}
                          placeholder="sau URL direct"
                        />
                      </div>
                      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={onCoverSelected} />
                    </div>

                    {/* Cover alt */}
                    <div>
                      <label className={labelClass}>Text alternativ imagine (alt)</label>
                      <input className={inputClass} value={form.coverImageAlt} onChange={(e) => update('coverImageAlt', e.target.value)} />
                    </div>

                    {/* Body */}
                    <div>
                      <label className={labelClass}>Conținut articol</label>
                      <RichTextEditor
                        value={form.body}
                        onChange={(html) => update('body', html)}
                        placeholder="Scrie conținutul articolului…"
                        minHeight={560}
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <label className={labelClass}>Etichete (câte una pe linie sau virgulă)</label>
                      <textarea
                        className={`${textareaClass} min-h-[72px]`}
                        value={form.tagsText}
                        onChange={(e) => update('tagsText', e.target.value)}
                        placeholder={'LiFePo4\nSistem solar\nBaterie'}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* SEO tab */}
                    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700 font-['Inter']">
                      Dacă lași gol, Google va folosi titlul și rezumatul articolului.
                    </div>
                    <div>
                      <label className={labelClass}>SEO Title <span className="text-neutral-400">(max 60 car.)</span></label>
                      <input className={inputClass} value={form.seoTitle} onChange={(e) => update('seoTitle', e.target.value)} maxLength={80} />
                      <p className="text-xs text-neutral-400 mt-0.5 font-['Inter']">{form.seoTitle.length}/60</p>
                    </div>
                    <div>
                      <label className={labelClass}>SEO Description <span className="text-neutral-400">(max 160 car.)</span></label>
                      <textarea className={`${textareaClass} min-h-[88px]`} value={form.seoDescription} onChange={(e) => update('seoDescription', e.target.value)} maxLength={200} />
                      <p className="text-xs text-neutral-400 mt-0.5 font-['Inter']">{form.seoDescription.length}/160</p>
                    </div>

                    {/* Preview */}
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 font-['Inter'] mb-3">Previzualizare Google</p>
                      <p className="text-[#1a0dab] text-base font-['Arial'] hover:underline cursor-pointer truncate">
                        {form.seoTitle || form.title || 'Titlu articol'}
                      </p>
                      <p className="text-xs text-[#006621] font-['Arial'] mt-0.5">baterino.ro/blog/{form.slug || slugify(form.title) || 'slug'}</p>
                      <p className="text-sm text-[#545454] font-['Arial'] mt-1 line-clamp-2">
                        {form.seoDescription || form.excerpt || 'Descriere articol va apărea aici…'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex shrink-0 gap-3 border-t border-gray-200 px-5 py-4">
                <button type="button" onClick={closePanel} className="flex-1 rounded-[10px] border border-gray-300 px-4 py-2.5 text-sm font-semibold font-['Inter'] hover:bg-neutral-50">
                  Anulează
                </button>
                <button type="submit" disabled={saving} className="flex-1 rounded-[10px] bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white font-['Inter'] hover:bg-slate-700 disabled:opacity-50">
                  {saving ? 'Se salvează…' : form.status === 'published' ? 'Salvează & publică' : 'Salvează draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Delete confirm */}
      {deleteTarget ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold font-['Inter'] text-slate-900 mb-2">Ștergi articolul?</h3>
            <p className="text-sm text-neutral-600 font-['Inter'] mb-6">
              „{deleteTarget.title}" va fi șters definitiv.
            </p>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold font-['Inter']">Anulează</button>
              <button type="button" onClick={handleDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white font-['Inter'] hover:bg-red-700">Șterge</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
