import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthToken, getPageSeoAll, saveAdminPageSeo, type PageSeoDto } from '../../lib/api'

type PageMeta = { key: string; label: string; path: string }

const PAGES: PageMeta[] = [
  { key: 'home',        label: 'Pagina principală',              path: '/' },
  { key: 'produse',     label: 'Catalog Produse',                path: '/produse' },
  { key: 'rezidential', label: 'Stocare Energie Rezidențial',    path: '/divizii/rezidential' },
  { key: 'industrial',  label: 'Stocare Energie Industrial',     path: '/divizii/industrial' },
  { key: 'blog',        label: 'Blog',                           path: '/blog' },
  { key: 'faq',         label: 'Întrebări Frecvente',            path: '/intrebari-frecvente' },
  { key: 'garantie',    label: 'Verificare Garanție',            path: '/verificare-garantie' },
  { key: 'service',     label: 'Service Lithtech',               path: '/service-lithtech-romania' },
  { key: 'returnare',   label: 'Returnare Produse',              path: '/returnare-produse' },
  { key: 'lithtech',    label: 'Parteneriat LithTech',           path: '/parteneriat-strategic-lithtech-baterino' },
  { key: 'instalatori', label: 'Instalatori',                    path: '/instalatori' },
  { key: 'viziune',     label: 'Companie – Viziune',             path: '/companie/viziune' },
  { key: 'studii-de-caz', label: 'Studii de Caz',               path: '/studii-de-caz' },
  { key: 'contact',     label: 'Contact',                        path: '/contact' },
  { key: 'cariere',     label: 'Cariere',                        path: '/cariere' },
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

export default function AdminSiteSeo() {
  const navigate = useNavigate()
  const [drafts, setDrafts] = useState<DraftMap>(() => buildDraftMap([]))
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const savedTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    if (!getAuthToken()) { navigate('/admin/login', { replace: true }); return }
    getPageSeoAll()
      .then((rows) => setDrafts(buildDraftMap(rows)))
      .finally(() => setLoading(false))
  }, [navigate])

  function setField(pageKey: string, field: keyof Omit<PageSeoDto, 'pageKey'>, value: string) {
    setDrafts((prev) => ({ ...prev, [pageKey]: { ...prev[pageKey], [field]: value } }))
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

  const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-[\'Inter\'] text-gray-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20 bg-white'
  const textareaCls = `${inputCls} resize-y min-h-[72px]`
  const labelCls = 'block text-xs font-semibold text-gray-600 font-[\'Inter\'] mb-1'

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-4xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-1">Site SEO</h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8">
        Titlu, descriere și meta tag-uri Open Graph per pagină. Câmpurile goale folosesc valorile
        implicite din cod. OG Title / OG Description se completează automat din Title / Description
        dacă sunt lăsate goale.
      </p>

      {loading ? (
        <p className="text-gray-400 text-sm font-['Inter']">Se încarcă…</p>
      ) : (
        <div className="flex flex-col gap-6">
          {PAGES.map((page) => {
            const d = drafts[page.key] ?? EMPTY_DRAFT()
            const isExpanded = !!expanded[page.key]
            return (
              <div key={page.key} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
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
                    maxLength={120}
                  />
                  <p className="text-right text-[11px] text-gray-400 font-['Inter'] mt-0.5">{d.title.length}/120</p>
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
                    <div>
                      <label className={labelCls}>OG Image <span className="font-normal text-gray-400">(URL absolut sau relativ)</span></label>
                      <input
                        type="text"
                        value={d.ogImage}
                        onChange={(e) => setField(page.key, 'ogImage', e.target.value)}
                        placeholder="/images/home/og-baterino-romania.jpg"
                        className={inputCls}
                      />
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
      )}
    </div>
  )
}
