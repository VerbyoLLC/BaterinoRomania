import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  clearAuth,
  getAuthEmail,
  getAuthRole,
  getAuthToken,
  getAdminAccount,
  getAdminInquiriesUnreadCount,
} from '../../lib/api'
import { adminOfferNewFreshPath } from '../../lib/commercialOfferDraft'

function formatSidebarName(
  firstName: string,
  lastName: string,
  email: string | null,
): string {
  const n = [firstName, lastName]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(' ')
    .trim()
  if (n) return n
  if (email) {
    const local = email.split('@')[0]?.trim()
    if (local) return local
  }
  return '—'
}

/* ── Icons ──────────────────────────────────────────────────────── */
function IconDashboard() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}
function IconProducts() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0v10l-8 4m0-14L4 17m8 4V10" />
    </svg>
  )
}
function IconClients() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}
function IconParteneri() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  )
}
function IconCompanies() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 14v3m4-3v3m4-3v3" />
    </svg>
  )
}
function IconArticles() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}
function IconMedia() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  )
}
function IconStudiiDeCaz() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  )
}
function IconStocks() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  )
}
function IconAddItem() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}
function IconLista() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  )
}
function IconInventar() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  )
}
function IconModele() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3L2 8l10 5 10-5-10-5zM2 13l10 5 10-5M2 18l10 5 10-5"
      />
    </svg>
  )
}
function IconOrders() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  )
}
function IconOffers() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v4h4" />
    </svg>
  )
}
function IconLeads() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 11l-2-2m0 0l-2 2m2-2v6" />
    </svg>
  )
}
function IconService() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26"
      />
    </svg>
  )
}
function IconDiscounts() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  )
}
function IconMessages() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}
function IconPhone() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}
function IconSettings() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
function IconLockPassword() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  )
}
function IconAccountDetails() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  )
}
function IconCurrency() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
function IconCompanyData() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  )
}
function IconAgents() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"
      />
    </svg>
  )
}
function IconSeo() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11h6M8 14h4" />
    </svg>
  )
}
function IconTemplates() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 5a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11h8M8 15h5" />
    </svg>
  )
}
function IconChevronNav({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}
function IconLogout() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}

type NavLinkItem = { kind: 'link'; to: string; label: string; icon: ReactNode; end: boolean }

type NavGroupItem = {
  kind: 'group'
  id: string
  label: string
  icon: ReactNode
  children: { to: string; label: string; icon: ReactNode }[]
}

const SETARI_PATHS = [
  '/admin/change-password',
  '/admin/account',
  '/admin/currency',
  '/admin/company-data',
  '/admin/phone-numbers',
  '/admin/agents',
  '/admin/warranty-certificate-preview',
  '/admin/setari/sabloane',
  '/admin/setari/sabloane-proforma',
  '/admin/oferte/sabloane',
  '/admin/oferte/sabloane-beneficii',
] as const

const ADMIN_SETARI_LINKS: { to: string; label: string; icon: ReactNode }[] = [
  { to: '/admin/setari/sabloane', label: 'Șabloane', icon: <IconTemplates /> },
  { to: '/admin/change-password', label: 'Schimbă parola', icon: <IconLockPassword /> },
  { to: '/admin/account', label: 'Detalii cont', icon: <IconAccountDetails /> },
  { to: '/admin/currency', label: 'Currency', icon: <IconCurrency /> },
  { to: '/admin/company-data', label: 'Date companie', icon: <IconCompanyData /> },
  { to: '/admin/phone-numbers', label: 'Numere de telefon', icon: <IconPhone /> },
  { to: '/admin/agents', label: 'Agenți', icon: <IconAgents /> },
  { to: '/admin/site-seo', label: 'Site SEO', icon: <IconSeo /> },
]
const PARTENERI_PATHS = ['/admin/clients', '/admin/companies'] as const
const MEDIA_PATHS = ['/admin/articles', '/admin/studii-de-caz', '/admin/discounts'] as const
const INVENTAR_PATHS = ['/admin/products', '/admin/product-models'] as const
const STOCURI_PATHS = ['/admin/stocuri'] as const

const NAV_ITEMS: (NavLinkItem | NavGroupItem)[] = [
  { kind: 'link', to: '/admin', label: 'Dashboard', icon: <IconDashboard />, end: true },
  { kind: 'link', to: '/admin/orders', label: 'Comenzi', icon: <IconOrders />, end: false },
  {
    kind: 'group',
    id: 'oferte',
    label: 'Oferte',
    icon: <IconOffers />,
    children: [
      { to: adminOfferNewFreshPath(), label: 'Ofertă nouă', icon: <IconAddItem /> },
      { to: '/admin/oferte/lista', label: 'Lista oferte', icon: <IconLista /> },
      { to: '/admin/oferte/leads', label: 'Leads', icon: <IconLeads /> },
      { to: '/admin/setari/sabloane', label: 'Șabloane', icon: <IconTemplates /> },
    ],
  },
  { kind: 'link', to: '/admin/service', label: 'Service', icon: <IconService />, end: false },
  { kind: 'link', to: '/admin/messages', label: 'Messages', icon: <IconMessages />, end: false },
  {
    kind: 'group',
    id: 'inventar',
    label: 'Magazin',
    icon: <IconInventar />,
    children: [
      { to: '/admin/products', label: 'Produse', icon: <IconProducts /> },
      { to: '/admin/product-models', label: 'Modele', icon: <IconModele /> },
    ],
  },
  {
    kind: 'group',
    id: 'stocuri',
    label: 'Stocuri',
    icon: <IconStocks />,
    children: [
      { to: '/admin/stocuri/add-item', label: 'Add Item', icon: <IconAddItem /> },
      { to: '/admin/stocuri/lista', label: 'Lista', icon: <IconLista /> },
    ],
  },
  {
    kind: 'group',
    id: 'parteneri',
    label: 'Parteneri',
    icon: <IconParteneri />,
    children: [
      { to: '/admin/clients', label: 'Clienți', icon: <IconClients /> },
      { to: '/admin/companies', label: 'Companii', icon: <IconCompanies /> },
    ],
  },
  {
    kind: 'group',
    id: 'media',
    label: 'Media',
    icon: <IconMedia />,
    children: [
      { to: '/admin/articles', label: 'Articole', icon: <IconArticles /> },
      { to: '/admin/studii-de-caz', label: 'Studii de caz', icon: <IconStudiiDeCaz /> },
      { to: '/admin/discounts', label: 'Reduceri', icon: <IconDiscounts /> },
    ],
  },
]

function pathUnderSetari(pathname: string) {
  return SETARI_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function pathUnderParteneri(pathname: string) {
  return PARTENERI_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function pathUnderMedia(pathname: string) {
  return MEDIA_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function pathUnderInventar(pathname: string) {
  return INVENTAR_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function pathUnderStocuri(pathname: string) {
  return STOCURI_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function pathUnderOferte(pathname: string) {
  return pathname === '/admin/oferte' || pathname.startsWith('/admin/oferte/')
}

function AdminTopBar({
  authEmail,
  avatarLetter,
  displayName,
  settingsMenuOpen,
  setSettingsMenuOpen,
  settingsMenuRef,
  settingsActive,
  onOpenSidebar,
  onLogout,
}: {
  authEmail: string | null
  avatarLetter: string
  displayName: string
  settingsMenuOpen: boolean
  setSettingsMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void
  settingsMenuRef: React.RefObject<HTMLDivElement | null>
  settingsActive: boolean
  onOpenSidebar: () => void
  onLogout: () => void
}) {
  return (
    <header className="relative z-40 flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-2.5 lg:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="-ml-1 rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Deschide meniul"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="hidden text-xs font-medium uppercase tracking-wider text-slate-400 font-['Inter'] lg:inline">
          Panou administrare
        </span>
      </div>

      <div className="flex min-w-0 items-center gap-1 sm:gap-2">
        <div className="relative" ref={settingsMenuRef}>
          <button
            type="button"
            onClick={() => setSettingsMenuOpen((o) => !o)}
            aria-expanded={settingsMenuOpen}
            aria-haspopup="menu"
            aria-label="Setări"
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium font-['Inter'] transition-colors sm:gap-2 sm:px-3 [&>svg:first-child]:h-4 [&>svg:first-child]:w-4 ${
              settingsActive || settingsMenuOpen
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <IconSettings />
            <span className="hidden sm:inline">Setări</span>
            <IconChevronNav open={settingsMenuOpen} />
          </button>
          {settingsMenuOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-1.5 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-900/5"
            >
              {ADMIN_SETARI_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  role="menuitem"
                  onClick={() => setSettingsMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 text-sm font-['Inter'] font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <span className="flex-shrink-0 text-slate-500">{link.icon}</span>
                  {link.label}
                </NavLink>
              ))}
            </div>
          ) : null}
        </div>

        <NavLink
          to="/admin/account"
          title={authEmail ?? displayName}
          className={({ isActive }) =>
            `flex min-w-0 max-w-[min(100%,12rem)] items-center gap-2 rounded-lg px-2 py-1.5 transition-colors sm:max-w-xs sm:px-2.5 sm:py-2 ${
              isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`
          }
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
            {avatarLetter}
          </span>
          <span className="hidden min-w-0 truncate text-sm font-medium font-['Inter'] sm:inline">
            {authEmail ?? displayName}
          </span>
        </NavLink>

        <button
          type="button"
          onClick={onLogout}
          aria-label="Deconectare"
          title="Deconectare"
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <IconLogout />
        </button>
      </div>
    </header>
  )
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const authEmail = getAuthEmail()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const displayName = formatSidebarName(firstName, lastName, authEmail)
  const avatarLetter = (displayName !== '—' ? displayName[0] : authEmail?.trim()?.[0] ?? 'A').toUpperCase()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false)
  const settingsMenuRef = useRef<HTMLDivElement>(null)
  const [parteneriOpen, setParteneriOpen] = useState(() => pathUnderParteneri(location.pathname))
  const [mediaOpen, setMediaOpen] = useState(() => pathUnderMedia(location.pathname))
  const [inventarOpen, setInventarOpen] = useState(() => pathUnderInventar(location.pathname))
  const [stocuriOpen, setStocuriOpen] = useState(() => pathUnderStocuri(location.pathname))
  const [oferteOpen, setOferteOpen] = useState(() => pathUnderOferte(location.pathname))

  useEffect(() => {
    if (location.pathname === '/admin/login') return
    const token = getAuthToken()
    if (!token) {
      navigate('/admin/login', { replace: true })
      return
    }
    if (getAuthRole() !== 'admin') {
      clearAuth()
      navigate('/admin/login', { replace: true })
    }
  }, [location.pathname, navigate])

  useEffect(() => {
    if (!getAuthToken() || location.pathname === '/admin/login') return
    const fetchCount = () => {
      getAdminInquiriesUnreadCount()
        .then(setUnreadCount)
        .catch(() => setUnreadCount(0))
    }
    fetchCount()
    window.addEventListener('admin-inquiries-updated', fetchCount)
    return () => window.removeEventListener('admin-inquiries-updated', fetchCount)
  }, [location.pathname])

  useEffect(() => {
    setSettingsMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!settingsMenuOpen) return
    const onDown = (e: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target as Node)) {
        setSettingsMenuOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSettingsMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [settingsMenuOpen])

  useEffect(() => {
    if (pathUnderParteneri(location.pathname)) setParteneriOpen(true)
    if (pathUnderMedia(location.pathname)) setMediaOpen(true)
    if (pathUnderInventar(location.pathname)) setInventarOpen(true)
    if (pathUnderStocuri(location.pathname)) setStocuriOpen(true)
    if (pathUnderOferte(location.pathname)) setOferteOpen(true)
  }, [location.pathname])

  const loadSidebarAccount = useCallback(() => {
    if (location.pathname === '/admin/login' || !getAuthToken() || getAuthRole() !== 'admin') return
    getAdminAccount()
      .then((a) => {
        setFirstName(a.firstName)
        setLastName(a.lastName)
      })
      .catch(() => {
        setFirstName('')
        setLastName('')
      })
  }, [location.pathname])

  useEffect(() => {
    loadSidebarAccount()
  }, [loadSidebarAccount])

  useEffect(() => {
    const onUpdated = () => loadSidebarAccount()
    window.addEventListener('admin-account-updated', onUpdated)
    return () => window.removeEventListener('admin-account-updated', onUpdated)
  }, [loadSidebarAccount])

  useEffect(() => {
    document.documentElement.classList.add('admin-shell')
    document.body.classList.add('admin-shell')
    return () => {
      document.documentElement.classList.remove('admin-shell')
      document.body.classList.remove('admin-shell')
    }
  }, [])

  const settingsActive = pathUnderSetari(location.pathname)

  function handleLogout() {
    clearAuth()
    navigate('/admin/login')
  }

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 overflow-hidden bg-gray-50">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`w-64 flex-shrink-0 bg-slate-900 flex flex-col h-[100dvh] lg:h-full lg:max-h-none fixed lg:relative top-0 left-0 z-50 lg:z-auto transform transition-transform duration-200 lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full py-6 px-4">

          {/* Logo → admin dashboard */}
          <Link
            to="/admin"
            onClick={() => setSidebarOpen(false)}
            className="flex flex-col items-center gap-2 px-3 pb-6 mb-4 border-b border-slate-700/50 rounded-lg outline-none transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/25"
          >
            <img
              src="/images/shared/baterino-logo-white.png"
              alt="Baterino"
              className="h-7 w-auto object-contain"
            />
            <span className="text-white/60 text-xs font-medium font-['Inter'] tracking-wider uppercase">
              ADMIN
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex-1 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              if (item.kind === 'link') {
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-['Inter'] font-medium transition-colors ${
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <span className="relative flex-shrink-0">
                      {item.icon}
                      {item.to === '/admin/messages' && unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </span>
                    {item.label}
                  </NavLink>
                )
              }

              const childActive = item.children.some(
                (c) => location.pathname === c.to || location.pathname.startsWith(`${c.to}/`)
              )
              const groupOpen =
                item.id === 'parteneri'
                  ? parteneriOpen
                  : item.id === 'media'
                    ? mediaOpen
                    : item.id === 'inventar'
                      ? inventarOpen
                      : item.id === 'stocuri'
                        ? stocuriOpen
                        : item.id === 'oferte'
                          ? oferteOpen
                          : false
              const setGroupOpen =
                item.id === 'parteneri'
                  ? setParteneriOpen
                  : item.id === 'media'
                    ? setMediaOpen
                    : item.id === 'inventar'
                      ? setInventarOpen
                      : item.id === 'stocuri'
                        ? setStocuriOpen
                        : item.id === 'oferte'
                          ? setOferteOpen
                          : () => {}
              return (
                <div key={item.id} className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => setGroupOpen((o) => !o)}
                    className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-['Inter'] font-medium transition-colors text-left ${
                      childActive
                        ? 'bg-white/10 text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                    aria-expanded={groupOpen}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="flex-1 min-w-0">{item.label}</span>
                    <IconChevronNav open={groupOpen} />
                  </button>
                  {groupOpen && (
                    <div className="flex flex-col gap-0.5 pl-2 border-l border-slate-700/60 ml-6 mr-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          end={false}
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-['Inter'] font-medium transition-colors ${
                              isActive
                                ? 'bg-white/10 text-white'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`
                          }
                        >
                          <span className="flex-shrink-0 opacity-90">{child.icon}</span>
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex min-h-0 flex-1 min-w-0 flex-col overflow-hidden">
        <AdminTopBar
          authEmail={authEmail}
          avatarLetter={avatarLetter}
          displayName={displayName}
          settingsMenuOpen={settingsMenuOpen}
          setSettingsMenuOpen={setSettingsMenuOpen}
          settingsMenuRef={settingsMenuRef}
          settingsActive={settingsActive}
          onOpenSidebar={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />
        <div
          id="admin-layout-scroll"
          className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto overflow-x-clip overscroll-y-contain [&>*]:shrink-0"
        >
          <Outlet />
        </div>
      </main>
    </div>
  )
}
