import { useState, useEffect, useRef, useMemo, type ComponentProps } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  getPartnerProfile,
  savePartnerProfile,
  getAuthToken,
  uploadPartnerPublicMedia,
  checkPartnerPublicSlugAvailability,
} from '../../lib/api'
import {
  isPartnerWebsiteSyntaxValid,
  normalizePartnerWebsite,
  sanitizePhonePlusOnly,
  sanitizeRoPostalCode,
  sanitizeStreetLine,
} from '../../lib/formInputSanitize'
import { ROMANIAN_COUNTIES, getCitiesForCounty } from '../../lib/romanian-counties-cities'
import PartnerPublicProfileCard from '../../components/partner/PartnerPublicProfileCard'
import { getPartnerServiciiOptions } from '../../i18n/partner/servicii'
import { getPartnerPublicProfileTranslations } from '../../i18n/partner/public-profile'
import type { LangCode } from '../../i18n/menu'
import { slugifyPartnerPublicHandle } from '../../lib/partnerPublicSlug'
import { normalizePartnerWorkPhotos } from '../../lib/partner-work-photos'
import {
  hasAtLeastOnePartnerSocialNetwork,
  isPartnerPublicProfileFullyComplete,
  MIN_PARTNER_PUBLIC_SERVICES,
} from '../../lib/partner-public-profile-complete'
import { publicInstallerProfileCanonical, PUBLIC_INSTALLER_PROFILE_PATH_SEGMENT } from '../../lib/public-installer-profile-path'
import {
  MapPin,
  Phone,
  Globe,
  CheckCircle2,
  Circle,
  Upload,
  Eye,
  Link2,
  Loader2,
  Building2,
  Wrench,
  Copy,
  AlertCircle,
} from 'lucide-react'

type PartnerData = {
  companyName?: string
  publicSlug?: string | null
  logoUrl?: string | null
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
  instagramUrl?: string
  tiktokUrl?: string
  isPublic?: boolean
  workPhotos?: string[]
  /** Din GET /partner/profile — pentru insigna „profil verificat” în previzualizare. */
  isApproved?: boolean
}

const INPUT_BASE =
  "h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:outline-none font-['Inter']"
const INPUT_OK = 'border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-300/60'
const INPUT_INVALID = 'border-red-500 ring-2 ring-red-200/60 focus:border-red-500 focus:ring-red-200/60'

type PartnerPublicSaveFieldErrors = {
  publicName: boolean
  street: boolean
  county: boolean
  city: boolean
  description: boolean
  services: boolean
  publicPhone: boolean
  website: boolean
  social: boolean
  zipCode: boolean
}

function computePartnerPublicSaveFieldErrors(input: {
  publicName: string
  street: string
  county: string
  city: string
  description: string
  servicii: string[]
  publicPhone: string
  website: string
  facebookUrl: string
  linkedinUrl: string
  instagramUrl: string
  tiktokUrl: string
  zipCode: string
}): PartnerPublicSaveFieldErrors {
  const zipTrimmed = input.zipCode.trim()
  return {
    publicName: !input.publicName.trim(),
    street: !input.street.trim(),
    county: !input.county.trim(),
    city: !input.city.trim(),
    description: !input.description.trim(),
    services: input.servicii.length < MIN_PARTNER_PUBLIC_SERVICES,
    publicPhone: !input.publicPhone.trim(),
    website: !input.website.trim() || !isPartnerWebsiteSyntaxValid(input.website),
    social: !hasAtLeastOnePartnerSocialNetwork({
      facebookUrl: input.facebookUrl,
      linkedinUrl: input.linkedinUrl,
      instagramUrl: input.instagramUrl,
      tiktokUrl: input.tiktokUrl,
    }),
    zipCode: !!zipTrimmed && !/^\d{6}$/.test(zipTrimmed),
  }
}

function hasAnyPartnerPublicSaveFieldErrors(errors: PartnerPublicSaveFieldErrors) {
  return Object.values(errors).some(Boolean)
}

const SECTION_INVALID = 'ring-2 ring-red-500 ring-offset-2 ring-offset-slate-50'
const TEXTAREA_BASE =
  "w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:outline-none font-['Inter']"
const TEXTAREA_OK = 'border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-300/60'
const TEXTAREA_INVALID = 'border-red-500 ring-2 ring-red-200/60 focus:border-red-500 focus:ring-red-200/60'

/* ─── tiny field wrapper ─────────────────────────────────────────── */
function Field({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required,
  maxLength,
  inputMode,
  invalid,
  onBlur,
}: {
  label: string
  type?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  required?: boolean
  maxLength?: number
  inputMode?: ComponentProps<'input'>['inputMode']
  invalid?: boolean
}) {
  return (
    <div>
      <label
        className={`mb-1.5 flex items-center gap-1 text-sm font-semibold font-['Inter'] ${invalid ? 'text-red-700' : 'text-slate-700'}`}
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={invalid || undefined}
        className={`${INPUT_BASE} ${invalid ? INPUT_INVALID : INPUT_OK}`}
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
  invalid,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  invalid?: boolean
}) {
  return (
    <div>
      <label
        className={`mb-1.5 flex items-center gap-1 text-sm font-semibold font-['Inter'] ${invalid ? 'text-red-700' : 'text-slate-700'}`}
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid || undefined}
        className={`${INPUT_BASE} disabled:cursor-not-allowed disabled:opacity-60 ${invalid ? INPUT_INVALID : INPUT_OK}`}
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

/* ─── section wrapper ────────────────────────────────────────────── */
function FormSection({
  icon,
  title,
  children,
  invalid,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  invalid?: boolean
}) {
  return (
    <section
      className={`rounded-2xl bg-white p-5 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.10)] sm:p-6 ${invalid ? SECTION_INVALID : ''}`}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </span>
        <h2 className="text-base font-bold text-slate-900 font-['Inter']">{title}</h2>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

/* ─── completion item ────────────────────────────────────────────── */
function CompletionItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {done ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" strokeWidth={2} />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-slate-300" strokeWidth={2} />
      )}
      <span className={`text-xs font-['Inter'] ${done ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
    </div>
  )
}

/* ─── main page ──────────────────────────────────────────────────── */
export default function PartnerPublicProfile() {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const tr = getPartnerPublicProfileTranslations(language.code as LangCode)
  const serviciiOptions = useMemo(() => getPartnerServiciiOptions(language.code as LangCode), [language.code])

  const [profile, setProfile] = useState<PartnerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [highlightIncompleteFields, setHighlightIncompleteFields] = useState(false)
  const [publicToggleNotice, setPublicToggleNotice] = useState('')
  const [togglingPublic, setTogglingPublic] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const completionBannerRef = useRef<HTMLDivElement>(null)

  /* form state — drives the live preview */
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [workPhotos, setWorkPhotos] = useState<string[]>([])
  const [workPhotosUploading, setWorkPhotosUploading] = useState(false)
  const workPhotosInputRef = useRef<HTMLInputElement>(null)
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
  const [instagramUrl, setInstagramUrl] = useState('')
  const [tiktokUrl, setTiktokUrl] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [publicSlugInput, setPublicSlugInput] = useState('')
  const [profileUrlHost, setProfileUrlHost] = useState('baterino.ro')
  const [slugCheckStatus, setSlugCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>(
    'idle',
  )
  const [slugSaving, setSlugSaving] = useState(false)
  const [slugSaved, setSlugSaved] = useState(false)
  const [slugSaveError, setSlugSaveError] = useState('')
  const [profileLinkCopied, setProfileLinkCopied] = useState(false)

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/login', { replace: true })
      return
    }
    getPartnerProfile()
      .then((data) => {
        const p = data as PartnerData
        setProfile(p)
        setPublicName(p.publicName ?? '')
        setStreet(p.street ?? '')
        setCounty(p.county ?? '')
        setCity(p.city ?? '')
        setZipCode(p.zipCode ?? '')
        setDescription(p.description ?? '')
        setServicii(p.services ? p.services.split(',').filter(Boolean) : [])
        setPublicPhone(p.publicPhone ?? '')
        setWhatsapp(p.whatsapp ?? '')
        setWebsite(p.website ?? '')
        setFacebookUrl(p.facebookUrl ?? '')
        setLinkedinUrl(p.linkedinUrl ?? '')
        setInstagramUrl(p.instagramUrl ?? '')
        setTiktokUrl(p.tiktokUrl ?? '')
        setIsPublic(p.isPublic !== false)
        setLogoPreview(p.logoUrl ?? null)
        setWorkPhotos(normalizePartnerWorkPhotos(p.workPhotos))
        const slugFromApi = String(p.publicSlug ?? '')
          .replace(/^@/, '')
          .toLowerCase()
        const slugDisplay =
          slugFromApi || slugifyPartnerPublicHandle(p.companyName || p.publicName || '')
        setPublicSlugInput(slugDisplay)
      })
      .catch((err) => setError(err instanceof Error ? err.message : tr.loadErrorFallback))
      .finally(() => setLoading(false))
  }, [navigate, language.code])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const h = window.location.hostname?.trim()
    if (h) setProfileUrlHost(h)
  }, [])

  const citiesForCounty = useMemo(() => getCitiesForCounty(county), [county])
  const formRef = useRef<HTMLFormElement>(null)
  const [saveValidationAttempt, setSaveValidationAttempt] = useState(0)

  const fieldErrors = useMemo(() => {
    if (!highlightIncompleteFields) return null
    return computePartnerPublicSaveFieldErrors({
      publicName,
      street,
      county,
      city,
      description,
      servicii,
      publicPhone,
      website,
      facebookUrl,
      linkedinUrl,
      instagramUrl,
      tiktokUrl,
      zipCode,
    })
  }, [
    highlightIncompleteFields,
    publicName,
    street,
    county,
    city,
    description,
    servicii,
    publicPhone,
    website,
    facebookUrl,
    linkedinUrl,
    instagramUrl,
    tiktokUrl,
    zipCode,
  ])

  useEffect(() => {
    if (!highlightIncompleteFields || saveValidationAttempt === 0) return
    const id = requestAnimationFrame(() => {
      formRef.current?.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
    return () => cancelAnimationFrame(id)
  }, [highlightIncompleteFields, saveValidationAttempt])

  const savedPublicSlug = useMemo(
    () => String(profile?.publicSlug ?? '').replace(/^@/, '').toLowerCase(),
    [profile?.publicSlug],
  )

  const normalizedSlugInput = useMemo(
    () => slugifyPartnerPublicHandle(publicSlugInput.trim()),
    [publicSlugInput],
  )

  const slugDirty = Boolean(normalizedSlugInput && normalizedSlugInput !== savedPublicSlug)

  const canSaveSlug = slugDirty && slugCheckStatus === 'available' && !slugSaving

  const showSlugValidCheck =
    (!slugDirty && Boolean(savedPublicSlug)) || (slugDirty && slugCheckStatus === 'available')

  const effectivePublicSlug = useMemo(() => {
    if (slugDirty && slugCheckStatus === 'available') return normalizedSlugInput
    return savedPublicSlug || normalizedSlugInput || slugifyPartnerPublicHandle(profile?.companyName || '')
  }, [slugDirty, slugCheckStatus, normalizedSlugInput, savedPublicSlug, profile?.companyName])

  const publicProfileFullUrl = useMemo(
    () => `https://${profileUrlHost}${publicInstallerProfileCanonical(effectivePublicSlug)}`,
    [profileUrlHost, effectivePublicSlug],
  )

  useEffect(() => {
    if (!slugDirty) {
      setSlugCheckStatus('idle')
      setSlugSaveError('')
      return
    }
    let cancelled = false
    const timer = window.setTimeout(() => {
      void (async () => {
        setSlugCheckStatus('checking')
        setSlugSaveError('')
        try {
          const result = await checkPartnerPublicSlugAvailability(normalizedSlugInput)
          if (cancelled) return
          if (result.available) {
            setSlugCheckStatus('available')
          } else if (result.reason === 'invalid') {
            setSlugCheckStatus('invalid')
          } else if (result.reason === 'taken') {
            setSlugCheckStatus('taken')
          } else {
            setSlugCheckStatus('invalid')
          }
        } catch (err) {
          if (!cancelled) {
            setSlugCheckStatus('idle')
            setSlugSaveError(err instanceof Error ? err.message : tr.slugCheckErrorFallback)
          }
        }
      })()
    }, 400)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [slugDirty, normalizedSlugInput])

  async function handleSavePublicSlug() {
    if (!slugDirty || slugCheckStatus !== 'available' || !normalizedSlugInput) return
    setSlugSaveError('')
    setSlugSaving(true)
    try {
      const updated = await savePartnerProfile({ publicSlug: normalizedSlugInput })
      setProfile(updated as PartnerData)
      const next = String((updated as PartnerData).publicSlug ?? normalizedSlugInput)
        .replace(/^@/, '')
        .toLowerCase()
      setPublicSlugInput(next)
      setSlugCheckStatus('idle')
      setSlugSaved(true)
      window.setTimeout(() => setSlugSaved(false), 3000)
    } catch (err) {
      setSlugSaveError(err instanceof Error ? err.message : tr.slugSaveErrorFallback)
    } finally {
      setSlugSaving(false)
    }
  }

  async function copyPublicProfileLink() {
    if (!effectivePublicSlug) return
    try {
      await navigator.clipboard.writeText(publicProfileFullUrl)
      setProfileLinkCopied(true)
      window.setTimeout(() => setProfileLinkCopied(false), 2000)
    } catch {
      setSlugSaveError(tr.copyLinkError)
    }
  }

  function handleCountyChange(newCounty: string) {
    setCounty(newCounty)
    const cities = getCitiesForCounty(newCounty)
    if (city && !cities.includes(city)) setCity('')
  }

  function toggleServiciu(id: string) {
    setServicii((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > 2 * 1024 * 1024) {
      setSaveError(tr.imageMax2Mb)
      return
    }
    setSaveError('')
    setPhotoUploading(true)
    try {
      const { url } = await uploadPartnerPublicMedia(file, 'logo')
      setLogoPreview(url)
      const updated = await savePartnerProfile({ logoUrl: url })
      setProfile(updated as PartnerData)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : tr.uploadErrorFallback)
      setLogoPreview(profile?.logoUrl ?? null)
    } finally {
      setPhotoUploading(false)
      e.target.value = ''
    }
  }

  async function handlePhotoDelete() {
    setSaveError('')
    setPhotoUploading(true)
    try {
      const updated = await savePartnerProfile({ logoUrl: null })
      setProfile(updated as PartnerData)
      setLogoPreview(null)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : tr.deleteErrorFallback)
    } finally {
      setPhotoUploading(false)
    }
  }

  async function handleWorkPhotosAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const remaining = 8 - workPhotos.length
    const toProcess = files.slice(0, remaining)
    const oversized = toProcess.filter((f) => f.size > 5 * 1024 * 1024)
    if (oversized.length) {
      setSaveError(tr.imageMax5Mb)
      e.target.value = ''
      return
    }
    setSaveError('')
    setWorkPhotosUploading(true)
    try {
      const uploaded = await Promise.all(toProcess.map((f) => uploadPartnerPublicMedia(f, 'work')))
      const urls = uploaded.map((r) => r.url)
      const next = [...workPhotos, ...urls].slice(0, 8)
      setWorkPhotos(next)
      const updated = await savePartnerProfile({ workPhotos: next })
      setProfile(updated as PartnerData)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : tr.photoUploadErrorFallback)
    } finally {
      setWorkPhotosUploading(false)
      e.target.value = ''
    }
  }

  async function handleWorkPhotoDelete(idx: number) {
    const next = workPhotos.filter((_, i) => i !== idx)
    setWorkPhotos(next)
    try {
      const updated = await savePartnerProfile({ workPhotos: next.length ? next : null })
      setProfile(updated as PartnerData)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : tr.deleteErrorFallback)
      setWorkPhotos(workPhotos)
    }
  }

  async function handleTogglePublic() {
    const next = !isPublic
    setSaveError('')
    if (next && !profileFullyComplete) {
      setPublicToggleNotice(tr.publicToggleNotice)
      requestAnimationFrame(() => {
        completionBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      return
    }
    setPublicToggleNotice('')
    setTogglingPublic(true)
    setIsPublic(next)
    try {
      const updated = await savePartnerProfile({ isPublic: next })
      setProfile(updated as PartnerData)
    } catch (err) {
      setIsPublic(!next)
      const message = err instanceof Error ? err.message : tr.updateErrorFallback
      if (next && message.toLowerCase().includes('complet')) {
        setPublicToggleNotice(message)
        requestAnimationFrame(() => {
          completionBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      } else {
        setSaveError(message)
      }
    } finally {
      setTogglingPublic(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaveError('')
    setSaved(false)

    const nameTrimmed = publicName.trim()
    const streetTrimmed = street.trim()
    const countyTrimmed = county.trim()
    const cityTrimmed = city.trim()
    const descTrimmed = description.trim()
    const phoneTrimmed = publicPhone.trim()
    const zipTrimmed = zipCode.trim()

    const errors = computePartnerPublicSaveFieldErrors({
      publicName,
      street,
      county,
      city,
      description,
      servicii,
      publicPhone,
      website,
      facebookUrl,
      linkedinUrl,
      instagramUrl,
      tiktokUrl,
      zipCode,
    })

    if (errors.zipCode) {
      setHighlightIncompleteFields(true)
      setSaveValidationAttempt((n) => n + 1)
      setSaveError(tr.postalInvalid)
      return
    }

    if (hasAnyPartnerPublicSaveFieldErrors(errors)) {
      setHighlightIncompleteFields(true)
      setSaveValidationAttempt((n) => n + 1)
      const missing: string[] = []
      if (errors.publicName) missing.push(tr.fieldPublicName)
      if (errors.street) missing.push(tr.fieldStreet)
      if (errors.county) missing.push(tr.fieldCounty)
      if (errors.city) missing.push(tr.fieldCity)
      if (errors.description) missing.push(tr.fieldDescription)
      if (errors.services) missing.push(tr.servicesHint.replace('{min}', String(MIN_PARTNER_PUBLIC_SERVICES)))
      if (errors.publicPhone) missing.push(tr.fieldPhone)
      if (errors.website) {
        if (!website.trim()) missing.push(tr.fieldWebsite)
        else {
          setSaveError(tr.websiteInvalid)
          return
        }
      }
      if (errors.social) missing.push(tr.fieldSocial)
      setSaveError(`${tr.missingFieldsPrefix} ${missing.join(', ')}.`)
      return
    }

    setHighlightIncompleteFields(false)

    if (slugDirty) {
      setSaveError(tr.saveSlugFirst)
      return
    }

    setSaving(true)
    try {
      const updated = await savePartnerProfile({
        publicName: nameTrimmed,
        street: streetTrimmed,
        county: countyTrimmed,
        city: cityTrimmed,
        zipCode: zipTrimmed || undefined,
        description: descTrimmed,
        services: servicii.length ? servicii : undefined,
        publicPhone: phoneTrimmed,
        whatsapp: whatsapp.trim() || undefined,
        website: normalizePartnerWebsite(website) || undefined,
        facebookUrl: facebookUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        instagramUrl: instagramUrl.trim() || undefined,
        tiktokUrl: tiktokUrl.trim() || undefined,
        ...(workPhotos.length > 0 ? { workPhotos } : {}),
      })
      setProfile(updated as PartnerData)
      setHighlightIncompleteFields(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : tr.saveErrorFallback)
    } finally {
      setSaving(false)
    }
  }

  const fe = fieldErrors

  /* completion tracking */
  const checks = {
    slug: !!savedPublicSlug,
    photo: !!logoPreview,
    name: !!publicName.trim(),
    location: !!county.trim() && !!city.trim() && !!street.trim(),
    description: !!description.trim(),
    services: servicii.length >= MIN_PARTNER_PUBLIC_SERVICES,
    phone: !!publicPhone.trim(),
    website: !!website.trim(),
    social: hasAtLeastOnePartnerSocialNetwork({
      facebookUrl,
      linkedinUrl,
      instagramUrl,
      tiktokUrl,
    }),
    gallery: workPhotos.length > 0,
  }
  const completedCount = Object.values(checks).filter(Boolean).length
  const totalChecks = Object.keys(checks).length
  const pct = Math.round((completedCount / totalChecks) * 100)

  const profileFullyComplete = useMemo(
    () =>
      isPartnerPublicProfileFullyComplete({
        publicSlug: savedPublicSlug,
        logoUrl: logoPreview,
        publicName,
        street,
        county,
        city,
        description,
        services: servicii,
        publicPhone,
        website,
        facebookUrl,
        linkedinUrl,
        instagramUrl,
        tiktokUrl,
        workPhotos,
      }),
    [
      savedPublicSlug,
      logoPreview,
      publicName,
      street,
      county,
      city,
      description,
      servicii,
      publicPhone,
      website,
      facebookUrl,
      linkedinUrl,
      instagramUrl,
      tiktokUrl,
      workPhotos,
    ],
  )

  useEffect(() => {
    if (profileFullyComplete) setPublicToggleNotice('')
  }, [profileFullyComplete])

  /* ── loading ── */
  if (loading) {
    return (
      <div className="p-6 sm:p-10">
        <div className="mb-6 h-8 w-52 animate-pulse rounded-xl bg-slate-200" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {[120, 200, 160, 180].map((h, i) => (
              <div key={i} style={{ height: h }} className="animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
          <div className="h-[480px] animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4 p-10 text-center">
        <p className="text-slate-500 font-['Inter']">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 font-['Inter']"
        >
          {tr.retry}
        </button>
      </div>
    )
  }

  return (
    <div className="relative z-0 box-border block !min-h-min min-w-0 w-full max-w-full shrink-0 bg-[#f5f5f7] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:pb-10 lg:pt-10">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-['Inter'] sm:text-3xl">{tr.pageTitle}</h1>
          <p className="mt-1 text-sm text-slate-500 font-['Inter']">{tr.pageSubtitle}</p>
        </div>

        {/* Visibility toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          aria-describedby={publicToggleNotice ? 'partner-public-toggle-notice' : undefined}
          disabled={togglingPublic}
          onClick={handleTogglePublic}
          title={!profileFullyComplete && !isPublic ? tr.completeToPublishTitle : undefined}
          className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition font-['Inter'] ${
            isPublic
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
          } disabled:cursor-wait disabled:opacity-70`}
        >
          <Eye className="h-4 w-4 shrink-0" strokeWidth={2} />
          {isPublic ? tr.profilePublic : tr.profilePrivate}
          <span
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
              isPublic ? 'bg-white/30' : 'bg-slate-400/40'
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                isPublic ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </span>
        </button>
      </div>

      {publicToggleNotice ? (
        <div
          id="partner-public-toggle-notice"
          role="alert"
          className="mb-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 sm:px-5"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" strokeWidth={2} aria-hidden />
          <div className="min-w-0">
            <p className="m-0 text-sm font-bold text-amber-950 font-['Inter']">{tr.publicToggleNoticeCannotPublishTitle}</p>
            <p className="mt-1 m-0 text-sm leading-relaxed text-amber-900/90 font-['Inter']">{publicToggleNotice}</p>
          </div>
        </div>
      ) : null}

      {/* Main two-column grid */}
      <div className="grid min-w-0 max-w-full auto-rows-min grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_minmax(0,360px)] xl:grid-cols-[1fr_minmax(0,400px)] lg:gap-8">
        {/* ── LEFT: form (self-start avoids grid stretch filler when preview column is taller) ── */}
        <form ref={formRef} onSubmit={handleSave} className="flex w-full min-w-0 flex-col gap-5 self-start">
          {/* Completion banner */}
          <div
            ref={completionBannerRef}
            className="rounded-2xl bg-white p-4 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.10)] sm:p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 font-['Inter']">{tr.completionHeading}</span>
              <span className={`text-sm font-bold font-['Inter'] ${pct === 100 ? 'text-emerald-600' : 'text-slate-500'}`}>
                {pct}%
              </span>
            </div>
            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              <CompletionItem
                done={checks.slug}
                label={`${tr.completionAddressPrefix}${PUBLIC_INSTALLER_PROFILE_PATH_SEGMENT}`}
              />
              <CompletionItem done={checks.photo} label={tr.completionPhoto} />
              <CompletionItem done={checks.name} label={tr.completionName} />
              <CompletionItem done={checks.location} label={tr.completionLocation} />
              <CompletionItem done={checks.description} label={tr.completionDescription} />
              <CompletionItem done={checks.services} label={tr.completionServices} />
              <CompletionItem done={checks.phone} label={tr.completionPhone} />
              <CompletionItem done={checks.website} label={tr.completionWebsite} />
              <CompletionItem done={checks.social} label={tr.completionSocial} />
              <CompletionItem done={checks.gallery} label={tr.completionGallery} />
            </div>
          </div>

          {/* Public page handle */}
          <FormSection icon={<Link2 className="h-4 w-4" strokeWidth={2} />} title={tr.sectionPublicHandle}>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
              <div className="min-w-0">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 font-['Inter']">{tr.handleLabel}</label>
                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    <input
                      type="text"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      value={publicSlugInput}
                      placeholder={tr.handlePlaceholder}
                      onChange={(e) => {
                        setPublicSlugInput(e.target.value.toLowerCase().replace(/^@+/, ''))
                        setSlugSaved(false)
                      }}
                      onBlur={() => setPublicSlugInput((prev) => slugifyPartnerPublicHandle(prev.trim()))}
                      className={`h-11 w-full rounded-xl border border-slate-200 bg-white py-0 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/60 font-['Inter'] ${
                        showSlugValidCheck || (slugDirty && slugCheckStatus === 'checking') ? 'pr-10 pl-4' : 'px-4'
                      }`}
                      aria-invalid={slugDirty && (slugCheckStatus === 'taken' || slugCheckStatus === 'invalid')}
                    />
                    {slugDirty && slugCheckStatus === 'checking' && (
                      <Loader2
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400"
                        strokeWidth={2}
                        aria-hidden
                      />
                    )}
                    {showSlugValidCheck && (
                      <CheckCircle2
                        className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-500"
                        strokeWidth={2}
                        aria-label={tr.handleAvailableAria}
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={!canSaveSlug}
                    onClick={() => void handleSavePublicSlug()}
                    className="h-11 shrink-0 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none font-['Inter'] sm:px-5"
                  >
                    {slugSaving ? tr.savingHandle : tr.saveHandle}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-slate-400 font-['Inter']">{tr.handleHint}</p>
                {slugDirty && slugCheckStatus === 'taken' && (
                  <p className="mt-2 text-xs font-medium text-red-600 font-['Inter']">
                    {tr.handleTaken}
                  </p>
                )}
                {slugDirty && slugCheckStatus === 'invalid' && (
                  <p className="mt-2 text-xs font-medium text-red-600 font-['Inter']">
                    {tr.handleInvalid}
                  </p>
                )}
                {slugSaveError && (
                  <p className="mt-2 text-xs font-medium text-red-600 font-['Inter']">{slugSaveError}</p>
                )}
                {slugSaved && (
                  <span className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-600 font-['Inter']">
                    <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                    {tr.handleSaved}
                  </span>
                )}
              </div>
              {effectivePublicSlug ? (
                <div className="min-w-0">
                  <Link
                    to={publicInstallerProfileCanonical(effectivePublicSlug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-1.5 inline-block text-sm font-semibold text-slate-700 transition hover:text-sky-800 focus:outline-none focus-visible:underline font-['Inter']"
                  >
                    {tr.publicPageLink}
                  </Link>
                  <div className="flex gap-2">
                    <Link
                      to={publicInstallerProfileCanonical(effectivePublicSlug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 min-w-0 flex-1 items-center rounded-xl border border-slate-100 bg-slate-50 px-3 font-mono text-[11px] leading-snug text-slate-600 break-all transition hover:border-slate-200 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 sm:text-xs font-['Inter']"
                      title={tr.openPublicPageTitle}
                    >
                      {publicProfileFullUrl}
                    </Link>
                    <button
                      type="button"
                      onClick={() => void copyPublicProfileLink()}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                      aria-label={profileLinkCopied ? tr.copiedLinkTitle : tr.copyLinkAria}
                      title={profileLinkCopied ? tr.copiedLinkTitle : tr.copyLinkTitle}
                    >
                      {profileLinkCopied ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" strokeWidth={2} />
                      ) : (
                        <Copy className="h-4 w-4" strokeWidth={2} />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="min-w-0 lg:flex lg:flex-col lg:justify-end">
                  <p className="text-xs text-amber-700/90 font-['Inter'] lg:pt-7">
                    {tr.completeCompanyForSlug}
                  </p>
                </div>
              )}
              </div>
            </div>
          </FormSection>

          {/* Photo */}
          <FormSection icon={<Upload className="h-4 w-4" strokeWidth={2} />} title={tr.sectionLogo}>
            <div className="flex items-center gap-5">
              <div className="relative">
                <div
                  className="h-20 w-20 cursor-pointer overflow-hidden rounded-2xl bg-slate-100 transition hover:opacity-80"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt={tr.logoAlt} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                      <Building2 className="h-7 w-7 text-slate-300" strokeWidth={1.5} />
                      <span className="text-[10px] text-slate-400 font-['Inter']">{tr.logoAlt}</span>
                    </div>
                  )}
                </div>
                {photoUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/30">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={photoUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="h-9 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 font-['Inter']"
                >
                  {logoPreview ? tr.changeImage : tr.uploadLogo}
                </button>
                {logoPreview && (
                  <button
                    type="button"
                    disabled={photoUploading}
                    onClick={handlePhotoDelete}
                    className="h-9 rounded-xl bg-red-50 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 font-['Inter']"
                  >
                    {tr.delete}
                  </button>
                )}
                <p className="text-xs text-slate-400 font-['Inter']">{tr.logoFormatHint}</p>
              </div>
            </div>
          </FormSection>

          {/* Identity */}
          <FormSection icon={<Building2 className="h-4 w-4" strokeWidth={2} />} title={tr.sectionIdentity}>
            <Field
              label={tr.publicNameLabel}
              placeholder={tr.publicNamePlaceholder}
              value={publicName}
              onChange={setPublicName}
              required
              invalid={!!fe?.publicName}
            />
          </FormSection>

          {/* Location */}
          <FormSection icon={<MapPin className="h-4 w-4" strokeWidth={2} />} title={tr.sectionLocation}>
            <Field
              label={tr.streetLabel}
              placeholder={tr.streetPlaceholder}
              value={street}
              onChange={(v) => setStreet(sanitizeStreetLine(v))}
              required
              invalid={!!fe?.street}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SelectField
                label={tr.countyLabel}
                options={[...ROMANIAN_COUNTIES]}
                value={county}
                onChange={handleCountyChange}
                placeholder={tr.selectPlaceholder}
                required
                invalid={!!fe?.county}
              />
              <SelectField
                label={tr.cityLabel}
                options={citiesForCounty}
                value={city}
                onChange={setCity}
                placeholder={tr.selectPlaceholder}
                required
                disabled={!county}
                invalid={!!fe?.city}
              />
              <Field
                label={tr.postalLabel}
                placeholder={tr.postalPlaceholder}
                value={zipCode}
                onChange={(v) => setZipCode(sanitizeRoPostalCode(v))}
                maxLength={6}
                inputMode="numeric"
                invalid={!!fe?.zipCode}
              />
            </div>
          </FormSection>

          {/* Description */}
          <section
            className={`rounded-2xl bg-white p-5 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.10)] sm:p-6 ${fe?.description ? SECTION_INVALID : ''}`}
          >
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" />
                </svg>
              </span>
              <h2
                className={`text-base font-bold font-['Inter'] ${fe?.description ? 'text-red-700' : 'text-slate-900'}`}
              >
                {tr.descriptionTitle} <span className="text-red-500">*</span>
              </h2>
            </div>
            <textarea
              rows={5}
              placeholder={tr.descriptionPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-invalid={fe?.description || undefined}
              className={`${TEXTAREA_BASE} ${fe?.description ? TEXTAREA_INVALID : TEXTAREA_OK}`}
            />
          </section>

          {/* Services */}
          <FormSection
            icon={<Wrench className="h-4 w-4" strokeWidth={2} />}
            title={tr.sectionServices}
            invalid={!!fe?.services}
          >
            <p className="-mt-1 text-xs text-slate-500 font-['Inter']">
              {tr.servicesHint.replace('{min}', String(MIN_PARTNER_PUBLIC_SERVICES))}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {serviciiOptions.map((opt) => {
                const active = servicii.includes(opt.id)
                return (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                      active
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleServiciu(opt.id)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                        active ? 'border-white bg-white' : 'border-slate-300'
                      }`}
                    >
                      {active && (
                        <svg className="h-3 w-3 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className="text-sm font-medium font-['Inter']">{opt.label}</span>
                  </label>
                )
              })}
            </div>
          </FormSection>

          {/* Contact */}
          <FormSection icon={<Phone className="h-4 w-4" strokeWidth={2} />} title={tr.sectionContact}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label={tr.phoneLabel}
                type="tel"
                placeholder={tr.phonePlaceholder}
                value={publicPhone}
                onChange={(v) => setPublicPhone(sanitizePhonePlusOnly(v))}
                required
                invalid={!!fe?.publicPhone}
              />
              <Field
                label={tr.whatsappLabel}
                type="tel"
                placeholder={tr.phonePlaceholder}
                value={whatsapp}
                onChange={(v) => setWhatsapp(sanitizePhonePlusOnly(v))}
              />
            </div>
            <Field
              label={tr.websiteLabel}
              type="url"
              placeholder={tr.websitePlaceholder}
              value={website}
              onChange={setWebsite}
              onBlur={() => {
                const n = normalizePartnerWebsite(website)
                if (n && n !== website) setWebsite(n)
              }}
              required
              invalid={!!fe?.website}
            />
          </FormSection>

          {/* Social */}
          <FormSection
            icon={<Globe className="h-4 w-4" strokeWidth={2} />}
            title={tr.sectionSocial}
            invalid={!!fe?.social}
          >
            <p className="-mt-1 text-xs text-slate-500 font-['Inter']">{tr.socialHint}</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label={tr.facebookLabel}
                type="url"
                placeholder={tr.facebookPlaceholder}
                value={facebookUrl}
                onChange={setFacebookUrl}
              />
              <Field
                label={tr.instagramLabel}
                type="url"
                placeholder={tr.instagramPlaceholder}
                value={instagramUrl}
                onChange={setInstagramUrl}
              />
              <Field
                label={tr.linkedinLabel}
                type="url"
                placeholder={tr.linkedinPlaceholder}
                value={linkedinUrl}
                onChange={setLinkedinUrl}
              />
              <Field
                label={tr.tiktokLabel}
                type="url"
                placeholder={tr.tiktokPlaceholder}
                value={tiktokUrl}
                onChange={setTiktokUrl}
              />
            </div>
          </FormSection>

          {/* Work photo gallery */}
          <section className="rounded-2xl bg-white p-5 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.10)] sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-['Inter']">{tr.galleryTitle}</h2>
                  <p className="text-xs text-slate-400 font-['Inter']">
                    {tr.galleryCountHint.replace('{count}', String(workPhotos.length))}
                  </p>
                </div>
              </div>
              {workPhotos.length < 8 && (
                <button
                  type="button"
                  disabled={workPhotosUploading}
                  onClick={() => workPhotosInputRef.current?.click()}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 font-['Inter']"
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  {tr.addPhoto}
                </button>
              )}
            </div>
            <input
              ref={workPhotosInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleWorkPhotosAdd}
              className="hidden"
            />
            {workPhotos.length === 0 ? (
              <button
                type="button"
                disabled={workPhotosUploading}
                onClick={() => workPhotosInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 py-8 text-slate-400 transition hover:border-slate-300 hover:text-slate-500 disabled:opacity-50"
              >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
                </svg>
                <span className="text-sm font-medium font-['Inter']">{tr.uploadWorkPhotos}</span>
                <span className="text-xs font-['Inter']">{tr.uploadWorkPhotosHint}</span>
              </button>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {workPhotos.map((src, idx) => (
                  <div key={idx} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                    <img
                      src={src}
                      alt={tr.workPhotoAlt.replace('{n}', String(idx + 1))}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleWorkPhotoDelete(idx)}
                      className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/40"
                      aria-label={tr.deletePhotoAria}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-600 opacity-0 shadow transition group-hover:opacity-100">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                    </button>
                  </div>
                ))}
                {workPhotosUploading && (
                  <div className="flex aspect-square items-center justify-center rounded-xl bg-slate-100">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Submit */}
          <div className="flex items-center gap-3 pb-4">
            <button
              type="submit"
              disabled={saving}
              className="h-11 rounded-xl bg-slate-900 px-7 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50 font-['Inter']"
            >
              {saving ? tr.savingProfile : tr.saveProfile}
            </button>
            {saved && (
              <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 font-['Inter']">
                <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                {tr.saved}
              </div>
            )}
            {saveError && (
              <p className="text-sm text-red-600 font-['Inter']">{saveError}</p>
            )}
          </div>
        </form>

        {/* ── RIGHT: live preview (sticky on lg — scroll is #partner-layout-scroll) ── */}
        <aside className="min-w-0 max-w-full lg:sticky lg:top-8 lg:z-10 lg:self-start">
          <div className="mb-3 flex items-center gap-2">
            <Eye className="h-4 w-4 text-slate-500" strokeWidth={2} />
            <span className="text-sm font-semibold text-slate-500 font-['Inter']">{tr.previewHeading}</span>
          </div>
          <PartnerPublicProfileCard
            variant="owner-preview"
            logoUrl={logoPreview}
            publicName={publicName}
            companyName={profile?.companyName}
            city={city}
            county={county}
            description={description}
            servicii={servicii}
            publicPhone={publicPhone}
            whatsapp={whatsapp}
            website={website}
            facebookUrl={facebookUrl}
            linkedinUrl={linkedinUrl}
            instagramUrl={instagramUrl}
            tiktokUrl={tiktokUrl}
            isPublic={isPublic}
            workPhotos={workPhotos}
            partnerProfileAdministrativelyVerified={profile?.isApproved === true}
          />
          <p className="mt-3 text-center text-xs text-slate-400 font-['Inter']">
            {tr.previewHint}
          </p>
        </aside>
      </div>
    </div>
  )
}
