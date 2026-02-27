export default function PartnerProducts() {
  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">
        Produse
      </h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8">
        Vizualizează și gestionează produsele disponibile pentru parteneri Baterino.
      </p>

      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0v10l-8 4m0-14L4 17m8 4V10" />
          </svg>
        </div>
        <h2 className="text-lg font-bold font-['Inter'] text-slate-900 mb-2">Catalog produse</h2>
        <p className="text-gray-500 text-sm font-['Inter'] max-w-md mx-auto">
          Aici vei avea acces la catalogul complet de produse Baterino disponibile pentru parteneri. Funcționalitate în curând.
        </p>
      </div>
    </div>
  )
}
