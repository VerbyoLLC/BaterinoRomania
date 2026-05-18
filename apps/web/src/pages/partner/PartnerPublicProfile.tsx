import { useState, useEffect, useRef, useMemo, type ComponentProps } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getPartnerProfile, savePartnerProfile, getAuthToken } from '../../lib/api'
import { sanitizeRoPostalCode, sanitizeStreetLine } from '../../lib/formInputSanitize'
import { ROMANIAN_COUNTIES, getCitiesForCounty } from '../../lib/romanian-counties-cities'
import PartnerPublicProfileCard from '../../components/partner/PartnerPublicProfileCard'
import { PARTNER_SERVICII_OPTIONS } from '../../lib/partner-servicii-options'
import { slugifyPartnerPublicHandle } from '../../lib/partnerPublicSlug'
import {
  MapPin,
  Phone,
  Globe,
  CheckCircle2,
  Circle,
  Upload,
  Eye,
  Link2,
  ExternalLink,
  Building2,
  Wrench,
} from 'lucide-react'

type PartnerData = {
  companyName?: string
  publicSlug?: string | null
  logoUrl?: string | null
  publicName?: string
  street?: string
  county?: string
  city?: string
  zipCode?: string
  description?: string
  services?: string
  publicPhone?: string
  whatsapp?: string
  website?: string
  facebookUrl?: string
  linkedinUrl?: string
  isPublic?: boolean
  workPhotos?: string[]
}

/* ─── tiny field wrapper ─────────────────────────────────────────── */
function Field({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required,
  maxLength,
  inputMode,
}: {
  label: string
  type?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  maxLength?: number
  inputMode?: ComponentProps<'input'>['inputMode']
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700 font-['Inter']">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/60 font-['Inter']"
      />
    </div>
  )
}

function SelectField({
  label,
  options,
  value,
  onChange,
  placeholder,
  required,
  disabled,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700 font-['Inter']">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/60 disabled:cursor-not-allowed disabled:opacity-60 font-['Inter']"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

/* ─── section wrapper ────────────────────────────────────────────── */
function FormSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.10)] sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </span>
        <h2 className="text-base font-bold text-slate-900 font-['Inter']">{title}</h2>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

/* ─── completion item ────────────────────────────────────────────── */
function CompletionItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {done ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" strokeWidth={2} />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-slate-300" strokeWidth={2} />
      )}
      <span className={`text-xs font-['Inter'] ${done ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
    </div>
  )
}

/* ─── main page ──────────────────────────────────────────────────── */
export default function PartnerPublicProfile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<PartnerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* form state — drives the live preview */
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [workPhotos, setWorkPhotos] = useState<string[]>([])
  const [workPhotosUploading, setWorkPhotosUploading] = useState(false)
  const workPhotosInputRef = useRef<HTMLInputElement>(null)
  const [publicName, setPublicName] = useState('')
  const [street, setStreet] = useState('')
  const [county, setCounty] = useState('')
  const [city, setCity] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [description, setDescription] = useState('')
  const [servicii, setServicii] = useState<string[]>([])
  const [publicPhone, setPublicPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [website, setWebsite] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [publicSlugInput, setPublicSlugInput] = useState('')
  const [profileUrlHost, setProfileUrlHost] = useState('baterino.ro')

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/login', { replace: true })
      return
    }
    getPartnerProfile()
      .then((data) => {
        const p = data as PartnerData
        setProfile(p)
        setPublicName(p.publicName ?? '')
        setStreet(p.street ?? '')
        setCounty(p.county ?? '')
        setCity(p.city ?? '')
        setZipCode(p.zipCode ?? '')
        setDescription(p.description ?? '')
        setServicii(p.services ? p.services.split(',').filter(Boolean) : [])
        setPublicPhone(p.publicPhone ?? '')
        setWhatsapp(p.whatsapp ?? '')
        setWebsite(p.website ?? '')
        setFacebookUrl(p.facebookUrl ?? '')
        setLinkedinUrl(p.linkedinUrl ?? '')
        setIsPublic(p.isPublic !== false)
        setLogoPreview(p.logoUrl ?? null)
        setWorkPhotos(Array.isArray(p.workPhotos) ? p.workPhotos : [])
        setPublicSlugInput(String(p.publicSlug ?? '').replace(/^@/, '').toLowerCase())
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Eroare la încărcarea profilului.'))
      .finally(() => setLoading(false))
  }, [navigate])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const h = window.location.hostname?.trim()
    if (h) setProfileUrlHost(h)
  }, [])

  const citiesForCounty = useMemo(() => getCitiesForCounty(county), [county])

  function handleCountyChange(newCounty: string) {
    setCounty(newCounty)
    const cities = getCitiesForCounty(newCounty)
    if (city && !cities.includes(city)) setCity('')
  }

  function toggleServiciu(id: string) {
    setServicii((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > 2 * 1024 * 1024) {
      setSaveError('Imaginea trebuie să fie maxim 2 MB.')
      return
    }
    setSaveError('')
    setPhotoUploading(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      const dataUrl = reader.result as string
      setLogoPreview(dataUrl)
      try {
        const updated = await savePartnerProfile({ logoUrl: dataUrl })
        setProfile(updated as PartnerData)
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Eroare la încărcare.')
        setLogoPreview(profile?.logoUrl ?? null)
      } finally {
        setPhotoUploading(false)
        e.target.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

  async function handlePhotoDelete() {
    setSaveError('')
    setPhotoUploading(true)
    try {
      const updated = await savePartnerProfile({ logoUrl: null })
      setProfile(updated as PartnerData)
      setLogoPreview(null)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Eroare la ștergere.')
    } finally {
      setPhotoUploading(false)
    }
  }

  async function handleWorkPhotosAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const remaining = 8 - workPhotos.length
    const toProcess = files.slice(0, remaining)
    const oversized = toProcess.filter((f) => f.size > 5 * 1024 * 1024)
    if (oversized.length) {
      setSaveError('Fiecare imagine trebuie să fie maxim 5 MB.')
      e.target.value = ''
      return
    }
    setSaveError('')
    setWorkPhotosUploading(true)
    const readers = toProcess.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const r = new FileReader()
          r.onloadend = () => resolve(r.result as string)
          r.onerror = reject
          r.readAsDataURL(file)
        }),
    )
    try {
      const dataUrls = await Promise.all(readers)
      const next = [...workPhotos, ...dataUrls].slice(0, 8)
      setWorkPhotos(next)
      const updated = await savePartnerProfile({ workPhotos: next })
      setProfile(updated as PartnerData)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Eroare la încărcarea fotografiei.')
    } finally {
      setWorkPhotosUploading(false)
      e.target.value = ''
    }
  }

  async function handleWorkPhotoDelete(idx: number) {
    const next = workPhotos.filter((_, i) => i !== idx)
    setWorkPhotos(next)
    try {
      const updated = await savePartnerProfile({ workPhotos: next.length ? next : null })
      setProfile(updated as PartnerData)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Eroare la ștergere.')
      setWorkPhotos(workPhotos)
    }
  }

  async function handleTogglePublic() {
    const next = !isPublic
    setSaveError('')
    setIsPublic(next)
    try {
      const updated = await savePartnerProfile({ isPublic: next })
      setProfile(updated as PartnerData)
    } catch (err) {
      setIsPublic(!next)
      setSaveError(err instanceof Error ? err.message : 'Eroare la actualizare.')
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaveError('')
    setSaved(false)

    const nameTrimmed = publicName.trim()
    const streetTrimmed = street.trim()
    const countyTrimmed = county.trim()
    const cityTrimmed = city.trim()
    const descTrimmed = description.trim()
    const phoneTrimmed = publicPhone.trim()
    const zipTrimmed = zipCode.trim()

    if (zipTrimmed && !/^\d{6}$/.test(zipTrimmed)) {
      setSaveError('Codul poștal trebuie să aibă exact 6 cifre (sau lasă gol).')
      return
    }

    const missing: string[] = []
    if (!nameTrimmed) missing.push('Nume public')
    if (!streetTrimmed) missing.push('Stradă')
    if (!countyTrimmed) missing.push('Județ')
    if (!cityTrimmed) missing.push('Oraș')
    if (!descTrimmed) missing.push('Descriere')
    if (servicii.length === 0) missing.push('Servicii (cel puțin 1)')
    if (!phoneTrimmed) missing.push('Telefon')
    if (missing.length) {
      setSaveError(`Câmpuri obligatorii: ${missing.join(', ')}.`)
      return
    }

    const trimmedSlug = publicSlugInput.trim()
    let slugOut =
      trimmedSlug === ''
        ? (profile?.publicSlug ?? '').replace(/^@/, '').toLowerCase()
        : slugifyPartnerPublicHandle(trimmedSlug.replace(/^@/, ''))
    if (!slugOut && profile?.companyName) {
      slugOut = slugifyPartnerPublicHandle(profile.companyName)
    }
    if (!slugOut && publicName.trim()) {
      slugOut = slugifyPartnerPublicHandle(publicName.trim())
    }
    if (!slugOut) {
      setSaveError('Completează handle-ul pentru pagina publică (sau „Generează din companie”).')
      return
    }

    setSaving(true)
    try {
      const updated = await savePartnerProfile({
        publicName: nameTrimmed,
        street: streetTrimmed,
        county: countyTrimmed,
        city: cityTrimmed,
        zipCode: zipTrimmed || undefined,
        description: descTrimmed,
        services: servicii.length ? servicii : undefined,
        publicPhone: phoneTrimmed,
        whatsapp: whatsapp.trim() || undefined,
        website: website.trim() || undefined,
        facebookUrl: facebookUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        publicSlug: slugOut,
      })
      setProfile(updated as PartnerData)
      setPublicSlugInput(String((updated as PartnerData).publicSlug ?? slugOut).replace(/^@/, '').toLowerCase())
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Eroare la salvare.')
    } finally {
      setSaving(false)
    }
  }

  /* completion tracking */
  const checks = {
    slug: !!(profile?.publicSlug || slugifyPartnerPublicHandle(publicSlugInput.trim())),
    photo: !!logoPreview,
    name: !!publicName.trim(),
    location: !!county.trim() && !!city.trim() && !!street.trim(),
    description: !!description.trim(),
    services: servicii.length > 0,
    phone: !!publicPhone.trim(),
    web: !!website.trim() || !!facebookUrl.trim() || !!linkedinUrl.trim(),
    gallery: workPhotos.length > 0,
  }
  const completedCount = Object.values(checks).filter(Boolean).length
  const totalChecks = Object.keys(checks).length
  const pct = Math.round((completedCount / totalChecks) * 100)

  /* ── loading ── */
  if (loading) {
    return (
      <div className="p-6 sm:p-10">
        <div className="mb-6 h-8 w-52 animate-pulse rounded-xl bg-slate-200" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {[120, 200, 160, 180].map((h, i) => (
              <div key={i} style={{ height: h }} className="animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
          <div className="h-[480px] animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4 p-10 text-center">
        <p className="text-slate-500 font-['Inter']">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 font-['Inter']"
        >
          Reîncearcă
        </button>
      </div>
    )
  }

  return (
    <div className="relative z-0 box-border block !min-h-min min-w-0 w-full max-w-full shrink-0 bg-[#f5f5f7] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:pb-10 lg:pt-10">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-['Inter'] sm:text-3xl">
            Profil Public
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-['Inter']">
            Informațiile afișate clienților care caută instalatori pe Baterino.ro
          </p>
        </div>

        {/* Visibility toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          onClick={handleTogglePublic}
          className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition font-['Inter'] ${
            isPublic
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
          }`}
        >
          <Eye className="h-4 w-4 shrink-0" strokeWidth={2} />
          {isPublic ? 'Profil public' : 'Profil privat'}
          <span
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
              isPublic ? 'bg-white/30' : 'bg-slate-400/40'
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                isPublic ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </span>
        </button>
      </div>

      {/* Main two-column grid */}
      <div className="grid min-w-0 max-w-full auto-rows-min grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_minmax(0,360px)] xl:grid-cols-[1fr_minmax(0,400px)] lg:gap-8">
        {/* ── LEFT: form (self-start avoids grid stretch filler when preview column is taller) ── */}
        <form onSubmit={handleSave} className="flex w-full min-w-0 flex-col gap-5 self-start">
          {/* Completion banner */}
          <div className="rounded-2xl bg-white p-4 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.10)] sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 font-['Inter']">Completare profil</span>
              <span className={`text-sm font-bold font-['Inter'] ${pct === 100 ? 'text-emerald-600' : 'text-slate-500'}`}>
                {pct}%
              </span>
            </div>
            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              <CompletionItem done={checks.slug} label="Adresă /companii" />
              <CompletionItem done={checks.photo} label="Fotografie logo" />
              <CompletionItem done={checks.name} label="Nume public" />
              <CompletionItem done={checks.location} label="Locație" />
              <CompletionItem done={checks.description} label="Descriere" />
              <CompletionItem done={checks.services} label="Servicii" />
              <CompletionItem done={checks.phone} label="Telefon" />
              <CompletionItem done={checks.web} label="Web / social" />
              <CompletionItem done={checks.gallery} label="Galerie foto lucrări" />
            </div>
          </div>

          {/* Public page handle */}
          <FormSection icon={<Link2 className="h-4 w-4" strokeWidth={2} />} title="Pagina ta publică (handle)">
            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-500 font-['Inter'] leading-relaxed">
                După{' '}
                <strong className="text-slate-700 font-semibold">aprobarea contului</strong> și dacă ai „Profil public” activ,
                clienții te găsesc la adresă unică pe site (poți trimite și forma scurtă cu @ în chat).
              </p>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 font-mono text-[11px] text-slate-600 break-all sm:text-xs font-['Inter']">
                {(() => {
                  const s =
                    slugifyPartnerPublicHandle(publicSlugInput.trim()) ||
                    (profile?.publicSlug ?? '').replace(/^@/, '') ||
                    'handle-complet'
                  return `https://${profileUrlHost}/companii/@${s}`
                })()}
              </div>
              {(() => {
                const slug =
                  slugifyPartnerPublicHandle(publicSlugInput.trim()) ||
                  (profile?.publicSlug ?? '').replace(/^@/, '')
                return slug ? (
                  <Link
                    to={`/companii/@${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 transition hover:text-sky-900 font-['Inter']"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                    Deschide șablonul paginii publice într-o filă nouă
                  </Link>
                ) : (
                  <p className="text-xs text-amber-700/90 font-['Inter']">
                    Salvezi profilul cu un handle valid pentru a genera linkul către această pagină.
                  </p>
                )
              })()}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 font-['Inter']">
                  Handle (@numecompanii)
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch">
                  <input
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={publicSlugInput}
                    placeholder="din-denumirea-companiei"
                    onChange={(e) => setPublicSlugInput(e.target.value.toLowerCase().replace(/^@+/, ''))}
                    onBlur={() => setPublicSlugInput((prev) => slugifyPartnerPublicHandle(prev.trim()))}
                    className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/60 font-['Inter']"
                  />
                  <button
                    type="button"
                    className="h-11 w-full shrink-0 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 font-['Inter'] sm:w-auto sm:whitespace-nowrap"
                    onClick={() =>
                      setPublicSlugInput(
                        slugifyPartnerPublicHandle(profile?.companyName || publicName || 'partener'),
                      )
                    }
                  >
                    Generează din companie / nume
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-slate-400 font-['Inter']">
                  Litere mici, cifre și cratimă — generat automat la înregistrare din denumirea din datele juridice.
                </p>
              </div>
            </div>
          </FormSection>

          {/* Photo */}
          <FormSection icon={<Upload className="h-4 w-4" strokeWidth={2} />} title="Fotografie / logo companie">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div
                  className="h-20 w-20 cursor-pointer overflow-hidden rounded-2xl bg-slate-100 transition hover:opacity-80"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                      <Building2 className="h-7 w-7 text-slate-300" strokeWidth={1.5} />
                      <span className="text-[10px] text-slate-400 font-['Inter']">Logo</span>
                    </div>
                  )}
                </div>
                {photoUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/30">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={photoUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="h-9 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 font-['Inter']"
                >
                  {logoPreview ? 'Schimbă imaginea' : 'Încarcă logo'}
                </button>
                {logoPreview && (
                  <button
                    type="button"
                    disabled={photoUploading}
                    onClick={handlePhotoDelete}
                    className="h-9 rounded-xl bg-red-50 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 font-['Inter']"
                  >
                    Șterge
                  </button>
                )}
                <p className="text-xs text-slate-400 font-['Inter']">JPG / PNG · max 2 MB</p>
              </div>
            </div>
          </FormSection>

          {/* Identity */}
          <FormSection icon={<Building2 className="h-4 w-4" strokeWidth={2} />} title="Identitate companie">
            <Field
              label="Nume public afișat"
              placeholder="ex: Solar Pro SRL"
              value={publicName}
              onChange={setPublicName}
              required
            />
          </FormSection>

          {/* Location */}
          <FormSection icon={<MapPin className="h-4 w-4" strokeWidth={2} />} title="Locație">
            <Field
              label="Stradă și număr"
              placeholder="ex: Str. Exemplu nr. 10"
              value={street}
              onChange={(v) => setStreet(sanitizeStreetLine(v))}
              required
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SelectField
                label="Județ"
                options={[...ROMANIAN_COUNTIES]}
                value={county}
                onChange={handleCountyChange}
                placeholder="Selectează"
                required
              />
              <SelectField
                label="Oraș"
                options={citiesForCounty}
                value={city}
                onChange={setCity}
                placeholder="Selectează"
                required
                disabled={!county}
              />
              <Field
                label="Cod poștal"
                placeholder="010001"
                value={zipCode}
                onChange={(v) => setZipCode(sanitizeRoPostalCode(v))}
                maxLength={6}
                inputMode="numeric"
              />
            </div>
          </FormSection>

          {/* Description */}
          <section className="rounded-2xl bg-white p-5 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.10)] sm:p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" />
                </svg>
              </span>
              <h2 className="text-base font-bold text-slate-900 font-['Inter']">
                Descriere <span className="text-red-500">*</span>
              </h2>
            </div>
            <textarea
              rows={5}
              placeholder="Prezintă compania ta: experiență, echipă, zone de acoperire, valori…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/60 font-['Inter']"
            />
          </section>

          {/* Services */}
          <FormSection icon={<Wrench className="h-4 w-4" strokeWidth={2} />} title="Servicii oferite *">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PARTNER_SERVICII_OPTIONS.map((opt) => {
                const active = servicii.includes(opt.id)
                return (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                      active
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleServiciu(opt.id)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                        active ? 'border-white bg-white' : 'border-slate-300'
                      }`}
                    >
                      {active && (
                        <svg className="h-3 w-3 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className="text-sm font-medium font-['Inter']">{opt.label}</span>
                  </label>
                )
              })}
            </div>
          </FormSection>

          {/* Contact */}
          <FormSection icon={<Phone className="h-4 w-4" strokeWidth={2} />} title="Contact">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Telefon"
                type="tel"
                placeholder="+40 7XX XXX XXX"
                value={publicPhone}
                onChange={setPublicPhone}
                required
              />
              <Field
                label="WhatsApp"
                type="tel"
                placeholder="+40 7XX XXX XXX"
                value={whatsapp}
                onChange={setWhatsapp}
              />
            </div>
            <Field
              label="Website"
              type="url"
              placeholder="https://www.exemplu.ro"
              value={website}
              onChange={setWebsite}
            />
          </FormSection>

          {/* Social */}
          <FormSection icon={<Globe className="h-4 w-4" strokeWidth={2} />} title="Rețele sociale">
            <Field
              label="Facebook"
              type="url"
              placeholder="https://facebook.com/..."
              value={facebookUrl}
              onChange={setFacebookUrl}
            />
            <Field
              label="LinkedIn"
              type="url"
              placeholder="https://linkedin.com/company/..."
              value={linkedinUrl}
              onChange={setLinkedinUrl}
            />
          </FormSection>

          {/* Work photo gallery */}
          <section className="rounded-2xl bg-white p-5 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.10)] sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-['Inter']">Galerie foto lucrări</h2>
                  <p className="text-xs text-slate-400 font-['Inter']">{workPhotos.length}/8 fotografii · max 5 MB/foto</p>
                </div>
              </div>
              {workPhotos.length < 8 && (
                <button
                  type="button"
                  disabled={workPhotosUploading}
                  onClick={() => workPhotosInputRef.current?.click()}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 font-['Inter']"
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Adaugă
                </button>
              )}
            </div>
            <input
              ref={workPhotosInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleWorkPhotosAdd}
              className="hidden"
            />
            {workPhotos.length === 0 ? (
              <button
                type="button"
                disabled={workPhotosUploading}
                onClick={() => workPhotosInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 py-8 text-slate-400 transition hover:border-slate-300 hover:text-slate-500 disabled:opacity-50"
              >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
                </svg>
                <span className="text-sm font-medium font-['Inter']">Încarcă fotografii cu lucrările tale</span>
                <span className="text-xs font-['Inter']">JPG / PNG · până la 8 fotografii · max 5 MB/foto</span>
              </button>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {workPhotos.map((src, idx) => (
                  <div key={idx} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                    <img src={src} alt={`Lucrare ${idx + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleWorkPhotoDelete(idx)}
                      className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/40"
                      aria-label="Șterge fotografie"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-600 opacity-0 shadow transition group-hover:opacity-100">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                    </button>
                  </div>
                ))}
                {workPhotosUploading && (
                  <div className="flex aspect-square items-center justify-center rounded-xl bg-slate-100">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Submit */}
          <div className="flex items-center gap-3 pb-4">
            <button
              type="submit"
              disabled={saving}
              className="h-11 rounded-xl bg-slate-900 px-7 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50 font-['Inter']"
            >
              {saving ? 'Se salvează…' : 'Salvează profilul'}
            </button>
            {saved && (
              <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 font-['Inter']">
                <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                Salvat!
              </div>
            )}
            {saveError && (
              <p className="text-sm text-red-600 font-['Inter']">{saveError}</p>
            )}
          </div>
        </form>

        {/* ── RIGHT: live preview (sticky on lg — scroll is #partner-layout-scroll) ── */}
        <aside className="min-w-0 max-w-full lg:sticky lg:top-8 lg:z-10 lg:self-start">
          <div className="mb-3 flex items-center gap-2">
            <Eye className="h-4 w-4 text-slate-500" strokeWidth={2} />
            <span className="text-sm font-semibold text-slate-500 font-['Inter']">
              Previzualizare — cum te văd clienții
            </span>
          </div>
          <PartnerPublicProfileCard
            variant="owner-preview"
            logoUrl={logoPreview}
            publicName={publicName}
            companyName={profile?.companyName}
            city={city}
            county={county}
            description={description}
            servicii={servicii}
            publicPhone={publicPhone}
            whatsapp={whatsapp}
            website={website}
            facebookUrl={facebookUrl}
            linkedinUrl={linkedinUrl}
            isPublic={isPublic}
            workPhotos={workPhotos}
          />
          <p className="mt-3 text-center text-xs text-slate-400 font-['Inter']">
            Previzualizarea se actualizează în timp real pe măsură ce completezi formularul.
          </p>
        </aside>
      </div>
    </div>
  )
}
