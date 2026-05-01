import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-4xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">
        Dashboard
      </h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8">
        Bun venit în panoul de administrare Baterino.
      </p>

      <section className="mt-2">
        <h2 className="text-lg font-bold font-['Inter'] text-slate-900 mb-3">Shortcuts</h2>
        <div className="grid grid-cols-4 gap-3">
        <Link
          to="/admin/stocuri/add-item"
          className="group col-span-2 flex aspect-square w-full flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm transition hover:border-slate-300 hover:shadow sm:max-w-[220px]"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-200">
            <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
              <path d="M8 10h8M8 14h5" />
              <path d="M18 4v4M16 6h4" />
            </svg>
          </div>
          <p className="mt-4 text-sm font-semibold font-['Inter'] text-slate-900">Stocuri - Add Item</p>
        </Link>
        </div>
      </section>
    </div>
  )
}
