import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import {
  getAuthRole,
  getClientProfile,
  getPublicProductModels,
  getPublicReturSerialEligibility,
  normalizeWarehouseSerialNumber,
  submitProductRetur,
  ReturSubmitError,
  type ClientProfileDto,
  type PublicProductModelRow,
} from '../lib/api'
import { getCitiesForCounty, ROMANIAN_COUNTIES, type RomanianCounty } from '../lib/romanian-counties-cities'
import { getReturnareProduseTranslations } from '../i18n/returnare-produse'
import SEO from '../components/SEO'
import SchemaOrg from '../components/SchemaOrg'
import { useSeoPage } from '../contexts/SeoConfigContext'

const inputClass =
  'box-border h-11 w-full min-w-0 max-w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/80 font-[\'Inter\']'

/** Clase adăugate când câmpul din formularul client (retur) nu e valid după „Continuă”. */
const clientFieldErrorClass =
  ' border-red-500 bg-red-50/40 ring-2 ring-red-200/90 focus:border-red-600 focus:ring-red-400/80'

const selectClass = `${inputClass} cursor-pointer bg-white`

const textareaClass =
  'box-border min-h-[5.5rem] w-full min-w-0 max-w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/80 font-[\'Inter\']'

const ibanInputClass = `${inputClass} font-mono text-[13px] tracking-wide sm:text-sm`

const MIN_CONDITION_PHOTOS = 2
const MAX_CONDITION_PHOTOS = 6

function formatPhotoCount(template: string, count: number, min: number, max: number): string {
  return template
    .replace(/\{count\}/g, String(count))
    .replace(/\{min\}/g, String(min))
    .replace(/\{max\}/g, String(max))
}

/** Fișier acceptat ca JPEG pentru retur (.jpg / .jpeg). */
function isJpegPhotoFile(file: File): boolean {
  const t = (file.type || '').toLowerCase()
  if (t === 'image/jpeg' || t === 'image/jpg' || t === 'image/pjpeg') return true
  const n = file.name.toLowerCase()
  return n.endsWith('.jpg') || n.endsWith('.jpeg')
}

const CLIENT_EMAIL_SYNTAX_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidClientEmail(trimmed: string): boolean {
  return CLIENT_EMAIL_SYNTAX_RE.test(trimmed)
}

/** Deschide pasul din acordeon și derulează la el (după „Continuă”). */
function openReturnStepAndScroll(stepNum: number) {
  requestAnimationFrame(() => {
    const el = document.getElementById(`return-step-${stepNum}`) as HTMLDetailsElement | null
    if (!el) return
    el.open = true
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const CLIENT_NAME_RE = /^[\p{L}\s'\-]+$/u

type ClientFormFieldId =
  | 'lastName'
  | 'firstName'
  | 'street'
  | 'county'
  | 'city'
  | 'postal'
  | 'phone'
  | 'email'

function getClientFormInvalidFieldIds(
  lastName: string,
  firstName: string,
  street: string,
  county: string,
  city: string,
  postal: string,
  phone: string,
  email: string,
): Set<ClientFormFieldId> {
  const out = new Set<ClientFormFieldId>()
  const ln = lastName.trim()
  const fn = firstName.trim()
  if (!ln || ln.length < 2 || !CLIENT_NAME_RE.test(ln)) out.add('lastName')
  if (!fn || fn.length < 2 || !CLIENT_NAME_RE.test(fn)) out.add('firstName')
  const st = street.trim()
  if (!st || st.length < 3) out.add('street')
  if (!county) out.add('county')
  if (!city) out.add('city')
  if (!/^\d{6}$/.test(postal)) out.add('postal')
  const digitsPhone = phone.replace(/\D/g, '')
  if (digitsPhone.length < 9) out.add('phone')
  const em = email.trim()
  if (!em || !isValidClientEmail(em)) out.add('email')
  return out
}

type ReturnReasonId = 'withdrawal' | 'defective' | 'not_as_described' | 'damaged_delivery' | 'other'

/** Doar litere Unicode, spațiu, apostrof, cratimă (Nume / Prenume). */
function sanitizeLettersOnly(raw: string): string {
  return raw.normalize('NFC').replace(/[^\p{L}\s'\-]/gu, '')
}

/** Formatează automat zz-ll-aaaa pe măsură ce utilizatorul tastează cifre; zi ≤ 31, lună ≤ 12. */
function formatDdMmYyyyAsYouType(raw: string): string {
  let digits = raw.replace(/\D/g, '').slice(0, 8)
  if (digits.length >= 2) {
    let d = parseInt(digits.slice(0, 2), 10)
    if (Number.isNaN(d)) d = 0
    d = Math.min(31, Math.max(0, d))
    digits = String(d).padStart(2, '0') + digits.slice(2)
  }
  if (digits.length >= 4) {
    let m = parseInt(digits.slice(2, 4), 10)
    if (Number.isNaN(m)) m = 0
    m = Math.min(12, Math.max(0, m))
    digits = digits.slice(0, 2) + String(m).padStart(2, '0') + digits.slice(4)
  }
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`
}

const BTO_ORDER_PREFIX = 'BTO-'

/** Sufix număr comandă (fără prefix); litere, cifre, cratimă. */
function sanitizeOrderNumberSuffix(raw: string): string {
  return raw.replace(/[^0-9A-Za-z\-]/g, '').slice(0, 40)
}

function buildBtoOrderNumber(suffixRaw: string): string {
  let s = String(suffixRaw || '').trim()
  if (/^bto-/i.test(s)) s = s.slice(4).trim()
  s = sanitizeOrderNumberSuffix(s)
  if (!s) return ''
  return `${BTO_ORDER_PREFIX}${s}`
}

const LJC_SERIAL_PREFIX = 'LJC'
const DEFAULT_RETURN_BRAND = 'Lithtech'

function sanitizeSerialSuffix(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 32)
}

function buildLjcSerial(suffixRaw: string): string {
  let s = String(suffixRaw || '').trim()
  if (/^ljc/i.test(s)) s = s.slice(3).trim().replace(/^[\-+]+/, '')
  s = sanitizeSerialSuffix(s)
  if (!s) return ''
  return `${LJC_SERIAL_PREFIX}${s}`
}

/** Prefill marcă / model din răspunsul eligibilității retur (stocuri + catalog modele). */
type ReturModelPrefillPayload = {
  productModelId: string | null
  brand: string | null
  modelName: string | null
  modelNumber: string | null
}

function findPublicModelRowForStockPrefill(
  rows: PublicProductModelRow[],
  pre: ReturModelPrefillPayload,
): PublicProductModelRow | undefined {
  const id = pre.productModelId?.trim()
  if (id) {
    const byId = rows.find((m) => m.id === id)
    if (byId) return byId
  }
  const mn = pre.modelNumber?.trim()
  if (!mn) return undefined
  const lower = mn.toLowerCase()
  return rows.find((m) => m.modelNumber.trim().toLowerCase() === lower)
}

function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '')
}

/** Aliniază textul din profil la valorile din `<select>` (județe RO). */
function matchRomanianCounty(raw: string): string {
  const t = String(raw ?? '').trim()
  if (!t) return ''
  if ((ROMANIAN_COUNTIES as readonly string[]).includes(t)) return t
  const low = stripDiacritics(t).toLowerCase()
  for (const c of ROMANIAN_COUNTIES) {
    if (stripDiacritics(c).toLowerCase() === low) return c
  }
  return ''
}

function matchCityInCounty(raw: string, cities: string[]): string {
  const t = String(raw ?? '').trim()
  if (!t || cities.length === 0) return ''
  if (cities.includes(t)) return t
  const low = stripDiacritics(t).toLowerCase()
  for (const c of cities) {
    if (stripDiacritics(c).toLowerCase() === low) return c
  }
  return ''
}

/**
 * Adresă preluare din profil: livrare dacă e diferită de facturare și completă, altfel facturare.
 * Județ/oraș trebuie să coincidă cu listele din formular.
 */
function mapClientProfileToPickupAddress(
  profile: ClientProfileDto,
): { street: string; county: string; city: string; postal: string } | null {
  const useDel =
    profile.deliveryDifferent &&
    String(profile.delAddress ?? '').trim().length >= 3 &&
    String(profile.delCounty ?? '').trim() &&
    String(profile.delCity ?? '').trim()

  const attempts: Array<{ street: string; countyRaw: string; cityRaw: string; postalRaw: string }> = []
  if (useDel) {
    attempts.push({
      street: String(profile.delAddress).trim(),
      countyRaw: String(profile.delCounty ?? '').trim(),
      cityRaw: String(profile.delCity ?? '').trim(),
      postalRaw: String(profile.delPostal ?? ''),
    })
  }
  attempts.push({
    street: String(profile.billAddress ?? '').trim(),
    countyRaw: String(profile.billCounty ?? '').trim(),
    cityRaw: String(profile.billCity ?? '').trim(),
    postalRaw: String(profile.billPostal ?? ''),
  })

  for (const a of attempts) {
    if (a.street.length < 3) continue
    const county = matchRomanianCounty(a.countyRaw)
    if (!county) continue
    const cities = getCitiesForCounty(county as RomanianCounty)
    const city = matchCityInCounty(a.cityRaw, cities)
    if (!city) continue
    const digits = a.postalRaw.replace(/\D/g, '').slice(0, 6)
    const postal = digits.length === 6 ? digits : ''
    return { street: a.street, county, city, postal }
  }
  return null
}

/** 16 cifre după LJC, afișate ca LJC-####-####-####-#### în secțiunea „Verifică”. */
const LJC_GATE_DIGIT_COUNT = 16

function formatLjcSerialGateDisplay(digitsRaw: string): string {
  const d = sanitizeSerialSuffix(digitsRaw).slice(0, LJC_GATE_DIGIT_COUNT)
  if (!d) return `${LJC_SERIAL_PREFIX}-`
  const parts: string[] = []
  for (let i = 0; i < d.length; i += 4) {
    parts.push(d.slice(i, i + 4))
  }
  return `${LJC_SERIAL_PREFIX}-${parts.join('-')}`
}

const DD_MM_YYYY_RE = /^\d{2}-\d{2}-\d{4}$/

function isValidDdMmYyyy(s: string): boolean {
  const t = s.trim()
  if (!DD_MM_YYYY_RE.test(t)) return false
  const [dd, mm, yyyy] = t.split('-').map(Number)
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return false
  const d = new Date(yyyy, mm - 1, dd)
  return d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd
}

/** true dacă data recepției (zz-ll-aaaa validă) e cu mai mult de `maxDaysAfterReceipt` zile în urmă față de azi (local). */
function receiptDateOlderThanAllowedDays(rd: string, maxDaysAfterReceipt: number): boolean {
  if (!isValidDdMmYyyy(rd)) return false
  const [dd, mm, yyyy] = rd.trim().split('-').map(Number)
  const receiptStart = new Date(yyyy, mm - 1, dd)
  const t = new Date()
  const todayStart = new Date(t.getFullYear(), t.getMonth(), t.getDate())
  const diffDays = Math.floor((todayStart.getTime() - receiptStart.getTime()) / 86400000)
  return diffDays > maxDaysAfterReceipt
}

const RETURN_RECEIPT_MAX_DAYS = 15

type OrderProductFieldId = 'orderNumber' | 'receiptDate' | 'serialNumber' | 'brand' | 'model'

function getOrderProductInvalidFieldIds(
  orderNumberSuffix: string,
  receiptDateVal: string,
  serialSuffix: string,
  productBrand: string,
  productModel: string,
): Set<OrderProductFieldId> {
  const out = new Set<OrderProductFieldId>()
  if (!buildBtoOrderNumber(orderNumberSuffix).trim()) out.add('orderNumber')
  const rd = receiptDateVal.trim()
  if (!rd) out.add('receiptDate')
  else if (!isValidDdMmYyyy(rd)) out.add('receiptDate')
  else if (receiptDateOlderThanAllowedDays(rd, RETURN_RECEIPT_MAX_DAYS)) out.add('receiptDate')
  if (!buildLjcSerial(serialSuffix).trim()) out.add('serialNumber')
  if (!productBrand.trim()) out.add('brand')
  if (!productModel.trim()) out.add('model')
  return out
}

function normalizeIban(raw: string): string {
  return raw.replace(/\s+/g, '').toUpperCase()
}

/** Păstrează doar litere/cifre, max 24 (RO + 22). */
function normalizeRoIbanInput(raw: string): string {
  return raw.replace(/\s+/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24)
}

/** Afișare: „RO” + restul în grupe de câte 4 caractere. */
function formatRoIbanWithSpaces(normalized: string): string {
  const s = normalizeIban(normalized)
  if (!s) return ''
  const head = s.slice(0, 2)
  const rest = s.slice(2)
  const parts: string[] = [head]
  for (let i = 0; i < rest.length; i += 4) {
    parts.push(rest.slice(i, i + 4))
  }
  return parts.join(' ')
}

/** IBAN România: RO + 22 caractere (24 total, fără spații). */
function isValidRoIban(raw: string): boolean {
  return /^RO\d{2}[A-Z0-9]{20}$/.test(normalizeIban(raw))
}

/** Titular cont: litere, cifre, spații și semne frecvente în denumiri. */
function sanitizeTitularCont(raw: string): string {
  return raw.normalize('NFC').replace(/[^\p{L}\p{N}\s'\-.,()/&]/gu, '')
}

function renderInlineBold(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-slate-900">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

export default function ReturnareProduse() {
  const { language } = useLanguage()
  const tr = getReturnareProduseTranslations(language.code)
  const seo = useSeoPage('returnare')
  const f = tr.clientInfoForm
  const uid = useId().replace(/:/g, '')

  const [isClientLogged, setIsClientLogged] = useState(
    () => typeof window !== 'undefined' && getAuthRole() === 'client',
  )

  const clientDetailsRef = useRef<HTMLDetailsElement>(null)
  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [street, setStreet] = useState('')
  const [county, setCounty] = useState('')
  const [city, setCity] = useState('')
  const [postal, setPostal] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState('')
  const [clientFormShowFieldErrors, setClientFormShowFieldErrors] = useState(false)

  const [orderNumberSuffix, setOrderNumberSuffix] = useState('')
  const [receiptDate, setReceiptDate] = useState('')
  const [serialSuffix, setSerialSuffix] = useState('')
  const [serialVerifyGateError, setSerialVerifyGateError] = useState('')
  const [serialGateVerified, setSerialGateVerified] = useState(false)
  /** Rezultat verificare server (stocuri + data recepție). */
  const [serialEligibilityStatus, setSerialEligibilityStatus] = useState<'idle' | 'loading' | 'eligible' | 'ineligible' | 'error'>('idle')
  const prevSerialGateVerifiedRef = useRef(false)
  /** SN normalizat pentru care s-a confirmat eligibilitatea (prefill din stocuri). */
  const [returStockVerifiedSerial, setReturStockVerifiedSerial] = useState<string | null>(null)
  const [returModelPrefill, setReturModelPrefill] = useState<ReturModelPrefillPayload | null>(null)
  const [receiptLockedFromStock, setReceiptLockedFromStock] = useState(false)
  const [brandModelLockedFromStock, setBrandModelLockedFromStock] = useState(false)
  const [productBrand, setProductBrand] = useState('')
  const [productModel, setProductModel] = useState('')
  const [selectedModelId, setSelectedModelId] = useState('')
  const [publicModels, setPublicModels] = useState<PublicProductModelRow[] | 'loading' | 'error'>('loading')
  const [orderProductFormError, setOrderProductFormError] = useState('')
  const [orderProductShowFieldErrors, setOrderProductShowFieldErrors] = useState(false)

  const [returnReason, setReturnReason] = useState<ReturnReasonId | ''>('')
  const [returnReasonOther, setReturnReasonOther] = useState('')
  const [returnReasonError, setReturnReasonError] = useState('')

  const [condUninstalled, setCondUninstalled] = useState(false)
  const [condSeals, setCondSeals] = useState(false)
  const [condPackaging, setCondPackaging] = useState(false)
  const [conditionPhotos, setConditionPhotos] = useState<File[]>([])
  const [conditionFormError, setConditionFormError] = useState('')

  const [pickupStreet, setPickupStreet] = useState('')
  const [pickupCounty, setPickupCounty] = useState('')
  const [pickupCity, setPickupCity] = useState('')
  const [pickupPostal, setPickupPostal] = useState('')
  const [pickupAddressFormError, setPickupAddressFormError] = useState('')

  const [refundTitular, setRefundTitular] = useState('')
  const [refundIban, setRefundIban] = useState('')
  const [refundMethodFormError, setRefundMethodFormError] = useState('')

  const [submitPolicyAccepted, setSubmitPolicyAccepted] = useState(false)
  const [submitDeclarationAccepted, setSubmitDeclarationAccepted] = useState(false)
  const [submitPanelError, setSubmitPanelError] = useState('')
  const [returSubmitSeries, setReturSubmitSeries] = useState<string | null>(null)
  const [isSubmittingRetur, setIsSubmittingRetur] = useState(false)
  /** Ultimul pas (return-step-N) finalizat cu „Continuă”; controlează accesul secvențial la pași și la trimitere. */
  const [highestCompletedStepNum, setHighestCompletedStepNum] = useState(0)

  const op = tr.orderProductForm
  const rr = tr.returnReasonForm
  const pc = tr.productConditionForm
  const pa = tr.pickupAddressForm
  const rf = tr.refundMethodForm
  const sp = tr.submitPanel
  const totalReturnSteps = isClientLogged ? 5 : 6
  const submitSectionUnlocked = highestCompletedStepNum >= totalReturnSteps
  const orderProductDetailsRef = useRef<HTMLDetailsElement>(null)
  const returnReasonDetailsRef = useRef<HTMLDetailsElement>(null)
  const productConditionDetailsRef = useRef<HTMLDetailsElement>(null)
  const pickupAddressDetailsRef = useRef<HTMLDetailsElement>(null)
  /** O singură completare automată din profil per sesiune autentificată client. */
  const pickupProfilePrefilledRef = useRef(false)
  const refundMethodDetailsRef = useRef<HTMLDetailsElement>(null)
  const conditionPhotosInputRef = useRef<HTMLInputElement>(null)

  const citiesForCounty = useMemo(() => getCitiesForCounty(county), [county])
  const pickupCitiesForCounty = useMemo(() => getCitiesForCounty(pickupCounty), [pickupCounty])

  const loadPublicModels = useCallback(() => {
    setPublicModels('loading')
    getPublicProductModels()
      .then((rows) => {
        setPublicModels(rows)
        if (rows.length === 0) {
          setProductBrand('')
          setProductModel('')
          setSelectedModelId('')
        }
      })
      .catch(() => {
        setPublicModels('error')
        setSelectedModelId('')
      })
  }, [])

  useEffect(() => {
    loadPublicModels()
  }, [loadPublicModels])

  /** După încărcarea catalogului: prefill din stocuri (dacă verificarea SN a reușit) sau implicit Lithtech. */
  useEffect(() => {
    if (!Array.isArray(publicModels)) return
    if (publicModels.length === 0) {
      setProductBrand('')
      setProductModel('')
      setSelectedModelId('')
      return
    }
    if (returStockVerifiedSerial && returModelPrefill) {
      const matched = findPublicModelRowForStockPrefill(publicModels, returModelPrefill)
      if (matched) {
        setProductBrand(matched.brand)
        setSelectedModelId(matched.id)
        setProductModel(matched.name)
        setBrandModelLockedFromStock(true)
      } else {
        const pb = returModelPrefill.brand?.trim()
        if (pb) {
          const br = publicModels.find((m) => m.brand.trim().toLowerCase() === pb.toLowerCase())?.brand
          if (br) setProductBrand(br)
        }
        const mn = returModelPrefill.modelName?.trim()
        if (mn) setProductModel(mn)
        setBrandModelLockedFromStock(false)
      }
      setReturModelPrefill(null)
      return
    }
    if (returStockVerifiedSerial) return
    const lith = publicModels.filter((m) => m.brand.trim().toLowerCase() === DEFAULT_RETURN_BRAND.toLowerCase())
    const pick = lith[0] ?? publicModels[0]
    setProductBrand(pick.brand)
    setProductModel(pick.name)
    setSelectedModelId(pick.id)
  }, [publicModels, returStockVerifiedSerial, returModelPrefill])

  /** Evită mesaje roșii vechi (ex. după submit eșuat) când utilizatorul își actualizează fotografiile sau declarațiile. */
  useEffect(() => {
    setSubmitPanelError('')
  }, [conditionPhotos.length, condUninstalled, condSeals, condPackaging])

  const uniqueBrands = useMemo((): string[] => {
    if (!Array.isArray(publicModels)) return []
    const set = new Set<string>()
    for (const m of publicModels) {
      const b = m.brand.trim()
      if (b) set.add(b)
    }
    return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  }, [publicModels])

  const modelsForCurrentBrand = useMemo((): PublicProductModelRow[] => {
    if (!Array.isArray(publicModels) || !productBrand.trim()) return []
    const pb = productBrand.trim().toLowerCase()
    return publicModels.filter((m) => m.brand.trim().toLowerCase() === pb)
  }, [publicModels, productBrand])

  useEffect(() => {
    if (!county) {
      setCity('')
      return
    }
    setCity((prev) => (citiesForCounty.includes(prev) ? prev : ''))
  }, [county, citiesForCounty])

  useEffect(() => {
    if (!pickupCounty) {
      setPickupCity('')
      return
    }
    setPickupCity((prev) => (pickupCitiesForCounty.includes(prev) ? prev : ''))
  }, [pickupCounty, pickupCitiesForCounty])

  const conditionPhotoUrls = useMemo(
    () => conditionPhotos.map((f) => URL.createObjectURL(f)),
    [conditionPhotos],
  )

  useEffect(() => {
    const urls = conditionPhotoUrls
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [conditionPhotoUrls])

  useEffect(() => {
    const sync = () => setIsClientLogged(getAuthRole() === 'client')
    sync()
    window.addEventListener('baterino-auth-change', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('baterino-auth-change', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  /** Client autentificat: precompletare adresă preluare din profil (facturare sau livrare dacă e separată). */
  useEffect(() => {
    if (!isClientLogged) {
      pickupProfilePrefilledRef.current = false
      return
    }
    if (pickupProfilePrefilledRef.current) return
    let cancelled = false
    void (async () => {
      try {
        const { profile } = await getClientProfile()
        if (cancelled || !profile) return
        const pick = mapClientProfileToPickupAddress(profile)
        if (!pick) return
        pickupProfilePrefilledRef.current = true
        setPickupStreet(pick.street)
        setPickupCounty(pick.county)
        setPickupCity(pick.city)
        setPickupPostal(pick.postal)
      } catch {
        /* profil indisponibil sau sesiune expirată */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isClientLogged])

  useEffect(() => {
    setHighestCompletedStepNum(0)
    setSubmitPolicyAccepted(false)
    setSubmitDeclarationAccepted(false)
    setClientFormShowFieldErrors(false)
    setOrderProductShowFieldErrors(false)
  }, [isClientLogged])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!serialGateVerified && !isClientLogged) {
      const c1 = document.getElementById('return-step-1') as HTMLDetailsElement | null
      if (c1?.open) c1.open = false
    }
    const maxAllowed = highestCompletedStepNum + 1
    const maxStepId = isClientLogged ? 5 : 6
    for (let s = maxAllowed + 1; s <= maxStepId; s += 1) {
      const el = document.getElementById(`return-step-${s}`) as HTMLDetailsElement | null
      if (el?.open) el.open = false
    }
  }, [highestCompletedStepNum, isClientLogged, serialGateVerified])

  const validateClientForm = useCallback((): string | null => {
    const ln = lastName.trim()
    const fn = firstName.trim()
    if (!ln || !fn) return f.fillRequired
    if (ln.length < 2 || fn.length < 2 || !CLIENT_NAME_RE.test(ln) || !CLIENT_NAME_RE.test(fn)) return f.invalidNames
    if (!street.trim() || street.trim().length < 3) return f.fillRequired
    if (!county || !city) return f.fillRequired
    if (!/^\d{6}$/.test(postal)) return f.invalidPostal
    const digitsPhone = phone.replace(/\D/g, '')
    if (digitsPhone.length < 9) return f.fillRequired
    const em = email.trim()
    if (!em) return f.fillRequired
    if (!isValidClientEmail(em)) return f.invalidEmail
    return null
  }, [lastName, firstName, street, county, city, postal, phone, email, f])

  const clientFormInvalidFields = useMemo(() => {
    if (!clientFormShowFieldErrors) return new Set<ClientFormFieldId>()
    return getClientFormInvalidFieldIds(lastName, firstName, street, county, city, postal, phone, email)
  }, [clientFormShowFieldErrors, lastName, firstName, street, county, city, postal, phone, email])

  const onClientContinue = useCallback(() => {
    const err = validateClientForm()
    if (err) {
      setClientFormShowFieldErrors(true)
      setFormError(err)
      return
    }
    setClientFormShowFieldErrors(false)
    setFormError('')
    const el = clientDetailsRef.current
    if (el) el.open = false
    setHighestCompletedStepNum((h) => Math.max(h, 1))
    openReturnStepAndScroll(2)
  }, [validateClientForm])

  const validateOrderProductForm = useCallback((): string | null => {
    const on = buildBtoOrderNumber(orderNumberSuffix).trim()
    const rd = receiptDate.trim()
    const sn = buildLjcSerial(serialSuffix).trim()
    const br = productBrand.trim()
    const mo = productModel.trim()
    if (!on || !rd || !sn || !br || !mo) return op.fillRequired
    if (!isValidDdMmYyyy(rd)) return op.invalidDate
    if (receiptDateOlderThanAllowedDays(rd, RETURN_RECEIPT_MAX_DAYS)) return op.receiptDateTooOld
    return null
  }, [orderNumberSuffix, receiptDate, serialSuffix, productBrand, productModel, op])

  const orderProductInvalidFields = useMemo(() => {
    if (!orderProductShowFieldErrors) return new Set<OrderProductFieldId>()
    return getOrderProductInvalidFieldIds(orderNumberSuffix, receiptDate, serialSuffix, productBrand, productModel)
  }, [orderProductShowFieldErrors, orderNumberSuffix, receiptDate, serialSuffix, productBrand, productModel])

  const receiptFieldDisabledFromStock = receiptLockedFromStock
  const serialFieldDisabledFromStock = receiptLockedFromStock || brandModelLockedFromStock

  const onOrderProductContinue = useCallback(() => {
    const err = validateOrderProductForm()
    if (err) {
      setOrderProductShowFieldErrors(true)
      setOrderProductFormError(err)
      return
    }
    setOrderProductShowFieldErrors(false)
    setOrderProductFormError('')
    const el = orderProductDetailsRef.current
    if (el) el.open = false
    setHighestCompletedStepNum((h) => Math.max(h, isClientLogged ? 1 : 2))
    const nextStep = isClientLogged ? 2 : 3
    openReturnStepAndScroll(nextStep)
  }, [validateOrderProductForm, isClientLogged])

  const validateReturnReasonForm = useCallback((): string | null => {
    if (!returnReason) return rr.fillRequired
    if (returnReason === 'other' && !returnReasonOther.trim()) return rr.fillOtherRequired
    return null
  }, [returnReason, returnReasonOther, rr])

  const onReturnReasonContinue = useCallback(() => {
    const err = validateReturnReasonForm()
    if (err) {
      setReturnReasonError(err)
      return
    }
    setReturnReasonError('')
    const el = returnReasonDetailsRef.current
    if (el) el.open = false
    setHighestCompletedStepNum((h) => Math.max(h, isClientLogged ? 2 : 3))
    const nextStep = isClientLogged ? 3 : 4
    openReturnStepAndScroll(nextStep)
  }, [validateReturnReasonForm, isClientLogged])

  const validateProductConditionForm = useCallback((): string | null => {
    if (!condUninstalled && !condSeals && !condPackaging) return pc.fillCheckboxes
    if (conditionPhotos.length < MIN_CONDITION_PHOTOS || conditionPhotos.length > MAX_CONDITION_PHOTOS) {
      return pc.fillPhotosRange
    }
    for (const f of conditionPhotos) {
      if (!isJpegPhotoFile(f)) return pc.fillPhotosWrongType
    }
    return null
  }, [condUninstalled, condSeals, condPackaging, conditionPhotos, pc])

  /** Pasul „Declarație / fotografii”: invitat = 4, client autentificat = 3 (aliniat cu `return-step-*`). */
  const productConditionStepNum = isClientLogged ? 3 : 4

  /**
   * Dacă utilizatorul revine la pasul condiție și șterge fotografii / debifează tot, progresul rămânea la 6
   * și „Trimite” rămânea activ — validarea eșua la trimitere (mesajul 2–6 JPEG) fără să fie clar că lipsește pasul 4.
   * Revocăm pașii finalizați după condiție până refac pașii cu „Continuă”.
   */
  useEffect(() => {
    if (validateProductConditionForm() !== null) {
      setHighestCompletedStepNum((h) => Math.min(h, productConditionStepNum - 1))
    }
  }, [validateProductConditionForm, productConditionStepNum])

  const onProductConditionContinue = useCallback(() => {
    const err = validateProductConditionForm()
    if (err) {
      setConditionFormError(err)
      return
    }
    setConditionFormError('')
    const el = productConditionDetailsRef.current
    if (el) el.open = false
    setHighestCompletedStepNum((h) => Math.max(h, isClientLogged ? 3 : 4))
    const nextStep = isClientLogged ? 4 : 5
    openReturnStepAndScroll(nextStep)
  }, [validateProductConditionForm, isClientLogged])

  const validatePickupAddressForm = useCallback((): string | null => {
    if (!pickupStreet.trim() || pickupStreet.trim().length < 3) return pa.fillRequired
    if (!pickupCounty || !pickupCity) return pa.fillRequired
    if (!/^\d{6}$/.test(pickupPostal)) return pa.invalidPostal
    return null
  }, [pickupStreet, pickupCounty, pickupCity, pickupPostal, pa])

  const onPickupAddressContinue = useCallback(() => {
    const err = validatePickupAddressForm()
    if (err) {
      setPickupAddressFormError(err)
      return
    }
    setPickupAddressFormError('')
    const el = pickupAddressDetailsRef.current
    if (el) el.open = false
    setHighestCompletedStepNum((h) => Math.max(h, isClientLogged ? 4 : 5))
    const nextStep = isClientLogged ? 5 : 6
    openReturnStepAndScroll(nextStep)
  }, [validatePickupAddressForm, isClientLogged])

  const validateRefundMethodForm = useCallback((): string | null => {
    const tit = refundTitular.trim()
    if (!tit || !refundIban.trim()) return rf.fillRequired
    const titRe = /^[\p{L}\p{N}\s'\-.,()/&]+$/u
    if (tit.length < 2 || !titRe.test(tit)) return rf.invalidTitular
    if (!isValidRoIban(refundIban)) return rf.invalidIban
    return null
  }, [refundTitular, refundIban, rf])

  const onRefundMethodContinue = useCallback(() => {
    const err = validateRefundMethodForm()
    if (err) {
      setRefundMethodFormError(err)
      return
    }
    setRefundMethodFormError('')
    const el = refundMethodDetailsRef.current
    if (el) el.open = false
    setHighestCompletedStepNum((h) => Math.max(h, isClientLogged ? 5 : 6))
    requestAnimationFrame(() => {
      document.getElementById('return-data-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [validateRefundMethodForm, isClientLogged])

  useEffect(() => {
    const len = sanitizeSerialSuffix(serialSuffix).length
    if (serialGateVerified && len !== LJC_GATE_DIGIT_COUNT) {
      setSerialGateVerified(false)
    }
  }, [serialSuffix, serialGateVerified])

  /** Doar la schimbarea SN-ului tastat — nu la `returStockVerifiedSerial` (altfel ar șterge „eligible” după verificare reușită). */
  useEffect(() => {
    setSerialEligibilityStatus('idle')
  }, [serialSuffix])

  /** Dacă SN-ul nu mai coincide cu cel pentru care s-a confirmat eligibilitatea, resetăm prefill-ul din stocuri. */
  useEffect(() => {
    if (!returStockVerifiedSerial) return
    const full = normalizeWarehouseSerialNumber(buildLjcSerial(serialSuffix))
    if (full === returStockVerifiedSerial) return
    setReturStockVerifiedSerial(null)
    setReturModelPrefill(null)
    setReceiptLockedFromStock(false)
    setBrandModelLockedFromStock(false)
    setReceiptDate('')
    setProductBrand('')
    setSelectedModelId('')
    setProductModel('')
    setSerialGateVerified(false)
  }, [serialSuffix, returStockVerifiedSerial])

  useEffect(() => {
    const prev = prevSerialGateVerifiedRef.current
    if (prev && !serialGateVerified) {
      setHighestCompletedStepNum(0)
      setSubmitPolicyAccepted(false)
      setSubmitDeclarationAccepted(false)
      setClientFormShowFieldErrors(false)
      setOrderProductShowFieldErrors(false)
      setReturStockVerifiedSerial(null)
      setReturModelPrefill(null)
      setReceiptLockedFromStock(false)
      setBrandModelLockedFromStock(false)
      setReceiptDate('')
      setProductBrand('')
      setSelectedModelId('')
      setProductModel('')
    }
    prevSerialGateVerifiedRef.current = serialGateVerified
  }, [serialGateVerified])

  const onSerialGateVerify = useCallback(async () => {
    const d = sanitizeSerialSuffix(serialSuffix).slice(0, LJC_GATE_DIGIT_COUNT)
    if (d.length !== LJC_GATE_DIGIT_COUNT) {
      setSerialVerifyGateError(tr.serialVerifyGate.errorNeed16Digits)
      setSerialGateVerified(false)
      setSerialEligibilityStatus('idle')
      return
    }
    setSerialVerifyGateError('')
    setSerialGateVerified(false)
    setSerialEligibilityStatus('loading')
    setReturStockVerifiedSerial(null)
    setReturModelPrefill(null)
    setReceiptLockedFromStock(false)
    setBrandModelLockedFromStock(false)
    setReceiptDate('')
    try {
      const full = normalizeWarehouseSerialNumber(buildLjcSerial(serialSuffix))
      const res = await getPublicReturSerialEligibility(full)
      if (!res.eligible) {
        setSerialEligibilityStatus('ineligible')
        return
      }
      setSerialEligibilityStatus('eligible')
      setReturStockVerifiedSerial(full)
      if (res.clientReceiptDate?.trim()) {
        setReceiptDate(res.clientReceiptDate.trim())
        setReceiptLockedFromStock(true)
      } else {
        setReceiptDate('')
        setReceiptLockedFromStock(false)
      }
      setReturModelPrefill({
        productModelId: res.productModelId ?? null,
        brand: res.brand ?? null,
        modelName: res.modelName ?? null,
        modelNumber: res.modelNumber ?? null,
      })
    } catch (e) {
      setSerialEligibilityStatus('error')
      setReturStockVerifiedSerial(null)
      setReturModelPrefill(null)
      setReceiptLockedFromStock(false)
      setBrandModelLockedFromStock(false)
      setReceiptDate('')
      const msg =
        e instanceof Error && e.message.trim()
          ? e.message.trim()
          : tr.serialVerifyGate.eligibilityCheckError
      setSerialVerifyGateError(msg)
    }
  }, [serialSuffix, tr.serialVerifyGate])

  const onSerialGateStart = useCallback(() => {
    setSerialGateVerified(true)
    setSerialEligibilityStatus('idle')
    setOrderProductFormError('')
    requestAnimationFrame(() => {
      const maxStepId = isClientLogged ? 5 : 6
      for (let s = 2; s <= maxStepId; s += 1) {
        const el = document.getElementById(`return-step-${s}`) as HTMLDetailsElement | null
        if (el?.open) el.open = false
      }
      const first = document.getElementById('return-step-1') as HTMLDetailsElement | null
      if (first) first.open = true
    })
  }, [isClientLogged])

  const validateFullReturnForm = useCallback((): string | null => {
    if (!submitSectionUnlocked) return tr.accordionStepLockedHint
    if (!isClientLogged) {
      const clientErr = validateClientForm()
      if (clientErr) return clientErr
    }
    const opErr = validateOrderProductForm()
    if (opErr) return opErr
    const rrErr = validateReturnReasonForm()
    if (rrErr) return rrErr
    const pcErr = validateProductConditionForm()
    if (pcErr) return pcErr
    const paErr = validatePickupAddressForm()
    if (paErr) return paErr
    const rfErr = validateRefundMethodForm()
    if (rfErr) return rfErr
    if (!submitPolicyAccepted || !submitDeclarationAccepted) return sp.fillRequired
    return null
  }, [
    isClientLogged,
    validateClientForm,
    validateOrderProductForm,
    validateReturnReasonForm,
    validateProductConditionForm,
    validatePickupAddressForm,
    validateRefundMethodForm,
    submitPolicyAccepted,
    submitDeclarationAccepted,
    sp.fillRequired,
    submitSectionUnlocked,
    tr.accordionStepLockedHint,
  ])

  return (
    <>
      <SEO
        title={seo.title || tr.seoTitle}
        description={seo.description || tr.seoDesc}
        canonical="/returnare-produse"
        ogTitle={seo.ogTitle || undefined}
        ogDescription={seo.ogDescription || undefined}
        ogImage={seo.ogImage || undefined}
        lang={language.code}
      />
      <SchemaOrg schema={[
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: seo.title || tr.seoTitle,
          description: seo.description || tr.seoDesc,
          url: 'https://baterino.ro/returnare-produse',
          inLanguage: language.code,
          publisher: { '@type': 'Organization', name: 'Baterino Romania', url: 'https://baterino.ro' },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Acasă', item: 'https://baterino.ro' },
            { '@type': 'ListItem', position: 2, name: 'Returnare Produse', item: 'https://baterino.ro/returnare-produse' },
          ],
        },
      ]} />

      <article className="mx-auto min-w-0 max-w-content px-5 pt-12 pb-24 lg:px-3">
        <header className="mb-10">
          <h1 className="text-black text-2xl sm:text-4xl lg:text-5xl font-extrabold font-['Inter'] leading-tight sm:leading-[48px] lg:leading-[56px]">
            {tr.pageTitle}
          </h1>
        </header>

        {returSubmitSeries != null ? (
          <div
            className="mb-10 max-w-4xl min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-5 shadow-sm sm:px-6 sm:py-6 font-['Inter']"
            role="status"
            aria-live="polite"
          >
            <div className="flex min-w-0 items-start gap-3">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-emerald-600 bg-emerald-600 text-white"
                aria-hidden
              >
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path
                    d="M2 6l2.5 2.5L10 3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <p className="min-w-0 text-sm font-medium leading-relaxed text-slate-800">{sp.chkDeclaration}</p>
            </div>
            <p className="mt-4 text-sm font-medium leading-relaxed text-emerald-800 sm:text-[15px]">
              {renderInlineBold(
                sp.submitSuccessWithId.replace(/\#\{registrationNumber\}/g, returSubmitSeries),
              )}
            </p>
          </div>
        ) : null}

        <div className="max-w-4xl min-w-0 space-y-8 sm:space-y-10">
          <section>
            <p className="text-neutral-600 text-base font-['Inter'] leading-relaxed sm:text-lg">
              {renderInlineBold(tr.introBody)}{' '}
              {tr.introTermsLead}
              <Link
                to="/politica-de-retur"
                className="font-semibold text-slate-900 underline underline-offset-2 hover:text-slate-700"
              >
                {tr.introTermsLinkLabel}
              </Link>
            </p>
          </section>

          {!serialGateVerified ? (
            <section className="min-w-0">
              <p className="text-sm leading-relaxed text-neutral-600 font-['Inter'] sm:text-base">
                {tr.serialVerifyGate.intro}
              </p>
              <div className="mt-4 min-w-0 space-y-2">
                <label
                  htmlFor={`${uid}-serial-gate`}
                  className="mb-1.5 block text-xs font-semibold text-slate-700 font-['Inter']"
                >
                  {tr.serialVerifyGate.serialLabel}
                </label>
                <div className="flex min-w-0 flex-row flex-wrap items-center gap-3">
                  <input
                    id={`${uid}-serial-gate`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={Boolean(serialVerifyGateError)}
                    value={formatLjcSerialGateDisplay(serialSuffix)}
                    onChange={(e) => {
                      const digits = sanitizeSerialSuffix(e.target.value).slice(0, LJC_GATE_DIGIT_COUNT)
                      setSerialSuffix(digits)
                      setSerialVerifyGateError('')
                    }}
                    className={`${inputClass} min-w-0 flex-1 font-mono tracking-wide`}
                    placeholder="LJC-0000-0000-0000-0000"
                  />
                  <button
                    type="button"
                    onClick={() => void onSerialGateVerify()}
                    disabled={
                      serialEligibilityStatus === 'loading' ||
                      serialEligibilityStatus === 'eligible' ||
                      serialGateVerified
                    }
                    className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 font-['Inter'] sm:min-w-[10rem]"
                  >
                    {serialEligibilityStatus === 'loading'
                      ? tr.serialVerifyGate.verifyingLabel
                      : tr.serialVerifyGate.verifyButton}
                  </button>
                </div>
                {serialVerifyGateError ||
                (serialEligibilityStatus === 'eligible' && !serialGateVerified) ||
                serialEligibilityStatus === 'ineligible' ? (
                  <div className="mt-6 min-w-0 space-y-4">
                    {serialVerifyGateError ? (
                      <p className="text-sm font-medium text-red-600 font-['Inter']" role="alert">
                        {serialVerifyGateError}
                      </p>
                    ) : null}
                    {serialEligibilityStatus === 'eligible' && !serialGateVerified ? (
                      <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <p className="text-sm font-medium text-emerald-900 font-['Inter']" role="status">
                          {tr.serialVerifyGate.eligibleMessage}
                        </p>
                        <button
                          type="button"
                          onClick={onSerialGateStart}
                          className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 px-8 text-sm font-bold text-white transition hover:bg-slate-800 font-['Inter'] sm:min-w-[8rem]"
                        >
                          {tr.serialVerifyGate.startButton}
                        </button>
                      </div>
                    ) : null}
                    {serialEligibilityStatus === 'ineligible' ? (
                      <p className="text-sm leading-relaxed text-slate-700 font-['Inter']" role="status">
                        {tr.serialVerifyGate.ineligibleMessage}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {serialGateVerified ? (
            <>
              <section className="pt-4 sm:pt-6" aria-label={tr.timelineTitle}>
            <div className="rounded-2xl bg-[#f7f7f7] px-4 py-8 sm:px-6 sm:py-10">
              <ol className="relative mt-0 space-y-0 lg:hidden">
                {tr.timelineSteps.map((step, i) => (
                  <li key={step.title} className="relative flex gap-4 pb-10 last:pb-0">
                    {i < tr.timelineSteps.length - 1 ? (
                      <div
                        className="absolute left-[1.125rem] top-10 bottom-0 w-0.5 bg-slate-200"
                        aria-hidden
                      />
                    ) : null}
                    <div
                      className="relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-slate-900 bg-white text-sm font-bold text-slate-900 font-['Inter']"
                      aria-hidden
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <h3 className="text-base font-bold text-slate-900 font-['Inter']">{step.title}</h3>
                      <p className="mt-1 text-sm text-neutral-600 leading-relaxed font-['Inter']">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="relative mt-0 hidden lg:block">
                <div className="relative px-4">
                  <div
                    className="absolute left-[12.5%] right-[12.5%] top-[1.125rem] h-0.5 bg-slate-200"
                    aria-hidden
                  />
                  <ol className="relative z-[1] grid grid-cols-4 gap-4">
                    {tr.timelineSteps.map((step, i) => (
                      <li key={step.title} className="flex flex-col items-center text-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-900 bg-white text-sm font-bold text-slate-900 font-['Inter'] shadow-sm">
                          {i + 1}
                        </div>
                        <h3 className="mt-4 text-sm font-bold text-slate-900 font-['Inter']">{step.title}</h3>
                        <p className="mt-2 text-xs text-neutral-600 leading-relaxed font-['Inter']">{step.description}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </section>

          <section className="min-w-0 pt-0" aria-labelledby="return-data-heading">
            <h2
              id="return-data-heading"
              className="text-lg font-bold text-slate-900 font-['Inter'] sm:text-xl"
            >
              {tr.returnDataHeading}
            </h2>
            <div className="mt-6 min-w-0 space-y-2">
              {!isClientLogged ? (
                <details
                  ref={clientDetailsRef}
                  id="return-step-1"
                  className="group min-w-0 max-w-full rounded-xl border border-slate-200 bg-slate-50/60 open:border-slate-300 open:bg-white"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-left font-['Inter'] [&::-webkit-details-marker]:hidden sm:px-5 sm:py-4">
                    <span className="flex min-w-0 items-baseline gap-2 text-sm font-semibold text-slate-900 sm:text-base">
                      <span className="w-6 shrink-0 tabular-nums text-slate-500">1.</span>
                      <span>{f.title}</span>
                    </span>
                    <svg
                      className="h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 group-open:rotate-180"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="min-w-0 border-t border-slate-100 px-4 pb-4 pt-3 sm:px-5">
                    <p className="mb-4 text-sm leading-relaxed text-neutral-600 font-['Inter']">{f.helper}</p>
                    <form className="min-w-0 max-w-full space-y-4" onSubmit={(e) => e.preventDefault()} noValidate>
                      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                        <div className="min-w-0">
                          <label htmlFor={`${uid}-nume`} className={`mb-1.5 block text-xs font-semibold font-['Inter'] ${clientFormInvalidFields.has('lastName') ? 'text-red-700' : 'text-slate-700'}`}>
                            {f.lastName}
                            <span className="text-red-600" aria-hidden>
                              {' '}
                              *
                            </span>
                          </label>
                          <input
                            id={`${uid}-nume`}
                            className={`${inputClass}${clientFormInvalidFields.has('lastName') ? clientFieldErrorClass : ''}`}
                            value={lastName}
                            placeholder={f.placeholderLastName}
                            aria-required
                            aria-invalid={clientFormInvalidFields.has('lastName')}
                            onChange={(e) => setLastName(sanitizeLettersOnly(e.target.value))}
                            autoComplete="family-name"
                          />
                        </div>
                        <div className="min-w-0">
                          <label htmlFor={`${uid}-prenume`} className={`mb-1.5 block text-xs font-semibold font-['Inter'] ${clientFormInvalidFields.has('firstName') ? 'text-red-700' : 'text-slate-700'}`}>
                            {f.firstName}
                            <span className="text-red-600" aria-hidden>
                              {' '}
                              *
                            </span>
                          </label>
                          <input
                            id={`${uid}-prenume`}
                            className={`${inputClass}${clientFormInvalidFields.has('firstName') ? clientFieldErrorClass : ''}`}
                            value={firstName}
                            placeholder={f.placeholderFirstName}
                            aria-required
                            aria-invalid={clientFormInvalidFields.has('firstName')}
                            onChange={(e) => setFirstName(sanitizeLettersOnly(e.target.value))}
                            autoComplete="given-name"
                          />
                        </div>
                      </div>
                      <fieldset className="min-w-0 space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
                        <legend className="px-1 text-xs font-bold uppercase tracking-wide text-slate-600 font-['Inter']">
                          {f.addressLegend}
                        </legend>
                        <div className="min-w-0">
                          <label htmlFor={`${uid}-str`} className={`mb-1.5 block text-xs font-semibold font-['Inter'] ${clientFormInvalidFields.has('street') ? 'text-red-700' : 'text-slate-700'}`}>
                            {f.street}
                            <span className="text-red-600" aria-hidden>
                              {' '}
                              *
                            </span>
                          </label>
                          <input
                            id={`${uid}-str`}
                            className={`${inputClass}${clientFormInvalidFields.has('street') ? clientFieldErrorClass : ''}`}
                            value={street}
                            placeholder={f.placeholderStreet}
                            aria-required
                            aria-invalid={clientFormInvalidFields.has('street')}
                            onChange={(e) => setStreet(e.target.value)}
                            autoComplete="street-address"
                          />
                        </div>
                        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                          <div className="min-w-0">
                            <label htmlFor={`${uid}-jud`} className={`mb-1.5 block text-xs font-semibold font-['Inter'] ${clientFormInvalidFields.has('county') ? 'text-red-700' : 'text-slate-700'}`}>
                              {f.county}
                              <span className="text-red-600" aria-hidden>
                                {' '}
                                *
                              </span>
                            </label>
                            <select
                              id={`${uid}-jud`}
                              className={`${selectClass}${clientFormInvalidFields.has('county') ? clientFieldErrorClass : ''}`}
                              value={county}
                              aria-required
                              aria-invalid={clientFormInvalidFields.has('county')}
                              onChange={(e) => setCounty(e.target.value)}
                              autoComplete="address-level1"
                            >
                              <option value="">{f.selectCountyPlaceholder}</option>
                              {ROMANIAN_COUNTIES.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="min-w-0">
                            <label htmlFor={`${uid}-oras`} className={`mb-1.5 block text-xs font-semibold font-['Inter'] ${clientFormInvalidFields.has('city') ? 'text-red-700' : 'text-slate-700'}`}>
                              {f.city}
                              <span className="text-red-600" aria-hidden>
                                {' '}
                                *
                              </span>
                            </label>
                            <select
                              id={`${uid}-oras`}
                              className={`${selectClass}${clientFormInvalidFields.has('city') ? clientFieldErrorClass : ''}`}
                              value={city}
                              disabled={!county}
                              aria-required
                              aria-invalid={clientFormInvalidFields.has('city')}
                              onChange={(e) => setCity(e.target.value)}
                              autoComplete="address-level2"
                            >
                              <option value="">{county ? f.selectCityPlaceholder : f.selectCityNeedCounty}</option>
                              {county
                                ? citiesForCounty.map((c) => (
                                    <option key={c} value={c}>
                                      {c}
                                    </option>
                                  ))
                                : null}
                            </select>
                          </div>
                        </div>
                        <div className="min-w-0 sm:max-w-[12rem]">
                          <label htmlFor={`${uid}-cp`} className={`mb-1.5 block text-xs font-semibold font-['Inter'] ${clientFormInvalidFields.has('postal') ? 'text-red-700' : 'text-slate-700'}`}>
                            {f.postal}
                            <span className="text-red-600" aria-hidden>
                              {' '}
                              *
                            </span>
                          </label>
                          <input
                            id={`${uid}-cp`}
                            className={`${inputClass}${clientFormInvalidFields.has('postal') ? clientFieldErrorClass : ''}`}
                            inputMode="numeric"
                            maxLength={6}
                            placeholder={f.placeholderPostal}
                            aria-required
                            aria-invalid={clientFormInvalidFields.has('postal')}
                            value={postal}
                            onChange={(e) => setPostal(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            autoComplete="postal-code"
                          />
                        </div>
                      </fieldset>
                      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                        <div className="min-w-0">
                          <label htmlFor={`${uid}-tel`} className={`mb-1.5 block text-xs font-semibold font-['Inter'] ${clientFormInvalidFields.has('phone') ? 'text-red-700' : 'text-slate-700'}`}>
                            {f.phone}
                            <span className="text-red-600" aria-hidden>
                              {' '}
                              *
                            </span>
                          </label>
                          <input
                            id={`${uid}-tel`}
                            className={`${inputClass}${clientFormInvalidFields.has('phone') ? clientFieldErrorClass : ''}`}
                            inputMode="numeric"
                            maxLength={15}
                            placeholder={f.placeholderPhone}
                            aria-required
                            aria-invalid={clientFormInvalidFields.has('phone')}
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value.replace(/\D/g, '').slice(0, 15))
                              setFormError('')
                            }}
                            autoComplete="tel"
                          />
                        </div>
                        <div className="min-w-0">
                          <label htmlFor={`${uid}-mail`} className={`mb-1.5 block text-xs font-semibold font-['Inter'] ${clientFormInvalidFields.has('email') ? 'text-red-700' : 'text-slate-700'}`}>
                            {f.email}
                            <span className="text-red-600" aria-hidden>
                              {' '}
                              *
                            </span>
                          </label>
                          <input
                            id={`${uid}-mail`}
                            type="email"
                            className={`${inputClass}${clientFormInvalidFields.has('email') ? clientFieldErrorClass : ''}`}
                            value={email}
                            placeholder={f.placeholderEmail}
                            aria-required
                            aria-invalid={clientFormInvalidFields.has('email')}
                            onChange={(e) => {
                              setEmail(e.target.value)
                              setFormError('')
                            }}
                            autoComplete="email"
                          />
                        </div>
                      </div>
                      {formError ? (
                        <p className="text-sm font-medium text-red-600 font-['Inter']" role="alert">
                          {formError}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        onClick={onClientContinue}
                        className="mt-1 inline-flex h-11 min-w-[10rem] items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition hover:bg-slate-800 font-['Inter']"
                      >
                        {f.continue}
                      </button>
                    </form>
                  </div>
                </details>
              ) : null}

              {tr.returnDataSteps.map((step, i) => {
                const stepNum = isClientLogged ? i + 1 : i + 2
                const stepLocked = stepNum > highestCompletedStepNum + 1
                return (
                  <details
                    key={`${step.title}-${i}`}
                    ref={
                      step.orderProductForm
                        ? orderProductDetailsRef
                        : step.returnReasonForm
                          ? returnReasonDetailsRef
                          : step.productConditionForm
                            ? productConditionDetailsRef
                            : step.pickupAddressForm
                              ? pickupAddressDetailsRef
                              : step.refundMethodForm
                                ? refundMethodDetailsRef
                                : undefined
                    }
                    id={`return-step-${stepNum}`}
                    className={`group min-w-0 max-w-full rounded-xl border border-slate-200 bg-slate-50/60 open:border-slate-300 open:bg-white ${stepLocked ? 'opacity-[0.55]' : ''}`}
                  >
                    <summary
                      className={`flex list-none items-center justify-between gap-3 px-4 py-3.5 text-left font-['Inter'] [&::-webkit-details-marker]:hidden sm:px-5 sm:py-4 ${stepLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      title={stepLocked ? tr.accordionStepLockedHint : undefined}
                      onClick={(e) => {
                        if (stepLocked) e.preventDefault()
                      }}
                      onKeyDown={(e) => {
                        if (stepLocked && (e.key === 'Enter' || e.key === ' ')) e.preventDefault()
                      }}
                    >
                      <span className="flex min-w-0 items-baseline gap-2 text-sm font-semibold text-slate-900 sm:text-base">
                        <span className="w-6 shrink-0 tabular-nums text-slate-500">{stepNum}.</span>
                        <span>{step.title}</span>
                      </span>
                      <svg
                        className="h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 group-open:rotate-180"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="min-w-0 border-t border-slate-100 px-4 pb-4 pt-3 text-sm leading-relaxed text-neutral-600 font-['Inter'] sm:px-5 sm:text-[15px]">
                      {step.orderProductForm ? (
                        <>
                          <p className="mb-4 text-sm leading-relaxed text-neutral-600 font-['Inter']">{op.helper}</p>
                          <form className="min-w-0 max-w-full space-y-4" onSubmit={(e) => e.preventDefault()} noValidate>
                            <fieldset className="min-w-0 space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
                              <legend className="px-1 text-xs font-bold uppercase tracking-wide text-slate-600 font-['Inter']">
                                {op.sectionOrder}
                              </legend>
                              <p className="text-xs text-slate-500 font-['Inter']">{op.dateHint}</p>
                              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                                <div className="min-w-0">
                                  <label htmlFor={`${uid}-ret-onr`} className={`mb-1.5 block text-xs font-semibold font-['Inter'] ${orderProductInvalidFields.has('orderNumber') ? 'text-red-700' : 'text-slate-700'}`}>
                                    {op.orderNumber}
                                    <span className="text-red-600" aria-hidden>
                                      {' '}
                                      *
                                    </span>
                                  </label>
                                  <div
                                    className={`flex h-11 min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-slate-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-slate-300/80 font-['Inter']${orderProductInvalidFields.has('orderNumber') ? clientFieldErrorClass : ''}`}
                                  >
                                    <span
                                      className="flex shrink-0 items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-semibold tabular-nums text-slate-700"
                                      aria-hidden
                                    >
                                      {BTO_ORDER_PREFIX}
                                    </span>
                                    <input
                                      id={`${uid}-ret-onr`}
                                      className="box-border min-w-0 flex-1 border-0 bg-transparent px-3.5 text-sm text-slate-900 shadow-none outline-none ring-0 placeholder:text-slate-400 focus:ring-0 font-['Inter']"
                                      value={orderNumberSuffix}
                                      placeholder={op.placeholderOrderNumber}
                                      autoComplete="off"
                                      aria-required
                                      aria-invalid={orderProductInvalidFields.has('orderNumber')}
                                      aria-describedby={`${uid}-ret-onr-hint`}
                                      onChange={(e) => {
                                        let v = e.target.value
                                        if (/^bto-/i.test(v)) v = v.slice(4)
                                        setOrderNumberSuffix(sanitizeOrderNumberSuffix(v))
                                        setOrderProductFormError('')
                                      }}
                                    />
                                  </div>
                                  <p id={`${uid}-ret-onr-hint`} className="mt-1 text-[11px] text-slate-500 font-['Inter']">
                                    {op.orderNumberBtoHint}
                                  </p>
                                </div>
                                <div className="min-w-0">
                                  <label htmlFor={`${uid}-ret-recep`} className={`mb-1.5 block text-xs font-semibold font-['Inter'] ${orderProductInvalidFields.has('receiptDate') ? 'text-red-700' : 'text-slate-700'}`}>
                                    {op.receiptDate}
                                    <span className="text-red-600" aria-hidden>
                                      {' '}
                                      *
                                    </span>
                                  </label>
                                  <input
                                    id={`${uid}-ret-recep`}
                                    disabled={receiptFieldDisabledFromStock}
                                    className={`${inputClass}${orderProductInvalidFields.has('receiptDate') ? clientFieldErrorClass : ''}${
                                      receiptFieldDisabledFromStock
                                        ? ' cursor-not-allowed bg-slate-100 text-slate-800 disabled:border-slate-300'
                                        : ''
                                    }`}
                                    value={receiptDate}
                                    placeholder={op.placeholderDate}
                                    inputMode="numeric"
                                    autoComplete="off"
                                    aria-required
                                    aria-invalid={orderProductInvalidFields.has('receiptDate')}
                                    onChange={(e) => {
                                      if (receiptFieldDisabledFromStock) return
                                      setReceiptDate(formatDdMmYyyyAsYouType(e.target.value))
                                      setOrderProductFormError('')
                                    }}
                                  />
                                </div>
                              </div>
                            </fieldset>
                            <fieldset className="min-w-0 space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
                              <legend className="px-1 text-xs font-bold uppercase tracking-wide text-slate-600 font-['Inter']">
                                {op.sectionProduct}
                              </legend>
                              {publicModels === 'error' ? (
                                <div className="rounded-lg border border-red-200 bg-red-50/80 px-3 py-2.5 text-sm text-red-900 font-['Inter']">
                                  <p className="mb-2">{op.modelsListError}</p>
                                  <button
                                    type="button"
                                    onClick={loadPublicModels}
                                    className="inline-flex h-9 items-center justify-center rounded-lg border border-red-300 bg-white px-3 text-xs font-semibold text-red-900 transition hover:bg-red-50 font-['Inter']"
                                  >
                                    {op.modelsListRetry}
                                  </button>
                                </div>
                              ) : null}
                              {Array.isArray(publicModels) && publicModels.length === 0 ? (
                                <p className="text-sm text-amber-900 font-['Inter']">{op.modelsEmptyCatalog}</p>
                              ) : null}
                              <div className="min-w-0">
                                <label htmlFor={`${uid}-ret-ser`} className={`mb-1.5 block text-xs font-semibold font-['Inter'] ${orderProductInvalidFields.has('serialNumber') ? 'text-red-700' : 'text-slate-700'}`}>
                                  {op.serialNumber}
                                  <span className="text-red-600" aria-hidden>
                                    {' '}
                                    *
                                  </span>
                                </label>
                                <div
                                  className={`flex h-11 min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-slate-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-slate-300/80 font-['Inter']${orderProductInvalidFields.has('serialNumber') ? clientFieldErrorClass : ''}`}
                                >
                                  <span
                                    className="flex shrink-0 items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-semibold tabular-nums text-slate-700"
                                    aria-hidden
                                  >
                                    {LJC_SERIAL_PREFIX}
                                  </span>
                                  <input
                                    id={`${uid}-ret-ser`}
                                    disabled={serialFieldDisabledFromStock}
                                    className="box-border min-w-0 flex-1 border-0 bg-transparent px-3.5 text-sm text-slate-900 shadow-none outline-none ring-0 placeholder:text-slate-400 focus:ring-0 font-['Inter'] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-800"
                                    value={serialSuffix}
                                    placeholder={op.placeholderSerial}
                                    autoComplete="off"
                                    aria-required
                                    aria-invalid={orderProductInvalidFields.has('serialNumber')}
                                    aria-describedby={`${uid}-ret-ser-hint`}
                                    onChange={(e) => {
                                      if (serialFieldDisabledFromStock) return
                                      let v = e.target.value
                                      if (/^ljc/i.test(v)) v = v.slice(3).replace(/^[\-+]+/, '')
                                      setSerialSuffix(sanitizeSerialSuffix(v))
                                      setSerialVerifyGateError('')
                                      setOrderProductFormError('')
                                    }}
                                  />
                                </div>
                                <p id={`${uid}-ret-ser-hint`} className="mt-1 text-[11px] text-slate-500 font-['Inter']">
                                  {op.serialNumberLjcHint}
                                </p>
                              </div>
                              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                                <div className="min-w-0">
                                  <label htmlFor={`${uid}-ret-brand`} className={`mb-1.5 block text-xs font-semibold font-['Inter'] ${orderProductInvalidFields.has('brand') ? 'text-red-700' : 'text-slate-700'}`}>
                                    {op.brand}
                                    <span className="text-red-600" aria-hidden>
                                      {' '}
                                      *
                                    </span>
                                  </label>
                                  <select
                                    id={`${uid}-ret-brand`}
                                    className={`${selectClass}${orderProductInvalidFields.has('brand') ? clientFieldErrorClass : ''}`}
                                    disabled={
                                      publicModels === 'loading' ||
                                      publicModels === 'error' ||
                                      (Array.isArray(publicModels) && publicModels.length === 0) ||
                                      brandModelLockedFromStock
                                    }
                                    value={productBrand}
                                    aria-required
                                    aria-invalid={orderProductInvalidFields.has('brand')}
                                    onChange={(e) => {
                                      if (brandModelLockedFromStock) return
                                      const rows = Array.isArray(publicModels) ? publicModels : []
                                      const b = e.target.value
                                      if (!b) {
                                        setProductBrand('')
                                        setSelectedModelId('')
                                        setProductModel('')
                                        setOrderProductFormError('')
                                        return
                                      }
                                      setProductBrand(b)
                                      const subs = rows.filter(
                                        (m) => m.brand.trim().toLowerCase() === b.trim().toLowerCase(),
                                      )
                                      const first = subs[0]
                                      if (first) {
                                        setSelectedModelId(first.id)
                                        setProductModel(first.name)
                                      } else {
                                        setSelectedModelId('')
                                        setProductModel('')
                                      }
                                      setOrderProductFormError('')
                                    }}
                                  >
                                    <option value="">
                                      {publicModels === 'loading' ? op.loadingModelsCatalog : op.selectBrandPlaceholder}
                                    </option>
                                    {uniqueBrands.map((b) => (
                                      <option key={b} value={b}>
                                        {b}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="min-w-0">
                                  <label htmlFor={`${uid}-ret-model`} className={`mb-1.5 block text-xs font-semibold font-['Inter'] ${orderProductInvalidFields.has('model') ? 'text-red-700' : 'text-slate-700'}`}>
                                    {op.model}
                                    <span className="text-red-600" aria-hidden>
                                      {' '}
                                      *
                                    </span>
                                  </label>
                                  <select
                                    id={`${uid}-ret-model`}
                                    className={`${selectClass}${orderProductInvalidFields.has('model') ? clientFieldErrorClass : ''}`}
                                    disabled={
                                      publicModels === 'loading' ||
                                      publicModels === 'error' ||
                                      (Array.isArray(publicModels) && publicModels.length === 0) ||
                                      modelsForCurrentBrand.length === 0 ||
                                      brandModelLockedFromStock
                                    }
                                    value={selectedModelId}
                                    aria-required
                                    aria-invalid={orderProductInvalidFields.has('model')}
                                    onChange={(e) => {
                                      if (brandModelLockedFromStock) return
                                      const id = e.target.value
                                      setSelectedModelId(id)
                                      if (!id) {
                                        setProductModel('')
                                        setOrderProductFormError('')
                                        return
                                      }
                                      const rows = Array.isArray(publicModels) ? publicModels : []
                                      const m = rows.find((x) => x.id === id)
                                      if (m) {
                                        setProductBrand(m.brand)
                                        setProductModel(m.name)
                                      }
                                      setOrderProductFormError('')
                                    }}
                                  >
                                    <option value="">{op.selectModelPlaceholder}</option>
                                    {modelsForCurrentBrand.map((m) => (
                                      <option key={m.id} value={m.id}>
                                        {`${m.name} (${m.modelNumber})`}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </fieldset>
                            {orderProductFormError ? (
                              <p className="text-sm font-medium text-red-600 font-['Inter']" role="alert">
                                {orderProductFormError}
                              </p>
                            ) : null}
                            <button
                              type="button"
                              onClick={onOrderProductContinue}
                              className="mt-1 inline-flex h-11 min-w-[10rem] items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition hover:bg-slate-800 font-['Inter']"
                            >
                              {op.continue}
                            </button>
                          </form>
                        </>
                      ) : step.returnReasonForm ? (
                        <>
                          <p className="mb-4 text-sm leading-relaxed text-neutral-600 font-['Inter']">{rr.helper}</p>
                          <form className="min-w-0 max-w-full space-y-4" onSubmit={(e) => e.preventDefault()} noValidate>
                            <fieldset className="min-w-0 space-y-2.5">
                              <legend className="sr-only">{step.title}</legend>
                              {(
                                [
                                  ['withdrawal', rr.withdrawal],
                                  ['defective', rr.defective],
                                  ['not_as_described', rr.notAsDescribed],
                                  ['damaged_delivery', rr.damagedDelivery],
                                  ['other', rr.other],
                                ] as const
                              ).map(([value, label]) => (
                                <label
                                  key={value}
                                  className="flex min-w-0 cursor-pointer items-start gap-3 py-1 font-['Inter']"
                                >
                                  <input
                                    type="radio"
                                    name={`${uid}-return-reason`}
                                    value={value}
                                    checked={returnReason === value}
                                    onChange={() => {
                                      setReturnReason(value)
                                      setReturnReasonError('')
                                    }}
                                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer border-slate-300 text-slate-900 focus:ring-slate-900"
                                  />
                                  <span className="min-w-0 text-sm leading-snug text-slate-800">{label}</span>
                                </label>
                              ))}
                            </fieldset>
                            {returnReason === 'other' ? (
                              <div className="min-w-0">
                                <label htmlFor={`${uid}-ret-motiv-alt`} className="mb-1.5 block text-xs font-semibold text-slate-700 font-['Inter']">
                                  {rr.otherDetailsLabel}
                                  <span className="text-red-600" aria-hidden>
                                    {' '}
                                    *
                                  </span>
                                </label>
                                <textarea
                                  id={`${uid}-ret-motiv-alt`}
                                  className={textareaClass}
                                  rows={4}
                                  value={returnReasonOther}
                                  placeholder={rr.placeholderOther}
                                  aria-required
                                  onChange={(e) => setReturnReasonOther(e.target.value)}
                                />
                              </div>
                            ) : null}
                            {returnReasonError ? (
                              <p className="text-sm font-medium text-red-600 font-['Inter']" role="alert">
                                {returnReasonError}
                              </p>
                            ) : null}
                            <button
                              type="button"
                              onClick={onReturnReasonContinue}
                              className="mt-1 inline-flex h-11 min-w-[10rem] items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition hover:bg-slate-800 font-['Inter']"
                            >
                              {rr.continue}
                            </button>
                          </form>
                        </>
                      ) : step.productConditionForm ? (
                        <>
                          <p className="mb-4 text-sm leading-relaxed text-neutral-600 font-['Inter']">{pc.helper}</p>
                          <form className="min-w-0 max-w-full space-y-4" onSubmit={(e) => e.preventDefault()} noValidate>
                            <fieldset className="min-w-0 space-y-2.5">
                              <legend className="sr-only">{step.title}</legend>
                              {(
                                [
                                  [condUninstalled, setCondUninstalled, pc.chkUninstalled, `${uid}-cond-uninst`] as const,
                                  [condSeals, setCondSeals, pc.chkSeals, `${uid}-cond-seals`] as const,
                                  [condPackaging, setCondPackaging, pc.chkPackaging, `${uid}-cond-pack`] as const,
                                ] as const
                              ).map(([checked, setChecked, label, inputId]) => (
                                <label
                                  key={inputId}
                                  htmlFor={inputId}
                                  className="flex min-w-0 cursor-pointer items-start gap-3 py-1 font-['Inter']"
                                >
                                  <input
                                    id={inputId}
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                      setChecked(e.target.checked)
                                      setConditionFormError('')
                                    }}
                                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                  />
                                  <span className="min-w-0 text-sm leading-snug text-slate-800">{label}</span>
                                </label>
                              ))}
                            </fieldset>
                            <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
                              <p className="text-xs font-bold uppercase tracking-wide text-slate-600 font-['Inter']">
                                {pc.photosSectionTitle}
                              </p>
                              <label className="mt-2 mb-2 block text-sm font-semibold text-slate-800 font-['Inter']">
                                {pc.photosLabel}
                                <span className="text-red-600" aria-hidden>
                                  {' '}
                                  *
                                </span>
                              </label>
                              <p className="mb-3 text-xs text-slate-500 font-['Inter']">
                                {formatPhotoCount(pc.photoCount, conditionPhotos.length, MIN_CONDITION_PHOTOS, MAX_CONDITION_PHOTOS)}
                              </p>
                              <input
                                ref={conditionPhotosInputRef}
                                type="file"
                                accept=".jpg,.jpeg,image/jpeg"
                                multiple
                                className="sr-only"
                                aria-hidden
                                tabIndex={-1}
                                onChange={(e) => {
                                  const raw = Array.from(e.target.files ?? [])
                                  const picked = raw.filter(isJpegPhotoFile)
                                  const hadNonJpeg = raw.length > 0 && picked.length < raw.length
                                  if (picked.length === 0) {
                                    if (raw.length > 0) setConditionFormError(pc.fillPhotosWrongType)
                                    e.target.value = ''
                                    return
                                  }
                                  setConditionPhotos((prev) => {
                                    const next = [...prev, ...picked].slice(0, MAX_CONDITION_PHOTOS)
                                    return next
                                  })
                                  if (hadNonJpeg) setConditionFormError(pc.fillPhotosWrongType)
                                  else setConditionFormError('')
                                  e.target.value = ''
                                }}
                              />
                              <button
                                type="button"
                                disabled={conditionPhotos.length >= MAX_CONDITION_PHOTOS}
                                onClick={() => conditionPhotosInputRef.current?.click()}
                                className="inline-flex h-11 min-w-[10rem] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 font-['Inter'] disabled:pointer-events-none disabled:opacity-45"
                              >
                                {pc.addPhotos}
                              </button>
                              {conditionPhotos.length > 0 ? (
                                <ul className="mt-4 grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                                  {conditionPhotos.map((file, idx) => (
                                    <li key={`${file.name}-${file.size}-${idx}`} className="relative aspect-square min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                                      <img
                                        src={conditionPhotoUrls[idx]}
                                        alt=""
                                        className="h-full w-full object-cover"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setConditionPhotos((prev) => prev.filter((_, j) => j !== idx))
                                          setConditionFormError('')
                                        }}
                                        className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/85 text-xs font-bold text-white shadow hover:bg-slate-900"
                                        aria-label={pc.removePhotoAria}
                                      >
                                        ×
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                            {conditionFormError ? (
                              <p className="text-sm font-medium text-red-600 font-['Inter']" role="alert">
                                {conditionFormError}
                              </p>
                            ) : null}
                            <button
                              type="button"
                              onClick={onProductConditionContinue}
                              className="mt-1 inline-flex h-11 min-w-[10rem] items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition hover:bg-slate-800 font-['Inter']"
                            >
                              {pc.continue}
                            </button>
                          </form>
                        </>
                      ) : step.pickupAddressForm ? (
                        <>
                          <p className="mb-4 text-sm leading-relaxed text-neutral-600 font-['Inter']">{pa.helper}</p>
                          <form className="min-w-0 max-w-full space-y-4" onSubmit={(e) => e.preventDefault()} noValidate>
                            <div className="min-w-0">
                              <label htmlFor={`${uid}-pick-str`} className="mb-1.5 block text-xs font-semibold text-slate-700 font-['Inter']">
                                {pa.street}
                                <span className="text-red-600" aria-hidden>
                                  {' '}
                                  *
                                </span>
                              </label>
                              <input
                                id={`${uid}-pick-str`}
                                className={inputClass}
                                value={pickupStreet}
                                placeholder={pa.placeholderStreet}
                                autoComplete="street-address"
                                aria-required
                                onChange={(e) => {
                                  setPickupStreet(e.target.value)
                                  setPickupAddressFormError('')
                                }}
                              />
                            </div>
                            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                              <div className="min-w-0">
                                <label htmlFor={`${uid}-pick-jud`} className="mb-1.5 block text-xs font-semibold text-slate-700 font-['Inter']">
                                  {pa.county}
                                  <span className="text-red-600" aria-hidden>
                                    {' '}
                                    *
                                  </span>
                                </label>
                                <select
                                  id={`${uid}-pick-jud`}
                                  className={selectClass}
                                  value={pickupCounty}
                                  aria-required
                                  onChange={(e) => {
                                    setPickupCounty(e.target.value)
                                    setPickupAddressFormError('')
                                  }}
                                  autoComplete="address-level1"
                                >
                                  <option value="">{pa.selectCountyPlaceholder}</option>
                                  {ROMANIAN_COUNTIES.map((c) => (
                                    <option key={c} value={c}>
                                      {c}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="min-w-0">
                                <label htmlFor={`${uid}-pick-oras`} className="mb-1.5 block text-xs font-semibold text-slate-700 font-['Inter']">
                                  {pa.city}
                                  <span className="text-red-600" aria-hidden>
                                    {' '}
                                    *
                                  </span>
                                </label>
                                <select
                                  id={`${uid}-pick-oras`}
                                  className={selectClass}
                                  value={pickupCity}
                                  disabled={!pickupCounty}
                                  aria-required
                                  onChange={(e) => {
                                    setPickupCity(e.target.value)
                                    setPickupAddressFormError('')
                                  }}
                                  autoComplete="address-level2"
                                >
                                  <option value="">
                                    {pickupCounty ? pa.selectCityPlaceholder : pa.selectCityNeedCounty}
                                  </option>
                                  {pickupCounty
                                    ? pickupCitiesForCounty.map((c) => (
                                        <option key={c} value={c}>
                                          {c}
                                        </option>
                                      ))
                                    : null}
                                </select>
                              </div>
                            </div>
                            <div className="min-w-0 sm:max-w-[12rem]">
                              <label htmlFor={`${uid}-pick-cp`} className="mb-1.5 block text-xs font-semibold text-slate-700 font-['Inter']">
                                {pa.postal}
                                <span className="text-red-600" aria-hidden>
                                  {' '}
                                  *
                                </span>
                              </label>
                              <input
                                id={`${uid}-pick-cp`}
                                className={inputClass}
                                inputMode="numeric"
                                maxLength={6}
                                value={pickupPostal}
                                placeholder={pa.placeholderPostal}
                                autoComplete="postal-code"
                                aria-required
                                onChange={(e) => {
                                  setPickupPostal(e.target.value.replace(/\D/g, '').slice(0, 6))
                                  setPickupAddressFormError('')
                                }}
                              />
                            </div>
                            {pickupAddressFormError ? (
                              <p className="text-sm font-medium text-red-600 font-['Inter']" role="alert">
                                {pickupAddressFormError}
                              </p>
                            ) : null}
                            <button
                              type="button"
                              onClick={onPickupAddressContinue}
                              className="mt-1 inline-flex h-11 min-w-[10rem] items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition hover:bg-slate-800 font-['Inter']"
                            >
                              {pa.continue}
                            </button>
                          </form>
                        </>
                      ) : step.refundMethodForm ? (
                        <>
                          <p className="mb-4 text-sm leading-relaxed text-neutral-600 font-['Inter']">{rf.helper}</p>
                          <form className="min-w-0 max-w-full space-y-4" onSubmit={(e) => e.preventDefault()} noValidate>
                            <div className="min-w-0">
                              <label htmlFor={`${uid}-rf-tit`} className="mb-1.5 block text-xs font-semibold text-slate-700 font-['Inter']">
                                {rf.accountHolder}
                                <span className="text-red-600" aria-hidden>
                                  {' '}
                                  *
                                </span>
                              </label>
                              <input
                                id={`${uid}-rf-tit`}
                                className={inputClass}
                                value={refundTitular}
                                placeholder={rf.placeholderTitular}
                                autoComplete="name"
                                aria-required
                                onChange={(e) => {
                                  setRefundTitular(sanitizeTitularCont(e.target.value))
                                  setRefundMethodFormError('')
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <label htmlFor={`${uid}-rf-iban`} className="mb-1.5 block text-xs font-semibold text-slate-700 font-['Inter']">
                                {rf.iban}
                                <span className="text-red-600" aria-hidden>
                                  {' '}
                                  *
                                </span>
                              </label>
                              <div className="relative min-w-0">
                                <input
                                  id={`${uid}-rf-iban`}
                                  className={`${ibanInputClass} pr-14`}
                                  value={formatRoIbanWithSpaces(refundIban)}
                                  placeholder={rf.placeholderIban}
                                  spellCheck={false}
                                  autoComplete="off"
                                  inputMode="text"
                                  aria-required
                                  onChange={(e) => {
                                    setRefundIban(normalizeRoIbanInput(e.target.value))
                                    setRefundMethodFormError('')
                                  }}
                                />
                                <span
                                  className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[11px] font-semibold tabular-nums text-slate-400 font-['Inter']"
                                  aria-hidden
                                >
                                  {normalizeIban(refundIban).length}/24
                                </span>
                              </div>
                            </div>
                            {refundMethodFormError ? (
                              <p className="text-sm font-medium text-red-600 font-['Inter']" role="alert">
                                {refundMethodFormError}
                              </p>
                            ) : null}
                            <button
                              type="button"
                              onClick={onRefundMethodContinue}
                              className="mt-1 inline-flex h-11 min-w-[10rem] items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition hover:bg-slate-800 font-['Inter']"
                            >
                              {rf.continue}
                            </button>
                          </form>
                        </>
                      ) : step.description ? (
                        renderInlineBold(step.description)
                      ) : null}
                    </div>
                  </details>
                )
              })}

              {returSubmitSeries == null ? (
              <div className="min-w-0 max-w-full space-y-4 pt-2 pl-4 sm:pl-6 font-['Inter']">
                <div className="flex min-w-0 items-start gap-3">
                  <input
                    id={`${uid}-submit-policy`}
                    type="checkbox"
                    disabled={!submitSectionUnlocked}
                    checked={submitPolicyAccepted}
                    onChange={(e) => {
                      setSubmitPolicyAccepted(e.target.checked)
                      setSubmitPanelError('')
                      setReturSubmitSeries(null)
                    }}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-slate-900 focus:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <div className="min-w-0 text-sm leading-relaxed text-slate-800">
                    <label
                      htmlFor={`${uid}-submit-policy`}
                      className={submitSectionUnlocked ? 'cursor-pointer' : 'cursor-not-allowed text-slate-500'}
                    >
                      {sp.chkPolicyPrefix}
                    </label>
                    <Link
                      to="/politica-de-retur"
                      className="font-semibold text-slate-900 underline underline-offset-2 hover:text-slate-700"
                    >
                      {sp.chkPolicyLinkLabel}
                    </Link>
                    {sp.chkPolicySuffix}
                  </div>
                </div>
                <label
                  htmlFor={`${uid}-submit-decl`}
                  className={`flex min-w-0 items-start gap-3 ${submitSectionUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  <input
                    id={`${uid}-submit-decl`}
                    type="checkbox"
                    disabled={!submitSectionUnlocked}
                    checked={submitDeclarationAccepted}
                    onChange={(e) => {
                      setSubmitDeclarationAccepted(e.target.checked)
                      setSubmitPanelError('')
                      setReturSubmitSeries(null)
                    }}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-slate-900 focus:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <span
                    className={`min-w-0 text-sm leading-relaxed ${submitSectionUnlocked ? 'text-slate-800' : 'text-slate-500'}`}
                  >
                    {sp.chkDeclaration}
                  </span>
                </label>
                {submitPanelError ? (
                  <p className="text-sm font-medium text-red-600" role="alert">
                    {submitPanelError}
                  </p>
                ) : null}
                <button
                  type="button"
                  disabled={isSubmittingRetur || !submitSectionUnlocked}
                  onClick={async () => {
                    if (!submitSectionUnlocked) return
                    const validationError = validateFullReturnForm()
                    if (validationError) {
                      setSubmitPanelError(validationError)
                      setReturSubmitSeries(null)
                      if (!isClientLogged && validationError !== tr.accordionStepLockedHint && validateClientForm() !== null) {
                        setClientFormShowFieldErrors(true)
                      }
                      if (validationError !== tr.accordionStepLockedHint && validateOrderProductForm() !== null) {
                        setOrderProductShowFieldErrors(true)
                      }
                      return
                    }
                    setSubmitPanelError('')
                    setIsSubmittingRetur(true)
                    try {
                      const payload = {
                        lastName,
                        firstName,
                        street,
                        county,
                        city,
                        postal,
                        phone,
                        email,
                        orderNumber: buildBtoOrderNumber(orderNumberSuffix),
                        receiptDate,
                        serialNumber: buildLjcSerial(serialSuffix),
                        productBrand,
                        productModel,
                        returnReason: returnReason as string,
                        returnReasonOther,
                        condUninstalled,
                        condSeals,
                        condPackaging,
                        pickupStreet,
                        pickupCounty,
                        pickupCity,
                        pickupPostal,
                        refundTitular,
                        refundIban: normalizeIban(refundIban),
                        policyAccepted: submitPolicyAccepted,
                        declarationAccepted: submitDeclarationAccepted,
                        locale: language.code,
                      }
                      const { registrationNumber } = await submitProductRetur(payload, conditionPhotos)
                      setReturSubmitSeries(registrationNumber)
                    } catch (err) {
                      if (err instanceof ReturSubmitError && err.code === 'retur_photos_count') {
                        setSubmitPanelError(pc.fillPhotosRange)
                      } else if (err instanceof ReturSubmitError && err.code === 'retur_photos_type') {
                        setSubmitPanelError(pc.fillPhotosWrongType)
                      } else {
                        const msg = err instanceof Error ? err.message : ''
                        const network =
                          err instanceof TypeError ||
                          /failed to fetch|network|load failed/i.test(msg)
                        const stalePhotoCountRule =
                          !network &&
                          msg &&
                          /fotograf/i.test(msg) &&
                          /(cel puțin\s*6|exact\s*6|între\s*1\s*și\s*6|between\s*1\s+and\s+6|webp|png\/webp|jpeg\/png)/i.test(
                            msg,
                          )
                        setSubmitPanelError(
                          stalePhotoCountRule
                            ? pc.fillPhotosRange
                            : network
                              ? sp.submitErrorNetwork
                              : msg || sp.submitErrorServer,
                        )
                      }
                      setReturSubmitSeries(null)
                    } finally {
                      setIsSubmittingRetur(false)
                    }
                  }}
                  className="inline-flex h-11 min-w-[10rem] items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingRetur ? sp.submitSubmitting : sp.submitButton}
                </button>
              </div>
              ) : null}
            </div>
          </section>
            </>
          ) : null}
        </div>
      </article>
    </>
  )
}
