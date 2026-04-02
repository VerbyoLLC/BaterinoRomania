import { useState, useEffect, useRef } from 'react'

import { digitsForWaMe, formatPhoneDisplay, telHrefFromStored } from '../lib/contactWhatsApp'
import { departmentRow, ensurePublicDepartmentPhones } from '../lib/departmentPhones'

const WARNING_RISKS = [
  'Supraîncălzire și risc de incendiu',
  'Probleme software',
  'Pierdere rapidă de performanță',
  'Lipsa service-ului local',
  'Pierderea investiției în doar 2 ani',
]

export default function FloatingStickyButtons() {
  const [warningOpen, setWarningOpen] = useState(false)
  const [callBoxOpen, setCallBoxOpen] = useState(false)
  const [whatsappBoxOpen, setWhatsappBoxOpen] = useState(false)
  const floatingRef = useRef<HTMLDivElement>(null)
  /** Din admin: departament „general” (număr apel + WhatsApp) */
  const [generalPhone, setGeneralPhone] = useState<string | undefined>()
  const [generalWhatsapp, setGeneralWhatsapp] = useState<string | undefined>()

  useEffect(() => {
    ensurePublicDepartmentPhones()
      .then((rows) => {
        const g = departmentRow(rows, 'general')
        const p = g?.phone?.trim()
        const w = g?.whatsapp?.trim()
        if (p) setGeneralPhone(p)
        if (w) setGeneralWhatsapp(w)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!warningOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setWarningOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [warningOpen])

  useEffect(() => {
    if (!callBoxOpen && !whatsappBoxOpen) return
    const onClickOutside = (e: MouseEvent) => {
      if (floatingRef.current && !floatingRef.current.contains(e.target as Node)) {
        setCallBoxOpen(false)
        setWhatsappBoxOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [callBoxOpen, whatsappBoxOpen])

  return (
    <>
      <div
        ref={floatingRef}
        className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-50 items-center py-4 pr-10"
        aria-label="Contact rapid"
      >
        {/* Call box - slides in from under the buttons (right to left) */}
        <div
          className={`transition-all duration-300 ease-out flex-shrink-0 mr-2 ${
            callBoxOpen ? 'w-64 overflow-visible' : 'w-0 overflow-hidden'
          }`}
        >
          <div
            className={`w-64 h-44 flex flex-col bg-white rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] p-4 transition-transform duration-300 ease-out ${
              callBoxOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="text-black text-lg font-bold font-['Inter'] text-center">Vorbește cu noi</div>
            <div className="text-black text-base font-normal font-['Inter'] text-center mt-4">Luni - Vineri | 8 AM - 8PM</div>
            <a
              href={`tel:${telHrefFromStored(generalPhone)}`}
              className="mt-6 w-full px-2.5 py-2.5 bg-slate-900 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-center items-center text-white text-base font-semibold font-['Inter'] hover:bg-slate-800 transition-colors"
            >
              {formatPhoneDisplay(generalPhone)}
            </a>
          </div>
        </div>

        {/* WhatsApp box - slides in from under the buttons (right to left) */}
        <div
          className={`transition-all duration-300 ease-out flex-shrink-0 mr-2 ${
            whatsappBoxOpen ? 'w-64 overflow-visible' : 'w-0 overflow-hidden'
          }`}
        >
          <div
            className={`w-64 h-44 flex flex-col bg-white rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] p-4 transition-transform duration-300 ease-out ${
              whatsappBoxOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="text-black text-lg font-bold font-['Inter'] text-center">Chat pe Whatsapp</div>
            <div className="text-black text-base font-normal font-['Inter'] text-center mt-4">Luni - Vineri | 8 AM - 8PM</div>
            <a
              href={`https://wa.me/${digitsForWaMe(generalWhatsapp)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full px-2.5 py-2.5 bg-slate-900 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-center items-center text-white text-base font-semibold font-['Inter'] hover:bg-slate-800 transition-colors"
            >
              START CHAT
            </a>
          </div>
        </div>

        {/* Buttons - on top */}
        <div className="flex flex-col gap-3 relative z-10 shrink-0">
        <button
          type="button"
          onClick={() => setWarningOpen(true)}
          className="w-14 h-14 flex items-center justify-center bg-white rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:bg-gray-50 hover:shadow-md active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
          aria-label="Avertizment"
        >
          <img src="/images/contact/warning2.png" alt="" className="w-9 h-9 object-contain" />
        </button>
        <button
          type="button"
          onClick={() => {
            setCallBoxOpen((o) => !o)
            setWhatsappBoxOpen(false)
          }}
          className="w-14 h-14 flex items-center justify-center bg-white rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:bg-gray-50 hover:shadow-md active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
          aria-label="Sună"
          aria-expanded={callBoxOpen}
        >
          <img src="/images/contact/call2.png" alt="" className="w-9 h-9 object-contain" />
        </button>
        <button
          type="button"
          onClick={() => {
            setWhatsappBoxOpen((o) => !o)
            setCallBoxOpen(false)
          }}
          className="w-14 h-14 flex items-center justify-center bg-white rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:bg-gray-50 hover:shadow-md active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
          aria-label="WhatsApp"
          aria-expanded={whatsappBoxOpen}
        >
          <img src="/images/contact/whatsapp2.png" alt="" className="w-9 h-9 object-contain" />
        </button>
        </div>
      </div>

      {warningOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
          aria-labelledby="warning-modal-title"
        >
          <div
            className="w-full max-w-[792px] bg-white rounded-xl shadow-2xl flex flex-col items-center overflow-hidden py-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex flex-col items-center justify-center w-full max-w-[534px] mx-auto px-6 pt-4 pb-1 border-b border-slate-100 flex-shrink-0">
              <img
                src="/images/shared/baterino-logo-black.svg"
                alt="Baterino"
                className="w-40 h-8 object-contain"
              />
              <h2
                id="warning-modal-title"
                className="w-full text-center text-black text-2xl font-extrabold font-['Inter'] uppercase leading-[48px] mt-2"
              >
                Riscuri și realități în piața bateriilor
              </h2>
            </div>

            {/* Content */}
            <div className="px-6 pt-2 pb-5 w-full flex-shrink-0">
              <div className="text-slate-600 text-sm font-['Inter'] leading-relaxed max-w-[640px] mx-auto space-y-3">
                <p>
                  În 2020, piața din România a fost invadată de panouri solare ieftine, garantate „10 ani”, care după doar câțiva ani nu mai produceau la parametri normali. Distribuitorii au dispărut, clienții au rămas cu paguba, iar piața cu deșeuri.
                </p>
                <p>
                  Astăzi se întâmplă același lucru cu bateriile: produse ieftine, cu celule slabe și BMS-uri simple, vândute fără factură, fără service și fără infrastructură locală.
                </p>
                <p className="font-semibold text-slate-700">Riscurile sunt reale:</p>
                <ul className="space-y-1 font-semibold text-slate-700 list-none">
                  {WARNING_RISKS.map((risk) => (
                    <li key={risk} className="flex items-center gap-2">
                      <span className="text-amber-500 flex-shrink-0 flex items-center justify-center" aria-hidden>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
                <p>
                  Cumpără doar baterii susținute de infrastructură, service și responsabilitate reală, adică de la noi, spre exemplu.
                </p>
              </div>

              <p className="text-slate-600 text-sm font-medium font-['Inter'] text-center mt-5 italic">
                Cu atenție, Echipa Baterino.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => setWarningOpen(false)}
                className="min-w-[176px] h-12 px-6 bg-slate-900 text-white rounded-xl font-semibold font-['Inter'] hover:bg-slate-800 active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                AM ÎNȚELES
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
