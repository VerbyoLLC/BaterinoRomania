import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getProductDetailTranslations } from '../../i18n/product-detail'

/* ── Reducere Partener box ──────────────────────────────────────── */
export function ReducerePartenerBox({
  discountPercent,
  loading,
}: {
  discountPercent: number | null
  loading: boolean
}) {
  const fmt = (n: number) => (n % 1 === 0 ? Math.round(n) : n.toFixed(1))

  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50 to-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <svg className="h-3.5 w-3.5 text-amber-700" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </span>
        <h2 className="m-0 text-xs font-bold uppercase tracking-wider text-amber-900 font-['Inter']">
          Reducere partener
        </h2>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="mx-auto h-14 w-28 rounded-xl bg-amber-100/60" />
          <div className="h-3 w-3/4 rounded bg-amber-100/60" />
          <div className="h-3 w-1/2 rounded bg-amber-100/60" />
        </div>
      ) : discountPercent != null && discountPercent > 0 ? (
        <>
          <div className="flex flex-col items-center py-3">
            <p className="m-0 text-5xl font-extrabold tabular-nums text-slate-900 font-['Inter'] leading-none">
              -{fmt(discountPercent)}%
            </p>
            <p className="mt-1 m-0 text-xs font-semibold uppercase tracking-widest text-amber-700 font-['Inter']">
              reducere
            </p>
          </div>
          <div className="mt-1 rounded-xl border border-amber-100 bg-white px-3 py-2.5 text-center">
            <p className="m-0 text-sm font-medium leading-snug text-slate-700 font-['Inter']">
              Beneficiezi de o reducere de{' '}
              <span className="font-bold text-slate-900">{fmt(discountPercent)}%</span>{' '}
              la toate produsele.
            </p>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-amber-100 bg-white px-3 py-4 text-center">
          <p className="m-0 text-sm text-slate-500 font-['Inter']">Nicio reducere configurată momentan.</p>
          <p className="mt-1 m-0 text-xs text-slate-400 font-['Inter']">
            Contactați-ne pentru a stabili condițiile de parteneriat.
          </p>
        </div>
      )}
    </div>
  )
}

const SIDEBAR_ACCORDION_STAGGER_MS = 95

/** Produse sidebar: sync expand with cart; stagger collapse bottom→top / expand top→bottom. */
function useCollapsibleExpandedForCart(
  collapsible: boolean,
  cartHasItems: boolean | undefined,
  stackPosition?: 'upper' | 'lower',
) {
  const [expanded, setExpanded] = useState(() => {
    if (!collapsible) return true
    if (cartHasItems === undefined) return true
    return !cartHasItems
  })

  const prevCartRef = useRef<boolean | undefined>(undefined)
  const staggerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (staggerTimeoutRef.current != null) clearTimeout(staggerTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!collapsible || cartHasItems === undefined) return

    const wantExpanded = !cartHasItems
    const prev = prevCartRef.current
    prevCartRef.current = cartHasItems

    if (staggerTimeoutRef.current != null) {
      clearTimeout(staggerTimeoutRef.current)
      staggerTimeoutRef.current = null
    }

    if (prev === undefined) {
      setExpanded(wantExpanded)
      return
    }

    if (prev === cartHasItems) return

    if (!stackPosition) {
      setExpanded(wantExpanded)
      return
    }

    if (wantExpanded) {
      if (stackPosition === 'upper') setExpanded(true)
      else staggerTimeoutRef.current = setTimeout(() => setExpanded(true), SIDEBAR_ACCORDION_STAGGER_MS)
    } else {
      if (stackPosition === 'lower') setExpanded(false)
      else staggerTimeoutRef.current = setTimeout(() => setExpanded(false), SIDEBAR_ACCORDION_STAGGER_MS)
    }
  }, [collapsible, cartHasItems, stackPosition])

  return [expanded, setExpanded] as const
}

/* ── Siguranța Clientului box ───────────────────────────────────── */
export function SigurantaClientuluiBox({
  collapsible = false,
  cartHasItems,
  stackPosition,
}: {
  collapsible?: boolean
  cartHasItems?: boolean
  stackPosition?: 'upper' | 'lower'
}) {
  const { language } = useLanguage()
  const tr = getProductDetailTranslations(language.code)
  const [expanded, setExpanded] = useCollapsibleExpandedForCart(collapsible, cartHasItems, stackPosition)

  const items = [
    { icon: '/images/shared/testing-icon.svg',       label: tr.badgeGarantie,        sub: 'Produsele sunt acoperite de garanție extinsă de 10 ani.' },
    { icon: '/images/shared/compatibility-icon.svg', label: tr.badgeCompatibilitate,  sub: 'Compatibile cu 99% dintre invertoarele de pe piață.' },
    { icon: '/images/shared/delivery-icon.svg',      label: tr.badgeRetur,            sub: 'Retur gratuit în primele 15 zile de la achiziție.' },
    { icon: '/images/shared/swap-icon.svg',          label: tr.badgeSwap,             sub: 'Înlocuire rapidă a bateriei în caz de defecțiune.' },
  ]

  const titleRow = (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100">
        <svg className="h-3.5 w-3.5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </span>
      <h2 className="m-0 text-xs font-bold uppercase tracking-wider text-slate-700 font-['Inter']">
        Siguranța Clientului Tău
      </h2>
    </div>
  )

  const list = (
    <div className="flex flex-col divide-y divide-slate-100">
      {items.map(({ icon, label, sub }) => (
        <div key={label} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-100">
            <img src={icon} alt="" aria-hidden className="h-5 w-5 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="m-0 text-xs font-bold leading-snug text-slate-900 font-['Inter']">{label}</p>
            <p className="mt-0.5 m-0 text-[11px] leading-snug text-slate-500 font-['Inter']">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      {collapsible ? (
        <div className="flex flex-col-reverse">
          <div
            className={`grid min-h-0 transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="pt-3">{list}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className="flex w-full items-center justify-between gap-2 rounded-lg text-left outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            {titleRow}
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300 ease-out ${expanded ? 'rotate-180' : ''}`}
              aria-hidden
              strokeWidth={2.5}
            />
          </button>
        </div>
      ) : (
        <>
          <div className="mb-3">{titleRow}</div>
          {list}
        </>
      )}
    </div>
  )
}

/* ── Suport Tehnic box ──────────────────────────────────────────── */
export function SuportTehnicBox({
  collapsible = false,
  cartHasItems,
  stackPosition,
}: {
  collapsible?: boolean
  cartHasItems?: boolean
  stackPosition?: 'upper' | 'lower'
}) {
  const [expanded, setExpanded] = useCollapsibleExpandedForCart(collapsible, cartHasItems, stackPosition)

  const items = [
    { icon: '/images/shared/maintance-icon.svg', label: 'Suport & Service', sub: 'Echipă dedicată pentru întrebări tehnice și service în România.' },
  ]

  const titleRow = (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100">
        <svg className="h-3.5 w-3.5 text-sky-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </span>
      <h2 className="m-0 text-xs font-bold uppercase tracking-wider text-sky-800 font-['Inter']">
        Suport Tehnic
      </h2>
    </div>
  )

  const body = (
    <>
      <div className="flex flex-col divide-y divide-sky-50">
        {items.map(({ icon, label, sub }) => (
          <div key={label} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 ring-1 ring-sky-100">
              <img src={icon} alt="" aria-hidden className="h-5 w-5 object-contain" />
            </div>
            <div className="min-w-0">
              <p className="m-0 text-xs font-bold leading-snug text-slate-900 font-['Inter']">{label}</p>
              <p className="mt-0.5 m-0 text-[11px] leading-snug text-slate-500 font-['Inter']">{sub}</p>
            </div>
          </div>
        ))}
      </div>
      <a
        href="/partner/suport"
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800 transition hover:bg-sky-100 font-['Inter']"
      >
        Contactează suportul →
      </a>
    </>
  )

  return (
    <div className="rounded-2xl border border-sky-100 bg-gradient-to-b from-sky-50 to-white p-4">
      {collapsible ? (
        <div className="flex flex-col-reverse">
          <div
            className={`grid min-h-0 transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="pt-3">{body}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className="flex w-full items-center justify-between gap-2 rounded-lg text-left outline-none transition-colors hover:bg-sky-100/60 focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            {titleRow}
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-sky-700 transition-transform duration-300 ease-out ${expanded ? 'rotate-180' : ''}`}
              aria-hidden
              strokeWidth={2.5}
            />
          </button>
        </div>
      ) : (
        <>
          <div className="mb-3">{titleRow}</div>
          {body}
        </>
      )}
    </div>
  )
}
