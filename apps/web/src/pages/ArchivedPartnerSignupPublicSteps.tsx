/**
 * Archived UI: former steps 2–3 of `/signup/parteneri/profil-public`.
 * Not used by the router — port into the partner panel (e.g. PartnerPublicProfile) when ready.
 */
import { type ChangeEvent, type FormEvent, type RefObject } from 'react'
import { sanitizeRoPostalCode, sanitizeStreetLine } from '../lib/formInputSanitize'
import { ROMANIAN_COUNTIES, getCitiesForCounty } from '../lib/romanian-counties-cities'

export const ARCHIVED_SERVICII_OPTIONS = [
  { id: 'fotovoltaice', label: 'Instalare sisteme fotovoltaice' },
  { id: 'baterii', label: 'Instalare baterii LiFePO4' },
  { id: 'offgrid', label: 'Sisteme off-grid' },
  { id: 'ongrid', label: 'Sisteme on-grid' },
  { id: 'rezidential', label: 'Soluții rezidențiale' },
  { id: 'industrial', label: 'Soluții industriale' },
  { id: 'service', label: 'Service și mentenanță' },
  { id: 'consultanta', label: 'Consultanță energetică' },
] as const

function ArchivedField({ label, type = 'text', placeholder, required, hint, value, onChange }: {
  label: string
  type?: string
  placeholder: string
  required?: boolean
  hint?: string
  value?: string
  onChange?: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        {...(value !== undefined && onChange ? { value, onChange: (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value) } : {})}
        className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
      />
      {hint && <p className="text-xs text-gray-400 font-['Inter'] mt-1">{hint}</p>}
    </div>
  )
}

function ArchivedSelectField({ label, options, value, onChange, required, placeholder }: {
  label: string
  options: { value: string; label: string }[] | string[]
  value: string
  onChange: (v: string) => void
  required?: boolean
  placeholder?: string
}) {
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  return (
    <div>
      <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm font-['Inter'] text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {opts.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

export type ArchivedStep2Props = {
  fileInputRef: RefObject<HTMLInputElement | null>
  logoPreview: string | null
  onLogoChange: (e: ChangeEvent<HTMLInputElement>) => void
  publicName: string
  setPublicName: (v: string) => void
  street: string
  setStreet: (v: string) => void
  county: string
  onCountyChange: (v: string) => void
  city: string
  setCity: (v: string) => void
  zipCode: string
  setZipCode: (v: string) => void
  description: string
  setDescription: (v: string) => void
  onContinue: (e: FormEvent) => void
}

/** Former signup step 2: logo, nume public, adresă publică, descriere */
export function ArchivedPartnerSignupPublicStep2(props: ArchivedStep2Props) {
  const {
    fileInputRef,
    logoPreview,
    onLogoChange,
    publicName,
    setPublicName,
    street,
    setStreet,
    county,
    onCountyChange,
    city,
    setCity,
    zipCode,
    setZipCode,
    description,
    setDescription,
    onContinue,
  } = props
  const citiesForCounty = getCitiesForCounty(county)

  return (
    <form className="flex flex-col gap-4" onSubmit={onContinue}>
      <div>
        <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
          Logo companie
        </label>
        <div className="flex items-center gap-4">
          <div
            className="w-28 h-28 rounded-[10px] border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
          >
            {logoPreview ? (
              <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
            ) : (
              <span className="text-gray-400 text-xs font-['Inter'] text-center px-2">Încarcă logo</span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onLogoChange}
            className="hidden"
          />
          <p className="text-xs text-gray-500 font-['Inter']">
            PNG, JPG. Max 2MB.
          </p>
        </div>
      </div>

      <ArchivedField label="Nume public" placeholder="ex: Solar Pro SRL" required value={publicName} onChange={setPublicName} />

      <div className="border-t border-gray-100 pt-4 flex flex-col gap-4">
        <ArchivedField
          label="Stradă"
          placeholder="ex: Str Exemplu nr 1"
          value={street}
          onChange={(v) => setStreet(sanitizeStreetLine(v))}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ArchivedSelectField
            label="Județ"
            options={[...ROMANIAN_COUNTIES]}
            value={county}
            onChange={onCountyChange}
            placeholder="Selectează județul"
          />
          <ArchivedSelectField
            label="Oraș"
            options={citiesForCounty}
            value={city}
            onChange={setCity}
            placeholder={county ? 'Selectează orașul' : 'Selectează mai întâi județul'}
          />
          <div>
            <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">
              Cod poștal
            </label>
            <input
              type="text"
              placeholder="010001"
              inputMode="numeric"
              value={zipCode}
              onChange={(e) => setZipCode(sanitizeRoPostalCode(e.target.value))}
              maxLength={6}
              className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">
          Descriere
        </label>
        <textarea
          placeholder="Descrierea companiei tale..."
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-[10px] text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-y"
        />
      </div>

      <button
        type="submit"
        className="w-full h-11 bg-slate-900 rounded-[10px] text-white text-sm font-bold font-['Inter'] hover:bg-slate-700 transition-colors mt-1"
      >
        Continuă
      </button>
    </form>
  )
}

export type ArchivedStep3Props = {
  error: string
  servicii: string[]
  toggleServiciu: (id: string) => void
  publicPhone: string
  setPublicPhone: (v: string) => void
  whatsapp: string
  setWhatsapp: (v: string) => void
  website: string
  setWebsite: (v: string) => void
  websiteError: boolean
  setWebsiteError: (v: boolean) => void
  facebookUrl: string
  setFacebookUrl: (v: string) => void
  linkedinUrl: string
  setLinkedinUrl: (v: string) => void
  loading: boolean
  onSubmit: (e: FormEvent) => void
}

/** Former signup step 3: servicii, telefon clienți, prezență online */
export function ArchivedPartnerSignupPublicStep3(props: ArchivedStep3Props) {
  const {
    error,
    servicii,
    toggleServiciu,
    publicPhone,
    setPublicPhone,
    whatsapp,
    setWhatsapp,
    website,
    setWebsite,
    websiteError,
    setWebsiteError,
    facebookUrl,
    setFacebookUrl,
    linkedinUrl,
    setLinkedinUrl,
    loading,
    onSubmit,
  } = props

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-[10px]">
          <p className="text-sm font-['Inter'] text-red-600">{error}</p>
        </div>
      )}
      <div>
        <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
          Servicii oferite
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ARCHIVED_SERVICII_OPTIONS.map((opt) => {
            const selected = servicii.includes(opt.id)
            return (
              <label
                key={opt.id}
                className="flex items-center gap-3 cursor-pointer p-3 rounded-[8px] border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleServiciu(opt.id)}
                  className="w-4 h-4 rounded border-gray-300 accent-slate-900 flex-shrink-0"
                />
                <span className="text-sm font-['Inter'] text-gray-800">{opt.label}</span>
              </label>
            )
          })}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 flex flex-col gap-4">
        <ArchivedField label="Telefon pentru clienți" type="tel" placeholder="+40 7XX XXX XXX" required value={publicPhone} onChange={setPublicPhone} />
        <ArchivedField label="WhatsApp" type="tel" placeholder="+40 7XX XXX XXX" hint="Număr pentru contact WhatsApp" value={whatsapp} onChange={setWhatsapp} />
      </div>

      <div className="border-t border-gray-100 pt-4 flex flex-col gap-4">
        <div className="text-sm font-semibold font-['Inter'] text-gray-700 mb-1">Online Presence</div>
        <div>
          <ArchivedField
            label="Website"
            type="url"
            placeholder="https://www.exemplu.ro"
            required
            value={website}
            onChange={(v) => {
              setWebsite(v)
              setWebsiteError(false)
            }}
          />
          {websiteError && (
            <p className="text-xs text-red-500 font-['Inter'] mt-1">Website-ul este obligatoriu.</p>
          )}
        </div>
        <ArchivedField label="Facebook Page" type="url" placeholder="https://facebook.com/..." value={facebookUrl} onChange={setFacebookUrl} />
        <ArchivedField label="LinkedIn" type="url" placeholder="https://linkedin.com/company/..." value={linkedinUrl} onChange={setLinkedinUrl} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-slate-900 rounded-[10px] text-white text-sm font-bold font-['Inter'] hover:bg-slate-700 transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Se salvează...' : 'Finalizează înregistrarea'}
      </button>
    </form>
  )
}
