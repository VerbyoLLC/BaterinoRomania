import { useMemo, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { getProductDetailTranslations } from '../i18n/product-detail'
import { CONTACT_WHATSAPP_WAME } from '../lib/contactWhatsApp'

/** Lista mărci invertor (aceeași ca pe pagina produsului rezidențial). */
export const INVERTER_BRANDS = [
  'ATESS',
  'DEYE',
  'EPEVER',
  'GINLONG',
  'GOODWE',
  'GROWATT',
  'HYPONTECH',
  'KOYOE',
  'LUXPOWERTEK',
  'MEGAREVO',
  'MUST',
  'SCHNEIDER ELECTRIC',
  'SENERGY',
  'SINEXCEL',
  'SMA',
  'SOFAR',
  'SOLAX POWER',
  'SOLIS',
  'SOROTEC',
  'SRNE',
  'SUNGROW',
  'VICTRON ENERGY',
  'VOLTRONIC POWER',
]

export default function CompatibilitateInvertorModal({ onClose }: { onClose: () => void }) {
  const { language } = useLanguage()
  const tr = getProductDetailTranslations(language.code)
  const [search, setSearch] = useState('')
  const query = search.trim().toLowerCase()
  const searching = query.length > 0
  const filtered = useMemo(() => {
    if (!query) return INVERTER_BRANDS
    return INVERTER_BRANDS.filter((b) => b.toLowerCase().includes(query))
  }, [query])
  const whatsappAssistanceHref = useMemo(() => {
    const q = search.trim()
    const text = tr.compatibilitateInvertorWhatsappPrefill.replace(/\{search\}/g, q || '—')
    return `https://wa.me/${CONTACT_WHATSAPP_WAME}?text=${encodeURIComponent(text)}`
  }, [search, tr.compatibilitateInvertorWhatsappPrefill])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="compatibilitate-invertor-hero"
    >
      <div
        className="flex h-[min(85dvh,34rem)] w-full max-h-[85vh] flex-col overflow-hidden rounded-t-[20px] bg-white shadow-2xl animate-slide-up-from-bottom sm:h-[min(80dvh,32rem)] sm:max-h-[80vh] sm:max-w-md sm:rounded-2xl"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center gap-4 border-b border-neutral-100 bg-white p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:p-6 sm:pt-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
            <img
              src="/images/shared/compatibility-icon.svg"
              alt=""
              aria-hidden
              className="h-8 w-8 object-contain"
            />
          </div>
          <h1
            id="compatibilitate-invertor-hero"
            className="min-w-0 flex-1 text-xl font-semibold leading-tight text-black font-['Inter']"
          >
            {tr.compatibilitateInvertorHeroTitle}
          </h1>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            aria-label={tr.compatibilitateClose}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="border-b border-zinc-100 px-4 py-3 sm:px-6">
          <input
            type="text"
            placeholder={tr.compatibilitateSearch}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-[10px] bg-neutral-100 pl-4 pr-4 text-base font-['Inter'] text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {filtered.length > 0 ? (
            <ul className="space-y-1">
              {filtered.map((brand) => {
                const isHighlighted = searching && brand.toLowerCase().includes(query)
                return (
                  <li
                    key={brand}
                    className={`rounded-[10px] px-3 py-2.5 text-base font-medium font-['Inter'] ${
                      isHighlighted
                        ? 'bg-green-50 text-green-900 ring-1 ring-inset ring-green-200'
                        : 'text-black hover:bg-neutral-100'
                    }`}
                  >
                    {brand}
                  </li>
                )
              })}
            </ul>
          ) : searching ? (
            <div className="flex flex-col items-center gap-4 py-1">
              <p className="m-0 max-w-[18.5rem] text-center text-base leading-relaxed text-neutral-700 font-['Inter'] sm:max-w-[22rem]">
                {tr.compatibilitateInvertorNotFoundMessage}
              </p>
              <a
                href={whatsappAssistanceHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3.5 text-center text-base font-bold uppercase tracking-wide text-white font-['Inter'] transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 sm:min-h-[3.5rem] sm:py-4"
              >
                <svg className="h-5 w-5 shrink-0 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {tr.compatibilitateInvertorAskAssistanceBtn}
              </a>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-gray-500 font-['Inter']">{tr.compatibilitateNoResults}</p>
          )}
        </div>
      </div>
    </div>
  )
}
