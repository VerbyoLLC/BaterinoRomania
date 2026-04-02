import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { ReducereProgram } from '../../i18n/reduceri'

function renderBold(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-bold">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

function SmileyPopover({
  icon,
  info,
}: {
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
      {open && info && (
        <div className="absolute bottom-11 right-0 w-72 rounded-[5px] overflow-hidden z-10 shadow-lg">
          <div className="bg-white/70 backdrop-blur-sm px-3 py-3">
            <p className="text-black text-base font-bold font-['Nunito_Sans'] mb-1.5">{info.title}</p>
            <p className="text-black text-sm font-medium font-['Nunito_Sans'] leading-5">{info.text}</p>
          </div>
        </div>
      )}
      <button type="button" onClick={() => setOpen((o) => !o)} className="p-1 group" aria-label="Info">
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

type CardProps = {
  program: ReducereProgram
  /** Hide CTA + terms (e.g. compact row in product modal). */
  hideCta?: boolean
}

/** Program card – same layout as `/reduceri` page. */
export function ReduceriProgramCard({ program, hideCta = false }: CardProps) {
  const programName = program.programLabel.replace(/^PROGRAMUL\s*/i, '')
  const compact = hideCta

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col flex-1 bg-neutral-100 rounded-[10px] overflow-hidden transition-shadow duration-300 hover:shadow-md">
        <div className={`relative flex-shrink-0 ${compact ? 'h-36 sm:h-40' : 'h-56 md:h-48'}`}>
          <div className="absolute inset-0 bg-zinc-300" />
          <img src={program.photo} alt={programName} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <img
            src="/images/programe reduceri/baterino-white-logo.png"
            alt="Baterino"
            className="absolute top-3 right-3 h-5 w-auto object-contain"
          />
          {program.topIcon ? <SmileyPopover icon={program.topIcon} info={program.stiaiCa} /> : null}
          <div className="absolute left-5 bottom-[46px] text-white text-base font-medium font-['Nunito_Sans']">PROGRAMUL</div>
          <div className="absolute left-5 right-5 bottom-4 text-white text-xl font-bold font-['Inter'] leading-8">{programName}</div>
        </div>

        <div className={`flex flex-col ${compact ? 'px-3 pt-3 pb-4 sm:px-4' : 'px-[27px] pt-4 pb-6'}`}>
          <h3
            className={`text-black font-bold font-['Inter'] mb-2 sm:mb-3 leading-snug ${
              compact ? 'text-base sm:text-lg' : 'text-2xl md:text-xl leading-8'
            }`}
          >
            {program.title}
          </h3>
          <div
            className={`text-gray-700 font-medium font-['Nunito_Sans'] ${
              compact ? 'text-xs sm:text-sm leading-relaxed' : 'text-lg md:text-base leading-7 md:leading-6'
            }`}
          >
            {program.description.split('\n\n').map((para, i) => (
              <p key={i} className={i > 0 ? 'mt-4' : ''}>
                {renderBold(para)}
              </p>
            ))}
          </div>
        </div>
      </div>

      {!hideCta ? (
        <div className="flex flex-col items-center gap-[14px] mt-5">
          <Link
            to={program.ctaTo}
            className="w-full md:w-60 h-14 md:h-12 px-2.5 bg-slate-900 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-center items-center gap-3.5 hover:bg-slate-700 transition-colors"
          >
            <span className="text-white text-base font-semibold font-['Inter']">{program.ctaLabel}</span>
          </Link>
          <span className="text-neutral-800 text-base font-medium font-['Nunito_Sans'] cursor-pointer hover:underline">
            {program.termsLabel}
          </span>
        </div>
      ) : null}
    </div>
  )
}
