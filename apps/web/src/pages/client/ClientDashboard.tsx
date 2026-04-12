import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  ClipboardList,
  Package,
  Percent,
  Settings,
  ShoppingCart,
  Sparkles,
} from 'lucide-react'

const cardClass =
  'flex h-full min-h-[11.5rem] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-slate-300 hover:shadow'

function DashboardCard({
  to,
  title,
  description,
  icon: Icon,
}: {
  to: string
  title: string
  description: string
  icon: LucideIcon
}) {
  return (
    <Link to={to} className={cardClass}>
      <div
        className="mb-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700"
        aria-hidden
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <p className="font-bold text-slate-900 font-['Inter'] mb-1.5">{title}</p>
      <p className="text-sm text-slate-600 font-['Inter'] leading-snug">{description}</p>
    </Link>
  )
}

export default function ClientDashboard() {
  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Contul tău</h1>
      <p className="text-slate-600 text-sm font-['Inter'] mb-8">
        Gestionează coșul, comenzile și datele din cont din meniul „Cont” sau de mai jos.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          to="/client/produse"
          title="Produsele mele"
          description="Achiziții, suport, manuale și garanție."
          icon={Package}
        />
        <DashboardCard
          to="/client/beneficii"
          title="Beneficii"
          description="Ce ai în plus ca și client Baterino."
          icon={Sparkles}
        />
        <DashboardCard
          to="/client/coduri-reducere"
          title="Coduri reducere"
          description="Codul tău de recomandare și programele disponibile."
          icon={Percent}
        />
        <DashboardCard
          to="/cos"
          title="Coș"
          description="Vezi produsele și finalizează comanda."
          icon={ShoppingCart}
        />
        <DashboardCard
          to="/client/comenzi"
          title="Comenzile mele"
          description="Istoric comenzi rezidențiale."
          icon={ClipboardList}
        />
        <DashboardCard
          to="/client/setari"
          title="Setări"
          description="Nume, adrese, schimbare parolă."
          icon={Settings}
        />
      </div>
    </div>
  )
}
