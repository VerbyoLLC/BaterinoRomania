import { useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { getAuthRole, getAuthToken } from '../../lib/api'

/**
 * Auth gate for /client/*. Renders children inside the main site Layout (header/footer).
 */
export default function ClientOutlet() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`, { replace: true })
      return
    }
    const role = getAuthRole()
    if (role !== 'client') {
      navigate(role === 'partener' ? '/partner' : role === 'admin' ? '/' : '/login', { replace: true })
    }
  }, [location.pathname, location.search, navigate])

  if (!getAuthToken() || getAuthRole() !== 'client') {
    return (
      <div className="max-w-content mx-auto px-4 py-16">
        <p className="text-sm text-slate-500 font-['Inter']">Se încarcă...</p>
      </div>
    )
  }

  return (
    <div className="max-w-content mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Outlet />
    </div>
  )
}
