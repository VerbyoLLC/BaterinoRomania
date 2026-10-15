import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import SEO from '../components/SEO'

const PRODUCTS = [
  {
    href: '/produse/sisteme-bess/bess-modular-high-voltage-hp-1600-64kwh-pana-la-241kwh',
    image: '/images/shared/slider-bess-modular-hv.png',
    title: 'BESS Modular High Voltage',
    spec: '64 - 241 kWh',
  },
  {
    href: '/produse/sisteme-bess/bess-cabinet-lifepo4-261kwh-racire-lichida',
    image: '/images/shared/slider-bess-closed.png',
    title: 'BESS Cabine 215 - 261 kWh',
    spec: 'Răcire lichidă',
  },
  {
    href: '/produse/sisteme-bess/bess-container-20ft-lifepo4-656kwh-1446kwh',
    image: '/images/shared/20ft-container.webp',
    title: 'BESS 20ft Container 656 - 1.41MW',
    spec: 'Răcire cu aer',
  },
  {
    href: '/produse/sisteme-bess/bess-container-20ft-lifepo4-3340kwh-5015kwh-racire-lichida',
    image: '/images/shared/slider-bess-5mw.png',
    title: 'BESS Container 3.3 - 5.1 MW',
    spec: 'Răcire lichidă',
  },
] as const

const TEXT = {
  ro: {
    seoTitle: 'Produse C&I | Sisteme BESS industriale Baterino',
    seoDesc:
      'Sisteme BESS pentru mediul comercial și industrial: module High Voltage, cabine și containere, de la 64 kWh până la 5.1 MW.',
    title: 'Produse C&I',
    subtitle:
      'Sisteme BESS pentru mediul comercial și industrial. Module, cabine și containere, de la 64 kWh până la 5.1 MW.',
    cta: 'Vezi detalii',
  },
  en: {
    seoTitle: 'C&I Products | Industrial BESS systems by Baterino',
    seoDesc:
      'BESS systems for commercial and industrial sites: high-voltage modules, cabinets and containers, from 64 kWh to 5.1 MW.',
    title: 'C&I Products',
    subtitle:
      'BESS systems for commercial and industrial sites. Modules, cabinets and containers, from 64 kWh to 5.1 MW.',
    cta: 'View details',
  },
}

export default function BessIndustrial() {
  const { language } = useLanguage()
  const t = TEXT[language.code as 'ro' | 'en'] ?? TEXT.ro

  return (
    <>
      <SEO title={t.seoTitle} description={t.seoDesc} canonical="/bess-industrial" lang={language.code} />
      <article className="max-w-content mx-auto px-5 lg:px-3 pt-12 pb-24">
        <header className="mb-10 text-center lg:mb-14">
          <h1 className="m-0 text-2xl font-extrabold font-['Inter'] leading-tight text-black sm:text-4xl lg:text-5xl">
            {t.title}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base font-medium font-['Inter'] leading-7 text-neutral-600 sm:text-lg">
            {t.subtitle}
          </p>
        </header>
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:gap-6">
          {PRODUCTS.map((product) => (
            <li key={product.href}>
              <Link
                to={product.href}
                className="flex h-full flex-col overflow-hidden rounded-[10px] bg-[#f7f7f7] transition-shadow duration-200 hover:shadow-lg"
              >
                <span className="flex h-56 items-center justify-center px-6 py-8 sm:h-64">
                  <img src={product.image} alt="" className="max-h-full max-w-full object-contain" />
                </span>
                <span className="flex flex-1 flex-col px-5 pb-6">
                  <span className="text-lg font-bold font-['Inter'] leading-snug text-black">{product.title}</span>
                  <span className="mt-1 text-sm font-medium font-['Inter'] text-neutral-600">{product.spec}</span>
                  <span className="mt-4 text-sm font-semibold font-['Inter'] text-black underline underline-offset-4">
                    {t.cta}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </article>
    </>
  )
}
