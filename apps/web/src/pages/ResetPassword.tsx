import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import PasswordInput from '../components/PasswordInput'
import { requestPasswordReset, resetPassword } from '../lib/api'

const PLACEHOLDER_IMG = '/images/instalatori/instalatori-baterino.jpg'

type Step = 'email' | 'sent' | 'reset' | 'done'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const tokenFromUrl = searchParams.get('token')

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tokenFromUrl) {
      setStep('reset')
    }
  }, [tokenFromUrl])

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await requestPasswordReset(email.trim().toLowerCase())
      setStep('sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la trimiterea link-ului.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!tokenFromUrl) return
    if (password.length < 8) {
      setError('Parola trebuie să aibă cel puțin 8 caractere.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await resetPassword(tokenFromUrl, password)
      setStep('done')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la resetarea parolei.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'reset') {
    return (
      <AuthLayout
        image={PLACEHOLDER_IMG}
        supertitle="RESETARE"
        title="PAROLĂ CONT"
      >
        <h2 className="text-black text-2xl font-extrabold font-['Inter'] mb-1">
          Parolă nouă
        </h2>
        <p className="text-gray-500 text-sm font-['Inter'] mb-8 leading-6">
          Introdu parola nouă pentru contul tău. Minim 8 caractere.
        </p>

        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-[10px]">
              <p className="text-sm font-['Inter'] text-red-600">{error}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">
              Parolă nouă
            </label>
            <PasswordInput
              placeholder="Introdu parola nouă"
              value={password}
              onChange={setPassword}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-slate-900 rounded-[10px] text-white text-sm font-bold font-['Inter'] hover:bg-slate-700 transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Se salvează...' : 'Resetează parola'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-sm font-semibold font-['Inter'] text-gray-600 hover:text-black transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Înapoi la autentificare
        </Link>
      </AuthLayout>
    )
  }

  if (step === 'done') {
    return (
      <AuthLayout
        image={PLACEHOLDER_IMG}
        supertitle="RESETARE"
        title="PAROLĂ CONT"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-black text-2xl font-extrabold font-['Inter'] mb-3">
            Parola a fost actualizată!
          </h2>
          <p className="text-gray-500 text-sm font-['Inter'] leading-6 mb-8">
            Te redirecționăm la pagina de autentificare...
          </p>
          <Link
            to="/login"
            className="text-sm font-semibold font-['Inter'] text-slate-900 hover:underline"
          >
            Mergi la autentificare
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      image={PLACEHOLDER_IMG}
      supertitle="RESETARE"
      title="PAROLĂ CONT"
    >
      {step === 'email' ? (
        <>
          <h2 className="text-black text-2xl font-extrabold font-['Inter'] mb-1">
            Ai uitat parola?
          </h2>
          <p className="text-gray-500 text-sm font-['Inter'] mb-8 leading-6">
            Introdu adresa de email asociată contului tău (client sau partener). Îți vom trimite un link pentru a-ți reseta parola.
          </p>

          <form onSubmit={handleRequestReset} className="flex flex-col gap-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-[10px]">
                <p className="text-sm font-['Inter'] text-red-600">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Introdu adresa de email"
                className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-slate-900 rounded-[10px] text-white text-sm font-bold font-['Inter'] hover:bg-slate-700 transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Se trimite...' : 'Trimite link de resetare'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm font-semibold font-['Inter'] text-gray-600 hover:text-black transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Înapoi la autentificare
          </Link>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-black text-2xl font-extrabold font-['Inter'] mb-3">
              Email trimis!
            </h2>
            <p className="text-gray-500 text-sm font-['Inter'] leading-6 mb-2">
              Am trimis un link de resetare la
            </p>
            <p className="text-black text-sm font-bold font-['Inter'] mb-6 break-all">
              {email}
            </p>
            <p className="text-gray-400 text-xs font-['Inter'] leading-5 mb-8">
              Verifică și folderul Spam dacă nu găsești email-ul. Link-ul este valabil 30 de minute.
            </p>

            <button
              type="button"
              onClick={() => setStep('email')}
              className="text-sm font-semibold font-['Inter'] text-gray-500 hover:text-black transition-colors"
            >
              Nu ai primit email-ul? Retrimite
            </button>

            <div className="flex items-center gap-3 my-6 w-full">
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm font-semibold font-['Inter'] text-gray-600 hover:text-black transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Înapoi la autentificare
            </Link>
          </div>
        </>
      )}
    </AuthLayout>
  )
}
