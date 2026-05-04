import { useState, useEffect, type ComponentProps } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { savePartnerProfile, getPartnerProfile, getAuthToken } from '../lib/api'
import {
  PARTNER_SIGNUP_ACTIVITY_DRAFT_KEY,
  type PartnerActivityDraft,
} from '../lib/partnerSignupDraft'
import { normalizePartnerWebsite, sanitizePersonName, sanitizePhoneDigitsOnly } from '../lib/formInputSanitize'

/**
 * Former steps 2–3 of this wizard live in `ArchivedPartnerSignupPublicSteps.tsx`
 * for porting into the partner panel — not routed here.
 */

type ActivityType = 'instalator' | 'distribuitor' | 'integrator' | 'altul'

const ACTIVITY_OPTIONS: { id: ActivityType; label: string }[] = [
  { id: 'instalator', label: 'Instalator' },
  { id: 'distribuitor', label: 'Distribuitor' },
  { id: 'integrator', label: 'Integrator sisteme' },
  { id: 'altul', label: 'Altul' },
]

function Field({ label, type = 'text', placeholder, required, hint, value, onChange, disabled, inputMode, autoComplete }: {
  label: string
  type?: string
  placeholder: string
  required?: boolean
  hint?: string
  value?: string
  onChange?: (v: string) => void
  disabled?: boolean
  inputMode?: ComponentProps<'input'>['inputMode']
  autoComplete?: string
}) {
  return (
    <div>
      <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        inputMode={inputMode}
        autoComplete={autoComplete}
        {...(value !== undefined && onChange ? { value, onChange: (e) => onChange(e.target.value) } : {})}
        className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50"
      />
      {hint && <p className="text-xs text-gray-400 font-['Inter'] mt-1">{hint}</p>}
    </div>
  )
}

function ActivityFormSkeleton() {
  const fieldSkeleton = (labelW: string) => (
    <div>
      <div className={`h-4 bg-gray-200 rounded mb-2 ${labelW}`} />
      <div className="h-11 bg-gray-100 rounded-[10px] border border-gray-100" />
    </div>
  )
  return (
    <div
      className="flex flex-col gap-4 animate-pulse"
      aria-busy="true"
      aria-label="Se încarcă datele salvate"
    >
      <div>
        <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 bg-gray-100 rounded-[8px] border border-gray-100" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-11 bg-gray-100 rounded-[10px] border border-gray-100" />
        <div className="h-3 w-52 bg-gray-100 rounded" />
      </div>
      <hr className="my-6 w-full border-0 border-t border-gray-200" aria-hidden="true" />
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {fieldSkeleton('w-28')}
          {fieldSkeleton('w-24')}
        </div>
        {fieldSkeleton('w-16')}
      </div>
      <div className="h-11 bg-gray-200 rounded-[10px]" />
    </div>
  )
}

export default function SignupParteneriProfilPublic() {
  const navigate = useNavigate()
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [contactFirstName, setContactFirstName] = useState('')
  const [contactLastName, setContactLastName] = useState('')
  const [legalPhone, setLegalPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [draftHydrated, setDraftHydrated] = useState(false)

  useEffect(() => {
    if (!getAuthToken()) navigate('/login', { replace: true })
  }, [navigate])

  useEffect(() => {
    if (!getAuthToken()) return
    let cancelled = false
    ;(async () => {
      let usedSession = false
      try {
        const raw = sessionStorage.getItem(PARTNER_SIGNUP_ACTIVITY_DRAFT_KEY)
        if (raw) {
          const d = JSON.parse(raw) as PartnerActivityDraft
          const ids = Array.isArray(d.activities) ? d.activities : []
          const valid = ids.filter((id): id is ActivityType =>
            ACTIVITY_OPTIONS.some((o) => o.id === id),
          )
          const hasAny =
            valid.length > 0 ||
            String(d.contactFirstName ?? '').trim() !== '' ||
            String(d.contactLastName ?? '').trim() !== '' ||
            String(d.legalPhone ?? '').trim() !== '' ||
            String(d.website ?? '').trim() !== ''
          if (hasAny && !cancelled) {
            setActivities(valid)
            setContactFirstName(sanitizePersonName(String(d.contactFirstName ?? '')))
            setContactLastName(sanitizePersonName(String(d.contactLastName ?? '')))
            setLegalPhone(sanitizePhoneDigitsOnly(String(d.legalPhone ?? '')))
            setWebsite(String(d.website ?? '').trim())
            usedSession = true
          }
        }
      } catch {
        /* ignore */
      }
      if (usedSession) {
        setDraftHydrated(true)
        return
      }
      try {
        const p = (await getPartnerProfile()) as {
          activityTypes?: string | null
          contactFirstName?: string | null
          contactLastName?: string | null
          phone?: string | null
          website?: string | null
        }
        if (cancelled) return
        const parts = String(p?.activityTypes ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        const valid = parts.filter((id): id is ActivityType =>
          ACTIVITY_OPTIONS.some((o) => o.id === id),
        )
        if (valid.length) setActivities(valid)
        setContactFirstName(sanitizePersonName(String(p?.contactFirstName ?? '')))
        setContactLastName(sanitizePersonName(String(p?.contactLastName ?? '')))
        setLegalPhone(sanitizePhoneDigitsOnly(String(p?.phone ?? '')))
        setWebsite(String(p?.website ?? '').trim())
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
      const payload: PartnerActivityDraft = {
        activities,
        contactFirstName,
        contactLastName,
        legalPhone,
        website,
      }
      sessionStorage.setItem(PARTNER_SIGNUP_ACTIVITY_DRAFT_KEY, JSON.stringify(payload))
    } catch {
      /* ignore */
    }
  }, [draftHydrated, activities, contactFirstName, contactLastName, legalPhone, website])

  function toggleActivity(id: ActivityType) {
    setActivities((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  async function handleSubmitApplication(e: React.FormEvent) {
    e.preventDefault()
    if (!contactFirstName.trim() || !contactLastName.trim() || !legalPhone.trim() || activities.length === 0) {
      setError('Completează tipul de activitate, numele contactului și telefonul.')
      return
    }
    if (!getAuthToken()) {
      setError('Trebuie să fii autentificat.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await savePartnerProfile({
        activityTypes: activities,
        contactFirstName: sanitizePersonName(contactFirstName).trim(),
        contactLastName: sanitizePersonName(contactLastName).trim(),
        phone: sanitizePhoneDigitsOnly(legalPhone),
        website: normalizePartnerWebsite(website),
      })
      try {
        sessionStorage.removeItem(PARTNER_SIGNUP_ACTIVITY_DRAFT_KEY)
      } catch {
        /* ignore */
      }
      navigate('/partner', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la salvarea datelor.')
    } finally {
      setLoading(false)
    }
  }

  function handleBack() {
    setError('')
    navigate('/signup/parteneri/profil')
  }

  return (
    <AuthLayout
      image="/images/login/login-partner.jpg"
      supertitle="ÎNREGISTRARE PARTENER"
      title="ACTIVITATE ȘI CONTACT"
    >
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={handleBack}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm font-['Inter'] text-gray-500 hover:text-black transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Înapoi
        </button>
      </div>

      <h2 className="text-black text-2xl font-extrabold font-['Inter'] mb-1">
        Activitate și contact
      </h2>
      <p className="text-gray-500 text-sm font-['Inter'] mb-6">
        Alege tipul de activitate și introdu persoana de contact principală.
      </p>

      {!draftHydrated ? (
        <>
          <p className="text-sm font-['Inter'] text-gray-500 mb-2 flex items-center gap-2">
            <span className="inline-block h-4 w-4 border-2 border-gray-300 border-t-slate-900 rounded-full animate-spin flex-shrink-0" aria-hidden />
            Se încarcă datele salvate…
          </p>
          <ActivityFormSkeleton />
        </>
      ) : (
      <form className="flex flex-col gap-4" onSubmit={(e) => void handleSubmitApplication(e)}>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-[10px]">
            <p className="text-sm font-['Inter'] text-red-600">{error}</p>
          </div>
        )}
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
                  disabled={loading}
                  onClick={() => toggleActivity(opt.id)}
                  className={`h-9 px-3 rounded-[8px] border text-sm font-['Inter'] font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
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

        <Field
          label="Website"
          type="url"
          placeholder="https://exemplu.ro"
          hint="Dacă nu puneți https://, îl adăugăm automat."
          value={website}
          onChange={(v) => setWebsite(v.replace(/[\u0000-\u001F\u007F]/g, '').slice(0, 512))}
          disabled={loading}
          autoComplete="url"
        />

        <hr className="my-6 w-full border-0 border-t border-gray-200" aria-hidden="true" />

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prenume contact" placeholder="Ion" required value={contactFirstName} onChange={(v) => setContactFirstName(sanitizePersonName(v))} disabled={loading} autoComplete="given-name" />
            <Field label="Nume contact" placeholder="Popescu" required value={contactLastName} onChange={(v) => setContactLastName(sanitizePersonName(v))} disabled={loading} autoComplete="family-name" />
          </div>
          <Field
            label="Telefon"
            type="text"
            inputMode="numeric"
            placeholder="40712345678"
            required
            value={legalPhone}
            onChange={(v) => setLegalPhone(sanitizePhoneDigitsOnly(v))}
            disabled={loading}
            autoComplete="tel-national"
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
          {loading ? 'Se trimite…' : 'Trimite'}
        </button>
      </form>
      )}
    </AuthLayout>
  )
}
