import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  Check,
  Megaphone,
  Package,
  PenLine,
  Tag,
  X,
} from 'lucide-react'
import type { PartnerWelcomeModalTranslations } from '../../i18n/partner/welcome-modal'
import { PARTNER_OPEN_RFQ_EVENT } from '../../lib/partnerRfqBasket'

type Props = {
  open: boolean
  firstName: string
  tr: PartnerWelcomeModalTranslations
  onDismiss: (dontShowAgain: boolean) => void
  onExploreCatalog: () => void
}

const BENEFIT_ICONS = [Tag, Package, PenLine, Megaphone] as const

function BenefitRow({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Tag
  title: string
  body: string
}) {
  return (
    <div className="flex gap-3 py-2.5">
      <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-[#eaf7f1] text-[#0e8459]">
        <Icon className="h-[19px] w-[19px]" strokeWidth={1.8} aria-hidden />
      </span>
      <div className="min-w-0">
        <b className="block text-base font-semibold leading-snug tracking-[-0.01em] text-[#0f1422]">{title}</b>
        <span className="mt-1 block text-sm leading-relaxed text-[#6a7281]">{body}</span>
      </div>
    </div>
  )
}

function StepRow({
  n,
  title,
  body,
  badge,
  highlight = false,
  showLine = true,
}: {
  n: number
  title: string
  body: string
  badge?: string
  highlight?: boolean
  showLine?: boolean
}) {
  return (
    <div className={`relative flex gap-3.5 pb-[18px] ${showLine ? '' : 'pb-0'}`}>
      {showLine ? (
        <span
          className="pointer-events-none absolute bottom-1.5 left-4 top-8 w-[1.5px] bg-[#e8eaf0]"
          aria-hidden
        />
      ) : null}
      <span
        className={`relative z-[1] grid h-9 w-9 shrink-0 place-items-center rounded-full text-[15px] font-bold ${
          highlight
            ? 'border-[1.5px] border-[#0f1422] bg-[#0f1422] text-white shadow-[0_6px_16px_-6px_rgba(15,20,34,0.55)]'
            : 'border-[1.5px] border-[#d9dde6] bg-[#f4f5f7] text-[#6a7281]'
        }`}
      >
        {n}
      </span>
      <div className="min-w-0 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <b className="text-base font-semibold tracking-[-0.01em] text-[#0f1422]">{title}</b>
          {badge ? (
            <span className="rounded-full bg-[#159b6a] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-white">
              {badge}
            </span>
          ) : null}
        </div>
        <span className="mt-1 block text-sm leading-relaxed text-[#6a7281]">{body}</span>
      </div>
    </div>
  )
}

export function PartnerWelcomePendingDiscountModal({
  open,
  firstName,
  tr,
  onDismiss,
  onExploreCatalog,
}: Props) {
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) setDontShowAgain(false)
  }, [open])

  if (!open || typeof document === 'undefined') return null

  const displayName = firstName.trim() || 'Partener'
  const benefits = [
    { title: tr.benefit1Title, body: tr.benefit1Body },
    { title: tr.benefit2Title, body: tr.benefit2Body },
    { title: tr.benefit3Title, body: tr.benefit3Body },
    { title: tr.benefit4Title, body: tr.benefit4Body },
  ] as const

  const dismiss = () => onDismiss(dontShowAgain)

  return createPortal(
    <div
      className="fixed inset-0 z-[200] grid place-items-center bg-[rgba(15,20,34,0.5)] p-6 font-['Inter']"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) dismiss()
      }}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-[860px] flex-col overflow-y-auto rounded-[20px] bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="partner-welcome-modal-title"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label={tr.closeAria}
          className="absolute right-4 top-4 z-[2] grid h-[34px] w-[34px] place-items-center rounded-[9px] border border-white/20 bg-white/10 text-[#c4cadb] transition hover:bg-white/15 hover:text-white"
        >
          <X className="h-4 w-4" strokeWidth={1.9} />
        </button>

        <div className="rounded-t-[20px] bg-gradient-to-br from-[#141b2c] to-[#0f1422] px-8 pb-[26px] pt-[26px] text-white">
          <div className="mb-4 flex items-center gap-3 pr-10">
            <img
              src="/images/shared/baterino-pro-alb-logo.png"
              alt="Baterino Pro"
              className="h-7 w-auto object-contain"
            />
            <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[rgba(31,179,124,0.16)] px-3 py-1.5 text-xs font-semibold text-[#7ce0b6]">
              <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-[#159b6a]">
                <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} aria-hidden />
              </span>
              {tr.accountCreatedBadge}
            </span>
          </div>
          <h1 id="partner-welcome-modal-title" className="m-0 max-w-[34ch] text-[26px] font-bold leading-tight tracking-[-0.02em] !text-white sm:text-[28px]">
            {tr.title}
            {tr.titleNameSuffix.replace('{name}', displayName)}
          </h1>
          <p className="m-0 mt-3 max-w-[60ch] text-base leading-relaxed text-[#c5cede] sm:text-[17px]">
            {tr.introBefore}
            <b className="font-semibold text-white">{tr.introBold}</b>
            {tr.introAfter}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="border-[#e8eaf0] px-[30px] py-[26px] md:border-r">
            <p className="m-0 mb-4 text-xs font-bold uppercase tracking-[0.1em] text-[#4d6079] sm:text-[13px]">{tr.benefitsTitle}</p>
            {benefits.map((item, i) => (
              <BenefitRow key={item.title} icon={BENEFIT_ICONS[i]} title={item.title} body={item.body} />
            ))}
          </div>
          <div className="border-t border-[#e8eaf0] px-[30px] py-[26px] md:border-t-0">
            <p className="m-0 mb-4 text-xs font-bold uppercase tracking-[0.1em] text-[#4d6079] sm:text-[13px]">{tr.stepsTitle}</p>
            <StepRow
              n={1}
              title={tr.step1Title}
              body={tr.step1Body}
              badge={tr.step1Badge}
              highlight
            />
            <StepRow n={2} title={tr.step2Title} body={tr.step2Body} />
            <StepRow n={3} title={tr.step3Title} body={tr.step3Body} showLine={false} />
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-b-[20px] border-t border-[#e8eaf0] bg-[#f4f5f7] px-8 py-[18px]">
          <div className="flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <label className="flex shrink-0 cursor-pointer select-none items-center gap-2.5 text-sm font-medium text-[#6a7281] sm:text-[15px]">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="peer sr-only"
              />
              <span className="grid h-[18px] w-[18px] place-items-center rounded-[5px] border-[1.5px] border-[#d9dde6] bg-white transition peer-checked:border-[#0f1422] peer-checked:bg-[#0f1422] peer-focus-visible:shadow-[0_0_0_3px_rgba(15,20,34,0.18)] peer-checked:[&>svg]:opacity-100">
                <Check className="h-3 w-3 text-white opacity-0 transition" strokeWidth={3} />
              </span>
              {tr.dontShowAgain}
            </label>
            <p className="m-0 shrink-0 text-right text-sm text-[#6a7281] sm:text-[15px]">
              {tr.helpBefore}
              <Link
                to="/partner/suport"
                onClick={dismiss}
                className="font-semibold text-[#4d6079] no-underline hover:text-[#0f1422]"
              >
                {tr.helpLink}
              </Link>
            </p>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                onExploreCatalog()
                dismiss()
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f1422] px-[22px] py-3.5 text-base font-semibold text-white transition hover:bg-[#1a2233] sm:w-auto sm:text-[17px]"
            >
              {tr.exploreCatalog}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function dispatchPartnerOpenRfqFromWelcome(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(PARTNER_OPEN_RFQ_EVENT))
}
