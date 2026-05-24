import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Briefcase,
  Building2,
  CreditCard,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  User,
} from 'lucide-react'
import {
  computeOfferTotals,
  commercialOfferDraftSnapshotFromDraft,
  commercialOfferSaveRecordFromDraft,
  formatCommercialMoney,
  formatCommercialOfferNumber,
  type CommercialOfferTechnicalSheetSlot,
  getDraftLanguageCode,
  offerPartyAddressFromParts,
  parseCommercialOfferPreviewState,
  splitOfferAddressSingleField,
  technicalSheetSlotsFromOfferDraft,
  type CommercialOfferDraftV1,
  type CommercialOfferLanguage,
  type OfferPartyAddressLines,
} from '../../lib/commercialOfferDraft'
import { parseTechnicalDescriptionRows, resolveCatalogForModel } from '../../lib/adminProductSheetResolve'
import { renderCommercialOfferPaymentNote } from '../../lib/commercialOfferNoteText'
import {
  getAdminCompanyData,
  getAdminProductModels,
  getAdminProducts,
  type AdminCompanyData,
  type AdminProduct,
  type AdminProductModelRow,
} from '../../lib/api'
import AdminProductSheetA4 from './AdminProductSheetA4'
import AdminBenefitsClientA4 from './AdminBenefitsClientA4'
import AdminBenefitsPartnerA4 from './AdminBenefitsPartnerA4'
import {
  COMMERCIAL_OFFER_LOCALE,
  formatCommercialIssueDate,
  formatCommercialValidityDays,
  formatWeightedVatPercent,
  getCommercialOfferTemplateStrings,
} from '../../lib/commercialOfferTemplateI18n'
import { waitForDocumentImages } from '../../lib/adminDocumentPdfCapture'
import { buildCommercialOfferPreviewHtmlForPdf } from '../../lib/commercialOfferPreviewPdf'
import { downloadAdminCommercialOfferPdf } from '../../lib/api'
import './admin-commercial-offer-a4.css'
import './admin-product-sheet.css'
import './admin-benefits-client-a4.css'
import './admin-benefits-partner-a4.css'

const SITE_WEB = 'www.baterino.ro'
const SITE_URL = 'https://baterino.ro'
const DEFAULT_CONTACT_EMAIL = 'vanzari@baterino.ro'
const DEFAULT_CONTACT_PHONE = '+40 770 106 374'

const selectToolbarClass =
  "rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-['Inter'] text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-900"

function splitModelLabel(label: string): { title: string; desc: string } {
  const idx = label.indexOf(' — ')
  if (idx === -1) return { title: label.trim() || '—', desc: '' }
  return { title: label.slice(0, idx).trim() || '—', desc: label.slice(idx + 3).trim() }
}

const OFFER_MODEL_BATTERY_SUFFIX = ' - Acumulator LiFePo4'

function qrDataUrl(payload: string, sizePx = 120): string {
  const n = Math.min(300, Math.max(60, Math.round(sizePx)))
  const data = encodeURIComponent(payload)
  // ecc=H: higher error correction — helps scanning with a centered logo overlay.
  return `https://api.qrserver.com/v1/create-qr-code/?size=${n}x${n}&ecc=H&color=0a0e1a&bgcolor=ffffff&data=${data}`
}

/**
 * Cifre internaționale fără „+” (ex. 40770106374), pentru wa.me și tel:+.
 * Acceptă lipiri precum link WhatsApp, 07xx…, sau 7xx… (9 cifre).
 */
function normalizeOfferPhoneDigits(phoneDisplay: string): string {
  const trimmed = phoneDisplay.trim()
  const fromWa = trimmed.match(/(?:wa\.me\/|api\.whatsapp\.com\/send\?[^#]*phone=)(\d+)/i)
  if (fromWa?.[1]) {
    let d = fromWa[1].replace(/\D/g, '')
    if (d.startsWith('00')) d = d.slice(2)
    if (d.length >= 8) return d
  }

  let d = trimmed.replace(/\D/g, '')
  if (!d) d = DEFAULT_CONTACT_PHONE.replace(/\D/g, '')

  if (d.startsWith('00')) d = d.slice(2)

  // Mobil RO cu zero inițial: 0770123456 → 40770123456
  if (/^07\d{8}$/.test(d)) {
    d = `40${d.slice(1)}`
    return d
  }

  if (!d.startsWith('40') && d.length === 9 && /^7\d{8}$/.test(d)) {
    d = `40${d}`
  }

  return d
}

/** Link oficial click-to-chat (deschide WhatsApp la scanare). */
function phoneToWhatsAppUrl(phoneDisplay: string): string {
  const digits = normalizeOfferPhoneDigits(phoneDisplay)
  return `https://wa.me/${digits}`
}

/** RFC 3966 — deschide apelatorul la scanare pe telefon. */
function phoneToTelUri(phoneDisplay: string): string {
  const digits = normalizeOfferPhoneDigits(phoneDisplay)
  return `tel:+${digits}`
}

function WhatsAppGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="aco-wa-glyph">
      <path
        fill="#25D366"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      />
    </svg>
  )
}

function QrWithCenterLogo({
  payloadUrl,
  sizePx,
  logo,
}: {
  payloadUrl: string
  sizePx: number
  logo: ReactNode
}) {
  return (
    <div className="aco-qr-with-logo" style={{ width: sizePx, height: sizePx }}>
      <img
        src={qrDataUrl(payloadUrl, sizePx)}
        alt=""
        width={sizePx}
        height={sizePx}
        className="aco-qr-pixelated"
        referrerPolicy="no-referrer"
      />
      <div className="aco-qr-logo-center">{logo}</div>
    </div>
  )
}

function PartyRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="aco-party-row">
      {icon}
      <span>{children}</span>
    </div>
  )
}

function PartyAddressRows({
  address,
  iconProps,
}: {
  address: OfferPartyAddressLines
  iconProps: { size: 11; strokeWidth: number }
}) {
  const locality = address.locality.trim()
  return (
    <>
      <PartyRow icon={<MapPin {...iconProps} />}>{address.street}</PartyRow>
      {locality ? (
        <div className="aco-party-row aco-party-row--address-continued">
          <span>{locality}</span>
        </div>
      ) : null}
    </>
  )
}

type CommercialOfferPreviewCoreProps = {
  draft: CommercialOfferDraftV1
  technicalOfferSheetSlots?: CommercialOfferTechnicalSheetSlot[]
  mode: 'preview' | 'generate'
  offerId?: string
  onGenerated?: (offerNumber: string) => void
  onGenerateError?: (message: string) => void
}

function CommercialOfferPreviewCore({
  draft,
  technicalOfferSheetSlots = [],
  mode,
  offerId,
  onGenerated,
  onGenerateError,
}: CommercialOfferPreviewCoreProps) {
  const isGenerate = mode === 'generate'
  const autoPrint = isGenerate

  const sheetSlotsFromDraft = draft ? technicalSheetSlotsFromOfferDraft(draft) : []
  const effectiveTechnicalSheetSlots = draft?.includeProductTechnicalDetails
    ? technicalOfferSheetSlots.length > 0
      ? technicalOfferSheetSlots
      : sheetSlotsFromDraft
    : []

  const technicalSlotsSignature = effectiveTechnicalSheetSlots
    .map((s) => `${s.lineKey}:${s.modelId}`)
    .join('|')

  const wantTechnicalSheets = effectiveTechnicalSheetSlots.length > 0
  const wantBenefitsSheet = Boolean(draft?.includeBaterinoBenefits)
  const benefitsTemplateIsPartner = draft?.buyerType === 'company'

  const [previewLang, setPreviewLang] = useState<CommercialOfferLanguage>('ro')
  const [company, setCompany] = useState<AdminCompanyData | null>(null)
  const [sheetModels, setSheetModels] = useState<AdminProductModelRow[]>([])
  const [sheetProducts, setSheetProducts] = useState<AdminProduct[]>([])
  const [sheetsLoading, setSheetsLoading] = useState(false)
  const [sheetsLoadError, setSheetsLoadError] = useState<string | null>(null)
  const pdfCaptureRef = useRef<HTMLDivElement>(null)
  const downloadOfferPdfRef = useRef<(() => Promise<void>) | null>(null)
  const [pdfBusy, setPdfBusy] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)

  const sheetModelsById = useMemo(() => {
    const m = new Map<string, AdminProductModelRow>()
    for (const row of sheetModels) m.set(row.id, row)
    return m
  }, [sheetModels])

  useEffect(() => {
    if (draft) setPreviewLang(getDraftLanguageCode(draft))
  }, [draft])

  const downloadOfferPdf = useCallback(async () => {
    if (!draft) return
    if (wantTechnicalSheets && sheetsLoading) return
    setPdfError(null)
    setPdfBusy(true)
    try {
      let root = pdfCaptureRef.current
      for (let attempt = 0; attempt < 15 && !root; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 100))
        root = pdfCaptureRef.current
      }
      if (!root) throw new Error('Nu s-a putut pregăti previzualizarea pentru PDF.')

      await waitForDocumentImages(root)
      const html = buildCommercialOfferPreviewHtmlForPdf(root)
      const filename = `oferta-${formatCommercialOfferNumber(draft)}.pdf`
      await downloadAdminCommercialOfferPdf({
        html,
        filename,
        downloadToBrowser: !autoPrint,
        ...(autoPrint
          ? {
              saveRecord: commercialOfferSaveRecordFromDraft(draft),
              draftSnapshot: commercialOfferDraftSnapshotFromDraft(draft),
              ...(offerId ? { offerId } : {}),
            }
          : {}),
      })
      if (autoPrint) {
        onGenerated?.(formatCommercialOfferNumber(draft))
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Nu s-a putut genera PDF-ul.'
      setPdfError(message)
      if (autoPrint) onGenerateError?.(message)
    } finally {
      setPdfBusy(false)
    }
  }, [draft, autoPrint, wantTechnicalSheets, sheetsLoading, offerId, onGenerated, onGenerateError])

  downloadOfferPdfRef.current = downloadOfferPdf

  useEffect(() => {
    if (!autoPrint) return
    if (wantTechnicalSheets && sheetsLoading) return

    let cancelled = false
    const delayMs = wantTechnicalSheets ? 1200 : 800
    const id = window.setTimeout(() => {
      if (cancelled) return
      void downloadOfferPdfRef.current?.()
    }, delayMs)
    return () => {
      cancelled = true
      window.clearTimeout(id)
    }
  }, [draft, autoPrint, wantTechnicalSheets, sheetsLoading])

  useEffect(() => {
    let cancelled = false
    getAdminCompanyData()
      .then((c) => {
        if (!cancelled) setCompany(c)
      })
      .catch(() => {
        if (!cancelled) setCompany(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!draft || !wantTechnicalSheets) {
      setSheetModels([])
      setSheetProducts([])
      setSheetsLoadError(null)
      setSheetsLoading(false)
      return
    }
    let cancelled = false
    setSheetsLoading(true)
    setSheetsLoadError(null)
    Promise.all([getAdminProductModels(), getAdminProducts()])
      .then(([modelsList, productsList]) => {
        if (cancelled) return
        setSheetModels(Array.isArray(modelsList) ? modelsList : [])
        setSheetProducts(Array.isArray(productsList) ? productsList : [])
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setSheetsLoadError(e instanceof Error ? e.message : 'Nu s-au putut încărca fișele tehnice.')
      })
      .finally(() => {
        if (!cancelled) setSheetsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [
    draft,
    wantTechnicalSheets,
    technicalSlotsSignature,
  ])

  const t = useMemo(() => getCommercialOfferTemplateStrings(previewLang), [previewLang])
  const localeTag = COMMERCIAL_OFFER_LOCALE[previewLang]

  const totals = useMemo(() => (draft ? computeOfferTotals(draft.lines) : null), [draft])

  const generatedDisplay = useMemo(() => {
    if (!draft) return ''
    try {
      return new Date(draft.generatedAt).toLocaleString(localeTag, {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    } catch {
      return draft.generatedAt
    }
  }, [draft, localeTag])

  const supplierName = company?.name?.trim() || 'BATERINO ROMÂNIA'
  const supplierAddress = useMemo(
    () => splitOfferAddressSingleField(company?.address ?? ''),
    [company?.address],
  )
  const supplierEmail = DEFAULT_CONTACT_EMAIL
  const supplierPhone = DEFAULT_CONTACT_PHONE

  const authorName = draft?.preparedBy?.trim() || company?.representativeName?.trim() || '—'
  const authorTitle =
    draft?.preparedBy?.trim() && draft.preparedBy.trim() !== '—'
      ? t.authorSalesAgent
      : company?.representativeName?.trim()
        ? t.authorRepresentative
        : '—'

  const clientBlock = useMemo(() => {
    if (!draft) return null
    if (draft.buyerType === 'person' && draft.clientPerson) {
      const p = draft.clientPerson
      const fullName = `${p.prenume} ${p.nume}`.trim()
      const address = offerPartyAddressFromParts(
        p.adresa,
        [p.oras, p.judet, p.tara],
        p.codPostal,
        t.postalPrefix,
      )
      return {
        name: fullName || '—',
        address,
        cui: '—',
        contact: fullName || '—',
        email: p.email.trim() || '—',
        phone: p.telefon.trim() || '—',
      }
    }
    if (draft.buyerType === 'company' && draft.clientCompany) {
      const c = draft.clientCompany
      const address = offerPartyAddressFromParts(
        c.strada,
        [c.oras, c.judet, c.tara],
        c.codPostal,
        t.postalPrefix,
      )
      const contact = `${c.contactPrenume} ${c.contactNume}`.trim()
      const companyName = c.companyName.trim() || '—'
      return {
        name: companyName,
        company: companyName,
        address,
        cui: c.cui.trim(),
        contact: contact || '—',
        email: c.contactEmail.trim() || '—',
        phone: c.contactTelefon.trim() || '—',
      }
    }
    return {
      name: '—',
      company: '—',
      address: { street: '—', locality: '' },
      cui: '—',
      contact: '—',
      email: '—',
      phone: '—',
    }
  }, [draft, t])

  const issueDateStr = formatCommercialIssueDate(draft.generatedAt, localeTag)
  const validityStr = formatCommercialValidityDays(draft, localeTag, t)
  const vatWeighted = totals ? formatWeightedVatPercent(totals.netAfterDiscount, totals.totalVat, localeTag) : '—'
  const iconProps = { size: 11 as const, strokeWidth: 1.75 }

  const authorIsSalesAgent = Boolean(draft.preparedBy?.trim() && draft.preparedBy.trim() !== '—')
  const authorPhoneDisplay = authorIsSalesAgent
    ? draft.preparedByPhone?.trim() || '—'
    : DEFAULT_CONTACT_PHONE
  const authorEmailDisplay = authorIsSalesAgent
    ? draft.preparedByEmail?.trim() || '—'
    : DEFAULT_CONTACT_EMAIL

  const agentPhoneRawForQr =
    authorIsSalesAgent && draft.preparedByPhone?.trim()
      ? draft.preparedByPhone.trim()
      : DEFAULT_CONTACT_PHONE

  const whatsAppQrUrl = phoneToWhatsAppUrl(agentPhoneRawForQr)
  const telQrPayload = phoneToTelUri(agentPhoneRawForQr)

  const fmtMoney = (amount: number) => formatCommercialMoney(amount, draft.currency, localeTag)

  return (
    <div
      className={
        isGenerate
          ? 'w-[960px]'
          : 'mx-auto w-full max-w-[960px] p-4 font-[\'Inter\'] sm:p-8 lg:p-10 print:max-w-none print:p-2 print:overflow-visible'
      }
    >
      {!isGenerate ? (
      <div className="mb-6 flex flex-col gap-4 print:hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
              {t.previewBadge}
            </span>
            <p className="mt-2 text-xs text-slate-500">
              {t.generatedPrefix} {generatedDisplay}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void downloadOfferPdf()}
              disabled={pdfBusy || (wantTechnicalSheets && sheetsLoading)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pdfBusy ? t.pdfGenerating : t.printPdf}
            </button>
            <Link
              to="/admin/oferte/noua"
              className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              {t.backToForm}
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="offer-preview-lang" className="text-sm font-medium text-slate-700 whitespace-nowrap">
            {t.documentLanguageLabel}
          </label>
          <select
            id="offer-preview-lang"
            value={previewLang}
            onChange={(e) => {
              const v = e.target.value
              if (v === 'ro' || v === 'en' || v === 'de') setPreviewLang(v)
            }}
            className={selectToolbarClass}
          >
            <option value="ro">Română</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
        {pdfError ? (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            <p>{pdfError}</p>
            {autoPrint ? (
              <button
                type="button"
                onClick={() => void downloadOfferPdf()}
                disabled={pdfBusy || (wantTechnicalSheets && sheetsLoading)}
                className="mt-3 rounded-lg bg-red-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
              >
                Reîncearcă generarea
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      ) : null}

      {!isGenerate && wantTechnicalSheets && (sheetsLoading || sheetsLoadError) ? (
        <div className="mb-4">
          {sheetsLoading ? (
            <p className="text-sm text-slate-500 font-['Inter']">Se încarcă fișele tehnice…</p>
          ) : null}
          {sheetsLoadError ? (
            <p className="text-sm text-red-600 font-['Inter']" role="alert">
              {sheetsLoadError}
            </p>
          ) : null}
        </div>
      ) : null}

      <div ref={pdfCaptureRef} className="aco-offer-preview-stack pb-4 print:overflow-visible">
        <div className="-mx-2 max-w-full overflow-x-auto px-2 sm:mx-0 sm:overflow-x-visible sm:px-0 print:overflow-visible">
        <div className="aco-a4 shadow-xl ring-1 ring-slate-900/10 print:shadow-none">
          <div className="aco-top-bar">
            <span>{t.topBarDoc}</span>
            <span>{t.topBarConfidential}</span>
          </div>

          <div className="aco-header">
            <div className="aco-header-left">
              <img
                className="aco-logo-img"
                src="/images/shared/baterino-logo-black.svg"
                alt="Baterino"
                width={180}
                height={36}
              />
              <div className="aco-logo-sub">{t.logoSub}</div>
            </div>
            <div className="aco-header-right">
              <div className="aco-header-right-cluster">
                <div className="aco-header-right-copy">
                  <div className="aco-offer-title">{t.offerTitle}</div>
                  <div className="aco-offer-num"># {formatCommercialOfferNumber(draft)}</div>
                  <div className="aco-meta-pills">
                    <div className="aco-pill">
                      {t.issuedPrefix} <strong>{issueDateStr}</strong>
                    </div>
                    <div className="aco-pill">
                      {t.validityPrefix} <strong>{validityStr}</strong>
                    </div>
                    {draft.includeBaterinoBenefits ? (
                      <div className="aco-pill">{t.metaIncludesBenefits}</div>
                    ) : null}
                  </div>
                </div>
                <div className="aco-qr-wrap-framed">
                  <img
                    src={qrDataUrl(SITE_URL, 60)}
                    alt=""
                    width={60}
                    height={60}
                    className="aco-qr-pixelated"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="aco-divider" />

          <div className="aco-parties">
            <div className="aco-party aco-party--supplier">
              <div className="aco-party-label">{t.supplier}</div>
              <div className="aco-party-name">{supplierName}</div>
              <PartyAddressRows address={supplierAddress} iconProps={iconProps} />
              <PartyRow icon={<Mail {...iconProps} />}>{supplierEmail}</PartyRow>
              <PartyRow icon={<Phone {...iconProps} />}>{supplierPhone}</PartyRow>
            </div>

            <div className="aco-party aco-party--client">
              <div className="aco-party-label">{t.client}</div>
              <div className="aco-party-name">{clientBlock?.name ?? '—'}</div>
              {clientBlock ? (
                <PartyAddressRows address={clientBlock.address} iconProps={iconProps} />
              ) : (
                <PartyRow icon={<MapPin {...iconProps} />}>—</PartyRow>
              )}
              {draft.buyerType === 'company' && clientBlock?.cui ? (
                <PartyRow icon={<Building2 {...iconProps} />}>
                  {t.taxIdPrefix} {clientBlock.cui}
                </PartyRow>
              ) : null}
              {draft.buyerType === 'company' ? (
                <PartyRow icon={<User {...iconProps} />}>
                  {t.contactPersonPrefix} <strong>{clientBlock?.contact ?? '—'}</strong>
                </PartyRow>
              ) : null}
              <PartyRow icon={<Mail {...iconProps} />}>{clientBlock?.email ?? '—'}</PartyRow>
              <PartyRow icon={<Phone {...iconProps} />}>{clientBlock?.phone ?? '—'}</PartyRow>
            </div>
          </div>

          <div className="aco-divider" />

          <div className="aco-products-section">
            <div className="aco-section-label">{t.productsSection}</div>
            <table className="aco-prod-table">
              <thead>
                <tr>
                  <th style={{ width: '36%' }}>{t.colProduct}</th>
                  <th style={{ width: '7%' }}>{t.colUnit}</th>
                  <th style={{ width: '7%' }}>{t.colQty}</th>
                  <th style={{ width: '14%' }}>
                    {t.colPricePerUnit} ({draft.currency})
                  </th>
                  <th style={{ width: '9%' }}>{t.colVatPct}</th>
                  <th style={{ width: '13%' }}>
                    {t.colVatAmount} ({draft.currency})
                  </th>
                  <th style={{ width: '14%' }}>
                    {t.colTotal} ({draft.currency})
                  </th>
                </tr>
              </thead>
              <tbody>
                {draft.lines.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: '#8090b0', padding: '16px' }}>
                      {t.emptyLines}
                    </td>
                  </tr>
                ) : (
                  draft.lines.map((line, i) => {
                    const lt = totals?.lines[i]
                    const { title: modelNumber, desc: productName } = splitModelLabel(line.modelLabel)
                    const disc = parseInt(String(line.discountPercent).replace(/\D/g, ''), 10) || 0
                    const modelSubline = productName
                      ? `${modelNumber}${OFFER_MODEL_BATTERY_SUFFIX}`
                      : OFFER_MODEL_BATTERY_SUFFIX.slice(3)
                    const secondaryParts = [
                      modelSubline,
                      disc > 0 ? `${t.lineDiscountPrefix}: ${disc}%` : '',
                    ].filter(Boolean)
                    return (
                      <tr key={i}>
                        <td>
                          <div className="aco-prod-name">{productName || modelNumber}</div>
                          {secondaryParts.length > 0 ? (
                            <div className="aco-prod-desc">{secondaryParts.join(' · ')}</div>
                          ) : null}
                        </td>
                        <td>{t.unitPiece}</td>
                        <td>{lt?.qty ?? '—'}</td>
                        <td>{line.priceWithoutVat.trim() && lt ? fmtMoney(lt.unitNet) : '—'}</td>
                        <td>{line.vatPercent}%</td>
                        <td>{lt ? fmtMoney(lt.lineVat) : '—'}</td>
                        <td>{lt ? fmtMoney(lt.lineGross) : '—'}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {totals && draft.lines.length > 0 ? (
            <div className="aco-totals-row">
              <div className="aco-totals-box">
                <div className="aco-total-line">
                  <span>{t.subtotalExVat}</span>
                  <span>{fmtMoney(totals.netAfterDiscount)}</span>
                </div>
                <div className="aco-total-line">
                  <span>
                    {t.vatAveragePrefix} {vatWeighted}%
                  </span>
                  <span>{fmtMoney(totals.totalVat)}</span>
                </div>
                <div className="aco-total-line grand">
                  <span>{t.grandTotalPayable}</span>
                  <span>{fmtMoney(totals.gross)}</span>
                </div>
              </div>
            </div>
          ) : null}

          <div className="aco-notes-section">
            <div className="aco-note-box warranty">
              <div className="aco-note-label">
                <ShieldCheck size={12} strokeWidth={2} />
                {t.noteWarrantyTitle}
              </div>
              <div className="aco-note-text">{t.noteWarrantyBody}</div>
            </div>
            <div className="aco-note-box">
              <div className="aco-note-label">
                <CreditCard size={12} strokeWidth={2} />
                {t.notePaymentTitle}
              </div>
              <div className="aco-note-text">
                {draft.paymentConditions.trim()
                  ? renderCommercialOfferPaymentNote(draft.paymentConditions.trim())
                  : '—'}
              </div>
            </div>
            <div className="aco-note-box">
              <div className="aco-note-label">
                <Truck size={12} strokeWidth={2} />
                {t.noteDeliveryTitle}
              </div>
              <div className="aco-note-text">{draft.deliveryNotes.trim() || '—'}</div>
            </div>
          </div>

          <div className="aco-flex-spacer" />

          <div className="aco-footer-section">
            <div className="aco-footer-brand">
              <img
                className="aco-footer-logo-img"
                src="/images/shared/baterino-logo-black.svg"
                alt="Baterino"
                width={140}
                height={22}
              />
              <div className="aco-footer-detail">
                <Globe size={10} strokeWidth={2} />
                <span>{SITE_WEB}</span>
              </div>
              <div className="aco-footer-detail">
                <Phone size={10} strokeWidth={2} />
                <span>{DEFAULT_CONTACT_PHONE}</span>
              </div>
              <div className="aco-footer-detail">
                <Mail size={10} strokeWidth={2} />
                <span>{DEFAULT_CONTACT_EMAIL}</span>
              </div>
            </div>

            <div className="aco-footer-made-by-with-wa">
              <div className="aco-made-by-main-grid">
                <div className="aco-made-by-author-column">
                  <div className="aco-made-by-row-head">
                    <div className="aco-made-by-label">{t.madeByLabel}</div>
                  </div>
                  <div className="aco-made-by-text-block">
                    <div className="aco-made-by-name">{authorName}</div>
                    <div className="aco-made-by-detail">
                      <Briefcase size={10} strokeWidth={2} />
                      <span>{authorTitle}</span>
                    </div>
                    <div className="aco-made-by-detail">
                      <Phone size={10} strokeWidth={2} />
                      <span>{authorPhoneDisplay}</span>
                    </div>
                    <div className="aco-made-by-detail">
                      <Mail size={10} strokeWidth={2} />
                      <span>{authorEmailDisplay}</span>
                    </div>
                  </div>
                </div>

                <div className="aco-made-by-contact-column">
                  <div className="aco-contact-qr-head">
                    <div className="aco-made-by-label">{t.contactMeLabel}</div>
                  </div>
                  <div className="aco-contact-qr-row">
                    <div className="aco-made-by-qr-col">
                      <div className="aco-qr-wrap-framed">
                        <QrWithCenterLogo
                          payloadUrl={telQrPayload}
                          sizePx={60}
                          logo={
                            <Phone size={14} strokeWidth={2.25} className="aco-tel-qr-center-icon" aria-hidden />
                          }
                        />
                      </div>
                    </div>
                    <div className="aco-made-by-qr-col">
                      <div className="aco-qr-wrap-framed">
                        <QrWithCenterLogo
                          payloadUrl={whatsAppQrUrl}
                          sizePx={60}
                          logo={<WhatsAppGlyph size={15} />}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="aco-bottom-bar">
            <span>
              <strong>{SITE_WEB}</strong>
            </span>
            <span>·</span>
            <span>
              <strong>{DEFAULT_CONTACT_EMAIL}</strong>
            </span>
            <span>·</span>
            <span>
              <strong>{DEFAULT_CONTACT_PHONE}</strong>
            </span>
          </div>
        </div>

        {wantTechnicalSheets && !sheetsLoading && !sheetsLoadError ? (
          <div className="mt-8 print:mt-0">
            {effectiveTechnicalSheetSlots.map((slot) => {
                  const model = sheetModelsById.get(slot.modelId)
                  if (!model) {
                    return (
                      <div key={slot.lineKey} className="aco-offer-preview-sheet-break">
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 font-['Inter'] print:bg-white">
                          <strong className="font-semibold">Fișă tehnică indisponibilă.</strong>{' '}
                          Nu s-a găsit modelul cu ID{' '}
                          <code className="rounded bg-red-100 px-1 py-0.5 text-xs print:bg-red-50">
                            {slot.modelId}
                          </code>{' '}
                          în Magazin → Modele (reîncarcă previzualizarea din formular sau verifică că modelul există).
                        </div>
                      </div>
                    )
                  }
                  const resolved = resolveCatalogForModel(model, sheetProducts)
                  const technicalRows = parseTechnicalDescriptionRows(model.technicalDescription)
                  return (
                    <div key={slot.lineKey} className="aco-offer-preview-sheet-break">
                      <div className="pb-2">
                        {!resolved.matchedProduct ? (
                          <p className="aco-pdf-exclude mb-2 text-xs text-amber-800 font-['Inter'] print:hidden">
                            Nu există produs în catalog cu SKU egal cu „{model.modelNumber}”.
                          </p>
                        ) : null}
                        <AdminProductSheetA4
                          model={model}
                          title={resolved.title}
                          imageUrl={resolved.imageUrl}
                          matchedProduct={resolved.matchedProduct}
                          technicalRows={technicalRows}
                          language={previewLang}
                        />
                      </div>
                    </div>
                  )
                })}
          </div>
        ) : null}

        {wantBenefitsSheet ? (
          <div className="aco-offer-preview-sheet-break mt-8 print:mt-0">
            <div className="shadow-xl ring-1 ring-slate-900/10 print:shadow-none">
              {benefitsTemplateIsPartner ? (
                <AdminBenefitsPartnerA4 company={company} />
              ) : (
                <AdminBenefitsClientA4 company={company} />
              )}
            </div>
          </div>
        ) : null}
        </div>
      </div>

      {!isGenerate ? (
        <p className="mt-4 text-center text-xs text-slate-400 print:hidden">{t.footerDisclaimer}</p>
      ) : null}
    </div>
  )
}

export function CommercialOfferPdfGenerateSession({
  draft,
  technicalOfferSheetSlots,
  offerId,
  onGenerated,
  onError,
}: {
  draft: CommercialOfferDraftV1
  technicalOfferSheetSlots: CommercialOfferTechnicalSheetSlot[]
  offerId?: string
  onGenerated: (offerNumber: string) => void
  onError: (message: string) => void
}) {
  return (
    <div
      aria-hidden
      className="fixed -left-[10000px] top-0 w-[960px] overflow-hidden opacity-0 pointer-events-none"
    >
      <CommercialOfferPreviewCore
        draft={draft}
        technicalOfferSheetSlots={technicalOfferSheetSlots}
        mode="generate"
        offerId={offerId}
        onGenerated={onGenerated}
        onGenerateError={onError}
      />
    </div>
  )
}

export default function AdminOfferCommercialPreview() {
  const { state } = useLocation()
  const { draft, technicalOfferSheetSlots } = parseCommercialOfferPreviewState(state)
  const emptyT = getCommercialOfferTemplateStrings('ro')

  if (!draft) {
    return (
      <div className="p-6 sm:p-8 lg:p-10 max-w-2xl mx-auto font-['Inter']">
        <h1 className="text-xl font-bold text-slate-900 mb-2">{emptyT.emptyStateTitle}</h1>
        <p className="text-sm text-slate-600 mb-6">{emptyT.emptyStateBody}</p>
        <Link
          to="/admin/oferte/noua"
          className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          {emptyT.emptyStateBack}
        </Link>
      </div>
    )
  }

  return (
    <CommercialOfferPreviewCore
      draft={draft}
      technicalOfferSheetSlots={technicalOfferSheetSlots}
      mode="preview"
    />
  )
}
