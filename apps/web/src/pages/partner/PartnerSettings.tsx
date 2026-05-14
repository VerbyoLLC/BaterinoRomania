import { useState, useEffect, useMemo, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Building2, MapPin, KeyRound, Mail, Shield, Trash2 } from 'lucide-react'
import {
  deletePartnerAccount,
  clearAuth,
  getAuthEmail,
  getPartnerProfile,
  savePartnerProfile,
} from '../../lib/api'
import {
  formatRoNational9Display,
  sanitizePersonName,
  sanitizeRoPostalCode,
  sanitizeStreetLine,
} from '../../lib/formInputSanitize'
import { ROMANIAN_COUNTIES, getCitiesForCounty } from '../../lib/romanian-counties-cities'

type SettingsSectionKey = 'personal' | 'company' | 'delivery' | 'password' | 'email' | 'twoFactor' | 'delete'

type ActivityType = 'instalator' | 'distribuitor' | 'integrator' | 'altul'
const ACTIVITY_OPTIONS: { id: ActivityType; label: string }[] = [
  { id: 'instalator', label: 'Instalator' },
  { id: 'distribuitor', label: 'Distribuitor' },
  { id: 'integrator', label: 'Integrator sisteme' },
  { id: 'altul', label: 'Altul' },
]

const NAV_ITEMS: {
  key: SettingsSectionKey
  label: string
  icon: typeof User
}[] = [
  { key: 'personal', label: 'Date personale', icon: User },
  { key: 'company', label: 'Date companie', icon: Building2 },
  { key: 'delivery', label: 'Adresa de livrare', icon: MapPin },
  { key: 'password', label: 'Schimbă parola', icon: KeyRound },
  { key: 'email', label: 'Schimbă email', icon: Mail },
  { key: 'twoFactor', label: 'Autentificare în doi pași', icon: Shield },
  { key: 'delete', label: 'Șterge contul', icon: Trash2 },
]

const SECTION_IDS: Record<SettingsSectionKey, string> = {
  personal: 'partner-settings-personal',
  company: 'partner-settings-company',
  delivery: 'partner-settings-delivery',
  password: 'partner-settings-password',
  email: 'partner-settings-email',
  twoFactor: 'partner-settings-2fa',
  delete: 'partner-settings-delete',
}

function SettingsPanel({
  sectionId,
  title,
  icon,
  children,
}: {
  sectionId: string
  title: string
  icon: ReactNode
  children: React.ReactNode
}) {
  const headingId = `${sectionId}-heading`
  return (
    <section
      id={sectionId}
      className="scroll-mt-24"
      aria-labelledby={headingId}
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600" aria-hidden>
            {icon}
          </span>
          <h2 id={headingId} className="text-lg font-bold font-['Inter'] text-slate-900">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  )
}

function Field({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required,
  maxLength,
  inputMode,
  readOnly,
  hint,
}: {
  label: string
  type?: string
  placeholder: string
  value: string
  onChange?: (v: string) => void
  required?: boolean
  maxLength?: number
  inputMode?: React.ComponentProps<'input'>['inputMode']
  readOnly?: boolean
  hint?: string
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold font-['Inter'] text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {hint ? <p className="mb-1.5 text-xs text-gray-500 font-['Inter']">{hint}</p> : null}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        inputMode={inputMode}
        readOnly={readOnly}
        disabled={readOnly}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={`h-11 w-full rounded-xl border px-4 text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/25 ${
          readOnly ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-600' : 'border-gray-300 focus:border-blue-600'
        }`}
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
      <label className="mb-1 block text-sm font-semibold font-['Inter'] text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-gray-300 bg-white px-4 pr-10 text-sm font-['Inter'] text-gray-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60"
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

function FieldSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <div className="mb-2 h-4 max-w-[40%] w-32 animate-pulse rounded bg-gray-200" aria-hidden />
      <div className="h-11 w-full animate-pulse rounded-xl bg-gray-200" aria-hidden />
    </div>
  )
}

function DetaliiFirmaFormSkeleton() {
  return (
    <div className="pointer-events-none flex flex-col gap-4 select-none" aria-busy aria-label="Se încarcă datele firmei">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldSkeleton />
        <FieldSkeleton />
      </div>
      <div className="h-3 w-40 animate-pulse rounded bg-gray-200" aria-hidden />
      <FieldSkeleton />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldSkeleton />
        <FieldSkeleton />
      </div>
      <FieldSkeleton />
      <FieldSkeleton />
      <div className="my-4 border-y border-gray-200 py-6 sm:my-6 sm:py-8">
        <div className="mb-3 h-4 w-36 animate-pulse rounded bg-gray-200" aria-hidden />
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((k) => (
            <div key={k} className="h-9 animate-pulse rounded-lg bg-gray-200" aria-hidden />
          ))}
        </div>
      </div>
      <div className="h-11 w-48 animate-pulse rounded-xl bg-gray-200" aria-hidden />
    </div>
  )
}

export default function PartnerSettings() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<SettingsSectionKey>('personal')

  const [isSuspended, setIsSuspended] = useState(false)
  const [partnerApproved, setPartnerApproved] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [accountEmail, setAccountEmail] = useState<string | null>(null)

  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')

  const [companyName, setCompanyName] = useState('')
  const [cui, setCui] = useState('')
  const [companyStreet, setCompanyStreet] = useState('')
  const [companyCity, setCompanyCity] = useState('')
  const [companyCounty, setCompanyCounty] = useState('')
  const [companyPostalCode, setCompanyPostalCode] = useState('')
  const [tradeRegisterNumber, setTradeRegisterNumber] = useState('')
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [contactFirstName, setContactFirstName] = useState('')
  const [contactLastName, setContactLastName] = useState('')
  const [phone, setPhone] = useState('')

  const [savingPersonal, setSavingPersonal] = useState(false)
  const [savePersonalOk, setSavePersonalOk] = useState(false)
  const [personalError, setPersonalError] = useState('')

  const [savingCompany, setSavingCompany] = useState(false)
  const [saveCompanyOk, setSaveCompanyOk] = useState(false)
  const [companyError, setCompanyError] = useState('')

  const [deliveryStreet, setDeliveryStreet] = useState('')
  const [deliveryCounty, setDeliveryCounty] = useState('')
  const [deliveryCity, setDeliveryCity] = useState('')
  const [deliveryPostalCode, setDeliveryPostalCode] = useState('')
  const [savingDelivery, setSavingDelivery] = useState(false)
  const [saveDeliveryOk, setSaveDeliveryOk] = useState(false)
  const [deliveryError, setDeliveryError] = useState('')

  const [passwordCurrent, setPasswordCurrent] = useState('')
  const [passwordNew, setPasswordNew] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const citiesForCompanyCounty = useMemo(() => getCitiesForCounty(companyCounty), [companyCounty])
  const citiesForDeliveryCounty = useMemo(() => getCitiesForCounty(deliveryCounty), [deliveryCounty])

  function handleCompanyCountyChange(newCounty: string) {
    setCompanyCounty(newCounty)
    if (!newCounty.trim()) {
      setCompanyCity('')
      return
    }
    const cities = getCitiesForCounty(newCounty)
    if (companyCity && !cities.includes(companyCity)) setCompanyCity('')
  }

  function handleDeliveryCountyChange(newCounty: string) {
    setDeliveryCounty(newCounty)
    if (!newCounty.trim()) {
      setDeliveryCity('')
      return
    }
    const cities = getCitiesForCounty(newCounty)
    if (deliveryCity && !cities.includes(deliveryCity)) setDeliveryCity('')
  }

  function toggleActivity(id: ActivityType) {
    setActivities((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  useEffect(() => {
    setAccountEmail(getAuthEmail())
    let cancelled = false
    setProfileLoading(true)
    setProfileError('')
    getPartnerProfile()
      .then((p) => {
        if (cancelled) return
        setIsSuspended(p?.isSuspended === true)
        setPartnerApproved(p?.isApproved !== false)
        setCompanyName(String(p?.companyName ?? '').trim())
        setCui(String(p?.cui ?? '').trim())
        setCompanyStreet(String(p?.companyStreet ?? '').trim())
        setCompanyCity(String(p?.companyCity ?? '').trim())
        setCompanyCounty(String(p?.companyCounty ?? '').trim())
        setCompanyPostalCode(String(p?.companyPostalCode ?? '').trim())
        setTradeRegisterNumber(String(p?.tradeRegisterNumber ?? '').trim())
        const actIds: ActivityType[] = ['instalator', 'distribuitor', 'integrator', 'altul']
        const fromApi = p?.activityTypes
          ? String(p.activityTypes)
              .split(',')
              .map((s) => s.trim())
              .filter((s): s is ActivityType => actIds.includes(s as ActivityType))
          : []
        setActivities(fromApi)
        setContactFirstName(String(p?.contactFirstName ?? '').trim())
        setContactLastName(String(p?.contactLastName ?? '').trim())
        const ph = String(p?.phone ?? '').replace(/\D/g, '').slice(0, 9)
        setPhone(ph)
        setDeliveryStreet(String(p?.deliveryStreet ?? '').trim())
        setDeliveryCounty(String(p?.deliveryCounty ?? '').trim())
        setDeliveryCity(String(p?.deliveryCity ?? '').trim())
        setDeliveryPostalCode(String(p?.deliveryPostalCode ?? '').trim())
      })
      .catch((err) => {
        if (!cancelled) setProfileError(err instanceof Error ? err.message : 'Nu am putut încărca profilul.')
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const settingsLockedPending = !isSuspended && !partnerApproved
  const formsLocked = settingsLockedPending || isSuspended

  async function handleSavePersonal(e: React.FormEvent) {
    e.preventDefault()
    if (settingsLockedPending) return
    setSavePersonalOk(false)
    setPersonalError('')
    const fn = sanitizePersonName(contactFirstName).trim()
    const ln = sanitizePersonName(contactLastName).trim()
    const phoneDigits = phone.replace(/\D/g, '').slice(0, 9)
    if (!fn || !ln) {
      setPersonalError('Completează numele și prenumele.')
      return
    }
    if (phoneDigits.length !== 9) {
      setPersonalError('Introdu exact 9 cifre pentru telefon (fără prefix +40 în câmp).')
      return
    }
    setSavingPersonal(true)
    try {
      await savePartnerProfile({
        contactFirstName: fn,
        contactLastName: ln,
        phone: phoneDigits,
      })
      setSavePersonalOk(true)
    } catch (err) {
      setPersonalError(err instanceof Error ? err.message : 'Eroare la salvare.')
    } finally {
      setSavingPersonal(false)
    }
  }

  async function handleSaveCompany(e: React.FormEvent) {
    e.preventDefault()
    if (settingsLockedPending) return
    setSaveCompanyOk(false)
    setCompanyError('')
    if (!companyName.trim() || !cui.trim() || activities.length === 0) {
      setCompanyError('Completează denumirea, CUI și cel puțin un tip de activitate.')
      return
    }
    const cpCheck = companyPostalCode.trim()
    if (cpCheck && !/^\d{6}$/.test(cpCheck)) {
      setCompanyError('Codul poștal (sediu) trebuie să aibă exact 6 cifre.')
      return
    }
    setSavingCompany(true)
    try {
      const cs = companyStreet.trim()
      const ccity = companyCity.trim()
      const ccounty = companyCounty.trim()
      const cp = companyPostalCode.trim()
      const legacyAddress = [cs, ccity, ccounty, cp].filter(Boolean).join(', ')
      await savePartnerProfile({
        companyName: companyName.trim(),
        cui: cui.trim(),
        address: legacyAddress || undefined,
        companyStreet: cs || undefined,
        companyCity: ccity || undefined,
        companyCounty: ccounty || undefined,
        companyPostalCode: cp || undefined,
        tradeRegisterNumber: tradeRegisterNumber.trim() || undefined,
        activityTypes: activities,
      })
      setSaveCompanyOk(true)
    } catch (err) {
      setCompanyError(err instanceof Error ? err.message : 'Eroare la salvare.')
    } finally {
      setSavingCompany(false)
    }
  }

  async function handleSaveDelivery(e: React.FormEvent) {
    e.preventDefault()
    if (settingsLockedPending) return
    setSaveDeliveryOk(false)
    setDeliveryError('')
    const ds = deliveryStreet.trim()
    const dcounty = deliveryCounty.trim()
    const dcity = deliveryCity.trim()
    const dp = deliveryPostalCode.trim()
    const anyFilled = ds || dcounty || dcity || dp
    if (anyFilled && (!ds || !dcounty || !dcity || !dp)) {
      setDeliveryError('Completează toate câmpurile pentru adresă livrare sau golește-le pentru a elimina adresa salvată.')
      return
    }
    if (dp && !/^\d{6}$/.test(dp)) {
      setDeliveryError('Codul poștal trebuie să aibă exact 6 cifre.')
      return
    }
    setSavingDelivery(true)
    try {
      await savePartnerProfile({
        deliveryStreet: anyFilled ? ds : '',
        deliveryCounty: anyFilled ? dcounty : '',
        deliveryCity: anyFilled ? dcity : '',
        deliveryPostalCode: anyFilled ? dp : '',
      })
      setSaveDeliveryOk(true)
      if (!anyFilled) {
        setDeliveryStreet('')
        setDeliveryCounty('')
        setDeliveryCity('')
        setDeliveryPostalCode('')
      }
    } catch (err) {
      setDeliveryError(err instanceof Error ? err.message : 'Eroare la salvare.')
    } finally {
      setSavingDelivery(false)
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'DELETE') return
    setDeleting(true)
    setDeleteError('')
    try {
      await deletePartnerAccount()
      clearAuth()
      navigate('/login', { replace: true })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Eroare la ștergerea contului.')
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    const sections = NAV_ITEMS.map(({ key }) => document.getElementById(SECTION_IDS[key])).filter(
      (el): el is HTMLElement => el != null,
    )
    if (sections.length === 0) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting && e.intersectionRatio > 0)
        if (!visible.length) return
        visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const id = visible[0].target.id
        const match = (Object.keys(SECTION_IDS) as SettingsSectionKey[]).find((k) => SECTION_IDS[k] === id)
        if (match) setActiveSection(match)
      },
      { root: null, rootMargin: '-10% 0px -42% 0px', threshold: [0, 0.1, 0.22, 0.38, 0.52] },
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  function scrollToSection(key: SettingsSectionKey) {
    document.getElementById(SECTION_IDS[key])?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveSection(key)
  }

  function navDisabled(key: SettingsSectionKey): boolean {
    if (key === 'delete') return false
    return settingsLockedPending
  }

  const primaryBtn =
    'inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 font-[\'Inter\']'

  const settingsSections = (
    <>
      <SettingsPanel sectionId={SECTION_IDS.personal} title="Date personale" icon={<User className="h-5 w-5" strokeWidth={1.75} />}>
          {profileLoading ? (
            <div className="flex flex-col gap-4" aria-busy aria-label="Se încarcă">
              <FieldSkeleton />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldSkeleton />
                <FieldSkeleton />
              </div>
              <FieldSkeleton />
            </div>
          ) : (
            <form className="flex flex-col gap-5" onSubmit={handleSavePersonal}>
              <Field
                label="Email curent"
                placeholder="email@exemplu.ro"
                value={accountEmail ?? ''}
                readOnly
              />
              <p className="-mt-2 text-xs text-gray-500 font-['Inter']">
                Emailul nu poate fi editat aici. Pentru schimbare folosește secțiunea „Schimbă email”.
              </p>
              {profileError ? <p className="text-sm text-red-600 font-['Inter']">{profileError}</p> : null}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Nume"
                  placeholder="Popescu"
                  value={contactLastName}
                  onChange={(v) => {
                    setContactLastName(sanitizePersonName(v))
                    setSavePersonalOk(false)
                  }}
                  required
                />
                <Field
                  label="Prenume"
                  placeholder="Ion"
                  value={contactFirstName}
                  onChange={(v) => {
                    setContactFirstName(sanitizePersonName(v))
                    setSavePersonalOk(false)
                  }}
                  required
                />
              </div>
              <Field
                label="Telefon"
                type="tel"
                placeholder="7xx xxx xxx"
                hint="Prefix +40 (fix); introdu exact 9 cifre."
                value={formatRoNational9Display(phone)}
                onChange={(v) => {
                  setPhone(v.replace(/\D/g, '').slice(0, 9))
                  setSavePersonalOk(false)
                }}
                required
              />
              {personalError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 font-['Inter']">
                  {personalError}
                </div>
              ) : null}
              {savePersonalOk ? <p className="text-sm text-green-700 font-['Inter']">Modificările au fost salvate.</p> : null}
              <button type="submit" disabled={formsLocked || savingPersonal} className={`${primaryBtn} w-fit`}>
                {savingPersonal ? 'Se salvează...' : 'Salvează modificările'}
              </button>
            </form>
          )}
        </SettingsPanel>

      <SettingsPanel sectionId={SECTION_IDS.company} title="Date companie" icon={<Building2 className="h-5 w-5" strokeWidth={1.75} />}>
          <p className="-mt-2 mb-5 text-sm text-gray-500 font-['Inter']">
            Date legale și sediu social (vizibile pentru Echipa Baterino).
          </p>
          {profileLoading ? (
            <div>
              <p className="mb-4 text-sm text-gray-500 font-['Inter']">Se încarcă câmpurile…</p>
              <DetaliiFirmaFormSkeleton />
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSaveCompany}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Denumire firmă"
                  placeholder="S.C. Firma SRL"
                  value={companyName}
                  onChange={setCompanyName}
                  required
                />
                <Field label="CUI / CIF" placeholder="RO12345678" value={cui} onChange={setCui} required />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 font-['Inter']">
                Adresă sediu social
              </p>
              <Field
                label="Stradă și număr"
                placeholder="ex: Str. Exemplu nr 10"
                value={companyStreet}
                onChange={(v) => setCompanyStreet(sanitizeStreetLine(v))}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField
                  label="Județ"
                  options={[...ROMANIAN_COUNTIES]}
                  value={companyCounty}
                  onChange={handleCompanyCountyChange}
                  placeholder="Selectează"
                />
                <SelectField
                  label="Oraș"
                  options={citiesForCompanyCounty}
                  value={companyCity}
                  onChange={setCompanyCity}
                  placeholder="Selectează orașul"
                  disabled={!companyCounty}
                />
              </div>
              <Field
                label="Cod poștal"
                placeholder="010001"
                value={companyPostalCode}
                onChange={(v) => setCompanyPostalCode(sanitizeRoPostalCode(v))}
                maxLength={6}
                inputMode="numeric"
              />
              <Field
                label="Nr. Registrul Comerțului"
                placeholder="J00/000/2020"
                value={tradeRegisterNumber}
                onChange={setTradeRegisterNumber}
              />
              <div className="my-4 border-y border-gray-200 py-6 sm:my-6 sm:py-8">
                <label className="mb-2 block text-sm font-semibold font-['Inter'] text-gray-700">
                  Tip activitate <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleActivity(opt.id)}
                      className={`flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors font-['Inter'] ${
                        activities.includes(opt.id)
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-gray-300 text-gray-600 hover:border-gray-500'
                      }`}
                    >
                      {activities.includes(opt.id) && (
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {companyError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 font-['Inter']">
                  {companyError}
                </div>
              ) : null}
              {saveCompanyOk ? <p className="text-sm text-green-700 font-['Inter']">Datele firmei au fost salvate.</p> : null}
              <button type="submit" disabled={formsLocked || savingCompany} className={`${primaryBtn} w-fit`}>
                {savingCompany ? 'Se salvează...' : 'Salvează modificările'}
              </button>
            </form>
          )}
        </SettingsPanel>

      <SettingsPanel sectionId={SECTION_IDS.delivery} title="Adresa de livrare" icon={<MapPin className="h-5 w-5" strokeWidth={1.75} />}>
          <p className="-mt-2 mb-5 text-sm text-gray-500 font-['Inter']">
            Magazin, depozit sau punct unde primiți livrările; este folosită la precompletarea checkout-ului. Golește toate
            câmpurile și salvează pentru a elimina adresa din sistem.
          </p>
          {profileLoading ? (
            <div className="flex flex-col gap-4" aria-busy aria-label="Se încarcă adresa de livrare">
              <FieldSkeleton />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldSkeleton />
                <FieldSkeleton />
              </div>
              <FieldSkeleton />
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSaveDelivery}>
              <button
                type="button"
                onClick={() => {
                  setDeliveryStreet(companyStreet.trim())
                  setDeliveryCounty(companyCounty.trim())
                  setDeliveryCity(companyCity.trim())
                  setDeliveryPostalCode(companyPostalCode.trim())
                  setSaveDeliveryOk(false)
                  setDeliveryError('')
                }}
                disabled={formsLocked}
                className="w-fit text-sm font-semibold text-blue-700 underline-offset-2 hover:underline font-['Inter'] disabled:pointer-events-none disabled:opacity-50"
              >
                Copiază din sediu social
              </button>
              <Field
                label="Stradă și număr"
                placeholder="ex: Str. Depozit nr 5"
                value={deliveryStreet}
                onChange={(v) => {
                  setDeliveryStreet(sanitizeStreetLine(v))
                  setSaveDeliveryOk(false)
                }}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField
                  label="Județ"
                  options={[...ROMANIAN_COUNTIES]}
                  value={deliveryCounty}
                  onChange={(v) => {
                    handleDeliveryCountyChange(v)
                    setSaveDeliveryOk(false)
                  }}
                  placeholder="Selectează"
                />
                <SelectField
                  label="Oraș"
                  options={citiesForDeliveryCounty}
                  value={deliveryCity}
                  onChange={(v) => {
                    setDeliveryCity(v)
                    setSaveDeliveryOk(false)
                  }}
                  placeholder="Selectează orașul"
                  disabled={!deliveryCounty}
                />
              </div>
              <Field
                label="Cod poștal"
                placeholder="010001"
                value={deliveryPostalCode}
                onChange={(v) => {
                  setDeliveryPostalCode(sanitizeRoPostalCode(v))
                  setSaveDeliveryOk(false)
                }}
                maxLength={6}
                inputMode="numeric"
              />
              {deliveryError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 font-['Inter']">
                  {deliveryError}
                </div>
              ) : null}
              {saveDeliveryOk ? <p className="text-sm text-green-700 font-['Inter']">Adresa de livrare a fost salvată.</p> : null}
              <button type="submit" disabled={formsLocked || savingDelivery} className={`${primaryBtn} w-fit`}>
                {savingDelivery ? 'Se salvează...' : 'Salvează adresa de livrare'}
              </button>
            </form>
          )}
        </SettingsPanel>

      <SettingsPanel sectionId={SECTION_IDS.password} title="Schimbă parola" icon={<KeyRound className="h-5 w-5" strokeWidth={1.75} />}>
          <div className={`flex flex-col gap-4 ${formsLocked ? 'pointer-events-none opacity-50' : ''}`}>
            <Field
              label="Parola actuală"
              type="password"
              placeholder="••••••••"
              value={passwordCurrent}
              onChange={setPasswordCurrent}
            />
            <Field label="Parola nouă" type="password" placeholder="••••••••" value={passwordNew} onChange={setPasswordNew} />
            <Field
              label="Confirmă parola nouă"
              type="password"
              placeholder="••••••••"
              value={passwordConfirm}
              onChange={setPasswordConfirm}
            />
            <button type="button" disabled className={`${primaryBtn} w-fit cursor-not-allowed opacity-70`}>
              Actualizează parola
            </button>
          </div>
          <p className="mt-4 text-xs text-amber-800 font-['Inter']">
            Funcția va fi disponibilă după conectarea la sistemul de conturi. Până atunci folosește recuperarea parolei de pe pagina de autentificare dacă e nevoie.
          </p>
        </SettingsPanel>

      <SettingsPanel sectionId={SECTION_IDS.email} title="Schimbă email" icon={<Mail className="h-5 w-5" strokeWidth={1.75} />}>
          <p className="text-sm leading-relaxed text-gray-600 font-['Inter']">
            Pentru schimbarea adresei de email folosite la autentificare, te rugăm să contactezi echipa Baterino prin
            secțiunea <strong className="font-semibold text-slate-800">Suport</strong> din meniul principal. Vom valida
            identitatea și îți vom actualiza contul în siguranță.
          </p>
          <p className="mt-3 text-sm text-gray-500 font-['Inter']">
            Email curent:{' '}
            <span className="font-medium text-slate-900">{accountEmail || '—'}</span>
          </p>
        </SettingsPanel>

      <SettingsPanel
        sectionId={SECTION_IDS.twoFactor}
        title="Autentificare în doi pași"
        icon={<Shield className="h-5 w-5" strokeWidth={1.75} />}
      >
          <p className="text-sm leading-relaxed text-gray-600 font-['Inter']">
            Funcționalitatea de autentificare în doi pași (2FA) pentru conturile partener va fi disponibilă în curând.
          </p>
        </SettingsPanel>

      <SettingsPanel
        sectionId={SECTION_IDS.delete}
        title="Șterge contul"
        icon={<Trash2 className="h-5 w-5 text-red-600" strokeWidth={1.75} />}
      >
          <p className="-mt-2 mb-5 text-sm text-gray-600 font-['Inter']">
            Odată ce ștergi contul, nu există cale de întoarcere. Toate datele vor fi eliminate permanent.
          </p>
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="h-11 rounded-xl border border-red-300 px-6 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 font-['Inter']"
            >
              Șterge contul
            </button>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="h-11 rounded-xl border border-gray-300 px-6 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 font-['Inter']"
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(true)
                  setDeleteConfirmText('')
                  setDeleteError('')
                }}
                className="h-11 rounded-xl bg-red-600 px-6 text-sm font-bold text-white transition-colors hover:bg-red-700 font-['Inter']"
              >
                Confirmă ștergerea
              </button>
            </div>
          )}
        </SettingsPanel>
    </>
  )

  return (
    <div className="min-h-full px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
      <div className="w-full max-w-6xl">
        <h1 className="mb-2 text-2xl font-extrabold text-slate-900 font-['Inter']">Setări</h1>
        <p className="mb-8 max-w-2xl text-sm text-gray-500 font-['Inter']">
          Gestionează datele contului, adresa de livrare și securitatea autentificării.
        </p>

        {settingsLockedPending && (
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 font-['Inter']">
            Contul tău este în curs de verificare. Poți folosi <strong className="font-semibold">Suport</strong> din meniu
            și poți șterge contul mai jos dacă renunți. Celelalte secțiuni vor fi disponibile după aprobare.
          </div>
        )}

        <div className="flex flex-col gap-8 lg:flex-row-reverse lg:items-start lg:justify-start">
          {/* Sidebar — sticky right on desktop; first in DOM stays top on mobile */}
          <nav
            className="shrink-0 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm lg:sticky lg:top-6 lg:w-[min(100%,280px)]"
            aria-label="Secțiuni setări"
          >
            <ul className="m-0 flex list-none flex-row gap-1 overflow-x-auto p-0 lg:flex-col lg:overflow-visible">
              {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
                const active = activeSection === key
                const disabled = navDisabled(key)
                return (
                  <li key={key} className="min-w-0 shrink-0 lg:w-full">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        if (disabled) return
                        scrollToSection(key)
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors font-['Inter'] lg:px-4 lg:py-3 ${
                        disabled ? 'cursor-not-allowed opacity-45' : ''
                      } ${
                        active
                          ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                          : 'text-slate-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-blue-600' : 'text-gray-500'}`} strokeWidth={1.75} />
                      <span className="truncate">{label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col gap-8">{settingsSections}</div>
        </div>
      </div>

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            setShowDeleteModal(false)
            setDeleteConfirmText('')
            setDeleteError('')
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-lg font-bold text-slate-900 font-['Inter']">Ștergere cont</h3>
            <p className="mb-4 text-sm text-gray-600 font-['Inter']">
              Ești pe cale să ștergi contul. Această acțiune este permanentă și nu poate fi anulată.
            </p>
            <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-gray-700 font-['Inter']">
              <li>Toate datele personale vor fi șterse permanent</li>
              <li>Nu vei mai primi niciun fel de corespondență din partea noastră</li>
            </ul>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold font-['Inter'] text-gray-700">
                Introdu <span className="rounded bg-gray-100 px-1 font-mono">DELETE</span> pentru a confirma
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            {deleteError ? <p className="mb-4 text-sm text-red-600 font-['Inter']">{deleteError}</p> : null}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmText('')
                  setDeleteError('')
                }}
                className="h-11 flex-1 rounded-xl border border-gray-300 px-6 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 font-['Inter']"
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                className="h-11 flex-1 rounded-xl bg-red-600 px-6 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 font-['Inter']"
              >
                {deleting ? 'Se șterge...' : 'Șterge contul'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
