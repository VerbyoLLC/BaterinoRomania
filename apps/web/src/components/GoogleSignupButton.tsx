import { useEffect, useRef, useState } from 'react'

type Props = {
  label: string
  /** Optional; defaults to checkout-style button */
  className?: string
  disabled?: boolean
  /** Return false to stop before opening Google (e.g. terms not accepted). Runs synchronously on click. */
  beforePopup?: () => boolean
  onToken: (idToken: string) => Promise<void>
  onError?: (message: string) => void
}

const defaultClassName =
  'flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold font-[\'Inter\'] text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'

const GOOGLE_SCRIPT_ID = 'google-identity-services'

type CredentialResponse = {
  credential?: string
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (opts: Record<string, unknown>) => void
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
          prompt: (momentListener?: (notification: unknown) => void) => void
        }
      }
    }
  }
}

function loadGoogleSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }
    const existing = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Nu am putut încărca Google Identity Services.')), {
        once: true,
      })
      return
    }
    const s = document.createElement('script')
    s.id = GOOGLE_SCRIPT_ID
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Nu am putut încărca Google Identity Services.'))
    document.head.appendChild(s)
  })
}

type GsiStartResult =
  | { ok: true; promise: Promise<void> }
  | { ok: false; error: Error }

function findGsiRoleButton(mount: HTMLElement): HTMLElement | null {
  const direct = mount.querySelector('[role="button"]') as HTMLElement | null
  if (direct) return direct
  const walkShadow = (root: ParentNode): HTMLElement | null => {
    for (const node of root.querySelectorAll('*')) {
      if (!(node instanceof HTMLElement)) continue
      const inner = node.shadowRoot?.querySelector('[role="button"]') as HTMLElement | null
      if (inner) return inner
    }
    return null
  }
  return walkShadow(mount)
}

/**
 * Popup-based Sign in with Google (JWT), using `renderButton` — not One Tap `prompt()`.
 * Runs `initialize` → `renderButton` → programmatic `click()` synchronously so the popup
 * stays tied to the user gesture. Resolves with the JWT from `callback` (not an access token).
 */
function startGsiPopupFromRenderedButton(
  mount: HTMLElement,
  clientId: string,
  onToken: (idToken: string) => Promise<void>,
): GsiStartResult {
  const api = window.google?.accounts?.id
  if (!api) {
    return { ok: false, error: new Error('Google Identity Services nu este disponibil.') }
  }

  let immediateError: Error | null = null
  const promise = new Promise<void>((resolve, reject) => {
    let settled = false
    const timeout = window.setTimeout(() => {
      if (settled) return
      settled = true
      mount.replaceChildren()
      reject(new Error('Nu ai selectat un cont Google.'))
    }, 30_000)

    const finish = () => {
      window.clearTimeout(timeout)
      mount.replaceChildren()
    }

    api.initialize({
      client_id: clientId,
      ux_mode: 'popup',
      context: 'signin',
      auto_select: false,
      /** Popup + button flow: avoid FedCM / third-party cookie quirks (e.g. localhost). */
      use_fedcm_for_prompt: false,
      itp_support: true,
      callback: async (resp: CredentialResponse) => {
        if (settled) return
        settled = true
        finish()
        const credential = String(resp?.credential || '').trim()
        if (!credential) {
          reject(new Error('Google nu a returnat un token valid.'))
          return
        }
        try {
          await onToken(credential)
          resolve()
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Autentificarea cu Google a eșuat.'))
        }
      },
    })

    mount.replaceChildren()
    api.renderButton(mount, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      width: '100%',
      locale: 'ro',
    })

    const btn = findGsiRoleButton(mount)
    if (!btn) {
      settled = true
      window.clearTimeout(timeout)
      mount.replaceChildren()
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      let detail = 'Google Sign-In nu a putut fi afișat în acest browser.'
      detail += ` Client ID folosit: ${clientId}.`
      if (origin) {
        detail += ` În Google Cloud Console → Credentials → același OAuth client ca VITE_GOOGLE_CLIENT_ID → Authorized JavaScript origins, adaugă exact: ${origin} (fără slash la final), salvează, așteaptă câteva minute și repornește dev serverul.`
      }
      immediateError = new Error(detail)
      reject(immediateError)
      return
    }

    btn.click()
  })

  if (immediateError) {
    void promise.catch(() => {})
    return { ok: false, error: immediateError }
  }
  return { ok: true, promise }
}

export default function GoogleSignupButton({
  label,
  className,
  disabled,
  beforePopup,
  onToken,
  onError,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [sdkReady, setSdkReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    void loadGoogleSdk().then(
      () => {
        if (!cancelled) setSdkReady(true)
      },
      () => {
        if (!cancelled) setSdkReady(false)
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  function handleClick() {
    const clientIds = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '')
      .split(/[,\s]+/)
      .map((v) => v.trim())
      .filter(Boolean)
    if (clientIds.length === 0) {
      onError?.('VITE_GOOGLE_CLIENT_ID lipsește în frontend.')
      return
    }
    const mount = mountRef.current
    if (!mount) {
      onError?.('Google Sign-In nu a putut fi inițializat.')
      return
    }
    if (!window.google?.accounts?.id) {
      onError?.('Google se încarcă încă. Așteaptă o clipă și încearcă din nou.')
      return
    }

    if (beforePopup && !beforePopup()) {
      return
    }

    let lastError: unknown = null
    for (const clientId of clientIds) {
      const started = startGsiPopupFromRenderedButton(mount, clientId, onToken)
      if (started.ok) {
        void started.promise.catch((err) => {
          const msg = err instanceof Error ? err.message : 'Autentificarea cu Google a eșuat.'
          onError?.(msg)
        })
        return
      }
      lastError = started.error
      const message = started.error.message
      const retryable =
        message.includes('(unregistered_origin)') || message.includes('(invalid_client)')
      if (!retryable) {
        onError?.(message)
        return
      }
    }
    const msg =
      lastError instanceof Error ? lastError.message : 'Autentificarea cu Google a eșuat.'
    onError?.(msg)
  }

  return (
    <div className="relative w-full">
      {/* Off-screen host for GIS `renderButton`; programmatic click follows the visible button click. */}
      <div
        ref={mountRef}
        className="pointer-events-none fixed top-0 left-[-10000px] h-12 w-[min(100vw,360px)] overflow-hidden opacity-0"
        aria-hidden
      />
      <button
        type="button"
        disabled={disabled || !sdkReady}
        onClick={handleClick}
        className={className ?? defaultClassName}
      >
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {label}
      </button>
    </div>
  )
}
