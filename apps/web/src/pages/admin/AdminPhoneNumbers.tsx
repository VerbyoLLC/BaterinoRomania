import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getAdminDepartmentPhones,
  getAuthToken,
  saveAdminDepartmentPhones,
  type DepartmentPhoneKey,
  type DepartmentPhoneRow,
} from '../../lib/api'

const DEPARTMENT_LABELS: Record<DepartmentPhoneKey, string> = {
  general: 'General',
  rezidential: 'Rezidential',
  industrial: 'Industrial',
  medical: 'Medical',
  maritim: 'Maritim',
}

export default function AdminPhoneNumbers() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<DepartmentPhoneRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedOk, setSavedOk] = useState(false)

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/admin/login', { replace: true })
      return
    }
    getAdminDepartmentPhones()
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : 'Eroare la încărcare.'))
      .finally(() => setLoading(false))
  }, [navigate])

  const updateField = (department: DepartmentPhoneKey, field: 'phone' | 'whatsapp', value: string) => {
    setRows((prev) =>
      prev
        ? prev.map((r) => (r.department === department ? { ...r, [field]: value } : r))
        : prev
    )
    setSavedOk(false)
  }

  const handleSave = async () => {
    if (!rows) return
    setSaving(true)
    setError('')
    setSavedOk(false)
    try {
      const saved = await saveAdminDepartmentPhones(rows)
      setRows(saved)
      setSavedOk(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la salvare.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-5xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Numere de telefon</h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-6">
        Telefon principal și număr WhatsApp (cifre, inclusiv prefix țară dacă e cazul) pentru fiecare departament.
      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-['Inter']">
          {error}
        </div>
      )}
      {savedOk && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 font-['Inter']">
          Modificările au fost salvate.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-gray-500 text-sm font-['Inter']">Se încarcă…</p>
        ) : rows && rows.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-['Inter']">
                <thead>
                  <tr className="border-b border-gray-200 bg-slate-50">
                    <th className="px-4 py-3 font-semibold text-slate-800 font-['Inter']">Departament</th>
                    <th className="px-4 py-3 font-semibold text-slate-800 font-['Inter']">Număr de telefon</th>
                    <th className="px-4 py-3 font-semibold text-slate-800 font-['Inter']">WhatsApp – număr de telefon</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.department} className="border-b border-gray-100 last:border-b-0">
                      <td className="px-4 py-3 text-slate-900 font-medium font-['Inter'] whitespace-nowrap">
                        {DEPARTMENT_LABELS[r.department]}
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          className="w-full min-w-[140px] rounded-lg border border-gray-300 px-3 py-2 text-sm font-['Inter'] focus:outline-none focus:ring-2 focus:ring-slate-400/40"
                          value={r.phone}
                          onChange={(e) => updateField(r.department, 'phone', e.target.value)}
                          placeholder="ex. +40 …"
                          autoComplete="tel"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          className="w-full min-w-[140px] rounded-lg border border-gray-300 px-3 py-2 text-sm font-['Inter'] focus:outline-none focus:ring-2 focus:ring-slate-400/40"
                          value={r.whatsapp}
                          onChange={(e) => updateField(r.department, 'whatsapp', e.target.value)}
                          placeholder="ex. 407…"
                          autoComplete="tel"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-[10px] bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white font-['Inter'] outline outline-1 outline-offset-[-1px] outline-zinc-300 hover:bg-transparent hover:outline-slate-900 hover:text-black disabled:opacity-50"
              >
                {saving ? 'Se salvează…' : 'Salvează'}
              </button>
            </div>
          </>
        ) : (
          <p className="p-8 text-gray-500 text-sm font-['Inter']">Nu s-au putut încărca datele.</p>
        )}
      </div>
    </div>
  )
}
