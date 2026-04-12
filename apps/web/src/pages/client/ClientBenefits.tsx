import { Link } from 'react-router-dom'
import { INSTALATORI_ONLY } from '../../lib/siteMode'

export default function ClientBenefits() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Beneficii pentru clienți</h1>
      <p className="text-slate-600 text-sm font-['Inter'] mb-8">
        Câteva avantaje pe care le ai ca utilizator înregistrat Baterino.
      </p>

      <ul className="space-y-5">
        <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold font-['Inter'] text-slate-900 mb-2">Produse și comenzi în cont</h2>
          <p className="text-sm text-slate-600 font-['Inter']">
            Vezi istoricul comenzilor, produsele achiziționate și gestionezi coșul direct din cont, fără pași inutili.
          </p>
        </li>
        <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold font-['Inter'] text-slate-900 mb-2">Programe de reducere</h2>
          <p className="text-sm text-slate-600 font-['Inter'] mb-2">
            Poți beneficia de reduceri dedicate (seniori, zone rurale, recomandare între clienți și altele), conform
            termenilor fiecărui program.
          </p>
          {!INSTALATORI_ONLY ? (
            <Link
              to="/reduceri"
              className="text-sm font-semibold text-slate-900 font-['Inter'] underline underline-offset-2"
            >
              Vezi programele de reducere
            </Link>
          ) : null}
        </li>
        <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold font-['Inter'] text-slate-900 mb-2">Siguranță și suport</h2>
          <p className="text-sm text-slate-600 font-['Inter'] mb-2">
            Politici clare privind siguranța produselor și datele tale, plus acces la suport pentru întrebări tehnice și
            comerciale.
          </p>
          {!INSTALATORI_ONLY ? (
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <Link
                to="/siguranta"
                className="text-sm font-semibold text-slate-900 font-['Inter'] underline underline-offset-2"
              >
                Siguranța clientului
              </Link>
              <Link
                to="/contact"
                className="text-sm font-semibold text-slate-900 font-['Inter'] underline underline-offset-2"
              >
                Contact
              </Link>
            </div>
          ) : null}
        </li>
        <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold font-['Inter'] text-slate-900 mb-2">Cod personal de recomandare</h2>
          <p className="text-sm text-slate-600 font-['Inter'] mb-2">
            Poți oferi un cod prietenilor la prima comandă, conform programului de recomandare (detalii la „Coduri
            reducere” în cont).
          </p>
          <Link
            to="/client/coduri-reducere"
            className="text-sm font-semibold text-slate-900 font-['Inter'] underline underline-offset-2"
          >
            Mergi la coduri reducere
          </Link>
        </li>
      </ul>
    </div>
  )
}
