import {
  MapPin,
  Phone,
  Globe,
  MessageCircle,
  ChevronRight,
  Building2,
  BadgeCheck,
} from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import type { LangCode } from '../../i18n/menu'
import { getPartnerProfileCardTranslations } from '../../i18n/partner/profile-card'
import { getPartnerServiciiOptions } from '../../i18n/partner/servicii'

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function IconLinkedin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm6.5-.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2z" />
    </svg>
  )
}

function IconTiktok({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16 3a5 5 0 0 0 5 5v2h-3a2 2 0 0 1-2-2V6.1A4.1 4.1 0 0 0 12.9 2H11v13.5a2.5 2.5 0 1 1-2.4-2.5 2.5 2.5 0 0 1 2.5 2.5V22a6 6 0 0 1-6-6V9h2v7a4 4 0 0 0 8 0V3h-1z" />
    </svg>
  )
}

function webHref(raw: string) {
  const t = raw.trim()
  if (!t) return '#'
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}

export type PartnerPublicProfileCardProps = {
  variant: 'owner-preview' | 'public'
  logoUrl?: string | null
  publicName: string
  companyName?: string
  city: string
  county: string
  description: string
  servicii: string[]
  publicPhone: string
  whatsapp: string
  website: string
  facebookUrl: string
  linkedinUrl: string
  instagramUrl: string
  tiktokUrl: string
  isPublic: boolean
  workPhotos: string[]
  partnerProfileAdministrativelyVerified?: boolean
}

export default function PartnerPublicProfileCard(props: PartnerPublicProfileCardProps) {
  const {
    variant,
    logoUrl,
    publicName,
    companyName,
    city,
    county,
    description,
    servicii,
    publicPhone,
    whatsapp,
    website,
    facebookUrl,
    linkedinUrl,
    instagramUrl,
    tiktokUrl,
    isPublic,
    workPhotos,
    partnerProfileAdministrativelyVerified,
  } = props

  const { language } = useLanguage()
  const lang = language.code as LangCode
  const tr = getPartnerProfileCardTranslations(lang)
  const serviciiOptions = getPartnerServiciiOptions(lang)

  const verifiedForTrustBadge =
    partnerProfileAdministrativelyVerified ?? variant === 'public'

  const displayName =
    variant === 'public'
      ? publicName.trim() || companyName?.trim() || tr.defaultNamePublic
      : publicName.trim() || companyName?.trim() || tr.defaultNamePreview

  const location = [city.trim(), county.trim()].filter(Boolean).join(', ')
  const serviceLabels = servicii.map(
    (id) => serviciiOptions.find((o) => o.id === id)?.label ?? id,
  )
  const servicePlaceholders = [tr.servicePlaceholder1, tr.servicePlaceholder2, tr.servicePlaceholder3]
  const showWhatsappChip = !!(whatsapp || !publicPhone)
  const ctaHref = publicPhone.trim()
    ? `tel:${publicPhone.replace(/\s+/g, '')}`
    : whatsapp.trim()
      ? `https://wa.me/${whatsapp.replace(/\D/g, '')}`
      : '#'

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_32px_-12px_rgba(15,23,42,0.14),0_4px_16px_-8px_rgba(15,23,42,0.08)]">
      <div className="h-24 bg-gradient-to-br from-slate-800 to-slate-600" />

      <div className="-mt-12 flex items-end gap-4 px-5 pb-0">
        <div className="relative shrink-0">
          <div
            className={`h-20 w-20 overflow-hidden rounded-2xl border-4 bg-slate-100 shadow-lg ${
              verifiedForTrustBadge ? 'border-emerald-500' : 'border-white'
            }`}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Building2 className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
              </div>
            )}
          </div>
          {verifiedForTrustBadge ? (
            <span
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md ring-2 ring-white"
              aria-hidden
            >
              <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
          ) : null}
        </div>
        <div className="mb-2 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {variant === 'owner-preview' ? (
              isPublic ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 font-['Inter']">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {tr.badgePublic}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 font-['Inter']">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  {tr.badgePrivate}
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 font-['Inter']">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {tr.badgeActiveInstaller}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-3">
        <h1 className="text-lg font-extrabold leading-snug text-slate-900 font-['Inter']">{displayName}</h1>

        <div
          className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-lg bg-slate-50/90 px-2 py-1.5"
          role="status"
          aria-label={tr.partnerBadgeAria}
        >
          <BadgeCheck className="h-4 w-4 shrink-0 text-slate-900" strokeWidth={2} aria-hidden />
          <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-900 font-['Inter']">
            {tr.partnerBadgeLabel}
          </span>
        </div>

        {location ? (
          <div className="mt-1 flex items-center gap-1 text-sm text-slate-500 font-['Inter']">
            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            {location}
          </div>
        ) : (
          <div className="mt-1 flex items-center gap-1 text-sm text-slate-300 font-['Inter']">
            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            {tr.locationPlaceholder}
          </div>
        )}

        <p
          className={`mt-3 text-sm leading-relaxed font-['Inter'] ${
            description.trim() ? 'text-slate-600' : variant === 'public' ? 'text-slate-400' : 'italic text-slate-300'
          }`}
        >
          {description.trim() ||
            (variant === 'public' ? tr.noDescriptionPublic : tr.noDescriptionPreview)}
        </p>

        {serviceLabels.length > 0 ? (
          <div className="mt-4">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-['Inter']">
              {tr.servicesHeading}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {serviceLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 font-['Inter']"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        ) : (
          variant === 'owner-preview' && (
            <div className="mt-4">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-300 font-['Inter']">
                {tr.servicesHeading}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {servicePlaceholders.map((l) => (
                  <span
                    key={l}
                    className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-300 font-['Inter']"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={publicPhone ? `tel:${publicPhone.replace(/\s+/g, '')}` : '#'}
            className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition font-['Inter'] ${
              publicPhone
                ? 'bg-slate-900 text-white hover:bg-slate-700'
                : 'cursor-default bg-slate-100 text-slate-300'
            }`}
          >
            <Phone className="h-4 w-4 shrink-0" strokeWidth={2} />
            {publicPhone || tr.phoneFallback}
          </a>
          {showWhatsappChip && (
            <a
              href={whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : '#'}
              className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition font-['Inter'] ${
                whatsapp
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'cursor-default bg-slate-50 text-slate-300'
              }`}
            >
              <MessageCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
              WhatsApp
            </a>
          )}
          {website && (
            <a
              href={webHref(website)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-sky-50 px-3.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 font-['Inter']"
            >
              <Globe className="h-4 w-4 shrink-0" strokeWidth={2} />
              Website
            </a>
          )}
        </div>

        {(facebookUrl || linkedinUrl || instagramUrl || tiktokUrl) && (
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
            {facebookUrl && (
              <a
                href={webHref(facebookUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                aria-label="Facebook"
              >
                <IconFacebook className="h-4 w-4" />
              </a>
            )}
            {instagramUrl && (
              <a
                href={webHref(instagramUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50 text-pink-600 transition hover:bg-pink-100"
                aria-label="Instagram"
              >
                <IconInstagram className="h-4 w-4" />
              </a>
            )}
            {linkedinUrl && (
              <a
                href={webHref(linkedinUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-700 transition hover:bg-sky-100"
                aria-label="LinkedIn"
              >
                <IconLinkedin className="h-4 w-4" />
              </a>
            )}
            {tiktokUrl && (
              <a
                href={webHref(tiktokUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white transition hover:bg-slate-800"
                aria-label="TikTok"
              >
                <IconTiktok className="h-4 w-4" />
              </a>
            )}
          </div>
        )}

        {workPhotos.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-['Inter']">
              {tr.workGalleryHeading}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {workPhotos.slice(0, 6).map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                  <img src={src} alt={`${tr.workPhotoAlt} ${i + 1}`} className="h-full w-full object-cover" />
                  {i === 5 && workPhotos.length > 6 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="text-base font-bold text-white font-['Inter']">
                        +{workPhotos.length - 6}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {variant === 'owner-preview' ? (
          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 font-['Inter']"
          >
            {tr.contactCta}
            <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={2.5} />
          </button>
        ) : (
          <a
            href={ctaHref}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 font-['Inter']"
          >
            {tr.contactCta}
            <ChevronRight className="h-4 w-4 shrink-0 text-white" strokeWidth={2.5} />
          </a>
        )}
      </div>
    </div>
  )
}

