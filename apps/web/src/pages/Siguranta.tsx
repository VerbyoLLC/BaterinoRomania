import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { getSigurantaTranslations } from '../i18n/siguranta'
import SEO from '../components/SEO'
import SchemaOrg from '../components/SchemaOrg'
import CTABar from '../components/CTABar'

const CARDS = [
  {
    id: 'swap',
    img: '/images/siguranta/serviciul-baterino-swap.jpg',
    icon: '/images/shared/swap-icon.svg',
    titleKey: 'swapTitle' as const,
    descKey: 'swapDesc' as const,
  },
  {
    id: 'suport',
    img: '/images/siguranta/suport-mentenanta-baterino.jpg',
    icon: '/images/shared/maintance-icon.svg',
    titleKey: 'suportTitle' as const,
    descKey: 'suportDesc' as const,
  },
  {
    id: 'testare',
    img: '/images/siguranta/testare-produse-baterino.jpg',
    icon: '/images/shared/testing-icon.svg',
    titleKey: 'testareTitle' as const,
    descKey: 'testareDesc' as const,
  },
  {
    id: 'garantie',
    img: '/images/siguranta/10-ani-garantie-extinsa.jpg',
    icon: '/images/shared/safety-icon.svg',
    titleKey: 'garantieTitle' as const,
    descKey: 'garantieDesc' as const,
  },
  {
    id: 'service',
    img: '/images/siguranta/sertice-diagnoza-baterino.jpg',
    icon: '/images/shared/romania-flag-icon.svg',
    titleKey: 'serviceTitle' as const,
    descKey: 'serviceDesc' as const,
  },
] as const

function renderBold(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-bold text-black">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

function SigurantaCard({
  img,
  icon,
  title,
  desc,
  readMore,
  onOpen,
  className = '',
}: {
  img: string
  icon: string
  title: string
  desc: string
  readMore: string
  onOpen: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group flex h-full w-full flex-col overflow-hidden rounded-[10px] bg-[#f7f7f7] text-left transition-shadow duration-200 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${className}`}
    >
      <div className="relative h-48 shrink-0 overflow-hidden sm:h-52">
        <img
          src={img}
          alt=""
          aria-hidden
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute left-4 top-4 flex size-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm sm:size-12">
          <img src={icon} alt="" aria-hidden className="size-6 object-contain sm:size-7" />
        </div>
        <h2 className="absolute bottom-3 left-4 right-4 m-0 text-base font-extrabold font-['Inter'] uppercase leading-snug text-white sm:text-lg">
          {title}
        </h2>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="m-0 line-clamp-4 text-sm font-medium font-['Inter'] leading-relaxed text-gray-600">
          {renderBold(desc)}
        </p>
        <span className="mt-4 text-sm font-semibold font-['Inter'] text-slate-900 underline-offset-2 group-hover:underline">
          {readMore}
        </span>
      </div>
    </button>
  )
}

function DetailModal({
  img,
  icon,
  title,
  desc,
  closeLabel,
  onClose,
}: {
  img: string
  icon: string
  title: string
  desc: string
  closeLabel: string
  onClose: () => void
}) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="siguranta-modal-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[10px] bg-white sm:rounded-[10px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-44 shrink-0 overflow-hidden sm:h-52">
          <img src={img} alt="" aria-hidden className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute left-5 top-5 flex size-12 items-center justify-center rounded-full bg-white/90">
            <img src={icon} alt="" aria-hidden className="size-7 object-contain" />
          </div>
        </div>
        <div className="overflow-y-auto px-5 py-6 sm:px-8 sm:py-7">
          <h2
            id="siguranta-modal-title"
            className="m-0 text-xl font-extrabold font-['Inter'] uppercase leading-snug text-black sm:text-2xl"
          >
            {title}
          </h2>
          <p className="mt-4 text-base font-medium font-['Inter'] leading-7 text-gray-600">
            {renderBold(desc)}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-slate-900 px-6 text-sm font-semibold font-['Inter'] text-white transition-colors hover:bg-slate-700 sm:w-auto"
          >
            {closeLabel}
          </button>
        </div>
      </article>
    </div>
  )

  return createPortal(modal, document.body)
}

export default function Siguranta() {
  const { language } = useLanguage()
  const tr = getSigurantaTranslations(language.code)
  const [activeKey, setActiveKey] = useState<string | null>(null)

  const seoTitles: Record<string, string> = {
    ro: 'Siguranță & Garanție',
    en: 'Safety & Warranty',
    zh: '安全与保修',
  }
  const seoDescriptions: Record<string, string> = {
    ro: 'Baterino garantează siguranța produselor prin serviciul SWAP, suport și mentenanță în România, testare avansată cu LithTech și garanție extinsă de 10 ani.',
    en: 'Baterino guarantees product safety through the SWAP service, support and maintenance in Romania, advanced testing with LithTech and an extended 10-year warranty.',
    zh: 'Baterino通过换电服务、罗马尼亚本地支持与维护、与LithTech的先进测试以及10年延长保修来保障产品安全。',
  }

  const pillars = [tr.pillarTrust, tr.pillarStability, tr.pillarPerformance]

  const modalItems = Object.fromEntries(
    CARDS.map((card) => [
      card.id,
      {
        img: card.img,
        icon: card.icon,
        title: tr[card.titleKey],
        desc: tr[card.descKey],
      },
    ]),
  )

  const active = activeKey ? modalItems[activeKey] : null

  return (
    <>
      <SEO
        title={seoTitles[language.code] ?? seoTitles.ro}
        description={seoDescriptions[language.code] ?? seoDescriptions.ro}
        canonical="/siguranta"
        ogImage="/images/siguranta/siguranta-og.jpg"
        lang={language.code}
      />
      <SchemaOrg schema={[
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Siguranță & Garanție',
          description: 'Baterino garantează siguranța produselor prin serviciul SWAP, suport și mentenanță în România, testare avansată cu LithTech și garanție extinsă de 10 ani.',
          url: 'https://baterino.ro/siguranta',
          image: 'https://baterino.ro/images/siguranta/siguranta-og.jpg',
          inLanguage: 'ro',
          publisher: { '@type': 'Organization', name: 'Baterino Romania', url: 'https://baterino.ro', logo: 'https://baterino.ro/images/shared/baterino-logo-black.svg' },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Acasă', item: 'https://baterino.ro' },
            { '@type': 'ListItem', position: 2, name: 'Siguranță', item: 'https://baterino.ro/siguranta' },
          ],
        },
      ]} />

      <article className="max-w-content mx-auto px-5 pb-24 pt-12 lg:px-3 lg:pt-14">
        {/* ── HERO ── */}
        <header className="mb-10 text-center lg:mb-14">
          <p className="mb-3 text-sm font-medium font-['Inter'] uppercase tracking-[0.2em] text-gray-500">
            {tr.supertitle}
          </p>
          <h1 className="mx-auto mb-4 max-w-3xl text-3xl font-extrabold font-['Inter'] leading-tight text-black lg:text-5xl">
            {tr.heroTitle}
          </h1>
          <p className="mx-auto max-w-2xl text-base font-medium font-['Inter'] leading-7 text-gray-600 lg:text-lg">
            {tr.heroSubtitle}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-medium font-['Inter'] uppercase tracking-wider text-gray-400">
              {tr.pillarsEyebrow}
            </span>
            {pillars.map((pillar) => (
              <span
                key={pillar}
                className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold font-['Inter'] uppercase tracking-wide text-white"
              >
                {pillar}
              </span>
            ))}
          </div>
        </header>

        {/* ── CARD GRID ── */}
        <section className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6" aria-label={tr.heroTitle}>
          {CARDS.map((card) => (
            <SigurantaCard
              key={card.id}
              img={card.img}
              icon={card.icon}
              title={tr[card.titleKey]}
              desc={tr[card.descKey]}
              readMore={tr.readMore}
              onOpen={() => setActiveKey(card.id)}
            />
          ))}
        </section>

        {/* ── CTA ── */}
        <div className="mt-12 lg:mt-16">
          <CTABar
            logo="/images/shared/baterino-logo-black.svg"
            logoAlt="Baterino Romania"
            title={tr.ctaTitle}
            desc={tr.ctaDesc}
            btn1Label={tr.ctaBtn1}
            btn1To="/produse"
            btn2Label={tr.ctaBtn2}
            btn2To="/contact"
          />
        </div>
      </article>

      {active ? (
        <DetailModal
          img={active.img}
          icon={active.icon}
          title={active.title}
          desc={active.desc}
          closeLabel={tr.modalClose}
          onClose={() => setActiveKey(null)}
        />
      ) : null}
    </>
  )
}
