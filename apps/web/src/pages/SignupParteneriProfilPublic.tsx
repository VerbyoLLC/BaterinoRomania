import { useState, useEffect, type ComponentProps } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { savePartnerProfile, getPartnerProfile, getAuthToken, getPartnerOnboardingRedirect } from '../lib/api'
import {
  PARTNER_SIGNUP_ACTIVITY_DRAFT_KEY,
  type PartnerActivityDraft,
  type PartnerSignupChannel,
} from '../lib/partnerSignupDraft'
import { isPartnerWebsiteSyntaxValid, normalizePartnerWebsite, partnerWebsiteForInput, sanitizePersonName, sanitizePhoneDigitsOnly, loadPhoneE164 } from '../lib/formInputSanitize'
import PhoneInput from '../components/PhoneInput'

const CHANNEL_OPTIONS: { id: PartnerSignupChannel; label: string }[] = [
  { id: 'instalator', label: 'Instalator' },
  { id: 'distribuitor', label: 'Distribuitor' },
]

function channelFromProfile(p: {
  partnerChannelType?: string | null
  activityTypes?: string | string[] | null
}): PartnerSignupChannel | '' {
  const ch = String(p.partnerChannelType ?? '').trim().toLowerCase()
  if (ch === 'distributor') return 'distribuitor'
  if (ch === 'installer') return 'instalator'
  const parts = (Array.isArray(p.activityTypes) ? p.activityTypes : String(p.activityTypes ?? '').split(','))
    .map((s) => String(s).trim().toLowerCase())
    .filter(Boolean)
  if (parts.includes('distribuitor')) return 'distribuitor'
  if (parts.includes('instalator')) return 'instalator'
  return ''
}

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
        <div className="flex flex-col gap-2">
          <div className="h-11 bg-gray-100 rounded-[10px] border border-gray-100" />
          <div className="h-11 bg-gray-100 rounded-[10px] border border-gray-100" />
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
  const [channel, setChannel] = useState<PartnerSignupChannel | ''>('')
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
          const d = JSON.parse(raw) as PartnerActivityDraft & { activities?: string[] }
          const ch =
            d.channel === 'instalator' || d.channel === 'distribuitor'
              ? d.channel
              : Array.isArray(d.activities) && d.activities.includes('distribuitor')
                ? 'distribuitor'
                : Array.isArray(d.activities) && d.activities.includes('instalator')
                  ? 'instalator'
                  : ''
          const hasAny =
            ch !== '' ||
            String(d.contactFirstName ?? '').trim() !== '' ||
            String(d.contactLastName ?? '').trim() !== '' ||
            String(d.legalPhone ?? '').trim() !== '' ||
            String(d.website ?? '').trim() !== ''
          if (hasAny && !cancelled) {
            setChannel(ch)
            setContactFirstName(sanitizePersonName(String(d.contactFirstName ?? '')))
            setContactLastName(sanitizePersonName(String(d.contactLastName ?? '')))
            setLegalPhone(loadPhoneE164(String(d.legalPhone ?? '')))
            setWebsite(partnerWebsiteForInput(String(d.website ?? '')))
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
        const p = await getPartnerProfile()
        if (cancelled) return
        if (getPartnerOnboardingRedirect(p) === '/signup/parteneri/profil') {
          navigate('/signup/parteneri/profil', { replace: true })
          return
        }
        const fromProfile = channelFromProfile(p)
        if (fromProfile) setChannel(fromProfile)
        setContactFirstName(sanitizePersonName(String(p?.contactFirstName ?? '')))
        setContactLastName(sanitizePersonName(String(p?.contactLastName ?? '')))
        setLegalPhone(loadPhoneE164(String(p?.phone ?? '')))
        setWebsite(partnerWebsiteForInput(String(p?.website ?? '')))
      } catch {
        /* ignore */
      }
      setDraftHydrated(true)
    })()
    return () => {
      cancelled = true
    }
  }, [navigate])

  useEffect(() => {
    if (!draftHydrated || !getAuthToken()) return
    try {
      const payload: PartnerActivityDraft = {
        channel,
        contactFirstName,
        contactLastName,
        legalPhone,
        website,
      }
      sessionStorage.setItem(PARTNER_SIGNUP_ACTIVITY_DRAFT_KEY, JSON.stringify(payload))
    } catch {
      /* ignore */
    }
  }, [draftHydrated, channel, contactFirstName, contactLastName, legalPhone, website])

  async function handleSubmitApplication(e: React.FormEvent) {
    e.preventDefault()
    if (!channel || !contactFirstName.trim() || !contactLastName.trim() || !legalPhone.trim()) {
      setError('Alege canalul (Instalator sau Distribuitor) și completează contactul.')
      return
    }
    const websiteTrimmed = website.trim()
    if (websiteTrimmed && !isPartnerWebsiteSyntaxValid(websiteTrimmed)) {
      setError('Introdu un domeniu valid (ex: exemplu.ro).')
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
        partnerChannelType: channel === 'distribuitor' ? 'distributor' : 'installer',
        contactFirstName: sanitizePersonName(contactFirstName).trim(),
        contactLastName: sanitizePersonName(contactLastName).trim(),
        phone: sanitizePhoneDigitsOnly(legalPhone),
        website: websiteTrimmed ? normalizePartnerWebsite(websiteTrimmed) : '',
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
      image="/images/login/login-partner.webp"
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
        Alege canalul tău comercial și introdu persoana de contact principală.
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
        <fieldset>
          <legend className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
            Tip activitate <span className="text-red-500">*</span>
          </legend>
          <div className="flex flex-col gap-2">
            {CHANNEL_OPTIONS.map((opt) => (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-center gap-3 rounded-[10px] border px-4 py-3 text-sm font-['Inter'] font-medium transition-colors ${
                  channel === opt.id
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-gray-300 text-gray-700 hover:border-gray-500'
                } ${loading ? 'pointer-events-none opacity-50' : ''}`}
              >
                <input
                  type="radio"
                  name="partner-channel"
                  value={opt.id}
                  checked={channel === opt.id}
                  disabled={loading}
                  onChange={() => setChannel(opt.id)}
                  className="h-4 w-4 shrink-0 accent-slate-900"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>

        <Field
          label="Website"
          placeholder="exemplu.ro"
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
          <div>
            <label className="mb-1 block text-sm font-semibold font-['Inter'] text-gray-700">
              Telefon <span className="text-red-500">*</span>
            </label>
            <PhoneInput
              value={legalPhone}
              onChange={(v) => setLegalPhone(v)}
              disabled={loading}
              autoComplete="tel"
            />
          </div>
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
