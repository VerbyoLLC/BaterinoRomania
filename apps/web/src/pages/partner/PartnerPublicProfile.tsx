import { useState, useEffect, useRef, useMemo, type ComponentProps } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getPartnerProfile, savePartnerProfile, getAuthToken } from '../../lib/api'
import { sanitizeRoPostalCode, sanitizeStreetLine } from '../../lib/formInputSanitize'
import { ROMANIAN_COUNTIES, getCitiesForCounty } from '../../lib/romanian-counties-cities'

const SERVICII_OPTIONS = [
  { id: 'fotovoltaice', label: 'Instalare sisteme fotovoltaice' },
  { id: 'baterii', label: 'Instalare baterii LiFePO4' },
  { id: 'offgrid', label: 'Sisteme off-grid' },
  { id: 'ongrid', label: 'Sisteme on-grid' },
  { id: 'rezidential', label: 'Soluții rezidențiale' },
  { id: 'industrial', label: 'Soluții industriale' },
  { id: 'service', label: 'Service și mentenanță' },
  { id: 'consultanta', label: 'Consultanță energetică' },
]

type PartnerData = {
  companyName?: string
  cui?: string
  address?: string
  companyStreet?: string | null
  companyCity?: string | null
  companyCounty?: string | null
  companyPostalCode?: string | null
  tradeRegisterNumber?: string
  activityTypes?: string
  contactFirstName?: string
  contactLastName?: string
  phone?: string
  logoUrl?: string
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
}

function Field({ label, type = 'text', placeholder, value, onChange, required, maxLength, inputMode }: {
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
      <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
      />
    </div>
  )
}

function SelectField({ label, options, value, onChange, placeholder, required, disabled }: {
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
      <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm font-['Inter'] text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

function displayValue(v: string | null | undefined): string {
  return (v && v.trim()) ? v : '—'
}

export default function PartnerPublicProfile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<PartnerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [isEditingPublic, setIsEditingPublic] = useState(false)
  const [isClosingPanel, setIsClosingPanel] = useState(false)
  const [isPublic, setIsPublic] = useState(true)
  const [photoUploading, setPhotoUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state (public profile — legal / firmă: Setări → Detalii firmă)
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

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/login', { replace: true })
      return
    }
    getPartnerProfile()
      .then((data) => {
        setProfile(data as PartnerData)
        const p = data as PartnerData
        setPublicName(p.publicName ?? '')
        setStreet(p.street ?? '')
        setCounty(p.county ?? '')
        setCity(p.city ?? '')
        setZipCode(p.zipCode ?? '')
        setDescription(p.description ?? '')
        setServicii(p.services ? p.services.split(',') : [])
        setPublicPhone(p.publicPhone ?? '')
        setWhatsapp(p.whatsapp ?? '')
        setWebsite(p.website ?? '')
        setFacebookUrl(p.facebookUrl ?? '')
        setLinkedinUrl(p.linkedinUrl ?? '')
        setIsPublic(p.isPublic !== false)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Profil negăsit. Completează profilul.'))
      .finally(() => setLoading(false))
  }, [navigate])

  function toggleServiciu(id: string) {
    setServicii((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const citiesForCounty = useMemo(() => getCitiesForCounty(county), [county])

  function handleCountyChange(newCounty: string) {
    setCounty(newCounty)
    if (!newCounty.trim()) {
      setCity('')
      return
    }
    const cities = getCitiesForCounty(newCounty)
    if (city && !cities.includes(city)) setCity('')
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > 2 * 1024 * 1024) {
      setSaveError('Imaginea trebuie să fie maxim 2MB.')
      return
    }
    setSaveError('')
    setPhotoUploading(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      const dataUrl = reader.result as string
      try {
        const updated = await savePartnerProfile({ logoUrl: dataUrl })
        setProfile(updated as PartnerData)
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Eroare la încărcare.')
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
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Eroare la ștergere.')
    } finally {
      setPhotoUploading(false)
    }
  }

  async function handleTogglePublic() {
    const newVal = !isPublic
    setSaveError('')
    setSaving(true)
    try {
      const updated = await savePartnerProfile({ isPublic: newVal })
      setProfile(updated as PartnerData)
      setIsPublic(newVal)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Eroare la actualizare.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSavePublic(e: React.FormEvent) {
    e.preventDefault()
    setSaveError('')

    const publicNameTrimmed = publicName.trim()
    const streetTrimmed = street.trim()
    const countyTrimmed = county.trim()
    const cityTrimmed = city.trim()
    const descriptionTrimmed = description.trim()
    const publicPhoneTrimmed = publicPhone.trim()

    const zipTrimmed = zipCode.trim()
    if (zipTrimmed && !/^\d{6}$/.test(zipTrimmed)) {
      setSaveError('Codul poștal trebuie să aibă exact 6 cifre (sau lasă gol).')
      return
    }

    if (!publicNameTrimmed || !streetTrimmed || !countyTrimmed || !cityTrimmed || !descriptionTrimmed || servicii.length === 0 || !publicPhoneTrimmed) {
      const missing: string[] = []
      if (!publicNameTrimmed) missing.push('Nume public')
      if (!streetTrimmed) missing.push('Stradă')
      if (!countyTrimmed) missing.push('Județ')
      if (!cityTrimmed) missing.push('Oraș')
      if (!descriptionTrimmed) missing.push('Descriere')
      if (servicii.length === 0) missing.push('Servicii oferite (cel puțin 1)')
      if (!publicPhoneTrimmed) missing.push('Telefon')
      setSaveError(`Completează câmpurile obligatorii: ${missing.join(', ')}.`)
      return
    }

    setSaving(true)
    try {
      const updated = await savePartnerProfile({
        publicName: publicNameTrimmed,
        street: streetTrimmed,
        county: countyTrimmed,
        city: cityTrimmed,
        zipCode: zipTrimmed || undefined,
        description: descriptionTrimmed,
        services: servicii.length ? servicii : undefined,
        publicPhone: publicPhoneTrimmed,
        whatsapp: whatsapp.trim() || undefined,
        website: website.trim() || undefined,
        facebookUrl: facebookUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
      })
      setProfile(updated as PartnerData)
      setIsEditingPublic(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Eroare la salvare.')
    } finally {
      setSaving(false)
    }
  }

  function handleClosePanel() {
    setIsClosingPanel(true)
  }

  function handlePanelTransitionEnd(e: React.TransitionEvent) {
    if (e.target !== e.currentTarget) return
    if (isClosingPanel) {
      setIsEditingPublic(false)
      setIsClosingPanel(false)
      setSaveError('')
    }
  }

  const hasPublicInfo = !!(
    (profile?.publicName && profile.publicName.trim()) ||
    (profile?.description && profile.description.trim()) ||
    (profile?.website && profile.website.trim()) ||
    (profile?.street && profile.street.trim()) ||
    (profile?.city && profile.city.trim())
  )

  if (loading) {
    return (
      <div className="p-6 sm:p-8 lg:p-10 max-w-4xl">
        <div className="animate-pulse h-8 bg-gray-200 rounded w-48 mb-4" />
        <div className="animate-pulse h-4 bg-gray-200 rounded w-64 mb-8" />
        <div className="animate-pulse h-48 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="p-6 sm:p-8 lg:p-10 max-w-4xl">
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Profil Public</h1>
        <p className="text-gray-500 text-sm font-['Inter'] mb-6">{error}</p>
        <Link
          to="/signup/parteneri/profil"
          className="inline-flex items-center gap-2 h-11 px-6 bg-slate-900 rounded-[10px] text-white text-sm font-bold font-['Inter'] hover:bg-slate-700 transition-colors"
        >
          Completează profilul
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    )
  }

  const panelOpen = isEditingPublic || isClosingPanel

  return (
    <div className={`flex flex-row w-full min-h-0 ${panelOpen ? 'h-[calc(100vh-4rem)] lg:h-screen overflow-hidden' : ''}`}>
      {/* Left: content area - no scroll when panel open */}
      <div className={`flex-1 min-w-0 p-6 sm:p-8 lg:p-10 max-w-4xl ${panelOpen ? 'overflow-hidden shrink-0' : 'sticky top-14 lg:top-0 self-start'}`}>
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">
          Profil Public
        </h1>
        <p className="text-gray-500 text-sm font-['Inter'] mb-8">
          Informațiile afișate utilizatorilor care caută companii de instalare pe site-ul Baterino.
        </p>

        <>
          {/* Top box: Profilul este Public / nu este public / Completează profilul */}
          {(() => {
            const isCompleteProfile = !hasPublicInfo
            const gradient =
              isCompleteProfile
                ? 'linear-gradient(to right, #FFFDFD, #EDFF9C)'
                : isPublic
                  ? 'linear-gradient(to right, #FFFDFD, #9CFFAE)'
                  : 'linear-gradient(to right, #FFFDFD, #FF9C9D)'
            return (
              <div
                className="rounded-2xl border border-gray-200 py-6 px-6 sm:py-8 sm:px-8 shadow-sm"
                style={{ background: gradient }}
              >
                <div className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold font-['Inter'] text-slate-900">
                      {isCompleteProfile
                        ? 'Completează profilul'
                        : isPublic
                          ? 'Profilul este public'
                          : 'Profilul nu este public'}
                    </h3>
                    <p className="text-gray-500 text-sm font-['Inter'] mt-1">
                      {isCompleteProfile
                        ? 'Adaugă informațiile companiei tale pentru a fi vizibil pe site-ul Baterino.'
                        : isPublic
                          ? 'Compania ta este vizibilă pe site-ul Baterino, iar clienții îți pot utiliza serviciile.'
                          : 'Compania ta nu este vizibilă pe site-ul Baterino.'}
                    </p>
                  </div>
                  {!isCompleteProfile ? (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isPublic}
                      onClick={handleTogglePublic}
                      disabled={saving}
                      className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isPublic ? 'bg-slate-900' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition-transform ${
                          isPublic ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingPublic(true)}
                      className="h-10 px-5 bg-slate-900 rounded-[10px] text-white text-sm font-bold font-['Inter'] hover:bg-slate-700 transition-colors flex-shrink-0"
                    >
                      Completează profilul
                    </button>
                  )}
                </div>
              </div>
            )
          })()}

          {/* Profil Public - view only; Editează in this box when profile is filled */}
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <h3 className="text-lg font-bold font-['Inter'] text-slate-900">Profil public</h3>
              {hasPublicInfo && (
                <button
                  type="button"
                  onClick={() => setIsEditingPublic(true)}
                  className="flex items-center gap-2 h-10 px-4 bg-slate-900 rounded-[10px] text-white text-sm font-bold font-['Inter'] hover:bg-slate-700 transition-colors self-start sm:self-auto"
                >
                  Editează profilul
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="relative flex-shrink-0">
                <div
                  className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {profile?.logoUrl ? (
                    <img src={profile.logoUrl} alt="Foto profil" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-xs font-['Inter'] text-center px-2">Încarcă foto</span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                {profile?.logoUrl && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handlePhotoDelete() }}
                    disabled={photoUploading}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
                    aria-label="Șterge foto"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {photoUploading && (
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 text-white text-xs font-['Inter']">Se salvează...</span>
                )}
                {saveError && !isEditingPublic && (
                  <p className="mt-2 text-sm text-red-600 font-['Inter'] max-w-[200px]">{saveError}</p>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold font-['Inter'] text-slate-900 mb-3">
                  {displayValue(profile?.publicName || profile?.companyName)}
                </h2>
                <p className="text-gray-600 text-sm font-['Inter'] mb-0">
                  {displayValue(profile?.description)}
                </p>
                {!hasPublicInfo && (
                  <button
                    type="button"
                    onClick={() => setIsEditingPublic(true)}
                    className="inline-flex items-center gap-2 h-11 px-6 bg-slate-900 rounded-[10px] text-white text-sm font-bold font-['Inter'] hover:bg-slate-700 transition-colors mt-4"
                  >
                    Completează profilul
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm mt-6 pt-6 border-t border-gray-100">
              <div><dt className="text-gray-500 font-['Inter']">Adresă</dt><dd className="font-['Inter'] text-slate-900">{[profile?.street, profile?.city, profile?.county, profile?.zipCode].filter(Boolean).join(', ') || '—'}</dd></div>
              <div><dt className="text-gray-500 font-['Inter']">Servicii</dt><dd className="font-['Inter'] text-slate-900">{profile?.services ? profile.services.split(',').map(s => SERVICII_OPTIONS.find(o => o.id === s)?.label || s).join(', ') : '—'}</dd></div>
              <div><dt className="text-gray-500 font-['Inter']">Telefon</dt><dd className="font-['Inter'] text-slate-900">{displayValue(profile?.publicPhone)}</dd></div>
              <div><dt className="text-gray-500 font-['Inter']">WhatsApp</dt><dd className="font-['Inter'] text-slate-900">{displayValue(profile?.whatsapp)}</dd></div>
              <div><dt className="text-gray-500 font-['Inter']">Website</dt><dd className="font-['Inter'] text-slate-900">{profile?.website ? <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-slate-900 underline hover:text-slate-700">{profile.website}</a> : '—'}</dd></div>
              <div><dt className="text-gray-500 font-['Inter']">Facebook</dt><dd className="font-['Inter'] text-slate-900">{profile?.facebookUrl ? <a href={profile.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-slate-900 underline hover:text-slate-700">Link</a> : '—'}</dd></div>
              <div><dt className="text-gray-500 font-['Inter']">LinkedIn</dt><dd className="font-['Inter'] text-slate-900">{profile?.linkedinUrl ? <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-slate-900 underline hover:text-slate-700">Link</a> : '—'}</dd></div>
            </dl>
          </div>

        </>
      </div>

      {/* Right: edit panel slides in from left, extends to page end (only in view mode) */}
      <div
        className={`flex-shrink-0 overflow-hidden transition-[width] duration-300 ease-out border-l border-gray-200 bg-white ${
          panelOpen ? 'flex-1 min-w-[20rem] overflow-y-auto' : 'w-0'
        }`}
      >
        <div
          className={`w-full min-w-[20rem] p-6 sm:p-8 shadow-lg transition-transform duration-300 ease-out ${
            isClosingPanel ? '-translate-x-full' : isEditingPublic ? 'translate-x-0' : '-translate-x-full'
          }`}
          onTransitionEnd={handlePanelTransitionEnd}
        >
          <form onSubmit={handleSavePublic} className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-bold font-['Inter'] text-slate-900">Editează profil public</h4>
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
              <p className="text-sm text-red-600 font-['Inter']">{saveError}</p>
            )}
            <Field label="Nume public" placeholder="ex: Solar Pro SRL" value={publicName} onChange={setPublicName} required />
            <Field label="Stradă" placeholder="ex: Str Exemplu nr 1" value={street} onChange={(v) => setStreet(sanitizeStreetLine(v))} required />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SelectField label="Județ" options={[...ROMANIAN_COUNTIES]} value={county} onChange={handleCountyChange} placeholder="Selectează județul" required />
              <SelectField
                label="Oraș"
                options={citiesForCounty}
                value={city}
                onChange={setCity}
                placeholder="Selectează orașul"
                required
                disabled={!county}
              />
              <Field label="Cod poștal" placeholder="010001" value={zipCode} onChange={(v) => setZipCode(sanitizeRoPostalCode(v))} maxLength={6} inputMode="numeric" />
            </div>
            <div>
              <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">Descriere <span className="text-red-500">*</span></label>
              <textarea
                placeholder="Descrierea companiei tale..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-[10px] text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Servicii oferite <span className="text-red-500">*</span> <span className="font-normal text-gray-500">(cel puțin 1)</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SERVICII_OPTIONS.map((opt) => (
                  <label key={opt.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-[8px] border border-gray-200 hover:border-gray-300">
                    <input
                      type="checkbox"
                      checked={servicii.includes(opt.id)}
                      onChange={() => toggleServiciu(opt.id)}
                      className="w-4 h-4 rounded border-gray-300 accent-slate-900"
                    />
                    <span className="text-sm font-['Inter'] text-gray-800">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Telefon" type="tel" placeholder="+40 7XX XXX XXX" value={publicPhone} onChange={setPublicPhone} required />
              <Field label="WhatsApp" type="tel" placeholder="+40 7XX XXX XXX" value={whatsapp} onChange={setWhatsapp} />
            </div>
            <Field label="Website" type="url" placeholder="https://www.exemplu.ro" value={website} onChange={setWebsite} />
            <Field label="Facebook" type="url" placeholder="https://facebook.com/..." value={facebookUrl} onChange={setFacebookUrl} />
            <Field label="LinkedIn" type="url" placeholder="https://linkedin.com/company/..." value={linkedinUrl} onChange={setLinkedinUrl} />
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="h-11 px-6 bg-slate-900 rounded-[10px] text-white text-sm font-bold font-['Inter'] hover:bg-slate-700 disabled:opacity-50"
              >
                {saving ? 'Se salvează...' : 'Salvează'}
              </button>
              <button
                type="button"
                onClick={handleClosePanel}
                className="h-11 px-6 border border-gray-300 rounded-[10px] text-gray-700 text-sm font-semibold font-['Inter'] hover:bg-gray-50"
              >
                Anulează
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
