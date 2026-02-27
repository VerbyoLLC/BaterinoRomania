export default function AdminDashboard() {
  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-4xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">
        Dashboard
      </h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8">
        Bun venit în panoul de administrare Baterino.
      </p>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold font-['Inter'] text-slate-900 mb-2">Bine ai revenit</h2>
        <p className="text-gray-500 text-sm font-['Inter']">
          Din acest panou poți gestiona produsele, clienții, companiile, articolele, stocurile, comenzile și reducerile.
        </p>
      </div>
    </div>
  )
}
