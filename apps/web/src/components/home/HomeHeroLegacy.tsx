import type { HomeTranslations } from '../../i18n/home'
import HomeHeroV2 from './HomeHeroV2'
import HomeMobileSliderV2, { MOBILE_SLIDE_V2_COUNT } from './HomeMobileSliderV2'

type HomeHeroLegacyProps = {
  tr: HomeTranslations
  promoPriceLoading: boolean
  userType: 'profesionist' | 'client' | null
}

/** Previous homepage hero (card sliders). Not rendered; kept to restore later. */
export default function HomeHeroLegacy({ tr, promoPriceLoading, userType }: HomeHeroLegacyProps) {
  return (
    <>
      <h1 className="sr-only">{tr.heroV2Title}</h1>

      {/* Mobile: card slider built from desktop cards, split in two */}
      <div className="md:hidden">
        <HomeMobileSliderV2
          tr={tr}
          promoPriceLoading={promoPriceLoading}
          jumpTo={userType === 'profesionist' ? MOBILE_SLIDE_V2_COUNT - 1 : 0}
        />
      </div>

      {/* Desktop: card slider hero */}
      <div className="hidden md:block pt-6 lg:pt-10">
        <HomeHeroV2 tr={tr} promoPriceLoading={promoPriceLoading} userType={userType} />
      </div>
    </>
  )
}
