type Props = {
  label: string
  /** Optional; defaults to checkout-style button */
  className?: string
  disabled?: boolean
  onToken: (idToken: string) => Promise<void>
  onError?: (message: string) => void
}

const defaultClassName =
  'flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold font-[\'Inter\'] text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'

const GOOGLE_SCRIPT_ID = 'google-identity-services'

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (opts: Record<string, unknown>) => void
          prompt: (momentListener?: (notification: any) => void) => void
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

export default function GoogleSignupButton({ label, className, disabled, onToken, onError }: Props) {
  async function handleClick() {
    const clientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim()
    if (!clientId) {
      throw new Error('VITE_GOOGLE_CLIENT_ID lipsește în frontend.')
    }
    await loadGoogleSdk()
    await new Promise<void>((resolve, reject) => {
      const api = window.google?.accounts?.id
      if (!api) {
        reject(new Error('Google Identity Services nu este disponibil.'))
        return
      }
      let done = false
      const timeout = window.setTimeout(() => {
        if (done) return
        done = true
        reject(new Error('Nu ai selectat un cont Google.'))
      }, 30000)
      api.initialize({
        client_id: clientId,
        ux_mode: 'popup',
        context: 'signin',
        auto_select: false,
        use_fedcm_for_prompt: true,
        itp_support: true,
        callback: async (resp: { credential?: string }) => {
          if (done) return
          done = true
          window.clearTimeout(timeout)
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
      api.prompt((notification: any) => {
        if (done) return
        // Prompt could not be displayed (popup blocked, browser policy, origin mismatch, etc.)
        if (typeof notification?.isNotDisplayed === 'function' && notification.isNotDisplayed()) {
          done = true
          window.clearTimeout(timeout)
          const reason =
            typeof notification?.getNotDisplayedReason === 'function'
              ? String(notification.getNotDisplayedReason() || '').trim()
              : ''
          reject(
            new Error(
              reason
                ? `Google Sign-In nu a putut fi afișat (${reason}).`
                : 'Google Sign-In nu a putut fi afișat în acest browser.',
            ),
          )
          return
        }
        // Google skipped prompt (user not eligible in current context / browser state)
        if (typeof notification?.isSkippedMoment === 'function' && notification.isSkippedMoment()) {
          done = true
          window.clearTimeout(timeout)
          reject(new Error('Google Sign-In nu este disponibil momentan. Încearcă din nou.'))
          return
        }
        // User explicitly closed/cancelled the chooser.
        if (typeof notification?.isDismissedMoment === 'function' && notification.isDismissedMoment()) {
          const reason =
            typeof notification?.getDismissedReason === 'function'
              ? String(notification.getDismissedReason() || '').trim()
              : ''
          if (reason === 'credential_returned') return
          done = true
          window.clearTimeout(timeout)
          reject(new Error('Autentificare Google anulată.'))
        }
      })
    })
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        void handleClick().catch((err) => {
          const msg = err instanceof Error ? err.message : 'Autentificarea cu Google a eșuat.'
          onError?.(msg)
        })
      }}
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
  )
}
