import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getAuthToken,
  getPageSeoAll,
  saveAdminPageSeo,
  uploadPageSeoOgImage,
  type PageSeoDto,
} from '../../lib/api'

type PageMeta = { key: string; label: string; path: string }

const PAGES: PageMeta[] = [
  { key: 'home',          label: 'Pagina principală',           path: '/' },
  { key: 'produse',       label: 'Catalog Produse',             path: '/produse' },
  { key: 'reduceri',     label: 'Reduceri',                    path: '/reduceri' },
  { key: 'rezidential',   label: 'Stocare Energie Rezidențial', path: '/divizii/rezidential' },
  { key: 'industrial',    label: 'Stocare Energie Industrial',  path: '/divizii/industrial' },
  { key: 'medical',       label: 'Stocare Energie Medical',     path: '/divizii/medical' },
  { key: 'maritim',       label: 'Maritim',                     path: '/divizii/maritim' },
  { key: 'blog',          label: 'Noutăți - Perspective - Progres', path: '/blog' },
  { key: 'faq',           label: 'Întrebări Frecvente',         path: '/intrebari-frecvente' },
  { key: 'garantie',      label: 'Verificare Garanție',         path: '/verificare-garantie' },
  { key: 'service',       label: 'Service Lithtech',            path: '/service-baterii-lithtech-romania' },
  { key: 'returnare',     label: 'Returnare Produse',           path: '/returnare-produse' },
  { key: 'lithtech',      label: 'Parteneriat LithTech',        path: '/parteneriat-strategic-lithtech-baterino' },
  { key: 'instalatori',   label: 'Instalatori',                 path: '/instalatori' },
  { key: 'viziune',       label: 'Companie – Viziune',          path: '/companie/viziune' },
  { key: 'studii-de-caz', label: 'Studii de Caz',              path: '/studii-de-caz' },
  { key: 'contact',       label: 'Contact',                     path: '/contact' },
  { key: 'cariere',       label: 'Cariere',                     path: '/cariere' },
]

type DraftMap = Record<string, Omit<PageSeoDto, 'pageKey'>>

const EMPTY_DRAFT = () => ({ title: '', description: '', ogTitle: '', ogDescription: '', ogImage: '' })

function buildDraftMap(rows: PageSeoDto[]): DraftMap {
  const m: DraftMap = {}
  for (const page of PAGES) m[page.key] = EMPTY_DRAFT()
  for (const row of rows) {
    m[row.pageKey] = {
      title: row.title,
      description: row.description,
      ogTitle: row.ogTitle,
      ogDescription: row.ogDescription,
      ogImage: row.ogImage,
    }
  }
  return m
}

function sectionId(key: string) {
  return `seo-section-${key}`
}

function resolveImageSrc(url: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `https://baterino.ro${url.startsWith('/') ? '' : '/'}${url}`
}

export default function AdminSiteSeo() {
  const navigate = useNavigate()
  const [drafts, setDrafts] = useState<DraftMap>(() => buildDraftMap([]))
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [activeKey, setActiveKey] = useState<string>(PAGES[0].key)
  const savedTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    if (!getAuthToken()) { navigate('/admin/login', { replace: true }); return }
    getPageSeoAll()
      .then((rows) => setDrafts(buildDraftMap(rows)))
      .finally(() => setLoading(false))
  }, [navigate])

  // Track which section is in view
  useEffect(() => {
    if (loading) return
    const visibilityMap: Record<string, number> = {}
    const observers: IntersectionObserver[] = []

    for (const page of PAGES) {
      const el = sectionRefs.current[page.key]
      if (!el) continue
      const obs = new IntersectionObserver(
        ([entry]) => {
          visibilityMap[page.key] = entry.intersectionRatio
          const topKey = PAGES.reduce<string | null>((best, p) => {
            if (!best) return p.key
            return (visibilityMap[p.key] ?? 0) > (visibilityMap[best] ?? 0) ? p.key : best
          }, null)
          if (topKey) setActiveKey(topKey)
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1] },
      )
      obs.observe(el)
      observers.push(obs)
    }
    return () => observers.forEach((o) => o.disconnect())
  }, [loading])

  function jumpTo(key: string) {
    const el = sectionRefs.current[key]
    if (!el) return
    el.scrollIntoView({ behavior: 'instant', block: 'start' })
    setActiveKey(key)
  }

  function setField(pageKey: string, field: keyof Omit<PageSeoDto, 'pageKey'>, value: string) {
    setDrafts((prev) => ({ ...prev, [pageKey]: { ...prev[pageKey], [field]: value } }))
  }

  async function handleOgImageUpload(pageKey: string, file: File) {
    setUploading((u) => ({ ...u, [pageKey]: true }))
    setErrors((e) => ({ ...e, [pageKey]: '' }))
    try {
      const { url } = await uploadPageSeoOgImage(file, pageKey)
      setField(pageKey, 'ogImage', url)
    } catch (err) {
      setErrors((e) => ({ ...e, [pageKey]: err instanceof Error ? err.message : 'Eroare la upload.' }))
    } finally {
      setUploading((u) => ({ ...u, [pageKey]: false }))
    }
  }

  async function handleSave(pageKey: string) {
    setSaving((s) => ({ ...s, [pageKey]: true }))
    setErrors((e) => ({ ...e, [pageKey]: '' }))
    try {
      await saveAdminPageSeo(pageKey, drafts[pageKey])
      setSaved((s) => ({ ...s, [pageKey]: true }))
      clearTimeout(savedTimers.current[pageKey])
      savedTimers.current[pageKey] = setTimeout(() => {
        setSaved((s) => ({ ...s, [pageKey]: false }))
      }, 3000)
    } catch (err) {
      setErrors((e) => ({ ...e, [pageKey]: err instanceof Error ? err.message : 'Eroare.' }))
    } finally {
      setSaving((s) => ({ ...s, [pageKey]: false }))
    }
  }

  function toggleExpanded(pageKey: string) {
    setExpanded((e) => ({ ...e, [pageKey]: !e[pageKey] }))
  }

  const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-['Inter'] text-gray-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 bg-white"
  const textareaCls = `${inputCls} resize-y min-h-[72px]`
  const labelCls = "block text-xs font-semibold text-gray-600 font-['Inter'] mb-1"

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-1">Site SEO</h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8">
        Titlu, descriere și meta tag-uri Open Graph per pagină. Câmpurile goale folosesc valorile
        implicite din cod.
      </p>

      {loading ? (
        <p className="text-gray-400 text-sm font-['Inter']">Se încarcă…</p>
      ) : (
        <div className="flex gap-8 items-start">

          {/* ── Page cards ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {PAGES.map((page) => {
              const d = drafts[page.key] ?? EMPTY_DRAFT()
              const isExpanded = !!expanded[page.key]
              const isUploading = !!uploading[page.key]
              const ogImageSrc = resolveImageSrc(d.ogImage)

              return (
                <div
                  key={page.key}
                  id={sectionId(page.key)}
                  ref={(el) => { sectionRefs.current[page.key] = el }}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm scroll-mt-6"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="font-bold text-slate-900 font-['Inter'] text-sm">{page.label}</p>
                      <a
                        href={page.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#1e46b4] hover:underline font-['Inter']"
                      >
                        {page.path}
                      </a>
                    </div>
                    {saved[page.key] && (
                      <span className="text-xs text-green-600 font-['Inter'] font-medium mt-0.5 shrink-0">
                        ✓ Salvat
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div className="mb-3">
                    <label className={labelCls}>Title</label>
                    <input
                      type="text"
                      value={d.title}
                      onChange={(e) => setField(page.key, 'title', e.target.value)}
                      placeholder="Titlu pagină (implicit: valoarea din cod)"
                      className={inputCls}
                      maxLength={60}
                    />
                    <p className={`text-right text-[11px] font-['Inter'] mt-0.5 ${d.title.length >= 60 ? 'text-red-500' : 'text-gray-400'}`}>{d.title.length}/60</p>
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <label className={labelCls}>Meta Description</label>
                    <textarea
                      value={d.description}
                      onChange={(e) => setField(page.key, 'description', e.target.value)}
                      placeholder="Descriere meta (implicit: valoarea din cod)"
                      className={textareaCls}
                      maxLength={300}
                    />
                    <p className="text-right text-[11px] text-gray-400 font-['Inter'] mt-0.5">{d.description.length}/300</p>
                  </div>

                  {/* Advanced toggle */}
                  <button
                    type="button"
                    onClick={() => toggleExpanded(page.key)}
                    className="text-xs text-gray-500 hover:text-gray-800 font-['Inter'] underline underline-offset-2 mb-3"
                  >
                    {isExpanded ? '▲ Ascunde câmpuri Open Graph' : '▼ Câmpuri Open Graph (opțional)'}
                  </button>

                  {isExpanded && (
                    <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
                      <div>
                        <label className={labelCls}>OG Title <span className="font-normal text-gray-400">(implicit = Title)</span></label>
                        <input
                          type="text"
                          value={d.ogTitle}
                          onChange={(e) => setField(page.key, 'ogTitle', e.target.value)}
                          placeholder="OG Title"
                          className={inputCls}
                          maxLength={120}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>OG Description <span className="font-normal text-gray-400">(implicit = Meta Description)</span></label>
                        <textarea
                          value={d.ogDescription}
                          onChange={(e) => setField(page.key, 'ogDescription', e.target.value)}
                          placeholder="OG Description"
                          className={textareaCls}
                          maxLength={300}
                        />
                      </div>

                      {/* OG Image */}
                      <div>
                        <div className="flex items-baseline gap-2 mb-1">
                          <label className={labelCls + ' mb-0'}>OG Image</label>
                          <span className="text-[11px] text-gray-400 font-['Inter']">1200 × 630 px recomandați</span>
                        </div>

                        {/* Preview */}
                        {ogImageSrc && (
                          <div className="mb-2 relative w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200" style={{ aspectRatio: '1200/630' }}>
                            <img
                              src={ogImageSrc}
                              alt="OG preview"
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                            />
                            <button
                              type="button"
                              onClick={() => setField(page.key, 'ogImage', '')}
                              className="absolute top-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-['Inter'] text-gray-700 hover:bg-red-50 hover:text-red-600 shadow transition-colors"
                            >
                              Șterge
                            </button>
                            <span className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-0.5 text-[11px] text-white font-['Inter']">
                              1200 × 630 px
                            </span>
                          </div>
                        )}

                        {/* URL input + upload button */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={d.ogImage}
                            onChange={(e) => setField(page.key, 'ogImage', e.target.value)}
                            placeholder="/images/home/og-baterino-romania.jpg"
                            className={inputCls}
                          />
                          <button
                            type="button"
                            disabled={isUploading}
                            onClick={() => fileInputRefs.current[page.key]?.click()}
                            className="shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-['Inter'] text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors whitespace-nowrap"
                          >
                            {isUploading ? 'Se încarcă…' : '↑ Upload'}
                          </button>
                          <input
                            ref={(el) => { fileInputRefs.current[page.key] = el }}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleOgImageUpload(page.key, file)
                              e.target.value = ''
                            }}
                          />
                        </div>
                        <p className="text-[11px] text-gray-400 font-['Inter'] mt-1">
                          JPG, PNG sau WebP · max 1200×630 px · folosit de Facebook, LinkedIn, WhatsApp la partajare
                        </p>
                      </div>
                    </div>
                  )}

                  {errors[page.key] && (
                    <p className="text-red-600 text-xs font-['Inter'] mt-2">{errors[page.key]}</p>
                  )}

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSave(page.key)}
                      disabled={saving[page.key]}
                      className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold font-['Inter'] text-white hover:bg-slate-700 disabled:opacity-50 transition-colors"
                    >
                      {saving[page.key] ? 'Se salvează…' : 'Salvează'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Sticky page tree ── */}
          <aside className="hidden lg:block w-52 shrink-0 sticky top-6">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-['Inter'] mb-3 px-2">
              Pagini
            </p>
            <nav className="flex flex-col gap-0.5">
              {PAGES.map((page) => {
                const isActive = activeKey === page.key
                const hasSaved = saved[page.key]
                return (
                  <button
                    key={page.key}
                    type="button"
                    onClick={() => jumpTo(page.key)}
                    className={`group flex items-center gap-2 text-left w-full px-2 py-1.5 rounded-lg text-sm font-['Inter'] transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-gray-500 hover:text-slate-900 hover:bg-gray-50'
                    }`}
                  >
                    {isActive && (
                      <span className="w-1 h-1 rounded-full bg-slate-900 shrink-0" />
                    )}
                    <span className={isActive ? '' : 'ml-3'}>{page.label}</span>
                    {hasSaved && (
                      <span className="ml-auto text-[10px] text-green-600 font-medium">✓</span>
                    )}
                  </button>
                )
              })}
            </nav>
          </aside>

        </div>
      )}
    </div>
  )
}
