import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftRight, Headphones, Percent, Shield, Undo2 } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import type { LangCode } from '../../i18n/menu'
import { getClientBenefitsTranslations } from '../../i18n/client-benefits'
import { INSTALATORI_ONLY } from '../../lib/siteMode'
import { CONTACT_WHATSAPP_WAME } from '../../lib/contactWhatsApp'
import CompatibilitateInvertorModal from '../../components/CompatibilitateInvertorModal'

/** Aceleași token-uri vizuale ca pe `ClientDashboard` (`DashboardCard`). */
const benefitCardClass =
  'flex h-full min-h-[12rem] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-slate-300 hover:shadow'

function BenefitCard({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  action: ReactNode
}) {
  return (
    <article className={benefitCardClass}>
      <div
        className="mb-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 [&_img]:h-6 [&_img]:w-6 [&_img]:object-contain [&_svg]:h-5 [&_svg]:w-5"
        aria-hidden
      >
        {icon}
      </div>
      <h2 className="mb-1.5 mt-0 text-lg font-bold leading-snug text-slate-900 font-['Inter']">{title}</h2>
      <p className="mb-4 flex-1 text-sm leading-snug text-slate-600 font-['Inter']">{description}</p>
      <div className="mt-auto flex justify-center">{action}</div>
    </article>
  )
}

function pillButtonClass(extra?: string) {
  return `inline-flex w-full max-w-[17.5rem] items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 font-['Inter'] ${extra ?? ''}`
}

export default function ClientBenefits() {
  const { language } = useLanguage()
  const lang = language.code as LangCode
  const tr = getClientBenefitsTranslations(lang)
  const [invertorOpen, setInvertorOpen] = useState(false)

  const waSupportHref = useMemo(
    () =>
      `https://wa.me/${CONTACT_WHATSAPP_WAME}?text=${encodeURIComponent(tr.waSupportPrefill)}`,
    [tr.waSupportPrefill],
  )
  const waReturnHref = useMemo(
    () =>
      `https://wa.me/${CONTACT_WHATSAPP_WAME}?text=${encodeURIComponent(tr.waReturnPrefill)}`,
    [tr.waReturnPrefill],
  )
  const waWarrantyHref = useMemo(
    () =>
      `https://wa.me/${CONTACT_WHATSAPP_WAME}?text=${encodeURIComponent(tr.waWarrantyPrefill)}`,
    [tr.waWarrantyPrefill],
  )

  return (
    <div className="mx-auto max-w-6xl font-['Inter']">
      <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-slate-900">{tr.pageTitle}</h1>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-slate-600">{tr.pageSubtitle}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {!INSTALATORI_ONLY ? (
          <BenefitCard
            icon={<Percent className="text-slate-800" strokeWidth={2} aria-hidden />}
            title={tr.c1Title}
            description={tr.c1Desc}
            action={
              <Link to="/reduceri" className={pillButtonClass()}>
                {tr.c1Btn}
              </Link>
            }
          />
        ) : null}

        <BenefitCard
          icon={
            <img src="/images/shared/compatibility-icon.svg" alt="" aria-hidden className="object-contain" />
          }
          title={tr.c2Title}
          description={tr.c2Desc}
          action={
            <button type="button" className={pillButtonClass()} onClick={() => setInvertorOpen(true)}>
              {tr.c2Btn}
            </button>
          }
        />

        <BenefitCard
          icon={<Headphones className="text-slate-800" strokeWidth={2} aria-hidden />}
          title={tr.c3Title}
          description={tr.c3Desc}
          action={
            <a
              href={waSupportHref}
              target="_blank"
              rel="noopener noreferrer"
              className={pillButtonClass()}
            >
              {tr.c3Btn}
            </a>
          }
        />

        <BenefitCard
          icon={<Shield className="text-slate-800" strokeWidth={2} aria-hidden />}
          title={tr.c4Title}
          description={tr.c4Desc}
          action={
            INSTALATORI_ONLY ? (
              <a
                href={waWarrantyHref}
                target="_blank"
                rel="noopener noreferrer"
                className={pillButtonClass()}
              >
                {tr.c4Btn}
              </a>
            ) : (
              <Link to="/termeni-si-conditii" className={pillButtonClass()}>
                {tr.c4Btn}
              </Link>
            )
          }
        />

        <BenefitCard
          icon={<ArrowLeftRight className="text-slate-800" strokeWidth={2} aria-hidden />}
          title={tr.c5Title}
          description={tr.c5Desc}
          action={
            INSTALATORI_ONLY ? (
              <a
                href={waSupportHref}
                target="_blank"
                rel="noopener noreferrer"
                className={pillButtonClass()}
              >
                {tr.c5Btn}
              </a>
            ) : (
              <Link to="/contact" className={pillButtonClass()}>
                {tr.c5Btn}
              </Link>
            )
          }
        />

        <BenefitCard
          icon={<Undo2 className="text-slate-800" strokeWidth={2} aria-hidden />}
          title={tr.c6Title}
          description={tr.c6Desc}
          action={
            <a
              href={waReturnHref}
              target="_blank"
              rel="noopener noreferrer"
              className={pillButtonClass()}
            >
              {tr.c6Btn}
            </a>
          }
        />
      </div>

      {invertorOpen ? <CompatibilitateInvertorModal onClose={() => setInvertorOpen(false)} /> : null}
    </div>
  )
}
