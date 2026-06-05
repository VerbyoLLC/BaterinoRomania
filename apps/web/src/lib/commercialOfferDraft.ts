import type { AdminProductModelRow, AdminSalesAgent } from './api'
import { formatPriceInputDisplay, parsePriceInput } from './formInputSanitize'

export type CommercialOfferBuyerType = 'person' | 'company'
export type CommercialOfferLanguage = 'en' | 'ro' | 'de'
export type CommercialOfferCurrency = 'RON' | 'EUR'

/** Text implicit condiții plată (formular ofertă nouă). */
export const DEFAULT_OFFER_PAYMENT_CONDITIONS =
  'Plata se poate efectua prin transfer bancar.'

/** Fragment evidențiat bold în previzualizare / PDF. */
export const OFFER_PAYMENT_BOLD_PHRASE = 'transfer bancar'

/** Text implicit livrare (formular ofertă nouă). */
export const DEFAULT_OFFER_DELIVERY_NOTES =
  'Livrarea se face in termen de 24 si 48 de ore de la confirmarea platii.'

/** Valabilitate implicită (zile) — formular ofertă nouă. */
export const DEFAULT_OFFER_VALIDITY_DAYS = '30'

/** Serializable payload for previzualizare / export (v1). */
export type CommercialOfferDraftV1 = {
  version: 1
  generatedAt: string
  buyerType: CommercialOfferBuyerType
  languageLabel: string
  /** Limbă pentru traducerea șablonului previzualizare (implicit dedus din languageLabel dacă lipsește). */
  languageCode?: CommercialOfferLanguage
  currency: CommercialOfferCurrency
  validUntilIso: string | null
  validUntilDisplayRo: string | null
  /** Zile valabilitate de la data emiterii (când e setat din formular). */
  validityDays?: number | null
  preparedBy: string | null
  /** Contact agent selectat la întocmire (dacă există). */
  preparedByEmail?: string | null
  preparedByPhone?: string | null
  deliveryNotes: string
  paymentConditions: string
  /** Dacă true, oferta urmează să includă detaliile tehnice ale produsului (PDF/export). */
  includeProductTechnicalDetails?: boolean
  /** Dacă true, oferta urmează să includă beneficiile Baterino (PDF/export). */
  includeBaterinoBenefits?: boolean
  clientPerson: DraftClientPerson | null
  clientCompany: DraftClientCompany | null
  lines: CommercialOfferLineDraft[]
}

export type DraftClientPerson = {
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

export type DraftClientCompany = {
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

export type CommercialOfferLineModelSpecs = {
  energy?: string
  nominalVoltage?: string
  cycleLife?: string
  communication?: string
  weight?: string
  warranty?: string
}

export type CommercialOfferLineDraft = {
  modelLabel: string
  /** ID model (Magazin) — păstrat pentru previzualizare fișă tehnică când state-ul de navigare lipsește. */
  productModelId?: string
  /** Descriere liberă — prezentă pe linii custom. */
  description?: string
  /** Specificații extrase din technicalDescription al modelului selectat. */
  modelSpecs?: CommercialOfferLineModelSpecs
  priceWithoutVat: string
  qty: string
  vatPercent: string
  discountPercent: string
}

export type CommercialOfferLineTotals = {
  qty: number
  unitNet: number
  discountPct: number
  vatPct: number
  lineNetBeforeDiscount: number
  lineNetAfterDiscount: number
  lineVat: number
  lineGross: number
}

const LANG_LABELS: Record<CommercialOfferLanguage, string> = {
  ro: 'Română',
  en: 'Engleză',
  de: 'Germană',
}

export function isCommercialOfferDraftV1(x: unknown): x is CommercialOfferDraftV1 {
  if (!x || typeof x !== 'object') return false
  const o = x as Partial<CommercialOfferDraftV1>
  return o.version === 1 && typeof o.generatedAt === 'string'
}

/** O fișă tehnică în previzualizare — câte o intrare pentru fiecare linie de produs cu model selectat. */
export type CommercialOfferTechnicalSheetSlot = {
  /** Cheie stabilă (ex. id linie ofertă) pentru React și print. */
  lineKey: string
  /** ID model Magazin → Modele */
  modelId: string
}

/** Navigare din formular cu opțiune print PDF după încărcare. */
export type CommercialOfferPreviewLocationState =
  | CommercialOfferDraftV1
  | {
      draft: CommercialOfferDraftV1
      autoPrint?: boolean
      /** Fișe tehnice: una per linie cu model, în ordinea liniilor din ofertă. */
      technicalOfferSheetSlots?: CommercialOfferTechnicalSheetSlot[]
      /** @deprecated Înlocuit cu technicalOfferSheetSlots (modele deduplicate). Păstrat pentru navigări vechi. */
      technicalSheetModelIds?: string[]
    }

/** Câte o fișă per linie de ofertă care are model selectat (pentru previzualizare / PDF). */
export function technicalSheetSlotsFromOfferLines(
  lines: Array<{ id: string; productModelId?: string | null }>,
): CommercialOfferTechnicalSheetSlot[] {
  const out: CommercialOfferTechnicalSheetSlot[] = []
  for (const row of lines) {
    const modelId = String(row.productModelId ?? '').trim()
    if (!modelId) continue
    out.push({ lineKey: row.id, modelId })
  }
  return out
}

/** Recuperare fișe din draft dacă `location.state` nu mai conține sloturi (refresh, serializare). */
export function technicalSheetSlotsFromOfferDraft(draft: CommercialOfferDraftV1): CommercialOfferTechnicalSheetSlot[] {
  const out: CommercialOfferTechnicalSheetSlot[] = []
  draft.lines.forEach((line, index) => {
    const modelId = String(line.productModelId ?? '').trim()
    if (!modelId) return
    out.push({ lineKey: `draft-line-${index}`, modelId })
  })
  return out
}

function technicalOfferSheetSlotsFromWrappedNav(state: {
  technicalOfferSheetSlots?: unknown
  technicalSheetModelIds?: unknown
}): CommercialOfferTechnicalSheetSlot[] {
  const rawSlots = state.technicalOfferSheetSlots
  if (Array.isArray(rawSlots)) {
    const out: CommercialOfferTechnicalSheetSlot[] = []
    for (const item of rawSlots) {
      if (!item || typeof item !== 'object') continue
      const o = item as Record<string, unknown>
      const lineKeyRaw = o.lineKey
      const modelRaw = o.modelId ?? o.productModelId
      const lineKey = typeof lineKeyRaw === 'string' ? lineKeyRaw : ''
      const modelId = typeof modelRaw === 'string' ? modelRaw.trim() : ''
      if (!modelId) continue
      out.push({ lineKey: lineKey || `slot-${out.length}`, modelId })
    }
    return out
  }
  const rawIds = state.technicalSheetModelIds
  if (Array.isArray(rawIds)) {
    return rawIds
      .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      .map((modelId, i) => ({ lineKey: `legacy-${i}-${modelId}`, modelId: modelId.trim() }))
  }
  return []
}

export function parseCommercialOfferPreviewState(state: unknown): {
  draft: CommercialOfferDraftV1 | null
  autoPrint: boolean
  technicalOfferSheetSlots: CommercialOfferTechnicalSheetSlot[]
} {
  if (isCommercialOfferDraftV1(state)) {
    return { draft: state, autoPrint: false, technicalOfferSheetSlots: [] }
  }
  if (state && typeof state === 'object' && 'draft' in state) {
    const wrapped = state as {
      draft?: unknown
      autoPrint?: unknown
      technicalOfferSheetSlots?: unknown
      technicalSheetModelIds?: unknown
    }
    if (isCommercialOfferDraftV1(wrapped.draft)) {
      return {
        draft: wrapped.draft,
        autoPrint: Boolean(wrapped.autoPrint),
        technicalOfferSheetSlots: technicalOfferSheetSlotsFromWrappedNav(wrapped),
      }
    }
  }
  return { draft: null, autoPrint: false, technicalOfferSheetSlots: [] }
}

export function getDraftLanguageCode(draft: CommercialOfferDraftV1): CommercialOfferLanguage {
  const lc = draft.languageCode
  if (lc === 'ro' || lc === 'en' || lc === 'de') return lc
  const lb = String(draft.languageLabel ?? '').trim()
  if (/englez|english|^en$/i.test(lb)) return 'en'
  if (/german|deutsch|^de$/i.test(lb)) return 'de'
  return 'ro'
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Parsare preț din input administrativ (en-US: `20,000.00`; acceptă și format ro-RO vechi).
 */
function parseMoney(s: string): number {
  return parsePriceInput(s)
}

/** Alias export pentru formularul „Preț unitar fără TVA”. */
export function parseCommercialOfferUnitPrice(raw: string): number {
  return parseMoney(raw)
}

/** Formatare en-US la ieșire din câmp (ex. `20,000.00`). */
export function formatCommercialOfferUnitPriceRo(raw: string): string {
  return formatPriceInputDisplay(raw)
}

function parsePct(s: string): number {
  const n = parseInt(String(s ?? '').replace(/\D/g, ''), 10)
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0
}

export function computeLineTotals(line: CommercialOfferLineDraft): CommercialOfferLineTotals {
  const qty = Math.max(0, parseInt(String(line.qty).replace(/\D/g, ''), 10) || 0)
  const unitNet = round2(parseMoney(line.priceWithoutVat))
  const discountPct = parsePct(line.discountPercent)
  const vatPct = parsePct(line.vatPercent)
  const lineNetBeforeDiscount = round2(unitNet * qty)
  const lineNetAfterDiscount = round2(lineNetBeforeDiscount * (1 - discountPct / 100))
  const lineVat = round2(lineNetAfterDiscount * (vatPct / 100))
  const lineGross = round2(lineNetAfterDiscount + lineVat)
  return {
    qty,
    unitNet,
    discountPct,
    vatPct,
    lineNetBeforeDiscount,
    lineNetAfterDiscount,
    lineVat,
    lineGross,
  }
}

export type CommercialOfferTotals = {
  lines: CommercialOfferLineTotals[]
  netAfterDiscount: number
  totalVat: number
  gross: number
}

export function computeOfferTotals(lines: CommercialOfferLineDraft[]): CommercialOfferTotals {
  const lt = lines.map(computeLineTotals)
  const netAfterDiscount = round2(lt.reduce((s, x) => s + x.lineNetAfterDiscount, 0))
  const totalVat = round2(lt.reduce((s, x) => s + x.lineVat, 0))
  const gross = round2(netAfterDiscount + totalVat)
  return { lines: lt, netAfterDiscount, totalVat, gross }
}

export type OfferPartyAddressLines = {
  street: string
  locality: string
}

export function joinOfferAddressLocality(...parts: (string | undefined | null)[]): string {
  return parts
    .map((p) => String(p ?? '').trim())
    .filter(Boolean)
    .join(', ')
}

/** Stradă pe primul rând; oraș, județ, țară (și opțional cod poștal) pe al doilea. */
export function offerPartyAddressFromParts(
  street: string | undefined | null,
  localitySegments: (string | undefined | null)[],
  postalCode?: string | null,
  postalPrefix?: string,
): OfferPartyAddressLines {
  const st = String(street ?? '').trim()
  let locality = joinOfferAddressLocality(...localitySegments)
  const pc = String(postalCode ?? '').trim()
  if (pc) {
    const postal = postalPrefix ? `${postalPrefix} ${pc}` : pc
    locality = locality ? `${locality} · ${postal}` : postal
  }
  if (!st && locality) return { street: locality, locality: '' }
  if (st && !locality) return { street: st, locality: '' }
  return {
    street: st || '—',
    locality,
  }
}

/**
 * Adresă unică (ex. date firmă Baterino) — încearcă despărțire înainte de „Oraș” / „Jud.”;
 * altfel prima virgulă = stradă, restul = localitate.
 */
export function splitOfferAddressSingleField(full: string): OfferPartyAddressLines {
  const t = String(full ?? '').trim()
  if (!t) return { street: '—', locality: '' }
  const marker = /\s+(Ora[sș][șs]?\s|Oras\s|JUD\.|Jud\.|jud\.)/i
  const m = marker.exec(t)
  if (m?.index != null && m.index > 0) {
    return {
      street: t.slice(0, m.index).trim().replace(/,\s*$/, '') || '—',
      locality: t.slice(m.index).trim(),
    }
  }
  const parts = t.split(',').map((s) => s.trim()).filter(Boolean)
  if (parts.length >= 2) {
    return { street: parts[0], locality: parts.slice(1).join(', ') }
  }
  return { street: t, locality: '' }
}

export function commercialOfferClientLabel(draft: CommercialOfferDraftV1): string {
  if (draft.buyerType === 'company') {
    return draft.clientCompany?.companyName?.trim() || '—'
  }
  const p = draft.clientPerson
  if (!p) return '—'
  const name = `${p.prenume} ${p.nume}`.trim()
  return name || '—'
}

export function commercialOfferBuyerTypeLabelRo(buyerType: CommercialOfferBuyerType): string {
  return buyerType === 'company' ? 'Companie' : 'Persoană fizică'
}

/** Număr afișat pe ofertă (ex. OC-20260521-abc123). */
export function formatCommercialOfferNumber(draft: CommercialOfferDraftV1): string {
  const t = new Date(draft.generatedAt)
  if (Number.isNaN(t.getTime())) return 'OC-PREV'
  const y = t.getFullYear()
  const m = String(t.getMonth() + 1).padStart(2, '0')
  const day = String(t.getDate()).padStart(2, '0')
  const tail = draft.generatedAt.replace(/\W/g, '').slice(-6) || String(t.getTime()).slice(-6)
  return `OC-${y}${m}${day}-${tail}`
}

export function commercialOfferProductCount(draft: CommercialOfferDraftV1): number {
  const lines = draft.lines.filter((line) => {
    const label = String(line.modelLabel ?? '').trim()
    return label && !/selectează|necunoscut/i.test(label)
  })
  return lines.length
}

export type CommercialOfferSaveRecord = {
  buyerType: CommercialOfferBuyerType
  clientLabel: string
  clientEmail: string
  clientPhone: string
  amountGross: number
  currency: CommercialOfferCurrency
  productCount: number
}

export function commercialOfferClientContactFromDraft(draft: CommercialOfferDraftV1): {
  email: string
  phone: string
} {
  if (draft.buyerType === 'company' && draft.clientCompany) {
    return {
      email: draft.clientCompany.contactEmail.trim(),
      phone: draft.clientCompany.contactTelefon.trim(),
    }
  }
  if (draft.buyerType === 'person' && draft.clientPerson) {
    return {
      email: draft.clientPerson.email.trim(),
      phone: draft.clientPerson.telefon.trim(),
    }
  }
  return { email: '', phone: '' }
}

export function commercialOfferSaveRecordFromDraft(
  draft: CommercialOfferDraftV1,
): CommercialOfferSaveRecord {
  const contact = commercialOfferClientContactFromDraft(draft)
  return {
    buyerType: draft.buyerType,
    clientLabel: commercialOfferClientLabel(draft),
    clientEmail: contact.email,
    clientPhone: contact.phone,
    amountGross: computeOfferTotals(draft.lines).gross,
    currency: draft.currency,
    productCount: commercialOfferProductCount(draft),
  }
}

/** Snapshot minim pentru listă oferte (email / telefon client). */
export function commercialOfferDraftSnapshotFromDraft(draft: CommercialOfferDraftV1) {
  if (draft.buyerType === 'person' && draft.clientPerson) {
    return {
      buyerType: 'person' as const,
      generatedAt: draft.generatedAt,
      clientPerson: {
        email: draft.clientPerson.email,
        telefon: draft.clientPerson.telefon,
        tara: draft.clientPerson.tara,
      },
    }
  }
  if (draft.buyerType === 'company' && draft.clientCompany) {
    return {
      buyerType: 'company' as const,
      generatedAt: draft.generatedAt,
      clientCompany: {
        contactEmail: draft.clientCompany.contactEmail,
        contactTelefon: draft.clientCompany.contactTelefon,
        tara: draft.clientCompany.tara,
      },
    }
  }
  return null
}

export function formatCommercialMoney(
  amount: number,
  currency: CommercialOfferCurrency,
  localeTag = 'ro-RO',
): string {
  const formatted = new Intl.NumberFormat(localeTag, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `${formatted} ${currency}`
}

export function formatValidUntilRo(isoDate: string | null | undefined): string | null {
  const s = String(isoDate ?? '').trim()
  if (!s) return null
  const d = new Date(`${s}T12:00:00`)
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Data calendaristică locală YYYY-MM-DD după N zile față de ziua emiterii (`issue`). */
export function addLocalCalendarDaysIso(issue: Date, daysToAdd: number): string {
  const n = Math.floor(daysToAdd)
  if (!Number.isFinite(n) || n < 1) return ''
  const base = new Date(issue.getFullYear(), issue.getMonth(), issue.getDate())
  base.setDate(base.getDate() + n)
  const y = base.getFullYear()
  const m = String(base.getMonth() + 1).padStart(2, '0')
  const day = String(base.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatAgentName(agentId: string, agents: AdminSalesAgent[]): string | null {
  const id = agentId.trim()
  if (!id) return null
  const a = agents.find((x) => x.id === id)
  if (!a) return null
  const name = `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim()
  return name || String(a.email || '').trim() || null
}

function formatAgentContact(agentId: string, agents: AdminSalesAgent[]): {
  email: string | null
  phone: string | null
} {
  const id = agentId.trim()
  if (!id) return { email: null, phone: null }
  const a = agents.find((x) => x.id === id)
  if (!a) return { email: null, phone: null }
  const email = String(a.email ?? '').trim() || null
  const phone =
    String(a.phone ?? '').trim() || String(a.whatsapp ?? '').trim() || null
  return { email, phone }
}

function normalizeSpecKey(label: string): string {
  return label.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function extractModelSpecs(technicalDescription: string): CommercialOfferLineModelSpecs {
  const specs: CommercialOfferLineModelSpecs = {}
  const lines = String(technicalDescription ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  for (const line of lines) {
    const idx = line.indexOf(':')
    if (idx <= 0) continue
    const key = normalizeSpecKey(line.slice(0, idx))
    const val = line.slice(idx + 1).trim()
    if (!val) continue
    if (key === 'energy' || key === 'nominal energy' || key === 'energie nominala' || key === 'energie')
      specs.energy ??= val
    else if (key === 'nominal voltage' || key === 'tensiune nominala' || key === 'voltage' || key === 'tensiune')
      specs.nominalVoltage ??= val
    else if (key === 'cycle life' || key === 'ciclu de viata' || key === 'cicluri de viata' || key === 'cycle')
      specs.cycleLife ??= val
    else if (key === 'communication' || key === 'comunicatie' || key === 'comunicatii')
      specs.communication ??= val
    else if (key === 'weight' || key === 'greutate' || key === 'masa')
      specs.weight ??= val
    else if (key === 'warranty' || key === 'garantie')
      specs.warranty ??= val
  }
  return specs
}

function modelLabel(productModelId: string, models: AdminProductModelRow[]): string {
  const id = productModelId.trim()
  if (!id) return '— selectează model —'
  const m = models.find((x) => x.id === id)
  if (!m) return '— model necunoscut —'
  const tail = m.name && m.name !== m.modelNumber ? ` — ${m.name}` : ''
  return `${m.modelNumber}${tail}`
}

/** Formular complet „Ofertă nouă” — salvat în ciornă (DB) sau localStorage. */
export type AdminOfferFormSnapshotV1 = {
  version: 1
  buyerType: CommercialOfferBuyerType
  language: CommercialOfferLanguage
  clientPerson: {
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
  clientCompany: {
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
  offerProductLines: Array<{
    id: string
    productModelId: string
    isCustom?: boolean
    customModel?: string
    customDescription?: string
    priceWithoutVat: string
    qty: string
    vatPercent: string
    discountPercent: string
  }>
  offerValidityDays: string
  offerCurrency: CommercialOfferCurrency
  offerPreparedByAgentId: string
  offerDeliveryNotes: string
  offerPaymentConditions: string
  offerIncludeProductTechnicalDetails: boolean
  offerIncludeBaterinoBenefits: boolean
}

/** Snapshot JSON în coloana draftSnapshot (ciornă admin). */
export type AdminOfferFormPersistedSnapshotV1 = {
  version: 1
  kind: 'adminOfferForm'
  form: AdminOfferFormSnapshotV1
}

export function isAdminOfferFormSnapshotV1(x: unknown): x is AdminOfferFormSnapshotV1 {
  if (!x || typeof x !== 'object') return false
  const o = x as Partial<AdminOfferFormSnapshotV1>
  return o.version === 1 && (o.buyerType === 'person' || o.buyerType === 'company')
}

export function parseAdminOfferFormPersistedSnapshot(raw: unknown): AdminOfferFormSnapshotV1 | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as { version?: unknown; kind?: unknown; form?: unknown }
  if (o.version === 1 && o.kind === 'adminOfferForm' && isAdminOfferFormSnapshotV1(o.form)) {
    return o.form
  }
  return null
}

/** localStorage key for the admin „Ofertă nouă” form draft. */
export const ADMIN_OFFER_FORM_STORAGE_KEY = 'baterino-admin-offer-form-v1'

/** Append to `/admin/oferte/noua` to start a blank offer (clears saved draft). */
export const ADMIN_OFFER_NEW_PATH = '/admin/oferte/noua'
export const ADMIN_OFFER_NEW_FRESH_QUERY = 'new=1'
export const ADMIN_OFFER_EDIT_QUERY = 'edit'

export function adminOfferNewFreshPath(): string {
  return `${ADMIN_OFFER_NEW_PATH}?${ADMIN_OFFER_NEW_FRESH_QUERY}`
}

export function adminOfferEditPath(offerId: string): string {
  return `${ADMIN_OFFER_NEW_PATH}?${ADMIN_OFFER_EDIT_QUERY}=${encodeURIComponent(offerId)}`
}

export function clearPersistedAdminOfferForm(): void {
  try {
    localStorage.removeItem(ADMIN_OFFER_FORM_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function buildCommercialOfferDraftV1(params: {
  buyerType: CommercialOfferBuyerType
  language: CommercialOfferLanguage
  currency: CommercialOfferCurrency
  /** Doar cifre, max. 3 — zile valabilitate de la data emiterii ofertei. */
  validityDays: string
  preparedByAgentId: string
  agents: AdminSalesAgent[]
  deliveryNotes: string
  paymentConditions: string
  includeProductTechnicalDetails: boolean
  includeBaterinoBenefits: boolean
  clientPerson: DraftClientPerson
  clientCompany: DraftClientCompany
  productLines: Array<{
    productModelId: string
    isCustom?: boolean
    customModel?: string
    customDescription?: string
    priceWithoutVat: string
    qty: string
    vatPercent: string
    discountPercent: string
  }>
  productModels: AdminProductModelRow[]
}): CommercialOfferDraftV1 {
  const digits = String(params.validityDays ?? '').replace(/\D/g, '').slice(0, 3)
  const validityDaysNum = digits ? parseInt(digits, 10) : NaN
  const validityDays =
    Number.isFinite(validityDaysNum) && validityDaysNum >= 1 ? validityDaysNum : null
  const issue = new Date()
  const validUntilIso =
    validityDays != null ? addLocalCalendarDaysIso(issue, validityDays) || null : null
  const preparedContact = formatAgentContact(params.preparedByAgentId, params.agents)
  return {
    version: 1,
    generatedAt: issue.toISOString(),
    buyerType: params.buyerType,
    languageLabel: LANG_LABELS[params.language] ?? params.language,
    languageCode: params.language,
    currency: params.currency,
    validUntilIso,
    validUntilDisplayRo: formatValidUntilRo(validUntilIso),
    validityDays,
    preparedBy: formatAgentName(params.preparedByAgentId, params.agents),
    preparedByEmail: preparedContact.email,
    preparedByPhone: preparedContact.phone,
    deliveryNotes: params.deliveryNotes,
    paymentConditions: params.paymentConditions,
    includeProductTechnicalDetails: params.includeProductTechnicalDetails,
    includeBaterinoBenefits: params.includeBaterinoBenefits,
    clientPerson: params.buyerType === 'person' ? params.clientPerson : null,
    clientCompany: params.buyerType === 'company' ? params.clientCompany : null,
    lines: params.productLines.map((row) => {
      const matchedModel = !row.isCustom && row.productModelId.trim()
        ? params.productModels.find((m) => m.id === row.productModelId.trim()) ?? null
        : null
      return ({
      modelLabel: row.isCustom && row.customModel?.trim()
        ? row.customModel.trim()
        : modelLabel(row.productModelId, params.productModels),
      productModelId: row.isCustom ? undefined : (row.productModelId.trim() || undefined),
      description: row.isCustom && row.customDescription?.trim() ? row.customDescription.trim() : undefined,
      modelSpecs: matchedModel ? extractModelSpecs(matchedModel.technicalDescription) : undefined,
      priceWithoutVat: row.priceWithoutVat,
      qty: row.qty,
      vatPercent: row.vatPercent,
      discountPercent: row.discountPercent,
    })}),
  }
}
