import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  ArrowUpRight,
  Navigation,
  ChevronRight,
  ChevronDown,
  X,
  CheckCircle2,
} from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { getContactTranslations, type ContactTranslations } from '../i18n/contact'
import { submitInquiry, type InquiryPayload } from '../lib/api'
import SEO from '../components/SEO'
import SchemaOrg from '../components/SchemaOrg'
import { digitsForWaMe, formatPhoneDisplay, telHrefFromStored } from '../lib/contactWhatsApp'
import { departmentRow, ensurePublicDepartmentPhones } from '../lib/departmentPhones'
import ContactStoreLocator from '../components/ContactStoreLocator'
import {
  BATERINO_DIRECTIONS_URL,
  BATERINO_MAP_EMBED_COORDS_URL,
  BATERINO_STREET_ADDRESS,
  BATERINO_ADDRESS_LOCALITY,
  BATERINO_ADDRESS_REGION,
  BATERINO_MAP_CENTER,
} from '../lib/contactStoreLocatorConfig'

const COMPANY_LEGAL_NAME = 'Baterino Energy SRL'
const CONTACT_EMAIL = 'contact@baterino.ro'
const CONTACT_HOURS = 'Luni - Vineri | 8AM - 8PM'

const INITIAL_FORM: InquiryPayload = {
  name: '',
  company: '',
  email: '',
  domain: 'rezidential',
  requestType: 'sales',
  message: '',
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : true,
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-900 font-['Inter']">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputClassName =
  "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm text-slate-900 font-['Inter'] outline-none focus:ring-2 focus:ring-slate-300"

function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClassName} appearance-none cursor-pointer pr-10`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500"
        aria-hidden
      />
    </div>
  )
}

type EmailModalProps = {
  onClose: () => void
  isDesktop: boolean
  tr: ContactTranslations
  initialForm?: Partial<InquiryPayload>
}

function EmailModal({ onClose, isDesktop, tr, initialForm }: EmailModalProps) {
  const [form, setForm] = useState<InquiryPayload>({ ...INITIAL_FORM, ...initialForm })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const set = <K extends keyof InquiryPayload>(key: K) => (value: InquiryPayload[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const valid = Boolean(form.name.trim() && /\S+@\S+\.\S+/.test(form.email) && form.message.trim())

  const domainOptions = [
    { value: 'rezidential', label: tr.domainRezidential },
    { value: 'industrial', label: tr.domainIndustrial },
    { value: 'medical', label: tr.domainMedical },
    { value: 'maritim', label: tr.domainMaritim },
  ] as const

  const requestTypeOptions = [
    { value: 'sales', label: tr.requestSales },
    { value: 'technical', label: tr.requestTechnical },
    { value: 'service', label: tr.requestService },
    { value: 'partnership', label: tr.requestPartnership },
  ] as const

  const submit = async () => {
    if (!valid || status === 'sending') return
    setStatus('sending')
    try {
      await submitInquiry(form)
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/55 p-0 backdrop-blur-sm md:items-center md:p-6"
      role="presentation"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-t-[20px] bg-white p-6 shadow-2xl md:max-h-[90vh] md:rounded-[20px] md:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-email-modal-title"
      >
        {status === 'sent' ? (
          <div className="flex flex-col items-center py-10 text-center">
            <CheckCircle2 size={48} className="text-green-500" aria-hidden />
            <h3
              id="contact-email-modal-title"
              className="mt-4 mb-2 text-xl font-bold text-slate-900 font-['Inter']"
            >
              {tr.modalSuccessTitle}
            </h3>
            <p className="max-w-[360px] text-sm text-slate-500 font-['Inter']">
              {tr.modalSuccessDesc.replace('{email}', form.email)}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white font-['Inter'] hover:bg-slate-800"
            >
              {tr.modalClose}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 id="contact-email-modal-title" className="text-xl font-bold text-slate-900 font-['Inter']">
                  {tr.emailModalTitle}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 font-['Inter']">
                  <Clock size={13} aria-hidden />
                  {tr.mailResponseTime}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={tr.modalClose}
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-neutral-100"
              >
                <X size={20} aria-hidden />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className={`grid gap-4 ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <Field label={`${tr.formName} *`}>
                  <input
                    className={inputClassName}
                    placeholder={tr.formNamePlaceholder}
                    value={form.name}
                    onChange={(e) => set('name')(e.target.value)}
                  />
                </Field>
                <Field label={tr.formCompany}>
                  <input
                    className={inputClassName}
                    placeholder={tr.formCompanyPlaceholder}
                    value={form.company}
                    onChange={(e) => set('company')(e.target.value)}
                  />
                </Field>
              </div>

              <Field label={`${tr.formEmail} *`}>
                <input
                  className={inputClassName}
                  type="email"
                  placeholder={tr.formEmailPlaceholder}
                  value={form.email}
                  onChange={(e) => set('email')(e.target.value)}
                />
              </Field>

              <div className={`grid gap-4 ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <Field label={tr.formDomain}>
                  <Select
                    value={form.domain}
                    onChange={(v) => set('domain')(v as InquiryPayload['domain'])}
                    options={domainOptions.map((o) => ({ value: o.value, label: o.label }))}
                  />
                </Field>
                <Field label={tr.formRequestType}>
                  <Select
                    value={form.requestType}
                    onChange={(v) => set('requestType')(v as InquiryPayload['requestType'])}
                    options={requestTypeOptions.map((o) => ({ value: o.value, label: o.label }))}
                  />
                </Field>
              </div>

              <Field label={`${tr.formMessage} *`}>
                <textarea
                  className={`${inputClassName} min-h-[120px] resize-y`}
                  placeholder={tr.formMessagePlaceholder}
                  value={form.message}
                  onChange={(e) => set('message')(e.target.value)}
                />
              </Field>

              {status === 'error' && (
                <p className="text-sm text-red-600 font-['Inter']">{tr.modalError}</p>
              )}

              <button
                type="button"
                onClick={submit}
                disabled={!valid || status === 'sending'}
                className="rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition-opacity font-['Inter'] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-800"
              >
                {status === 'sending' ? tr.modalSending : tr.modalSendBtn}
              </button>
              <p className="text-xs text-slate-500 font-['Inter']">
                {tr.privacyNotice}{' '}
                <Link to="/politica-confidentialitate" className="underline">
                  {tr.privacyPolicyLink}
                </Link>
                .
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function Contact() {
  const { language } = useLanguage()
  const tr = getContactTranslations(language.code)
  const [searchParams] = useSearchParams()
  const isDesktop = useIsDesktop()
  const [emailOpen, setEmailOpen] = useState(false)
  const [emailFormPreset, setEmailFormPreset] = useState<Partial<InquiryPayload> | undefined>()
  const [generalPhone, setGeneralPhone] = useState<string | undefined>()
  const [generalWhatsapp, setGeneralWhatsapp] = useState<string | undefined>()

  const openEmailModal = useCallback((preset?: Partial<InquiryPayload>) => {
    setEmailFormPreset(preset)
    setEmailOpen(true)
  }, [])

  useEffect(() => {
    ensurePublicDepartmentPhones()
      .then((rows) => {
        const g = departmentRow(rows, 'general')
        const p = g?.phone?.trim()
        const w = g?.whatsapp?.trim()
        if (p) setGeneralPhone(p)
        if (w) setGeneralWhatsapp(w)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const requestType = searchParams.get('requestType')
    if (requestType === 'service') {
      openEmailModal({ requestType: 'service' })
    }
  }, [searchParams, openEmailModal])

  const contactPhoneDisplay = formatPhoneDisplay(generalPhone)
  const contactPhoneTel = telHrefFromStored(generalPhone)
  const contactWaDigits = digitsForWaMe(generalWhatsapp)

  const channels = [
    {
      icon: MessageCircle,
      title: tr.chatWhatsappLabel,
      detail: tr.responseTime,
      schedule: CONTACT_HOURS,
      cta: tr.chatBtn,
      href: `https://wa.me/${contactWaDigits}`,
      primary: true,
    },
    {
      icon: Phone,
      title: tr.phoneChannelTitle,
      detail: tr.callResponseTime,
      schedule: CONTACT_HOURS,
      cta: contactPhoneDisplay,
      href: `tel:${contactPhoneTel}`,
      primary: false,
    },
    {
      icon: Mail,
      title: tr.emailChannelTitle,
      detail: tr.mailResponseTime,
      schedule: tr.emailSchedule,
      cta: tr.emailCta,
      onClick: () => openEmailModal(),
      primary: false,
    },
  ]

  const addressCard = (
    <div
      className={`rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl ${
        isDesktop ? 'absolute bottom-6 right-6 max-w-[380px]' : 'mt-4'
      }`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
            <MapPin size={20} aria-hidden />
          </div>
          <h3 className="font-bold text-slate-900 font-['Inter']">Baterino România</h3>
        </div>
        <p className="text-sm leading-relaxed text-slate-500 font-['Inter']">
          {COMPANY_LEGAL_NAME}
          <br />
          {BATERINO_STREET_ADDRESS}
          <br />
          {BATERINO_ADDRESS_LOCALITY}, {BATERINO_ADDRESS_REGION}
        </p>
      </div>
      <a
        href={BATERINO_DIRECTIONS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-opacity font-['Inter'] hover:opacity-90"
      >
        <Navigation size={16} aria-hidden />
        {tr.directionsBtn}
      </a>
    </div>
  )

  return (
    <>
      <SEO
        title={tr.seoTitle}
        description={tr.seoDesc}
        canonical="/contact"
        lang={language.code}
      />
      <SchemaOrg
        schema={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'Baterino Romania',
          legalName: COMPANY_LEGAL_NAME,
          url: 'https://baterino.ro',
          logo: 'https://baterino.ro/images/shared/baterino-logo-black.svg',
          image: 'https://www.baterino.ro/images/home/og-baterino-romania.jpg',
          email: CONTACT_EMAIL,
          ...(generalPhone ? { telephone: generalPhone } : {}),
          address: {
            '@type': 'PostalAddress',
            streetAddress: BATERINO_STREET_ADDRESS,
            addressLocality: BATERINO_ADDRESS_LOCALITY,
            addressCountry: 'RO',
            addressRegion: BATERINO_ADDRESS_REGION,
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: BATERINO_MAP_CENTER.lat,
            longitude: BATERINO_MAP_CENTER.lng,
          },
          openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '08:00',
            closes: '20:00',
          },
          areaServed: 'RO',
          currenciesAccepted: 'RON',
          priceRange: '$$',
          sameAs: [
            'https://www.facebook.com/baterino.ro/',
            'https://www.linkedin.com/company/baterino-romania',
            'https://www.google.com/maps?cid=15926825830058361764',
          ],
        }}
      />

      {emailOpen && (
        <EmailModal
          onClose={() => setEmailOpen(false)}
          isDesktop={isDesktop}
          tr={tr}
          initialForm={emailFormPreset}
        />
      )}

      <article className="min-h-screen bg-white">
        <div className="mx-auto max-w-content px-5 py-16 lg:px-3 lg:py-24">
          <div className="max-w-[640px]">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 font-['Inter']">
              {tr.subtitle}
            </p>
            <h1 className="mb-6 text-[clamp(2.4rem,6vw,4rem)] font-extrabold uppercase leading-none text-slate-900 font-['Inter']">
              {tr.heroTitle}
            </h1>
            <p className="text-base leading-relaxed text-slate-600 font-['Inter']">{tr.heroDesc}</p>
          </div>

          <div
            className={`mt-12 gap-4 ${isDesktop ? 'grid grid-cols-3' : 'flex flex-col'}`}
          >
            {channels.map((ch) => {
              const Icon = ch.icon
              const sharedClass =
                'group flex flex-col rounded-2xl p-6 text-left transition-transform duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2'
              const sharedStyle = ch.primary
                ? 'border border-slate-900 bg-slate-900 text-white'
                : 'border border-neutral-200 bg-neutral-50 text-slate-900'

              if (ch.href) {
                return (
                  <a
                    key={ch.title}
                    href={ch.href}
                    target={ch.href.startsWith('http') ? '_blank' : undefined}
                    rel={ch.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={`${sharedClass} ${sharedStyle}`}
                  >
                    <ChannelCardBody ch={ch} Icon={Icon} />
                  </a>
                )
              }

              return (
                <button
                  key={ch.title}
                  type="button"
                  onClick={ch.onClick}
                  className={`${sharedClass} ${sharedStyle} cursor-pointer`}
                >
                  <ChannelCardBody ch={ch} Icon={Icon} />
                </button>
              )
            })}
          </div>

          <div className="relative mt-6">
            <div className="overflow-hidden rounded-2xl border border-neutral-200">
              <ContactStoreLocator isDesktop={isDesktop} fallbackEmbedUrl={BATERINO_MAP_EMBED_COORDS_URL} />
            </div>
            {addressCard}
          </div>

          <section className="mt-16 grid gap-8 border-t border-neutral-200 pt-10 md:grid-cols-3">
            {[
              {
                title: tr.baterinoGlobalLabel,
                subtitle: `${tr.accessLabel}: baterino.com`,
                href: 'https://baterino.com',
                external: true,
              },
              {
                title: tr.lithtechLabel,
                subtitle: `${tr.accessLabel}: ltc-energy.com`,
                href: 'https://www.ltc-energy.com/',
                external: true,
              },
              {
                title: tr.distribuitorsLabel,
                subtitle: tr.distribuitorsDesc,
                href: '/login?tab=partener',
                external: false,
              },
            ].map((link) =>
              link.external ? (
                <a
                  key={link.title}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3"
                >
                  <PartnerLinkContent title={link.title} subtitle={link.subtitle} />
                </a>
              ) : (
                <Link key={link.title} to={link.href} className="group flex items-start gap-3">
                  <PartnerLinkContent title={link.title} subtitle={link.subtitle} />
                </Link>
              ),
            )}
          </section>
        </div>
      </article>
    </>
  )
}

type Channel = {
  icon: typeof MessageCircle
  title: string
  detail: string
  schedule: string
  cta: string
  primary: boolean
}

function ChannelCardBody({ ch, Icon }: { ch: Channel; Icon: typeof MessageCircle }) {
  return (
    <>
      <div className="mb-6 flex w-full items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full ${
            ch.primary ? 'bg-white/10' : 'border border-neutral-200 bg-white'
          }`}
        >
          <Icon size={20} aria-hidden />
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium font-['Inter'] ${
            ch.primary ? 'bg-green-500/20 text-green-400' : 'bg-green-500/10 text-green-700'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden />
          {ch.detail}
        </span>
      </div>

      <h3 className="mb-1 text-lg font-bold font-['Inter']">{ch.title}</h3>
      <p
        className={`mb-8 flex items-center gap-1.5 text-sm font-['Inter'] ${
          ch.primary ? 'text-white/65' : 'text-slate-500'
        }`}
      >
        <Clock size={13} aria-hidden />
        {ch.schedule}
      </p>

      <span
        className={`mt-auto inline-flex items-center gap-2 text-sm font-semibold font-['Inter'] ${
          ch.primary ? 'text-white' : 'text-slate-900'
        }`}
      >
        {ch.cta}
        <ArrowUpRight
          size={16}
          className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden
        />
      </span>
    </>
  )
}

function PartnerLinkContent({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <ChevronRight
        size={18}
        className="mt-0.5 transition-transform duration-200 group-hover:translate-x-1"
        aria-hidden
      />
      <div>
        <h4 className="mb-0.5 text-base font-bold text-slate-900 font-['Inter']">{title}</h4>
        <p className="text-sm text-slate-500 font-['Inter']">{subtitle}</p>
      </div>
    </>
  )
}
