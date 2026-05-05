import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  deletePartnerAccount,
  clearAuth,
  getAuthEmail,
  getPartnerProfile,
  savePartnerProfile,
} from '../../lib/api'
import { sanitizeRoPostalCode, sanitizeStreetLine } from '../../lib/formInputSanitize'
import { ROMANIAN_COUNTIES, getCitiesForCounty } from '../../lib/romanian-counties-cities'

type ActivityType = 'instalator' | 'distribuitor' | 'integrator' | 'altul'
const ACTIVITY_OPTIONS: { id: ActivityType; label: string }[] = [
  { id: 'instalator', label: 'Instalator' },
  { id: 'distribuitor', label: 'Distribuitor' },
  { id: 'integrator', label: 'Integrator sisteme' },
  { id: 'altul', label: 'Altul' },
]

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
      <h3 className={`text-lg font-bold font-['Inter'] text-slate-900 ${subtitle ? 'mb-1' : 'mb-4'}`}>{title}</h3>
      {subtitle ? (
        <p className="text-sm text-gray-500 font-['Inter'] mb-4">{subtitle}</p>
      ) : null}
      {children}
    </div>
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
}) {
  return (
    <div>
      <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        inputMode={inputMode}
        readOnly={readOnly}
        disabled={readOnly}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={`w-full h-11 px-4 border rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 ${
          readOnly ? 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed' : 'border-gray-300'
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
      <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50"
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
      <div className="h-4 w-32 max-w-[40%] bg-gray-200 rounded animate-pulse mb-2" aria-hidden />
      <div className="h-11 w-full bg-gray-200 rounded-xl animate-pulse" aria-hidden />
    </div>
  )
}

function DetaliiFirmaFormSkeleton() {
  return (
    <div
      className="flex flex-col gap-4 pointer-events-none select-none"
      aria-busy="true"
      aria-label="Se încarcă datele firmei"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldSkeleton />
        <FieldSkeleton />
      </div>
      <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" aria-hidden />
      <FieldSkeleton />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldSkeleton />
        <FieldSkeleton />
      </div>
      <FieldSkeleton />
      <FieldSkeleton />
      <div className="border-t border-b border-gray-200 py-6 sm:py-8 my-4 sm:my-6">
        <div className="h-4 w-36 bg-gray-200 rounded animate-pulse mb-3" aria-hidden />
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((k) => (
            <div key={k} className="h-9 rounded-[8px] bg-gray-200 animate-pulse" aria-hidden />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldSkeleton />
        <FieldSkeleton />
      </div>
      <FieldSkeleton />
      <div className="h-11 w-48 bg-gray-200 rounded-xl animate-pulse" aria-hidden />
    </div>
  )
}

export default function PartnerSettings() {
  const navigate = useNavigate()
  const [isSuspended, setIsSuspended] = useState(false)
  /** false = cont în aprobare (blochează majoritatea secțiunilor) */
  const [partnerApproved, setPartnerApproved] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [accountEmail, setAccountEmail] = useState<string | null>(null)

  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')

  /** Legal / firmă */
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

  const [savingCompany, setSavingCompany] = useState(false)
  const [saveCompanyOk, setSaveCompanyOk] = useState(false)
  const [companyError, setCompanyError] = useState('')

  const citiesForCompanyCounty = useMemo(() => getCitiesForCounty(companyCounty), [companyCounty])

  function handleCompanyCountyChange(newCounty: string) {
    setCompanyCounty(newCounty)
    if (!newCounty.trim()) {
      setCompanyCity('')
      return
    }
    const cities = getCitiesForCounty(newCounty)
    if (companyCity && !cities.includes(companyCity)) setCompanyCity('')
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
        setPhone(String(p?.phone ?? '').trim())
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

  async function handleSaveCompany(e: React.FormEvent) {
    e.preventDefault()
    if (settingsLockedPending) return
    setSaveCompanyOk(false)
    setCompanyError('')
    if (!companyName.trim() || !cui.trim() || !contactFirstName.trim() || !contactLastName.trim() || !phone.trim() || activities.length === 0) {
      setCompanyError('Completează denumirea, CUI, contact, telefon și cel puțin un tip de activitate.')
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
        contactFirstName: contactFirstName.trim(),
        contactLastName: contactLastName.trim(),
        phone: phone.trim(),
      })
      setSaveCompanyOk(true)
    } catch (err) {
      setCompanyError(err instanceof Error ? err.message : 'Eroare la salvare.')
    } finally {
      setSavingCompany(false)
    }
  }

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-3xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">
        Setări
      </h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8">
        Gestionează detaliile contului și preferințele de securitate.
      </p>

      {settingsLockedPending && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 font-['Inter'] mb-6">
          Contul tău este în curs de verificare. Poți folosi <strong className="font-semibold">Suport</strong> din meniu și,
          mai jos, poți șterge contul dacă renunți. Celelalte setări vor fi disponibile după aprobare.
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div
          className={`flex flex-col gap-6 ${settingsLockedPending ? 'opacity-50 pointer-events-none select-none' : ''}`}
          aria-hidden={settingsLockedPending}
        >
        <SectionCard title="Detalii profil" subtitle="Date despre contul tău de autentificare.">
          {profileLoading ? (
            <div aria-busy="true" aria-label="Se încarcă datele contului">
              <FieldSkeleton />
              <p className="mt-3 text-xs text-gray-500 font-['Inter']">Se încarcă datele contului…</p>
            </div>
          ) : (
            <div>
              <Field
                label="Email cont"
                placeholder="email@exemplu.ro"
                value={accountEmail ?? ''}
                readOnly
              />
              <p className="mt-2 text-xs text-gray-500 font-['Inter']">
                Adresa folosită la autentificare. Modificarea ei se face prin echipa Baterino dacă e nevoie.
              </p>
              {profileError && (
                <p className="mt-3 text-sm text-red-600 font-['Inter']">{profileError}</p>
              )}
            </div>
          )}
        </SectionCard>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg font-bold font-['Inter'] text-slate-900 mb-1">Detalii firmă</h3>
          <p className="text-sm text-gray-500 font-['Inter'] mb-4">
            Date legale și sediu social (vizibile pentru Echipa Baterino). Le poți actualiza aici.
          </p>
          {profileLoading ? (
            <div>
              <p className="text-sm text-gray-500 font-['Inter'] mb-4">Se încarcă câmpurile…</p>
              <DetaliiFirmaFormSkeleton />
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSaveCompany}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Denumire firmă"
                  placeholder="S.C. Firma SRL"
                  value={companyName}
                  onChange={setCompanyName}
                  required
                />
                <Field label="CUI / CIF" placeholder="RO12345678" value={cui} onChange={setCui} required />
              </div>
              <p className="text-xs font-semibold font-['Inter'] text-gray-600 uppercase tracking-wide">
                Adresă sediu social
              </p>
              <Field
                label="Stradă și număr"
                placeholder="ex: Str. Exemplu nr 10"
                value={companyStreet}
                onChange={(v) => setCompanyStreet(sanitizeStreetLine(v))}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="border-t border-b border-gray-200 py-6 sm:py-8 my-4 sm:my-6">
                <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
                  Tip activitate <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleActivity(opt.id)}
                      className={`h-9 px-3 rounded-[8px] border text-sm font-['Inter'] font-medium transition-colors flex items-center justify-center gap-1.5 ${
                        activities.includes(opt.id)
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'border-gray-300 text-gray-600 hover:border-gray-500'
                      }`}
                    >
                      {activities.includes(opt.id) && (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Prenume contact" placeholder="Ion" value={contactFirstName} onChange={setContactFirstName} required />
                <Field label="Nume contact" placeholder="Popescu" value={contactLastName} onChange={setContactLastName} required />
              </div>
              <Field label="Telefon" type="tel" placeholder="+40 7XX XXX XXX" value={phone} onChange={setPhone} required />
              {companyError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-['Inter']">
                  {companyError}
                </div>
              )}
              {saveCompanyOk && <p className="text-sm text-green-700 font-['Inter']">Datele firmei au fost salvate.</p>}
              <button
                type="submit"
                disabled={isSuspended || savingCompany || settingsLockedPending}
                className="w-fit h-11 px-6 bg-slate-900 rounded-xl text-white text-sm font-bold font-['Inter'] hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingCompany ? 'Se salvează...' : 'Salvează modificările'}
              </button>
            </form>
          )}
        </div>

        <SectionCard title="Schimbă parola">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">Parola actuală</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">Parola nouă</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">Confirmă parola nouă</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <button className="w-fit h-11 px-6 bg-slate-900 rounded-xl text-white text-sm font-bold font-['Inter'] hover:bg-slate-700 transition-colors">
              Actualizează parola
            </button>
          </div>
        </SectionCard>
        </div>

        <SectionCard title="Șterge contul">
          <p className="text-gray-600 text-sm font-['Inter'] mb-4">
            Odată ce ștergi contul, nu există cale de întoarcere. Toate datele vor fi eliminate permanent.
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="h-11 px-6 border border-red-300 rounded-xl text-red-600 text-sm font-semibold font-['Inter'] hover:bg-red-50 transition-colors"
            >
              Șterge contul
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="h-11 px-6 border border-gray-300 rounded-xl text-gray-700 text-sm font-semibold font-['Inter'] hover:bg-gray-50 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(true)
                  setDeleteConfirmText('')
                  setDeleteError('')
                }}
                className="h-11 px-6 bg-red-600 rounded-xl text-white text-sm font-bold font-['Inter'] hover:bg-red-700 transition-colors"
              >
                Confirmă ștergerea
              </button>
            </div>
          )}
        </SectionCard>
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
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold font-['Inter'] text-slate-900 mb-2">
              Ștergere cont
            </h3>
            <p className="text-gray-600 text-sm font-['Inter'] mb-4">
              Ești pe cale să ștergi contul. Această acțiune este permanentă și nu poate fi anulată.
            </p>
            <ul className="text-gray-700 text-sm font-['Inter'] mb-4 list-disc list-inside space-y-1">
              <li>Toate datele personale vor fi șterse permanent</li>
              <li>Nu vei mai primi niciun fel de corespondență din partea noastră</li>
            </ul>
            <div className="mb-4">
              <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
                Introdu <span className="font-mono bg-gray-100 px-1 rounded">DELETE</span> pentru a confirma
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            {deleteError && (
              <p className="text-red-600 text-sm font-['Inter'] mb-4">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmText('')
                  setDeleteError('')
                }}
                className="flex-1 h-11 px-6 border border-gray-300 rounded-xl text-gray-700 text-sm font-semibold font-['Inter'] hover:bg-gray-50 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                className="flex-1 h-11 px-6 bg-red-600 rounded-xl text-white text-sm font-bold font-['Inter'] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
