import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import MobileMenu from './MobileMenu'

type AuthLayoutProps = {
  image: string
  supertitle: string
  title: string
  leftContent?: ReactNode
  children: ReactNode
}

export default function AuthLayout({ image, supertitle, title, leftContent, children }: AuthLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <div className="min-h-screen min-h-[100dvh] flex">

      {/* ── LEFT: image panel (fixed on desktop, stays in viewport) ── */}
      <div className="hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:w-1/2 lg:h-screen lg:min-h-[100dvh] relative flex-col flex-shrink-0 z-0">
        <img
          src={image}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />

        {/* Logo top-left */}
        <div className="relative z-10 p-8">
          <Link to="/" aria-label="Baterino – acasă">
            <img
              src="/images/shared/baterino-logo-white.png"
              alt="Baterino"
              className="h-7 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Text overlay bottom */}
        <div className="relative z-10 mt-auto px-10 pb-[6px]">
          {leftContent ?? (
            <>
              <p className="text-white/80 text-sm font-medium font-['Inter'] tracking-widest uppercase mb-2">
                {supertitle}
              </p>
              <h1 className="text-white text-4xl font-extrabold font-['Inter'] leading-tight">
                {title}
              </h1>
            </>
          )}
        </div>
      </div>

      {/* ── RIGHT: form panel (scrollable, offset for fixed left) ── */}
      <div className="flex-1 flex flex-col min-h-screen min-h-[100dvh] bg-white overflow-y-auto lg:ml-[50%] z-10">
        {/* Mobile logo + menu */}
        <div className="flex lg:hidden items-center justify-between px-5 pt-4 pb-2">
          <Link to="/">
            <img
              src="/images/shared/baterino-logo-black.svg"
              alt="Baterino"
              className="h-6 w-auto"
            />
          </Link>
          <button
            type="button"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            aria-label="Menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        {/* Form content */}
        <div className="flex-1 flex flex-col justify-start lg:justify-center px-5 sm:px-8 lg:px-16 py-6 sm:py-12">
          <div className="w-full max-w-[420px] mx-auto">
            {children}
          </div>
        </div>
      </div>

    </div>
  )
}
