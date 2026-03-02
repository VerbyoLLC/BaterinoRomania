import { useLanguage } from '../contexts/LanguageContext'
import { getSigurantaTranslations } from '../i18n/siguranta'
import SEO from '../components/SEO'
import CTABar from '../components/CTABar'

const LOGO = '/images/siguranta/baterino-logo-white.png'

function ImagePanel({ img, alt }: { img: string; alt: string }) {
  return (
    <div className="relative h-[280px] lg:h-[320px] rounded-[10px] overflow-hidden bg-neutral-100">
      <img
        src={img} alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
      />
      <img
        src={LOGO} alt="Baterino"
        className="absolute bottom-4 right-4 h-7 w-auto object-contain"
      />
    </div>
  )
}

function renderBold(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1
      ? <span key={i} className="font-bold">{part}</span>
      : <span key={i}>{part}</span>
  )
}

function FeatureItem({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <>
      {/* Mobile: icon on top, full-width title + desc, all centered */}
      <div className="flex flex-col items-center text-center gap-3 lg:hidden">
        <img src={icon} alt="" aria-hidden className="w-16 h-16 object-contain" />
        <h3 className="text-black text-xl font-extrabold font-['Inter'] leading-7">
          {title}
        </h3>
        <p className="text-gray-700 text-lg font-medium font-['Inter'] leading-8">
          {renderBold(desc)}
        </p>
      </div>

      {/* Desktop: icon absolute left, text indented */}
      <div className="relative hidden lg:block">
        <img src={icon} alt="" aria-hidden className="absolute left-0 top-[18px] w-16 h-16 object-contain" />
        <div className="pl-[94px]">
          <h3 className="text-black text-xl font-extrabold font-['Inter'] leading-7 mb-2">
            {title}
          </h3>
          <p className="text-gray-700 text-lg font-medium font-['Inter'] leading-8">
            {renderBold(desc)}
          </p>
        </div>
      </div>
    </>
  )
}

export default function Siguranta() {
  const { language } = useLanguage()
  const tr = getSigurantaTranslations(language.code)

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

  return (
    <>
      <SEO
        title={seoTitles[language.code] ?? seoTitles.ro}
        description={seoDescriptions[language.code] ?? seoDescriptions.ro}
        canonical="/siguranta"
        ogImage="/images/siguranta/siguranta-og.jpg"
        lang={language.code}
      />
      <article className="max-w-content mx-auto px-5 lg:px-3 pt-16 pb-24">

        {/* ── HERO ── */}
        <header className="text-center mb-12 lg:mb-16">
          <p className="text-black text-sm lg:text-base font-medium font-['Inter'] tracking-widest uppercase mb-3">
            {tr.supertitle}
          </p>
          <h1 className="text-black text-3xl lg:text-5xl font-extrabold font-['Inter'] leading-tight max-w-3xl mx-auto">
            {tr.heroTitle}
          </h1>
        </header>

        {/* ── SECTION 1: SWAP + SUPORT ── */}
        <section className="mb-12 lg:mb-16">
          <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-6">
            <div className="flex flex-col gap-8 pb-10 lg:pb-0">
              <ImagePanel img="/images/siguranta/serviciul-baterino-swap.jpg" alt={tr.swapTitle} />
              <FeatureItem icon="/images/shared/swap-icon.svg" title={tr.swapTitle} desc={tr.swapDesc} />
            </div>
            <hr className="border-gray-200 lg:hidden mb-10" />
            <div className="flex flex-col gap-8">
              <ImagePanel img="/images/siguranta/suport-mentenanta-baterino.jpg" alt={tr.suportTitle} />
              <FeatureItem icon="/images/shared/maintance-icon.svg" title={tr.suportTitle} desc={tr.suportDesc} />
            </div>
          </div>
        </section>

        {/* ── SECTION 2: TESTARE + GARANTIE ── */}
        <section className="mb-12 lg:mb-16">
          <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-6">
            <div className="flex flex-col gap-8 pb-10 lg:pb-0">
              <ImagePanel img="/images/siguranta/testare-produse-baterino.jpg" alt={tr.testareTitle} />
              <FeatureItem icon="/images/shared/testing-icon.svg" title={tr.testareTitle} desc={tr.testareDesc} />
            </div>
            <hr className="border-gray-200 lg:hidden mb-10" />
            <div className="flex flex-col gap-8">
              <ImagePanel img="/images/siguranta/10-ani-garantie-extinsa.jpg" alt={tr.garantieTitle} />
              <FeatureItem icon="/images/shared/safety-icon.svg" title={tr.garantieTitle} desc={tr.garantieDesc} />
            </div>
          </div>
        </section>

        {/* ── SECTION 3: SERVICE (half width image, right empty) ── */}
        <section className="mb-12 lg:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ImagePanel img="/images/siguranta/sertice-diagnoza-baterino.jpg" alt={tr.serviceTitle} />
            {/* right column intentionally empty */}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FeatureItem
              icon="/images/shared/romania-flag-icon.svg"
              title={tr.serviceTitle}
              desc={tr.serviceDesc}
            />
            {/* right column intentionally empty */}
          </div>
        </section>

        {/* ── CTA ── */}
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
