import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Building2,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  MapPin,
  Truck,
  UserCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useCatalogCurrency } from '../../contexts/CatalogCurrencyContext'
import { getGuestCheckoutTranslations } from '../../i18n/guest-checkout'
import type { LangCode } from '../../i18n/menu'
import { getPartnerCheckoutTranslations } from '../../i18n/partner/checkout'
import { getProductPricingTranslations } from '../../i18n/product-pricing'
import {
  getPartnerProfile,
  getProducts,
  getProductCardImageUrl,
  submitGuestResidentialOrder,
  getAuthEmail,
  getPartnerCatalogSaleUnitNumeric,
  getPartnerCatalogVatPercentForDisplay,
  type PublicProduct,
} from '../../lib/api'
import {
  clearPartnerCartStorage,
  hydratePartnerCartFromProducts,
  readPartnerCartFromStorage,
  type PartnerCartItem,
} from '../../lib/partnerCart'
import { ROMANIAN_COUNTIES, getCitiesForCounty } from '../../lib/romanian-counties-cities'
import {
  sanitizeAddressField,
  sanitizeRoPostalCode,
  sanitizePersonName,
  loadPhoneE164,
  isPhoneE164Valid,
  isRoPostalCodeValid,
} from '../../lib/formInputSanitize'
import PhoneInput from '../../components/PhoneInput'

function sanitizeCuiTyping(value: string): string {
  return String(value ?? '')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
}

type CheckoutStep = 1 | 2 | 3 | 4

/** Matches GuestCheckout input styling */
const inputClassBase =
  'h-12 w-full rounded-xl bg-white px-3.5 text-sm font-[\'Inter\'] text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2'

const inputClass = `${inputClassBase} border border-slate-200 focus:border-slate-900 focus:ring-slate-900/10`


const selectClass = `${inputClassBase} cursor-pointer appearance-none border border-slate-200 pr-10 focus:border-slate-900 focus:ring-slate-900/10`

const checkoutBackButtonClass =
  'rounded-xl border border-transparent bg-transparent px-4 text-sm font-semibold text-slate-800 transition hover:bg-black/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15'

function catalogNetAfterPartnerPct(net: number, partnerDiscountPct: number | null): number {
  const pct = partnerDiscountPct != null && partnerDiscountPct > 0 ? partnerDiscountPct : 0
  if (pct <= 0 || Number.isNaN(net)) return net
  const f = Math.min(1, Math.max(0, pct / 100))
  return net * (1 - f)
}

function unitInclAfterPartnerDiscount(product: PublicProduct, partnerDiscountPct: number | null): number | null {
  const nu = getPartnerCatalogSaleUnitNumeric(product)
  if (Number.isNaN(nu)) return null
  const unitNet = catalogNetAfterPartnerPct(nu, partnerDiscountPct)
  const vpc = getPartnerCatalogVatPercentForDisplay(product)
  const unitIncl = vpc != null && vpc > 0 ? unitNet * (1 + vpc / 100) : unitNet
  return unitIncl
}

function lineTotalInclVatDisplay(product: PublicProduct, qty: number, partnerDiscountPct: number | null): number | null {
  const unitIncl = unitInclAfterPartnerDiscount(product, partnerDiscountPct)
  if (unitIncl == null) return null
  return Math.round(unitIncl * qty)
}

function computeOrderTotalDisplay(items: PartnerCartItem[], partnerDiscountPct: number | null): number {
  let sum = 0
  for (const { product, quantity } of items) {
    const line = lineTotalInclVatDisplay(product, quantity, partnerDiscountPct)
    if (line != null) sum += line
  }
  return sum
}

export default function PartnerCheckout() {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const lang = language.code as LangCode
  const tr = getGuestCheckoutTranslations(lang)
  const trPartner = getPartnerCheckoutTranslations(lang)
  const { currency } = useCatalogCurrency()
  const p = getProductPricingTranslations(lang, currency)

  const locale = lang === 'en' ? 'en-GB' : 'ro-RO'
  const fmtMoney = (n: number) => n.toLocaleString(locale, { maximumFractionDigits: 0, minimumFractionDigits: 0 })

  const partnerBadge = trPartner.partnerBadge
  const partnerSubline = trPartner.partnerSubline
  const partnerCheckoutStepTitles = trPartner.stepTitles

  const [activeStep, setActiveStep] = useState<CheckoutStep>(1)
  const [maxReachedStep, setMaxReachedStep] = useState<CheckoutStep>(1)

  const goToStep = useCallback((step: CheckoutStep) => {
    setActiveStep(step)
    requestAnimationFrame(() => {
      const el = document.getElementById(`partner-checkout-accordion-trigger-${step}`)
      if (el) {
        const offset = 72
        const top = el.getBoundingClientRect().top + window.scrollY - offset
        window.scrollTo({ top, behavior: 'smooth' })
      }
    })
  }, [])

  const [products, setProducts] = useState<PublicProduct[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [cartItems, setCartItems] = useState<PartnerCartItem[]>([])
  const [cartHydrated, setCartHydrated] = useState(false)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [partnerDiscountPct, setPartnerDiscountPct] = useState<number | null>(null)

  const [nume, setNume] = useState('')
  const [prenume, setPrenume] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyCui, setCompanyCui] = useState('')
  const [fiscalAddress, setFiscalAddress] = useState('')
  const [fiscalCounty, setFiscalCounty] = useState('')
  const [fiscalCity, setFiscalCity] = useState('')
  const [fiscalPostal, setFiscalPostal] = useState('')
  const [delAddress, setDelAddress] = useState('')
  const [delCounty, setDelCounty] = useState('')
  const [delCity, setDelCity] = useState('')
  const [delPostal, setDelPostal] = useState('')

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [successOrderNumber, setSuccessOrderNumber] = useState<string | null>(null)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setCatalogLoading(false))
  }, [])

  useEffect(() => {
    if (catalogLoading) return
    const stored = readPartnerCartFromStorage()
    if (stored.length === 0) {
      navigate('/partner/produse', { replace: true })
      return
    }
    if (products.length === 0) {
      setCartHydrated(true)
      setCartItems([])
      return
    }
    const hydrated = hydratePartnerCartFromProducts(products, stored)
    setCartItems(hydrated)
    setCartHydrated(true)
    if (hydrated.length === 0) {
      navigate('/partner/produse', { replace: true })
    }
  }, [catalogLoading, products, navigate])

  useEffect(() => {
    getPartnerProfile()
      .then((prof) => {
        setPartnerDiscountPct(
          prof.partnerDiscountPercent != null && Number.isFinite(Number(prof.partnerDiscountPercent))
            ? Number(prof.partnerDiscountPercent)
            : null,
        )
        setNume(sanitizePersonName(prof.contactLastName || '') || '')
        setPrenume(sanitizePersonName(prof.contactFirstName || '') || '')
        setPhone(loadPhoneE164(prof.phone))
        setCompanyName(String(prof.companyName || '').trim())
        setCompanyCui(sanitizeCuiTyping(String(prof.cui || '')))
        const fa = String(prof.companyStreet || prof.address || '').trim()
        setFiscalAddress(fa)
        setFiscalCounty(String(prof.companyCounty || '').trim())
        setFiscalCity(String(prof.companyCity || '').trim())
        setFiscalPostal(String(prof.companyPostalCode || '').trim())
        setDelAddress(String(prof.deliveryStreet ?? '').trim())
        setDelCounty(String(prof.deliveryCounty ?? '').trim())
        setDelCity(String(prof.deliveryCity ?? '').trim())
        setDelPostal(String(prof.deliveryPostalCode ?? '').trim())
      })
      .catch(() => {})
      .finally(() => setProfileLoaded(true))
  }, [])

  const fiscalCities = useMemo(() => getCitiesForCounty(fiscalCounty), [fiscalCounty])
  const delCities = useMemo(() => getCitiesForCounty(delCounty), [delCounty])

  const orderTotalDisplay = useMemo(
    () => computeOrderTotalDisplay(cartItems, partnerDiscountPct),
    [cartItems, partnerDiscountPct],
  )

  const cartSummaryVatLabel = useMemo(() => {
    if (cartItems.length === 0) return null
    const rates: number[] = []
    for (const { product } of cartItems) {
      const v = getPartnerCatalogVatPercentForDisplay(product)
      if (v != null && v > 0) rates.push(v)
    }
    if (rates.length === 0) return null
    const uniq = [...new Set(rates.map((n) => Math.round(n * 100) / 100))]
    if (uniq.length === 1) {
      const pct = uniq[0]
      const pctDisp = Number.isInteger(pct) ? String(pct) : String(pct).replace(/\.0+$/, '')
      return tr.priceIncludesVatPercent.replace('{pct}', pctDisp)
    }
    return tr.priceIncludesVatMixed
  }, [cartItems, tr])

  const checkoutReady = cartItems.length > 0
  const emailFromAccount = getAuthEmail() || ''

  const validateContactFields = (): string | null => {
    if (!sanitizePersonName(nume) || !sanitizePersonName(prenume)) {
      return tr.fieldErrorRequired
    }
    if (!isPhoneE164Valid(phone)) {
      return tr.fieldErrorPhone
    }
    return null
  }

  const validateBillingFields = (): string | null => {
    const cuiClean = companyCui.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    if (!companyName.trim() || !cuiClean || !fiscalAddress.trim() || !fiscalCounty || !fiscalCity.trim() || !fiscalPostal.trim()) {
      return tr.fieldErrorRequired
    }
    if (!isRoPostalCodeValid(fiscalPostal)) {
      return tr.fieldErrorPostal
    }
    return null
  }

  function validateDeliveryFields(): string | null {
    if (!delAddress.trim() || !delCounty || !delCity.trim() || !delPostal.trim()) {
      return tr.fieldErrorRequired
    }
    if (!isRoPostalCodeValid(delPostal)) {
      return tr.fieldErrorPostal
    }
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    const cuiClean = companyCui.replace(/[^A-Za-z0-9]/g, '').toUpperCase()

    if (!emailFromAccount.trim()) {
      setSubmitError(trPartner.invalidSession)
      return
    }
    if (!isPhoneE164Valid(phone)) {
      setSubmitError(tr.fieldErrorPhone)
      return
    }
    if (!sanitizePersonName(nume) || !sanitizePersonName(prenume)) {
      setSubmitError(tr.fieldErrorRequired)
      return
    }
    if (!companyName.trim() || !cuiClean || !fiscalAddress.trim() || !fiscalCounty || !fiscalCity.trim() || !fiscalPostal.trim()) {
      setSubmitError(tr.fieldErrorRequired)
      return
    }
    if (!isRoPostalCodeValid(fiscalPostal)) {
      setSubmitError(tr.fieldErrorPostal)
      return
    }
    if (!delAddress.trim() || !delCounty || !delCity.trim() || !delPostal.trim()) {
      setSubmitError(tr.fieldErrorRequired)
      return
    }
    if (!isRoPostalCodeValid(delPostal)) {
      setSubmitError(tr.fieldErrorPostal)
      return
    }

    setSubmitLoading(true)
    try {
      const result = await submitGuestResidentialOrder({
        items: cartItems.map(({ product, quantity }) => ({
          productIdOrSlug: product.id,
          quantity,
        })),
        email: emailFromAccount.trim(),
        phone: phone,
        nume: sanitizePersonName(nume),
        prenume: sanitizePersonName(prenume),
        buyerType: 'company',
        companyName: companyName.trim(),
        companyCui: cuiClean,
        companyAddress: fiscalAddress.trim(),
        companyCounty: fiscalCounty.trim(),
        companyCity: fiscalCity.trim(),
        companyPostal: fiscalPostal.trim(),
        billAddress: delAddress.trim(),
        billCounty: delCounty.trim(),
        billCity: delCity.trim(),
        billPostal: delPostal.trim(),
        differentDeliveryAddress: true,
        delAddress: delAddress.trim(),
        delCounty: delCounty.trim(),
        delCity: delCity.trim(),
        delPostal: delPostal.trim(),
      })
      clearPartnerCartStorage()
      setSuccessOrderNumber(result.orderNumber)
      setActiveStep(4)
      setMaxReachedStep(4)
      goToStep(4)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : tr.placeOrderErrorGeneric)
    } finally {
      setSubmitLoading(false)
    }
  }

  const steps: { id: CheckoutStep; panelTitle: string; icon: LucideIcon }[] = [
    { id: 1, panelTitle: partnerCheckoutStepTitles[0], icon: UserCircle },
    { id: 2, panelTitle: partnerCheckoutStepTitles[1], icon: Building2 },
    { id: 3, panelTitle: partnerCheckoutStepTitles[2], icon: MapPin },
    { id: 4, panelTitle: partnerCheckoutStepTitles[3], icon: CheckCircle },
  ]

  const orderSummaryAside: ReactNode = (
    <aside className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6">
      <p className="m-0 text-[0.7rem] font-bold uppercase tracking-widest text-slate-500 font-['Inter']">{tr.cartItemsHeading}</p>
      <ul className="mt-3 divide-y divide-slate-100">
        {cartItems.map(({ product, quantity }) => {
          const img = getProductCardImageUrl(product)
          const unitIncl = unitInclAfterPartnerDiscount(product, partnerDiscountPct)
          const lineTotalIncl = lineTotalInclVatDisplay(product, quantity, partnerDiscountPct)
          const lineVatPct = getPartnerCatalogVatPercentForDisplay(product)
          const lineVatPctDisp =
            lineVatPct != null && lineVatPct > 0
              ? Number.isInteger(lineVatPct)
                ? String(lineVatPct)
                : String(lineVatPct).replace(/\.0+$/, '')
              : null
          return (
            <li key={product.id} className="flex gap-3 py-3 first:pt-0">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/80 ring-1 ring-slate-200/80">
                <img src={img} alt="" className="h-full w-full object-contain p-1.5" loading="lazy" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="m-0 line-clamp-2 text-xs font-semibold leading-snug text-slate-900 font-['Inter']">{product.title}</p>
                <p className="mt-1 text-[11px] text-slate-500 font-['Inter']">
                  {quantity} ×{' '}
                  {unitIncl != null ? `${fmtMoney(Math.round(unitIncl))} ${p.currencySuffix}` : '—'}
                </p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400 font-['Inter']">
                  {lineVatPctDisp ? tr.cartLineTotalLabel.replace('{pct}', lineVatPctDisp) : tr.cartLineTotalLabelNoVat}
                </p>
              </div>
              {lineTotalIncl != null ? (
                <span className="shrink-0 text-xs font-bold tabular-nums text-slate-900 font-['Inter']">
                  {fmtMoney(lineTotalIncl)} {p.currencySuffix}
                </span>
              ) : null}
            </li>
          )
        })}
      </ul>

      <div className="mt-4 flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-100">
          <Truck className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">{tr.orderShippingLabel}</p>
          <p className="mt-0.5 text-xs font-semibold text-slate-900">{tr.orderShippingTitle}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="m-0 text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">{tr.orderShippingAmountLabel}</p>
          <p className="mt-1 text-sm font-extrabold tabular-nums text-slate-900">
            {fmtMoney(0)} {p.currencySuffix}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4 text-left">
        <p className="m-0 text-sm font-semibold text-slate-800">{tr.orderTotalLabel}</p>
        <p className="mt-2 font-['Inter'] text-2xl font-extrabold tabular-nums tracking-tight text-slate-900">
          {fmtMoney(orderTotalDisplay)} <span className="text-lg font-bold text-slate-600">{p.currencySuffix}</span>
        </p>
        {partnerDiscountPct != null && partnerDiscountPct > 0 ? (
          <p className="mt-2 text-xs leading-snug text-emerald-700 font-['Inter']">
            {trPartner.partnerDiscountApplied.replace('{pct}', String(partnerDiscountPct))}
          </p>
        ) : cartSummaryVatLabel ? (
          <p className="mt-2 text-xs leading-snug text-slate-500 font-['Inter']">{cartSummaryVatLabel}</p>
        ) : null}
      </div>

      <Link
        to="/partner/produse"
        className={`mt-5 inline-flex min-h-[44px] items-center justify-start no-underline ${checkoutBackButtonClass}`}
      >
        {tr.btnEditProductsStep1}
      </Link>
    </aside>
  )

  function stepBody(stepId: CheckoutStep): ReactNode {
    if (stepId === 1) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block min-w-0">
              <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldNume}</span>
              <input
                value={nume}
                onChange={(e) => setNume(sanitizePersonName(e.target.value))}
                className={inputClass}
                autoComplete="family-name"
                placeholder={tr.placeholderNume}
                required
              />
            </label>
            <label className="block min-w-0">
              <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldPrenume}</span>
              <input
                value={prenume}
                onChange={(e) => setPrenume(sanitizePersonName(e.target.value))}
                className={inputClass}
                autoComplete="given-name"
                placeholder={tr.placeholderPrenume}
                required
              />
            </label>
            <label className="block min-w-0 sm:col-span-2">
              <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldPhone}</span>
              <PhoneInput
                value={phone}
                onChange={setPhone}
                autoComplete="tel"
              />
            </label>
          </div>

          {submitError && activeStep === 1 ? (
            <div className="rounded-xl border border-red-200 bg-red-50/80 px-3 py-2.5" role="alert">
              <p className="m-0 text-sm font-medium text-red-800 font-['Inter']">{submitError}</p>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Link
              to="/partner/produse"
              onClick={() => setSubmitError(null)}
              className={`order-2 inline-flex min-h-[44px] items-center justify-center no-underline sm:order-1 ${checkoutBackButtonClass}`}
            >
              ← {tr.btnBackToCart}
            </Link>
            <button
              type="button"
              onClick={() => {
                const err = validateContactFields()
                if (err) {
                  setSubmitError(err)
                  return
                }
                setSubmitError(null)
                setMaxReachedStep((m) => (m < 2 ? 2 : m))
                goToStep(2)
              }}
              className="order-1 min-h-[48px] flex-1 rounded-xl bg-slate-900 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-slate-800 sm:order-2 sm:max-w-xs"
            >
              {tr.btnContinueStep2}
            </button>
          </div>
        </div>
      )
    }

    if (stepId === 2) {
      return (
        <div className="space-y-6">
          <p className="mb-0 text-sm leading-relaxed text-slate-700 font-['Inter']">{tr.companyInvoiceSectionTitle}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block min-w-0 sm:col-span-2">
              <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldCompanyName}</span>
              <input className={inputClass} value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            </label>
            <label className="block min-w-0">
              <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldCompanyCui}</span>
              <input
                className={inputClass}
                value={companyCui}
                onChange={(e) => setCompanyCui(sanitizeCuiTyping(e.target.value))}
                required
              />
            </label>
          </div>
          <label className="block min-w-0">
            <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldAddress}</span>
            <input
              className={inputClass}
              value={fiscalAddress}
              onChange={(e) => setFiscalAddress(sanitizeAddressField(e.target.value))}
              placeholder={tr.placeholderAddress}
              required
            />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="block min-w-0">
              <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldCounty}</span>
              <select
                className={selectClass}
                value={fiscalCounty}
                onChange={(e) => {
                  setFiscalCounty(e.target.value)
                  setFiscalCity('')
                }}
                required
              >
                <option value="">{tr.selectCountyPlaceholder}</option>
                {ROMANIAN_COUNTIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block min-w-0">
              <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldCity}</span>
              <select
                className={selectClass}
                value={fiscalCity}
                onChange={(e) => setFiscalCity(e.target.value)}
                required
                disabled={!fiscalCounty}
              >
                <option value="">{fiscalCounty ? tr.selectCityPlaceholder : tr.selectCityPlaceholderNeedCounty}</option>
                {fiscalCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block min-w-0">
              <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldPostal}</span>
              <input
                className={inputClass}
                value={fiscalPostal}
                onChange={(e) => setFiscalPostal(sanitizeRoPostalCode(e.target.value))}
                placeholder={tr.placeholderPostal}
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                required
              />
            </label>
          </div>

          {submitError && activeStep === 2 ? (
            <div className="rounded-xl border border-red-200 bg-red-50/80 px-3 py-2.5" role="alert">
              <p className="m-0 text-sm font-medium text-red-800 font-['Inter']">{submitError}</p>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => {
                setSubmitError(null)
                goToStep(1)
              }}
              className={`order-2 min-h-[44px] sm:order-1 ${checkoutBackButtonClass}`}
            >
              ←{' '}
              {trPartner.backToContact}
            </button>
            <button
              type="button"
              onClick={() => {
                const err = validateBillingFields()
                if (err) {
                  setSubmitError(err)
                  return
                }
                setSubmitError(null)
                setMaxReachedStep((m) => (m < 3 ? 3 : m))
                goToStep(3)
              }}
              className="order-1 min-h-[48px] flex-1 rounded-xl bg-slate-900 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-slate-800 sm:order-2 sm:max-w-xs"
            >
              {tr.btnContinueStep3}
            </button>
          </div>
        </div>
      )
    }

    if (stepId === 3) {
      return (
        <div className="space-y-6">
          <p className="text-sm leading-relaxed text-slate-700 font-['Inter']">{tr.addressIntroCompany}</p>
          <button
            type="button"
            className="text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-900 font-['Inter']"
            onClick={() => {
              setDelAddress(fiscalAddress)
              setDelCounty(fiscalCounty)
              setDelCity(fiscalCity)
              setDelPostal(fiscalPostal)
            }}
          >
            {trPartner.copyFromBilling}
          </button>
          <label className="block min-w-0">
            <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldAddress}</span>
            <input
              className={inputClass}
              value={delAddress}
              onChange={(e) => setDelAddress(sanitizeAddressField(e.target.value))}
              placeholder={tr.placeholderAddress}
              required
            />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="block min-w-0">
              <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldCounty}</span>
              <select
                className={selectClass}
                value={delCounty}
                onChange={(e) => {
                  setDelCounty(e.target.value)
                  setDelCity('')
                }}
                required
              >
                <option value="">{tr.selectCountyPlaceholder}</option>
                {ROMANIAN_COUNTIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block min-w-0">
              <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldCity}</span>
              <select
                className={selectClass}
                value={delCity}
                onChange={(e) => setDelCity(e.target.value)}
                required
                disabled={!delCounty}
              >
                <option value="">{delCounty ? tr.selectCityPlaceholder : tr.selectCityPlaceholderNeedCounty}</option>
                {delCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block min-w-0">
              <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldPostal}</span>
              <input
                className={inputClass}
                value={delPostal}
                onChange={(e) => setDelPostal(sanitizeRoPostalCode(e.target.value))}
                placeholder={tr.placeholderPostal}
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                required
              />
            </label>
          </div>

          {submitError && activeStep === 3 ? (
            <div className="rounded-xl border border-red-200 bg-red-50/80 px-3 py-2.5" role="alert">
              <p className="m-0 text-sm font-medium text-red-800 font-['Inter']">{submitError}</p>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => {
                setSubmitError(null)
                goToStep(2)
              }}
              className={`order-2 min-h-[44px] sm:order-1 ${checkoutBackButtonClass}`}
            >
              ←{' '}
              {trPartner.backToBilling}
            </button>
            <button
              type="button"
              onClick={() => {
                const err = validateDeliveryFields()
                if (err) {
                  setSubmitError(err)
                  return
                }
                setSubmitError(null)
                setMaxReachedStep((m) => (m < 4 ? 4 : m))
                goToStep(4)
              }}
              className="order-1 min-h-[48px] flex-1 rounded-xl bg-slate-900 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-slate-800 sm:order-2 sm:max-w-xs"
            >
              {tr.btnContinueStep4}
            </button>
          </div>
        </div>
      )
    }

    if (stepId === 4 && successOrderNumber) {
      return (
        <div className="space-y-5">
          <div className="flex gap-3 rounded-xl border border-emerald-200/90 bg-emerald-50/70 py-4 pl-4 pr-4">
            <CheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" aria-hidden />
            <div className="min-w-0">
              <p className="m-0 font-['Inter'] text-base font-bold text-slate-900">{tr.orderSuccessTitle}</p>
              <p className="mt-3 m-0 font-['Inter'] text-sm font-semibold text-slate-900">
                {tr.orderNumberLabel}: <span className="font-mono font-bold tracking-tight">{successOrderNumber}</span>
              </p>
              <p className="mt-2 m-0 text-sm leading-relaxed text-slate-700 font-['Inter']">{tr.orderSuccessBody}</p>
              <p className="mt-2 m-0 text-sm leading-relaxed text-slate-600 font-['Inter']">
                {tr.orderTrackHint.replace('{email}', emailFromAccount)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/partner/comenzi"
              className="inline-flex min-h-[44px] max-w-fit items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              {tr.orderSuccessViewOrders}
            </Link>
            <Link
              to="/partner/produse"
              className="inline-flex min-h-[44px] max-w-fit items-center justify-center rounded-xl border-2 border-slate-900 bg-white px-5 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50"
            >
              {tr.browseProducts}
            </Link>
          </div>
        </div>
      )
    }

    if (stepId !== 4) return null

    return (
      <div className="flex flex-col gap-8">
        <div>
          <p className="m-0 font-['Inter'] text-base font-bold text-slate-900">{tr.paymentCalloutTitle}</p>
          <ol className="mt-4 list-decimal space-y-4 pl-5 text-sm leading-relaxed text-slate-700 marker:font-semibold marker:text-slate-900 font-['Inter']">
            <li className="pl-1">{tr.finalizeStep1}</li>
            <li className="pl-1">{tr.finalizeStep2}</li>
            <li className="pl-1">{tr.finalizeStep3}</li>
            <li className="pl-1">{tr.finalizeStep4}</li>
          </ol>
        </div>
        {submitError ? (
          <div className="rounded-xl border border-red-200 bg-red-50/80 px-3 py-2.5" role="alert">
            <p className="m-0 text-sm font-medium text-red-800 font-['Inter']">{submitError}</p>
          </div>
        ) : null}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-between">
          <button
            type="button"
            onClick={() => goToStep(3)}
            disabled={submitLoading}
            className={`order-2 min-h-[44px] sm:order-1 sm:shrink-0 ${checkoutBackButtonClass} disabled:opacity-50`}
          >
            ← {tr.btnBackStep3}
          </button>
          <button
            type="submit"
            disabled={submitLoading || !profileLoaded}
            className="order-1 flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:order-2 sm:min-w-[220px] sm:flex-none sm:max-w-md"
          >
            {submitLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                {tr.orderPlaceLoading}
              </>
            ) : (
              tr.btnPlaceOrder
            )}
          </button>
        </form>
      </div>
    )
  }

  if (catalogLoading || !cartHydrated) {
    return (
      <div className="flex min-h-[68vh] items-center justify-center bg-white p-8">
        <Loader2 className="h-10 w-10 animate-spin text-slate-400" aria-hidden />
      </div>
    )
  }

  if (products.length === 0 && readPartnerCartFromStorage().length > 0) {
    return (
      <div className="min-h-[68vh] bg-white">
        <div className="w-full max-w-content px-4 py-16 text-left sm:px-6">
          <p className="text-sm font-medium text-slate-700 font-['Inter']">{tr.loadErrorBody}</p>
          <Link to="/partner/produse" className={`mt-4 inline-flex min-h-[44px] items-center ${checkoutBackButtonClass}`}>
            {tr.browseProducts}
          </Link>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return null
  }

  return (
    <div className="min-h-[68vh] bg-white">
      <div className="w-full max-w-content px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:pt-10">
        <nav className="mb-6 flex flex-wrap items-center gap-x-1 gap-y-1 text-sm font-medium text-slate-500 font-['Inter']">
          <Link to="/" className="transition-colors hover:text-slate-900">
            {tr.breadcrumbHome}
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <span className="text-slate-900">{tr.breadcrumbCheckout}</span>
        </nav>

        <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-['Inter'] text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-[2rem]">
                {tr.headline}
              </h1>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm">
                {partnerBadge}
              </span>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">{partnerSubline}</p>
          </div>
        </header>

        <div className="mt-2 flex flex-col-reverse gap-8 lg:mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-start lg:gap-10">
          <div className="min-w-0 w-full">
            <div className="flex w-full flex-col gap-3" role="list" aria-label={tr.stepsAriaLabel}>
              {steps.map((step) => {
                const Icon = step.icon
                const reachable = step.id <= maxReachedStep
                const open = activeStep === step.id
                const completed = Boolean(successOrderNumber || step.id < activeStep)
                const finalizeLocked = step.id === 4 && !successOrderNumber && maxReachedStep < 4
                const canOpen = reachable && !finalizeLocked
                return (
                  <div
                    key={step.id}
                    role="listitem"
                    className="w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-[#f7f7f7]"
                  >
                    <button
                      type="button"
                      disabled={!canOpen}
                      aria-expanded={open}
                      aria-controls={`partner-checkout-accordion-panel-${step.id}`}
                      id={`partner-checkout-accordion-trigger-${step.id}`}
                      onClick={() => {
                        if (canOpen) goToStep(step.id)
                      }}
                      className={`flex w-full min-h-[56px] items-center gap-3 px-4 py-3.5 text-left transition-colors sm:gap-4 sm:px-5 sm:py-4 ${
                        open ? 'bg-[#f7f7f7]' : 'bg-[#f7f7f7] hover:bg-neutral-200/40'
                      } ${!canOpen ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold font-['Inter'] ${
                          open
                            ? 'bg-slate-900 text-white'
                            : completed
                              ? 'bg-emerald-500 text-white'
                              : reachable
                                ? 'bg-slate-200 text-slate-800'
                                : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {completed ? '✓' : step.id}
                      </span>
                      <Icon
                        className={`h-5 w-5 shrink-0 sm:h-[1.35rem] sm:w-[1.35rem] ${
                          open ? 'text-slate-900' : completed ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                        strokeWidth={2.25}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1 font-['Inter'] text-sm font-bold leading-snug text-slate-900 sm:text-base">
                        {step.panelTitle}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${
                          open ? 'rotate-180' : ''
                        }`}
                        aria-hidden
                      />
                    </button>
                    {open ? (
                      <div
                        id={`partner-checkout-accordion-panel-${step.id}`}
                        role="region"
                        aria-labelledby={`partner-checkout-accordion-trigger-${step.id}`}
                        className="w-full border-t border-slate-200/80 bg-[#f7f7f7] px-4 pb-5 pt-5 sm:px-5 sm:pb-6 sm:pt-6"
                      >
                        <div className="w-full max-w-full">{stepBody(step.id)}</div>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>

          {checkoutReady ? orderSummaryAside : null}
        </div>
      </div>
    </div>
  )
}
