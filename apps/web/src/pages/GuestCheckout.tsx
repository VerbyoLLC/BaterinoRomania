import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Loader2,
  MapPin,
  Package,
  Truck,
  UserCircle,
  UserPlus,
} from 'lucide-react'
import SEO from '../components/SEO'
import { CartLineProductThumbLink } from '../components/CartLineProductThumbLink'
import {
  CartLineSpecDetails,
  extractCartLineSpecsFromProduct,
  type CartLineSpecs,
} from '../components/CartLineSpecDetails'
import GoogleSignupButton from '../components/GoogleSignupButton'
import PasswordInput from '../components/PasswordInput'
import { useLanguage } from '../contexts/LanguageContext'
import { useCatalogCurrency } from '../contexts/CatalogCurrencyContext'
import {
  cartLineDiscountPercent,
  cartLineMaxQty,
  cartLineMergeKey,
  cartLineQtyLocked,
  useCart,
} from '../contexts/CartContext'
import { CartLineProgramDiscountMark } from '../components/CartLineProgramDiscountMark'
import { useReducereProgramLabels } from '../hooks/useReducereProgramLabels'
import { getCartProgramDiscountTranslations } from '../i18n/cart-program-discount'
import { getGuestCheckoutTranslations } from '../i18n/guest-checkout'
import { getProductPricingTranslations } from '../i18n/product-pricing'
import type { LangCode } from '../i18n/menu'
import {
  googleAuth,
  getAuthRole,
  getClientProfile,
  getProductAsGuest,
  getProductCardImageUrl,
  putClientProfile,
  setAuthToken,
  signup as apiSignup,
  submitGuestResidentialOrder,
  type ClientProfilePayload,
  type PublicProduct,
} from '../lib/api'
import { showResidentialClientPurchaseUI } from '../lib/residentialPublicPurchase'
import {
  formatRoNational9Display,
  sanitizeAddressField,
  sanitizeEmailTyping,
  sanitizePersonName,
  sanitizePostalField,
} from '../lib/formInputSanitize'
import { ROMANIAN_COUNTIES, getCitiesForCounty } from '../lib/romanian-counties-cities'

function num(v: string | number | null | undefined): number | null {
  if (v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function parseQty(raw: string | null): number {
  const n = raw ? parseInt(raw, 10) : 1
  if (!Number.isFinite(n)) return 1
  return Math.min(99, Math.max(1, n))
}

type CheckoutStep = 1 | 2 | 3 | 4

function checkoutPath(slug: string, qty: number): string {
  const q = new URLSearchParams({ slug, qty: String(qty) })
  return `/comanda?${q.toString()}`
}

function profileHasCompletePersonal(p: ClientProfilePayload | null): boolean {
  if (!p) return false
  const phone = String(p.phone || '').replace(/\D/g, '')
  return Boolean(
    String(p.lastName || '').trim() &&
      String(p.firstName || '').trim() &&
      phone.length === 9,
  )
}

function profileHasCompleteAddress(p: ClientProfilePayload | null): boolean {
  if (!p) return false
  const billOk =
    String(p.billAddress || '').trim() &&
    String(p.billCounty || '').trim() &&
    String(p.billCity || '').trim() &&
    String(p.billPostal || '').trim()
  if (!billOk) return false
  if (p.deliveryDifferent) {
    return Boolean(
      String(p.delAddress || '').trim() &&
        String(p.delCounty || '').trim() &&
        String(p.delCity || '').trim() &&
        String(p.delPostal || '').trim(),
    )
  }
  return true
}

function buildCheckoutClientProfilePayload(
  shipNume: string,
  shipPrenume: string,
  shipPhone: string,
  billAddress: string,
  billCounty: string,
  billCity: string,
  billPostal: string,
  differentDeliveryAddress: boolean,
  delAddress: string,
  delCounty: string,
  delCity: string,
  delPostal: string,
): ClientProfilePayload {
  const phone = shipPhone.replace(/\D/g, '').slice(0, 9)
  return {
    firstName: shipPrenume.trim(),
    lastName: shipNume.trim(),
    phone,
    billAddress: billAddress.trim(),
    billCounty: billCounty.trim(),
    billCity: billCity.trim(),
    billPostal: billPostal.trim(),
    deliveryDifferent: differentDeliveryAddress,
    delAddress: differentDeliveryAddress ? delAddress.trim() : undefined,
    delCounty: differentDeliveryAddress ? delCounty.trim() : undefined,
    delCity: differentDeliveryAddress ? delCity.trim() : undefined,
    delPostal: differentDeliveryAddress ? delPostal.trim() : undefined,
  }
}

/** Shared layout; border color applied only in `inputClass` / `inputClassWithError` so errors are not overridden by slate. */
const inputClassBase =
  'h-12 w-full rounded-xl bg-white px-3.5 text-sm font-[\'Inter\'] text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2'

const inputClass = `${inputClassBase} border border-slate-200 focus:border-slate-900 focus:ring-slate-900/10`

const phoneFieldShellClass =
  'flex h-12 w-full min-w-0 items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10'

function inputClassWithError(hasError: boolean): string {
  return hasError
    ? `${inputClassBase} border-2 border-red-500 focus:border-red-500 focus:ring-red-500/25`
    : inputClass
}

const selectClassBase = `${inputClassBase} cursor-pointer appearance-none pr-10`

function selectClassWithError(hasError: boolean): string {
  return hasError
    ? `${selectClassBase} border-2 border-red-500 focus:border-red-500 focus:ring-red-500/25`
    : `${selectClassBase} border border-slate-200 focus:border-slate-900 focus:ring-slate-900/10`
}

function phoneShellClass(hasError: boolean): string {
  return hasError
    ? 'flex h-12 w-full min-w-0 items-stretch overflow-hidden rounded-xl border-2 border-red-500 bg-white transition-colors focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-500/25'
    : phoneFieldShellClass
}

/** Blends with accordion panel `#f7f7f7`; border matches background via transparency. */
const checkoutBackButtonClass =
  'rounded-xl border border-transparent bg-transparent px-4 text-sm font-semibold text-slate-800 transition hover:bg-black/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15'

type Step2FieldKey = 'nume' | 'prenume' | 'phone' | 'email'
type Step2FieldErrors = Partial<Record<Step2FieldKey, string>>
type Step3FieldKey =
  | 'billAddress'
  | 'billCity'
  | 'billCounty'
  | 'billPostal'
  | 'delAddress'
  | 'delCity'
  | 'delCounty'
  | 'delPostal'
type Step3FieldErrors = Partial<Record<Step3FieldKey, string>>

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-1.5 text-sm font-medium text-red-700 font-['Inter']" role="alert">
      {message}
    </p>
  )
}

function isValidEmail(email: string): boolean {
  const s = email.trim()
  if (!s) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

function PanelSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-1">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="mx-auto h-32 w-32 shrink-0 rounded-2xl bg-slate-200 sm:mx-0" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-3 w-24 rounded bg-slate-200" />
          <div className="h-6 w-full max-w-md rounded bg-slate-200" />
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-10 w-48 rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  )
}

export default function GuestCheckout() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const slug = (searchParams.get('slug') || '').trim()
  const qty = parseQty(searchParams.get('qty'))
  const { language } = useLanguage()
  const lang = language.code as LangCode
  const { currency } = useCatalogCurrency()
  const p = getProductPricingTranslations(lang, currency)
  const tr = getGuestCheckoutTranslations(lang)
  const isClientSession = getAuthRole() === 'client'

  const [activeStep, setActiveStep] = useState<CheckoutStep>(1)
  const [maxReachedStep, setMaxReachedStep] = useState<CheckoutStep>(1)
  const [product, setProduct] = useState<PublicProduct | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [shipNume, setShipNume] = useState('')
  const [shipPrenume, setShipPrenume] = useState('')
  const [shipPhone, setShipPhone] = useState('')
  const [shipEmail, setShipEmail] = useState('')
  const [billAddress, setBillAddress] = useState('')
  const [billCounty, setBillCounty] = useState('')
  const [billCity, setBillCity] = useState('')
  const [billPostal, setBillPostal] = useState('')
  const [differentDeliveryAddress, setDifferentDeliveryAddress] = useState(false)
  const [delAddress, setDelAddress] = useState('')
  const [delCounty, setDelCounty] = useState('')
  const [delCity, setDelCity] = useState('')
  const [delPostal, setDelPostal] = useState('')

  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [step2FieldErrors, setStep2FieldErrors] = useState<Step2FieldErrors>({})
  const [step3FieldErrors, setStep3FieldErrors] = useState<Step3FieldErrors>({})
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [submittedOrderNumber, setSubmittedOrderNumber] = useState<string | null>(null)
  const [orderPlaceError, setOrderPlaceError] = useState<string | null>(null)
  const [orderPlaceLoading, setOrderPlaceLoading] = useState(false)

  /** Snapshot at checkout load — used to decide if personal/address need first-time save */
  const profileBaselineRef = useRef<ClientProfilePayload | null>(null)
  const [clientProfileLoaded, setClientProfileLoaded] = useState(() => getAuthRole() !== 'client')
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null)
  const [profileAutosaveBusy, setProfileAutosaveBusy] = useState(false)

  const { lines: cartLines, clearCart, setLineQty } = useCart()
  const cartMode = cartLines.length > 0
  const cartLinesRef = useRef(cartLines)
  cartLinesRef.current = cartLines

  const cartAnyProgramDiscount = useMemo(
    () => cartMode && cartLines.some((l) => cartLineDiscountPercent(l) > 0),
    [cartMode, cartLines],
  )
  const programLabelById = useReducereProgramLabels(lang, cartAnyProgramDiscount)
  const cartProgramDiscountTr = getCartProgramDiscountTranslations(lang)

  /** Re-fetch product prices only when lines / discount identity changes — not on qty alone */
  const cartPriceIdentityKey = useMemo(
    () => (cartMode ? [...cartLines].map(cartLineMergeKey).sort().join('|') : ''),
    [cartMode, cartLines],
  )

  const [cartLineUnitIncl, setCartLineUnitIncl] = useState<Record<string, number>>({})
  const [cartLineVatPct, setCartLineVatPct] = useState<Record<string, number | null>>({})
  const [cartPriceLoading, setCartPriceLoading] = useState(false)
  const [cartPriceError, setCartPriceError] = useState<string | null>(null)
  const [cartLineSpecs, setCartLineSpecs] = useState<Record<string, CartLineSpecs>>({})
  const cartKey = cartMode
    ? cartLines.map((l) => `${cartLineMergeKey(l)}:${l.qty}`).join('|')
    : ''

  const cartTotal = useMemo(() => {
    if (!cartMode || cartLines.length === 0) return null
    let sum = 0
    for (const line of cartLines) {
      const u = cartLineUnitIncl[cartLineMergeKey(line)]
      if (u == null) return null
      sum += u * line.qty
    }
    return sum
  }, [cartMode, cartLines, cartLineUnitIncl])

  const cartSummaryVatLabel = useMemo(() => {
    if (!cartMode || cartLines.length === 0) return null
    const rates: number[] = []
    for (const line of cartLines) {
      const v = cartLineVatPct[cartLineMergeKey(line)]
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
  }, [cartMode, cartLines, cartLineVatPct, tr])

  const billCities = useMemo(() => getCitiesForCounty(billCounty), [billCounty])
  const delCities = useMemo(() => getCitiesForCounty(delCounty), [delCounty])

  const returnToCheckout = cartMode ? '/comanda' : slug ? checkoutPath(slug, qty) : '/comanda'
  const loginNext = encodeURIComponent(returnToCheckout)

  useEffect(() => {
    const role = getAuthRole()
    if (role === 'partener') {
      navigate('/partner', { replace: true })
      return
    }
    if (role === 'admin') {
      navigate('/', { replace: true })
      return
    }
    // Clients and fully anonymous users may open guest checkout (public pricing via getProductAsGuest).
  }, [navigate])

  useEffect(() => {
    if (getAuthRole() !== 'client') {
      return
    }
    let cancelled = false
    setClientProfileLoaded(false)
    getClientProfile()
      .then(({ email, profile }) => {
        if (cancelled) return
        profileBaselineRef.current = profile
          ? {
              firstName: profile.firstName,
              lastName: profile.lastName,
              phone: profile.phone,
              billAddress: profile.billAddress,
              billCounty: profile.billCounty,
              billCity: profile.billCity,
              billPostal: profile.billPostal,
              deliveryDifferent: profile.deliveryDifferent,
              delAddress: profile.delAddress ?? undefined,
              delCounty: profile.delCounty ?? undefined,
              delCity: profile.delCity ?? undefined,
              delPostal: profile.delPostal ?? undefined,
            }
          : null
        setShipEmail(email)
        if (profile) {
          setShipNume(profile.lastName || '')
          setShipPrenume(profile.firstName || '')
          setShipPhone(profile.phone || '')
          setBillAddress(profile.billAddress || '')
          setBillCounty(profile.billCounty || '')
          setBillCity(profile.billCity || '')
          setBillPostal(profile.billPostal || '')
          setDifferentDeliveryAddress(Boolean(profile.deliveryDifferent))
          setDelAddress(profile.delAddress || '')
          setDelCounty(profile.delCounty || '')
          setDelCity(profile.delCity || '')
          setDelPostal(profile.delPostal || '')
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setClientProfileLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (cartMode) {
      setLoading(false)
      setProduct(null)
      setLoadError(null)
      return
    }
    if (!slug) {
      setLoading(false)
      setProduct(null)
      setLoadError(null)
      return
    }
    const messages = getGuestCheckoutTranslations(lang)
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    getProductAsGuest(slug)
      .then((row) => {
        if (cancelled) return
        setProduct(row)
        if (!showResidentialClientPurchaseUI(row)) {
          setLoadError(messages.notAvailableBody)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProduct(null)
          setLoadError(messages.loadErrorBody)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug, lang])

  const locale = lang === 'en' ? 'en-GB' : lang === 'zh' ? 'zh-CN' : 'ro-RO'
  const fmtMoney = (n: number) =>
    n.toLocaleString(locale, { maximumFractionDigits: 0, minimumFractionDigits: 0 })

  const pricing = useMemo(() => {
    if (!product || loadError) return null
    const sale = num(product.salePrice)
    if (sale == null || sale <= 0) return null
    const vatPct = num((product as { vat?: string | number | null }).vat)
    const hasVat = vatPct != null && vatPct > 0
    const baseUnit = hasVat ? sale * (1 + vatPct! / 100) : sale
    const lineTotal = baseUnit * qty
    const vatInline = hasVat
      ? lang === 'ro'
        ? `TVA ${vatPct}% inclus`
        : lang === 'zh'
          ? `含增值税 ${vatPct}%`
          : `incl. ${vatPct}% VAT`
      : null
    return { lineTotal, vatInline }
  }, [product, loadError, qty, lang])

  useEffect(() => {
    if (!cartMode) {
      setCartLineUnitIncl({})
      setCartLineVatPct({})
      setCartPriceError(null)
      setCartPriceLoading(false)
      setCartLineSpecs({})
      return
    }
    const messages = getGuestCheckoutTranslations(lang)
    let cancelled = false
    setCartPriceLoading(true)
    setCartPriceError(null)
    const snapshot = cartLinesRef.current
    ;(async () => {
      try {
        const units: Record<string, number> = {}
        const vats: Record<string, number | null> = {}
        const specsMap: Record<string, CartLineSpecs> = {}
        for (const line of snapshot) {
          const row = await getProductAsGuest(line.slug || line.productId)
          const lk = cartLineMergeKey(line)
          specsMap[lk] = extractCartLineSpecsFromProduct(row)
          if (!showResidentialClientPurchaseUI(row)) {
            throw new Error(messages.notAvailableBody)
          }
          const sale = num(row.salePrice)
          if (sale == null || sale <= 0) throw new Error(messages.loadErrorBody)
          const vatPct = num((row as { vat?: string | number | null }).vat)
          const hasVat = vatPct != null && vatPct > 0
          const vp = hasVat && vatPct != null ? vatPct : null
          const dPct =
            line.reducereDiscountPercent != null && line.reducereDiscountPercent > 0
              ? Math.min(100, line.reducereDiscountPercent)
              : 0
          const netExcl = sale * (1 - dPct / 100)
          const unitIncl = vp != null && vp > 0 ? netExcl * (1 + vp / 100) : netExcl
          units[lk] = unitIncl
          vats[lk] = vp
        }
        if (!cancelled) {
          setCartLineUnitIncl(units)
          setCartLineVatPct(vats)
          setCartLineSpecs(specsMap)
        }
      } catch (e) {
        if (!cancelled) {
          setCartPriceError(e instanceof Error ? e.message : messages.loadErrorBody)
          setCartLineUnitIncl({})
          setCartLineVatPct({})
          setCartLineSpecs({})
        }
      } finally {
        if (!cancelled) setCartPriceLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [cartMode, cartPriceIdentityKey, lang])

  async function handleSidebarSignupSubmit(e: React.FormEvent) {
    e.preventDefault()
    setAuthError('')
    if (authPassword.length < 8) {
      setAuthError(tr.authPasswordTooShort)
      return
    }
    setAuthLoading(true)
    try {
      const emailNorm = authEmail.trim().toLowerCase()
      const signupOut = await apiSignup(emailNorm, authPassword, 'client', returnToCheckout)
      navigate(`/signup/clienti?tab=client&next=${loginNext}`, {
        state: {
          guestCheckoutSignup: true,
          email: emailNorm,
          verificationSent: signupOut.verificationSent !== false,
        },
      })
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : tr.authErrorGeneric)
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleGuestGoogleToken(idToken: string) {
    setAuthError('')
    setAuthLoading(true)
    try {
      const { token, user, needsPartnerProfile } = await googleAuth(idToken, 'client')
      setAuthToken(token)
      if (user.role === 'partener') {
        navigate(needsPartnerProfile ? '/signup/parteneri/profil' : '/partner', { replace: true })
        return
      }
      navigate(returnToCheckout, { replace: true })
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : tr.authErrorGeneric)
    } finally {
      setAuthLoading(false)
    }
  }

  const validGuestProduct = Boolean(product && !loadError && pricing)
  const checkoutReady = cartMode
    ? cartLines.length > 0 && !cartPriceLoading && cartTotal != null && !cartPriceError
    : validGuestProduct
  const img = product ? getProductCardImageUrl(product) : ''
  useEffect(() => {
    if (orderSubmitted) return
    if (!checkoutReady) {
      setActiveStep(1)
      setMaxReachedStep(1)
    }
  }, [checkoutReady, orderSubmitted])

  useEffect(() => {
    setOrderSubmitted(false)
    setSubmittedOrderNumber(null)
    setOrderPlaceError(null)
    setOrderPlaceLoading(false)
  }, [slug])

  /** Cart identity changed (e.g. lines added/removed) — clear stale submit state, but not after a successful order while the cart is cleared. */
  useEffect(() => {
    if (orderSubmitted) return
    setOrderSubmitted(false)
    setSubmittedOrderNumber(null)
    setOrderPlaceError(null)
    setOrderPlaceLoading(false)
  }, [cartKey, orderSubmitted])

  /** New items in cart after a completed order — start a fresh checkout session. */
  useEffect(() => {
    if (!orderSubmitted) return
    if (cartMode && cartLines.length > 0) {
      setOrderSubmitted(false)
      setSubmittedOrderNumber(null)
    }
  }, [orderSubmitted, cartMode, cartLines.length])

  async function handlePlaceGuestOrder() {
    if (!cartMode && !slug) return
    if (cartMode && !checkoutReady) return
    setOrderPlaceError(null)
    setOrderPlaceLoading(true)
    try {
      const phoneDigits = shipPhone.replace(/\D/g, '').slice(0, 9)
      const common = {
        email: shipEmail.trim(),
        phone: phoneDigits,
        nume: shipNume.trim(),
        prenume: shipPrenume.trim(),
        billAddress: billAddress.trim(),
        billCounty: billCounty.trim(),
        billCity: billCity.trim(),
        billPostal: billPostal.trim(),
        differentDeliveryAddress,
        delAddress: differentDeliveryAddress ? delAddress.trim() : '',
        delCounty: differentDeliveryAddress ? delCounty.trim() : '',
        delCity: differentDeliveryAddress ? delCity.trim() : '',
        delPostal: differentDeliveryAddress ? delPostal.trim() : '',
      }
      const result = cartMode
        ? await submitGuestResidentialOrder({
            items: cartLines.map((c) => {
              const rid = c.reducereProgramId != null ? String(c.reducereProgramId).trim() : ''
              return {
                productIdOrSlug: c.slug || c.productId,
                quantity: c.qty,
                ...(rid && !rid.startsWith('local-') ? { reducereProgramId: rid } : {}),
              }
            }),
            ...common,
          })
        : await submitGuestResidentialOrder({
            productIdOrSlug: slug,
            quantity: qty,
            ...common,
          })
      if (cartMode) clearCart()
      setSubmittedOrderNumber(result.orderNumber)
      setOrderSubmitted(true)
      setMaxReachedStep(4)
      setActiveStep(4)
    } catch (err) {
      setOrderPlaceError(err instanceof Error ? err.message : tr.placeOrderErrorGeneric)
    } finally {
      setOrderPlaceLoading(false)
    }
  }

  const steps: {
    id: CheckoutStep
    panelTitle: string
    icon: typeof Package
  }[] = [
    { id: 1, panelTitle: tr.panelStep1, icon: Package },
    { id: 2, panelTitle: tr.panelStep2, icon: UserCircle },
    { id: 3, panelTitle: tr.panelStep3, icon: MapPin },
    { id: 4, panelTitle: tr.panelStep4, icon: CheckCircle },
  ]

  function stepBody(stepId: CheckoutStep): ReactNode {
    if (stepId === 1) {
      if (!slug && !cartMode) {
        return (
          <div className="flex gap-4 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 sm:p-5">
            <AlertCircle className="h-6 w-6 shrink-0 text-amber-700" aria-hidden />
            <div className="min-w-0 space-y-3">
              <p className="m-0 font-['Inter'] text-base font-semibold text-slate-900">{tr.emptyCheckoutTitle}</p>
              <p className="m-0 text-sm leading-relaxed text-slate-700">{tr.emptyCheckoutBody}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/produse"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
                >
                  {tr.browseProducts}
                </Link>
                <Link
                  to="/cos"
                  className={`inline-flex min-h-[44px] items-center no-underline ${checkoutBackButtonClass}`}
                >
                  ← {tr.cartEditInCos}
                </Link>
              </div>
            </div>
          </div>
        )
      }
      if (cartMode) {
        if (cartPriceLoading) {
          return (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 font-['Inter']">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" aria-hidden />
                {tr.cartLoadingTotals}
              </div>
              <PanelSkeleton />
            </div>
          )
        }
        if (cartPriceError) {
          return (
            <div className="flex gap-4 rounded-xl border border-red-200/80 bg-red-50/40 p-4 sm:p-5">
              <AlertCircle className="h-6 w-6 shrink-0 text-red-600" aria-hidden />
              <div className="min-w-0 space-y-3">
                <p className="m-0 font-['Inter'] text-base font-semibold text-slate-900">{tr.notAvailableTitle}</p>
                <p className="m-0 text-sm leading-relaxed text-slate-700">{cartPriceError}</p>
                <Link
                  to="/cos"
                  className={`inline-flex min-h-[44px] items-center no-underline ${checkoutBackButtonClass}`}
                >
                  ← {tr.cartEditInCos}
                </Link>
              </div>
            </div>
          )
        }
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="m-0 text-[0.7rem] font-bold uppercase tracking-widest text-slate-500 font-['Inter']">
                {tr.cartItemsHeading}
              </p>
              <ul className="divide-y divide-slate-200/90 rounded-xl border border-slate-200/90 bg-white">
                {cartLines.map((line) => {
                  const lineKey = cartLineMergeKey(line)
                  const lineMaxQty = cartLineMaxQty(line)
                  const qtyLocked = cartLineQtyLocked(line)
                  const unitIncl = cartLineUnitIncl[lineKey]
                  const lineVatPct = cartLineVatPct[lineKey]
                  const lineTotalIncl = unitIncl != null ? unitIncl * line.qty : null
                  const lineVatPctDisp =
                    lineVatPct != null && lineVatPct > 0
                      ? Number.isInteger(lineVatPct)
                        ? String(lineVatPct)
                        : String(lineVatPct).replace(/\.0+$/, '')
                      : null
                  return (
                  <li
                    key={lineKey}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                  >
                    <div className="flex min-w-0 flex-1 gap-4 sm:items-center">
                      <CartLineProductThumbLink
                        to={`/produse/${encodeURIComponent(line.slug || line.productId)}`}
                        src={line.imageUrl?.trim() || getProductCardImageUrl({ images: [], cardImage: null })}
                        lang={lang}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="m-0 font-['Inter'] font-semibold text-slate-900">{line.title}</p>
                        <CartLineSpecDetails specs={cartLineSpecs[lineKey]} lang={lang} />
                        <CartLineProgramDiscountMark
                          line={line}
                          programLabelById={programLabelById}
                          tr={cartProgramDiscountTr}
                        />
                      </div>
                    </div>
                    <div className="flex w-full shrink-0 flex-row flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-slate-100 pt-3 sm:w-auto sm:justify-end sm:border-t-0 sm:pt-0">
                      <label
                        className={`flex shrink-0 flex-col items-stretch text-left ${qtyLocked ? 'text-slate-400' : 'text-slate-700'}`}
                      >
                        <span
                          className={`m-0 text-xs font-medium uppercase tracking-wide font-['Inter'] ${qtyLocked ? 'text-slate-400' : 'text-slate-500'}`}
                        >
                          {tr.orderQtyLabel}
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={lineMaxQty}
                          value={line.qty}
                          disabled={qtyLocked}
                          onChange={(e) => setLineQty(lineKey, parseInt(e.target.value, 10) || 1)}
                          className="mt-1 w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-sm [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </label>
                      <div className="min-w-0 text-right sm:min-w-[10rem]">
                        <p className="m-0 text-xs font-medium leading-snug text-slate-500 font-['Inter']">
                          {lineVatPctDisp
                            ? tr.cartLineTotalLabel.replace('{pct}', lineVatPctDisp)
                            : tr.cartLineTotalLabelNoVat}
                        </p>
                        <p className="mt-1 font-['Inter'] text-lg font-extrabold tabular-nums text-slate-900 sm:text-xl">
                          {lineTotalIncl != null ? (
                            <>
                              {fmtMoney(lineTotalIncl)}{' '}
                              <span className="text-base font-bold text-slate-600">{p.currencySuffix}</span>
                            </>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </li>
                  )
                })}
              </ul>
            </div>

            <div className="mt-2 flex flex-col gap-4 font-['Inter']">
              <div className="flex min-w-0 w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-5 sm:px-6">
                <div
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 ring-1 ring-slate-100 sm:h-24 sm:w-24"
                  aria-hidden
                >
                  <Truck className="h-10 w-10 sm:h-12 sm:w-12" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-xs font-bold uppercase tracking-widest text-slate-500">{tr.orderShippingLabel}</p>
                  <p className="mt-1 text-sm font-bold text-slate-900 sm:text-base">{tr.orderShippingTitle}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{tr.orderShippingSubtitle}</p>
                  <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 border-t border-slate-100 pt-3 sm:hidden">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      {tr.orderShippingAmountLabel}
                    </span>
                    <span className="text-lg font-extrabold tabular-nums text-slate-900">
                      {fmtMoney(0)} <span className="text-sm font-bold text-slate-600">{p.currencySuffix}</span>
                    </span>
                  </div>
                </div>
                <div className="hidden shrink-0 text-right sm:block sm:min-w-[7.5rem]">
                  <p className="m-0 text-xs font-bold uppercase tracking-widest text-slate-500">{tr.orderShippingAmountLabel}</p>
                  <p className="mt-2 font-['Inter'] text-2xl font-extrabold tabular-nums text-slate-900 sm:text-3xl">
                    {fmtMoney(0)} <span className="text-lg font-bold text-slate-600">{p.currencySuffix}</span>
                  </p>
                </div>
              </div>

              <div className="w-full shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center sm:px-6">
                <p className="m-0 text-sm font-semibold text-slate-800">{tr.orderTotalLabel}</p>
                <p className="mt-3 font-['Inter'] text-3xl font-extrabold tabular-nums tracking-tight text-slate-900 sm:text-4xl">
                  {cartTotal != null ? fmtMoney(cartTotal) : '—'}{' '}
                  <span className="text-xl font-bold text-slate-600 sm:text-2xl">{p.currencySuffix}</span>
                </p>
                {cartSummaryVatLabel ? (
                  <p className="mt-2 text-sm leading-snug text-slate-500 font-['Inter']">{cartSummaryVatLabel}</p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to="/produse"
                className={`order-2 inline-flex min-h-[44px] items-center no-underline sm:order-1 ${checkoutBackButtonClass}`}
              >
                {tr.btnEditProductsStep1}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMaxReachedStep((m) => (m < 2 ? 2 : m))
                  setActiveStep(2)
                }}
                className="order-1 min-h-[48px] flex-1 rounded-xl bg-slate-900 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:order-2 sm:max-w-xs"
              >
                {tr.btnContinueStep2}
              </button>
            </div>
          </div>
        )
      }
      if (loading) {
        return (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 font-['Inter']">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" aria-hidden />
              {tr.loadingProduct}
            </div>
            <PanelSkeleton />
          </div>
        )
      }
      if (!validGuestProduct) {
        return (
          <div className="flex gap-4 rounded-xl border border-red-200/80 bg-red-50/40 p-4 sm:p-5">
            <AlertCircle className="h-6 w-6 shrink-0 text-red-600" aria-hidden />
            <div className="min-w-0 space-y-3">
              <p className="m-0 font-['Inter'] text-base font-semibold text-slate-900">
                {!product ? tr.loadErrorTitle : tr.notAvailableTitle}
              </p>
              <p className="m-0 text-sm leading-relaxed text-slate-700">{loadError || tr.loadErrorBody}</p>
              <Link
                to="/produse"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                {tr.browseProducts}
              </Link>
            </div>
          </div>
        )
      }
      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-6">
            <div className="mx-auto flex h-36 w-36 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/80 p-3 ring-1 ring-slate-200/80 sm:mx-0 sm:h-40 sm:w-40">
              <img src={img} alt="" className="max-h-full max-w-full object-contain" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <p className="m-0 text-[0.7rem] font-bold uppercase tracking-widest text-slate-500 font-['Inter']">
                    {tr.orderProductLabel}
                  </p>
                  <p className="mt-1 font-['Inter'] text-lg font-bold leading-snug text-slate-900 sm:text-xl">
                    {product!.title}
                  </p>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
                  <span>
                    <span className="font-semibold text-slate-800">{tr.orderQtyLabel}:</span> {qty}
                  </span>
                  {pricing?.vatInline ? <span className="text-slate-500">{pricing.vatInline}</span> : null}
                </div>
              </div>
              <div className="shrink-0 border-t border-slate-200/90 pt-5 md:w-auto md:border-t-0 md:border-l md:pl-8 md:pt-0 md:text-right">
                <p className="m-0 text-[0.7rem] font-bold uppercase tracking-widest text-slate-500 font-['Inter']">
                  {tr.orderTotalLabel}
                </p>
                <p className="mt-1 whitespace-nowrap font-['Inter'] text-3xl font-extrabold tabular-nums tracking-tight text-slate-900 sm:text-4xl">
                  {fmtMoney(pricing!.lineTotal)}{' '}
                  <span className="text-xl font-bold text-slate-600 sm:text-2xl">{p.currencySuffix}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 border-t border-slate-200/80 pt-6 sm:flex-row sm:items-center sm:gap-6">
            <div className="mx-auto flex h-36 w-36 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/80 ring-1 ring-slate-200/80 sm:mx-0 sm:h-40 sm:w-40">
              <Truck className="h-14 w-14 text-slate-600 sm:h-16 sm:w-16" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
              <div className="min-w-0 flex-1 space-y-2">
                <p className="m-0 text-[0.7rem] font-bold uppercase tracking-widest text-slate-500 font-['Inter']">
                  {tr.orderShippingLabel}
                </p>
                <p className="m-0 font-['Inter'] text-lg font-bold leading-snug text-slate-900 sm:text-xl">
                  {tr.orderShippingTitle}
                </p>
                <p className="m-0 text-sm leading-relaxed text-slate-600 font-['Inter']">{tr.orderShippingSubtitle}</p>
              </div>
              <div className="shrink-0 border-t border-slate-200/90 pt-5 md:w-auto md:border-t-0 md:border-l md:pl-8 md:pt-0 md:text-right">
                <p className="m-0 text-[0.7rem] font-bold uppercase tracking-widest text-slate-500 font-['Inter']">
                  {tr.orderShippingAmountLabel}
                </p>
                <p className="mt-1 whitespace-nowrap font-['Inter'] text-3xl font-extrabold tabular-nums tracking-tight text-slate-900 sm:text-4xl">
                  {fmtMoney(0)}{' '}
                  <span className="text-xl font-bold text-slate-600 sm:text-2xl">{p.currencySuffix}</span>
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setMaxReachedStep((m) => (m < 2 ? 2 : m))
              setActiveStep(2)
            }}
            className="w-full min-h-[48px] rounded-xl bg-slate-900 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {tr.btnContinueStep2}
          </button>
        </div>
      )
    }

    /** After cart checkout the cart is cleared, so `checkoutReady` is false — still show step 4 success. */
    if (!checkoutReady && !(stepId === 4 && orderSubmitted && submittedOrderNumber)) return null

    if (stepId === 2) {
      if (isClientSession && !clientProfileLoaded) {
        return (
          <div className="flex flex-col items-center gap-3 py-10" role="status" aria-live="polite">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-hidden />
            <p className="m-0 text-sm text-slate-600 font-['Inter']">{tr.profileLoadingAccount}</p>
          </div>
        )
      }
      return (
        <form
          noValidate
          className="space-y-6"
          onSubmit={async (e) => {
            e.preventDefault()
            const err: Step2FieldErrors = {}
            if (!shipNume.trim()) err.nume = tr.fieldErrorEmpty
            if (!shipPrenume.trim()) err.prenume = tr.fieldErrorEmpty
            const phoneDigits = shipPhone.replace(/\D/g, '').slice(0, 9)
            if (phoneDigits.length !== 9) err.phone = tr.fieldErrorPhone
            if (!shipEmail.trim()) err.email = tr.fieldErrorEmpty
            else if (!isValidEmail(shipEmail)) err.email = tr.fieldErrorEmail
            if (Object.keys(err).length > 0) {
              setStep2FieldErrors(err)
              return
            }
            setStep2FieldErrors({})
            setProfileSaveError(null)
            if (isClientSession && !profileHasCompletePersonal(profileBaselineRef.current)) {
              setProfileAutosaveBusy(true)
              try {
                const payload = buildCheckoutClientProfilePayload(
                  shipNume,
                  shipPrenume,
                  shipPhone,
                  billAddress,
                  billCounty,
                  billCity,
                  billPostal,
                  differentDeliveryAddress,
                  delAddress,
                  delCounty,
                  delCity,
                  delPostal,
                )
                await putClientProfile(payload, 'personal')
              } catch (saveErr) {
                setProfileSaveError(
                  saveErr instanceof Error ? saveErr.message : tr.profileSaveError,
                )
                setProfileAutosaveBusy(false)
                return
              }
              setProfileAutosaveBusy(false)
            }
            setMaxReachedStep((m) => (m < 3 ? 3 : m))
            setActiveStep(3)
          }}
        >
          <p className="m-0 text-sm leading-relaxed text-slate-600 font-['Inter']">{tr.contactIntro}</p>
          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 sm:pt-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldNume}</span>
              <input
                value={shipNume}
                onChange={(e) => {
                  setStep2FieldErrors((p) => {
                    if (!p.nume) return p
                    const n = { ...p }
                    delete n.nume
                    return n
                  })
                  setShipNume(sanitizePersonName(e.target.value))
                }}
                className={inputClassWithError(Boolean(step2FieldErrors.nume))}
                autoComplete="family-name"
                placeholder={tr.placeholderNume}
                required
                aria-invalid={Boolean(step2FieldErrors.nume)}
                aria-describedby={step2FieldErrors.nume ? 'checkout-step2-nume-err' : undefined}
              />
              <FieldError id="checkout-step2-nume-err" message={step2FieldErrors.nume} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldPrenume}</span>
              <input
                value={shipPrenume}
                onChange={(e) => {
                  setStep2FieldErrors((p) => {
                    if (!p.prenume) return p
                    const n = { ...p }
                    delete n.prenume
                    return n
                  })
                  setShipPrenume(sanitizePersonName(e.target.value))
                }}
                className={inputClassWithError(Boolean(step2FieldErrors.prenume))}
                autoComplete="given-name"
                placeholder={tr.placeholderPrenume}
                required
                aria-invalid={Boolean(step2FieldErrors.prenume)}
                aria-describedby={step2FieldErrors.prenume ? 'checkout-step2-prenume-err' : undefined}
              />
              <FieldError id="checkout-step2-prenume-err" message={step2FieldErrors.prenume} />
            </label>
            <label className="block min-w-0">
              <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldPhone}</span>
              <div className={phoneShellClass(Boolean(step2FieldErrors.phone))}>
                <span className="flex shrink-0 items-center border-r border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold tabular-nums text-slate-700">
                  +40
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  className="min-w-0 flex-1 border-0 bg-transparent px-3.5 text-sm font-['Inter'] text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder={tr.placeholderPhone}
                  value={formatRoNational9Display(shipPhone)}
                  maxLength={11}
                  aria-invalid={Boolean(step2FieldErrors.phone)}
                  aria-describedby={step2FieldErrors.phone ? 'checkout-step2-phone-err' : undefined}
                  onChange={(e) => {
                    setStep2FieldErrors((p) => {
                      if (!p.phone) return p
                      const n = { ...p }
                      delete n.phone
                      return n
                    })
                    setShipPhone(e.target.value.replace(/\D/g, '').slice(0, 9))
                  }}
                />
              </div>
              <FieldError id="checkout-step2-phone-err" message={step2FieldErrors.phone} />
            </label>
            <label className="block min-w-0">
              <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldEmail}</span>
              <input
                type="email"
                value={shipEmail}
                onChange={(e) => {
                  setStep2FieldErrors((p) => {
                    if (!p.email) return p
                    const n = { ...p }
                    delete n.email
                    return n
                  })
                  setShipEmail(sanitizeEmailTyping(e.target.value))
                }}
                className={inputClassWithError(Boolean(step2FieldErrors.email))}
                autoComplete="email"
                placeholder={tr.placeholderEmail}
                required
                aria-invalid={Boolean(step2FieldErrors.email)}
                aria-describedby={step2FieldErrors.email ? 'checkout-step2-email-err' : undefined}
              />
              <FieldError id="checkout-step2-email-err" message={step2FieldErrors.email} />
            </label>
          </div>
          {profileSaveError ? (
            <div className="rounded-xl border border-red-200 bg-red-50/80 px-3 py-2.5" role="alert">
              <p className="m-0 text-sm font-medium text-red-800 font-['Inter']">{profileSaveError}</p>
            </div>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => {
                setProfileSaveError(null)
                setActiveStep(1)
              }}
              disabled={profileAutosaveBusy}
              className={`order-2 min-h-[44px] sm:order-1 ${checkoutBackButtonClass} disabled:opacity-50`}
            >
              ← {cartMode ? tr.btnBackToCart : tr.btnBackStep1}
            </button>
            <button
              type="submit"
              disabled={profileAutosaveBusy}
              className="order-1 min-h-[48px] flex-1 rounded-xl bg-slate-900 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:order-2 sm:max-w-xs"
            >
              {profileAutosaveBusy ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {tr.btnContinueStep3}
                </span>
              ) : (
                tr.btnContinueStep3
              )}
            </button>
          </div>
        </form>
      )
    }

    if (stepId === 3) {
      if (isClientSession && !clientProfileLoaded) {
        return (
          <div className="flex flex-col items-center gap-3 py-10" role="status" aria-live="polite">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-hidden />
            <p className="m-0 text-sm text-slate-600 font-['Inter']">{tr.profileLoadingAccount}</p>
          </div>
        )
      }
      return (
        <form
          noValidate
          className="flex flex-col gap-8"
          onSubmit={async (e) => {
            e.preventDefault()
            const err: Step3FieldErrors = {}
            if (!billAddress.trim()) err.billAddress = tr.fieldErrorEmpty
            if (!billCounty.trim()) err.billCounty = tr.fieldErrorEmpty
            if (!billCity.trim()) err.billCity = tr.fieldErrorEmpty
            if (!billPostal.trim()) err.billPostal = tr.fieldErrorEmpty
            if (differentDeliveryAddress) {
              if (!delAddress.trim()) err.delAddress = tr.fieldErrorEmpty
              if (!delCounty.trim()) err.delCounty = tr.fieldErrorEmpty
              if (!delCity.trim()) err.delCity = tr.fieldErrorEmpty
              if (!delPostal.trim()) err.delPostal = tr.fieldErrorEmpty
            }
            if (Object.keys(err).length > 0) {
              setStep3FieldErrors(err)
              return
            }
            setStep3FieldErrors({})
            setProfileSaveError(null)
            if (isClientSession && !profileHasCompleteAddress(profileBaselineRef.current)) {
              setProfileAutosaveBusy(true)
              try {
                const payload = buildCheckoutClientProfilePayload(
                  shipNume,
                  shipPrenume,
                  shipPhone,
                  billAddress,
                  billCounty,
                  billCity,
                  billPostal,
                  differentDeliveryAddress,
                  delAddress,
                  delCounty,
                  delCity,
                  delPostal,
                )
                await putClientProfile(payload, 'address')
              } catch (saveErr) {
                setProfileSaveError(
                  saveErr instanceof Error ? saveErr.message : tr.profileSaveError,
                )
                setProfileAutosaveBusy(false)
                return
              }
              setProfileAutosaveBusy(false)
            }
            setMaxReachedStep((m) => (m < 4 ? 4 : m))
            setActiveStep(4)
          }}
        >
          <p className="m-0 text-sm leading-relaxed text-slate-600 font-['Inter']">{tr.addressIntro}</p>

          <div>
            <p className="m-0 mb-5 text-sm font-bold text-slate-900 font-['Inter']">{tr.sectionBillingTitle}</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldAddress}</span>
                <input
                  value={billAddress}
                  onChange={(e) => {
                    setStep3FieldErrors((p) => {
                      if (!p.billAddress) return p
                      const n = { ...p }
                      delete n.billAddress
                      return n
                    })
                    setBillAddress(sanitizeAddressField(e.target.value))
                  }}
                  className={inputClassWithError(Boolean(step3FieldErrors.billAddress))}
                  autoComplete="billing street-address"
                  placeholder={tr.placeholderAddress}
                  required
                  aria-invalid={Boolean(step3FieldErrors.billAddress)}
                  aria-describedby={step3FieldErrors.billAddress ? 'checkout-step3-bill-address-err' : undefined}
                />
                <FieldError id="checkout-step3-bill-address-err" message={step3FieldErrors.billAddress} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldCounty}</span>
                <div className="relative">
                  <select
                    value={billCounty}
                    onChange={(e) => {
                      setStep3FieldErrors((p) => {
                        if (!p.billCounty) return p
                        const n = { ...p }
                        delete n.billCounty
                        return n
                      })
                      setBillCounty(e.target.value)
                      setBillCity('')
                    }}
                    className={selectClassWithError(Boolean(step3FieldErrors.billCounty))}
                    required
                    aria-invalid={Boolean(step3FieldErrors.billCounty)}
                    aria-describedby={step3FieldErrors.billCounty ? 'checkout-step3-bill-county-err' : undefined}
                  >
                    <option value="">{tr.selectCountyPlaceholder}</option>
                    {ROMANIAN_COUNTIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                    aria-hidden
                  />
                </div>
                <FieldError id="checkout-step3-bill-county-err" message={step3FieldErrors.billCounty} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldCity}</span>
                <div className="relative">
                  <select
                    value={billCity}
                    disabled={!billCounty}
                    onChange={(e) => {
                      setStep3FieldErrors((p) => {
                        if (!p.billCity) return p
                        const n = { ...p }
                        delete n.billCity
                        return n
                      })
                      setBillCity(e.target.value)
                    }}
                    className={`${selectClassWithError(Boolean(step3FieldErrors.billCity))} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500`}
                    required
                    aria-invalid={Boolean(step3FieldErrors.billCity)}
                    aria-describedby={step3FieldErrors.billCity ? 'checkout-step3-bill-city-err' : undefined}
                  >
                    <option value="">
                      {billCounty ? tr.selectCityPlaceholder : tr.selectCityPlaceholderNeedCounty}
                    </option>
                    {billCities.map((cityName) => (
                      <option key={cityName} value={cityName}>
                        {cityName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                    aria-hidden
                  />
                </div>
                <FieldError id="checkout-step3-bill-city-err" message={step3FieldErrors.billCity} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldPostal}</span>
                <input
                  value={billPostal}
                  onChange={(e) => {
                    setStep3FieldErrors((p) => {
                      if (!p.billPostal) return p
                      const n = { ...p }
                      delete n.billPostal
                      return n
                    })
                    setBillPostal(sanitizePostalField(e.target.value))
                  }}
                  className={`${inputClassWithError(Boolean(step3FieldErrors.billPostal))} max-w-xs`}
                  autoComplete="billing postal-code"
                  placeholder={tr.placeholderPostal}
                  required
                  aria-invalid={Boolean(step3FieldErrors.billPostal)}
                  aria-describedby={step3FieldErrors.billPostal ? 'checkout-step3-bill-postal-err' : undefined}
                />
                <FieldError id="checkout-step3-bill-postal-err" message={step3FieldErrors.billPostal} />
              </label>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={differentDeliveryAddress}
                onChange={(e) => {
                  const on = e.target.checked
                  setDifferentDeliveryAddress(on)
                  if (!on) {
                    setDelAddress('')
                    setDelCounty('')
                    setDelCity('')
                    setDelPostal('')
                    setStep3FieldErrors((p) => {
                      const n = { ...p }
                      delete n.delAddress
                      delete n.delCity
                      delete n.delCounty
                      delete n.delPostal
                      return n
                    })
                  }
                }}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900/20"
              />
              <span className="text-sm leading-snug text-slate-700 font-['Inter']">
                {tr.differentDeliveryPart1}
                <strong className="font-bold text-slate-900">{tr.differentDeliveryBoldDelivery}</strong>
                {tr.differentDeliveryPart2}
                <strong className="font-bold text-slate-900">{tr.differentDeliveryBoldBilling}</strong>
                {tr.differentDeliveryPart3}
              </span>
            </label>
          </div>

          {differentDeliveryAddress ? (
            <div>
              <p className="m-0 mb-5 text-sm font-bold text-slate-900 font-['Inter']">{tr.sectionDeliveryTitle}</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldAddress}</span>
                  <input
                    value={delAddress}
                    onChange={(e) => {
                      setStep3FieldErrors((p) => {
                        if (!p.delAddress) return p
                        const n = { ...p }
                        delete n.delAddress
                        return n
                      })
                      setDelAddress(sanitizeAddressField(e.target.value))
                    }}
                    className={inputClassWithError(Boolean(step3FieldErrors.delAddress))}
                    autoComplete="shipping street-address"
                    placeholder={tr.placeholderAddress}
                    required
                    aria-invalid={Boolean(step3FieldErrors.delAddress)}
                    aria-describedby={step3FieldErrors.delAddress ? 'checkout-step3-del-address-err' : undefined}
                  />
                  <FieldError id="checkout-step3-del-address-err" message={step3FieldErrors.delAddress} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldCounty}</span>
                  <div className="relative">
                    <select
                      value={delCounty}
                      onChange={(e) => {
                        setStep3FieldErrors((p) => {
                          if (!p.delCounty) return p
                          const n = { ...p }
                          delete n.delCounty
                          return n
                        })
                        setDelCounty(e.target.value)
                        setDelCity('')
                      }}
                      className={selectClassWithError(Boolean(step3FieldErrors.delCounty))}
                      required
                      aria-invalid={Boolean(step3FieldErrors.delCounty)}
                      aria-describedby={step3FieldErrors.delCounty ? 'checkout-step3-del-county-err' : undefined}
                    >
                      <option value="">{tr.selectCountyPlaceholder}</option>
                      {ROMANIAN_COUNTIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                      aria-hidden
                    />
                  </div>
                  <FieldError id="checkout-step3-del-county-err" message={step3FieldErrors.delCounty} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldCity}</span>
                  <div className="relative">
                    <select
                      value={delCity}
                      disabled={!delCounty}
                      onChange={(e) => {
                        setStep3FieldErrors((p) => {
                          if (!p.delCity) return p
                          const n = { ...p }
                          delete n.delCity
                          return n
                        })
                        setDelCity(e.target.value)
                      }}
                      className={`${selectClassWithError(Boolean(step3FieldErrors.delCity))} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500`}
                      required
                      aria-invalid={Boolean(step3FieldErrors.delCity)}
                      aria-describedby={step3FieldErrors.delCity ? 'checkout-step3-del-city-err' : undefined}
                    >
                      <option value="">
                        {delCounty ? tr.selectCityPlaceholder : tr.selectCityPlaceholderNeedCounty}
                      </option>
                      {delCities.map((cityName) => (
                        <option key={cityName} value={cityName}>
                          {cityName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                      aria-hidden
                    />
                  </div>
                  <FieldError id="checkout-step3-del-city-err" message={step3FieldErrors.delCity} />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">{tr.fieldPostal}</span>
                  <input
                    value={delPostal}
                    onChange={(e) => {
                      setStep3FieldErrors((p) => {
                        if (!p.delPostal) return p
                        const n = { ...p }
                        delete n.delPostal
                        return n
                      })
                      setDelPostal(sanitizePostalField(e.target.value))
                    }}
                    className={`${inputClassWithError(Boolean(step3FieldErrors.delPostal))} max-w-xs`}
                    autoComplete="shipping postal-code"
                    placeholder={tr.placeholderPostal}
                    required
                    aria-invalid={Boolean(step3FieldErrors.delPostal)}
                    aria-describedby={step3FieldErrors.delPostal ? 'checkout-step3-del-postal-err' : undefined}
                  />
                  <FieldError id="checkout-step3-del-postal-err" message={step3FieldErrors.delPostal} />
                </label>
              </div>
            </div>
          ) : null}

          {profileSaveError ? (
            <div className="rounded-xl border border-red-200 bg-red-50/80 px-3 py-2.5" role="alert">
              <p className="m-0 text-sm font-medium text-red-800 font-['Inter']">{profileSaveError}</p>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => {
                setProfileSaveError(null)
                setActiveStep(2)
              }}
              disabled={profileAutosaveBusy}
              className={`order-2 min-h-[44px] sm:order-1 ${checkoutBackButtonClass} disabled:opacity-50`}
            >
              ← {tr.btnBackStep2}
            </button>
            <button
              type="submit"
              disabled={profileAutosaveBusy}
              className="order-1 min-h-[48px] flex-1 rounded-xl bg-slate-900 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:order-2 sm:max-w-xs"
            >
              {profileAutosaveBusy ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {tr.btnContinueStep4}
                </span>
              ) : (
                tr.btnContinueStep4
              )}
            </button>
          </div>
        </form>
      )
    }

    return (
      <div className="flex flex-col gap-8">
        {orderSubmitted && submittedOrderNumber ? (
          <div className="space-y-5">
            <div className="flex gap-3 rounded-xl border border-emerald-200/90 bg-emerald-50/70 py-4 pl-4 pr-4">
              <CheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" aria-hidden />
              <div className="min-w-0">
                <p className="m-0 font-['Inter'] text-base font-bold text-slate-900">{tr.orderSuccessTitle}</p>
                <p className="mt-3 m-0 font-['Inter'] text-sm font-semibold text-slate-900">
                  {tr.orderNumberLabel}:{' '}
                  <span className="font-mono font-bold tracking-tight">{submittedOrderNumber}</span>
                </p>
                <p className="mt-2 m-0 text-sm leading-relaxed text-slate-700">{tr.orderSuccessBody}</p>
                {isClientSession ? (
                  <p className="mt-2 m-0 text-sm leading-relaxed text-slate-600">{tr.orderTrackHintClient}</p>
                ) : (
                  <p className="mt-2 m-0 text-sm leading-relaxed text-slate-600">
                    {tr.orderTrackHint.replace('{email}', shipEmail.trim())}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {isClientSession ? (
                <Link
                  to="/client/comenzi"
                  className="inline-flex min-h-[44px] max-w-fit items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
                >
                  {tr.orderSuccessViewOrders}
                </Link>
              ) : null}
              <Link
                to="/produse"
                className={`inline-flex min-h-[44px] max-w-fit items-center justify-center rounded-xl px-5 text-sm font-bold shadow-sm transition ${
                  isClientSession
                    ? 'border-2 border-slate-900 bg-white text-slate-900 hover:bg-slate-50'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {tr.browseProducts}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div>
              <p className="m-0 font-['Inter'] text-base font-bold text-slate-900">{tr.paymentCalloutTitle}</p>
              <ol className="mt-4 list-decimal space-y-4 pl-5 text-sm leading-relaxed text-slate-700 marker:font-semibold marker:text-slate-900 font-['Inter']">
                <li className="pl-1">{tr.finalizeStep1}</li>
                <li className="pl-1">{tr.finalizeStep2}</li>
                <li className="pl-1">{tr.finalizeStep3}</li>
                <li className="pl-1">{tr.finalizeStep4}</li>
              </ol>
            </div>
            {orderPlaceError ? (
              <div className="rounded-xl border border-red-200 bg-red-50/80 px-3 py-2.5" role="alert">
                <p className="m-0 text-sm font-medium text-red-800 font-['Inter']">{orderPlaceError}</p>
              </div>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                disabled={orderPlaceLoading}
                className={`order-2 min-h-[44px] sm:order-1 sm:shrink-0 ${checkoutBackButtonClass} disabled:opacity-50`}
              >
                ← {tr.btnBackStep3}
              </button>
              <button
                type="button"
                onClick={() => void handlePlaceGuestOrder()}
                disabled={orderPlaceLoading || !checkoutReady}
                className="order-1 flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:order-2 sm:min-w-[220px] sm:flex-none sm:max-w-md"
              >
                {orderPlaceLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    {tr.orderPlaceLoading}
                  </>
                ) : (
                  tr.btnPlaceOrder
                )}
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <SEO
        title={tr.pageTitle}
        description={tr.pageDescription}
        canonical="/comanda"
        lang={lang}
        noIndex
      />

      <div className="min-h-[68vh] bg-white">
        <div className="mx-auto w-full max-w-content px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:pt-10">
          {/* Breadcrumb */}
          <nav className="mb-6 flex flex-wrap items-center gap-x-1 gap-y-1 text-sm font-medium text-slate-500 font-['Inter']">
            <Link to="/" className="transition-colors hover:text-slate-900">
              {tr.breadcrumbHome}
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            <span className="text-slate-900">{tr.breadcrumbCheckout}</span>
          </nav>

          {/* Page header */}
          <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-['Inter'] text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-[2rem]">
                  {tr.headline}
                </h1>
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm">
                  {isClientSession ? tr.clientBadge : tr.guestBadge}
                </span>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                {isClientSession ? tr.sublineClient : tr.subline}
              </p>
            </div>
          </header>

          {/* Mobile order summary strip */}
          {checkoutReady ? (
            <div className="mb-6 mt-6 flex gap-3 rounded-2xl border border-slate-200/90 bg-[#f7f7f7] p-3 lg:hidden">
              {cartMode ? (
                <>
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-100">
                    <Package className="h-8 w-8 text-slate-500" strokeWidth={1.75} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="truncate font-semibold text-slate-900 font-['Inter'] text-sm">
                      {tr.cartOrderLineCount.replace('{n}', String(cartLines.length))}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      <span className="tabular-nums font-semibold text-slate-800">
                        {cartTotal != null ? fmtMoney(cartTotal) : '—'} {p.currencySuffix}
                      </span>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-100">
                    <img src={img} alt="" className="h-full w-full object-contain p-1" />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="truncate font-semibold text-slate-900 font-['Inter'] text-sm">{product!.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {tr.orderQtyLabel}: {qty}
                      <span className="mx-1.5 text-slate-300">·</span>
                      <span className="tabular-nums font-semibold text-slate-800">
                        {fmtMoney(pricing!.lineTotal)} {p.currencySuffix}
                      </span>
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : null}

          {/* Single column so the step accordion uses full max-w-content (1200px) width */}
          <div className="mt-2 grid grid-cols-1 gap-8 lg:mt-8">
            <div className="min-w-0 w-full">
              <div className="flex w-full flex-col gap-3" role="list" aria-label={tr.stepsAriaLabel}>
                {steps.map((step) => {
                  const Icon = step.icon
                  const reachable = step.id <= maxReachedStep
                  const open = activeStep === step.id
                  const completed = step.id < activeStep
                  return (
                    <div
                      key={step.id}
                      role="listitem"
                      className="w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-[#f7f7f7]"
                    >
                      <button
                        type="button"
                        disabled={!reachable}
                        aria-expanded={open}
                        aria-controls={`checkout-accordion-panel-${step.id}`}
                        id={`checkout-accordion-trigger-${step.id}`}
                        onClick={() => {
                          if (reachable) setActiveStep(step.id)
                        }}
                        className={`flex w-full min-h-[56px] items-center gap-3 px-4 py-3.5 text-left transition-colors sm:gap-4 sm:px-5 sm:py-4 ${
                          open ? 'bg-[#f7f7f7]' : 'bg-[#f7f7f7] hover:bg-neutral-200/40'
                        } ${!reachable ? 'cursor-not-allowed opacity-60' : ''}`}
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
                          id={`checkout-accordion-panel-${step.id}`}
                          role="region"
                          aria-labelledby={`checkout-accordion-trigger-${step.id}`}
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

            {!isClientSession ? (
              <aside className="min-w-0 w-full">
                <div className="mx-auto w-full max-w-xl lg:sticky lg:top-24">
                  <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white">
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                          <UserCircle className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <h2 className="m-0 font-['Inter'] text-lg font-extrabold tracking-tight text-slate-900">
                            {tr.authTitle}
                          </h2>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600">{tr.authSubline}</p>
                        </div>
                      </div>

                      <form className="mt-5 flex flex-col gap-3" onSubmit={handleSidebarSignupSubmit}>
                        {authError ? (
                          <div className="rounded-xl border border-red-200 bg-red-50/80 px-3 py-2.5">
                            <p className="m-0 text-sm text-red-800 font-['Inter']">{authError}</p>
                          </div>
                        ) : null}
                        <label className="block">
                          <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">
                            {tr.authEmail}
                          </span>
                          <input
                            type="email"
                            required
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            autoComplete="email"
                            className={inputClass}
                          />
                        </label>
                        <div>
                          <span className="mb-1.5 block text-sm font-semibold text-slate-800 font-['Inter']">
                            {tr.authPassword}
                          </span>
                          <PasswordInput
                            value={authPassword}
                            onChange={setAuthPassword}
                            autoComplete="new-password"
                            placeholder=""
                            inputClassName="h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-['Inter'] focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={authLoading}
                          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {authLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                              {tr.authLoading}
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 opacity-90" strokeWidth={2.25} aria-hidden />
                              {tr.authSubmit}
                            </>
                          )}
                        </button>
                      </form>

                      <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-200" aria-hidden />
                        <span className="text-xs font-medium text-slate-400 font-['Inter']">{tr.authDividerOr}</span>
                        <div className="h-px flex-1 bg-slate-200" aria-hidden />
                      </div>

                      <GoogleSignupButton
                        label={tr.authGoogleSignup}
                        disabled={authLoading}
                        onToken={handleGuestGoogleToken}
                        onError={(msg) => setAuthError(msg)}
                      />

                      <div className="my-5 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" aria-hidden />

                      <p className="m-0 text-center text-sm text-slate-600 font-['Inter']">
                        {tr.authSignupPrompt}{' '}
                        <Link
                          to={`/login?tab=client&next=${loginNext}`}
                          className="font-bold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
                        >
                          {tr.authSignupLink}
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}
