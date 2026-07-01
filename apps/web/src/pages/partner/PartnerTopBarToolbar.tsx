import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Cable, FileText, ShoppingBag } from 'lucide-react'
import CompatibilitateInvertorModal from '../../components/CompatibilitateInvertorModal'
import { useLanguage } from '../../contexts/LanguageContext'
import { getPartnerDashboardTranslations } from '../../i18n/partner/dashboard'
import { getPartnerProductsTranslations, partnerToolbarLabels } from '../../i18n/partner/products'
import { getPartnerProfile, partnerCanSeeDiscountPrices, partnerDiscountConfigured } from '../../lib/api'
import {
  PARTNER_CART_UPDATED_EVENT,
  PARTNER_OPEN_CART_EVENT,
  partnerCartStoredTotalQuantity,
} from '../../lib/partnerCart'
import {
  PARTNER_OPEN_RFQ_EVENT,
  PARTNER_RFQ_UPDATED_EVENT,
  partnerRfqStoredTotalQuantity,
} from '../../lib/partnerRfqBasket'

const PARTNER_TOOLBAR_ICON_BTN =
  'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/80 disabled:opacity-50'

export function PartnerTopBarToolbar() {
  const { language } = useLanguage()
  const trToolbar = partnerToolbarLabels(language.code)
  const trProducts = getPartnerProductsTranslations(language.code)
  const trDash = getPartnerDashboardTranslations(language.code)
  const location = useLocation()
  const navigate = useNavigate()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [invertorModalOpen, setInvertorModalOpen] = useState(false)
  const [cartTotalItems, setCartTotalItems] = useState(() => partnerCartStoredTotalQuantity())
  const [rfqTotalItems, setRfqTotalItems] = useState(() => partnerRfqStoredTotalQuantity())
  const [partnerDiscountPercent, setPartnerDiscountPercent] = useState<number | null>(null)
  const [partnerContractSignedAt, setPartnerContractSignedAt] = useState<string | null>(null)
  const discountConfigured = partnerDiscountConfigured(partnerDiscountPercent)
  const discountPricesVisible = partnerCanSeeDiscountPrices({
    partnerDiscountPercent,
    partnerContractSignedAt,
  })

  useEffect(() => {
    getPartnerProfile()
      .then((p) => {
        setPartnerDiscountPercent(p?.partnerDiscountPercent ?? null)
        setPartnerContractSignedAt(
          typeof p?.partnerContractSignedAt === 'string' && p.partnerContractSignedAt.trim()
            ? p.partnerContractSignedAt
            : null,
        )
      })
      .catch(() => {
        setPartnerDiscountPercent(null)
        setPartnerContractSignedAt(null)
      })
  }, [])

  const syncCartCount = useCallback(() => {
    setCartTotalItems(partnerCartStoredTotalQuantity())
  }, [])

  const syncRfqCount = useCallback(() => {
    setRfqTotalItems(partnerRfqStoredTotalQuantity())
  }, [])

  useEffect(() => {
    syncCartCount()
    window.addEventListener(PARTNER_CART_UPDATED_EVENT, syncCartCount)
    window.addEventListener('storage', syncCartCount)
    window.addEventListener('focus', syncCartCount)
    return () => {
      window.removeEventListener(PARTNER_CART_UPDATED_EVENT, syncCartCount)
      window.removeEventListener('storage', syncCartCount)
      window.removeEventListener('focus', syncCartCount)
    }
  }, [syncCartCount])

  useEffect(() => {
    syncRfqCount()
    window.addEventListener(PARTNER_RFQ_UPDATED_EVENT, syncRfqCount)
    window.addEventListener('storage', syncRfqCount)
    window.addEventListener('focus', syncRfqCount)
    return () => {
      window.removeEventListener(PARTNER_RFQ_UPDATED_EVENT, syncRfqCount)
      window.removeEventListener('storage', syncRfqCount)
      window.removeEventListener('focus', syncRfqCount)
    }
  }, [syncRfqCount])

  const onCartClick = () => {
    setNotificationsOpen(false)
    if (location.pathname.startsWith('/partner/produse')) {
      window.dispatchEvent(new CustomEvent(PARTNER_OPEN_CART_EVENT))
    } else {
      navigate('/partner/produse', { state: { openCart: true } })
    }
  }

  const onRfqClick = () => {
    setNotificationsOpen(false)
    if (location.pathname.startsWith('/partner/produse')) {
      window.dispatchEvent(new CustomEvent(PARTNER_OPEN_RFQ_EVENT))
    } else {
      navigate('/partner/produse', { state: { openRfq: true } })
    }
  }

  const onInverterClick = () => {
    setNotificationsOpen(false)
    setInvertorModalOpen(true)
  }

  return (
    <>
      <div className="relative flex shrink-0 items-center gap-2">
        {notificationsOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-[35] cursor-default border-0 bg-transparent p-0 m-0"
            aria-hidden
            tabIndex={-1}
            onClick={() => setNotificationsOpen(false)}
          />
        ) : null}
        <div className="relative shrink-0">
          <button
            type="button"
            id="partner-toolbar-notifications"
            aria-label={trToolbar.notifications}
            aria-expanded={notificationsOpen}
            aria-controls="partner-notifications-popover"
            aria-haspopup="dialog"
            onClick={() => setNotificationsOpen((v) => !v)}
            className={PARTNER_TOOLBAR_ICON_BTN}
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </button>

          {notificationsOpen ? (
            <div
              role="dialog"
              id="partner-notifications-popover"
              aria-labelledby="partner-notifications-heading"
              className="absolute right-0 top-[calc(100%+8px)] z-[310] w-[min(calc(100vw-3rem),18rem)] rounded-xl border border-slate-200 bg-white p-4 text-left shadow-lg ring-1 ring-slate-900/5"
            >
              <p
                id="partner-notifications-heading"
                className="m-0 text-sm font-semibold text-slate-900 font-['Inter'] leading-snug"
              >
                {trToolbar.notificationsEmptyTitle}
              </p>
              <p className="mt-1.5 m-0 text-xs leading-relaxed text-slate-500 font-['Inter']">
                {trToolbar.notificationsEmptySubtitle}
              </p>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          id="partner-toolbar-inverter-compatibility"
          onClick={onInverterClick}
          title={trDash.searchInverterCompatibility}
          aria-label={trDash.searchInverterCompatibilitySr}
          className={PARTNER_TOOLBAR_ICON_BTN}
        >
          <Cable className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        </button>
        {discountPricesVisible ? (
          <>
            <button
              type="button"
              onClick={onCartClick}
              aria-label={trProducts.cartAriaWithCount.replace('{count}', String(cartTotalItems))}
              className={PARTNER_TOOLBAR_ICON_BTN}
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={2} />
              {cartTotalItems > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-white font-['Inter']">
                  {cartTotalItems > 99 ? '99+' : cartTotalItems}
                </span>
              )}
            </button>
            {rfqTotalItems > 0 ? (
              <button
                type="button"
                onClick={onRfqClick}
                aria-label={trProducts.rfqAriaWithCount.replace('{count}', String(rfqTotalItems))}
                className={PARTNER_TOOLBAR_ICON_BTN}
              >
                <FileText className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-white font-['Inter']">
                  {rfqTotalItems > 99 ? '99+' : rfqTotalItems}
                </span>
              </button>
            ) : null}
          </>
        ) : !discountConfigured ? (
          <button
            type="button"
            onClick={onRfqClick}
            aria-label={trProducts.rfqAriaWithCount.replace('{count}', String(rfqTotalItems))}
            className={PARTNER_TOOLBAR_ICON_BTN}
          >
            <FileText className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
            {rfqTotalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-white font-['Inter']">
                {rfqTotalItems > 99 ? '99+' : rfqTotalItems}
              </span>
            )}
          </button>
        ) : null}
      </div>
      {invertorModalOpen ? (
        <CompatibilitateInvertorModal onClose={() => setInvertorModalOpen(false)} />
      ) : null}
    </>
  )
}
