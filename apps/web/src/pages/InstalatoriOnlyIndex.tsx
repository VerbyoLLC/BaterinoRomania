import { Navigate } from 'react-router-dom'
import { getAuthRole } from '../lib/api'

/** In instalatori-only builds, `/` goes to Instalatori except for logged-in retail clients. */
export default function InstalatoriOnlyIndex() {
  if (getAuthRole() === 'client') {
    return <Navigate to="/client" replace />
  }
  return <Navigate to="/instalatori" replace />
}
