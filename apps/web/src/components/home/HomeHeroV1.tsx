import { useState, useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { HomeTranslations } from '../../i18n/home'

function renderBold(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>,
  )
}

const CARD_GAP = 10
const HERO_MOBILE_COUNT = 4
const HERO_MOBILE_CARD_WIDTH = 324

type HomeHeroV1Props = {
  tr: HomeTranslations
  userType: 'profesionist' | 'client' | null
}

/** Homepage hero v1 — 4-slide crossfade (desktop) + horizontal swipe cards (mobile). */
export default function HomeHeroV1({ tr, userType }: HomeHeroV1Props) {
  const [heroSlide, setHeroSlide] = useState(0)
  const [heroMobileActiveIndex, setHeroMobileActiveIndex] = useState(0)
  const heroMobileSliderRef = useRef<HTMLDivElement>(null)

  const heroSlides = useMemo(
    () => [
      { label: tr.heroSliderRez, image: '/images/home/slider-apple/slide1-baterii-rezidential.webp' },
      { label: tr.heroSliderInd, image: '/images/home/slider-apple/slide2-baterii-industrial.webp' },
      { label: tr.heroSliderMed, image: '/images/home/slider-apple/slide3-baterii-medical.webp' },
      { label: tr.heroSliderInst, image: '/images/home/slider-apple/slide4-instalatori.webp' },
    ],
    [tr],
  )

  const heroMobileSlides = useMemo(() => {
    const base = [
      { id: 'rezidential' as const, label: tr.heroSliderRez, image: '/images/home/slider-1-mobile.webp' },
      { id: 'industrial' as const, label: tr.heroSliderInd, image: '/images/home/slider-2-mobile.webp' },
      { id: 'medical' as const, label: tr.heroSliderMed, image: '/images/home/slider-3-mobile.webp' },
      { id: 'instalatori' as const, label: tr.heroSliderInst, image: '/images/home/instalatori-mobile.webp' },
    ]
    const instSlide = base.find((s) => s.id === 'instalatori')!
    const restSlides = base.filter((s) => s.id !== 'instalatori')
    return userType === 'profesionist' ? [instSlide, ...restSlides] : [...restSlides, instSlide]
  }, [tr, userType])

  useEffect(() => {
    const el = heroMobileSliderRef.current
    if (!el) return
    const onScroll = () => {
      const index = Math.round(el.scrollLeft / (HERO_MOBILE_CARD_WIDTH + CARD_GAP))
      setHeroMobileActiveIndex(Math.min(Math.max(0, index), HERO_MOBILE_COUNT - 1))
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = heroMobileSliderRef.current
    if (!el) return
    el.scrollTo({ left: 0, behavior: 'auto' })
    setHeroMobileActiveIndex(0)
  }, [userType])

  return (
    <section className="mb-16 lg:mb-24">
      {/* Mobile: horizontal slider (like diviziile baterino) */}
      <div className="lg:hidden">
        <div className="-mx-5 w-[calc(100%+2.5rem)]">
          <div
            ref={heroMobileSliderRef}
            className="flex gap-[10px] overflow-x-auto scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pl-5 pr-5"
            style={{
              scrollPaddingLeft: 'max(10px, calc(50vw - 162px))',
              scrollPaddingRight: 'max(10px, calc(50vw - 162px))',
            }}
          >
            {heroMobileSlides.map((slide) => {
              const titleMap: Record<string, string> = {
                rezidential: tr.heroMobile0Title,
                industrial: tr.heroMobile1Title,
                medical: tr.heroMobile2Title,
                instalatori: tr.heroSlideInstTitle,
              }
              const descMap: Record<string, string> = {
                rezidential: tr.heroMobile0Desc,
                industrial: tr.heroMobile1Desc,
                medical: tr.heroMobile2Desc,
                instalatori: tr.heroMobileInstDesc,
              }
              const title = titleMap[slide.id]
              const desc = descMap[slide.id]
              const isInstalatori = slide.id === 'instalatori'
              return (
                <div
                  key={slide.image}
                  className="relative flex-shrink-0 w-[324px] h-[466px] rounded-[10px] overflow-hidden bg-zinc-300 snap-center"
                >
                  <img
                    src={slide.image}
                    alt={`${tr.heroImageAlt} – ${slide.label}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[280px] sm:w-72 text-center flex flex-col items-center">
                    <h1
                      className={`text-white text-2xl sm:text-3xl font-bold font-['Inter'] uppercase leading-8 sm:leading-9 mb-2 ${isInstalatori ? 'whitespace-pre-line' : ''}`}
                    >
                      {title}
                    </h1>
                    <p className="text-white text-base sm:text-xl font-bold font-['Inter'] leading-6 sm:leading-7 mb-3">
                      {isInstalatori ? renderBold(desc) : desc}
                    </p>
                    {slide.id === 'industrial' ? (
                      <Link
                        to="/divizii/industrial"
                        className="w-full max-w-[200px] h-12 px-6 bg-white rounded-[10px] inline-flex justify-center items-center text-black text-sm font-bold font-['Inter'] uppercase hover:bg-neutral-100 active:bg-neutral-200 transition-colors mt-4"
                      >
                        {tr.heroSlideIndCta}
                      </Link>
                    ) : slide.id === 'medical' ? (
                      <Link
                        to="/divizii/medical"
                        className="w-full max-w-[200px] h-12 px-6 bg-white rounded-[10px] inline-flex justify-center items-center text-black text-sm font-bold font-['Inter'] uppercase hover:bg-neutral-100 active:bg-neutral-200 transition-colors mt-4"
                      >
                        {tr.heroSlideMedCta}
                      </Link>
                    ) : slide.id === 'instalatori' ? (
                      <Link
                        to="/instalatori"
                        className="w-full max-w-[200px] h-12 px-6 bg-white rounded-[10px] inline-flex justify-center items-center text-black text-sm font-bold font-['Inter'] uppercase hover:bg-neutral-100 active:bg-neutral-200 transition-colors mt-4"
                      >
                        {tr.heroSlideInstCta}
                      </Link>
                    ) : (
                      <svg
                        className="w-6 h-6 text-white shrink-0 animate-arrow-bounce-down"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M12 5v14M19 12l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </div>
              )
            })}
            <div aria-hidden style={{ flexShrink: 0, width: 'var(--grid-edge)' }} />
          </div>
        </div>
        {/* Dot indicators – mobile only */}
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: HERO_MOBILE_COUNT }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                const el = heroMobileSliderRef.current
                if (el) el.scrollTo({ left: i * (HERO_MOBILE_CARD_WIDTH + CARD_GAP), behavior: 'smooth' })
              }}
              aria-label={`Slide ${i + 1}`}
              className={`size-2.5 rounded-full transition-colors ${i === heroMobileActiveIndex ? 'bg-black' : 'bg-black/30'}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: crossfade hero with tabs */}
      <div className="hidden lg:block relative rounded-[10px] overflow-hidden h-[600px] w-full bg-zinc-300">
        {heroSlides.map((slide, i) => (
          <img
            key={slide.image}
            src={slide.image}
            alt={`${tr.heroImageAlt} – ${slide.label}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              heroSlide === i ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent" />

        <div className="hidden lg:block absolute top-8 left-1/2 -translate-x-1/2 w-[793px] max-w-[calc(100%-4.5rem)]">
          <div className="relative h-10 rounded-[20px] overflow-hidden">
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" />
            <div
              className={`absolute top-0 h-10 rounded-[20px] bg-black transition-opacity duration-300 ${
                heroSlide === 3 ? 'opacity-0' : 'opacity-100'
              }`}
              style={{ width: '25%', transform: 'translateX(300%)' }}
            />
            <div
              className="absolute top-0 h-10 rounded-[20px] bg-white transition-transform duration-300 ease-in-out"
              style={{ width: '25%', transform: `translateX(${heroSlide * 100}%)` }}
            />
            <div className="relative flex h-full">
              {heroSlides.map((slide, i) => (
                <button
                  key={slide.label}
                  type="button"
                  onClick={() => setHeroSlide(i)}
                  className={`flex-1 text-sm font-semibold font-['Inter'] uppercase transition-colors duration-300 ${
                    heroSlide === i ? 'text-black' : i === 3 ? 'text-white' : 'text-black/60 hover:text-black'
                  }`}
                >
                  {slide.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-14 left-14 right-14 flex flex-col items-center lg:items-stretch">
          {heroSlide === 0 && (
            <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 text-center lg:text-left w-full">
              <div className="flex flex-col gap-3 items-center lg:items-start">
                <h1 className="text-white text-3xl font-bold font-['Inter'] uppercase leading-10 max-w-[510px] whitespace-pre-line">
                  {tr.heroSlideRezTitle}
                </h1>
                <p className="text-white text-lg font-normal font-['Inter'] leading-7 max-w-[612px]">
                  {renderBold(tr.heroSlideRezDesc)}
                </p>
              </div>
              <div className="hidden lg:flex flex-col items-center gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById('produse-section')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="w-60 h-12 bg-white rounded-[10px] outline outline-1 outline-zinc-300 inline-flex justify-center items-center text-black text-base font-semibold font-['Inter'] transition-all duration-150 hover:bg-neutral-100 hover:scale-105 active:scale-95 active:bg-neutral-200 whitespace-nowrap"
                >
                  {tr.heroCardCta}
                </button>
                <div className="flex items-center gap-2 opacity-50 p-[5px]">
                  <span className="text-white text-xs font-normal font-['Inter'] leading-5">{tr.poweredBy}</span>
                  <img
                    src="/images/shared/lithtech-logo-white.webp"
                    alt="LithTech"
                    className="h-5 w-auto object-contain"
                  />
                </div>
              </div>
            </div>
          )}

          {heroSlide === 1 && (
            <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 text-center lg:text-left w-full">
              <div className="flex flex-col gap-3 items-center lg:items-start">
                <img
                  src="/images/divizii/industrial/baterino-pro-industrial-logo-white.webp"
                  alt="Baterino Industrial"
                  className="h-6 w-auto object-contain object-center lg:object-left"
                />
                <h1 className="text-white text-3xl font-bold font-['Inter'] uppercase leading-10 max-w-[612px]">
                  {tr.heroSlideIndTitle}
                </h1>
                <p className="text-white text-xl font-['Inter'] leading-8 max-w-[612px]">
                  {renderBold(tr.heroSlideIndDesc)}
                </p>
              </div>
              <div className="hidden lg:flex flex-col items-center gap-3 flex-shrink-0">
                <Link
                  to="/divizii/industrial"
                  className="w-60 h-12 bg-white rounded-[10px] outline outline-1 outline-zinc-300 inline-flex justify-center items-center text-black text-base font-semibold font-['Inter'] transition-all duration-150 hover:bg-neutral-100 hover:scale-105 active:scale-95 active:bg-neutral-200 whitespace-nowrap"
                >
                  {tr.heroSlideIndCta}
                </Link>
                <div className="flex items-center gap-2 opacity-50 p-[5px]">
                  <span className="text-white text-xs font-normal font-['Inter'] leading-5">{tr.poweredBy}</span>
                  <img src="/images/shared/lithtech-logo-white.webp" alt="LithTech" className="h-5 w-auto object-contain" />
                </div>
              </div>
            </div>
          )}

          {heroSlide === 3 && (
            <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 text-center lg:text-left w-full">
              <div className="flex flex-col gap-3 items-center lg:items-start">
                <h1 className="text-white text-3xl font-bold font-['Inter'] leading-10 max-w-[532px] whitespace-pre-line">
                  {tr.heroSlideInstTitle}
                </h1>
                <p className="text-white text-xl font-normal font-['Inter'] leading-8 max-w-[690px]">
                  {renderBold(tr.heroSlideInstDesc)}
                </p>
              </div>
              <div className="hidden lg:flex flex-col items-center gap-3 flex-shrink-0">
                <Link
                  to="/instalatori"
                  className="w-60 h-12 px-2.5 py-[5px] bg-white rounded-[10px] outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-center items-center text-black text-base font-semibold font-['Inter'] uppercase hover:bg-neutral-100 transition-colors"
                >
                  {tr.heroSlideInstCta}
                </Link>
                <div className="flex items-center gap-2 opacity-50 p-[5px]">
                  <span className="text-white text-xs font-normal font-['Inter'] leading-5">
                    {tr.heroSlideInstImportatori}
                  </span>
                  <img
                    src="/images/shared/lithtech-logo-white.webp"
                    alt="LithTech"
                    className="h-5 w-auto object-contain"
                  />
                </div>
              </div>
            </div>
          )}

          {heroSlide === 2 && (
            <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 text-center lg:text-left w-full">
              <div className="flex flex-col gap-3 items-center lg:items-start">
                <img
                  src="/images/divizii/medical/baterino-medical-logo-white.webp"
                  alt="Baterino Medical"
                  className="h-6 w-auto object-contain object-center lg:object-left"
                />
                <h1 className="text-white text-3xl font-bold font-['Inter'] uppercase leading-10 max-w-[510px]">
                  {tr.heroSlideMedTitle}
                </h1>
                <p className="text-white text-lg font-normal font-['Inter'] leading-7 max-w-[612px]">
                  {tr.heroSlideMedDesc}
                </p>
              </div>
              <div className="hidden lg:flex flex-col items-center gap-3 flex-shrink-0">
                <Link
                  to="/divizii/medical"
                  className="w-60 h-12 bg-white rounded-[10px] outline outline-1 outline-zinc-300 inline-flex justify-center items-center text-black text-base font-semibold font-['Inter'] transition-all duration-150 hover:bg-neutral-100 hover:scale-105 active:scale-95 active:bg-neutral-200 whitespace-nowrap"
                >
                  {tr.heroSlideMedCta}
                </Link>
                <div className="flex items-center gap-2 opacity-50 p-[5px]">
                  <span className="text-white text-xs font-normal font-['Inter'] leading-5">{tr.poweredBy}</span>
                  <img
                    src="/images/shared/lithtech-logo-white.webp"
                    alt="LithTech"
                    className="h-5 w-auto object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
