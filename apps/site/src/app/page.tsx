import type { Metadata } from 'next'
import HomePageClient from '../components/home/HomePageClient'
import { getProducts, getPageSeoAll } from '../lib/api'

export const revalidate = 300

const DEFAULT_TITLE =
  'Baterino - Baterii LiFePO4 pentru sisteme fotovoltaice. Soluții stocare pentru sectorul rezidențial, industrial, medical și maritim.'
const DEFAULT_DESCRIPTION =
  'Importator și distribuitor LithTech pentru baterii LiFePO4 și sisteme fotovoltaice pentru sectorul rezidențial, industrial, medical și maritim. Servicii complete, garanție 10 ani.'
const DEFAULT_OG_IMAGE = 'https://www.baterino.ro/images/home/og-baterino-romania.jpg'

export async function generateMetadata(): Promise<Metadata> {
  const seoRows = await getPageSeoAll()
  const override = seoRows.find((r) => r.pageKey === 'home')
  const title = override?.title?.trim() || DEFAULT_TITLE
  const description = override?.description?.trim() || DEFAULT_DESCRIPTION
  const ogTitle = override?.ogTitle?.trim() || title
  const ogDescription = override?.ogDescription?.trim() || description
  const ogImage = override?.ogImage?.trim() || DEFAULT_OG_IMAGE

  return {
    title: title.includes('Baterino') ? title : `${title} | Baterino Romania`,
    description,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      siteName: 'Baterino',
      locale: 'ro_RO',
      url: 'https://www.baterino.ro/',
      title: ogTitle,
      description: ogDescription,
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
  }
}

export default async function HomePage() {
  const products = await getProducts().catch(() => [])
  return <HomePageClient initialProducts={products} />
}
