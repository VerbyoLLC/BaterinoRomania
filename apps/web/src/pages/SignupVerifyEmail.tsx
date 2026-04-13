import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { setAuthToken, verifyEmailToken } from '../lib/api'

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

export default function SignupVerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const nextPath = safeInternalNext(searchParams.get('next'))
  const [status, setStatus] = useState<'working' | 'err'>('working')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token || token.length < 32) {
      setStatus('err')
      setMessage('Link invalid sau incomplet.')
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const { token: jwt, user } = await verifyEmailToken(token)
        if (cancelled) return
        setAuthToken(jwt)
        if (user.role === 'partener') {
          navigate('/signup/parteneri/profil', { replace: true })
        } else {
          navigate(nextPath ?? '/produse', { replace: true })
        }
      } catch (e) {
        if (cancelled) return
        setStatus('err')
        setMessage(e instanceof Error ? e.message : 'Verificarea a eșuat.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, nextPath, navigate])

  return (
    <AuthLayout
      image="/images/login/login-client.jpg"
      supertitle="BATERINO"
      title="Confirmare cont"
      leftContent={
        <div className="w-[384px] h-[120px] relative">
          <p className="text-white/80 text-sm font-medium font-['Inter'] tracking-widest uppercase mb-2">
            Un moment
          </p>
          <h1 className="text-white text-3xl font-extrabold font-['Inter'] leading-tight">Activăm contul</h1>
        </div>
      }
    >
      {status === 'working' ? (
        <p className="text-gray-600 text-sm font-['Inter']">Se verifică linkul…</p>
      ) : null}
      {status === 'err' ? (
        <div>
          <h2 className="text-xl font-extrabold font-['Inter'] text-slate-900 mb-2">Nu am putut confirma</h2>
          <p className="text-red-600 text-sm font-['Inter'] mb-6">{message}</p>
          <Link
            to="/signup/clienti"
            className="inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-slate-900 px-5 text-sm font-bold text-white font-['Inter'] hover:bg-slate-700"
          >
            Înapoi la înregistrare
          </Link>
        </div>
      ) : null}
    </AuthLayout>
  )
}
