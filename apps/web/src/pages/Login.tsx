import { useState, useRef } from 'react'
import { Link, useSearchParams, useNavigate, type NavigateFunction } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import GoogleSignupButton from '../components/GoogleSignupButton'
import PasswordInput from '../components/PasswordInput'
import {
  googleAuth,
  getPartnerPostLoginPath,
  login as apiLogin,
  setAuthToken,
  type AuthUser,
} from '../lib/api'
import { INSTALATORI_ONLY } from '../lib/siteMode'

function safeInternalNext(raw: string | null): string | undefined {
  if (!raw) return undefined
  try {
    const decoded = decodeURIComponent(raw.trim())
    if (!decoded.startsWith('/') || decoded.startsWith('//')) return undefined
    return decoded
  } catch {
    return undefined
  }
}

type PartnerGoogleOnboarding = { needsPartnerProfile: boolean; partnerSignupPath?: string }

function navigateAfterLogin(
  navigate: NavigateFunction,
  user: AuthUser,
  nextPath: string | undefined,
  partnerGoogle?: PartnerGoogleOnboarding,
) {
  if (user.role === 'admin') {
    const dest =
      nextPath && nextPath.startsWith('/admin') && nextPath !== '/admin/login' ? nextPath : '/admin'
    navigate(dest)
    return
  }
  if (user.role === 'sales_agent') {
    const dest =
      nextPath && nextPath.startsWith('/sales-agent') ? nextPath : '/sales-agent'
    navigate(dest)
    return
  }
  if (user.role === 'partener') {
    void getPartnerPostLoginPath().then((path) => navigate(path))
    return
  }
  if (user.role === 'client') {
    navigate(nextPath ?? '/produse')
    return
  }
  navigate(nextPath ?? '/')
}

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const nextPath = safeInternalNext(searchParams.get('next'))

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const submitRef = useRef<HTMLButtonElement>(null)

  /** Rol trimis la API pentru partener pe site-ul instalatori (pe login nu se mai creează cont Google nou). */
  const googleAuthRole = INSTALATORI_ONLY ? 'partener' : 'client'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await apiLogin(email, password)
      setAuthToken(token)
      if (user.role === 'partener') {
        navigate(await getPartnerPostLoginPath())
        return
      }
      if (user.role === 'sales_agent') {
        navigate(nextPath && nextPath.startsWith('/sales-agent') ? nextPath : '/sales-agent')
        return
      }
      navigateAfterLogin(navigate, user, nextPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la autentificare.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleToken(idToken: string) {
    setError('')
    setLoading(true)
    try {
      const { token, user, needsPartnerProfile, partnerSignupPath } = await googleAuth(idToken, googleAuthRole, {
        intent: 'login',
      })
      setAuthToken(token)
      navigateAfterLogin(
        navigate,
        user,
        nextPath,
        needsPartnerProfile
          ? { needsPartnerProfile: true, partnerSignupPath }
          : undefined,
      )
    } catch (err) {
      const e = err as Error & { apiCode?: string }
      setError(e instanceof Error ? e.message : 'Eroare la autentificare cu Google.')
    } finally {
      setLoading(false)
    }
  }

  const image = INSTALATORI_ONLY ? '/images/login/login-partner.jpg' : '/images/login/login-client.jpg'

  const clientLeftContent = (
    <div className="w-[384px] h-[192px] relative">
      <div className="w-[336px] h-[60px] left-0 top-0 absolute text-left text-white text-4xl font-semibold font-['Inter'] leading-[60px]">
        BINE AI REVENIT
      </div>
      <div className="w-[384px] h-[120px] left-0 top-[63px] absolute text-left text-white text-[60px] font-bold font-['Inter'] leading-[84px]">
        CLIENTI
      </div>
    </div>
  )

  const partnerLeftContent = (
    <div className="w-[520px] h-[280px] relative">
      <div className="w-[520px] h-[60px] left-0 top-0 absolute text-left text-white text-4xl font-semibold font-['Inter'] leading-[60px]">
        BINE AI REVENIT
      </div>
      <div className="w-[520px] min-h-[168px] left-0 top-[63px] absolute flex flex-col items-start justify-center text-left">
        <span>
          <span className="text-white text-[60px] font-bold font-['Inter'] leading-[84px]">INSTALATORI </span>
          <span className="text-white text-[60px] font-bold font-['Inter'] leading-[84px]">SI</span>
        </span>
        <span className="text-white text-[60px] font-bold font-['Inter'] leading-[84px]">DISTRIBUITORI</span>
      </div>
    </div>
  )

  return (
    <AuthLayout
      image={image}
      supertitle="BINE AI REVENIT"
      title="CONT BATERINO"
      leftContent={INSTALATORI_ONLY ? partnerLeftContent : clientLeftContent}
    >
      <h2 className="text-black text-xl sm:text-2xl font-extrabold font-['Inter'] mb-4 sm:mb-6">
        Autentificare
      </h2>

      <form className="flex flex-col gap-3 sm:gap-4" onSubmit={handleSubmit}>
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
            inputMode="email"
            autoComplete="email"
            placeholder="Introdu adresa de email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 scroll-mb-40"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-semibold font-['Inter'] text-gray-700">
              Parolă
            </label>
            <Link
              to="/reset-password"
              className="text-xs font-medium font-['Inter'] text-gray-500 hover:text-black transition-colors"
            >
              Ai uitat parola?
            </Link>
          </div>
          <PasswordInput
            placeholder="Introdu parola"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            inputMode="text"
            onFocus={() => submitRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })}
            inputClassName="scroll-mb-40"
          />
        </div>

        <button
          ref={submitRef}
          type="submit"
          disabled={loading}
          className="w-full min-h-[44px] h-11 bg-slate-900 rounded-[10px] text-white text-sm font-bold font-['Inter'] hover:bg-slate-700 active:bg-slate-800 transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Se încarcă...' : 'Autentifică-te'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-3 sm:my-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-['Inter']">sau</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <GoogleSignupButton
        label="Conectează-te cu Google"
        disabled={loading}
        onToken={handleGoogleToken}
        onError={(msg) => setError(msg)}
        className="w-full min-h-[44px] h-11 border border-gray-300 rounded-[10px] flex items-center justify-center gap-2 text-sm font-semibold font-['Inter'] text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
      />

      {!INSTALATORI_ONLY && (
        <p className="text-center text-sm font-['Inter'] text-gray-500 mt-4 sm:mt-6">
          Nu ai cont?{' '}
          <Link to="/signup/clienti" className="text-black font-semibold hover:underline">
            Creează cont
          </Link>
        </p>
      )}
    </AuthLayout>
  )
}
