import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { getInstallatoriTranslations } from '../i18n/instalatori'
import SEO from '../components/SEO'
import CTABar from '../components/CTABar'

/* ── image card (2×2 hero grid) ──────────────────────────────── */
function ImageCard({ img, title, icon }: { img: string; title: string; icon?: string }) {
  return (
    <div className="group relative aspect-square rounded-[10px] overflow-hidden bg-zinc-300">
      <img src={img} alt={title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/70 lg:bg-black/40 lg:group-hover:bg-black/70 transition-colors duration-300" />
      {icon && (
        <img
          src={icon}
          alt=""
          aria-hidden
          className="absolute w-16 h-16 object-contain top-[18%] left-1/2 -translate-x-1/2"
        />
      )}
      <p className="absolute text-white text-2xl lg:text-xl font-bold font-['Inter'] leading-8 text-center"
         style={{ top: '46%', left: '17px', right: '17px' }}>
        {title}
      </p>
    </div>
  )
}

/* ── mini feature card (icon + text) ────────────────────────── */
function MiniCard({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="bg-neutral-100 rounded-[10px] flex flex-col items-center justify-center gap-3 p-4 min-h-[176px]">
      <img src={icon} alt="" aria-hidden className="w-12 h-12 object-contain flex-shrink-0" />
      <p className="text-gray-700 text-lg font-bold font-['Nunito_Sans'] leading-6 text-center">{text}</p>
    </div>
  )
}

/* ── feature section block ───────────────────────────────────── */
function FeatureBlock({ title, intro, cards, icons }: {
  title: string
  intro: string
  cards: string[]
  icons: string[]
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-black text-lg lg:text-xl font-extrabold font-['Inter'] leading-7 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm lg:text-base font-medium font-['Inter'] leading-6">{intro}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((text, i) => (
          <MiniCard key={i} icon={icons[i] ?? icons[0]} text={text} />
        ))}
      </div>
    </div>
  )
}

/* ── icon sets per feature section ──────────────────────────── */
const FEAT1_ICONS = [
  '/images/instalatori/preturi-stabile-icon.svg',
  '/images/instalatori/reduceri-icon.svg',
  '/images/instalatori/proiecte-industrial-icon.svg',
  '/images/instalatori/no-competition-icon.svg',
  '/images/shared/safety-icon.svg',
]
const FEAT2_ICONS = [
  '/images/instalatori/suport-icon.svg',
  '/images/instalatori/responsabilitate-icon.svg',
  '/images/shared/swap-icon.svg',
  '/images/shared/swap-icon.svg',
  '/images/shared/safety-icon.svg',
]
const FEAT3_ICONS = [
  '/images/instalatori/promovare-icon.svg',
  '/images/instalatori/incredere-icon.svg',
  '/images/instalatori/supraveghere-icon.svg',
]
const FEAT4_ICONS = [
  '/images/instalatori/recomandare-icon.svg',
  '/images/instalatori/retea-icon.svg',
  '/images/instalatori/awareness-icon.svg',
  '/images/instalatori/termen-lung-icon.svg',
]

/* ── page ────────────────────────────────────────────────────── */
export default function Instalatori() {
  const { language } = useLanguage()
  const tr = getInstallatoriTranslations(language.code)

  return (
    <>
      <SEO
        title={tr.seoTitle}
        description={tr.seoDesc}
        canonical="/instalatori"
        ogImage="/images/instalatori/instalatori-baterino-og.jpg"
        lang={language.code}
      />

      <article className="max-w-content mx-auto px-5 lg:px-3 pt-12 pb-24">

        {/* ── SECTION 1: full-width centered hero header ── */}
        <header className="text-center mb-12 lg:mb-16">
          <p className="text-black text-sm font-medium font-['Inter'] tracking-widest uppercase mb-3">
            {tr.supertitle}
          </p>
          <h1 className="text-black text-3xl lg:text-5xl font-extrabold font-['Inter'] leading-tight mb-4">
            {tr.heroTitle}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-gray-500 text-sm font-medium font-['Inter']">{tr.realizatDe}</span>
            <img
              src="/images/instalatori/litthtech-logo.png"
              alt="LithTech"
              className="h-5 w-auto object-contain"
            />
          </div>
        </header>

        {/* ── SECTION 2: sticky left + scrolling right ── */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-12 mb-16 lg:mb-24">

          {/* LEFT: sticky text content */}
          <div className="lg:w-1/2 lg:shrink-0 lg:sticky lg:top-16 flex flex-col">
            <h2 className="text-black text-3xl lg:text-5xl font-extrabold font-['Inter'] leading-tight lg:leading-[56px] mb-6">
              {tr.leftTitle.split('\n').map((line, i) => (
                <span key={i}>{i > 0 && <br />}{line}</span>
              ))}
            </h2>
            <p className="text-black text-base lg:text-xl font-normal font-['Nunito_Sans'] leading-7 lg:leading-8 mb-8">
              {tr.introText.split('\n\n').map((para, i) => (
                <span key={i} className={i === 0 ? 'hidden lg:inline' : ''}>
                  {i > 0 && <><br className="hidden lg:inline" /><br className="hidden lg:inline" /></>}
                  {para.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                    j % 2 === 1
                      ? <span key={j} className="font-bold font-['Nunito_Sans']">{part}</span>
                      : <span key={j} className="font-normal font-['Nunito_Sans']">{part}</span>
                  )}
                </span>
              ))}
            </p>
            {/* Buttons — desktop only (mobile buttons rendered below cards) */}
            <div className="hidden lg:flex flex-col gap-[18px]">
              <Link
                to="/companie/viziune"
                className="w-full lg:w-96 h-12 px-2.5 bg-slate-900 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-center items-center text-white text-base font-semibold font-['Inter'] hover:bg-slate-700 transition-colors"
              >
                {tr.btn1}
              </Link>
              <button className="w-full lg:w-96 h-12 px-2.5 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-slate-900 inline-flex justify-center items-center gap-1.5 text-black text-base font-semibold font-['Inter'] hover:bg-slate-900 hover:text-white transition-colors">
                <img src="/images/shared/download-icon.svg" alt="" className="w-11 h-8 object-contain" />
                {tr.btn2}
              </button>
            </div>
          </div>

          {/* RIGHT: image cards (scrolls) + mobile buttons */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            {/* 1 column on mobile, 2 on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
              <ImageCard img="/images/instalatori/structura-pret.jpg"          title={tr.imageCard1} icon="/images/instalatori/discount-white.svg" />
              <ImageCard img="/images/instalatori/livrare-rapida-baterino.jpg" title={tr.imageCard2} icon="/images/instalatori/baterries-white.svg" />
              <ImageCard img="/images/instalatori/client-final.jpg"            title={tr.imageCard3} icon="/images/instalatori/suport-white-icon.svg" />
              <ImageCard img="/images/instalatori/produse-verificate.jpg"      title={tr.imageCard4} icon="/images/instalatori/check-icon.svg" />
            </div>
            {/* Buttons — mobile only */}
            <div className="flex lg:hidden flex-col mt-2">
              <Link
                to="/companie/viziune"
                className="w-full h-16 px-2.5 bg-slate-900 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-center items-center text-white text-lg font-semibold font-['Inter'] hover:bg-slate-700 transition-colors"
              >
                {tr.btn1}
              </Link>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: full-width features grid ── */}
        <section>
          <h2 className="text-black text-2xl lg:text-3xl font-extrabold font-['Inter'] leading-tight text-center mb-10 lg:mb-14">
            {tr.featuresTitle}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
            <FeatureBlock
              title={tr.feat1Title}
              intro={tr.feat1Intro}
              cards={tr.feat1Cards}
              icons={FEAT1_ICONS}
            />
            <FeatureBlock
              title={tr.feat2Title}
              intro={tr.feat2Intro}
              cards={tr.feat2Cards}
              icons={FEAT2_ICONS}
            />
            <FeatureBlock
              title={tr.feat3Title}
              intro={tr.feat3Intro}
              cards={tr.feat3Cards}
              icons={FEAT3_ICONS}
            />
            <FeatureBlock
              title={tr.feat4Title}
              intro={tr.feat4Intro}
              cards={tr.feat4Cards}
              icons={FEAT4_ICONS}
            />
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="mt-16 lg:mt-24">
          <CTABar
            logo="/images/shared/baterino-logo-black.svg"
            logoAlt="Baterino Romania"
            title={tr.ctaTitle}
            desc={tr.ctaDesc}
            btn1Label={tr.ctaBtn1}
            btn1To="/companie/viziune"
            btn2Label={tr.ctaBtn2}
            btn2To="/companie/viziune"
          />
        </div>

      </article>
    </>
  )
}
