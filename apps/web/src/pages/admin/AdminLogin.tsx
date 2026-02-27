import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PasswordInput from '../../components/PasswordInput'
import { login, setAuthToken } from '../../lib/api'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await login(email, password)
      if (user.role !== 'admin') {
        setError('Acces restricționat. Doar administratorii pot accesa acest panou.')
        return
      }
      setAuthToken(token)
      navigate('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email sau parolă incorectă.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#fce4ec' }}
    >
      <div className="w-full max-w-[400px] bg-white rounded-[20px] overflow-hidden shadow-lg">

        {/* Top image with logo */}
        <div className="relative h-[200px] overflow-hidden">
          <img
            src="/images/home/slider-apple/slide1-baterii-rezidential.jpg"
            alt="Baterino Admin"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-2xl font-bold font-['Inter'] tracking-[0.25em] uppercase">
              BATERINO
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-8 flex flex-col gap-5">

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-black text-sm font-medium font-['Inter']">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Introdu adresa de email"
              required
              className="h-12 px-4 rounded-[10px] border border-zinc-200 bg-white text-black text-sm font-['Inter'] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-black text-sm font-medium font-['Inter']">Parola</label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="Introdu o parolă"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm font-['Inter'] -mt-2">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full bg-slate-900 text-white rounded-[10px] text-base font-semibold font-['Inter'] hover:bg-slate-700 active:bg-black transition-colors mt-1 disabled:opacity-50"
          >
            {loading ? 'Se conectează...' : 'Login'}
          </button>

        </form>
      </div>
    </div>
  )
}
