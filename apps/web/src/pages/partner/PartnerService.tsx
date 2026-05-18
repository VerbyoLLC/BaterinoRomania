export default function PartnerService() {
  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">
        Reparatii
      </h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8">
        Gestionează cererile de service și mentenanță.
      </p>

      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
            />
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
