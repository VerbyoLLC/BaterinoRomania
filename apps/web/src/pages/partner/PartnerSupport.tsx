export default function PartnerSupport() {
  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-3xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">
        Suport
      </h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8">
        Ai nevoie de ajutor? Contactează echipa Baterino.
      </p>

      <div className="flex flex-col gap-4">
        <a
          href="mailto:parteneri@baterino.ro"
          className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-200 hover:border-slate-300 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-200 transition-colors">
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold font-['Inter'] text-slate-900">Email</h3>
            <p className="text-gray-500 text-sm font-['Inter']">parteneri@baterino.ro</p>
          </div>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>

        <a
          href="tel:+40211234567"
          className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-200 hover:border-slate-300 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-200 transition-colors">
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold font-['Inter'] text-slate-900">Telefon</h3>
            <p className="text-gray-500 text-sm font-['Inter']">+40 21 123 45 67</p>
          </div>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>

        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <h3 className="text-sm font-bold font-['Inter'] text-slate-900 mb-2">Program suport</h3>
          <p className="text-gray-600 text-sm font-['Inter']">
            Luni – Vineri: 09:00 – 18:00<br />
            Sâmbătă – Duminică: Închis
          </p>
        </div>
      </div>
    </div>
  )
}
