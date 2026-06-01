import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminAccount, getAuthToken, patchAdminAccount, type AdminAccountDto } from '../../lib/api'
import { loadPhoneE164 } from '../../lib/formInputSanitize'
import PhoneInput from '../../components/PhoneInput'

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  client: 'Client',
  partener: 'Partener',
}

export default function AdminAccountDetails() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedOk, setSavedOk] = useState(false)
  const [account, setAccount] = useState<AdminAccountDto | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')

  const load = useCallback(() => {
    if (!getAuthToken()) return
    setLoading(true)
    setError('')
    getAdminAccount()
      .then((a) => {
        setAccount(a)
        setFirstName(a.firstName)
        setLastName(a.lastName)
        setPhone(loadPhoneE164(a.phone))
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Eroare la încărcare.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/admin/login', { replace: true })
      return
    }
    load()
  }, [navigate, load])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSavedOk(false)
    try {
      const updated = await patchAdminAccount({ firstName, lastName, phone })
      setAccount(updated)
      setFirstName(updated.firstName)
      setLastName(updated.lastName)
      setPhone(updated.phone)
      setSavedOk(true)
      window.dispatchEvent(new Event('admin-account-updated'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la salvare.')
    } finally {
      setSaving(false)
    }
  }

  const roleLabel = account ? ROLE_LABEL[account.role] ?? account.role : ''

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Detalii cont</h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-6">
        Nivelul utilizatorului și adresa de email sunt asociate autentificării. Poți edita prenumele, numele și
        telefonul afișate în panou.
      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-['Inter']">
          {error}
        </div>
      )}
      {savedOk && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 font-['Inter']">
          Datele au fost salvate.
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500 font-['Inter']">Se încarcă…</p>
      ) : account ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-['Inter']">
                Nivel utilizator
              </dt>
              <dd className="mt-1 text-base text-slate-900 font-['Inter'] font-medium">{roleLabel}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-['Inter']">Email</dt>
              <dd className="mt-1 text-base text-slate-900 font-['Inter'] break-all">{account.email}</dd>
            </div>
          </dl>

          <form onSubmit={onSubmit} className="space-y-4 border-t border-gray-100 pt-6">
            <div>
              <label htmlFor="admin-acc-first" className="block text-sm font-semibold text-slate-800 font-['Inter'] mb-1.5">
                Prenume
              </label>
              <input
                id="admin-acc-first"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value)
                  setSavedOk(false)
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-['Inter'] text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label htmlFor="admin-acc-last" className="block text-sm font-semibold text-slate-800 font-['Inter'] mb-1.5">
                Nume (familie)
              </label>
              <input
                id="admin-acc-last"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value)
                  setSavedOk(false)
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-['Inter'] text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 font-['Inter'] mb-1.5">
                Telefon
              </label>
              <PhoneInput
                value={phone}
                onChange={(v) => {
                  setPhone(v)
                  setSavedOk(false)
                }}
                autoComplete="tel"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold font-['Inter'] text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? 'Se salvează…' : 'Salvează datele'}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  )
}
