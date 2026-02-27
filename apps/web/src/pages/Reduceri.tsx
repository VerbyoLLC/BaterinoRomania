import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { getReduceriTranslations, type ReducereProgram } from '../i18n/reduceri'
import SEO from '../components/SEO'
import CTABar from '../components/CTABar'

/* ── bold renderer (handles **text** markers) ────────────────── */
function renderBold(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1
      ? <span key={i} className="font-bold">{part}</span>
      : <span key={i}>{part}</span>
  )
}

/* ── Smiley info popover — desktop only ───────────────────────── */
function SmileyPopover({ icon, info }: {
  icon: string
  info?: { title: string; text: string }
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={ref} className="absolute bottom-3 right-3 hidden md:block">
      {/* Info box */}
      {open && info && (
        <div className="absolute bottom-11 right-0 w-72 rounded-[5px] overflow-hidden z-10 shadow-lg">
          <div className="bg-white/70 backdrop-blur-sm px-3 py-3">
            <p className="text-black text-base font-bold font-['Nunito_Sans'] mb-1.5">
              {info.title}
            </p>
            <p className="text-black text-sm font-medium font-['Nunito_Sans'] leading-5">
              {info.text}
            </p>
          </div>
        </div>
      )}
      {/* Icon button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="p-1 group"
        aria-label="Info"
      >
        <img
          src={icon}
          alt=""
          aria-hidden
          className="h-8 w-8 object-contain transition-transform duration-200 group-hover:scale-125"
        />
      </button>
    </div>
  )
}

/* ── Program card — matches Figma spec ───────────────────────── */
function ProgramCard({ program }: { program: ReducereProgram }) {
  const programName = program.programLabel.replace(/^PROGRAMUL\s*/i, '')

  return (
    <div className="flex flex-col h-full">

      {/* Card box: photo + content — grows to fill row height */}
      <div className="flex flex-col flex-1 bg-neutral-100 rounded-[10px] overflow-hidden transition-shadow duration-300 hover:shadow-md">

        {/* Photo — h-56 on mobile, h-48 on desktop */}
        <div className="relative h-56 md:h-48 flex-shrink-0">
          <div className="absolute inset-0 bg-zinc-300" />
          <img
            src={program.photo}
            alt={programName}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* 40% black overlay */}
          <div className="absolute inset-0 bg-black/40" />
          {/* Baterino white logo — top right */}
          <img
            src="/images/programe reduceri/baterino-white-logo.png"
            alt="Baterino"
            className="absolute top-3 right-3 h-5 w-auto object-contain"
          />
          {/* Smiley icon — bottom right, click to show info popover */}
          {program.topIcon && (
            <SmileyPopover icon={program.topIcon} info={program.stiaiCa} />
          )}
          {/* "PROGRAMUL" supertitle */}
          <div className="absolute left-5 bottom-[46px] text-white text-base font-medium font-['Nunito_Sans']">
            PROGRAMUL
          </div>
          {/* Program name */}
          <div className="absolute left-5 right-5 bottom-4 text-white text-xl font-bold font-['Inter'] leading-8">
            {programName}
          </div>
        </div>

        {/* Content area */}
        <div className="flex flex-col px-[27px] pt-4 pb-6">

          {/* Discount title — larger on mobile */}
          <h3 className="text-black text-2xl md:text-xl font-bold font-['Inter'] leading-8 mb-3">
            {program.title}
          </h3>

          {/* Description — slightly larger on mobile */}
          <div className="text-gray-700 text-lg md:text-base font-medium font-['Nunito_Sans'] leading-7 md:leading-6">
            {program.description.split('\n\n').map((para, i) => (
              <p key={i} className={i > 0 ? 'mt-4' : ''}>
                {renderBold(para)}
              </p>
            ))}
          </div>

        </div>
      </div>

      {/* Button + Terms — outside the card box */}
      <div className="flex flex-col items-center gap-[14px] mt-5">
        <Link
          to={program.ctaTo}
          className="w-full md:w-60 h-14 md:h-12 px-2.5 bg-slate-900 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-center items-center gap-3.5 hover:bg-slate-700 transition-colors"
        >
          <span className="text-white text-base font-semibold font-['Inter']">
            {program.ctaLabel}
          </span>
        </Link>
        <span className="text-neutral-800 text-base font-medium font-['Nunito_Sans'] cursor-pointer hover:underline">
          {program.termsLabel}
        </span>
      </div>

    </div>
  )
}

/* ── How to apply panel ────────────────────────────────────────── */
function HowToApply({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="bg-neutral-100 rounded-[10px] flex flex-col items-center justify-center px-10 pt-3.5 pb-10">
      <h3 className="text-black text-2xl font-bold font-['Inter'] leading-8 text-center w-full mb-6">
        {title}
      </h3>
      <div className="flex flex-col gap-6 w-full flex-1 justify-around">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center gap-2 text-center">
            {/* Number circle on top */}
            <div className="size-12 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-extrabold font-['Inter']">{i + 1}</span>
            </div>
            {/* Text below */}
            <p className="text-black text-lg font-semibold font-['Inter'] leading-7">
              {step}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function Reduceri() {
  const { language } = useLanguage()
  const tr = getReduceriTranslations(language.code)

  const [p1, p2, p3, p4] = tr.programs

  return (
    <>
      <SEO
        title={tr.seoTitle}
        description={tr.seoDesc}
        canonical="/reduceri"
        ogImage="/images/programe%20reduceri/programe-reduceri-baterii-sisteme-fotovoltaice-baterino-og.jpg"
        lang={language.code}
      />

      <article className="max-w-content mx-auto px-5 lg:px-3 pt-12 pb-24">

        {/* ── HERO ── */}
        <header className="text-center mb-12 lg:mb-14">
          <h1 className="text-black text-3xl lg:text-5xl font-extrabold font-['Inter'] leading-tight mb-4">
            {tr.heroTitle}
          </h1>
          <p className="text-gray-600 text-base lg:text-lg font-normal font-['Inter'] leading-7 max-w-[560px] mx-auto">
            {tr.heroSubtitle}
          </p>
        </header>

        {/* ── MOBILE: single column with dividers + How to Apply at end ── */}
        <div className="flex flex-col md:hidden mb-10">
          {[p1, p2, p3, p4].map((program, i) => (
            <div key={i}>
              <ProgramCard program={program} />
              <hr className="border-gray-200 my-10" />
            </div>
          ))}
          <HowToApply title={tr.howTitle} steps={tr.howSteps} />
          <Link
            to="/login"
            className="w-full h-14 mt-6 bg-slate-900 rounded-[10px] inline-flex justify-center items-center text-white text-base font-semibold font-['Inter'] hover:bg-slate-700 transition-colors"
          >
            {tr.programs[0].ctaLabel}
          </Link>
        </div>

        {/* ── DESKTOP ROW 1: first 3 cards ── */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 mb-14 items-stretch">
          {[p1, p2, p3].map((program, i) => (
            <ProgramCard key={i} program={program} />
          ))}
        </div>

        {/* ── DESKTOP ROW 2: 4th card + How to Apply ── */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 mb-16 lg:mb-20 items-start">
          <ProgramCard program={p4} />
          <HowToApply title={tr.howTitle} steps={tr.howSteps} />
        </div>

        {/* ── BOTTOM CTA — desktop only ── */}
        <div className="hidden md:block">
          <CTABar
            logo="/images/shared/baterino-logo-black.svg"
            logoAlt="Baterino"
            logoClassName="h-8 lg:h-10"
            title={tr.ctaBarTitle}
            desc={tr.ctaBarDesc}
            btn1Label={tr.ctaBarBtn}
            btn1To="/produse"
          />
        </div>

      </article>
    </>
  )
}
