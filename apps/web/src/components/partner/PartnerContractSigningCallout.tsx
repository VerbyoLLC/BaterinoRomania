import { Download } from 'lucide-react'

type PartnerContractSigningCalloutProps = {
  title: string
  subtitle: string
  signButtonLabel: string
  readPdfLabel: string
  onSignClick: () => void
  onReadPdfClick: () => void
  readingPdf?: boolean
  className?: string
  /** Stack for narrow catalog sidebar (~23rem). */
  variant?: 'default' | 'sidebar'
}

function ContractSignIcon() {
  return (
    <svg
      width="28"
      height="28"
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

function CalloutIcon({ size = 'default' }: { size?: 'default' | 'sidebar' }) {
  if (size === 'sidebar') {
    return (
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[17px] bg-gradient-to-br from-[#3b6bff] to-[#1e46b4] text-white">
        <ContractSignIcon />
      </div>
    )
  }
  return (
    <div className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[15px] bg-gradient-to-br from-[#3b6bff] to-[#1e46b4] text-white sm:h-[60px] sm:w-[60px] sm:rounded-[17px]">
      <ContractSignIcon />
    </div>
  )
}

function SidebarCalloutCopy({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative min-w-0 w-full">
      <h3 className="m-0 text-lg font-bold leading-snug tracking-[-0.02em] text-[#0a0e1a]">
        {title}
      </h3>
      <p className="m-0 mt-2 break-words text-sm leading-[1.6] text-[#56607a]">{subtitle}</p>
    </div>
  )
}

function CalloutCopy({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative min-w-0 flex-1">
      <h3 className="m-0 text-base font-bold leading-snug tracking-[-0.01em] text-[#0a0e1a] sm:text-[17px]">
        {title}
      </h3>
      <p className="m-0 mt-1.5 break-words text-[12.5px] leading-[1.55] text-[#56607a]">{subtitle}</p>
    </div>
  )
}

function CalloutActions({
  signButtonLabel,
  readPdfLabel,
  onSignClick,
  onReadPdfClick,
  readingPdf,
  fullWidth = false,
}: {
  signButtonLabel: string
  readPdfLabel: string
  onSignClick: () => void
  onReadPdfClick: () => void
  readingPdf: boolean
  fullWidth?: boolean
}) {
  return (
    <div className={`relative flex shrink-0 flex-col items-stretch gap-2 ${fullWidth ? 'w-full' : 'w-full sm:w-auto'}`}>
      <button
        type="button"
        onClick={onSignClick}
        className={`group inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-[13px] border-0 bg-gradient-to-br from-[#2a5bff] to-[#1e46b4] px-6 py-3.5 font-bold text-white transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2a5bff]/50 focus-visible:ring-offset-2 ${fullWidth ? 'text-[15px]' : 'text-sm'}`}
      >
        {signButtonLabel}
        <span className="transition-transform group-hover:translate-x-1" aria-hidden>
          →
        </span>
      </button>
      <button
        type="button"
        onClick={onReadPdfClick}
        disabled={readingPdf}
        className={`inline-flex items-center justify-center gap-1.5 self-center px-0.5 font-semibold text-[#1e46b4] transition hover:underline disabled:cursor-wait disabled:opacity-60 ${fullWidth ? 'text-sm' : 'text-xs'}`}
      >
        <Download className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
        {readingPdf ? '…' : readPdfLabel}
      </button>
    </div>
  )
}

export function PartnerContractSigningCallout({
  title,
  subtitle,
  signButtonLabel,
  readPdfLabel,
  onSignClick,
  onReadPdfClick,
  readingPdf = false,
  className = '',
  variant = 'default',
}: PartnerContractSigningCalloutProps) {
  const shellClass =
    'relative rounded-[20px] border border-[#e1e8f6] bg-gradient-to-br from-[#f3f7ff] to-[#eef2fc] p-5'

  if (variant === 'sidebar') {
    return (
      <div className={`relative mt-0 w-full min-w-0 ${className}`.trim()}>
        <div className={`${shellClass} flex w-full min-w-0 flex-col gap-5 p-6`}>
          <div className="flex min-w-0 flex-col items-start gap-4">
            <CalloutIcon size="sidebar" />
            <SidebarCalloutCopy title={title} subtitle={subtitle} />
          </div>
          <CalloutActions
            signButtonLabel={signButtonLabel}
            readPdfLabel={readPdfLabel}
            onSignClick={onSignClick}
            onReadPdfClick={onReadPdfClick}
            readingPdf={readingPdf}
            fullWidth
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className || 'mt-5'}`.trim()}>
      <div
        className={`${shellClass} flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5 sm:p-6`}
      >
        <CalloutIcon />
        <CalloutCopy title={title} subtitle={subtitle} />
        <CalloutActions
          signButtonLabel={signButtonLabel}
          readPdfLabel={readPdfLabel}
          onSignClick={onSignClick}
          onReadPdfClick={onReadPdfClick}
          readingPdf={readingPdf}
        />
      </div>
    </div>
  )
}
