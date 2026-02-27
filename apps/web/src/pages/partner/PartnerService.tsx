export default function PartnerService() {
  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">
        Servicii
      </h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8">
        Gestionează cererile de service și mentenanță.
      </p>

      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
        </div>
        <h2 className="text-lg font-bold font-['Inter'] text-slate-900 mb-2">Service și mentenanță</h2>
        <p className="text-gray-500 text-sm font-['Inter'] max-w-md mx-auto">
          Aici vei gestiona cererile de service pentru produsele vândute. Funcționalitate în curând.
        </p>
      </div>
    </div>
  )
}
