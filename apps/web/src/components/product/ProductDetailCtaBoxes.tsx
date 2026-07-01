import { Link } from 'react-router-dom'
import { ArrowLeftRight, ArrowRight, Tag } from 'lucide-react'
import type { ProductDetailTranslations } from '../../i18n/product-detail'

type Props = {
  tr: ProductDetailTranslations
  className?: string
  /** Render one CTA or both (default). */
  variant?: 'both' | 'swap' | 'reduceri'
}

function CtaArrowIcon() {
  return <ArrowRight className="h-[17px] w-[17px] shrink-0" strokeWidth={2} aria-hidden />
}

export default function ProductDetailCtaBoxes({ tr, className = '', variant = 'both' }: Props) {
  const showSwap = variant === 'both' || variant === 'swap'
  const showReduceri = variant === 'both' || variant === 'reduceri'

  return (
    <section className={`flex max-w-[760px] flex-col gap-[22px] font-['DM_Sans','Inter',system-ui,sans-serif] ${className}`.trim()}>
      {showSwap ? (
      <div className="relative flex min-h-[260px] items-center overflow-hidden rounded-[18px]">
        <img
          src="/images/product/baterino-swap.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden />
        <div className="relative z-[2] max-w-[560px] px-6 py-[26px] text-white sm:px-[38px] sm:py-[34px]">
          <span className="mb-4 inline-flex items-center gap-2 rounded-[20px] bg-[rgba(124,224,182,0.16)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#7ce0b6]">
            <ArrowLeftRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            {tr.swapCtaEyebrow}
          </span>
          <h2 className="m-0 mb-[11px] text-[23px] font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-[27px]">
            {tr.swapCtaTitle}
          </h2>
          <p className="m-0 mb-[22px] max-w-[46ch] text-[14.5px] leading-[1.55] text-[#cfd5e2]">{tr.swapCtaDesc}</p>
          <Link
            to="/siguranta"
            className="inline-flex items-center gap-2.5 rounded-xl bg-white px-[22px] py-3.5 text-[14.5px] font-semibold text-[#0f1422] transition hover:-translate-y-px"
          >
            {tr.swapBannerCta}
            <CtaArrowIcon />
          </Link>
        </div>
      </div>
      ) : null}

      {showReduceri ? (
      <div className="relative flex min-h-[260px] items-center overflow-hidden rounded-[18px]">
        <img
          src="/images/product/reduceri-banner.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden />
        <div className="relative z-[2] max-w-[560px] px-6 py-[26px] text-white sm:px-[38px] sm:py-[34px]">
          <span className="mb-4 inline-flex items-center gap-2 rounded-[20px] bg-[rgba(224,123,57,0.2)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#f3a96e]">
            <Tag className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            {tr.reduceriCtaEyebrow}
          </span>
          <h2 className="m-0 mb-[11px] text-[23px] font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-[27px]">
            {tr.reduceriCtaTitleBefore}
            <b className="font-bold text-[#f3a96e]">{tr.reduceriCtaTitleHighlight}</b>
            {tr.reduceriCtaTitleAfter}
          </h2>
          <p className="m-0 mb-[22px] max-w-[46ch] text-[14.5px] leading-[1.55] text-[#cfd5e2]">{tr.reduceriCtaDesc}</p>
          <Link
            to="/reduceri"
            className="inline-flex items-center gap-2.5 rounded-xl bg-[#e07b39] px-[22px] py-3.5 text-[14.5px] font-semibold text-white transition hover:-translate-y-px"
          >
            {tr.intraInCont}
            <CtaArrowIcon />
          </Link>
        </div>
      </div>
      ) : null}
    </section>
  )
}
