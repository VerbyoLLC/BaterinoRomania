import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import SEO from '../components/SEO'
import { useLanguage } from '../contexts/LanguageContext'
import { useSeoPage } from '../contexts/SeoConfigContext'
import { getVerificareGarantieTranslations } from '../i18n/verificare-garantie'
import {
  extractWarrantyVerifyTokenFromPaste,
  fetchWarrantyVerify,
  isValidWarehouseSerialNumber,
  normalizeWarehouseSerialNumber,
  parseWarehouseQrSerial,
} from '../lib/api'

type WarrantyDialogState =
  | null
  | { phase: 'loading' }
  | { phase: 'found'; brand: string | null; title: string; modelNumber: string; imageUrl: string | null }
  | { phase: 'not_found' }
  | { phase: 'error'; message: string }

export default function VerificareGarantie() {
  const { language } = useLanguage()
  const tr = getVerificareGarantieTranslations(language.code)
  const seo = useSeoPage('garantie')
  const [searchParams] = useSearchParams()
  const [serialNumber, setSerialNumber] = useState('')
  const [dialog, setDialog] = useState<WarrantyDialogState>(null)
  const [verifyInProgress, setVerifyInProgress] = useState(false)
  /** Ultimul `sn:…` sau `t:…` pentru care am pornit verificarea automată din URL (QR certificat). */
  const lastAutoVerifiedFromUrlRef = useRef<string | null>(null)

  const closeDialog = useCallback(() => {
    setDialog(null)
  }, [])

  const runVerify = useCallback(
    async (rawInput: string) => {
      const t = getVerificareGarantieTranslations(language.code)
      const trimmed = rawInput.trim()
      if (!trimmed) return
      const pastedToken = extractWarrantyVerifyTokenFromPaste(trimmed)
      const extracted = parseWarehouseQrSerial(trimmed) || trimmed
      const sn = normalizeWarehouseSerialNumber(extracted)
      if (!pastedToken && !isValidWarehouseSerialNumber(sn)) {
        setDialog({ phase: 'error', message: t.invalidSerial })
        return
      }
      setDialog({ phase: 'loading' })
      setVerifyInProgress(true)
      try {
        const r = pastedToken ? await fetchWarrantyVerify({ token: pastedToken }) : await fetchWarrantyVerify(sn)
        if (!r.ok) {
          setDialog({
            phase: 'error',
            message: r.rateLimited
              ? t.rateLimited
              : r.invalidToken
                ? t.invalidToken
                : r.tokenNotConfigured
                  ? t.tokenNotConfigured
                  : r.invalidSerial
                    ? t.invalidSerial
                    : r.error || t.genericError,
          })
          return
        }
        if (r.data.found) {
          setDialog({
            phase: 'found',
            brand: r.data.brand,
            title: r.data.title,
            modelNumber: r.data.modelNumber,
            imageUrl: r.data.imageUrl,
          })
        } else {
          setDialog({ phase: 'not_found' })
        }
      } catch {
        setDialog({ phase: 'error', message: t.genericError })
      } finally {
        setVerifyInProgress(false)
      }
    },
    [language.code],
  )

  /* QR certificat: ?t=… (semnat) sau ?sn=…; lipire URL cu t= sau SN. */
  useEffect(() => {
    const tRaw = (searchParams.get('t') || searchParams.get('token') || '').trim()
    const snRaw = (searchParams.get('sn') || searchParams.get('SN') || '').trim()
    if (!tRaw && !snRaw) {
      lastAutoVerifiedFromUrlRef.current = null
      return
    }
    if (tRaw) {
      setSerialNumber('')
      const key = `t:${tRaw}`
      if (lastAutoVerifiedFromUrlRef.current === key) return
      lastAutoVerifiedFromUrlRef.current = key
      void runVerify(tRaw)
      return
    }
    setSerialNumber(snRaw)
    const extracted = parseWarehouseQrSerial(snRaw) || snRaw
    const normalized = normalizeWarehouseSerialNumber(extracted)
    if (!isValidWarehouseSerialNumber(normalized)) return
    const key = `sn:${normalized}`
    if (lastAutoVerifiedFromUrlRef.current === key) return
    lastAutoVerifiedFromUrlRef.current = key
    void runVerify(snRaw)
  }, [searchParams, runVerify])

  useEffect(() => {
    if (!dialog) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDialog()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dialog, closeDialog])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void runVerify(serialNumber)
  }

  const modal =
    dialog && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
            role="presentation"
            onClick={() => dialog.phase !== 'loading' && closeDialog()}
          >
            <div
              className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-xl sm:max-h-[85vh] sm:rounded-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="warranty-verify-dialog-title"
              aria-busy={dialog.phase === 'loading'}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0 border-b border-slate-100 px-5 pb-4 pt-5 text-center">
                <img
                  src="/images/shared/baterino-logo-black.svg"
                  alt="Baterino"
                  className="mx-auto h-9 w-auto object-contain"
                />
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4">
                {dialog.phase === 'loading' ? (
                  <>
                    <h2 id="warranty-verify-dialog-title" className="sr-only">
                      {tr.loading}
                    </h2>
                    <div className="flex flex-col items-center">
                      <div
                        className="mb-4 size-28 shrink-0 animate-pulse rounded-xl bg-slate-200 sm:size-32"
                        aria-hidden
                      />
                      <div
                        className="mb-2 h-4 w-[min(100%,8rem)] max-w-full animate-pulse rounded-md bg-slate-200"
                        aria-hidden
                      />
                      <div
                        className="mb-2 h-6 w-[min(100%,14rem)] max-w-full animate-pulse rounded-md bg-slate-200"
                        aria-hidden
                      />
                      <div
                        className="mb-4 h-4 w-[min(100%,10rem)] max-w-full animate-pulse rounded-md bg-slate-200"
                        aria-hidden
                      />
                      <div
                        className="h-4 w-[min(100%,9rem)] max-w-full animate-pulse rounded-md bg-emerald-100"
                        aria-hidden
                      />
                    </div>
                  </>
                ) : dialog.phase === 'found' ? (
                  <>
                    <div className="mx-auto mb-4 size-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 sm:size-32">
                      {dialog.imageUrl ? (
                        <img
                          src={dialog.imageUrl}
                          alt={dialog.title || tr.productFallbackAlt}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                          <span className="text-xs font-['Inter'] sm:text-sm">{tr.productFallbackAlt}</span>
                        </div>
                      )}
                    </div>
                    {dialog.brand ? (
                      <p className="mb-1 m-0 text-center text-xs font-medium uppercase tracking-wide text-slate-500 font-['Inter']">
                        {tr.brandLabel}:{' '}
                        <span className="font-semibold text-slate-700 normal-case">{dialog.brand}</span>
                      </p>
                    ) : null}
                    <h2
                      id="warranty-verify-dialog-title"
                      className="m-0 text-center text-lg font-bold text-slate-900 font-['Inter']"
                    >
                      {dialog.title}
                    </h2>
                    <p className="mt-1 text-center text-sm text-slate-600 font-['Inter']">
                      {tr.modelLabel}: <span className="font-semibold text-slate-800">{dialog.modelNumber}</span>
                    </p>
                    <p className="mt-4 text-center text-base font-bold text-emerald-600 font-['Inter']">
                      {tr.warrantyActive}
                    </p>
                  </>
                ) : dialog.phase === 'not_found' ? (
                  <>
                    <h2
                      id="warranty-verify-dialog-title"
                      className="m-0 text-center text-lg font-bold text-slate-900 font-['Inter']"
                    >
                      {tr.notFoundTitle}
                    </h2>
                    <p className="mt-3 text-center text-sm leading-relaxed text-slate-600 font-['Inter']">
                      {tr.notFoundBody}
                    </p>
                    <p className="mt-4 text-center text-sm leading-relaxed text-slate-500 font-['Inter']">
                      {tr.contactHint}
                    </p>
                  </>
                ) : (
                  <>
                    <h2
                      id="warranty-verify-dialog-title"
                      className="m-0 text-center text-lg font-bold text-slate-900 font-['Inter']"
                    >
                      {tr.errorTitle}
                    </h2>
                    <p className="mt-3 text-center text-sm leading-relaxed text-slate-600 font-['Inter']">
                      {dialog.message}
                    </p>
                  </>
                )}
              </div>

              {dialog.phase !== 'loading' ? (
                <div className="shrink-0 border-t border-slate-100 px-5 py-4">
                  <button
                    type="button"
                    className="h-11 w-full rounded-xl bg-slate-900 text-sm font-bold text-white hover:bg-slate-800 font-['Inter']"
                    onClick={closeDialog}
                  >
                    {tr.modalClose}
                  </button>
                </div>
              ) : null}
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <SEO
        title={seo.title || tr.pageTitle}
        description={seo.description || tr.pageDescription}
        canonical="/verificare-garantie"
        ogTitle={seo.ogTitle || undefined}
        ogDescription={seo.ogDescription || undefined}
        ogImage={seo.ogImage || undefined}
        lang={language.code}
      />

      <section className="max-w-content mx-auto px-4 py-14 sm:py-16">
        <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-extrabold text-slate-900 font-['Inter'] sm:text-3xl">{tr.pageTitle}</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 font-['Inter'] sm:text-base">
            {tr.pageDescription}
          </p>
          <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
            <label htmlFor="warranty-sn" className="sr-only">
              {tr.serialLabel}
            </label>
            <input
              id="warranty-sn"
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder={tr.placeholder}
              autoComplete="off"
              disabled={verifyInProgress}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 font-['Inter'] disabled:cursor-wait disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={verifyInProgress}
              aria-busy={verifyInProgress}
              aria-label={verifyInProgress ? tr.loading : tr.submit}
              className="inline-flex h-11 min-w-[8.5rem] shrink-0 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-wait font-['Inter'] disabled:hover:bg-slate-900"
            >
              {verifyInProgress ? (
                <span className="flex flex-col items-center justify-center gap-1.5" aria-hidden>
                  <span className="h-2 w-14 animate-pulse rounded-sm bg-white/35" />
                  <span className="h-2 w-10 animate-pulse rounded-sm bg-white/25" />
                </span>
              ) : (
                tr.submit
              )}
            </button>
          </form>
        </div>
      </section>
      {modal}
    </>
  )
}
