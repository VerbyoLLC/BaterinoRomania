import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PasswordInput from './PasswordInput'
import GoogleSignupButton from './GoogleSignupButton'
import { signup, verifySignupCode, resendVerificationCode, googleAuth, setAuthToken } from '../lib/api'

type Step = 'form' | 'verify'

export default function InstalatorSignupBox() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('form')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [termsError, setTermsError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendMsg, setResendMsg] = useState('')
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed) { setTermsError(true); return }
    setError('')
    setLoading(true)
    try {
      await signup(email, password, 'partener')
      setStep('verify')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la înregistrare.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < 6) return
    setError('')
    setLoading(true)
    try {
      const result = await verifySignupCode(email, code)
      setAuthToken(result.token)
      navigate('/signup/parteneri/profil')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cod incorect.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleToken(idToken: string) {
    const result = await googleAuth(idToken, 'partener', { intent: 'signup', acceptedTerms: true })
    setAuthToken(result.token)
    navigate('/signup/parteneri/profil')
  }

  async function handleResend() {
    setError('')
    setResendMsg('')
    try {
      await resendVerificationCode(email)
      setResendMsg('Cod retrimis. Verifică emailul.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la retrimitere.')
    }
  }

  function handleDigitChange(i: number, val: string) {
    const d = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = d
    setDigits(next)
    if (d && i < 5) inputRefs.current[i + 1]?.focus()
  }

  function handleDigitKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted.length) return
    e.preventDefault()
    const next = Array(6).fill('')
    for (let i = 0; i < 6; i++) next[i] = pasted[i] ?? ''
    setDigits(next)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  if (step === 'verify') {
    return (
      <div className="bg-white rounded-2xl p-7 shadow-2xl w-full">
        <h3 className="text-black text-lg font-extrabold font-['Inter'] mb-1">Verifică emailul</h3>
        <p className="text-gray-500 text-sm font-['Inter'] mb-6 leading-relaxed">
          Am trimis un cod de 6 cifre la{' '}
          <span className="font-semibold text-gray-800">{email}</span>.
        </p>

        <form onSubmit={handleVerify} noValidate>
          <div className="flex gap-2 justify-between mb-5" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                autoFocus={i === 0}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleDigitKeyDown(i, e)}
                className="w-10 h-12 text-center text-lg font-bold font-['Inter'] border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
              />
            ))}
          </div>

          {error && <p className="text-red-600 text-xs font-['Inter'] mb-3 leading-relaxed">{error}</p>}
          {resendMsg && <p className="text-green-600 text-xs font-['Inter'] mb-3">{resendMsg}</p>}

          <button
            type="submit"
            disabled={loading || digits.join('').length < 6}
            className="w-full h-11 bg-slate-900 rounded-[10px] text-white text-sm font-bold font-['Inter'] uppercase tracking-wide hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Se verifică...' : 'Confirmă codul'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          className="w-full mt-3 text-xs text-gray-500 font-['Inter'] hover:text-slate-900 transition-colors underline underline-offset-2"
        >
          Nu ai primit codul? Retrimite
        </button>

        <button
          type="button"
          onClick={() => { setStep('form'); setDigits(['', '', '', '', '', '']); setError('') }}
          className="w-full mt-2 text-xs text-gray-400 font-['Inter'] hover:text-slate-900 transition-colors"
        >
          ← Înapoi
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-7 shadow-2xl w-full">
      <h3 className="text-black text-lg font-extrabold font-['Inter'] mb-0.5">Creează cont partener</h3>
      <p className="text-gray-500 text-sm font-['Inter'] mb-5 leading-relaxed">
        Acces la prețuri parteneri, suport tehnic și rețea Baterino.
      </p>

      <GoogleSignupButton
        label="Continuă cu Google"
        disabled={loading}
        beforePopup={() => {
          if (!agreed) { setTermsError(true); return false }
          return true
        }}
        onToken={async (idToken) => {
          setLoading(true)
          setError('')
          try { await handleGoogleToken(idToken) }
          catch (err) { setError(err instanceof Error ? err.message : 'Eroare Google.') }
          finally { setLoading(false) }
        }}
        onError={(msg) => setError(msg)}
      />

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-gray-400 text-xs font-['Inter']">sau cu email</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form onSubmit={handleSignup} noValidate className="flex flex-col gap-3">
        <div>
          <label className="block text-xs font-semibold font-['Inter'] text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="adresa@firma.ro"
            className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold font-['Inter'] text-gray-700 mb-1">
            Parolă
          </label>
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="Minim 8 caractere"
            autoComplete="new-password"
            required
          />
        </div>

        <label className={`flex items-start gap-2.5 cursor-pointer select-none ${termsError ? 'text-red-600' : 'text-gray-600'}`}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => { setAgreed(e.target.checked); if (e.target.checked) setTermsError(false) }}
            className="mt-0.5 w-4 h-4 shrink-0 rounded border-gray-300 accent-slate-900"
          />
          <span className="text-xs font-['Inter'] leading-relaxed">
            Sunt de acord cu{' '}
            <Link to="/termeni" className="underline hover:text-slate-900">Termenii și Condițiile</Link>
            {' '}și{' '}
            <Link to="/confidentialitate" className="underline hover:text-slate-900">Politica de Confidențialitate</Link>.
          </span>
        </label>

        {error && <p className="text-red-600 text-xs font-['Inter'] leading-relaxed">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-slate-900 rounded-[10px] text-white text-sm font-bold font-['Inter'] uppercase tracking-wide hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Se procesează...' : 'Creează cont'}
        </button>
      </form>

      <p className="text-center text-xs text-gray-500 font-['Inter'] mt-4">
        Ai deja cont?{' '}
        <Link to="/login" className="text-slate-900 font-semibold underline hover:text-slate-700">
          Autentifică-te
        </Link>
      </p>
    </div>
  )
}
