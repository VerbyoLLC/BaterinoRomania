import { useState, useEffect, useMemo, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Building2, MapPin, KeyRound, Mail, Shield, Trash2, Bell, FileText, Download } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  getPartnerSettingsTranslations,
  getPartnerChannelProfileLabel,
} from '../../i18n/partner/settings'
import type { LangCode } from '../../i18n/menu'
import {
  deletePartnerAccount,
  clearAuth,
  getAuthEmail,
  getPartnerProfile,
  savePartnerProfile,
  downloadPartnerContract,
} from '../../lib/api'
import {
  loadPhoneE164,
  isPhoneE164Valid,
  sanitizePersonName,
  sanitizeRoPostalCode,
  sanitizeStreetLine,
} from '../../lib/formInputSanitize'
import PhoneInput from '../../components/PhoneInput'
import { ROMANIAN_COUNTIES, getCitiesForCounty } from '../../lib/romanian-counties-cities'
import EmailNotificationsSettings from '../../components/settings/EmailNotificationsSettings'

type SettingsSectionKey = 'personal' | 'company' | 'delivery' | 'documents' | 'password' | 'email' | 'notifications' | 'twoFactor' | 'delete'

const SECTION_IDS: Record<SettingsSectionKey, string> = {
  personal: 'partner-settings-personal',
  company: 'partner-settings-company',
  delivery: 'partner-settings-delivery',
  documents: 'partner-settings-documents',
  password: 'partner-settings-password',
  email: 'partner-settings-email',
  notifications: 'partner-settings-notifications',
  twoFactor: 'partner-settings-2fa',
  delete: 'partner-settings-delete',
}

const PARTNER_SETTINGS_SCROLL_MARGIN_PX = 96 // matches scroll-mt-24 on sections

function getPartnerLayoutScrollRoot(): HTMLElement | null {
  return document.getElementById('partner-layout-scroll')
}

function scrollPartnerSettingsSection(sectionId: string, behavior: ScrollBehavior = 'smooth') {
  const root = getPartnerLayoutScrollRoot()
  const el = document.getElementById(sectionId)
  if (!el) return
  if (!root) {
    el.scrollIntoView({ behavior, block: 'start' })
    return
  }
  const rootRect = root.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  root.scrollTo({
    top: root.scrollTop + elRect.top - rootRect.top - PARTNER_SETTINGS_SCROLL_MARGIN_PX,
    behavior,
  })
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
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-lg bg-blue-50 text-blue-600"
            aria-hidden
          >
            {icon}
          </span>
          <h2
            id={headingId}
            className="m-0 flex min-h-9 items-center text-lg font-bold leading-tight text-slate-900 font-['Inter']"
          >
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

function DetaliiFirmaFormSkeleton({ ariaLabel }: { ariaLabel: string }) {
  return (
    <div className="pointer-events-none flex flex-col gap-4 select-none" aria-busy aria-label={ariaLabel}>
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
      <div className="h-11 w-48 animate-pulse rounded-xl bg-gray-200" aria-hidden />
    </div>
  )
}

export default function PartnerSettings() {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const tr = getPartnerSettingsTranslations(language.code as LangCode)

  const [accountHasPassword, setAccountHasPassword] = useState<boolean | null>(null)

  const navItems: { key: SettingsSectionKey; label: string; icon: typeof User }[] = useMemo(
    () =>
      [
        { key: 'personal' as const, label: tr.navPersonal, icon: User },
        { key: 'company' as const, label: tr.navCompany, icon: Building2 },
        { key: 'delivery' as const, label: tr.navDelivery, icon: MapPin },
        { key: 'documents' as const, label: tr.navDocuments, icon: FileText },
        ...(accountHasPassword === true
          ? [{ key: 'password' as const, label: tr.navPassword, icon: KeyRound }]
          : []),
        { key: 'email' as const, label: tr.navEmail, icon: Mail },
        { key: 'notifications' as const, label: tr.navNotifications, icon: Bell },
        { key: 'twoFactor' as const, label: tr.navTwoFactor, icon: Shield },
        { key: 'delete' as const, label: tr.navDelete, icon: Trash2 },
      ],
    [tr, accountHasPassword],
  )

  const [activeSection, setActiveSection] = useState<SettingsSectionKey>('personal')

  const [isSuspended, setIsSuspended] = useState(false)
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
  const [partnerChannelType, setPartnerChannelType] = useState<string | null>(null)
  const [activityTypesRaw, setActivityTypesRaw] = useState<string | null>(null)
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

  const [partnerContractAvailable, setPartnerContractAvailable] = useState(false)
  const [partnerContractSignedAt, setPartnerContractSignedAt] = useState<string | null>(null)
  const [downloadingContract, setDownloadingContract] = useState(false)
  const [contractDownloadError, setContractDownloadError] = useState('')

  const [passwordCurrent, setPasswordCurrent] = useState('')
  const [passwordNew, setPasswordNew] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const citiesForCompanyCounty = useMemo(() => getCitiesForCounty(companyCounty), [companyCounty])
  const citiesForDeliveryCounty = useMemo(() => getCitiesForCounty(deliveryCounty), [deliveryCounty])
  const partnerChannelDisplay = useMemo(
    () =>
      getPartnerChannelProfileLabel(language.code as LangCode, {
        partnerChannelType,
        activityTypes: activityTypesRaw,
      }),
    [language.code, partnerChannelType, activityTypesRaw],
  )

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

  useEffect(() => {
    setAccountEmail(getAuthEmail())
    let cancelled = false
    setProfileLoading(true)
    setProfileError('')
    getPartnerProfile()
      .then((p) => {
        if (cancelled) return
        setIsSuspended(p?.isSuspended === true)
        setAccountHasPassword(p?.hasPassword === true)
        setCompanyName(String(p?.companyName ?? '').trim())
        setCui(String(p?.cui ?? '').trim())
        setCompanyStreet(String(p?.companyStreet ?? '').trim())
        setCompanyCity(String(p?.companyCity ?? '').trim())
        setCompanyCounty(String(p?.companyCounty ?? '').trim())
        setCompanyPostalCode(String(p?.companyPostalCode ?? '').trim())
        setTradeRegisterNumber(String(p?.tradeRegisterNumber ?? '').trim())
        setPartnerChannelType(String(p?.partnerChannelType ?? '').trim() || null)
        const actRaw = Array.isArray(p?.activityTypes)
          ? p.activityTypes.join(',')
          : String(p?.activityTypes ?? '').trim()
        setActivityTypesRaw(actRaw || null)
        setContactFirstName(String(p?.contactFirstName ?? '').trim())
        setContactLastName(String(p?.contactLastName ?? '').trim())
        setPhone(loadPhoneE164(p?.phone))
        setDeliveryStreet(String(p?.deliveryStreet ?? '').trim())
        setDeliveryCounty(String(p?.deliveryCounty ?? '').trim())
        setDeliveryCity(String(p?.deliveryCity ?? '').trim())
        setDeliveryPostalCode(String(p?.deliveryPostalCode ?? '').trim())
        setPartnerContractAvailable(p?.partnerContractAvailable === true)
        setPartnerContractSignedAt(
          typeof p?.partnerContractSignedAt === 'string' && p.partnerContractSignedAt.trim()
            ? p.partnerContractSignedAt
            : null,
        )
      })
      .catch((err) => {
        if (!cancelled) setProfileError(err instanceof Error ? err.message : tr.profileLoadError)
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const formsLocked = isSuspended

  async function handleSavePersonal(e: React.FormEvent) {
    e.preventDefault()
    if (formsLocked) return
    setSavePersonalOk(false)
    setPersonalError('')
    const fn = sanitizePersonName(contactFirstName).trim()
    const ln = sanitizePersonName(contactLastName).trim()
    if (!fn || !ln) {
      setPersonalError(tr.personalErrorName)
      return
    }
    if (!isPhoneE164Valid(phone)) {
      setPersonalError(tr.personalErrorPhone)
      return
    }
    setSavingPersonal(true)
    try {
      await savePartnerProfile({
        contactFirstName: fn,
        contactLastName: ln,
        phone: phone,
      })
      setSavePersonalOk(true)
    } catch (err) {
      setPersonalError(err instanceof Error ? err.message : tr.saveErrorFallback)
    } finally {
      setSavingPersonal(false)
    }
  }

  async function handleSaveCompany(e: React.FormEvent) {
    e.preventDefault()
    if (formsLocked) return
    setSaveCompanyOk(false)
    setCompanyError('')
    if (!companyName.trim() || !cui.trim()) {
      setCompanyError(tr.companyErrorRequired)
      return
    }
    const cpCheck = companyPostalCode.trim()
    if (cpCheck && !/^\d{6}$/.test(cpCheck)) {
      setCompanyError(tr.companyErrorPostal)
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
      })
      setSaveCompanyOk(true)
    } catch (err) {
      setCompanyError(err instanceof Error ? err.message : tr.saveErrorFallback)
    } finally {
      setSavingCompany(false)
    }
  }

  async function handleSaveDelivery(e: React.FormEvent) {
    e.preventDefault()
    if (formsLocked) return
    setSaveDeliveryOk(false)
    setDeliveryError('')
    const ds = deliveryStreet.trim()
    const dcounty = deliveryCounty.trim()
    const dcity = deliveryCity.trim()
    const dp = deliveryPostalCode.trim()
    const anyFilled = ds || dcounty || dcity || dp
    if (anyFilled && (!ds || !dcounty || !dcity || !dp)) {
      setDeliveryError(tr.deliveryErrorRequired)
      return
    }
    if (dp && !/^\d{6}$/.test(dp)) {
      setDeliveryError(tr.deliveryErrorPostal)
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
      setDeliveryError(err instanceof Error ? err.message : tr.saveErrorFallback)
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
      setDeleteError(err instanceof Error ? err.message : tr.deleteErrorFallback)
    } finally {
      setDeleting(false)
    }
  }

  async function handleDownloadPartnerContract() {
    setContractDownloadError('')
    setDownloadingContract(true)
    try {
      const { pdfBlob, filename } = await downloadPartnerContract()
      const url = URL.createObjectURL(pdfBlob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      anchor.rel = 'noopener'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (err) {
      setContractDownloadError(err instanceof Error ? err.message : tr.partnerContractDownloadError)
    } finally {
      setDownloadingContract(false)
    }
  }

  function formatContractSignedDate(iso: string): string {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString(language.code === 'en' ? 'en-GB' : 'ro-RO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  useEffect(() => {
    if (accountHasPassword === false && activeSection === 'password') {
      setActiveSection('personal')
    }
  }, [accountHasPassword, activeSection])

  useEffect(() => {
    const scrollRoot = getPartnerLayoutScrollRoot()
    const sections = navItems.map(({ key }) => document.getElementById(SECTION_IDS[key])).filter(
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
      {
        root: scrollRoot,
        rootMargin: '-10% 0px -42% 0px',
        threshold: [0, 0.1, 0.22, 0.38, 0.52],
      },
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [navItems])

  function scrollToSection(key: SettingsSectionKey) {
    scrollPartnerSettingsSection(SECTION_IDS[key])
    setActiveSection(key)
  }

  function navDisabled(key: SettingsSectionKey): boolean {
    if (key === 'delete') return false
    return isSuspended
  }

  const primaryBtn =
    'inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 font-[\'Inter\']'

  const settingsSections = (
    <>
      <SettingsPanel sectionId={SECTION_IDS.personal} title={tr.personalTitle} icon={<User className="h-5 w-5" strokeWidth={1.75} />}>
          {profileLoading ? (
            <div className="flex flex-col gap-4" aria-busy aria-label={tr.personalLoadingAria}>
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
                label={tr.currentEmail}
                placeholder="email@exemplu.ro"
                value={accountEmail ?? ''}
                readOnly
              />
              <p className="-mt-2 text-xs text-gray-500 font-['Inter']">{tr.emailReadonlyHint}</p>
              {profileError ? <p className="text-sm text-red-600 font-['Inter']">{profileError}</p> : null}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label={tr.lastName}
                  placeholder={tr.lastNamePlaceholder}
                  value={contactLastName}
                  onChange={(v) => {
                    setContactLastName(sanitizePersonName(v))
                    setSavePersonalOk(false)
                  }}
                  required
                />
                <Field
                  label={tr.firstName}
                  placeholder={tr.firstNamePlaceholder}
                  value={contactFirstName}
                  onChange={(v) => {
                    setContactFirstName(sanitizePersonName(v))
                    setSavePersonalOk(false)
                  }}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold font-['Inter'] text-gray-700">
                  {tr.phone}<span className="ml-0.5 text-red-500">*</span>
                </label>
                <PhoneInput
                  value={phone}
                  onChange={(v) => {
                    setPhone(v)
                    setSavePersonalOk(false)
                  }}
                  autoComplete="tel"
                />
              </div>
              {personalError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 font-['Inter']">
                  {personalError}
                </div>
              ) : null}
              {savePersonalOk ? <p className="text-sm text-green-700 font-['Inter']">{tr.personalSaved}</p> : null}
              <button type="submit" disabled={formsLocked || savingPersonal} className={`${primaryBtn} w-fit`}>
                {savingPersonal ? tr.saving : tr.saveChanges}
              </button>
            </form>
          )}
        </SettingsPanel>

      <SettingsPanel sectionId={SECTION_IDS.company} title={tr.companyTitle} icon={<Building2 className="h-5 w-5" strokeWidth={1.75} />}>
          <p className="-mt-2 mb-5 text-sm text-gray-500 font-['Inter']">{tr.companyIntro}</p>
          {profileLoading ? (
            <div>
              <p className="mb-4 text-sm text-gray-500 font-['Inter']">{tr.companyFieldsLoading}</p>
              <DetaliiFirmaFormSkeleton ariaLabel={tr.companyLoadingAria} />
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSaveCompany}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label={tr.companyName}
                  placeholder={tr.companyNamePlaceholder}
                  value={companyName}
                  onChange={setCompanyName}
                  required
                />
                <Field label={tr.cui} placeholder={tr.cuiPlaceholder} value={cui} onChange={setCui} required />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 font-['Inter']">{tr.registeredOffice}</p>
              <Field
                label={tr.street}
                placeholder={tr.streetPlaceholder}
                value={companyStreet}
                onChange={(v) => setCompanyStreet(sanitizeStreetLine(v))}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField
                  label={tr.county}
                  options={[...ROMANIAN_COUNTIES]}
                  value={companyCounty}
                  onChange={handleCompanyCountyChange}
                  placeholder={tr.selectCounty}
                />
                <SelectField
                  label={tr.city}
                  options={citiesForCompanyCounty}
                  value={companyCity}
                  onChange={setCompanyCity}
                  placeholder={tr.selectCity}
                  disabled={!companyCounty}
                />
              </div>
              <Field
                label={tr.postalCode}
                placeholder={tr.postalPlaceholder}
                value={companyPostalCode}
                onChange={(v) => setCompanyPostalCode(sanitizeRoPostalCode(v))}
                maxLength={6}
                inputMode="numeric"
              />
              <Field
                label={tr.tradeRegister}
                placeholder={tr.tradeRegisterPlaceholder}
                value={tradeRegisterNumber}
                onChange={setTradeRegisterNumber}
              />
              <Field
                label={tr.companyProfile}
                placeholder="—"
                value={partnerChannelDisplay}
                readOnly
                hint={tr.companyProfileHint}
              />
              {companyError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 font-['Inter']">
                  {companyError}
                </div>
              ) : null}
              {saveCompanyOk ? <p className="text-sm text-green-700 font-['Inter']">{tr.companySaved}</p> : null}
              <button type="submit" disabled={formsLocked || savingCompany} className={`${primaryBtn} w-fit`}>
                {savingCompany ? tr.saving : tr.saveChanges}
              </button>
            </form>
          )}
        </SettingsPanel>

      <SettingsPanel sectionId={SECTION_IDS.delivery} title={tr.deliveryTitle} icon={<MapPin className="h-5 w-5" strokeWidth={1.75} />}>
          <p className="-mt-2 mb-5 text-sm text-gray-500 font-['Inter']">{tr.deliveryIntro}</p>
          {profileLoading ? (
            <div className="flex flex-col gap-4" aria-busy aria-label={tr.deliveryLoadingAria}>
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
                {tr.copyFromRegisteredOffice}
              </button>
              <Field
                label={tr.street}
                placeholder={tr.deliveryStreetPlaceholder}
                value={deliveryStreet}
                onChange={(v) => {
                  setDeliveryStreet(sanitizeStreetLine(v))
                  setSaveDeliveryOk(false)
                }}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField
                  label={tr.county}
                  options={[...ROMANIAN_COUNTIES]}
                  value={deliveryCounty}
                  onChange={(v) => {
                    handleDeliveryCountyChange(v)
                    setSaveDeliveryOk(false)
                  }}
                  placeholder={tr.selectCounty}
                />
                <SelectField
                  label={tr.city}
                  options={citiesForDeliveryCounty}
                  value={deliveryCity}
                  onChange={(v) => {
                    setDeliveryCity(v)
                    setSaveDeliveryOk(false)
                  }}
                  placeholder={tr.selectCity}
                  disabled={!deliveryCounty}
                />
              </div>
              <Field
                label={tr.postalCode}
                placeholder={tr.postalPlaceholder}
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
              {saveDeliveryOk ? <p className="text-sm text-green-700 font-['Inter']">{tr.deliverySaved}</p> : null}
              <button type="submit" disabled={formsLocked || savingDelivery} className={`${primaryBtn} w-fit`}>
                {savingDelivery ? tr.saving : tr.saveDeliveryAddress}
              </button>
            </form>
          )}
        </SettingsPanel>

      <SettingsPanel
        sectionId={SECTION_IDS.documents}
        title={tr.documentsTitle}
        icon={<FileText className="h-5 w-5" strokeWidth={1.75} />}
      >
        <p className="mb-5 text-sm leading-relaxed text-gray-600 font-['Inter']">{tr.documentsIntro}</p>
        <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileText className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0">
                <h3 className="m-0 text-sm font-bold text-slate-900 font-['Inter']">{tr.partnerContractTitle}</h3>
                <p className="mt-1 mb-0 text-sm leading-relaxed text-gray-600 font-['Inter']">
                  {tr.partnerContractDescription}
                </p>
                {partnerContractAvailable && partnerContractSignedAt ? (
                  <p className="mt-2 mb-0 text-xs text-gray-500 font-['Inter']">
                    {tr.partnerContractSignedOn.replace('{date}', formatContractSignedDate(partnerContractSignedAt))}
                  </p>
                ) : (
                  <p className="mt-2 mb-0 text-xs text-amber-800 font-['Inter']">{tr.partnerContractPending}</p>
                )}
              </div>
            </div>
            {partnerContractAvailable ? (
              <button
                type="button"
                onClick={() => void handleDownloadPartnerContract()}
                disabled={downloadingContract}
                className={`${primaryBtn} w-full shrink-0 sm:w-auto`}
              >
                <span className="inline-flex items-center gap-2">
                  <Download className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                  {downloadingContract ? tr.partnerContractDownloading : tr.partnerContractDownload}
                </span>
              </button>
            ) : null}
          </div>
          {contractDownloadError ? (
            <p className="mt-3 mb-0 text-sm text-red-600 font-['Inter']">{contractDownloadError}</p>
          ) : null}
        </div>
      </SettingsPanel>

      {accountHasPassword === true ? (
      <SettingsPanel sectionId={SECTION_IDS.password} title={tr.passwordTitle} icon={<KeyRound className="h-5 w-5" strokeWidth={1.75} />}>
          <div className={`flex flex-col gap-4 ${formsLocked ? 'pointer-events-none opacity-50' : ''}`}>
            <Field
              label={tr.currentPassword}
              type="password"
              placeholder={tr.passwordPlaceholder}
              value={passwordCurrent}
              onChange={setPasswordCurrent}
            />
            <Field label={tr.newPassword} type="password" placeholder={tr.passwordPlaceholder} value={passwordNew} onChange={setPasswordNew} />
            <Field
              label={tr.confirmPassword}
              type="password"
              placeholder={tr.passwordPlaceholder}
              value={passwordConfirm}
              onChange={setPasswordConfirm}
            />
            <button type="button" disabled className={`${primaryBtn} w-fit cursor-not-allowed opacity-70`}>
              {tr.updatePassword}
            </button>
          </div>
          <p className="mt-4 text-xs text-amber-800 font-['Inter']">{tr.passwordComingSoon}</p>
        </SettingsPanel>
      ) : null}

      <SettingsPanel sectionId={SECTION_IDS.email} title={tr.emailTitle} icon={<Mail className="h-5 w-5" strokeWidth={1.75} />}>
          <p className="text-sm leading-relaxed text-gray-600 font-['Inter']">{tr.emailBody}</p>
          <p className="mt-3 text-sm text-gray-500 font-['Inter']">
            {tr.currentEmailLabel}{' '}
            <span className="font-medium text-slate-900">{accountEmail || '—'}</span>
          </p>
        </SettingsPanel>

      <SettingsPanel
        sectionId={SECTION_IDS.notifications}
        title={tr.notificationsTitle}
        icon={<Bell className="h-5 w-5" strokeWidth={1.75} />}
      >
          <EmailNotificationsSettings
            variant="partner"
            content={{
              intro: tr.notificationsIntro,
              marketingLabel: tr.notificationsMarketingLabel,
              marketingDesc: tr.notificationsMarketingDesc,
              loadingAria: tr.notificationsLoadingAria,
              saved: tr.notificationsSaved,
              loadError: tr.notificationsLoadError,
              saveError: tr.notificationsSaveError,
            }}
          />
        </SettingsPanel>

      <SettingsPanel
        sectionId={SECTION_IDS.twoFactor}
        title={tr.twoFactorTitle}
        icon={<Shield className="h-5 w-5" strokeWidth={1.75} />}
      >
          <p className="text-sm leading-relaxed text-gray-600 font-['Inter']">{tr.twoFactorBody}</p>
        </SettingsPanel>

      <SettingsPanel
        sectionId={SECTION_IDS.delete}
        title={tr.deleteTitle}
        icon={<Trash2 className="h-5 w-5 text-red-600" strokeWidth={1.75} />}
      >
          <p className="-mt-2 mb-5 text-sm text-gray-600 font-['Inter']">{tr.deleteIntro}</p>
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="h-11 rounded-xl border border-red-300 px-6 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 font-['Inter']"
            >
              {tr.deleteAccount}
            </button>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="h-11 rounded-xl border border-gray-300 px-6 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 font-['Inter']"
              >
                {tr.cancel}
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
                {tr.confirmDeletion}
              </button>
            </div>
          )}
        </SettingsPanel>
    </>
  )

  return (
    <div className="relative box-border block !min-h-min min-w-0 w-full shrink-0 px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
      <div className="w-full max-w-6xl">
        <p className="mb-8 max-w-2xl text-sm text-gray-500 font-['Inter']">{tr.pageSubtitle}</p>

        <div className="flex flex-col gap-8 lg:flex-row-reverse lg:items-start lg:justify-start">
          {/* Sidebar — sticky right on desktop; first in DOM stays top on mobile */}
          <nav
            className="shrink-0 self-start rounded-2xl border border-gray-200 bg-white p-3 shadow-sm lg:sticky lg:top-6 lg:w-[min(100%,280px)]"
            aria-label={tr.navSectionsAria}
          >
            <ul className="m-0 flex list-none flex-row gap-1 overflow-x-auto p-0 lg:flex-col lg:overflow-visible">
              {navItems.map(({ key, label, icon: Icon }) => {
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
            <h3 className="mb-2 text-lg font-bold text-slate-900 font-['Inter']">{tr.deleteModalTitle}</h3>
            <p className="mb-4 text-sm text-gray-600 font-['Inter']">{tr.deleteModalBody}</p>
            <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-gray-700 font-['Inter']">
              <li>{tr.deleteModalBullet1}</li>
              <li>{tr.deleteModalBullet2}</li>
              <li>{tr.deleteModalBullet3}</li>
              <li>{tr.deleteModalBullet4}</li>
            </ul>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold font-['Inter'] text-gray-700">{tr.deleteConfirmLabel}</label>
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
                {tr.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                className="h-11 flex-1 rounded-xl bg-red-600 px-6 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 font-['Inter']"
              >
                {deleting ? tr.deleting : tr.deleteAccount}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
