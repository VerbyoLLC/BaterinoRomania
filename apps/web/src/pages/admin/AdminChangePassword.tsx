import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthToken, postAdminChangePassword } from '../../lib/api'

export default function AdminChangePassword() {
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/admin/login', { replace: true })
    }
  }, [navigate])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setOk('')
    if (newPassword.length < 8) {
      setError('Parola nouă: minimum 8 caractere.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Parolele noi nu coincid.')
      return
    }
    setBusy(true)
    try {
      await postAdminChangePassword(currentPassword, newPassword)
      setOk('Parola a fost actualizată.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Schimbă parola</h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-6">
        Actualizează parola contului tău de administrator. Dacă nu ai încă parolă (cont doar Google), poți seta o
        parolă aici fără „parola curentă”.
      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-['Inter']">
          {error}
        </div>
      )}
      {ok && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 font-['Inter']">
          {ok}
        </div>
      )}

      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div>
          <label htmlFor="admin-cpw-current" className="block text-sm font-semibold text-slate-800 font-['Inter'] mb-1.5">
            Parola curentă
          </label>
          <input
            id="admin-cpw-current"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-['Inter'] text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <p className="mt-1 text-xs text-gray-500 font-['Inter']">Lasă gol doar dacă încă nu ai parolă setată.</p>
        </div>
        <div>
          <label htmlFor="admin-cpw-new" className="block text-sm font-semibold text-slate-800 font-['Inter'] mb-1.5">
            Parolă nouă
          </label>
          <input
            id="admin-cpw-new"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-['Inter'] text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div>
          <label htmlFor="admin-cpw-confirm" className="block text-sm font-semibold text-slate-800 font-['Inter'] mb-1.5">
            Confirmă parola nouă
          </label>
          <input
            id="admin-cpw-confirm"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-['Inter'] text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full sm:w-auto rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold font-['Inter'] text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {busy ? 'Se salvează…' : 'Salvează parola'}
        </button>
      </form>
    </div>
  )
}
