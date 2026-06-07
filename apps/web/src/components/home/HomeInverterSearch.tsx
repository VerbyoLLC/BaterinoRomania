import { useEffect, useMemo, useRef, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getProductDetailTranslations } from '../../i18n/product-detail'
import CompatibilitateInvertorModal, { INVERTER_BRANDS } from '../CompatibilitateInvertorModal'
import { CONTACT_WHATSAPP_WAME } from '../../lib/contactWhatsApp'

type HomeInverterSearchProps = {
  placeholder: string
}

export default function HomeInverterSearch({ placeholder }: HomeInverterSearchProps) {
  const { language } = useLanguage()
  const productTr = getProductDetailTranslations(language.code)
  const [search, setSearch] = useState('')
  const [focused, setFocused] = useState(false)
  const [mobileModalOpen, setMobileModalOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const query = search.trim().toLowerCase()
  const searching = query.length > 0
  const filteredBrands = useMemo(() => {
    if (!query) return INVERTER_BRANDS
    return INVERTER_BRANDS.filter((brand) => brand.toLowerCase().includes(query))
  }, [query])
  const whatsappHref = useMemo(() => {
    const q = search.trim()
    const text = productTr.compatibilitateInvertorWhatsappPrefill.replace(/\{search\}/g, q || '—')
    return `https://wa.me/${CONTACT_WHATSAPP_WAME}?text=${encodeURIComponent(text)}`
  }, [search, productTr.compatibilitateInvertorWhatsappPrefill])

  useEffect(() => {
    if (!focused) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [focused])

  const searchBarContent = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
        <img
          src="/images/shared/compatibility-icon.svg"
          alt=""
          aria-hidden
          className="h-6 w-6 object-contain"
        />
      </span>
      <span className="min-w-0 flex-1 text-base font-semibold font-['Inter'] text-gray-500 text-left truncate">
        {placeholder}
      </span>
      <svg
        className="h-5 w-5 shrink-0 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
      </svg>
    </>
  )

  return (
    <>
      {/* ── Mobile: tap to open bottom-sheet modal ── */}
      <button
        type="button"
        onClick={() => setMobileModalOpen(true)}
        aria-label={productTr.verificareCompatibilitate}
        className="md:hidden flex min-h-12 w-full max-w-xl items-center gap-3 rounded-full border-2 border-gray-200 bg-white px-4 py-2 text-left transition-colors hover:border-gray-300 active:bg-gray-50"
      >
        {searchBarContent}
      </button>

      {/* ── Desktop: inline dropdown ── */}
      <div ref={rootRef} className="relative hidden w-full max-w-xl md:block">
        <div className="flex min-h-12 items-center gap-3 rounded-full border-2 border-gray-200 bg-white px-4 py-2 transition-shadow hover:shadow-lg focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-slate-900 focus-within:ring-offset-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
            <img
              src="/images/shared/compatibility-icon.svg"
              alt=""
              aria-hidden
              className="h-6 w-6 object-contain"
            />
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={placeholder}
            aria-label={productTr.verificareCompatibilitate}
            aria-expanded={focused}
            aria-controls="home-inverter-search-results"
            autoComplete="off"
            enterKeyHint="search"
            className="min-w-0 flex-1 bg-transparent text-base font-semibold text-gray-900 placeholder:text-gray-500 font-['Inter'] focus:outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
          />
          <svg
            className="h-5 w-5 shrink-0 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
          </svg>
        </div>

        {focused ? (
          <div
            id="home-inverter-search-results"
            role="listbox"
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 max-h-64 overflow-y-auto rounded-2xl border border-gray-200 bg-white py-2 shadow-lg [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {filteredBrands.length > 0 ? (
              <ul className="space-y-0.5 px-2">
                {filteredBrands.map((brand) => {
                  const isHighlighted = searching && brand.toLowerCase().includes(query)
                  return (
                    <li
                      key={brand}
                      role="option"
                      aria-selected={isHighlighted}
                      className={`rounded-xl px-3 py-2.5 text-base font-medium font-['Inter'] ${
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
            ) : (
              <div className="flex flex-col items-center gap-3 px-4 py-3">
                <p className="m-0 text-center text-sm leading-relaxed text-neutral-700 font-['Inter']">
                  {productTr.compatibilitateInvertorNotFoundMessage}
                </p>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-gray-900 px-4 py-3 text-center text-sm font-bold uppercase tracking-wide text-white font-['Inter'] transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                >
                  {productTr.compatibilitateInvertorAskAssistanceBtn}
                </a>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* ── Bottom-sheet modal (mobile) ── */}
      {mobileModalOpen && (
        <CompatibilitateInvertorModal onClose={() => setMobileModalOpen(false)} />
      )}
    </>
  )
}
