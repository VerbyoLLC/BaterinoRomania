import { useRef, useState } from 'react'
import { verifyCode as apiVerifyCode, resendVerificationCode, setAuthToken } from '../lib/api'

export type UserType = 'client' | 'partener'

type SignupVerifyCodeProps = {
  email: string
  userType: UserType
  onBack: () => void
  onSuccess: (userType: UserType) => void
}

export default function SignupVerifyCode({ email, userType, onBack, onSuccess }: SignupVerifyCodeProps) {
  const [digits, setDigits] = useState(['', '', '', ''])
  const [codeError, setCodeError] = useState(false)
  const [resent, setResent] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    setCodeError(false)
    setResent(false)
    if (digit && index < 3) inputsRef.current[index + 1]?.focus()
    if (next.every((d) => d !== '') && next.join('').length === 4) {
      verifyCode(next.join(''))
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (!pasted.length) return
    const next = ['', '', '', '']
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setDigits(next)
    setCodeError(false)
    if (pasted.length === 4) verifyCode(pasted)
    else inputsRef.current[Math.min(pasted.length, 3)]?.focus()
  }

  async function verifyCode(code: string) {
    setLoading(true)
    setCodeError(false)
    try {
      const { token } = await apiVerifyCode(email, code)
      setAuthToken(token)
      onSuccess(userType)
    } catch {
      setCodeError(true)
      setDigits(['', '', '', ''])
      setTimeout(() => inputsRef.current[0]?.focus(), 50)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setCodeError(false)
    try {
      await resendVerificationCode(email)
      setDigits(['', '', '', ''])
      setResent(true)
      setTimeout(() => inputsRef.current[0]?.focus(), 50)
    } catch {
      setCodeError(true)
    }
  }

  const digitBoxClass = (hasError: boolean) =>
    `w-14 h-16 text-center text-2xl font-bold font-['Inter'] border-2 rounded-[10px] focus:outline-none transition-colors ${
      hasError
        ? 'border-red-400 text-red-500 bg-red-50 focus:border-red-500'
        : 'border-gray-300 text-gray-900 focus:border-slate-900'
    }`

  return (
    <>
      {/* Back arrow */}
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

      {/* Envelope icon */}
      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-5">
        <svg className="w-7 h-7 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path strokeLinecap="round" d="M2 7l10 7 10-7" />
        </svg>
      </div>

      <h2 className="text-black text-2xl font-extrabold font-['Inter'] mb-2">
        Verifică emailul
      </h2>
      <p className="text-gray-500 text-sm font-['Inter'] leading-5 mb-8">
        Am trimis un cod de 4 cifre la{' '}
        <span className="text-black font-semibold">{email}</span>.
        Introdu codul mai jos pentru a-ți activa contul.
      </p>

      {/* 4-digit inputs */}
      <div className="flex gap-3 justify-center mb-2" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            autoFocus={i === 0}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={digitBoxClass(codeError)}
          />
        ))}
      </div>

      {/* Error state */}
      {codeError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-[10px]">
          <p className="text-sm font-semibold font-['Inter'] text-red-600 mb-1">
            Cod incorect
          </p>
          <p className="text-xs font-['Inter'] text-red-500 mb-3">
            Codul introdus nu este valid. Verifică emailul sau încearcă una din opțiunile de mai jos.
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleResend}
              className="w-full h-9 bg-slate-900 rounded-[8px] text-white text-xs font-bold font-['Inter'] hover:bg-slate-700 transition-colors"
            >
              Retrimite codul
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full h-9 border border-gray-300 rounded-[8px] text-gray-700 text-xs font-semibold font-['Inter'] hover:bg-gray-50 transition-colors"
            >
              Schimbă emailul
            </button>
          </div>
        </div>
      )}

      {/* Resent confirmation */}
      {resent && !codeError && (
        <p className="text-center text-xs font-['Inter'] text-green-600 mt-3">
          ✓ Un cod nou a fost trimis la {email}.
        </p>
      )}

      {/* Resend link (default, no error) */}
      {!codeError && (
        <p className="text-center text-sm font-['Inter'] text-gray-500 mt-6">
          Nu ai primit codul?{' '}
          <button
            type="button"
            onClick={handleResend}
            className="text-black font-semibold hover:underline"
          >
            Retrimite
          </button>
          {' '}sau{' '}
          <button
            type="button"
            onClick={onBack}
            className="text-black font-semibold hover:underline"
          >
            schimbă emailul
          </button>
        </p>
      )}
    </>
  )
}
