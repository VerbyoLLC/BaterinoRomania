import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { deletePartnerAccount, clearAuth, getPartnerProfile } from '../../lib/api'

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
      <h3 className="text-lg font-bold font-['Inter'] text-slate-900 mb-4">{title}</h3>
      {children}
    </div>
  )
}

export default function PartnerSettings() {
  const navigate = useNavigate()
  const [isSuspended, setIsSuspended] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    getPartnerProfile()
      .then((p: { isSuspended?: boolean }) => setIsSuspended(p?.isSuspended === true))
      .catch(() => setIsSuspended(false))
  }, [])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'DELETE') return
    setDeleting(true)
    setDeleteError('')
    try {
      await deletePartnerAccount()
      clearAuth()
      navigate('/login', { replace: true })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Eroare la ștergerea contului.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-3xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">
        Setări
      </h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8">
        Gestionează detaliile contului și preferințele de securitate.
      </p>

      <div className="flex flex-col gap-6">
        {/* Profile Details */}
        <SectionCard title="Detalii profil">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">Nume firmă</label>
              <input
                type="text"
                defaultValue="Solar Pro SRL"
                className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">Email contact</label>
              <input
                type="email"
                defaultValue="contact@solarpro.ro"
                className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <button
              disabled={isSuspended}
              className="w-fit h-11 px-6 bg-slate-900 rounded-xl text-white text-sm font-bold font-['Inter'] hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900"
            >
              Salvează modificările
            </button>
          </div>
        </SectionCard>

        {/* Change Password */}
        <SectionCard title="Schimbă parola">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">Parola actuală</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">Parola nouă</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">Confirmă parola nouă</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <button className="w-fit h-11 px-6 bg-slate-900 rounded-xl text-white text-sm font-bold font-['Inter'] hover:bg-slate-700 transition-colors">
              Actualizează parola
            </button>
          </div>
        </SectionCard>

        {/* Delete Account */}
        <SectionCard title="Șterge contul">
          <p className="text-gray-600 text-sm font-['Inter'] mb-4">
            Odată ce ștergi contul, nu există cale de întoarcere. Toate datele vor fi eliminate permanent.
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="h-11 px-6 border border-red-300 rounded-xl text-red-600 text-sm font-semibold font-['Inter'] hover:bg-red-50 transition-colors"
            >
              Șterge contul
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="h-11 px-6 border border-gray-300 rounded-xl text-gray-700 text-sm font-semibold font-['Inter'] hover:bg-gray-50 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(''); setDeleteError(''); }}
                className="h-11 px-6 bg-red-600 rounded-xl text-white text-sm font-bold font-['Inter'] hover:bg-red-700 transition-colors"
              >
                Confirmă ștergerea
              </button>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Delete account modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); setDeleteError(''); }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold font-['Inter'] text-slate-900 mb-2">
              Ștergere cont
            </h3>
            <p className="text-gray-600 text-sm font-['Inter'] mb-4">
              Ești pe cale să ștergi contul. Această acțiune este permanentă și nu poate fi anulată.
            </p>
            <ul className="text-gray-700 text-sm font-['Inter'] mb-4 list-disc list-inside space-y-1">
              <li>Toate datele personale vor fi șterse permanent</li>
              <li>Nu vei mai primi niciun fel de corespondență din partea noastră</li>
            </ul>
            <div className="mb-4">
              <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
                Introdu <span className="font-mono bg-gray-100 px-1 rounded">DELETE</span> pentru a confirma
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            {deleteError && (
              <p className="text-red-600 text-sm font-['Inter'] mb-4">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); setDeleteError(''); }}
                className="flex-1 h-11 px-6 border border-gray-300 rounded-xl text-gray-700 text-sm font-semibold font-['Inter'] hover:bg-gray-50 transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                className="flex-1 h-11 px-6 bg-red-600 rounded-xl text-white text-sm font-bold font-['Inter'] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? 'Se șterge...' : 'Șterge contul'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
