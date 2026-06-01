interface Country {
  code: string
  name: string
  dialCode: string
  flag: string
}

// Romania first; US before CA so +1 resolves to US flag
const COUNTRIES: Country[] = [
  { code: 'RO', name: 'România',           dialCode: '+40',  flag: '🇷🇴' },
  { code: 'US', name: 'SUA',               dialCode: '+1',   flag: '🇺🇸' },
  { code: 'CA', name: 'Canada',            dialCode: '+1',   flag: '🇨🇦' },
  { code: 'AL', name: 'Albania',           dialCode: '+355', flag: '🇦🇱' },
  { code: 'AT', name: 'Austria',           dialCode: '+43',  flag: '🇦🇹' },
  { code: 'BE', name: 'Belgia',            dialCode: '+32',  flag: '🇧🇪' },
  { code: 'BG', name: 'Bulgaria',          dialCode: '+359', flag: '🇧🇬' },
  { code: 'CH', name: 'Elveția',           dialCode: '+41',  flag: '🇨🇭' },
  { code: 'CY', name: 'Cipru',             dialCode: '+357', flag: '🇨🇾' },
  { code: 'CZ', name: 'Cehia',             dialCode: '+420', flag: '🇨🇿' },
  { code: 'DE', name: 'Germania',          dialCode: '+49',  flag: '🇩🇪' },
  { code: 'DK', name: 'Danemarca',         dialCode: '+45',  flag: '🇩🇰' },
  { code: 'EE', name: 'Estonia',           dialCode: '+372', flag: '🇪🇪' },
  { code: 'ES', name: 'Spania',            dialCode: '+34',  flag: '🇪🇸' },
  { code: 'FI', name: 'Finlanda',          dialCode: '+358', flag: '🇫🇮' },
  { code: 'FR', name: 'Franța',            dialCode: '+33',  flag: '🇫🇷' },
  { code: 'GB', name: 'Marea Britanie',    dialCode: '+44',  flag: '🇬🇧' },
  { code: 'GR', name: 'Grecia',            dialCode: '+30',  flag: '🇬🇷' },
  { code: 'HR', name: 'Croația',           dialCode: '+385', flag: '🇭🇷' },
  { code: 'HU', name: 'Ungaria',           dialCode: '+36',  flag: '🇭🇺' },
  { code: 'IE', name: 'Irlanda',           dialCode: '+353', flag: '🇮🇪' },
  { code: 'IL', name: 'Israel',            dialCode: '+972', flag: '🇮🇱' },
  { code: 'IT', name: 'Italia',            dialCode: '+39',  flag: '🇮🇹' },
  { code: 'LT', name: 'Lituania',          dialCode: '+370', flag: '🇱🇹' },
  { code: 'LU', name: 'Luxemburg',         dialCode: '+352', flag: '🇱🇺' },
  { code: 'LV', name: 'Letonia',           dialCode: '+371', flag: '🇱🇻' },
  { code: 'MD', name: 'Moldova',           dialCode: '+373', flag: '🇲🇩' },
  { code: 'MK', name: 'Macedonia de Nord', dialCode: '+389', flag: '🇲🇰' },
  { code: 'MT', name: 'Malta',             dialCode: '+356', flag: '🇲🇹' },
  { code: 'NL', name: 'Olanda',            dialCode: '+31',  flag: '🇳🇱' },
  { code: 'NO', name: 'Norvegia',          dialCode: '+47',  flag: '🇳🇴' },
  { code: 'PL', name: 'Polonia',           dialCode: '+48',  flag: '🇵🇱' },
  { code: 'PT', name: 'Portugalia',        dialCode: '+351', flag: '🇵🇹' },
  { code: 'RS', name: 'Serbia',            dialCode: '+381', flag: '🇷🇸' },
  { code: 'SE', name: 'Suedia',            dialCode: '+46',  flag: '🇸🇪' },
  { code: 'SI', name: 'Slovenia',          dialCode: '+386', flag: '🇸🇮' },
  { code: 'SK', name: 'Slovacia',          dialCode: '+421', flag: '🇸🇰' },
  { code: 'TR', name: 'Turcia',            dialCode: '+90',  flag: '🇹🇷' },
  { code: 'UA', name: 'Ucraina',           dialCode: '+380', flag: '🇺🇦' },
  { code: 'AE', name: 'Emiratele Arabe',   dialCode: '+971', flag: '🇦🇪' },
  { code: 'AU', name: 'Australia',         dialCode: '+61',  flag: '🇦🇺' },
]

// Pre-sorted by dial code length descending (longest match wins)
const SORTED_COUNTRIES = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length)

const DEFAULT_COUNTRY = COUNTRIES[0] // România

/** Detect country from a full E.164 value or legacy 9-digit Romanian number. */
function detectCountry(value: string): Country {
  if (!value) return DEFAULT_COUNTRY
  if (/^\d{9}$/.test(value)) return DEFAULT_COUNTRY  // legacy bare Romanian digits
  if (!value.startsWith('+')) return DEFAULT_COUNTRY
  for (const c of SORTED_COUNTRIES) {
    if (value.startsWith(c.dialCode)) return c
  }
  return DEFAULT_COUNTRY
}

/** Sanitize raw input: keep only a leading + and digits, max E.164 length. */
function sanitizePhoneInput(raw: string): string {
  if (!raw) return ''
  const hasPlus = raw.startsWith('+')
  const digits = raw.replace(/\D/g, '')
  const result = (hasPlus ? '+' : '') + digits
  return result.slice(0, 16) // + and up to 15 digits (E.164 max)
}

export interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: boolean
  disabled?: boolean
  autoComplete?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

export default function PhoneInput({
  value,
  onChange,
  placeholder = '+40 7XX XXX XXX',
  error = false,
  disabled = false,
  autoComplete = 'tel',
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: PhoneInputProps) {
  const country = detectCountry(value)

  const shellBase = 'flex h-12 w-full items-stretch overflow-hidden rounded-xl border bg-white transition-shadow'
  const shellClass = error
    ? `${shellBase} border-red-400 ring-1 ring-red-400`
    : `${shellBase} border-slate-200 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400`

  return (
    <div className={shellClass}>
      {/* Auto-detected country indicator — shows 2-letter code, works on all platforms */}
      <span className="flex shrink-0 select-none items-center border-r border-slate-200 bg-slate-50 px-3.5 text-xs font-bold tracking-wide text-slate-500">
        {country.code}
      </span>

      {/* Full number input — user types +countrycode followed by local digits */}
      <input
        type="tel"
        autoComplete={autoComplete}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(sanitizePhoneInput(e.target.value))}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-0 bg-transparent px-3.5 text-sm font-['Inter'] text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
      />
    </div>
  )
}
