import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { resendVerificationCode, setAuthToken, verifySignupCode } from '../lib/api'

export type SignupUserType = 'client' | 'partener'

type SignupPendingEmailProps = {
  email: string
  userType: SignupUserType
  nextPath?: string
  /** false dacă API-ul a creat contul dar nu a putut trimite emailul de confirmare */
  verificationSent?: boolean
  onBack: () => void
}

export default function SignupPendingEmail({
  email,
  userType,
  nextPath,
  verificationSent = true,
  onBack,
}: SignupPendingEmailProps) {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [resent, setResent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)

  async function handleResend() {
    setError('')
    setLoading(true)
    try {
      await resendVerificationCode(email, nextPath)
      setResent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Eroare la retrimitere.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const digits = code.replace(/\D/g, '').slice(0, 4)
    if (digits.length !== 4) {
      setError('Introdu cele 4 cifre din email.')
      return
    }
    setVerifyLoading(true)
    try {
      const { token, user } = await verifySignupCode(email, digits)
      setAuthToken(token)
      if (user.role === 'partener') {
        navigate('/signup/parteneri/profil', { replace: true })
      } else {
        navigate(nextPath ?? '/produse', { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la verificare.')
    } finally {
      setVerifyLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-['Inter'] text-gray-500 hover:text-black transition-colors mb-6"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Înapoi
      </button>

      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-5">
        <svg className="w-7 h-7 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path strokeLinecap="round" d="M2 7l10 7 10-7" />
        </svg>
      </div>

      <h2 className="text-black text-2xl font-extrabold font-['Inter'] mb-2">Verifică emailul</h2>

      {!verificationSent ? (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-[10px]">
          <p className="text-sm font-semibold text-amber-900 font-['Inter'] mb-1">Cont creat — email netrimis</p>
          <p className="text-xs text-amber-800 font-['Inter'] leading-5">
            Contul tău este activ, dar mesajul cu codul nu a putut fi trimis. De obicei înseamnă că serverul de mail
            (ex. SiteGround) a respins autentificarea (eroare 535: parolă sau utilizator greșit, sau port/SSL
            nepotrivit). Verifică setările SMTP pe server, apoi apasă „Retrimite codul”.
          </p>
        </div>
      ) : null}

      <p className="text-gray-500 text-sm font-['Inter'] leading-5 mb-2">
        {verificationSent ? (
          <>
            Am trimis un cod din <strong>4 cifre</strong> la{' '}
            <span className="text-black font-semibold">{email}</span>. Introdu codul mai jos pentru a-ți activa
            contul.
          </>
        ) : (
          <>
            După ce repari trimiterea, vei primi un cod din 4 cifre la{' '}
            <span className="text-black font-semibold">{email}</span>. Apoi îl introduci aici.
          </>
        )}
      </p>
      <p className="text-gray-500 text-xs font-['Inter'] leading-5 mb-6">
        Codul este valabil 15 minute. Mesajul vine de la adresa de expeditor setată pe server.
      </p>

      <form onSubmit={handleVerifyCode} className="mb-6 space-y-3">
        <label className="block">
          <span className="text-sm font-semibold text-gray-800 font-['Inter']">Cod din 4 cifre</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            maxLength={4}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="••••"
            className="mt-1 w-full h-12 rounded-[10px] border border-gray-300 px-4 text-center text-2xl font-bold tracking-[0.4em] font-['Inter'] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </label>
        {error ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-[10px]">
            <p className="text-sm font-['Inter'] text-red-600">{error}</p>
          </div>
        ) : null}
        <button
          type="submit"
          disabled={verifyLoading || code.replace(/\D/g, '').length !== 4}
          className="w-full min-h-[44px] h-11 bg-slate-900 rounded-[10px] text-white text-sm font-bold font-['Inter'] hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {verifyLoading ? 'Se verifică…' : 'Activează contul'}
        </button>
      </form>

      {resent ? (
        <p className="text-center text-sm font-['Inter'] text-emerald-700 mb-4">Am retrimis codul de verificare.</p>
      ) : null}

      <p className="text-center text-sm font-['Inter'] text-gray-500">
        Nu ai primit codul?{' '}
        <button
          type="button"
          disabled={loading}
          onClick={() => void handleResend()}
          className="text-black font-semibold hover:underline disabled:opacity-50"
        >
          {loading ? 'Se trimite…' : 'Retrimite codul'}
        </button>
        {' · '}
        <button type="button" onClick={onBack} className="text-black font-semibold hover:underline">
          Schimbă emailul
        </button>
      </p>

      {userType === 'partener' ? (
        <p className="mt-6 text-xs text-gray-400 font-['Inter']">
          După activare vei continua cu completarea profilului de partener.
        </p>
      ) : null}
    </>
  )
}
