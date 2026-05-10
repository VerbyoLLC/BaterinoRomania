import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SEO from '../components/SEO'
import { useLanguage } from '../contexts/LanguageContext'

export default function VerificareGarantie() {
  const { language } = useLanguage()
  const [searchParams] = useSearchParams()
  const [serialNumber, setSerialNumber] = useState('')

  /* Pre-completăm SN-ul dacă utilizatorul a ajuns aici dintr-un QR cod
     (link `/verificare-garantie?sn=<SN>` de pe certificatul de garanție). */
  useEffect(() => {
    const sn = (searchParams.get('sn') || '').trim()
    if (sn) setSerialNumber(sn)
  }, [searchParams])

  return (
    <>
      <SEO
        title="Verificare garanție | Baterino"
        description="Verifică rapid statusul garanției pentru bateria ta Baterino."
        canonical="/verificare-garantie"
        lang={language.code}
      />

      <section className="max-w-content mx-auto px-4 py-14 sm:py-16">
        <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-extrabold text-slate-900 font-['Inter'] sm:text-3xl">
            Verificare garanție
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 font-['Inter'] sm:text-base">
            Introdu numărul de serie (SN) al bateriei pentru a verifica garanția.
          </p>
          <form
            className="mt-6 flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <label htmlFor="warranty-sn" className="sr-only">
              Număr serie
            </label>
            <input
              id="warranty-sn"
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Ex: LJC5131400325070043"
              autoComplete="off"
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 font-['Inter']"
            />
            <button
              type="submit"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-bold text-white hover:bg-slate-800 font-['Inter']"
            >
              Verifică
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
