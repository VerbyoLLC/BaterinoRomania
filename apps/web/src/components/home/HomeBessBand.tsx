import { useLanguage } from '../../contexts/LanguageContext'
import HomeProductSlider, { BESS_SLIDES } from './HomeProductSlider'

const TEXT = {
  ro: {
    title: 'Sisteme BESS pentru mediul industrial',
    subtitle: 'Importăm, instalăm și facem mentenanță în România.',
  },
  en: {
    title: 'BESS systems for industrial sites',
    subtitle: 'We import, install and maintain them in Romania.',
  },
}

/** Industrial band: section title plus a four-slide product slider. */
export default function HomeBessBand() {
  const { language } = useLanguage()
  const t = TEXT[language.code as 'ro' | 'en'] ?? TEXT.ro

  return (
    <section
      aria-label={t.title}
      className="mb-16 overflow-hidden lg:mb-24"
      style={{ background: 'linear-gradient(100deg, #e9e9ee 0%, #c4c6cf 55%, #9599a6 100%)' }}
    >
      <div className="px-6 pt-10 text-center sm:pt-14">
        <h2 className="m-0 text-black text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Inter'] leading-tight">
          {t.title}
        </h2>
        <p className="mx-auto mt-3 max-w-[580px] text-gray-600 text-base lg:text-lg font-normal font-['Inter'] leading-7 lg:mt-4">
          {t.subtitle}
        </p>
      </div>
      <HomeProductSlider slides={BESS_SLIDES} showPageHeader={false} />
    </section>
  )
}
