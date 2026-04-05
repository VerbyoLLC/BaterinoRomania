import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import GoogleSignupButton from '../components/GoogleSignupButton'
import PasswordInput from '../components/PasswordInput'
import SignupVerifyCode from '../components/SignupVerifyCode'
import type { UserType } from '../components/SignupVerifyCode'
import { signup, checkApiHealth } from '../lib/api'

export default function SignupClienti() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [step, setStep] = useState<1 | 2>(1)
  const [tab, setTab] = useState<UserType>(tabParam === 'partener' ? 'partener' : 'client')

  useEffect(() => {
    if (tabParam === 'partener') setTab('partener')
    else if (tabParam === 'client') setTab('client')
  }, [tabParam])

  useEffect(() => {
    const st = location.state as { guestCheckoutSignup?: boolean; email?: string } | null
    if (st?.guestCheckoutSignup && st.email) {
      const em = String(st.email).trim().toLowerCase()
      if (em) {
        setEmail(em)
        setEmailInput(em)
        setTab('client')
        setStep(2)
      }
      navigate('/signup/clienti?tab=client', { replace: true, state: null })
    }
  }, [location.state, navigate])
  const [email, setEmail] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; submit?: string }>({})
  const [loading, setLoading] = useState(false)
  const [apiOk, setApiOk] = useState<boolean | null>(null)

  useEffect(() => {
    checkApiHealth().then(setApiOk)
  }, [])

  const image = tab === 'client' ? '/images/login/login-client.jpg' : '/images/login/login-partner.jpg'

  const clientLeftContent = (
    <div className="w-[384px] h-[192px] relative">
      <div className="w-[336px] h-[60px] left-0 top-0 absolute text-left text-white text-4xl font-semibold font-['Inter'] leading-[60px]">
        BINE AI VENIT
      </div>
      <div className="w-[384px] h-[120px] left-0 top-[63px] absolute text-left text-white text-[60px] font-bold font-['Inter'] leading-[84px]">
        CLIENTI
      </div>
    </div>
  )

  const partnerLeftContent = (
    <div className="w-[520px] h-[280px] relative">
      <div className="w-[520px] h-[60px] left-0 top-0 absolute text-left text-white text-4xl font-semibold font-['Inter'] leading-[60px]">
        BINE AI VENIT
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

  async function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: { password?: string; confirm?: string; submit?: string } = {}
    if (password.length < 8) newErrors.password = 'Parola trebuie să aibă cel puțin 8 caractere.'
    if (password !== confirm) newErrors.confirm = 'Parolele nu coincid.'
    if (Object.keys(newErrors).length) { setErrors(newErrors); return }
    setErrors({})
    setLoading(true)
    try {
      await signup(emailInput, password, tab)
      setEmail(emailInput)
      setStep(2)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Eroare la înregistrare.'
      console.error('Signup error:', err)
      setErrors({ submit: msg })
    } finally {
      setLoading(false)
    }
  }

  function handleVerifySuccess(userType: UserType) {
    if (userType === 'client') {
      navigate('/')
    } else {
      navigate('/signup/parteneri/profil')
    }
  }

  const errorClass = "text-xs text-red-500 font-['Inter'] mt-1"

  return (
    <AuthLayout
      image={image}
      supertitle="BINE AI VENIT"
      title={tab === 'client' ? 'CLIENTI' : 'INSTALATORI SI DISTRIBUITORI'}
      leftContent={tab === 'client' ? clientLeftContent : partnerLeftContent}
    >
      {step === 1 ? (
        <>
          <h2 className="text-black text-xl sm:text-2xl font-extrabold font-['Inter'] mb-4 sm:mb-6">
            {tab === 'client' ? 'Creează cont client' : 'Creează cont partener'}
          </h2>

          {apiOk === false && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm font-semibold text-amber-800 mb-1">API indisponibil</p>
              <p className="text-xs text-amber-700">
                Pornește API-ul într-un terminal separat: <code className="bg-amber-100 px-1 rounded">cd apps/api && node index.js</code>
              </p>
            </div>
          )}

          {/* Tab switcher */}
          <div className="flex gap-1 mb-6 sm:mb-8 p-1 bg-gray-100 rounded-[10px]">
            {(['client', 'partener'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 min-h-[40px] h-9 rounded-[8px] text-sm font-bold font-['Inter'] transition-colors capitalize ${
                  tab === t
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'client' ? 'Client' : 'Partener'}
              </button>
            ))}
          </div>

          <form className="flex flex-col gap-3 sm:gap-4" onSubmit={handleStep1Submit}>
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-[10px]">
                <p className="text-sm font-['Inter'] text-red-600">{errors.submit}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="Introdu adresa de email"
                autoComplete="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">
                Parolă <span className="text-red-500">*</span>
              </label>
              <PasswordInput
                placeholder="Minim 8 caractere"
                value={password}
                onChange={setPassword}
                hasError={!!errors.password}
                autoComplete="new-password"
              />
              {errors.password && <p className={errorClass}>{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-1">
                Confirmă parola <span className="text-red-500">*</span>
              </label>
              <PasswordInput
                placeholder="Repetă parola"
                value={confirm}
                onChange={setConfirm}
                hasError={!!errors.confirm}
                autoComplete="new-password"
              />
              {errors.confirm && <p className={errorClass}>{errors.confirm}</p>}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-slate-900 flex-shrink-0"
              />
              <span className="text-sm font-['Inter'] text-gray-600 leading-5">
                Sunt de acord cu{' '}
                <Link to="/termeni-si-conditii" className="text-black font-semibold hover:underline">
                  Termenii și Condițiile
                </Link>{' '}
                și{' '}
                <Link to="/politica-confidentialitate" className="text-black font-semibold hover:underline">
                  Politica de Confidențialitate
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={!agreed || loading}
              className="w-full min-h-[44px] h-11 bg-slate-900 rounded-[10px] text-white text-sm font-bold font-['Inter'] hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-1"
            >
              {loading ? 'Se încarcă...' : 'Înregistrează-te'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-['Inter']">sau</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <GoogleSignupButton
            label="Înregistrare cu Google"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-gray-300 text-sm font-semibold font-['Inter'] text-gray-700 transition-colors hover:bg-gray-50"
          />

          <p className="text-center text-sm font-['Inter'] text-gray-500 mt-6">
            Ai deja cont?{' '}
            <Link to="/login" className="text-black font-semibold hover:underline">
              Autentifică-te
            </Link>
          </p>
        </>
      ) : (
        <SignupVerifyCode
          email={email}
          userType={tab}
          onBack={() => setStep(1)}
          onSuccess={handleVerifySuccess}
        />
      )}
    </AuthLayout>
  )
}
