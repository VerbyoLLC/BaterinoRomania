import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { getLithTechTranslations } from '../i18n/lithtech'
import SEO from '../components/SEO'
import CTABar from '../components/CTABar'

type FeatureItem = { icon: string; title: string; desc: string }

/** Two-line brand title above each image column */
function ColumnHeader({ brand, title, align }: { brand: string; title: string; align: 'left' | 'right' }) {
  return (
    <div className={`flex flex-col justify-end h-auto lg:h-20 mb-6 lg:mb-[50px] text-left ${align === 'right' ? 'lg:text-right' : 'lg:text-left'}`}>
      <span className="text-neutral-600 text-3xl lg:text-4xl font-extrabold font-['Inter'] leading-tight lg:leading-10 block">{brand}</span>
      <span className="text-black    text-3xl lg:text-4xl font-extrabold font-['Inter'] leading-tight lg:leading-10 block">{title}</span>
    </div>
  )
}

/** Single feature item: icon + title + desc (desktop) */
function FeatureItem({ icon, title, desc }: FeatureItem) {
  return (
    <div>
      <h3 className="text-black text-xl font-semibold font-['Inter'] leading-7 pl-[102px] mb-1">
        {title}
      </h3>
      <div className="flex items-start">
        <div className="w-[102px] flex-shrink-0 flex justify-start pt-1">
          <img src={icon} alt="" aria-hidden className="w-16 h-16 object-contain" />
        </div>
        <p className="text-black text-lg font-normal font-['Inter'] leading-7 flex-1">
          {desc}
        </p>
      </div>
    </div>
  )
}

/** Mobile hero text block: brand + title */
function MobileHeroCard({ brand, title }: { brand: string; title: string }) {
  return (
    <div className="w-full mb-4 text-center">
      <span className="text-neutral-600 text-2xl font-extrabold font-['Inter'] leading-9 block">{brand}</span>
      <span className="text-black text-2xl font-extrabold font-['Inter'] leading-9 block">{title}</span>
    </div>
  )
}

/** Card layout for mobile feature items */
function MobileFeatureCard({ icon, title, desc }: FeatureItem) {
  return (
    <div className="w-full h-80 relative">
      <div className="absolute inset-0 bg-neutral-100 rounded-[10px]" />
      <img
        className="w-20 h-14 absolute left-1/2 -translate-x-1/2 top-[21px] object-contain"
        src={icon}
        alt=""
        aria-hidden
      />
      <div className="absolute left-[37px] right-[37px] top-[93px] text-center text-black text-xl font-semibold font-['Inter'] leading-7">
        {title}
      </div>
      <div className="absolute left-[15px] right-[15px] top-[144px] text-center text-black text-lg font-normal font-['Inter'] leading-7">
        {desc}
      </div>
    </div>
  )
}

/** Image panel with logo overlay */
function ImagePanel({
  img, logo, logoAlt, logoPosition, alt,
}: {
  img: string; logo: string; logoAlt: string; logoPosition: 'left' | 'right'; alt: string
}) {
  return (
    <div className="relative h-[320px] rounded-[10px] overflow-hidden bg-neutral-100">
      <img
        src={img} alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
      />
      <img
        src={logo} alt={logoAlt}
        className={`absolute bottom-4 ${logoPosition === 'right' ? 'right-4' : 'left-4'} h-7 w-auto object-contain`}
      />
    </div>
  )
}

/** Reusable section title – centered on mobile */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-black text-xl font-extrabold font-['Inter'] leading-7 text-center lg:text-left">{children}</h2>
  )
}

/** Mobile image panel with logo overlay */
function MobilePanelImage({ img, logo, logoAlt }: { img: string; logo: string; logoAlt: string }) {
  return (
    <div className="w-full h-48 relative my-4">
      <img
        className="absolute inset-0 w-full h-full object-cover rounded-[5px]"
        src={img} alt=""
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
      />
      <img
        className="w-44 h-7 absolute left-1/2 -translate-x-1/2 top-[148px] object-contain"
        src={logo} alt={logoAlt}
      />
    </div>
  )
}

/** Arrow pointing down, placed under an image panel */
function MobileArrow() {
  return (
    <div className="flex justify-center my-4">
      <img className="size-14" src="/images/lithtech/Arrow.svg" alt="" aria-hidden />
    </div>
  )
}

export default function LithTech() {
  const { language } = useLanguage()
  const tr = getLithTechTranslations(language.code)

  const seoTitles: Record<string, string> = {
    ro: 'Parteneriat Strategic LithTech',
    en: 'LithTech Strategic Partnership',
    zh: 'LithTech战略合作',
  }
  const seoDescriptions: Record<string, string> = {
    ro: 'Baterino, importator unic pentru tehnologie avansată de stocare LiFePo4, în parteneriat strategic cu LithTech: sisteme BMS/EMS, baterii solid-state și implementare completă în România.',
    en: 'Baterino, sole importer of advanced LiFePo4 storage technology, in strategic partnership with LithTech: BMS/EMS systems, solid-state batteries and full implementation in Romania.',
    zh: 'Baterino，先进LiFePo4储能技术的独家进口商，与LithTech战略合作：BMS/EMS系统、固态电池及在罗马尼亚的完整实施。',
  }

  const [showAllTech, setShowAllTech] = useState(false)
  const [showAllImpl, setShowAllImpl] = useState(false)
  const [showAllCtrl, setShowAllCtrl] = useState(false)
  const [showAllSuport, setShowAllSuport] = useState(false)

  const techItems: FeatureItem[] = [
    { icon: '/images/shared/battery-icon.svg',             title: tr.tech1Title, desc: tr.tech1Desc },
    { icon: '/images/shared/solid-state-battery-icon.svg', title: tr.tech2Title, desc: tr.tech2Desc },
    { icon: '/images/shared/hidrogen-icon.svg',            title: tr.tech3Title, desc: tr.tech3Desc },
  ]

  const implItems: FeatureItem[] = [
    { icon: '/images/shared/delivery-icon.svg',      title: tr.impl1Title, desc: tr.impl1Desc },
    { icon: '/images/shared/compatibility-icon.svg', title: tr.impl2Title, desc: tr.impl2Desc },
    { icon: '/images/shared/solar-panels-icon.svg',  title: tr.impl3Title, desc: tr.impl3Desc },
  ]

  const ctrlItems: FeatureItem[] = [
    { icon: '/images/shared/safety-icon.svg', title: tr.ctrl1Title, desc: tr.ctrl1Desc },
    { icon: '/images/shared/ems-icon.svg',    title: tr.ctrl2Title, desc: tr.ctrl2Desc },
    { icon: '/images/shared/bms-icon.svg',    title: tr.ctrl3Title, desc: tr.ctrl3Desc },
  ]

  const suportItems: FeatureItem[] = [
    { icon: '/images/shared/service-icon.svg',      title: tr.suport1Title, desc: tr.suport1Desc },
    { icon: '/images/shared/swap-icon.svg',         title: tr.suport2Title, desc: tr.suport2Desc },
    { icon: '/images/shared/support-call-icon.svg', title: tr.suport3Title, desc: tr.suport3Desc },
  ]

  return (
    <>
      <SEO
        title={seoTitles[language.code] ?? seoTitles.ro}
        description={seoDescriptions[language.code] ?? seoDescriptions.ro}
        canonical="/parteneriat-strategic-lithtech-baterino"
        ogImage="/images/lithtech/importator-lithtech-og.jpg"
        lang={language.code}
      />
      <article className="max-w-content mx-auto px-5 lg:px-3 pt-16 pb-24">

        {/* ── BLOCK 1: Partnership ── */}
        <section className="mb-24">
          {/* Supertitle – desktop only */}
          <p className="hidden lg:block text-center text-black text-xl font-medium font-['Inter'] leading-[56px] mb-4">
            {tr.supertitle}
          </p>

          {/* Mobile supertitle – sits above all sections */}
          <div className="lg:hidden w-full text-center text-black text-xl font-medium font-['Inter'] leading-7 mb-4">
            {tr.supertitle}
          </div>

          {/* ── MOBILE LAYOUT ── */}
          <div className="lg:hidden flex flex-col gap-16">
            {/* Left column: LithTech */}
            <div>
              <MobileHeroCard brand={tr.sectionALeftBrand} title={tr.sectionALeftTitle} />
              <div className="bg-neutral-50 rounded-[10px] p-4 flex flex-col gap-4">
                <MobilePanelImage
                  img="/images/lithtech/fabricare-produse-mobil.jpg"
                  logo="/images/shared/lithtech-logo-white.png"
                  logoAlt="LithTech"
                />
                <MobileArrow />
                <SectionTitle>{tr.sectionBLeftTitle}</SectionTitle>
                <div className="flex flex-col gap-4">
                  <MobileFeatureCard {...techItems[0]} />
                  {showAllTech && techItems.slice(1).map((item, i) => <MobileFeatureCard key={i} {...item} />)}
                </div>
              </div>
              {!showAllTech && (
                <div className="flex flex-col items-center gap-[50px] mt-4">
                  <button
                    onClick={() => setShowAllTech(true)}
                    className="w-full h-12 rounded-[10px] outline outline-1 outline-slate-900 text-slate-900 font-semibold text-sm hover:bg-slate-900 hover:text-white transition-colors"
                  >
                    {tr.loadMore}
                  </button>
                  <img className="size-14" src="/images/lithtech/Arrow.svg" alt="" aria-hidden />
                </div>
              )}
            </div>

            {/* Right column: Baterino */}
            <div>
              <MobileHeroCard brand={tr.sectionARightBrand} title={tr.sectionARightTitle} />
              <div className="bg-neutral-50 rounded-[10px] p-4 flex flex-col gap-4">
                <MobilePanelImage
                  img="/images/lithtech/implementare-baterino-mobil.jpg"
                  logo="/images/lithtech/logo-baterino-pro-white.png"
                  logoAlt="Baterino PRO"
                />
                <MobileArrow />
                <SectionTitle>{tr.sectionBRightTitle}</SectionTitle>
                <div className="flex flex-col gap-4">
                  <MobileFeatureCard {...implItems[0]} />
                  {showAllImpl && implItems.slice(1).map((item, i) => <MobileFeatureCard key={i} {...item} />)}
                </div>
              </div>
              {!showAllImpl && (
                <div className="flex flex-col items-center gap-[50px] mt-4">
                  <button
                    onClick={() => setShowAllImpl(true)}
                    className="w-full h-12 rounded-[10px] outline outline-1 outline-slate-900 text-slate-900 font-semibold text-sm hover:bg-slate-900 hover:text-white transition-colors"
                  >
                    {tr.loadMore}
                  </button>
                  <img className="size-14" src="/images/lithtech/Arrow.svg" alt="" aria-hidden />
                </div>
              )}
            </div>
          </div>

          {/* ── DESKTOP LAYOUT ── */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-6">
              <ColumnHeader brand={tr.sectionALeftBrand} title={tr.sectionALeftTitle} align="right" />
              <ColumnHeader brand={tr.sectionARightBrand} title={tr.sectionARightTitle} align="left" />
            </div>
            <div className="grid grid-cols-2 gap-6 mb-5">
              <ImagePanel img="/images/lithtech/fabricare-produse.jpg" logo="/images/shared/lithtech-logo-white.png" logoAlt="LithTech" logoPosition="right" alt={tr.sectionALeftTitle} />
              <ImagePanel img="/images/lithtech/implementare-baterino.jpg" logo="/images/lithtech/logo-baterino-pro-white.png" logoAlt="Baterino PRO" logoPosition="right" alt={tr.sectionARightTitle} />
            </div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <SectionTitle>{tr.sectionBLeftTitle}</SectionTitle>
              <SectionTitle>{tr.sectionBRightTitle}</SectionTitle>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-[43px]">
              <FeatureItem {...techItems[0]} />
              <FeatureItem {...implItems[0]} />
              <FeatureItem {...techItems[1]} />
              <FeatureItem {...implItems[1]} />
              <FeatureItem {...techItems[2]} />
              <FeatureItem {...implItems[2]} />
            </div>
          </div>
        </section>


        {/* ── BLOCK 2: Safety ── */}
        <section className="mb-16">

          {/* ── MOBILE LAYOUT ── */}
          <div className="lg:hidden flex flex-col gap-16">
            {/* Left column: LithTech */}
            <div>
              <MobileHeroCard brand={tr.sectionCLeftBrand} title={tr.sectionCLeftTitle} />
              <div className="bg-neutral-50 rounded-[10px] p-4 flex flex-col gap-4">
                <MobilePanelImage
                  img="/images/lithtech/siguranta-mobile.jpg"
                  logo="/images/shared/lithtech-logo-white.png"
                  logoAlt="LithTech"
                />
                <MobileArrow />
                <SectionTitle>{tr.sectionDLeftTitle}</SectionTitle>
                <div className="flex flex-col gap-4">
                  <MobileFeatureCard {...ctrlItems[0]} />
                  {showAllCtrl && ctrlItems.slice(1).map((item, i) => <MobileFeatureCard key={i} {...item} />)}
                </div>
              </div>
              {!showAllCtrl && (
                <div className="flex flex-col items-center gap-[50px] mt-4">
                  <button
                    onClick={() => setShowAllCtrl(true)}
                    className="w-full h-12 rounded-[10px] outline outline-1 outline-slate-900 text-slate-900 font-semibold text-sm hover:bg-slate-900 hover:text-white transition-colors"
                  >
                    {tr.loadMore}
                  </button>
                  <img className="size-14" src="/images/lithtech/Arrow.svg" alt="" aria-hidden />
                </div>
              )}
            </div>

            {/* Right column: Baterino */}
            <div>
              <MobileHeroCard brand={tr.sectionCRightBrand} title={tr.sectionCRightTitle} />
              <div className="bg-neutral-50 rounded-[10px] p-4 flex flex-col gap-4">
                <MobilePanelImage
                  img="/images/lithtech/suport-mobile.jpg"
                  logo="/images/lithtech/logo-baterino-pro-white.png"
                  logoAlt="Baterino PRO"
                />
                <MobileArrow />
                <SectionTitle>{tr.sectionDRightTitle}</SectionTitle>
                <div className="flex flex-col gap-4">
                  <MobileFeatureCard {...suportItems[0]} />
                  {showAllSuport && suportItems.slice(1).map((item, i) => <MobileFeatureCard key={i} {...item} />)}
                </div>
              </div>
              {!showAllSuport && (
                <div className="flex flex-col items-center gap-[50px] mt-4">
                  <button
                    onClick={() => setShowAllSuport(true)}
                    className="w-full h-12 rounded-[10px] outline outline-1 outline-slate-900 text-slate-900 font-semibold text-sm hover:bg-slate-900 hover:text-white transition-colors"
                  >
                    {tr.loadMore}
                  </button>
                  <img className="size-14" src="/images/lithtech/Arrow.svg" alt="" aria-hidden />
                </div>
              )}
            </div>
          </div>

          {/* ── DESKTOP LAYOUT ── */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-6">
              <ColumnHeader brand={tr.sectionCLeftBrand} title={tr.sectionCLeftTitle} align="right" />
              <ColumnHeader brand={tr.sectionCRightBrand} title={tr.sectionCRightTitle} align="left" />
            </div>
            <div className="grid grid-cols-2 gap-6 mb-5">
              <ImagePanel img="/images/lithtech/siguranta.jpg" logo="/images/shared/lithtech-logo-white.png" logoAlt="LithTech" logoPosition="right" alt={tr.sectionCLeftTitle} />
              <ImagePanel img="/images/lithtech/suport.jpg" logo="/images/lithtech/logo-baterino-pro-white.png" logoAlt="Baterino PRO" logoPosition="right" alt={tr.sectionCRightTitle} />
            </div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <SectionTitle>{tr.sectionDLeftTitle}</SectionTitle>
              <SectionTitle>{tr.sectionDRightTitle}</SectionTitle>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-[43px]">
              <FeatureItem {...ctrlItems[0]} />
              <FeatureItem {...suportItems[0]} />
              <FeatureItem {...ctrlItems[1]} />
              <FeatureItem {...suportItems[1]} />
              <FeatureItem {...ctrlItems[2]} />
              <FeatureItem {...suportItems[2]} />
            </div>
          </div>
        </section>


        {/* ── CTA bar ── */}
        <CTABar
          logo="/images/shared/baterino-logo-black.svg"
          logoAlt="Baterino Romania"
          title={tr.ctaTitle}
          desc={tr.ctaDesc}
          btn1Label={tr.ctaBtn1}
          btn1To="/produse"
          btn2Label={tr.ctaBtn2}
          btn2To="/companie/viziune"
        />

      </article>
    </>
  )
}
