import { useState } from 'react'
import { resendVerificationCode } from '../lib/api'

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
  const [resent, setResent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
            Contul tău este activ, dar mesajul cu linkul de confirmare nu a putut fi trimis. De obicei înseamnă că
            serverul de mail (ex. SiteGround) a respins autentificarea (eroare 535: parolă sau utilizator greșit, sau
            port/SSL nepotrivit: încearcă 465 cu SSL sau 587 cu STARTTLS). Dacă întreții site-ul, verifică în panoul de
            hosting datele SMTP și că adresa „De la” din API coincide cu{' '}
            <span className="font-medium">contul de email autentificat</span>, apoi apasă „Retrimite linkul”.
          </p>
        </div>
      ) : null}

      <p className="text-gray-500 text-sm font-['Inter'] leading-5 mb-2">
        {verificationSent ? (
          <>
            Am trimis un link de confirmare la <span className="text-black font-semibold">{email}</span>. Deschide
            emailul și apasă <strong>Confirmă contul</strong> pentru a te autentifica automat.
          </>
        ) : (
          <>
            Ar trebui să primești un link de confirmare la <span className="text-black font-semibold">{email}</span>{' '}
            după ce retrimiți mesajul (sau după repararea serverului de mail). Apoi apasă{' '}
            <strong>Confirmă contul</strong> în email.
          </>
        )}
      </p>
      <p className="text-gray-500 text-xs font-['Inter'] leading-5 mb-8">
        {verificationSent ? (
          <>
            Mesajul vine de la adresa de expeditor setată pe server. Linkul este valabil 48 de ore.
          </>
        ) : (
          <>După repararea trimiterii, linkul din email va fi valabil 48 de ore.</>
        )}
      </p>

      {error ? (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[10px]">
          <p className="text-sm font-['Inter'] text-red-600">{error}</p>
        </div>
      ) : null}

      {resent ? (
        <p className="text-center text-sm font-['Inter'] text-emerald-700 mb-4">Am retrimis linkul de confirmare.</p>
      ) : null}

      <p className="text-center text-sm font-['Inter'] text-gray-500">
        Nu ai primit emailul?{' '}
        <button
          type="button"
          disabled={loading}
          onClick={() => void handleResend()}
          className="text-black font-semibold hover:underline disabled:opacity-50"
        >
          {loading ? 'Se trimite…' : 'Retrimite linkul'}
        </button>
        {' · '}
        <button type="button" onClick={onBack} className="text-black font-semibold hover:underline">
          Schimbă emailul
        </button>
      </p>

      {userType === 'partener' ? (
        <p className="mt-6 text-xs text-gray-400 font-['Inter']">
          După confirmare vei continua cu completarea profilului de partener.
        </p>
      ) : null}
    </>
  )
}
