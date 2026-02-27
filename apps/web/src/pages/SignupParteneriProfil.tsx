import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { savePartnerProfile, getAuthToken } from '../lib/api'

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
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
      />
      {hint && <p className="text-xs text-gray-400 font-['Inter'] mt-1">{hint}</p>}
    </div>
  )
}

type ActivityType = 'instalator' | 'distribuitor' | 'integrator' | 'altul'

const ACTIVITY_OPTIONS: { id: ActivityType; label: string }[] = [
  { id: 'instalator',   label: 'Instalator' },
  { id: 'distribuitor', label: 'Distribuitor' },
  { id: 'integrator',   label: 'Integrator sisteme' },
  { id: 'altul',        label: 'Altul' },
]

export default function SignupParteneriProfil() {
  const navigate = useNavigate()
  const [companyName, setCompanyName] = useState('')
  const [cui, setCui] = useState('')
  const [address, setAddress] = useState('')
  const [tradeRegisterNumber, setTradeRegisterNumber] = useState('')
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [contactFirstName, setContactFirstName] = useState('')
  const [contactLastName, setContactLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!getAuthToken()) navigate('/login', { replace: true })
  }, [navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!getAuthToken()) {
      setError('Trebuie să fii autentificat. Te redirecționăm la login.')
      setTimeout(() => navigate('/login'), 2000)
      return
    }
    if (!companyName.trim() || !cui.trim() || !contactFirstName.trim() || !contactLastName.trim() || !phone.trim() || activities.length === 0) {
      setError('Completează toate câmpurile obligatorii.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await savePartnerProfile({
        companyName: companyName.trim(),
        cui: cui.trim(),
        address: address.trim() || undefined,
        tradeRegisterNumber: tradeRegisterNumber.trim() || undefined,
        activityTypes: activities,
        contactFirstName: contactFirstName.trim(),
        contactLastName: contactLastName.trim(),
        phone: phone.trim(),
      })
      navigate('/signup/parteneri/profil-public')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la salvarea profilului.')
    } finally {
      setLoading(false)
    }
  }

  function toggleActivity(id: ActivityType) {
    setActivities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  return (
    <AuthLayout
      image="/images/login/login-partner.jpg"
      supertitle="APROAPE GATA"
      title="COMPLETEAZĂ PROFILUL"
    >
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate('/signup/clienti')}
        className="flex items-center gap-1.5 text-sm font-['Inter'] text-gray-500 hover:text-black transition-colors mb-6"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Înapoi
      </button>

      <h2 className="text-black text-2xl font-extrabold font-['Inter'] mb-1">
        Completează profilul
      </h2>
      <p className="text-gray-500 text-sm font-['Inter'] mb-6">
        Câțiva pași și contul tău de partener este activ.
      </p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-[10px]">
            <p className="text-sm font-['Inter'] text-red-600">{error}</p>
          </div>
        )}
        {/* Company */}
        <Field label="Denumire firmă" placeholder="S.C. Firma SRL" required value={companyName} onChange={setCompanyName} />
        <Field
          label="CUI / CIF"
          placeholder="RO12345678"
          hint="Codul unic de înregistrare al firmei"
          required
          value={cui}
          onChange={setCui}
        />
        <Field label="Adresă" placeholder="ex: Strada, Nr., Oraș, Județ" value={address} onChange={setAddress} />
        <Field label="Nr. Registrul Comerțului" placeholder="J00/000/2020" value={tradeRegisterNumber} onChange={setTradeRegisterNumber} />

        {/* Activity type */}
        <div>
          <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
            Tip activitate <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ACTIVITY_OPTIONS.map((opt) => {
              const selected = activities.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleActivity(opt.id)}
                  className={`h-9 px-3 rounded-[8px] border text-sm font-['Inter'] font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    selected
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'border-gray-300 text-gray-600 hover:border-gray-500'
                  }`}
                >
                  {selected && (
                    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Contact */}
        <div className="border-t border-gray-100 pt-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prenume contact" placeholder="Ion" required value={contactFirstName} onChange={setContactFirstName} />
            <Field label="Nume contact" placeholder="Popescu" required value={contactLastName} onChange={setContactLastName} />
          </div>
          <Field label="Telefon" type="tel" placeholder="+40 7XX XXX XXX" required value={phone} onChange={setPhone} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-slate-900 rounded-[10px] text-white text-sm font-bold font-['Inter'] hover:bg-slate-700 transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Se salvează...' : 'Continuă'}
        </button>
      </form>

      <p className="text-center text-sm font-['Inter'] text-gray-500 mt-4">
        Ai deja cont?{' '}
        <Link to="/login" className="text-black font-semibold hover:underline">
          Autentifică-te
        </Link>
      </p>
    </AuthLayout>
  )
}
