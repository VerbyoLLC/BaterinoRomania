/**
 * Placeholder "Oferte" (special offers) catalog — not backed by the admin/API yet.
 * Swap this for a real endpoint once the offers admin exists; the page components
 * only depend on `getAllOferte` / `getOfertaBySlug`, so that's the only file to change.
 */
export type OfertaSpec = { label: string; value: string }

export type Oferta = {
  slug: string
  title: string
  description: string
  /** RON, VAT included */
  price: number
  image: string
  specs?: OfertaSpec[]
}

export const OFERTE: Oferta[] = [
  {
    slug: 'oferta-exemplu',
    title: 'Ofertă exemplu',
    description:
      'Descrierea ofertei apare aici. Explică pe scurt ce include oferta, pentru cine este potrivită și de ce este avantajoasă.',
    price: 9999,
    image: '/images/home/offer-baterino.webp',
    specs: [
      { label: 'Capacitate totală', value: '20.0 kWh' },
      { label: 'Configurație', value: '2 × 10.0 kWh' },
      { label: 'Durată de viață', value: '6.000 cicluri' },
      { label: 'Conectivitate', value: 'Wi-Fi · Bluetooth' },
      { label: 'Compoziție celulă', value: 'LiFePo4' },
      { label: 'Garanție', value: '10 ani' },
    ],
  },
]

export function getAllOferte(): Oferta[] {
  return OFERTE
}

export function getOfertaBySlug(slug: string | undefined): Oferta | undefined {
  if (!slug) return undefined
  return OFERTE.find((o) => o.slug === slug)
}
