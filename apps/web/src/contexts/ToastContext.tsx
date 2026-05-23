import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { X } from 'lucide-react'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export type ToastOptions = {
  message: string
  variant?: ToastVariant
  /** Auto-dismiss after ms (default by variant). Pass 0 to keep until dismissed. */
  durationMs?: number
}

type ToastItem = {
  id: string
  message: string
  variant: ToastVariant
}

const DEFAULT_DURATION: Record<ToastVariant, number> = {
  success: 4500,
  error: 9000,
  info: 5000,
  warning: 7000,
}

const VARIANT_STYLES: Record<
  ToastVariant,
  { wrap: string; icon: string; live: 'polite' | 'assertive' }
> = {
  success: {
    wrap: 'border-emerald-200/90 bg-emerald-50 text-emerald-950 shadow-emerald-900/10',
    icon: 'text-emerald-600',
    live: 'polite',
  },
  error: {
    wrap: 'border-red-200/90 bg-red-50 text-red-950 shadow-red-900/10',
    icon: 'text-red-600',
    live: 'assertive',
  },
  info: {
    wrap: 'border-slate-200/90 bg-white text-slate-900 shadow-slate-900/10',
    icon: 'text-[#1e46b4]',
    live: 'polite',
  },
  warning: {
    wrap: 'border-amber-200/90 bg-amber-50 text-amber-950 shadow-amber-900/10',
    icon: 'text-amber-600',
    live: 'assertive',
  },
}

type ToastContextValue = {
  showToast: (options: ToastOptions) => string
  success: (message: string, durationMs?: number) => string
  error: (message: string, durationMs?: number) => string
  info: (message: string, durationMs?: number) => string
  warning: (message: string, durationMs?: number) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function newToastId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed top-4 right-4 left-4 z-[200] flex flex-col items-stretch gap-2 sm:left-auto sm:max-w-md sm:items-end"
      aria-label="Notificări"
    >
      {toasts.map((t) => {
        const styles = VARIANT_STYLES[t.variant]
        return (
          <div
            key={t.id}
            role={t.variant === 'error' || t.variant === 'warning' ? 'alert' : 'status'}
            aria-live={styles.live}
            className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border px-4 py-3 text-sm font-['Inter'] leading-snug shadow-lg animate-[toast-in_0.22s_ease-out] ${styles.wrap}`}
          >
            <p className="min-w-0 flex-1 pt-0.5">{t.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className={`shrink-0 rounded-md p-1 opacity-70 transition hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400/40 ${styles.icon}`}
              aria-label="Închide notificarea"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    ({ message, variant = 'info', durationMs }: ToastOptions): string => {
      const trimmed = String(message ?? '').trim()
      if (!trimmed) return ''

      const id = newToastId()
      const v = variant
      setToasts((prev) => [...prev, { id, message: trimmed, variant: v }])

      const ms = durationMs ?? DEFAULT_DURATION[v]
      if (ms > 0) {
        window.setTimeout(() => dismiss(id), ms)
      }
      return id
    },
    [dismiss],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      dismiss,
      success: (message, durationMs) => showToast({ message, variant: 'success', durationMs }),
      error: (message, durationMs) => showToast({ message, variant: 'error', durationMs }),
      info: (message, durationMs) => showToast({ message, variant: 'info', durationMs }),
      warning: (message, durationMs) => showToast({ message, variant: 'warning', durationMs }),
    }),
    [showToast, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return ctx
}
