export default function PartnerOrders() {
  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">
        Comenzi
      </h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8">
        Urmărește și gestionează comenzile tale.
      </p>

      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-lg font-bold font-['Inter'] text-slate-900 mb-2">Istoric comenzi</h2>
        <p className="text-gray-500 text-sm font-['Inter'] max-w-md mx-auto">
          Aici vei vedea toate comenzile plasate. Funcționalitate în curând.
        </p>
      </div>
    </div>
  )
}
