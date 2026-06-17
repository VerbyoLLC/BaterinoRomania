import { Link, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import PartnerPublicProfileCard from '../components/partner/PartnerPublicProfileCard'
import SEO from '../components/SEO'
import SchemaOrg from '../components/SchemaOrg'
import {
  type PublicPartnerCompanyProfile,
  getPublicPartnerCompanyProfile,
} from '../lib/api'
import { normalizePartnerWorkPhotos } from '../lib/partner-work-photos'
import { publicInstallerProfileCanonical, PUBLIC_INSTALLER_PROFILE_PATH_SEGMENT } from '../lib/public-installer-profile-path'

export default function PartnerCompanyPublicPage() {
  const { handle } = useParams<{ handle: string }>()
  const slugNormalized = useMemo(() => {
    let s = decodeURIComponent(handle ?? '').trim()
    if (s.startsWith('@')) s = s.slice(1).trim()
    return s.toLowerCase()
  }, [handle])

  const [data, setData] = useState<PublicPartnerCompanyProfile | null>(null)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slugNormalized) {
      setBusy(false)
      setError('Profil negăsit.')
      return
    }
    let cancelled = false
    ;(async () => {
      setBusy(true)
      setError('')
      try {
        const p = await getPublicPartnerCompanyProfile(slugNormalized)
        if (!cancelled)
          setData({
            ...p,
            workPhotos: normalizePartnerWorkPhotos(p.workPhotos),
          })
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Profil indisponibil.')
      } finally {
        if (!cancelled) setBusy(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slugNormalized])

  const canonicalPath = slugNormalized ? publicInstallerProfileCanonical(slugNormalized) : `/${PUBLIC_INSTALLER_PROFILE_PATH_SEGMENT}`

  if (!slugNormalized) {
    return (
      <article className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <SEO
          title="Profil negăsit"
          description="Această pagină instalator nu există sau nu mai este disponibilă."
          canonical={canonicalPath}
          noIndex
        />
        <h1 className="text-xl font-extrabold text-slate-900 font-['Inter']">Profil negăsit.</h1>
        <Link
          className="text-sm font-semibold text-emerald-700 underline hover:text-emerald-800 font-['Inter']"
          to="/instalatori"
        >
          Programul instalatori
        </Link>
      </article>
    )
  }

  if (!busy && (error || !data)) {
    return (
      <article className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <SEO title="Profil negăsit" description={error} canonical={canonicalPath} noIndex />
        <h1 className="text-xl font-extrabold text-slate-900 font-['Inter']">{error}</h1>
        <Link
          className="text-sm font-semibold text-emerald-700 underline hover:text-emerald-800 font-['Inter']"
          to="/instalatori"
        >
          Programul instalatori
        </Link>
      </article>
    )
  }

  if (!data) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-xl items-center justify-center px-6 py-14">
        <div
          className="h-12 w-12 animate-spin rounded-full border-2 border-slate-800 border-t-transparent"
          aria-busy
          aria-label="Se încarcă profilul"
        />
      </div>
    )
  }

  const displayName = data.publicName?.trim() || data.companyName?.trim() || data.publicSlug || 'Instalator'
  const seoDesc =
    data.description?.trim()
      ? data.description.trim().slice(0, 160)
      : `${displayName} — instalator partener în rețeaua Baterino Romania.`

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: displayName,
    description: seoDesc,
    url: `https://baterino.ro${canonicalPath}`,
    ...(data.publicPhone ? { telephone: data.publicPhone } : {}),
    ...(data.logoUrl && !String(data.logoUrl).startsWith('data:') ? { image: data.logoUrl } : {}),
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'RO',
      ...(data.city ? { addressLocality: data.city } : {}),
      ...(data.county ? { addressRegion: data.county } : {}),
    },
    areaServed: { '@type': 'Country', name: 'Romania' },
    ...(Array.isArray(data.services) && data.services.length > 0
      ? { knowsAbout: data.services }
      : {}),
    parentOrganization: {
      '@type': 'Organization',
      name: 'Baterino Romania',
      url: 'https://baterino.ro',
    },
  }

  return (
    <article className="mx-auto max-w-lg px-4 py-12 sm:py-14">
      <SEO
        title={`${displayName} — Instalatori Baterino`}
        description={seoDesc}
        canonical={canonicalPath}
        ogImage={
          data.logoUrl && !String(data.logoUrl).startsWith('data:')
            ? String(data.logoUrl)
            : '/images/shared/baterino-logo-black.svg'
        }
      />
      <SchemaOrg schema={localBusinessSchema} />

      <div className="flex w-full flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <Link
            to="/"
            className="block transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-400 rounded-md"
            aria-label="Baterino Romania — acasă"
          >
            <img
              src="/images/shared/baterino-logo-black.svg"
              alt="Baterino Romania"
              className="h-10 w-auto sm:h-12"
            />
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-['Inter']">
            <Link className="text-slate-500 transition hover:text-slate-800" to="/">
              Acasă
            </Link>
            <span aria-hidden>/</span>
            <Link className="text-slate-500 transition hover:text-slate-800" to="/instalatori">
              Instalatori
            </Link>
            <span aria-hidden>/</span>
            <span className="text-slate-700">@{data.publicSlug}</span>
          </nav>
        </div>

        <div className="w-full">
          <PartnerPublicProfileCard
            variant="public"
            logoUrl={data.logoUrl}
            publicName={data.publicName?.trim() || ''}
            companyName={data.companyName}
            city={data.city ?? ''}
            county={data.county ?? ''}
            description={data.description ?? ''}
            servicii={Array.isArray(data.services) ? data.services : []}
            publicPhone={data.publicPhone ?? ''}
            whatsapp={data.whatsapp ?? ''}
            website={data.website ?? ''}
            facebookUrl={data.facebookUrl ?? ''}
            linkedinUrl={data.linkedinUrl ?? ''}
            instagramUrl={data.instagramUrl ?? ''}
            tiktokUrl={data.tiktokUrl ?? ''}
            isPublic
            workPhotos={data.workPhotos}
          />
        </div>

        <p className="max-w-md text-center text-sm leading-relaxed text-slate-600 font-['Inter']">
          If you need assistance related to this business please{' '}
          <Link to="/contact" className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 transition hover:decoration-slate-600">
            contact us
          </Link>
          .
        </p>
      </div>
    </article>
  )
}
