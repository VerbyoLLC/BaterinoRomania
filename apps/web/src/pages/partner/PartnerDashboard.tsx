export default function PartnerDashboard() {
  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-4xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">
        Dashboard
      </h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8">
        Prezentare generală a contului tău de partener Baterino.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <p className="text-gray-500 text-sm font-['Inter'] mb-1">Produse</p>
          <p className="text-2xl font-bold font-['Inter'] text-slate-900">—</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <p className="text-gray-500 text-sm font-['Inter'] mb-1">Comenzi</p>
          <p className="text-2xl font-bold font-['Inter'] text-slate-900">—</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <p className="text-gray-500 text-sm font-['Inter'] mb-1">Servicii</p>
          <p className="text-2xl font-bold font-['Inter'] text-slate-900">—</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold font-['Inter'] text-slate-900 mb-2">Bine ai revenit</h2>
        <p className="text-gray-500 text-sm font-['Inter']">
          Din acest panou poți gestiona profilul public, produsele, comenzile și serviciile. Folosește meniul din stânga pentru navigare.
        </p>
      </div>
    </div>
  )
}
