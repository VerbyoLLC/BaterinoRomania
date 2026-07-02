import { useState, useEffect, useMemo, type ComponentProps } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { savePartnerProfile, getPartnerProfile, getAuthToken } from '../lib/api'
import {
  PARTNER_SIGNUP_COMPANY_DRAFT_KEY,
  type PartnerCompanyDraft,
} from '../lib/partnerSignupDraft'
import { sanitizeRoPostalCode, sanitizeStreetLine } from '../lib/formInputSanitize'
import { ROMANIAN_COUNTIES, getCitiesForCounty } from '../lib/romanian-counties-cities'

function Field({ label, type = 'text', placeholder, required, hint, value, onChange, maxLength, inputMode, disabled }: {
  label: string
  type?: string
  placeholder: string
  required?: boolean
  hint?: string
  value?: string
  onChange?: (v: string) => void
  maxLength?: number
  inputMode?: ComponentProps<'input'>['inputMode']
  disabled?: boolean
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
        maxLength={maxLength}
        inputMode={inputMode}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50"
      />
      {hint && <p className="text-xs text-gray-400 font-['Inter'] mt-1">{hint}</p>}
    </div>
  )
}

function SelectField({ label, options, value, onChange, required, placeholder, disabled }: {
  label: string
  options: { value: string; label: string }[] | string[]
  value: string
  onChange: (v: string) => void
  required?: boolean
  placeholder?: string
  disabled?: boolean
}) {
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  return (
    <div>
      <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm font-['Inter'] text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {opts.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

function CompanyFormSkeleton() {
  const row = (wLabel: string) => (
    <div>
      <div className={`h-4 bg-gray-200 rounded mb-2 ${wLabel}`} />
      <div className="h-11 bg-gray-100 rounded-[10px] border border-gray-100" />
    </div>
  )
  return (
    <div
      className="flex flex-col gap-4 animate-pulse"
      aria-busy="true"
      aria-label="Se încarcă datele salvate"
    >
      {row('w-36')}
      {row('w-24')}
      <div className="border-t border-gray-100 pt-4 flex flex-col gap-4">
        <div className="h-3 w-40 bg-gray-200 rounded" />
        {row('w-32')}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {row('w-16')}
          {row('w-14')}
        </div>
        {row('w-28')}
      </div>
      <div className="h-11 bg-gray-200 rounded-[10px] mt-1" />
    </div>
  )
}

export default function SignupParteneriProfil() {
  const navigate = useNavigate()
  const [companyName, setCompanyName] = useState('')
  const [cui, setCui] = useState('')
  const [companyStreet, setCompanyStreet] = useState('')
  const [companyCounty, setCompanyCounty] = useState('')
  const [companyCity, setCompanyCity] = useState('')
  const [companyPostalCode, setCompanyPostalCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [draftHydrated, setDraftHydrated] = useState(false)

  const citiesForCounty = useMemo(() => getCitiesForCounty(companyCounty), [companyCounty])

  function handleCountyChange(newCounty: string) {
    setCompanyCounty(newCounty)
    const cities = getCitiesForCounty(newCounty)
    if (!newCounty.trim()) {
      setCompanyCity('')
      return
    }
    if (companyCity && !cities.includes(companyCity)) setCompanyCity('')
  }

  useEffect(() => {
    if (!getAuthToken()) navigate('/login', { replace: true })
  }, [navigate])

  useEffect(() => {
    if (!getAuthToken()) return
    let cancelled = false
    ;(async () => {
      try {
        const p = await getPartnerProfile() as {
          companyName?: string | null
          cui?: string | null
          companyStreet?: string | null
          companyCounty?: string | null
          companyCity?: string | null
          companyPostalCode?: string | null
        }
        if (cancelled) return
        const hasSavedCompany =
          String(p?.companyName ?? '').trim() !== '' && String(p?.cui ?? '').trim() !== ''
        if (hasSavedCompany) {
          setCompanyName(String(p.companyName ?? ''))
          setCui(String(p.cui ?? ''))
          setCompanyStreet(String(p.companyStreet ?? ''))
          setCompanyCounty(String(p.companyCounty ?? ''))
          setCompanyCity(String(p.companyCity ?? ''))
          setCompanyPostalCode(String(p.companyPostalCode ?? '').replace(/\D/g, '').slice(0, 6))
          setDraftHydrated(true)
          return
        }
      } catch {
        /* fall through to session */
      }
      try {
        const raw = sessionStorage.getItem(PARTNER_SIGNUP_COMPANY_DRAFT_KEY)
        if (!raw) {
          setDraftHydrated(true)
          return
        }
        const d = JSON.parse(raw) as PartnerCompanyDraft
        if (cancelled) return
        setCompanyName(String(d.companyName ?? ''))
        setCui(String(d.cui ?? ''))
        setCompanyStreet(String(d.companyStreet ?? ''))
        setCompanyCounty(String(d.companyCounty ?? ''))
        setCompanyCity(String(d.companyCity ?? ''))
        setCompanyPostalCode(String(d.companyPostalCode ?? '').replace(/\D/g, '').slice(0, 6))
      } catch {
        /* ignore */
      }
      setDraftHydrated(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!draftHydrated || !getAuthToken()) return
    try {
      const payload: PartnerCompanyDraft = {
        companyName,
        cui,
        companyStreet,
        companyCounty,
        companyCity,
        companyPostalCode,
      }
      sessionStorage.setItem(PARTNER_SIGNUP_COMPANY_DRAFT_KEY, JSON.stringify(payload))
    } catch {
      /* ignore quota */
    }
  }, [draftHydrated, companyName, cui, companyStreet, companyCounty, companyCity, companyPostalCode])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!getAuthToken()) {
      setError('Trebuie să fii autentificat. Te redirecționăm la login.')
      setTimeout(() => navigate('/login'), 2000)
      return
    }
    if (
      !companyName.trim() ||
      !cui.trim() ||
      !companyStreet.trim() ||
      !companyCounty.trim() ||
      !companyCity.trim() ||
      !companyPostalCode.trim()
    ) {
      setError('Completează toate câmpurile obligatorii, inclusiv adresa sediului.')
      return
    }
    const postalDigits = companyPostalCode.trim()
    if (!/^\d{6}$/.test(postalDigits)) {
      setError('Codul poștal trebuie să conțină exact 6 cifre.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const street = companyStreet.trim()
      const city = companyCity.trim()
      const county = companyCounty.trim()
      const postal = postalDigits
      await savePartnerProfile({
        companyName: companyName.trim(),
        cui: cui.trim(),
        companyStreet: street,
        companyCity: city,
        companyCounty: county,
        companyPostalCode: postal,
        address: [street, city, county, postal].filter(Boolean).join(', '),
      })
      try {
        sessionStorage.removeItem(PARTNER_SIGNUP_COMPANY_DRAFT_KEY)
      } catch {
        /* ignore */
      }
      navigate('/signup/parteneri/profil-public', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la salvarea profilului.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      image="/images/login/login-partner.webp"
      supertitle="APROAPE GATA"
      title="DATE COMPANIE"
    >
      <button
        type="button"
        onClick={() => navigate('/signup/clienti')}
        disabled={loading}
        className="flex items-center gap-1.5 text-sm font-['Inter'] text-gray-500 hover:text-black transition-colors mb-6 disabled:opacity-40 disabled:pointer-events-none"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Înapoi
      </button>

      <h2 className="text-black text-2xl font-extrabold font-['Inter'] mb-1">
        Date companie
      </h2>
      <p className="text-gray-500 text-sm font-['Inter'] mb-6">
        Introdu datele companiei tale.
      </p>

      {!draftHydrated ? (
        <>
          <p className="text-sm font-['Inter'] text-gray-500 mb-2 flex items-center gap-2">
            <span className="inline-block h-4 w-4 border-2 border-gray-300 border-t-slate-900 rounded-full animate-spin flex-shrink-0" aria-hidden />
            Se încarcă datele salvate…
          </p>
          <CompanyFormSkeleton />
        </>
      ) : (
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-[10px]">
            <p className="text-sm font-['Inter'] text-red-600">{error}</p>
          </div>
        )}
        <Field label="Denumire firmă" placeholder="S.C. Firma SRL" required value={companyName} onChange={setCompanyName} disabled={loading} />
        <Field
          label="CUI / CIF"
          placeholder="RO12345678"
          required
          value={cui}
          onChange={setCui}
          disabled={loading}
        />

        <div className="border-t border-gray-100 pt-4 flex flex-col gap-4">
          <p className="text-xs font-semibold font-['Inter'] text-gray-600 uppercase tracking-wide">
            Adresă sediu social
          </p>
          <Field
            label="Stradă și număr"
            placeholder="ex: Str Exemplu nr 10"
            required
            value={companyStreet}
            onChange={(v) => setCompanyStreet(sanitizeStreetLine(v))}
            disabled={loading}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Județ"
              options={[...ROMANIAN_COUNTIES]}
              value={companyCounty}
              onChange={handleCountyChange}
              placeholder="Selectează județul"
              required
              disabled={loading}
            />
            <SelectField
              label="Oraș"
              options={citiesForCounty}
              value={companyCity}
              onChange={setCompanyCity}
              placeholder="Selectează orașul"
              required
              disabled={loading || !companyCounty}
            />
          </div>
          <Field
            label="Cod poștal"
            placeholder="010001"
            required
            value={companyPostalCode}
            onChange={(v) => setCompanyPostalCode(sanitizeRoPostalCode(v))}
            maxLength={6}
            inputMode="numeric"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-slate-900 rounded-[10px] text-white text-sm font-bold font-['Inter'] hover:bg-slate-700 transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          {loading && (
            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden />
          )}
          {loading ? 'Se salvează…' : 'Continuă'}
        </button>
      </form>
      )}
    </AuthLayout>
  )
}
