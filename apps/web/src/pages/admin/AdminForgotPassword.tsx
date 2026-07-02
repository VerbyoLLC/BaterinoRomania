import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestAdminPasswordReset } from '../../lib/api'

export default function AdminForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await requestAdminPasswordReset(email.trim().toLowerCase())
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la trimiterea solicitării.')
    } finally {
      setLoading(false)
    }
  }

  return (
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
          {sent ? (
            <div className="flex flex-col gap-4">
              <h1 className="m-0 text-xl font-bold font-['Inter'] text-slate-900">Solicitare înregistrată</h1>
              <p className="m-0 text-sm leading-relaxed text-slate-600 font-['Inter']">
                Dacă datele introduse corespund unui cont valid, vei primi instrucțiuni de recuperare prin
                canalele autorizate. Verifică mesajele primite în următoarele minute.
              </p>
              <Link
                to="/admin/login"
                className="inline-flex h-12 items-center justify-center rounded-[10px] bg-slate-900 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Înapoi la login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <h1 className="m-0 mb-2 text-xl font-bold font-['Inter'] text-slate-900">Resetare parolă</h1>
                <p className="m-0 text-sm leading-relaxed text-slate-600 font-['Inter']">
                  Introdu adresa de email asociată contului. Dacă este înregistrată, vei primi instrucțiuni de
                  recuperare prin canalele autorizate.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-black text-sm font-medium font-['Inter']">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@baterino.ro"
                  required
                  className="h-12 px-4 rounded-[10px] border border-zinc-200 bg-white text-black text-sm font-['Inter'] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {error ? <p className="m-0 text-sm text-red-500 font-['Inter']">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full bg-slate-900 text-white rounded-[10px] text-base font-semibold font-['Inter'] hover:bg-slate-700 disabled:opacity-50"
              >
                {loading ? 'Se trimite...' : 'Trimite solicitarea'}
              </button>

              <Link to="/admin/login" className="text-center text-sm text-slate-600 hover:text-slate-900 font-['Inter']">
                Înapoi la login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
