import { Navigate } from 'react-router-dom'
import { getAuthRole } from '../lib/api'
import Home from './Home'
import { INSTALATORI_ONLY } from '../lib/siteMode'

/** Full site: logged-in clients use the catalog as home instead of the marketing page. */
export default function HomeEntry() {
  if (getAuthRole() === 'sales_agent') {
    return <Navigate to="/sales-agent" replace />
  }
  if (!INSTALATORI_ONLY && getAuthRole() === 'client') {
    return <Navigate to="/produse" replace />
  }
  return <Home />
}
