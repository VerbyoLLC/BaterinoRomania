import { Check, ChevronRight, FileSignature, FileText, Loader2, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getPartnerDashboardTranslations } from '../../i18n/partner/dashboard'
import type { PartnerProfile } from '../../lib/api'
import { getPartnerProfile, openPartnerContractPreview, signPartnerContract } from '../../lib/api'

function ContractSignIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7" />
      <path d="M14 3v5h5" />
      <path d="M16.5 16.5l4-4a1.4 1.4 0 0 1 2 2l-4 4-2.6.6.6-2.6z" />
    </svg>
  )
}

const inputClass =
  'w-full rounded-[10px] border border-[#e6eaf2] px-3 py-[11px] text-[13.5px] text-[#0a0e1a] outline-none transition placeholder:text-[#b6becc] focus:border-[#1e46b4] focus:ring-[3px] focus:ring-[rgba(30,70,180,0.13)]'

function formatPartnerCompanyAddress(
  profile: Pick<PartnerProfile, 'companyStreet' | 'companyCity' | 'companyCounty' | 'companyPostalCode' | 'address'>,
): string {
  const parts = [profile.companyStreet, profile.companyCity, profile.companyCounty, profile.companyPostalCode]
    .map((s) => String(s ?? '').trim())
    .filter(Boolean)
  if (parts.length) return parts.join(', ')
  return String(profile.address ?? '').trim()
}

function ContractFieldSkeleton({ wide = false }: { wide?: boolean }) {
  return (
    <div className={wide ? 'mb-[13px]' : 'mb-[13px] flex-1'}>
      <div className="mb-[5px] h-3 w-16 animate-pulse rounded bg-[#e6eaf2]" aria-hidden />
      <div className="h-[42px] w-full animate-pulse rounded-[10px] bg-[#e6eaf2]" aria-hidden />
    </div>
  )
}

function ContractFormSkeleton({ ariaLabel }: { ariaLabel: string }) {
  return (
    <div className="pointer-events-none select-none" aria-busy="true" aria-label={ariaLabel}>
      <div className="my-4 h-[52px] w-full animate-pulse rounded-[11px] bg-[#e6eaf2]" aria-hidden />
      <div className="mb-4 h-[58px] w-full animate-pulse rounded-[11px] bg-[#e6eaf2]" aria-hidden />
      <div className="flex gap-[11px]">
        <ContractFieldSkeleton />
        <ContractFieldSkeleton />
      </div>
      <ContractFieldSkeleton wide />
    </div>
  )
}

export function PartnerContractSigningModal({
  onClose,
  onSigned,
}: {
  onClose: () => void
  onSigned?: () => void
}) {
  const { language } = useLanguage()
  const tr = getPartnerDashboardTranslations(language.code)

  const [profileLoading, setProfileLoading] = useState(true)
  const [companyName, setCompanyName] = useState('')
  const [cui, setCui] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState('')
  const [agree, setAgree] = useState(false)

  const [signing, setSigning] = useState(false)
  const [signError, setSignError] = useState('')
  const [done, setDone] = useState(false)
  const [openingPdf, setOpeningPdf] = useState(false)

  useEffect(() => {
    let cancelled = false
    getPartnerProfile()
      .then((p) => {
        if (cancelled) return
        setCompanyName(String(p?.companyName || '').trim())
        setCui(String(p?.cui || '').trim())
        setCompanyAddress(formatPartnerCompanyAddress(p))
        setFirstName(String(p?.contactFirstName || '').trim())
        setLastName(String(p?.contactLastName || '').trim())
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setProfileLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const canSign = useMemo(
    () => Boolean(firstName.trim() && lastName.trim() && role.trim() && agree && !signing && !profileLoading),
    [firstName, lastName, role, agree, signing, profileLoading],
  )

  const handleReadPdf = useCallback(async () => {
    if (openingPdf || profileLoading) return
    setOpeningPdf(true)
    try {
      await openPartnerContractPreview()
    } catch (err) {
      console.error(err)
    } finally {
      setOpeningPdf(false)
    }
  }, [openingPdf, profileLoading])

  async function handleSign() {
    if (!canSign) return
    setSigning(true)
    setSignError('')
    try {
      await signPartnerContract({
        contactFirstName: firstName.trim(),
        contactLastName: lastName.trim(),
        signerRole: role.trim(),
      })
      setDone(true)
      onSigned?.()
    } catch (err) {
      setSignError(err instanceof Error ? err.message : 'Eroare la semnare.')
    } finally {
      setSigning(false)
    }
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="partner-contract-signing-heading"
    >
      <div
        className="absolute inset-0 bg-[rgba(15,22,40,0.55)] backdrop-blur-[2px]"
        aria-hidden
        onMouseDown={(e) => {
          e.preventDefault()
          onClose()
        }}
      />
      <div className="relative z-10 w-full max-w-[460px] overflow-hidden rounded-[20px] bg-white shadow-[0_30px_70px_rgba(8,14,30,0.4)]">
        <div className="flex items-center justify-between border-b border-[#eff2f8] px-[22px] py-[18px]">
          <div className="flex items-center gap-2 text-[17px] font-extrabold tracking-[-0.01em] text-[#0a0e1a]">
            BATERINO
            <span className="rounded-md bg-[#0a0e1a] px-[7px] py-[3px] text-[11px] font-extrabold tracking-[0.06em] text-white">
              PRO
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tr.contractSigningCloseAria}
            className="rounded-[7px] border-0 bg-transparent p-1 leading-none text-[#9aa3b5] transition hover:bg-[#f3f5fa] hover:text-[#0a0e1a]"
          >
            <X className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>
        </div>

        {done ? (
          <div className="px-6 py-[34px] pb-[30px] text-center">
            <div className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f7f0] text-[#15a05f]">
              <Check className="h-7 w-7" strokeWidth={2.4} aria-hidden />
            </div>
            <h3 id="partner-contract-signing-heading" className="m-0 mb-1.5 text-lg font-bold text-[#0a0e1a]">
              {tr.contractSigningDoneTitle}
            </h3>
            <p className="mx-auto m-0 max-w-[280px] text-[13px] leading-normal text-[#6b7488]">
              {tr.contractSigningDoneBody(firstName.trim())}
            </p>
          </div>
        ) : (
          <>
            <div className="px-[22px] pb-0 pt-[22px]">
              <div className="mb-1.5 flex items-start gap-[13px]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-[#3b6bff] to-[#1e46b4] text-white">
                  <ContractSignIcon />
                </div>
                <div className="min-w-0">
                  <h2 id="partner-contract-signing-heading" className="m-0 text-lg font-bold tracking-[-0.01em] text-[#0a0e1a]">
                    {tr.contractSigningModalTitle}
                  </h2>
                  <p className="m-0 mt-0.5 text-[12.5px] leading-snug text-[#6b7488]">{tr.contractSigningModalSubtitle}</p>
                </div>
              </div>

              {profileLoading ? (
                <ContractFormSkeleton ariaLabel={tr.contractSigningLoadingAria} />
              ) : (
                <>
                  {companyName ? (
                    <div className="my-4 rounded-[11px] border border-[#e6eaf2] bg-[#f6f8fc] px-[13px] py-[11px] text-xs text-[#46506b]">
                      <p className="m-0 leading-relaxed">
                        {tr.contractSigningSignAs
                          .replace('{company}', companyName)
                          .replace('{cui}', cui || '—')
                          .split(companyName)
                          .map((part, i, arr) =>
                            i < arr.length - 1 ? (
                              <span key={i}>
                                {part}
                                <strong className="font-semibold text-[#0a0e1a]">{companyName}</strong>
                              </span>
                            ) : (
                              <span key={i}>{part}</span>
                            ),
                          )}
                      </p>
                      {companyAddress ? (
                        <p className="m-0 mt-1.5 text-[11.5px] leading-snug text-[#6b7488]">{companyAddress}</p>
                      ) : null}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => void handleReadPdf()}
                    disabled={openingPdf}
                    className="mb-4 flex w-full items-center gap-3 rounded-[12px] border-2 border-[#1e46b4]/30 bg-gradient-to-r from-[#eef3ff] to-[#e8f0ff] px-3.5 py-3 text-left shadow-[0_2px_10px_rgba(30,70,180,0.08)] transition hover:border-[#1e46b4]/55 hover:from-[#e4ebff] hover:to-[#dce8ff] disabled:cursor-wait disabled:opacity-70"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#1e46b4] text-white shadow-[0_2px_8px_rgba(30,70,180,0.35)]">
                      {openingPdf ? (
                        <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden />
                      ) : (
                        <FileText className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-bold leading-tight text-[#0a0e1a]">
                        {tr.contractSigningCalloutReadPdf}
                      </span>
                      <span className="mt-0.5 block text-[11.5px] leading-snug text-[#5a6478]">
                        {tr.contractSigningReadPdfHint}
                      </span>
                    </span>
                    {!openingPdf ? (
                      <ChevronRight className="h-[18px] w-[18px] shrink-0 text-[#1e46b4]" strokeWidth={2.2} aria-hidden />
                    ) : null}
                  </button>

                  <div className="flex gap-[11px]">
                    <div className="mb-[13px] flex-1">
                      <label htmlFor="contract-sign-first" className="mb-[5px] block text-[11.5px] font-semibold text-[#6b7488]">
                        {tr.contractSigningFirstNameLabel}
                      </label>
                      <input
                        id="contract-sign-first"
                        type="text"
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder={tr.contractSigningFirstNameLabel}
                        className={inputClass}
                        disabled={signing}
                      />
                    </div>
                    <div className="mb-[13px] flex-1">
                      <label htmlFor="contract-sign-last" className="mb-[5px] block text-[11.5px] font-semibold text-[#6b7488]">
                        {tr.contractSigningLastNameLabel}
                      </label>
                      <input
                        id="contract-sign-last"
                        type="text"
                        autoComplete="family-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder={tr.contractSigningLastNameLabel}
                        className={inputClass}
                        disabled={signing}
                      />
                    </div>
                  </div>

                  <div className="mb-[13px]">
                    <label htmlFor="contract-sign-role" className="mb-[5px] block text-[11.5px] font-semibold text-[#6b7488]">
                      {tr.contractSigningRoleLabel}
                    </label>
                    <input
                      id="contract-sign-role"
                      type="text"
                      autoComplete="organization-title"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder={tr.contractSigningRolePlaceholder}
                      className={inputClass}
                      disabled={signing}
                    />
                  </div>
                </>
              )}

              <label className={`mb-1 mt-1.5 flex items-start gap-[11px] ${profileLoading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  disabled={profileLoading || signing}
                  className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded-md border-[1.5px] border-[#cbd2e0] text-[#1e46b4] focus:ring-[#1e46b4]/20 disabled:cursor-not-allowed"
                />
                <span className="text-[13px] leading-snug text-[#0a0e1a]">{tr.contractSigningAgreePrefix}</span>
              </label>

              <p className="m-0 mt-3 text-[10.5px] leading-normal text-[#9aa3b5]">
                {profileLoading ? (
                  <span className="block h-8 w-full max-w-[320px] animate-pulse rounded bg-[#eef1f7]" aria-hidden />
                ) : (
                  tr.contractSigningFineprint(companyName || 'compania ta')
                )}
              </p>

              {signError ? (
                <p className="mt-3 mb-0 text-sm text-red-600" role="alert">
                  {signError}
                </p>
              ) : null}
            </div>

            <div className="px-[22px] pb-[22px] pt-4">
              <button
                type="button"
                onClick={() => void handleSign()}
                disabled={!canSign}
                className="flex w-full items-center justify-center gap-2 rounded-[13px] border-0 bg-[#0a0e1a] px-4 py-3.5 text-[14.5px] font-bold text-white transition enabled:hover:bg-[#1a2138] disabled:cursor-not-allowed disabled:bg-[#c7ced9] disabled:text-white"
              >
                {signing ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <FileSignature className="h-4 w-4" strokeWidth={2} aria-hidden />
                )}
                {signing ? tr.contractSigningSigning : tr.contractSigningSignButton}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
