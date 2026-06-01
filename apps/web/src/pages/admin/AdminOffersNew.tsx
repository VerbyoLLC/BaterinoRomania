import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'
import { ROMANIAN_COUNTIES, getCitiesForCounty } from '../../lib/romanian-counties-cities'
import {
  formatPriceInputDisplay,
  sanitizeEmailTyping,
  sanitizePersonName,
  sanitizePostalField,
  sanitizePriceInputTyping,
  sanitizeRoPostalCode,
} from '../../lib/formInputSanitize'
import PhoneInput from '../../components/PhoneInput'
import { getAdminProductModels, getAdminAgents, getAdminCommercialOffer, saveAdminCommercialOfferDraft, isAdminAgentAssignable, type AdminProductModelRow, type AdminSalesAgent } from '../../lib/api'
import {
  buildCommercialOfferDraftV1,
  addLocalCalendarDaysIso,
  formatCommercialOfferUnitPriceRo,
  technicalSheetSlotsFromOfferLines,
  ADMIN_OFFER_FORM_STORAGE_KEY,
  ADMIN_OFFER_EDIT_QUERY,
  clearPersistedAdminOfferForm,
  commercialOfferSaveRecordFromDraft,
  DEFAULT_OFFER_DELIVERY_NOTES,
  DEFAULT_OFFER_PAYMENT_CONDITIONS,
  DEFAULT_OFFER_VALIDITY_DAYS,
  parseAdminOfferFormPersistedSnapshot,
  type AdminOfferFormSnapshotV1,
  type CommercialOfferDraftV1,
  type CommercialOfferTechnicalSheetSlot,
} from '../../lib/commercialOfferDraft'
import { CommercialOfferPdfGenerateSession } from './AdminOfferCommercialPreview'

type OfferBuyerType = 'person' | 'company'
type OfferLanguage = 'en' | 'ro' | 'de'
type OfferCurrency = 'EUR' | 'RON'

type ClientPersonDraft = {
  nume: string
  prenume: string
  adresa: string
  judet: string
  oras: string
  tara: string
  codPostal: string
  email: string
  telefon: string
}

type ClientCompanyDraft = {
  companyName: string
  cui: string
  strada: string
  judet: string
  oras: string
  codPostal: string
  tara: string
  contactNume: string
  contactPrenume: string
  contactEmail: string
  contactTelefon: string
}

const emptyClientPerson: ClientPersonDraft = {
  nume: '',
  prenume: '',
  adresa: '',
  judet: '',
  oras: '',
  tara: 'România',
  codPostal: '',
  email: '',
  telefon: '',
}

const emptyClientCompany: ClientCompanyDraft = {
  companyName: '',
  cui: '',
  strada: '',
  judet: '',
  oras: '',
  codPostal: '',
  tara: 'România',
  contactNume: '',
  contactPrenume: '',
  contactEmail: '',
  contactTelefon: '',
}

const radioInputClass =
  'h-4 w-4 shrink-0 border-gray-300 text-slate-900 focus:ring-slate-900 focus:ring-offset-0'

const checkboxInputClass =
  'mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-[#1e46b4] focus:ring-2 focus:ring-[#1e46b4] focus:ring-offset-0'

const labelClass = "block text-xs font-medium font-['Inter'] text-slate-700 mb-1"
const inputClass =
  "w-full min-h-[40px] rounded-lg border border-zinc-200 px-3 text-sm font-['Inter'] text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-900"
const selectClass = `${inputClass} cursor-pointer bg-white`
const errorRingClass = 'border-red-400 focus:ring-red-500'

/** Boxuri secțiune pe pagină (Tip+Limbă, Client, Date contact) */
const offerNestedCardClass =
  'rounded-xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-900/5 sm:p-6'

const offerSectionWrapClass = 'min-w-0 border-0 p-0 m-0 mb-8 w-full max-w-4xl'

/** Titlu mic între sub-secțiuni în aceeași carte */
const offerSubsectionTitleClass =
  "text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-['Inter'] mb-3"

const offerInsetPanelClass =
  'rounded-xl border border-slate-200/80 bg-slate-50/90 px-4 py-4 sm:px-5 sm:py-4'

/** Țări disponibile pentru client în ofertă. */
const OFFER_CLIENT_COUNTRY_OPTIONS = ['România', 'Austria', 'Germany', 'Spain'] as const

function effectiveOfferCountrySelectValue(stored: string): string {
  const t = stored.trim()
  if (!t) return 'România'
  return t
}

function isStandardOfferCountry(stored: string): boolean {
  const t = stored.trim()
  return (OFFER_CLIENT_COUNTRY_OPTIONS as readonly string[]).includes(t)
}

function isValidEmailSyntax(email: string): boolean {
  const s = email.trim()
  if (!s) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

function offerPhoneFilled(phone: string): boolean {
  return phone.replace(/\D/g, '').length >= 8
}

function validateOfferClientRequiredFields(
  buyerType: OfferBuyerType,
  person: ClientPersonDraft,
  company: ClientCompanyDraft,
): string[] {
  const invalid: string[] = []
  const miss = (ok: boolean, fieldId: string) => {
    if (!ok) invalid.push(fieldId)
  }

  if (buyerType === 'person') {
    miss(Boolean(person.nume.trim()), 'offer-pf-nume')
    miss(Boolean(person.prenume.trim()), 'offer-pf-prenume')
    miss(Boolean(person.adresa.trim()), 'offer-pf-adresa')
    miss(Boolean(person.judet.trim()), 'offer-pf-judet')
    miss(Boolean(person.oras.trim()), 'offer-pf-oras')
    miss(Boolean(person.tara.trim()), 'offer-pf-tara')
    const email = person.email.trim()
    miss(Boolean(email) && isValidEmailSyntax(email), 'offer-pf-email')
    miss(offerPhoneFilled(person.telefon), 'offer-pf-telefon')
  } else {
    miss(Boolean(company.companyName.trim()), 'offer-pj-company')
    miss(Boolean(company.strada.trim()), 'offer-pj-strada')
    miss(Boolean(company.judet.trim()), 'offer-pj-judet')
    miss(Boolean(company.oras.trim()), 'offer-pj-oras')
    miss(Boolean(company.tara.trim()), 'offer-pj-tara')
    miss(Boolean(company.contactNume.trim()), 'offer-pj-contact-nume')
    miss(Boolean(company.contactPrenume.trim()), 'offer-pj-contact-prenume')
    const email = company.contactEmail.trim()
    miss(Boolean(email) && isValidEmailSyntax(email), 'offer-pj-contact-email')
    miss(offerPhoneFilled(company.contactTelefon), 'offer-pj-contact-telefon')
  }

  return invalid
}

function validateOfferProductLines(lines: OfferProductLineDraft[]): string[] {
  if (lines.some((l) => l.productModelId.trim().length > 0)) return []
  return lines.map((l) => `offer-line-model-${l.id}`)
}

const offerRequiredMark = (
  <span className="text-red-600 font-normal" aria-hidden="true">
    {' '}
    *
  </span>
)

/** Adresă PF / stradă PJ: litere, cifre, spații — fără semne speciale. */
function sanitizeOfferAddress(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, '').replace(/[^\p{L}\p{N}\s]/gu, '')
}

/** Nume firmă: litere, cifre, spații și .,-&' pentru forme juridice uzuale. */
function sanitizeOfferCompanyName(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, '').replace(/[^\p{L}\p{N}\s.\-&,']/gu, '')
}

function isRomaniaCountry(tara: string): boolean {
  const n = tara
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
  return n === 'romania'
}

function sanitizeCuiInput(value: string): string {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .slice(0, 32)
}


/** Livrare / termeni livrare — text scurt, fără caractere de control */
function sanitizeOfferDeliveryText(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, '').slice(0, 500)
}

function formatAgentOptionLabel(a: AdminSalesAgent): string {
  const name = `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim()
  if (name) return name
  return String(a.email || '').trim() || a.id
}

function sanitizeOfferLineQty(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (!digits) return ''
  const n = parseInt(digits, 10)
  if (!Number.isFinite(n) || n < 1) return ''
  return String(n)
}

/**
 * TVA / reducere %: întreg 0–100.
 * Fără tratament zecimal, lipiri precum „19.00” sau „19,00” devin „1900” → valori greșite (ex. 100).
 */
function sanitizeOfferPercent0to100(value: string): string {
  const raw = String(value ?? '')
    .normalize('NFKC')
    .replace(/%/g, '')
    .replace(/\s/g, '')
    .trim()
  if (!raw) return ''
  const norm = raw.replace(',', '.')
  const dot = norm.indexOf('.')
  if (dot !== -1) {
    const intPart = norm.slice(0, dot).replace(/\D/g, '').slice(0, 3)
    const fracPart = norm.slice(dot + 1).replace(/\D/g, '').slice(0, 4)
    const n = parseFloat(`${intPart || '0'}.${fracPart || '0'}`)
    if (!Number.isFinite(n)) return intPart || ''
    const clamped = Math.min(100, Math.max(0, n))
    return String(Math.round(clamped))
  }
  const cleaned = norm.replace(/\D/g, '').slice(0, 3)
  if (!cleaned) return ''
  let n = parseInt(cleaned, 10)
  if (!Number.isFinite(n)) return ''
  if (n > 100) n = 100
  return String(n)
}

function sanitizeOfferVatPercent(value: string): string {
  return sanitizeOfferPercent0to100(value)
}

function sanitizeOfferDiscountPercent(value: string): string {
  return sanitizeOfferPercent0to100(value)
}

/** Valabilitate în zile: doar cifre, max. 3 caractere */
function sanitizeOfferValidityDays(value: string): string {
  return value.replace(/\D/g, '').slice(0, 3)
}

function newOfferLineId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

type OfferProductLineDraft = {
  id: string
  productModelId: string
  priceWithoutVat: string
  qty: string
  vatPercent: string
  discountPercent: string
}

function newEmptyOfferProductLine(): OfferProductLineDraft {
  return {
    id: newOfferLineId(),
    productModelId: '',
    priceWithoutVat: '',
    qty: '1',
    vatPercent: '21',
    discountPercent: '0',
  }
}

type PersistedAdminOfferFormV1 = AdminOfferFormSnapshotV1

const offerStickyPrimaryBtnClass =
  'inline-flex w-full items-center justify-center rounded-lg bg-[#1e46b4] px-3 py-2.5 text-sm font-semibold font-[\'Inter\'] text-white shadow-sm hover:bg-[#163899] focus:outline-none focus:ring-2 focus:ring-[#1e46b4] focus:ring-offset-2'

const offerStickySecondaryBtnClass =
  'inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold font-[\'Inter\'] text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2'

const offerStickyDarkBtnClass =
  'inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold font-[\'Inter\'] text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2'

function OfferCollapsibleSectionCard({
  sectionId,
  title,
  description,
  defaultOpen = true,
  headerAside,
  children,
}: {
  sectionId: string
  title: string
  description?: string
  defaultOpen?: boolean
  headerAside?: ReactNode
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const headingId = `${sectionId}-heading`
  const panelId = `${sectionId}-panel`

  return (
    <div className={offerNestedCardClass}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
        <button
          type="button"
          id={headingId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-start gap-3 rounded-lg px-1 py-1 text-left -mx-1 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          <span className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-slate-900 font-['Inter'] mb-1">{title}</h2>
            {description ? (
              <p className="text-xs text-slate-500 font-['Inter'] max-w-xl">{description}</p>
            ) : null}
          </span>
          <span className="sr-only">{open ? 'Restrânge secțiunea' : 'Extinde secțiunea'}</span>
          <svg
            className={`mt-0.5 h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {headerAside ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end sm:pt-0.5">{headerAside}</div>
        ) : null}
      </div>

      <div id={panelId} role="region" aria-labelledby={headingId} hidden={!open} className={open ? 'mt-6' : undefined}>
        {children}
      </div>
    </div>
  )
}

export default function AdminOffersNew() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()
  const [buyerType, setBuyerType] = useState<OfferBuyerType>('person')
  const [language, setLanguage] = useState<OfferLanguage>('ro')
  const [clientPerson, setClientPerson] = useState<ClientPersonDraft>(emptyClientPerson)
  const [clientCompany, setClientCompany] = useState<ClientCompanyDraft>(emptyClientCompany)
  const [personEmailError, setPersonEmailError] = useState<string | null>(null)
  const [companyContactEmailError, setCompanyContactEmailError] = useState<string | null>(null)
  const [offerGenerateInvalidFields, setOfferGenerateInvalidFields] = useState<Set<string>>(
    () => new Set(),
  )

  const [productModels, setProductModels] = useState<AdminProductModelRow[]>([])
  const [productModelsLoading, setProductModelsLoading] = useState(true)
  const [productModelsError, setProductModelsError] = useState<string | null>(null)
  const [offerProductLines, setOfferProductLines] = useState<OfferProductLineDraft[]>(() => [
    newEmptyOfferProductLine(),
  ])
  const [offerValidityDays, setOfferValidityDays] = useState<string>(DEFAULT_OFFER_VALIDITY_DAYS)
  const [offerCurrency, setOfferCurrency] = useState<OfferCurrency>('RON')
  const [offerPreparedByAgentId, setOfferPreparedByAgentId] = useState<string>('')
  const [offerDeliveryNotes, setOfferDeliveryNotes] = useState<string>(DEFAULT_OFFER_DELIVERY_NOTES)
  const [offerPaymentConditions, setOfferPaymentConditions] = useState<string>(DEFAULT_OFFER_PAYMENT_CONDITIONS)
  const [offerIncludeProductTechnicalDetails, setOfferIncludeProductTechnicalDetails] = useState(false)
  const [offerIncludeBaterinoBenefits, setOfferIncludeBaterinoBenefits] = useState(false)

  const [agents, setAgents] = useState<AdminSalesAgent[]>([])
  const [agentsLoading, setAgentsLoading] = useState(true)
  const [agentsError, setAgentsError] = useState<string | null>(null)

  const [offerGenerateSession, setOfferGenerateSession] = useState<{
    draft: CommercialOfferDraftV1
    technicalOfferSheetSlots: CommercialOfferTechnicalSheetSlot[]
  } | null>(null)
  const [offerGenerating, setOfferGenerating] = useState(false)
  const [generatedOfferNumber, setGeneratedOfferNumber] = useState<string | null>(null)
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null)
  const [draftSaving, setDraftSaving] = useState(false)
  const [editOfferLoading, setEditOfferLoading] = useState(false)

  const cityOptionsPf = useMemo(() => getCitiesForCounty(clientPerson.judet), [clientPerson.judet])
  const cityOptionsPj = useMemo(() => getCitiesForCounty(clientCompany.judet), [clientCompany.judet])

  const sortedProductModels = useMemo(
    () =>
      [...productModels].sort((a, b) =>
        String(a.modelNumber || '').localeCompare(String(b.modelNumber || ''), 'ro', { sensitivity: 'base' }),
      ),
    [productModels],
  )

  const assignableAgents = useMemo(() => {
    return agents.filter(isAdminAgentAssignable).sort((a, b) => {
      const la = formatAgentOptionLabel(a).toLocaleLowerCase('ro')
      const lb = formatAgentOptionLabel(b).toLocaleLowerCase('ro')
      return la.localeCompare(lb, 'ro')
    })
  }, [agents])

  useEffect(() => {
    let cancelled = false
    setProductModelsLoading(true)
    setProductModelsError(null)
    getAdminProductModels()
      .then((rows) => {
        if (!cancelled) setProductModels(rows)
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setProductModelsError(e instanceof Error ? e.message : 'Nu s-au putut încărca modelele.')
      })
      .finally(() => {
        if (!cancelled) setProductModelsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setAgentsLoading(true)
    setAgentsError(null)
    getAdminAgents()
      .then((rows) => {
        if (!cancelled) setAgents(rows)
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setAgentsError(e instanceof Error ? e.message : 'Nu s-au putut încărca agenții.')
      })
      .finally(() => {
        if (!cancelled) setAgentsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function resetOfferFormToEmpty() {
    setBuyerType('person')
    setLanguage('ro')
    setClientPerson(emptyClientPerson)
    setClientCompany(emptyClientCompany)
    setPersonEmailError(null)
    setCompanyContactEmailError(null)
    setOfferProductLines([newEmptyOfferProductLine()])
    setOfferValidityDays(DEFAULT_OFFER_VALIDITY_DAYS)
    setOfferCurrency('RON')
    setOfferPreparedByAgentId('')
    setOfferDeliveryNotes(DEFAULT_OFFER_DELIVERY_NOTES)
    setOfferPaymentConditions(DEFAULT_OFFER_PAYMENT_CONDITIONS)
    setOfferIncludeProductTechnicalDetails(false)
    setOfferIncludeBaterinoBenefits(false)
    setOfferGenerateInvalidFields(new Set())
  }

  function clearOfferGenerateFieldError(fieldId: string) {
    setOfferGenerateInvalidFields((prev) => {
      if (!prev.has(fieldId)) return prev
      const next = new Set(prev)
      next.delete(fieldId)
      return next
    })
  }

  function offerFieldInvalid(fieldId: string): boolean {
    return offerGenerateInvalidFields.has(fieldId)
  }

  function offerFieldInputClass(fieldId: string): string {
    return offerFieldInvalid(fieldId) ? `${inputClass} ${errorRingClass}` : inputClass
  }

  function offerFieldSelectClass(fieldId: string): string {
    return offerFieldInvalid(fieldId) ? `${selectClass} ${errorRingClass}` : selectClass
  }

  function applyOfferFormSnapshot(p: AdminOfferFormSnapshotV1) {
    if (p.buyerType === 'person' || p.buyerType === 'company') setBuyerType(p.buyerType)
    if (p.language === 'ro' || p.language === 'en' || p.language === 'de') setLanguage(p.language)
    if (p.clientPerson && typeof p.clientPerson === 'object')
      setClientPerson({ ...emptyClientPerson, ...p.clientPerson })
    if (p.clientCompany && typeof p.clientCompany === 'object')
      setClientCompany({ ...emptyClientCompany, ...p.clientCompany })
    if (Array.isArray(p.offerProductLines)) {
      const lines = p.offerProductLines
        .filter((row) => row && typeof row === 'object' && typeof row.id === 'string')
        .map((row) => ({
          id: row.id,
          productModelId: String(row.productModelId ?? ''),
          priceWithoutVat: row.priceWithoutVat?.trim()
            ? formatPriceInputDisplay(String(row.priceWithoutVat))
            : '',
          qty: String(row.qty ?? '1'),
          vatPercent: String(row.vatPercent ?? '21'),
          discountPercent: String(row.discountPercent ?? '0'),
        }))
      setOfferProductLines(lines.length > 0 ? lines : [newEmptyOfferProductLine()])
    }
    if (typeof p.offerValidityDays === 'string') {
      setOfferValidityDays(p.offerValidityDays.trim() ? p.offerValidityDays : DEFAULT_OFFER_VALIDITY_DAYS)
    }
    if (p.offerCurrency === 'EUR' || p.offerCurrency === 'RON') setOfferCurrency(p.offerCurrency)
    if (typeof p.offerPreparedByAgentId === 'string') setOfferPreparedByAgentId(p.offerPreparedByAgentId)
    setOfferDeliveryNotes(
      typeof p.offerDeliveryNotes === 'string' && p.offerDeliveryNotes.trim()
        ? p.offerDeliveryNotes
        : DEFAULT_OFFER_DELIVERY_NOTES,
    )
    setOfferPaymentConditions(
      typeof p.offerPaymentConditions === 'string' && p.offerPaymentConditions.trim()
        ? p.offerPaymentConditions
        : DEFAULT_OFFER_PAYMENT_CONDITIONS,
    )
    if (typeof p.offerIncludeProductTechnicalDetails === 'boolean')
      setOfferIncludeProductTechnicalDetails(p.offerIncludeProductTechnicalDetails)
    if (typeof p.offerIncludeBaterinoBenefits === 'boolean')
      setOfferIncludeBaterinoBenefits(p.offerIncludeBaterinoBenefits)
    setOfferGenerateInvalidFields(new Set())
  }

  function hydrateOfferFormFromStorage() {
    try {
      const raw = localStorage.getItem(ADMIN_OFFER_FORM_STORAGE_KEY)
      if (!raw) return
      const p = JSON.parse(raw) as PersistedAdminOfferFormV1
      if (p?.version !== 1) return
      applyOfferFormSnapshot(p)
    } catch {
      /* ignore corrupt storage */
    }
  }

  function buildAdminOfferFormSnapshot(): AdminOfferFormSnapshotV1 {
    return {
      version: 1,
      buyerType,
      language,
      clientPerson,
      clientCompany,
      offerProductLines,
      offerValidityDays,
      offerCurrency,
      offerPreparedByAgentId,
      offerDeliveryNotes,
      offerPaymentConditions,
      offerIncludeProductTechnicalDetails,
      offerIncludeBaterinoBenefits,
    }
  }

  const startFreshOffer = searchParams.get('new') === '1'
  const editOfferIdParam = searchParams.get(ADMIN_OFFER_EDIT_QUERY)?.trim() || null

  useEffect(() => {
    if (startFreshOffer) {
      clearPersistedAdminOfferForm()
      resetOfferFormToEmpty()
      setEditingOfferId(null)
      setSearchParams({}, { replace: true })
      return
    }
    if (editOfferIdParam) {
      let cancelled = false
      setEditOfferLoading(true)
      getAdminCommercialOffer(editOfferIdParam)
        .then((offer) => {
          if (cancelled) return
          if (offer.status !== 'draft') {
            toast.error('Doar ciornele pot fi editate.')
            setSearchParams({}, { replace: true })
            hydrateOfferFormFromStorage()
            return
          }
          const form = parseAdminOfferFormPersistedSnapshot(offer.draftSnapshot)
          if (!form) {
            toast.error('Ciorna nu conține date de formular.')
            return
          }
          applyOfferFormSnapshot(form)
          setEditingOfferId(offer.id)
          persistOfferFormToStorage()
        })
        .catch((e: unknown) => {
          if (!cancelled) {
            toast.error(e instanceof Error ? e.message : 'Nu s-a putut încărca ciorna.')
            setSearchParams({}, { replace: true })
            hydrateOfferFormFromStorage()
          }
        })
        .finally(() => {
          if (!cancelled) setEditOfferLoading(false)
        })
      return () => {
        cancelled = true
      }
    }
    hydrateOfferFormFromStorage()
  }, [startFreshOffer, editOfferIdParam, setSearchParams])

  function setClientField<K extends keyof ClientPersonDraft>(key: K, value: ClientPersonDraft[K]) {
    setClientPerson((prev) => ({ ...prev, [key]: value }))
    const fieldIds: Partial<Record<keyof ClientPersonDraft, string>> = {
      nume: 'offer-pf-nume',
      prenume: 'offer-pf-prenume',
      adresa: 'offer-pf-adresa',
      judet: 'offer-pf-judet',
      oras: 'offer-pf-oras',
      tara: 'offer-pf-tara',
      email: 'offer-pf-email',
      telefon: 'offer-pf-telefon',
    }
    const fid = fieldIds[key]
    if (fid) clearOfferGenerateFieldError(fid)
  }

  function setCompanyField<K extends keyof ClientCompanyDraft>(key: K, value: ClientCompanyDraft[K]) {
    setClientCompany((prev) => ({ ...prev, [key]: value }))
    const fieldIds: Partial<Record<keyof ClientCompanyDraft, string>> = {
      companyName: 'offer-pj-company',
      strada: 'offer-pj-strada',
      judet: 'offer-pj-judet',
      oras: 'offer-pj-oras',
      tara: 'offer-pj-tara',
      contactNume: 'offer-pj-contact-nume',
      contactPrenume: 'offer-pj-contact-prenume',
      contactEmail: 'offer-pj-contact-email',
      contactTelefon: 'offer-pj-contact-telefon',
    }
    const fid = fieldIds[key]
    if (fid) clearOfferGenerateFieldError(fid)
  }

  function onCountyChangePf(judet: string) {
    setClientPerson((prev) => {
      const cities = getCitiesForCounty(judet)
      const oras = cities.includes(prev.oras) ? prev.oras : ''
      return { ...prev, judet, oras }
    })
    clearOfferGenerateFieldError('offer-pf-judet')
    clearOfferGenerateFieldError('offer-pf-oras')
  }

  function onCountyChangePj(judet: string) {
    setClientCompany((prev) => {
      const cities = getCitiesForCounty(judet)
      const oras = cities.includes(prev.oras) ? prev.oras : ''
      return { ...prev, judet, oras }
    })
    clearOfferGenerateFieldError('offer-pj-judet')
    clearOfferGenerateFieldError('offer-pj-oras')
  }

  const computedValidityEndDisplay = useMemo(() => {
    const digits = offerValidityDays.replace(/\D/g, '').slice(0, 3)
    const n = digits ? parseInt(digits, 10) : NaN
    if (!Number.isFinite(n) || n < 1) return null
    const iso = addLocalCalendarDaysIso(new Date(), n)
    if (!iso) return null
    const end = new Date(`${iso}T12:00:00`)
    if (Number.isNaN(end.getTime())) return null
    const localeTag = language === 'en' ? 'en-GB' : language === 'de' ? 'de-DE' : 'ro-RO'
    return end.toLocaleDateString(localeTag, { day: 'numeric', month: 'long', year: 'numeric' })
  }, [offerValidityDays, language])

  function buildOfferDraft() {
    return buildCommercialOfferDraftV1({
      buyerType,
      language,
      currency: offerCurrency,
      validityDays: offerValidityDays,
      preparedByAgentId: offerPreparedByAgentId,
      agents,
      deliveryNotes: offerDeliveryNotes,
      paymentConditions: offerPaymentConditions,
      includeProductTechnicalDetails: offerIncludeProductTechnicalDetails,
      includeBaterinoBenefits: offerIncludeBaterinoBenefits,
      clientPerson,
      clientCompany,
      productLines: offerProductLines,
      productModels,
    })
  }

  function commercialOfferPreviewNavigateState(autoPrint: boolean) {
    const draft = buildOfferDraft()
    return {
      draft,
      autoPrint,
      technicalOfferSheetSlots: offerIncludeProductTechnicalDetails
        ? technicalSheetSlotsFromOfferLines(offerProductLines)
        : [],
    }
  }

  function allowCommercialOfferPreviewNavigation(): boolean {
    const invalidClient = validateOfferClientRequiredFields(buyerType, clientPerson, clientCompany)
    if (invalidClient.length > 0) {
      setOfferGenerateInvalidFields(new Set(invalidClient))
      toast.error(
        'Completează toate câmpurile obligatorii ale clientului (codul poștal este opțional) înainte de previzualizare sau generare.',
      )
      if (invalidClient.includes('offer-pf-email')) {
        setPersonEmailError(
          clientPerson.email.trim() ? 'Introdu o adresă de email validă.' : 'Emailul este obligatoriu.',
        )
      }
      if (invalidClient.includes('offer-pj-contact-email')) {
        setCompanyContactEmailError(
          clientCompany.contactEmail.trim()
            ? 'Introdu o adresă de email validă.'
            : 'Emailul este obligatoriu.',
        )
      }
      window.requestAnimationFrame(() => {
        document.getElementById(invalidClient[0])?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
      return false
    }

    const invalidProducts = validateOfferProductLines(offerProductLines)
    if (invalidProducts.length > 0) {
      setOfferGenerateInvalidFields(new Set(invalidProducts))
      toast.error('Adaugă cel puțin un produs: selectează un model în secțiunea Produse.')
      window.requestAnimationFrame(() => {
        document.getElementById(invalidProducts[0])?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
      return false
    }

    setOfferGenerateInvalidFields(new Set())
    return true
  }

  function persistOfferFormToStorage(options?: { showNotice?: boolean }) {
    const payload = buildAdminOfferFormSnapshot()
    try {
      localStorage.setItem(ADMIN_OFFER_FORM_STORAGE_KEY, JSON.stringify(payload))
      if (options?.showNotice) {
        toast.success('Salvat local în acest browser.')
      }
    } catch {
      if (options?.showNotice) {
        toast.error('Nu s-a putut salva.')
      }
    }
  }

  async function saveOfferAsDraft() {
    if (draftSaving || editOfferLoading) return
    setDraftSaving(true)
    try {
      const draft = buildOfferDraft()
      const offer = await saveAdminCommercialOfferDraft({
        id: editingOfferId ?? undefined,
        formSnapshot: {
          version: 1,
          kind: 'adminOfferForm',
          form: buildAdminOfferFormSnapshot(),
        },
        meta: commercialOfferSaveRecordFromDraft(draft),
      })
      setEditingOfferId(offer.id)
      persistOfferFormToStorage()
      toast.success('Ciornă salvată în lista de oferte.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Nu s-a putut salva ciorna.')
    } finally {
      setDraftSaving(false)
    }
  }

  function goToCommercialOfferPreview() {
    if (!allowCommercialOfferPreviewNavigation()) return
    persistOfferFormToStorage()
    navigate('/admin/oferte/previzualizare-comerciala', {
      state: commercialOfferPreviewNavigateState(false),
    })
  }

  function generateCommercialOffer() {
    if (!allowCommercialOfferPreviewNavigation()) return
    persistOfferFormToStorage()
    const session = commercialOfferPreviewNavigateState(true)
    setGeneratedOfferNumber(null)
    setOfferGenerating(true)
    setOfferGenerateSession({
      draft: session.draft,
      technicalOfferSheetSlots: session.technicalOfferSheetSlots,
    })
  }

  function confirmGeneratedOffer() {
    clearPersistedAdminOfferForm()
    setGeneratedOfferNumber(null)
    setEditingOfferId(null)
    navigate('/admin/oferte/lista')
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-[1600px] mx-auto w-full flex flex-col lg:flex-row lg:items-start gap-8 xl:gap-10 pb-24 lg:pb-10">
      <div className="min-w-0 flex-1 max-w-4xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">
        {editingOfferId ? 'Editare ciornă ofertă' : 'Ofertă nouă'}
      </h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-4 max-w-3xl">
        {editOfferLoading
          ? 'Se încarcă ciorna…'
          : editingOfferId
            ? 'Continuă completarea ofertei. Draft salvează în listă; Generează ofertă finalizează documentul.'
            : 'Composer pentru client, linii de produs, prețuri și mesaj de însoțire — înainte de trimitere sau export.'}
      </p>
      <fieldset className={offerSectionWrapClass}>
        <legend className="sr-only">Parametri ofertă</legend>

        <OfferCollapsibleSectionCard
          sectionId="offer-section-params"
          title="Parametri ofertă"
          description="Alege tipul clientului, setările documentului, apoi completează plată și livrare."
        >
          <div className={`${offerInsetPanelClass} mb-8`}>
            <p id="offer-type-label" className="text-sm font-semibold text-slate-900 font-['Inter'] mb-3">
              Tip client
            </p>
            <div
              role="radiogroup"
              aria-labelledby="offer-type-label"
              className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-2"
            >
              <label className="inline-flex cursor-pointer items-center gap-2.5 font-['Inter'] text-sm font-medium text-slate-800">
                <input
                  type="radio"
                  name="offer-buyer-type"
                  value="person"
                  checked={buyerType === 'person'}
                  onChange={() => {
                    setBuyerType('person')
                    setOfferGenerateInvalidFields(new Set())
                  }}
                  className={radioInputClass}
                />
                Persoană fizică
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2.5 font-['Inter'] text-sm font-medium text-slate-800">
                <input
                  type="radio"
                  name="offer-buyer-type"
                  value="company"
                  checked={buyerType === 'company'}
                  onChange={() => {
                    setBuyerType('company')
                    setOfferGenerateInvalidFields(new Set())
                  }}
                  className={radioInputClass}
                />
                Persoană juridică
              </label>
            </div>
          </div>

          <p className={offerSubsectionTitleClass}>Limbă, monedă și valabilitate</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-x-6 mb-8">
            <div className="min-w-0">
              <label
                htmlFor="offer-language"
                className="block text-sm font-semibold text-slate-900 font-['Inter'] mb-2 cursor-pointer"
              >
                Limbă document
              </label>
              <select
                id="offer-language"
                value={language}
                onChange={(e) => {
                  const v = e.target.value
                  if (v === 'en' || v === 'ro' || v === 'de') setLanguage(v)
                }}
                className={selectClass}
              >
                <option value="ro">Română</option>
                <option value="en">Engleză</option>
                <option value="de">Germană</option>
              </select>
            </div>

            <div className="min-w-0">
              <label
                htmlFor="offer-currency"
                className="block text-sm font-semibold text-slate-900 font-['Inter'] mb-2 cursor-pointer"
              >
                Monedă
              </label>
              <select
                id="offer-currency"
                value={offerCurrency}
                onChange={(e) => {
                  const v = e.target.value
                  if (v === 'EUR' || v === 'RON') setOfferCurrency(v)
                }}
                className={selectClass}
              >
                <option value="RON">RON</option>
                <option value="EUR">EUR (euro)</option>
              </select>
            </div>

            <div className="min-w-0">
              <label
                htmlFor="offer-validity-days"
                className="block text-sm font-semibold text-slate-900 font-['Inter'] mb-2 cursor-pointer"
              >
                Valabilitate (zile)
              </label>
              <input
                id="offer-validity-days"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={3}
                placeholder="ex.: 30"
                value={offerValidityDays}
                onChange={(e) => setOfferValidityDays(sanitizeOfferValidityDays(e.target.value))}
                className={`${inputClass} max-w-[8rem]`}
                aria-describedby="offer-validity-days-hint"
              />
              <p id="offer-validity-days-hint" className="mt-1 text-xs text-slate-500 font-['Inter']">
                Opțional. Calcul din ziua emiterii; max. 999.
              </p>
              {computedValidityEndDisplay ? (
                <p className="mt-2 text-xs text-slate-800 font-['Inter']">
                  Valabilă până la:{' '}
                  <strong className="font-semibold text-slate-900">{computedValidityEndDisplay}</strong>
                </p>
              ) : null}
            </div>
          </div>

          <p className={offerSubsectionTitleClass}>Întocmit de</p>
          <div className="mb-8 max-w-lg">
            <label htmlFor="offer-prepared-by-agent" className="sr-only">
              Agent vânzări
            </label>
            <select
              id="offer-prepared-by-agent"
              value={offerPreparedByAgentId}
              onChange={(e) => setOfferPreparedByAgentId(e.target.value)}
              disabled={agentsLoading}
              className={selectClass}
            >
              <option value="">Selectează agent (opțional)</option>
              {assignableAgents.map((a) => (
                <option key={a.id} value={a.id}>
                  {formatAgentOptionLabel(a)}
                </option>
              ))}
            </select>
            {agentsError ? (
              <p className="mt-1 text-xs text-red-600 font-['Inter']" role="alert">
                {agentsError}
              </p>
            ) : null}
          </div>

          <p className={offerSubsectionTitleClass}>Opțiuni conținut ofertă</p>
          <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
              <label className="flex cursor-pointer items-start gap-3 font-['Inter']">
                <input
                  type="checkbox"
                  checked={offerIncludeProductTechnicalDetails}
                  onChange={(e) => setOfferIncludeProductTechnicalDetails(e.target.checked)}
                  className={checkboxInputClass}
                  aria-describedby="offer-opt-technical-desc"
                />
                <span className="min-w-0 text-sm font-semibold text-slate-900 leading-snug">
                  Generează detalii tehnice produs
                </span>
              </label>
              <p
                id="offer-opt-technical-desc"
                className="mt-2 border-l-2 border-[#1e46b4]/40 pl-3 text-xs leading-relaxed text-slate-600 font-['Inter']"
              >
                Oferta este generată împreună cu detaliile tehnice ale produsului.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
              <label className="flex cursor-pointer items-start gap-3 font-['Inter']">
                <input
                  type="checkbox"
                  checked={offerIncludeBaterinoBenefits}
                  onChange={(e) => setOfferIncludeBaterinoBenefits(e.target.checked)}
                  className={checkboxInputClass}
                  aria-describedby="offer-opt-benefits-desc"
                />
                <span className="min-w-0 text-sm font-semibold text-slate-900 leading-snug">
                  Generează beneficii
                </span>
              </label>
              <p
                id="offer-opt-benefits-desc"
                className="mt-2 border-l-2 border-[#1e46b4]/40 pl-3 text-xs leading-relaxed text-slate-600 font-['Inter']"
              >
                Oferta este generată împreună cu beneficiile Baterino.
              </p>
            </div>
          </div>

          <p className={offerSubsectionTitleClass}>Plată și livrare</p>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
            <div className="min-w-0 flex flex-col">
              <label
                htmlFor="offer-payment-conditions"
                className="block text-sm font-semibold text-slate-900 font-['Inter'] mb-2"
              >
                Condiții de plată
              </label>
              <textarea
                id="offer-payment-conditions"
                value={offerPaymentConditions}
                onChange={(e) => setOfferPaymentConditions(sanitizeOfferDeliveryText(e.target.value))}
                placeholder="Ex.: plată în avans, termene, facturare"
                rows={4}
                className={`${inputClass} min-h-[100px] flex-1 resize-y py-2.5`}
              />
            </div>
            <div className="min-w-0 flex flex-col">
              <label htmlFor="offer-delivery" className="block text-sm font-semibold text-slate-900 font-['Inter'] mb-2">
                Livrare
              </label>
              <textarea
                id="offer-delivery"
                value={offerDeliveryNotes}
                onChange={(e) => setOfferDeliveryNotes(sanitizeOfferDeliveryText(e.target.value))}
                placeholder="Termen, locație sau observații livrare"
                rows={4}
                className={`${inputClass} min-h-[100px] flex-1 resize-y py-2.5`}
              />
            </div>
          </div>
        </OfferCollapsibleSectionCard>
      </fieldset>

      {buyerType === 'person' ? (
        <fieldset className={offerSectionWrapClass}>
          <legend className="sr-only">Client persoană fizică</legend>
          <OfferCollapsibleSectionCard
            sectionId="offer-section-client-pf"
            title="Client — persoană fizică"
            description="Numele, adresa și datele de contact ale beneficiarului."
          >
            <p className={offerSubsectionTitleClass}>Identificare</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
              <div>
                <label htmlFor="offer-pf-nume" className={labelClass}>
                  Nume
                  {offerRequiredMark}
                </label>
                <input
                  id="offer-pf-nume"
                  value={clientPerson.nume}
                  onChange={(e) => setClientField('nume', sanitizePersonName(e.target.value))}
                  autoComplete="family-name"
                  required
                  aria-invalid={offerFieldInvalid('offer-pf-nume')}
                  className={offerFieldInputClass('offer-pf-nume')}
                />
              </div>
              <div>
                <label htmlFor="offer-pf-prenume" className={labelClass}>
                  Prenume
                  {offerRequiredMark}
                </label>
                <input
                  id="offer-pf-prenume"
                  value={clientPerson.prenume}
                  onChange={(e) => setClientField('prenume', sanitizePersonName(e.target.value))}
                  autoComplete="given-name"
                  required
                  aria-invalid={offerFieldInvalid('offer-pf-prenume')}
                  className={offerFieldInputClass('offer-pf-prenume')}
                />
              </div>
            </div>

            <p className={offerSubsectionTitleClass}>Adresă</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
              <div className="sm:col-span-2">
                <label htmlFor="offer-pf-adresa" className={labelClass}>
                  Adresă (stradă, număr)
                  {offerRequiredMark}
                </label>
                <input
                  id="offer-pf-adresa"
                  value={clientPerson.adresa}
                  onChange={(e) => setClientField('adresa', sanitizeOfferAddress(e.target.value))}
                  autoComplete="street-address"
                  required
                  aria-invalid={offerFieldInvalid('offer-pf-adresa')}
                  className={offerFieldInputClass('offer-pf-adresa')}
                  placeholder="Litere, cifre și spații"
                />
              </div>
              <div>
                <label htmlFor="offer-pf-judet" className={labelClass}>
                  Județ
                  {offerRequiredMark}
                </label>
                <select
                  id="offer-pf-judet"
                  value={clientPerson.judet}
                  onChange={(e) => onCountyChangePf(e.target.value)}
                  autoComplete="address-level1"
                  required
                  aria-invalid={offerFieldInvalid('offer-pf-judet')}
                  className={offerFieldSelectClass('offer-pf-judet')}
                >
                  <option value="">Selectează județul</option>
                  {ROMANIAN_COUNTIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="offer-pf-oras" className={labelClass}>
                  Oraș
                </label>
                <select
                  id="offer-pf-oras"
                  value={clientPerson.oras}
                  onChange={(e) => setClientField('oras', e.target.value)}
                  disabled={!clientPerson.judet}
                  autoComplete="address-level2"
                  className={`${selectClass} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500`}
                >
                  <option value="">{clientPerson.judet ? 'Selectează orașul' : 'Alege mai întâi județul'}</option>
                  {cityOptionsPf.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="offer-pf-tara" className={labelClass}>
                  Țară
                  {offerRequiredMark}
                </label>
                <select
                  id="offer-pf-tara"
                  value={effectiveOfferCountrySelectValue(clientPerson.tara)}
                  onChange={(e) => setClientField('tara', e.target.value)}
                  autoComplete="country-name"
                  required
                  aria-invalid={offerFieldInvalid('offer-pf-tara')}
                  className={offerFieldSelectClass('offer-pf-tara')}
                >
                  {clientPerson.tara.trim() && !isStandardOfferCountry(clientPerson.tara) ? (
                    <option value={clientPerson.tara.trim()}>{clientPerson.tara.trim()}</option>
                  ) : null}
                  {OFFER_CLIENT_COUNTRY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="offer-pf-cod-postal" className={labelClass}>
                  Cod poștal <span className="font-normal text-slate-500">(opțional)</span>
                </label>
                <input
                  id="offer-pf-cod-postal"
                  value={clientPerson.codPostal}
                  onChange={(e) =>
                    setClientField(
                      'codPostal',
                      isRomaniaCountry(clientPerson.tara)
                        ? sanitizeRoPostalCode(e.target.value)
                        : sanitizePostalField(e.target.value),
                    )
                  }
                  autoComplete="postal-code"
                  className={inputClass}
                  maxLength={isRomaniaCountry(clientPerson.tara) ? 6 : 16}
                />
              </div>
            </div>

            <p className={offerSubsectionTitleClass}>Contact</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="offer-pf-email" className={labelClass}>
                  Email
                  {offerRequiredMark}
                </label>
                <input
                  id="offer-pf-email"
                  type="email"
                  inputMode="email"
                  value={clientPerson.email}
                  onChange={(e) => {
                    const v = sanitizeEmailTyping(e.target.value)
                    setClientField('email', v)
                    if (personEmailError && v.trim()) {
                      setPersonEmailError(isValidEmailSyntax(v) ? null : 'Introdu o adresă de email validă.')
                    }
                  }}
                  onBlur={(e) => {
                    const v = e.target.value.trim()
                    if (!v) setPersonEmailError(null)
                    else setPersonEmailError(isValidEmailSyntax(v) ? null : 'Introdu o adresă de email validă.')
                  }}
                  autoComplete="email"
                  required
                  aria-invalid={Boolean(personEmailError) || offerFieldInvalid('offer-pf-email')}
                  className={
                    personEmailError || offerFieldInvalid('offer-pf-email')
                      ? `${inputClass} ${errorRingClass}`
                      : inputClass
                  }
                />
                {personEmailError ? (
                  <p className="mt-1 text-xs text-red-600 font-['Inter']" role="alert">
                    {personEmailError}
                  </p>
                ) : null}
              </div>
              <div>
                <label className={labelClass}>
                  Număr telefon
                  {offerRequiredMark}
                </label>
                <PhoneInput
                  value={clientPerson.telefon}
                  onChange={(v) => setClientField('telefon', v)}
                  error={offerFieldInvalid('offer-pf-telefon')}
                  autoComplete="tel"
                  aria-invalid={offerFieldInvalid('offer-pf-telefon')}
                  aria-describedby="offer-pf-telefon"
                />
              </div>
            </div>
          </OfferCollapsibleSectionCard>
        </fieldset>
      ) : null}

      {buyerType === 'company' ? (
        <fieldset className={offerSectionWrapClass}>
          <legend className="sr-only">Client persoană juridică</legend>
          <OfferCollapsibleSectionCard
            sectionId="offer-section-client-pj"
            title="Client — persoană juridică"
            description="Date firmă, adresă sediu și persoana de contact pentru ofertă."
          >
            <p className={offerSubsectionTitleClass}>Companie</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
              <div>
                <label htmlFor="offer-pj-company" className={labelClass}>
                  Nume companie
                  {offerRequiredMark}
                </label>
                <input
                  id="offer-pj-company"
                  value={clientCompany.companyName}
                  onChange={(e) => setCompanyField('companyName', sanitizeOfferCompanyName(e.target.value))}
                  autoComplete="organization"
                  required
                  aria-invalid={offerFieldInvalid('offer-pj-company')}
                  className={offerFieldInputClass('offer-pj-company')}
                />
              </div>
              <div>
                <label htmlFor="offer-pj-cui" className={labelClass}>
                  CUI / CIF <span className="font-normal text-slate-500">(opțional)</span>
                </label>
                <input
                  id="offer-pj-cui"
                  value={clientCompany.cui}
                  onChange={(e) => setCompanyField('cui', sanitizeCuiInput(e.target.value))}
                  autoComplete="off"
                  className={inputClass}
                  placeholder="RO..."
                />
              </div>
            </div>

            <p className={offerSubsectionTitleClass}>Adresă sediu social</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
              <div className="sm:col-span-2">
                <label htmlFor="offer-pj-strada" className={labelClass}>
                  Stradă și număr
                  {offerRequiredMark}
                </label>
                <input
                  id="offer-pj-strada"
                  value={clientCompany.strada}
                  onChange={(e) => setCompanyField('strada', sanitizeOfferAddress(e.target.value))}
                  autoComplete="street-address"
                  required
                  aria-invalid={offerFieldInvalid('offer-pj-strada')}
                  className={offerFieldInputClass('offer-pj-strada')}
                  placeholder="Litere, cifre și spații"
                />
              </div>
              <div>
                <label htmlFor="offer-pj-judet" className={labelClass}>
                  Județ
                  {offerRequiredMark}
                </label>
                <select
                  id="offer-pj-judet"
                  value={clientCompany.judet}
                  onChange={(e) => onCountyChangePj(e.target.value)}
                  required
                  aria-invalid={offerFieldInvalid('offer-pj-judet')}
                  className={offerFieldSelectClass('offer-pj-judet')}
                >
                  <option value="">Selectează județul</option>
                  {ROMANIAN_COUNTIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="offer-pj-oras" className={labelClass}>
                  Oraș
                  {offerRequiredMark}
                </label>
                <select
                  id="offer-pj-oras"
                  value={clientCompany.oras}
                  onChange={(e) => setCompanyField('oras', e.target.value)}
                  disabled={!clientCompany.judet}
                  required
                  aria-invalid={offerFieldInvalid('offer-pj-oras')}
                  className={`${offerFieldSelectClass('offer-pj-oras')} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500`}
                >
                  <option value="">{clientCompany.judet ? 'Selectează orașul' : 'Alege mai întâi județul'}</option>
                  {cityOptionsPj.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="offer-pj-tara" className={labelClass}>
                  Țară
                  {offerRequiredMark}
                </label>
                <select
                  id="offer-pj-tara"
                  value={effectiveOfferCountrySelectValue(clientCompany.tara)}
                  onChange={(e) => setCompanyField('tara', e.target.value)}
                  autoComplete="country-name"
                  required
                  aria-invalid={offerFieldInvalid('offer-pj-tara')}
                  className={offerFieldSelectClass('offer-pj-tara')}
                >
                  {clientCompany.tara.trim() && !isStandardOfferCountry(clientCompany.tara) ? (
                    <option value={clientCompany.tara.trim()}>{clientCompany.tara.trim()}</option>
                  ) : null}
                  {OFFER_CLIENT_COUNTRY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="offer-pj-cod-postal" className={labelClass}>
                  Cod poștal <span className="font-normal text-slate-500">(opțional)</span>
                </label>
                <input
                  id="offer-pj-cod-postal"
                  value={clientCompany.codPostal}
                  onChange={(e) =>
                    setCompanyField(
                      'codPostal',
                      isRomaniaCountry(clientCompany.tara)
                        ? sanitizeRoPostalCode(e.target.value)
                        : sanitizePostalField(e.target.value),
                    )
                  }
                  autoComplete="postal-code"
                  className={inputClass}
                  maxLength={isRomaniaCountry(clientCompany.tara) ? 6 : 16}
                />
              </div>
            </div>

            <p className={offerSubsectionTitleClass}>Persoană de contact</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="offer-pj-contact-nume" className={labelClass}>
                  Nume
                  {offerRequiredMark}
                </label>
                <input
                  id="offer-pj-contact-nume"
                  value={clientCompany.contactNume}
                  onChange={(e) => setCompanyField('contactNume', sanitizePersonName(e.target.value))}
                  autoComplete="family-name"
                  required
                  aria-invalid={offerFieldInvalid('offer-pj-contact-nume')}
                  className={offerFieldInputClass('offer-pj-contact-nume')}
                />
              </div>
              <div>
                <label htmlFor="offer-pj-contact-prenume" className={labelClass}>
                  Prenume
                  {offerRequiredMark}
                </label>
                <input
                  id="offer-pj-contact-prenume"
                  value={clientCompany.contactPrenume}
                  onChange={(e) => setCompanyField('contactPrenume', sanitizePersonName(e.target.value))}
                  autoComplete="given-name"
                  required
                  aria-invalid={offerFieldInvalid('offer-pj-contact-prenume')}
                  className={offerFieldInputClass('offer-pj-contact-prenume')}
                />
              </div>
              <div>
                <label htmlFor="offer-pj-contact-email" className={labelClass}>
                  Email
                  {offerRequiredMark}
                </label>
                <input
                  id="offer-pj-contact-email"
                  type="email"
                  inputMode="email"
                  value={clientCompany.contactEmail}
                  onChange={(e) => {
                    const v = sanitizeEmailTyping(e.target.value)
                    setCompanyField('contactEmail', v)
                    if (companyContactEmailError && v.trim()) {
                      setCompanyContactEmailError(
                        isValidEmailSyntax(v) ? null : 'Introdu o adresă de email validă.',
                      )
                    }
                  }}
                  onBlur={(e) => {
                    const v = e.target.value.trim()
                    if (!v) setCompanyContactEmailError(null)
                    else
                      setCompanyContactEmailError(
                        isValidEmailSyntax(v) ? null : 'Introdu o adresă de email validă.',
                      )
                  }}
                  autoComplete="email"
                  required
                  aria-invalid={
                    Boolean(companyContactEmailError) || offerFieldInvalid('offer-pj-contact-email')
                  }
                  className={
                    companyContactEmailError || offerFieldInvalid('offer-pj-contact-email')
                      ? `${inputClass} ${errorRingClass}`
                      : inputClass
                  }
                />
                {companyContactEmailError ? (
                  <p className="mt-1 text-xs text-red-600 font-['Inter']" role="alert">
                    {companyContactEmailError}
                  </p>
                ) : null}
              </div>
              <div>
                <label className={labelClass}>
                  Număr telefon
                  {offerRequiredMark}
                </label>
                <PhoneInput
                  value={clientCompany.contactTelefon}
                  onChange={(v) => setCompanyField('contactTelefon', v)}
                  error={offerFieldInvalid('offer-pj-contact-telefon')}
                  autoComplete="tel"
                  aria-invalid={offerFieldInvalid('offer-pj-contact-telefon')}
                  aria-describedby="offer-pj-contact-telefon"
                />
              </div>
            </div>
          </OfferCollapsibleSectionCard>
        </fieldset>
      ) : null}

      <fieldset className={offerSectionWrapClass}>
        <legend className="sr-only">Produse</legend>
        <OfferCollapsibleSectionCard
          sectionId="offer-section-products"
          title="Produse"
          description="Adaugă linii: model, preț unitar fără TVA, cantitate, TVA și reducere opțională."
          headerAside={
            <button
              type="button"
              onClick={() =>
                setOfferProductLines((prev) => [...prev, newEmptyOfferProductLine()])
              }
              disabled={productModelsLoading || sortedProductModels.length === 0}
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium font-['Inter'] text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Adaugă produs
            </button>
          }
        >
          {productModelsLoading ? (
            <p className="mt-4 text-sm text-slate-500 font-['Inter']">Se încarcă modelele…</p>
          ) : null}
          {productModelsError ? (
            <p className="mt-4 text-sm text-red-600 font-['Inter']" role="alert">
              {productModelsError}
            </p>
          ) : null}
          {!productModelsLoading && !productModelsError && sortedProductModels.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500 font-['Inter']">
              Nu există modele în Magazin → Modele. Adaugă modele ca să poți compune oferta.
            </p>
          ) : null}

          {offerProductLines.length > 0 ? (
            <div className="mt-6 space-y-4">
              <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_140px_100px_80px_80px_auto] md:gap-4 md:px-1">
                <span className={labelClass}>
                  Model
                  {offerRequiredMark}
                </span>
                <span className={labelClass}>Preț unitar fără TVA ({offerCurrency})</span>
                <span className={labelClass}>Cantitate</span>
                <span className={labelClass}>TVA (%)</span>
                <span className={labelClass}>Reducere (%)</span>
                <span className="sr-only">Acțiuni</span>
              </div>
              {offerProductLines.map((line) => (
                <div
                  key={line.id}
                  className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 md:grid-cols-[minmax(0,1fr)_140px_100px_80px_80px_auto] md:items-end md:gap-4 md:border-t-0 md:pt-0"
                >
                  <div>
                    <label htmlFor={`offer-line-model-${line.id}`} className={`${labelClass} md:sr-only`}>
                      Model
                    </label>
                    <select
                      id={`offer-line-model-${line.id}`}
                      value={line.productModelId}
                      onChange={(e) => {
                        const v = e.target.value
                        setOfferProductLines((prev) =>
                          prev.map((row) =>
                            row.id === line.id ? { ...row, productModelId: v } : row,
                          ),
                        )
                        if (v.trim()) clearOfferGenerateFieldError(`offer-line-model-${line.id}`)
                      }}
                      required
                      aria-invalid={offerFieldInvalid(`offer-line-model-${line.id}`)}
                      className={offerFieldSelectClass(`offer-line-model-${line.id}`)}
                    >
                      <option value="">Selectează modelul</option>
                      {sortedProductModels.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.modelNumber}
                          {m.name && m.name !== m.modelNumber ? ` — ${m.name}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`offer-line-price-${line.id}`} className={`${labelClass} md:sr-only`}>
                      Preț unitar fără TVA ({offerCurrency})
                    </label>
                    <input
                      id={`offer-line-price-${line.id}`}
                      inputMode="decimal"
                      autoComplete="off"
                      value={line.priceWithoutVat}
                      onChange={(e) =>
                        setOfferProductLines((prev) =>
                          prev.map((row) =>
                            row.id === line.id
                              ? { ...row, priceWithoutVat: sanitizePriceInputTyping(e.target.value) }
                              : row,
                          ),
                        )
                      }
                      onBlur={() =>
                        setOfferProductLines((prev) =>
                          prev.map((row) =>
                            row.id === line.id
                              ? {
                                  ...row,
                                  priceWithoutVat: formatCommercialOfferUnitPriceRo(row.priceWithoutVat),
                                }
                              : row,
                          ),
                        )
                      }
                      placeholder="20,000.00"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor={`offer-line-qty-${line.id}`} className={`${labelClass} md:sr-only`}>
                      Cantitate
                    </label>
                    <input
                      id={`offer-line-qty-${line.id}`}
                      inputMode="numeric"
                      autoComplete="off"
                      value={line.qty}
                      onChange={(e) =>
                        setOfferProductLines((prev) =>
                          prev.map((row) =>
                            row.id === line.id ? { ...row, qty: sanitizeOfferLineQty(e.target.value) } : row,
                          ),
                        )
                      }
                      placeholder="1"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor={`offer-line-vat-${line.id}`} className={`${labelClass} md:sr-only`}>
                      TVA (%)
                    </label>
                    <input
                      id={`offer-line-vat-${line.id}`}
                      inputMode="numeric"
                      autoComplete="off"
                      value={line.vatPercent}
                      onChange={(e) =>
                        setOfferProductLines((prev) =>
                          prev.map((row) =>
                            row.id === line.id
                              ? { ...row, vatPercent: sanitizeOfferVatPercent(e.target.value) }
                              : row,
                          ),
                        )
                      }
                      onBlur={() =>
                        setOfferProductLines((prev) =>
                          prev.map((row) =>
                            row.id === line.id
                              ? { ...row, vatPercent: row.vatPercent.trim() ? row.vatPercent : '21' }
                              : row,
                          ),
                        )
                      }
                      placeholder="21"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor={`offer-line-discount-${line.id}`} className={`${labelClass} md:sr-only`}>
                      Reducere (%)
                    </label>
                    <input
                      id={`offer-line-discount-${line.id}`}
                      inputMode="numeric"
                      autoComplete="off"
                      value={line.discountPercent}
                      onChange={(e) =>
                        setOfferProductLines((prev) =>
                          prev.map((row) =>
                            row.id === line.id
                              ? { ...row, discountPercent: sanitizeOfferDiscountPercent(e.target.value) }
                              : row,
                          ),
                        )
                      }
                      onBlur={() =>
                        setOfferProductLines((prev) =>
                          prev.map((row) =>
                            row.id === line.id
                              ? { ...row, discountPercent: row.discountPercent.trim() ? row.discountPercent : '0' }
                              : row,
                          ),
                        )
                      }
                      placeholder="0"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex md:justify-end md:pb-0.5">
                    <button
                      type="button"
                      onClick={() =>
                        setOfferProductLines((prev) => prev.filter((row) => row.id !== line.id))
                      }
                      className="text-xs font-medium font-['Inter'] text-slate-600 underline hover:text-slate-900"
                    >
                      Elimină
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : !productModelsLoading && sortedProductModels.length > 0 ? (
            <p className="mt-4 text-sm text-slate-500 font-['Inter']">
              Apasă „Adaugă produs” pentru a adăuga linii în ofertă.
            </p>
          ) : null}
        </OfferCollapsibleSectionCard>
      </fieldset>
      </div>

      <aside
        className="hidden lg:flex w-44 xl:w-52 shrink-0 self-start flex-col gap-2 sticky top-6 z-10"
        aria-label="Acțiuni ofertă"
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 font-['Inter'] px-0.5">
          Acțiuni
        </p>
        <button type="button" onClick={goToCommercialOfferPreview} className={offerStickyPrimaryBtnClass}>
          Previzualizează
        </button>
        <button
          type="button"
          onClick={() => void saveOfferAsDraft()}
          disabled={draftSaving || editOfferLoading || offerGenerating}
          className={offerStickySecondaryBtnClass}
        >
          {draftSaving ? 'Se salvează…' : 'Draft'}
        </button>
        <button type="button" onClick={generateCommercialOffer} className={offerStickyDarkBtnClass}>
          Generează ofertă
        </button>
        <p className="text-[11px] text-slate-400 font-['Inter'] leading-snug px-0.5 mt-1">
          Previzualizare deschide documentul înainte de trimitere. Generează ofertă salvează PDF-ul în listă.
        </p>
      </aside>

      <div
        className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-sm px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(15,23,42,0.08)]"
        role="toolbar"
        aria-label="Acțiuni ofertă"
      >
        <div className="flex max-w-[1600px] mx-auto gap-2">
          <button
            type="button"
            onClick={goToCommercialOfferPreview}
            className={`${offerStickyPrimaryBtnClass} flex-1 min-w-0 text-xs px-2`}
          >
            Previzualizează
          </button>
          <button
            type="button"
            onClick={() => void saveOfferAsDraft()}
            disabled={draftSaving || editOfferLoading || offerGenerating}
            className={`${offerStickySecondaryBtnClass} flex-1 min-w-0 text-xs px-2`}
          >
            {draftSaving ? '…' : 'Draft'}
          </button>
          <button
            type="button"
            onClick={generateCommercialOffer}
            className={`${offerStickyDarkBtnClass} flex-1 min-w-0 text-[10px] leading-tight px-1 py-2.5`}
          >
            Generează ofertă
          </button>
        </div>
      </div>

      {offerGenerating ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="status"
          aria-live="polite"
          aria-label="Se generează oferta"
        >
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-xl text-center">
            <p className="text-base font-semibold text-slate-900 font-['Inter']">Se generează oferta…</p>
            <p className="mt-2 text-sm text-slate-600 font-['Inter']">
              PDF-ul se pregătește și se salvează în listă.
            </p>
          </div>
        </div>
      ) : null}

      {generatedOfferNumber ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="presentation"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            role="dialog"
            aria-labelledby="offer-generated-modal-title"
            aria-modal="true"
          >
            <h2 id="offer-generated-modal-title" className="text-lg font-bold text-slate-900 font-['Inter']">
              Ofertă generată
            </h2>
            <p className="mt-2 text-sm text-slate-600 font-['Inter']">
              Oferta a fost generată cu succes. Detaliile au fost salvate în lista de oferte.
            </p>
            <p className="mt-3 text-sm text-slate-800 font-['Inter']">
              Număr ofertă:{' '}
              <span className="font-mono font-semibold text-slate-900">{generatedOfferNumber}</span>
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                autoFocus
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 font-['Inter']"
                onClick={confirmGeneratedOffer}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {offerGenerateSession ? (
        <CommercialOfferPdfGenerateSession
          draft={offerGenerateSession.draft}
          technicalOfferSheetSlots={offerGenerateSession.technicalOfferSheetSlots}
          offerId={editingOfferId ?? undefined}
          onGenerated={(offerNumber) => {
            setOfferGenerating(false)
            setOfferGenerateSession(null)
            setEditingOfferId(null)
            setGeneratedOfferNumber(offerNumber)
          }}
          onError={(message) => {
            setOfferGenerating(false)
            setOfferGenerateSession(null)
            toast.error(message)
          }}
        />
      ) : null}
    </div>
  )
}
