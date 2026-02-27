import { useLanguage } from '../contexts/LanguageContext'
import { getCariereTranslations } from '../i18n/cariere'
import SEO from '../components/SEO'

export default function Cariere() {
  const { language } = useLanguage()
  const tr = getCariereTranslations(language.code)

  return (
    <>
      <SEO
        title={tr.seoTitle}
        description={tr.seoDesc}
        canonical="/cariere"
        ogImage="/images/cariere/cariere-hero-card.jpg"
        lang={language.code}
      />

      <article className="max-w-content mx-auto px-5 lg:px-3 pt-12 pb-24">
        {/* Hero section – style matches Rezidential */}
        <header className="mb-12 lg:mb-16 flex flex-col items-center gap-0">
          <h1 className="w-full text-center text-black text-2xl sm:text-4xl lg:text-5xl font-extrabold font-['Inter'] leading-8 sm:leading-[48px] lg:leading-[56px]">
            {tr.heroTitle}
          </h1>
          <p className="max-w-[739px] text-center text-neutral-600 text-base sm:text-lg lg:text-xl font-medium font-['Inter'] leading-6 sm:leading-7 lg:leading-8 mt-[14px] mb-[60px]">
            {tr.heroDesc}
          </p>
          <div className="w-full relative rounded-[10px] overflow-hidden bg-zinc-300">
            <img
              src="/images/cariere/cariere-hero-card.jpg"
              alt="Echipa Baterino"
              className="w-full object-cover"
              style={{ height: '440px' }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
            <img
              src="/images/shared/baterino-logo-white.png"
              alt="Baterino"
              className="absolute bottom-10 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-10 h-9 w-auto object-contain"
            />
          </div>
        </header>

        {/* Search form – visible but disabled (hidden on mobile) */}
        <section className="mb-12 hidden sm:block">
          <h2 className="text-black text-xl sm:text-2xl font-bold font-['Inter'] leading-8 mb-2">
            {tr.searchTitle}
          </h2>
          <p className="text-neutral-600 text-base font-medium font-['Inter'] mb-6">
            {tr.searchSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-semibold text-black mb-1.5 font-['Inter']">
                {tr.departament}
              </label>
              <select
                disabled
                className="w-full appearance-none h-11 pl-4 pr-10 bg-neutral-100 rounded-[10px] text-gray-500 text-sm font-medium font-['Inter'] cursor-not-allowed opacity-70"
              >
                <option>{tr.departament}</option>
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-semibold text-black mb-1.5 font-['Inter']">
                {tr.judet}
              </label>
              <select
                disabled
                className="w-full appearance-none h-11 pl-4 pr-10 bg-neutral-100 rounded-[10px] text-gray-500 text-sm font-medium font-['Inter'] cursor-not-allowed opacity-70"
              >
                <option>{tr.judet}</option>
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-semibold text-black mb-1.5 font-['Inter']">
                {tr.oras}
              </label>
              <select
                disabled
                className="w-full appearance-none h-11 pl-4 pr-10 bg-neutral-100 rounded-[10px] text-gray-500 text-sm font-medium font-['Inter'] cursor-not-allowed opacity-70"
              >
                <option>{tr.oras}</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                disabled
                className="h-11 px-6 rounded-[10px] bg-slate-900 text-white text-base font-semibold font-['Inter'] cursor-not-allowed opacity-60"
              >
                {tr.searchButton}
              </button>
            </div>
          </div>
        </section>

        {/* Message: team complete */}
        <div className="bg-gray-100 rounded-[10px] p-8 lg:p-12 max-w-2xl mx-auto">
          <h2 className="text-black text-xl font-bold font-['Inter'] leading-8 mb-4">
            {tr.teamFullTitle}
          </h2>
          <p className="text-black text-base font-normal font-['Inter'] leading-6 whitespace-pre-line">
            {tr.teamFullMessage.split('cariera@baterino.ro').map((part, i, arr) =>
              i < arr.length - 1 ? (
                <span key={i}>
                  {part}
                  <a
                    href="mailto:cariera@baterino.ro"
                    className="text-black font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity"
                  >
                    cariera@baterino.ro
                  </a>
                </span>
              ) : (
                part
              )
            )}
          </p>
        </div>
      </article>
    </>
  )
}
