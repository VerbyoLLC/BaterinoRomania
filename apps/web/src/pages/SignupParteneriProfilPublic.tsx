import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { savePartnerProfile, getAuthToken } from '../lib/api'

const ROMANIAN_COUNTIES = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brașov', 'Brăila',
  'București', 'Buzău', 'Călărași', 'Caraș-Severin', 'Cluj', 'Constanța', 'Covasna', 'Dâmbovița',
  'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov',
  'Maramureș', 'Mehedinți', 'Mureș', 'Neamț', 'Olt', 'Prahova', 'Sălaj', 'Satu Mare', 'Sibiu',
  'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vaslui', 'Vâlcea', 'Vrancea',
]

const ROMANIAN_CITIES = [
  'Alba Iulia', 'Arad', 'Pitești', 'Bacău', 'Oradea', 'Bistrița', 'Botoșani', 'Brașov', 'Brăila',
  'București', 'Buzău', 'Călărași', 'Reșița', 'Cluj-Napoca', 'Constanța', 'Sfântu Gheorghe', 'Târgoviște',
  'Craiova', 'Galați', 'Giurgiu', 'Târgu Jiu', 'Miercurea Ciuc', 'Deva', 'Slobozia', 'Iași',
  'Baia Mare', 'Drobeta-Turnu Severin', 'Târgu Mureș', 'Piatra Neamț', 'Slatina', 'Ploiești',
  'Zalău', 'Satu Mare', 'Sibiu', 'Suceava', 'Alexandria', 'Timișoara', 'Tulcea', 'Vaslui',
  'Râmnicu Vâlcea', 'Focșani',
]

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

function Field({ label, type = 'text', placeholder, required, hint, value, onChange }: {
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
        {...(value !== undefined && onChange ? { value, onChange: (e) => onChange(e.target.value) } : {})}
        className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
      />
      {hint && <p className="text-xs text-gray-400 font-['Inter'] mt-1">{hint}</p>}
    </div>
  )
}

function SelectField({ label, options, value, onChange, required, placeholder }: {
  label: string
  options: { value: string; label: string }[] | string[]
  value: string
  onChange: (v: string) => void
  required?: boolean
  placeholder?: string
}) {
  const opts = options.map((o) => typeof o === 'string' ? { value: o, label: o } : o)
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

export default function SignupParteneriProfilPublic() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [publicName, setPublicName] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [county, setCounty] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [description, setDescription] = useState('')
  const [servicii, setServicii] = useState<string[]>([])
  const [publicPhone, setPublicPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [website, setWebsite] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [websiteError, setWebsiteError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!getAuthToken()) navigate('/login', { replace: true })
  }, [navigate])

  function toggleServiciu(id: string) {
    setServicii((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setLogoPreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setLogoPreview(null)
    }
  }

  function handleStep1Continue(e: React.FormEvent) {
    e.preventDefault()
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const websiteTrimmed = website.trim()
    if (!websiteTrimmed) {
      setWebsiteError(true)
      return
    }
    setWebsiteError(false)
    if (!getAuthToken()) {
      setError('Trebuie să fii autentificat.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await savePartnerProfile({
        publicName: publicName.trim() || undefined,
        street: street.trim() || undefined,
        county: county || undefined,
        city: city || undefined,
        zipCode: zipCode.trim() || undefined,
        description: description.trim() || undefined,
        services: servicii.length ? servicii : undefined,
        publicPhone: publicPhone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        website: websiteTrimmed,
        facebookUrl: facebookUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
      })
      navigate('/partner')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la salvarea profilului.')
    } finally {
      setLoading(false)
    }
  }

  function handleBack() {
    if (step === 2) {
      setStep(1)
    } else {
      navigate('/signup/parteneri/profil')
    }
  }

  return (
    <AuthLayout
      image="/images/login/login-partner.jpg"
      supertitle={step === 1 ? 'PASUL 1' : 'PASUL 2'}
      title="PROFIL PUBLIC"
    >
      {/* Back / Skip */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm font-['Inter'] text-gray-500 hover:text-black transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Înapoi
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-sm font-['Inter'] text-gray-500 hover:text-black transition-colors"
        >
          Sari peste
        </button>
      </div>

      <h2 className="text-black text-2xl font-extrabold font-['Inter'] mb-1">
        Profilul Public al Companiei ({step} din 2)
      </h2>
      <p className="text-gray-500 text-sm font-['Inter'] mb-6">
        Aceste informații vor fi afișate utilizatorilor care caută companii de instalatori pe site-ul Baterino.
      </p>

      {step === 1 ? (
        <form className="flex flex-col gap-4" onSubmit={handleStep1Continue}>
          {/* Logo */}
          <div>
            <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
              Logo companie
            </label>
            <div className="flex items-center gap-4">
              <div
                className="w-28 h-28 rounded-[10px] border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
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
                onChange={handleLogoChange}
                className="hidden"
              />
              <p className="text-xs text-gray-500 font-['Inter']">
                PNG, JPG. Max 2MB.
              </p>
            </div>
          </div>

          <Field label="Nume public" placeholder="ex: Solar Pro SRL" required value={publicName} onChange={setPublicName} />

          <div className="border-t border-gray-100 pt-4 flex flex-col gap-4">
              <Field
                label="Stradă"
                placeholder="ex: Str. Exemplu nr. 1"
                value={street}
                onChange={setStreet}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Județ"
                  options={ROMANIAN_COUNTIES}
                  value={county}
                  onChange={setCounty}
                  placeholder="Selectează județul"
                />
                <SelectField
                  label="Oraș"
                  options={ROMANIAN_CITIES}
                  value={city}
                  onChange={setCity}
                  placeholder="Selectează orașul"
                />
                <div>
                  <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">
                    Cod poștal
                  </label>
                  <input
                    type="text"
                    placeholder="ex: 010001"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
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
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-[10px]">
              <p className="text-sm font-['Inter'] text-red-600">{error}</p>
            </div>
          )}
          {/* Servicii oferite – checkboxes */}
          <div>
            <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
              Servicii oferite
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SERVICII_OPTIONS.map((opt) => {
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
            <Field label="Telefon pentru clienți" type="tel" placeholder="+40 7XX XXX XXX" required value={publicPhone} onChange={setPublicPhone} />
            <Field label="WhatsApp" type="tel" placeholder="+40 7XX XXX XXX" hint="Număr pentru contact WhatsApp" value={whatsapp} onChange={setWhatsapp} />
          </div>

          <div className="border-t border-gray-100 pt-4 flex flex-col gap-4">
            <div className="text-sm font-semibold font-['Inter'] text-gray-700 mb-1">Online Presence</div>
            <div>
              <Field
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
            <Field label="Facebook Page" type="url" placeholder="https://facebook.com/..." value={facebookUrl} onChange={setFacebookUrl} />
            <Field label="LinkedIn" type="url" placeholder="https://linkedin.com/company/..." value={linkedinUrl} onChange={setLinkedinUrl} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-slate-900 rounded-[10px] text-white text-sm font-bold font-['Inter'] hover:bg-slate-700 transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Se salvează...' : 'Finalizează înregistrarea'}
          </button>
        </form>
      )}

      <p className="text-center text-xs font-['Inter'] text-gray-400 mt-4 leading-5 px-2">
        După trimitere, echipa Baterino va verifica datele și vei primi un email de confirmare.
      </p>

      <p className="text-center text-sm font-['Inter'] text-gray-500 mt-4">
        Ai deja cont?{' '}
        <Link to="/login" className="text-black font-semibold hover:underline">
          Autentifică-te
        </Link>
      </p>
    </AuthLayout>
  )
}
