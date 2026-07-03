import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import PasswordInput from '../../components/PasswordInput'
import SEO from '../../components/SEO'
import { resetPassword } from '../../lib/api'

export default function AdminResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const tokenFromUrl = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!tokenFromUrl) {
      navigate('/admin/forgot-password', { replace: true })
    }
  }, [tokenFromUrl, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tokenFromUrl) return
    if (password.length < 8) {
      setError('Parola trebuie să aibă cel puțin 8 caractere.')
      return
    }
    if (password !== confirmPassword) {
      setError('Parolele nu coincid.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await resetPassword(tokenFromUrl, password)
      setDone(true)
      setTimeout(() => navigate('/admin/login'), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la resetarea parolei.')
    } finally {
      setLoading(false)
    }
  }

  if (!tokenFromUrl) return null

  return (
    <>
      <SEO title="Parolă nouă admin" description="" noIndex lang="ro" />
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#fce4ec' }}>
      <div className="w-full max-w-[400px] bg-white rounded-[20px] overflow-hidden shadow-lg">
        <div className="relative h-[160px] overflow-hidden">
          <img
            src="/images/home/slider-apple/slide1-baterii-rezidential.webp"
            alt="Baterino Admin"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xl font-bold font-['Inter'] tracking-[0.2em] uppercase">BATERINO</span>
          </div>
        </div>

        <div className="px-8 py-8">
          {done ? (
            <div className="flex flex-col gap-4">
              <h1 className="m-0 text-xl font-bold font-['Inter'] text-slate-900">Parolă actualizată</h1>
              <p className="m-0 text-sm text-slate-600 font-['Inter']">Te redirecționăm către pagina de login admin...</p>
              <Link
                to="/admin/login"
                className="inline-flex h-12 items-center justify-center rounded-[10px] bg-slate-900 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Mergi la login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <h1 className="m-0 mb-2 text-xl font-bold font-['Inter'] text-slate-900">Parolă nouă admin</h1>
                <p className="m-0 text-sm text-slate-600 font-['Inter']">Setează parola nouă pentru contul de administrator.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-black text-sm font-medium font-['Inter']">Parolă nouă</label>
                <PasswordInput value={password} onChange={setPassword} placeholder="Minim 8 caractere" required />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-black text-sm font-medium font-['Inter']">Confirmă parola</label>
                <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Repetă parola" required />
              </div>

              {error ? <p className="m-0 text-sm text-red-500 font-['Inter']">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full bg-slate-900 text-white rounded-[10px] text-base font-semibold font-['Inter'] hover:bg-slate-700 disabled:opacity-50"
              >
                {loading ? 'Se salvează...' : 'Salvează parola'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
