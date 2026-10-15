import { Link } from 'react-router-dom'
import type { HomeTranslations } from '../../i18n/home'

type HomeInstallerCtaProps = {
  tr: HomeTranslations
}

export default function HomeInstallerCta({ tr }: HomeInstallerCtaProps) {
  return (
    <section className="relative mt-16 overflow-hidden rounded-[16px] lg:mt-24" aria-label={tr.installerCtaTitle}>
      <img
        src="/images/home/slider-apple/slide4-instalatori.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[72%_center]"
      />
      <div className="absolute inset-0 bg-slate-950/60 bg-gradient-to-r from-slate-950/80 via-slate-950/68 to-slate-950/40" />
      <div className="relative flex flex-col gap-5 px-6 py-7 sm:px-8 lg:flex-row lg:items-center lg:gap-8 lg:px-10 lg:py-8">
        <div className="shrink-0 lg:max-w-[200px]">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75 font-['Inter']">
            {tr.installerCtaEyebrow}
          </p>
          <h2 className="m-0 mt-2 text-[1.7rem] font-extrabold leading-none text-white font-['Inter'] sm:text-4xl">
            {tr.installerCtaTitle}
          </h2>
        </div>
        <div className="hidden h-16 w-px shrink-0 bg-white/35 lg:block" aria-hidden />
        <p className="m-0 min-w-0 flex-1 text-sm font-normal leading-6 text-white font-['Inter'] sm:text-[15px] sm:leading-7">
          {tr.installerCtaBody}
        </p>
        <Link
          to="/instalatori"
          className="inline-flex h-11 shrink-0 items-center justify-center self-start rounded-full bg-white px-6 text-[12px] font-bold uppercase tracking-wide text-black font-['Inter'] transition-colors hover:bg-neutral-100 lg:self-center"
        >
          {tr.installerCtaButton}
        </Link>
      </div>
    </section>
  )
}
