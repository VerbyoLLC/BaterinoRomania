import { useState } from 'react'

type Props = {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  hasError?: boolean
  required?: boolean
  autoComplete?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  onFocus?: () => void
  inputClassName?: string
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-6.5 0-10-8-10-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c6.5 0 10 8 10 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
    </svg>
  )
}

export default function PasswordInput({
  placeholder = 'Introdu parola',
  value,
  onChange,
  hasError = false,
  required,
  autoComplete,
  inputMode,
  onFocus,
  inputClassName,
}: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onFocus={onFocus}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-11 pl-4 pr-11 border rounded-[10px] text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
          hasError
            ? 'border-red-400 focus:ring-red-400'
            : 'border-gray-300 focus:ring-slate-900'
        } ${inputClassName ?? ''}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ascunde parola' : 'Arată parola'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
      >
        <EyeIcon open={visible} />
      </button>
    </div>
  )
}
