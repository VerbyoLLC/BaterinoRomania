'use client'

import { Link } from '@/lib/router'
import { ShieldCheck } from 'lucide-react'
import type { HomeTranslations } from '../../i18n/home'

type HomeWarrantyCtaProps = {
  tr: HomeTranslations
}

export default function HomeWarrantyCta({ tr }: HomeWarrantyCtaProps) {
  return (
    <section
      className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-5 lg:gap-8 lg:px-8 lg:py-6"
      aria-label={tr.warrantyCtaTitle}
    >
      <div className="flex shrink-0 items-center justify-center sm:justify-start">
        <div className="flex size-14 items-center justify-center rounded-full bg-slate-900/10 sm:size-16">
          <ShieldCheck className="size-8 text-slate-900 sm:size-9" strokeWidth={1.75} aria-hidden />
        </div>
      </div>

      <div className="min-w-0 flex-1 text-center sm:text-left">
        <h2 className="m-0 text-xl font-bold font-['Inter'] leading-tight text-black sm:text-2xl">
          {tr.warrantyCtaTitle}
        </h2>
        <p className="mt-1.5 text-sm font-normal font-['Inter'] leading-relaxed text-gray-600 sm:text-base sm:leading-6">
          {tr.warrantyCtaSubtitle}
        </p>
      </div>

      <div className="flex shrink-0 justify-center sm:justify-end">
        <Link
          to="/produse"
          className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-[10px] bg-slate-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-700 whitespace-nowrap"
        >
          {tr.warrantyCtaButton}
        </Link>
      </div>
    </section>
  )
}
