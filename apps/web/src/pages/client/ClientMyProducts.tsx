import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getClientOrders, type ClientOrderRow } from '../../lib/api'
import { INSTALATORI_ONLY } from '../../lib/siteMode'

type AggregatedLine = {
  productId: string
  productSlug: string | null
  productTitle: string
  totalQuantity: number
  lastPurchasedAt: string
}

function aggregatePurchased(rows: ClientOrderRow[]): AggregatedLine[] {
  const map = new Map<string, AggregatedLine>()
  for (const o of rows) {
    const t = new Date(o.createdAt).getTime()
    for (const L of o.lines || []) {
      const k = L.productId
      const cur = map.get(k)
      if (!cur) {
        map.set(k, {
          productId: L.productId,
          productSlug: L.productSlug,
          productTitle: L.productTitle,
          totalQuantity: L.quantity,
          lastPurchasedAt: o.createdAt,
        })
      } else {
        cur.totalQuantity += L.quantity
        if (t > new Date(cur.lastPurchasedAt).getTime()) {
          cur.lastPurchasedAt = o.createdAt
        }
        if (!cur.productSlug && L.productSlug) cur.productSlug = L.productSlug
      }
    }
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.lastPurchasedAt).getTime() - new Date(a.lastPurchasedAt).getTime(),
  )
}

export default function ClientMyProducts() {
  const [orders, setOrders] = useState<ClientOrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let c = false
    getClientOrders()
      .then((rows) => {
        if (!c) setOrders(rows)
      })
      .catch((e) => {
        if (!c) setError(e instanceof Error ? e.message : 'Eroare')
      })
      .finally(() => {
        if (!c) setLoading(false)
      })
    return () => {
      c = true
    }
  }, [])

  const products = useMemo(() => aggregatePurchased(orders), [orders])

  if (loading) {
    return <p className="text-slate-500 font-['Inter']">Se încarcă...</p>
  }
  if (error) {
    return <p className="text-red-600 text-sm font-['Inter']">{error}</p>
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Produsele mele</h1>
      <p className="text-slate-600 text-sm font-['Inter'] mb-8">
        Produse achiziționate prin comenzile tale, plus resurse pentru suport, documentație și garanție.
      </p>

      <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold font-['Inter'] text-slate-900 mb-3">Produse achiziționate</h2>
        {products.length === 0 ? (
          <p className="text-slate-500 text-sm font-['Inter']">
            Încă nu ai produse înregistrate din comenzi.
            {!INSTALATORI_ONLY ? (
              <>
                {' '}
                <Link to="/produse" className="font-medium text-slate-900 underline underline-offset-2">
                  Vezi catalogul
                </Link>
                .
              </>
            ) : null}
          </p>
        ) : (
          <ul className="space-y-3">
            {products.map((p) => (
              <li
                key={p.productId}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  {p.productSlug && !INSTALATORI_ONLY ? (
                    <Link
                      to={`/produse/${encodeURIComponent(p.productSlug)}`}
                      className="font-semibold text-slate-900 font-['Inter'] hover:underline"
                    >
                      {p.productTitle}
                    </Link>
                  ) : (
                    <span className="font-semibold text-slate-900 font-['Inter']">{p.productTitle}</span>
                  )}
                  <p className="text-xs text-slate-500 font-['Inter'] mt-0.5">
                    Cantitate totală: {p.totalQuantity}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-10 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
        <h2 className="text-lg font-bold font-['Inter'] text-slate-900 mb-2">Suport tehnic</h2>
        <p className="text-sm text-slate-600 font-['Inter'] mb-3">
          Pentru întrebări despre produsele achiziționate, instalare sau service, echipa Baterino te poate ghida.
        </p>
        {!INSTALATORI_ONLY ? (
          <Link
            to="/contact"
            className="inline-flex text-sm font-semibold text-slate-900 font-['Inter'] underline underline-offset-2"
          >
            Contactează-ne
          </Link>
        ) : (
          <p className="text-sm text-slate-500 font-['Inter']">
            Pentru suport, folosește datele de contact comunicate la comandă.
          </p>
        )}
      </section>

      <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold font-['Inter'] text-slate-900 mb-2">Manuale de instalare</h2>
        <p className="text-sm text-slate-600 font-['Inter']">
          Documentația tehnică și materialele pentru montaj sunt publicate pe pagina fiecărui produs din catalog.
          {!INSTALATORI_ONLY ? (
            <>
              {' '}
              Deschide produsul din lista de mai sus sau din{' '}
              <Link to="/produse" className="font-medium text-slate-900 underline underline-offset-2">
                Produse
              </Link>{' '}
              pentru detalii și fișiere disponibile.
            </>
          ) : (
            <> Folosește lista de mai sus ca referință; pentru link-uri directe, consultantul Baterino te poate ajuta.</>
          )}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold font-['Inter'] text-slate-900 mb-2">Certificat de garanție</h2>
        <p className="text-sm text-slate-600 font-['Inter']">
          Certificatul de garanție însoțește livrarea produsului. Dacă ai nevoie de un duplicat sau de clarificări privind
          termenii garanției, scrie-ne prin pagina de contact, menționând numărul comenzii.
        </p>
      </section>
    </div>
  )
}
