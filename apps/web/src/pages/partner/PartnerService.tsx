import { Fragment, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Check,
  CheckCircle2,
  Clock,
  Headphones,
  AlertTriangle,
  Activity,
  Eye,
  Info,
  Loader2,
  Package,
  Plus,
  ScanLine,
  Search,
  ShieldCheck,
  Truck,
  Wrench,
} from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getPartnerServiceTranslations } from '../../i18n/partner/service'
import type { PartnerServiceTranslations } from '../../i18n/partner/service'
import type { LangCode } from '../../i18n/menu'
import {
  WAREHOUSE_SN_BODY_DIGITS,
  WAREHOUSE_SN_FACTORY_PREFIX,
  createPartnerServiceRequest,
  getPartnerProfile,
  getPartnerServiceRequests,
  isServiceRequestActive,
  isValidWarehouseSerialNumber,
  lookupPartnerServiceProduct,
  partnerDiscountConfigured,
  normalizeWarehouseSerialNumber,
  type PartnerServiceProductLookup,
  type ServiceRequestDto,
} from '../../lib/api'
import { PartnerContractSigningBanner } from '../../components/partner/PartnerContractSigningBanner'
import './partner-service.css'

const SERVICE_ADVANTAGE_ICONS = [Headphones, AlertTriangle, Wrench, Activity, ShieldCheck, Truck] as const
const SERVICE_GREEN_BENEFIT_INDEX = 4

function serviceBenefitBorderClass(index: number): string {
  if (index === 0) return 'border-t-0'
  if (index === 1) return 'border-t border-[#eff2f8] sm:border-t-0'
  return 'border-t border-[#eff2f8]'
}

function requestStatusLabel(tr: PartnerServiceTranslations, status: string): string {
  switch (status) {
    case 'open':
      return tr.requestStatusOpen
    case 'in_progress':
      return tr.requestStatusInProgress
    case 'resolved':
      return tr.requestStatusResolved
    case 'closed':
      return tr.requestStatusClosed
    default:
      return status
  }
}

function requestStatusClass(status: string): string {
  switch (status) {
    case 'open':
      return 'bg-sky-100 text-sky-900'
    case 'in_progress':
      return 'bg-amber-100 text-amber-900'
    case 'resolved':
      return 'bg-emerald-100 text-emerald-900'
    case 'closed':
      return 'bg-slate-200 text-slate-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

function PreDiscountServicePanel({ tr }: { tr: PartnerServiceTranslations }) {
  return (
    <section
      className="w-full min-w-0 self-start overflow-hidden rounded-[20px] border border-[#e6eaf2] bg-white shadow-[0_10px_30px_rgba(16,24,48,0.06)]"
      aria-labelledby="partner-pre-discount-service-heading"
    >
      <div className="px-6 pb-1 pt-4">
        <h2
          id="partner-pre-discount-service-heading"
          className="mb-[7px] text-[21px] font-bold tracking-[-0.015em] text-[#0a0e1a] font-['Inter']"
        >
          {tr.preDiscountSectionTitle}
        </h2>
        <p className="m-0 max-w-[560px] text-[13.5px] leading-[1.55] text-[#6b7488] font-['Inter']">
          {tr.preDiscountSectionIntro}
        </p>
      </div>

      <div
        className="relative mx-6 mb-1.5 mt-[18px] overflow-hidden rounded-2xl px-5 py-[18px] text-white"
        style={{
          background: 'radial-gradient(120% 140% at 100% 0%, #1e46b4 0%, #142a6e 45%, #0a1230 100%)',
        }}
      >
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9fb2ff] font-['Inter']">
          {tr.preDiscountHeroTitle}
        </p>
        <p className="mb-[13px] max-w-[520px] text-[13px] leading-[1.5] text-[#dde4fb] font-['Inter']">
          {tr.preDiscountHeroBodyPrefix}
          <strong className="font-semibold text-white">{tr.preDiscountHeroBodyHighlight}</strong>
          {tr.preDiscountHeroBodySuffix}
        </p>
        <div className="mb-3.5 flex items-center gap-[9px] rounded-[10px] border border-white/15 bg-white/10 px-3 py-[9px]">
          <span
            className="h-2 w-2 shrink-0 rounded-full bg-[#34e0a8] shadow-[0_0_0_3px_rgba(52,224,168,0.2)]"
            aria-hidden
          />
          <p className="m-0 min-w-0 truncate font-mono text-xs text-[#eaf0ff]">
            {tr.preDiscountTicketChipId} · {tr.preDiscountTicketChipProduct} ·{' '}
            <span className="text-[#34e0a8]">{tr.preDiscountTicketChipStatus}</span>
          </p>
        </div>
        <Link
          to="/partner/produse"
          className="inline-flex items-center gap-2 rounded-[10px] bg-white px-[17px] py-[11px] text-[13px] font-bold text-[#0a0e1a] transition hover:-translate-y-px font-['Inter']"
        >
          <Plus className="h-[15px] w-[15px] shrink-0" strokeWidth={2.2} aria-hidden />
          {tr.preDiscountHeroCta}
        </Link>
      </div>

      <ul className="grid grid-cols-1 gap-x-[26px] px-6 pb-[22px] pt-[14px] sm:grid-cols-2">
        {tr.preDiscountAdvantages.map((adv, index) => {
          const Icon = SERVICE_ADVANTAGE_ICONS[index] ?? ShieldCheck
          const isGreen = index === SERVICE_GREEN_BENEFIT_INDEX
          return (
            <li key={adv.title} className={`flex gap-[13px] py-[13px] ${serviceBenefitBorderClass(index)}`}>
              <span
                className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] ${
                  isGreen ? 'bg-[#e8f7f0] text-[#15a05f]' : 'bg-[#eef2fe] text-[#1e46b4]'
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.9} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[13.5px] font-bold leading-[1.2] text-[#0a0e1a] font-['Inter']">{adv.title}</p>
                <p className="mt-[3px] text-[11.5px] leading-[1.45] text-[#6b7488] font-['Inter']">{adv.subtitle}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function RepairTicketPreview({ tr }: { tr: PartnerServiceTranslations }) {
  return (
    <aside className="min-w-0 max-w-full lg:sticky lg:top-8 lg:z-10 lg:self-start">
      <div className="mb-[11px] flex items-center gap-[7px] text-[12.5px] text-[#6b7488] font-['Inter']">
        <Eye className="h-[15px] w-[15px] shrink-0 text-[#9aa3b5]" strokeWidth={1.9} aria-hidden />
        <span className="font-semibold">{tr.preDiscountPreviewHeading}</span>
      </div>

      <div className="overflow-hidden rounded-[18px] border border-[#e6eaf2] bg-white shadow-[0_12px_30px_rgba(16,24,48,0.07)]">
        <div className="flex items-center justify-between border-b border-[#eff2f8] px-[17px] py-[15px]">
          <span className="font-mono text-[13px] font-bold text-[#0a0e1a] font-['Inter']">
            {tr.preDiscountPreviewTicketId}
          </span>
          <span className="flex items-center gap-1.5 rounded-[20px] bg-[#fdf2e2] px-[11px] py-1 text-[11px] font-bold text-[#e8920c] font-['Inter']">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e8920c]" aria-hidden />
            {tr.preDiscountPreviewStatus}
          </span>
        </div>

        <div className="px-[17px] py-[15px]">
          <div className="mb-[13px] flex gap-[11px]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[#e6eaf2] bg-[#f6f8fc] text-[#9aa3b5]">
              <Package className="h-[22px] w-[22px] shrink-0" strokeWidth={1.6} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-[12.5px] font-bold leading-[1.25] text-[#0a0e1a] font-['Inter']">
                {tr.preDiscountPreviewProductName}
              </p>
              <p className="mt-0.5 font-mono text-[10.5px] text-[#9aa3b5] font-['Inter']">
                {tr.preDiscountPreviewProductSn}
              </p>
            </div>
          </div>

          <div className="mb-[15px] rounded-[10px] border border-[#e6eaf2] bg-[#f6f8fc] px-3 py-2.5 text-[11.5px] leading-relaxed text-[#6b7488] font-['Inter']">
            <strong className="font-semibold text-[#0a0e1a]">{tr.preDiscountPreviewIssueLabel}</strong>{' '}
            {tr.preDiscountPreviewIssueText}
          </div>

          <ol className="m-0 list-none p-0">
            {tr.preDiscountTimelineSteps.map((step, index) => {
              const isDone = step.state === 'done'
              const isCurrent = step.state === 'current'
              const isTodo = step.state === 'todo'
              const isLast = index === tr.preDiscountTimelineSteps.length - 1

              return (
                <li key={step.label} className={`relative flex gap-[11px] ${isLast ? '' : 'pb-[13px]'}`}>
                  {!isLast ? (
                    <span
                      className={`absolute bottom-0 left-[9px] top-[21px] w-0.5 ${
                        isDone ? 'bg-[#15a05f]' : 'bg-[#e6eaf2]'
                      }`}
                      aria-hidden
                    />
                  ) : null}
                  <span
                    className={`relative z-[1] flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      isDone
                        ? 'border-[#15a05f] bg-[#15a05f] text-white'
                        : isCurrent
                          ? 'border-[#e8920c] bg-[#e8920c] shadow-[0_0_0_4px_#fdf2e2]'
                          : 'border-[#e6eaf2] bg-white'
                    }`}
                  >
                    {isDone ? <Check className="h-[11px] w-[11px] shrink-0" strokeWidth={3} aria-hidden /> : null}
                  </span>
                  <div className="min-w-0 pt-px">
                    <p
                      className={`text-[12.5px] font-['Inter'] ${
                        isTodo ? 'font-medium text-[#9aa3b5]' : 'font-semibold text-[#0a0e1a]'
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.sub ? (
                      <p className="mt-px text-[10.5px] text-[#6b7488] font-['Inter']">{step.sub}</p>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>

      <p className="mx-0.5 mt-[11px] text-[11px] leading-[1.5] text-[#9aa3b5] font-['Inter']">
        {tr.preDiscountPreviewFoot}
      </p>
    </aside>
  )
}

function ServiceEmptyStateSkeleton({ ariaLabel }: { ariaLabel: string }) {
  return (
    <div
      className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm pointer-events-none select-none"
      aria-busy="true"
      aria-label={ariaLabel}
    >
      <div className="mx-auto mb-4 h-16 w-16 animate-pulse rounded-2xl bg-slate-100" aria-hidden />
      <div className="mx-auto mb-3 h-6 w-48 max-w-full animate-pulse rounded-lg bg-slate-100" aria-hidden />
      <div className="mx-auto h-4 w-full max-w-md animate-pulse rounded bg-slate-100" aria-hidden />
      <div className="mx-auto mt-2 h-4 w-[85%] max-w-sm animate-pulse rounded bg-slate-100" aria-hidden />
    </div>
  )
}

function groupSnDisplay(digits: string): string {
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function snDigitsFromDisplay(value: string): string {
  return value.replace(/\D/g, '').slice(0, WAREHOUSE_SN_BODY_DIGITS)
}

function ServiceStepTracker({
  tr,
  currentStep,
}: {
  tr: PartnerServiceTranslations
  currentStep: 1 | 2 | 3
}) {
  const steps = [
    { n: 1 as const, small: tr.step1Small, label: tr.step1Label },
    { n: 2 as const, small: tr.step2Small, label: tr.step2Label },
    { n: 3 as const, small: tr.step3Small, label: tr.step3Label },
  ]

  return (
    <div className="ps-steps">
      {steps.map((step, index) => {
        const isActive = step.n === currentStep
        const isDone = step.n < currentStep
        return (
          <Fragment key={step.n}>
            {index > 0 ? <span className={`ps-step-line${isDone || isActive ? ' done' : ''}`} aria-hidden /> : null}
            <div className={`ps-step${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}>
              <span className="ps-step-num">{isDone ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : step.n}</span>
              <span className="ps-step-lbl">
                <small>{step.small}</small>
                <b>{step.label}</b>
              </span>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}

function PartnerServiceRequestPanel({ tr }: { tr: PartnerServiceTranslations }) {
  const [phase, setPhase] = useState<'sn' | 'details' | 'success'>('sn')
  const [snDisplay, setSnDisplay] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [snFieldError, setSnFieldError] = useState(false)
  const [hintWarn, setHintWarn] = useState(false)
  const [product, setProduct] = useState<PartnerServiceProductLookup | null>(null)
  const [problem, setProblem] = useState('')
  const [endClientName, setEndClientName] = useState('')
  const [productLocation, setProductLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createdRequest, setCreatedRequest] = useState<ServiceRequestDto | null>(null)
  const [recentRequests, setRecentRequests] = useState<ServiceRequestDto[]>([])
  const [recentLoading, setRecentLoading] = useState(true)

  const snDigits = snDigitsFromDisplay(snDisplay)
  const currentStep: 1 | 2 | 3 = phase === 'sn' ? 1 : phase === 'details' ? 2 : 3
  const activeCount = recentRequests.filter((r) => isServiceRequestActive(r)).length

  const loadRecent = useCallback(async () => {
    setRecentLoading(true)
    try {
      const rows = await getPartnerServiceRequests()
      setRecentRequests(rows)
    } catch {
      setRecentRequests([])
    } finally {
      setRecentLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRecent()
  }, [loadRecent])

  const resetForm = () => {
    setPhase('sn')
    setSnDisplay('')
    setLookupError(null)
    setSnFieldError(false)
    setHintWarn(false)
    setProduct(null)
    setProblem('')
    setEndClientName('')
    setProductLocation('')
    setSubmitError(null)
    setCreatedRequest(null)
  }

  const handleSnChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, WAREHOUSE_SN_BODY_DIGITS)
    setSnDisplay(groupSnDisplay(digits))
    setLookupError(null)
    setSnFieldError(false)
    setHintWarn(false)
    if (product && phase === 'sn') setProduct(null)
  }

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLookupError(null)
    if (snDigits.length !== WAREHOUSE_SN_BODY_DIGITS) {
      setHintWarn(true)
      setSnFieldError(true)
      window.setTimeout(() => setSnFieldError(false), 1200)
      return
    }
    const serial = normalizeWarehouseSerialNumber(`${WAREHOUSE_SN_FACTORY_PREFIX}${snDigits}`)
    if (!isValidWarehouseSerialNumber(serial)) {
      setLookupError(tr.stepSnInvalid)
      return
    }
    setLookupLoading(true)
    try {
      const found = await lookupPartnerServiceProduct(serial)
      setProduct(found)
      setPhase('details')
    } catch (err) {
      setProduct(null)
      setLookupError(err instanceof Error ? err.message : tr.stepSnNotFound)
    } finally {
      setLookupLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      const result = await createPartnerServiceRequest({
        serialNumber: product.serialNumber,
        problemDescription: problem.trim(),
        endClientName: endClientName.trim() || undefined,
        productLocation: productLocation.trim(),
      })
      if (!result.ok) {
        if (result.code === 'already_active') {
          setSubmitError(`${tr.activeRequestWarning} ${result.request.requestNumber}`)
        } else {
          setSubmitError(result.error)
        }
        return
      }
      setCreatedRequest(result.request)
      setPhase('success')
      void loadRecent()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Eroare.')
    } finally {
      setSubmitting(false)
    }
  }

  const productImage = product?.imageUrl || null
  const snReady = snDigits.length === WAREHOUSE_SN_BODY_DIGITS

  return (
    <div className="partner-service ps-grid">
      <section className="ps-card" aria-label={tr.formTitle}>
        <ServiceStepTracker tr={tr} currentStep={currentStep} />

        <div className="ps-card-pad">
          {phase === 'success' && createdRequest ? (
            <div className="ps-success">
              <div className="ps-success-icon">
                <CheckCircle2 className="h-9 w-9" strokeWidth={1.5} aria-hidden />
              </div>
              <h1 className="ps-title">{tr.successTitle}</h1>
              <p className="ps-subtitle" style={{ margin: '0 auto', textAlign: 'center' }}>
                {tr.successBody}
              </p>
              <p className="ps-success-id">{createdRequest.requestNumber}</p>
              <div className="ps-actions" style={{ justifyContent: 'center', marginTop: 28 }}>
                <button type="button" className="ps-btn ready" onClick={resetForm}>
                  {tr.successNewRequest}
                </button>
              </div>
            </div>
          ) : phase === 'details' && product ? (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
                <h1 className="ps-title">{tr.stepDetailsTitle}</h1>
                <button
                  type="button"
                  className="ps-change-sn"
                  onClick={() => {
                    setPhase('sn')
                    setSubmitError(null)
                  }}
                >
                  {tr.stepDetailsChangeSn}
                </button>
              </div>
              <p className="ps-subtitle">{tr.formIntro}</p>

              <div className="ps-product-card">
                <div className="ps-product-thumb">
                  {productImage ? (
                    <img src={productImage} alt="" />
                  ) : (
                    <Package className="h-6 w-6 text-[#98a0b2]" aria-hidden />
                  )}
                </div>
                <div className="min-w-0">
                  <b className="block text-sm">{product.productTitle}</b>
                  <span className="ps-mono mt-1 block text-xs text-[#5b6477]">{product.serialNumber}</span>
                  {product.modelNumber ? (
                    <span className="mt-0.5 block text-xs text-[#98a0b2]">{product.modelNumber}</span>
                  ) : null}
                </div>
              </div>

              <div className="ps-field-block">
                <label htmlFor="partner-service-problem" className="ps-field-label">
                  {tr.fieldProblemLabel}
                </label>
                <textarea
                  id="partner-service-problem"
                  required
                  rows={4}
                  maxLength={2000}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder={tr.fieldProblemPlaceholder}
                  className="ps-textarea"
                />
              </div>

              <div className="ps-field-block">
                <label htmlFor="partner-service-client" className="ps-field-label">
                  {tr.fieldClientNameLabel}{' '}
                  <span className="ps-optional">({tr.fieldClientNameOptional})</span>
                </label>
                <input
                  id="partner-service-client"
                  type="text"
                  maxLength={200}
                  value={endClientName}
                  onChange={(e) => setEndClientName(e.target.value)}
                  placeholder={tr.fieldClientNamePlaceholder}
                  className="ps-input"
                />
              </div>

              <div className="ps-field-block">
                <label htmlFor="partner-service-location" className="ps-field-label">
                  {tr.fieldLocationLabel}
                </label>
                <input
                  id="partner-service-location"
                  type="text"
                  required
                  maxLength={500}
                  value={productLocation}
                  onChange={(e) => setProductLocation(e.target.value)}
                  placeholder={tr.fieldLocationPlaceholder}
                  className="ps-input"
                />
              </div>

              {submitError ? (
                <p className="ps-alert" role="alert">
                  {submitError}
                </p>
              ) : null}

              <div className="ps-actions">
                <button
                  type="submit"
                  disabled={submitting || problem.trim().length < 3 || !productLocation.trim()}
                  className={`ps-btn${!submitting ? ' ready' : ''}`}
                >
                  {submitting ? <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden /> : null}
                  {submitting ? tr.submittingRequest : tr.submitRequest}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLookup}>
              <h1 className="ps-title">{tr.formTitle}</h1>
              <p className="ps-subtitle">{tr.formIntro}</p>

              <label className="ps-field-label" htmlFor="partner-service-sn">
                {tr.stepSnLabel} <span className="ps-field-pin">{tr.snFormatPin}</span>
              </label>

              <div className={`ps-scanfield${snFieldError ? ' ps-scanfield--error' : ''}`}>
                <span className="ps-scanline" aria-hidden />
                <span className="ps-prefix ps-mono">{WAREHOUSE_SN_FACTORY_PREFIX}</span>
                <input
                  id="partner-service-sn"
                  className="ps-mono"
                  inputMode="numeric"
                  autoComplete="off"
                  spellCheck={false}
                  value={snDisplay}
                  onChange={(e) => handleSnChange(e.target.value)}
                  placeholder="0000 0000 0000 0000"
                  aria-describedby="partner-service-sn-help"
                />
                <span className="ps-scan-icon" aria-hidden>
                  <ScanLine className="h-5 w-5" strokeWidth={1.7} />
                </span>
              </div>

              <div className="ps-helper" id="partner-service-sn-help">
                <button type="button" className="ps-helper-link" onClick={() => window.open('/intrebari-frecvente', '_blank')}>
                  <Info className="h-[15px] w-[15px]" strokeWidth={1.8} aria-hidden />
                  {tr.whereFindSn}
                </button>
                <span className="ps-counter">
                  {snReady ? (
                    <b>{tr.snCounterComplete}</b>
                  ) : (
                    tr.snCounter.replace('{n}', String(snDigits.length))
                  )}
                </span>
              </div>

              <div className="ps-actions">
                <button
                  type="submit"
                  disabled={lookupLoading}
                  className={`ps-btn${snReady && !lookupLoading ? ' ready' : ''}`}
                >
                  {lookupLoading ? (
                    <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden />
                  ) : (
                    <Search className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                  )}
                  {lookupLoading ? tr.stepSnSearching : tr.stepSnSearch}
                </button>
                <span className={`ps-hint-inline${hintWarn ? ' ps-hint-inline--warn' : ''}`}>
                  {hintWarn ? tr.snIncompleteHint : tr.snHintInline}
                </span>
              </div>

              {lookupError ? (
                <p className="ps-alert" role="alert">
                  {lookupError}
                </p>
              ) : null}

              {product && phase === 'sn' ? (
                <div className="ps-result">
                  <span className="ps-result-ok">
                    <Check className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden />
                  </span>
                  <span className="ps-result-txt">
                    <b>{tr.productFoundTitle}</b>
                    <span>{tr.productFoundSubtitle}</span>
                  </span>
                </div>
              ) : null}
            </form>
          )}
        </div>
      </section>

      <aside className="ps-card" aria-label={tr.recentRequestsTitle}>
        <div className="ps-side-head">
          <b>{tr.recentRequestsTitle}</b>
          <span className="ps-badge">{tr.activeRequestsBadge.replace('{n}', String(activeCount))}</span>
        </div>
        {recentLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#98a0b2]" aria-hidden />
          </div>
        ) : recentRequests.length === 0 ? (
          <div className="ps-empty">
            <div className="ps-empty-ill" aria-hidden>
              <Clock className="h-7 w-7" strokeWidth={1.7} />
            </div>
            <p>{tr.recentEmptyTitle}</p>
            <span>{tr.recentEmptyBody}</span>
          </div>
        ) : (
          <ul className="m-0 list-none p-0">
            {recentRequests.slice(0, 8).map((row) => (
              <li key={row.id} className="ps-req-row">
                <div className="flex items-start justify-between gap-2">
                  <p className="ps-mono text-xs font-bold text-[#0a0e1a]">{row.requestNumber}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${requestStatusClass(row.status)}`}
                  >
                    {requestStatusLabel(tr, row.status)}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-[#5b6477]">{row.productTitle}</p>
                <p className="ps-mono mt-0.5 text-[10px] text-[#98a0b2]">{row.serialNumber}</p>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  )
}

export default function PartnerService() {
  const { language } = useLanguage()
  const tr = getPartnerServiceTranslations(language.code as LangCode)
  const [loading, setLoading] = useState(true)
  const [discountPercent, setDiscountPercent] = useState<number | null>(null)
  const [partnerContractSignedAt, setPartnerContractSignedAt] = useState<string | null>(null)

  const reloadProfile = useCallback(() => {
    return getPartnerProfile()
      .then((p) => {
        setDiscountPercent(p?.partnerDiscountPercent ?? null)
        setPartnerContractSignedAt(
          typeof p?.partnerContractSignedAt === 'string' && p.partnerContractSignedAt.trim()
            ? p.partnerContractSignedAt
            : null,
        )
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    reloadProfile().finally(() => setLoading(false))
  }, [reloadProfile])

  const discountConfigured = partnerDiscountConfigured(discountPercent)
  const contractSigned = Boolean(String(partnerContractSignedAt ?? '').trim())

  const preDiscountPreview = (
    <div className="grid min-w-0 max-w-full auto-rows-min grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,800px)_minmax(0,340px)] xl:grid-cols-[minmax(0,820px)_minmax(0,360px)] lg:gap-8">
      <div className="flex min-w-0 flex-col gap-5 self-start">
        {!contractSigned && discountConfigured ? (
          <PartnerContractSigningBanner onSigned={reloadProfile} className="mt-0" />
        ) : null}
        <PreDiscountServicePanel tr={tr} />
      </div>
      <RepairTicketPreview tr={tr} />
    </div>
  )

  if (loading) {
    return (
      <div className="partner-service p-6 sm:p-8 lg:p-10 bg-[#f5f6f9]">
        <ServiceEmptyStateSkeleton ariaLabel={tr.loadingAria} />
      </div>
    )
  }

  if (!contractSigned || !discountConfigured) {
    return (
      <div className="relative z-0 box-border block !min-h-min min-w-0 w-full max-w-full shrink-0 bg-[#f5f5f7] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:pb-10 lg:pt-10">
        {preDiscountPreview}
      </div>
    )
  }

  return (
    <div className="partner-service relative z-0 box-border block !min-h-min min-w-0 w-full max-w-full shrink-0 bg-[#f5f6f9] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:pb-10 lg:pt-8">
      <PartnerServiceRequestPanel tr={tr} />
    </div>
  )
}
