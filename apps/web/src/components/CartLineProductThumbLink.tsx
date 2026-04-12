import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import type { LangCode } from '../i18n/menu'

function ariaViewProduct(lang: LangCode): string {
  if (lang === 'en') return 'View product page'
  if (lang === 'zh') return '查看商品页'
  return 'Vezi pagina produsului'
}

export function CartLineProductThumbLink({
  to,
  src,
  lang,
}: {
  to: string
  src: string
  lang: LangCode
}) {
  return (
    <Link
      to={to}
      className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:h-24 sm:w-24"
      aria-label={ariaViewProduct(lang)}
    >
      <img src={src} alt="" className="h-full w-full object-contain p-2" />
      <span
        className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-slate-900/0 transition-colors group-hover:bg-slate-900/40 group-focus-visible:bg-slate-900/40"
        aria-hidden
      >
        <Eye
          className="h-6 w-6 text-white opacity-0 drop-shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          strokeWidth={2}
          aria-hidden
        />
      </span>
    </Link>
  )
}
