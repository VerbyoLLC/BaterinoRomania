import type { AdminCompanyData } from '../../lib/api'
import './admin-benefits-partner-a4.css'

const SITE_WEB = 'www.baterino.ro'
const SITE_LABEL = 'baterino.ro'
const CONTACT_EMAIL = 'vanzari@baterino.ro'
const CONTACT_PHONE = '+40 770 106 374'
const FOOTER_WEB = 'WWW.BATERINO.RO'
const FOOTER_EMAIL = 'VANZARI@BATERINO.RO'
const FOOTER_PHONE = '+40 770 106 374'
const DEFAULT_COMPANY_NAME = 'Baterino Energy SRL'
const DEFAULT_ADDRESS = 'Str. 23 August 244–43A, Otopeni, Ilfov, România'

function partnerSignupUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/signup/clienti?tab=partener`
  }
  return 'https://baterino.ro/signup/clienti?tab=partener'
}

function qrDataUrl(payload: string, sizePx = 120): string {
  const n = Math.min(300, Math.max(60, Math.round(sizePx)))
  const data = encodeURIComponent(payload)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${n}x${n}&ecc=H&color=0a0e1a&bgcolor=ffffff&data=${data}`
}

const PARTNER_SIGNUP_QR_PX = 88

const BENEFIT_ICONS = {
  warranty: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  swap: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  return: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  wifi: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="#1e46b4" stroke="none" />
    </svg>
  ),
  official: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  ),
  verified: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  price: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
} as const

const PARTNER_BENEFITS = [
  {
    icon: 'warranty' as const,
    title: 'Structură de preț stabilă și predictibilă',
    desc: 'Prețuri transparente și stabile pe termen lung — fără surprize, fără fluctuații. Știi mereu cu ce marjă lucrezi.',
    tag: 'Transparență totală',
  },
  {
    icon: 'phone' as const,
    title: 'Marje competitive și reduceri pentru volum',
    desc: 'Structura noastră de prețuri este construită în jurul succesului partenerilor. Cu cât vinzi mai mult, cu atât marja ta crește.',
    tag: 'Model scalabil',
  },
  {
    icon: 'swap' as const,
    title: 'Strategie de prețuri comună',
    desc: 'Stabilim împreună strategia de prețuri pentru piața din România, astfel încât să maximizăm vânzările și să protejăm pozițiile comerciale.',
    tag: 'Protecție teritorială',
  },
  {
    icon: 'return' as const,
    title: 'Garanție 10 ani gestionată de Baterino',
    desc: 'Nu depinzi de producător și nu lași clientul singur. Preluăm responsabilitatea completă față de clientul final — 10 ani garanție.',
    tag: 'Zero risc pentru tine',
  },
  {
    icon: 'wifi' as const,
    title: 'Sistem SWAP — Zero întreruperi pentru clientul tău',
    desc: 'În cazul unei defecțiuni, înlocuim bateria imediat pe durata diagnozei. Clientul tău nu simte nicio întrerupere, iar tu îți protejezi reputația.',
    tag: 'Fidelizare clienți',
  },
  {
    icon: 'official' as const,
    title: 'Service local și suport tehnic 24/7',
    desc: 'Echipă de service în România, disponibilă non-stop. Niciun timp mort, nicio dependență de distanța față de producător — rezolvăm rapid, local.',
    tag: 'Suport non-stop',
  },
  {
    icon: 'verified' as const,
    title: 'Generare activă de lead-uri și clienți',
    desc: 'Nu ești singur pe piață — Baterino direcționează activ comenzi și clienți către partenerii din rețea, în funcție de zona ta de activitate.',
    tag: 'Clienți din rețea',
  },
  {
    icon: 'price' as const,
    title: 'Vizibilitate în platforma și aplicația Baterino',
    desc: 'Compania ta apare direct în ecosistemul Baterino, în fața clienților finali care caută instalatori și parteneri locali — expunere națională.',
    tag: 'Expunere națională',
  },
]

function IconGlobe() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function IconPhoneSmall() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconBuilding() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </svg>
  )
}

export type AdminBenefitsPartnerA4Props = {
  company?: AdminCompanyData | null
}

export default function AdminBenefitsPartnerA4({ company }: AdminBenefitsPartnerA4Props) {
  const companyName = company?.name?.trim() || DEFAULT_COMPANY_NAME
  const address = company?.address?.trim() || DEFAULT_ADDRESS
  const cui = company?.cui?.trim()
  const cuiLabel = cui ? (cui.toUpperCase().startsWith('RO') ? cui : `RO${cui}`) : ''

  return (
    <div className="admin-benefits-partner-a4">
      <div className="abp-top" />

      <div className="abp-header">
        <div>
          <img
            className="abp-logo-img"
            src="/images/shared/baterino-logo-black.svg"
            alt="Baterino"
            width={180}
            height={32}
          />
          <div className="abp-logo-sub">Energy Storage Infrastructure</div>
        </div>
        <div>
          <div className="abp-doc-title">Beneficiile Partenerilor</div>
          <div className="abp-doc-sub">
            {SITE_LABEL} &nbsp;·&nbsp; De ce să devii partener
          </div>
        </div>
      </div>

      <div className="abp-intro">
        <div className="abp-intro-eyebrow">De ce să devii partener Baterino</div>
        <div className="abp-intro-title">
          Beneficiile de a fi partener <span>Baterino</span>
        </div>
        <div className="abp-intro-body">
          Mai mult decât o distribuție — un parteneriat strategic pe termen lung. Împreună construim o
          rețea solidă, cu prețuri corecte, suport real și instrumentele necesare să îți crești afacerea
          sustenabil.
        </div>
      </div>

      <div className="abp-benefits">
        {PARTNER_BENEFITS.map((b) => (
          <div key={b.title} className="abp-ben">
            <div className="abp-ben-icon">{BENEFIT_ICONS[b.icon]}</div>
            <div>
              <div className="abp-ben-title">{b.title}</div>
              <div className="abp-ben-desc">{b.desc}</div>
              <div className="abp-ben-tag">{b.tag}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="abp-cta">
        <div className="abp-cta-body">
          <div className="abp-cta-title">Creează-ți un cont de partener în platforma Baterino</div>
          <div className="abp-cta-sub">
            Gestionezi prețurile, comenzile și suportul de partener — totul într-un singur loc, de pe
            orice dispozitiv.
          </div>
          <div className="abp-cta-contacts">
            <div className="abp-cta-item">
              <IconGlobe />
              <span>{SITE_LABEL}</span>
            </div>
            <div className="abp-cta-item">
              <IconPhoneSmall />
              <span>{CONTACT_PHONE}</span>
            </div>
            <div className="abp-cta-item">
              <IconMail />
              <span>{CONTACT_EMAIL}</span>
            </div>
          </div>
        </div>
        <div className="abp-cta-qr" aria-hidden>
          <img
            src={qrDataUrl(partnerSignupUrl(), PARTNER_SIGNUP_QR_PX)}
            alt=""
            width={PARTNER_SIGNUP_QR_PX}
            height={PARTNER_SIGNUP_QR_PX}
          />
        </div>
      </div>

      <div className="abp-sheet-end">
        <div className="abp-footer">
          <div>
            <div className="abp-f-lbl">Companie</div>
            <div className="abp-f-brand">
              BATER<span>I</span>NO
            </div>
            <div className="abp-f-brand-sub">Energy Storage Infrastructure</div>
            <div className="abp-f-row">
              <IconGlobe />
              <span>{SITE_WEB}</span>
            </div>
            <div className="abp-f-row">
              <IconPhoneSmall />
              <span>{CONTACT_PHONE}</span>
            </div>
            <div className="abp-f-row">
              <IconMail />
              <span>{CONTACT_EMAIL}</span>
            </div>
          </div>
          <div>
            <div className="abp-f-lbl">Adresă</div>
            <div className="abp-f-addr-title">Adresa Baterino România</div>
            <div className="abp-f-addr-entity">{companyName}</div>
            <div className="abp-f-row">
              <IconPin />
              <span>{address}</span>
            </div>
            {cuiLabel ? (
              <div className="abp-f-row" style={{ marginTop: 3 }}>
                <IconBuilding />
                <span>CUI: {cuiLabel}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="abp-bottom">
          <span className="abp-bottom-contact">
            {FOOTER_WEB} · {FOOTER_EMAIL} · {FOOTER_PHONE}
          </span>
        </div>
      </div>
    </div>
  )
}
