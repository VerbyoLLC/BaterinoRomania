import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface Country {
  code: string
  name: string
  dialCode: string
  flag: string
}

// Romania first, then EU + common international countries
const COUNTRIES: Country[] = [
  { code: 'RO', name: 'România', dialCode: '+40', flag: '🇷🇴' },
  { code: 'AL', name: 'Albania', dialCode: '+355', flag: '🇦🇱' },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹' },
  { code: 'BE', name: 'Belgia', dialCode: '+32', flag: '🇧🇪' },
  { code: 'BG', name: 'Bulgaria', dialCode: '+359', flag: '🇧🇬' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'CH', name: 'Elveția', dialCode: '+41', flag: '🇨🇭' },
  { code: 'CY', name: 'Cipru', dialCode: '+357', flag: '🇨🇾' },
  { code: 'CZ', name: 'Cehia', dialCode: '+420', flag: '🇨🇿' },
  { code: 'DE', name: 'Germania', dialCode: '+49', flag: '🇩🇪' },
  { code: 'DK', name: 'Danemarca', dialCode: '+45', flag: '🇩🇰' },
  { code: 'EE', name: 'Estonia', dialCode: '+372', flag: '🇪🇪' },
  { code: 'ES', name: 'Spania', dialCode: '+34', flag: '🇪🇸' },
  { code: 'FI', name: 'Finlanda', dialCode: '+358', flag: '🇫🇮' },
  { code: 'FR', name: 'Franța', dialCode: '+33', flag: '🇫🇷' },
  { code: 'GB', name: 'Marea Britanie', dialCode: '+44', flag: '🇬🇧' },
  { code: 'GR', name: 'Grecia', dialCode: '+30', flag: '🇬🇷' },
  { code: 'HR', name: 'Croația', dialCode: '+385', flag: '🇭🇷' },
  { code: 'HU', name: 'Ungaria', dialCode: '+36', flag: '🇭🇺' },
  { code: 'IE', name: 'Irlanda', dialCode: '+353', flag: '🇮🇪' },
  { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱' },
  { code: 'IT', name: 'Italia', dialCode: '+39', flag: '🇮🇹' },
  { code: 'LT', name: 'Lituania', dialCode: '+370', flag: '🇱🇹' },
  { code: 'LU', name: 'Luxemburg', dialCode: '+352', flag: '🇱🇺' },
  { code: 'LV', name: 'Letonia', dialCode: '+371', flag: '🇱🇻' },
  { code: 'MD', name: 'Moldova', dialCode: '+373', flag: '🇲🇩' },
  { code: 'MK', name: 'Macedonia de Nord', dialCode: '+389', flag: '🇲🇰' },
  { code: 'MT', name: 'Malta', dialCode: '+356', flag: '🇲🇹' },
  { code: 'NL', name: 'Olanda', dialCode: '+31', flag: '🇳🇱' },
  { code: 'NO', name: 'Norvegia', dialCode: '+47', flag: '🇳🇴' },
  { code: 'PL', name: 'Polonia', dialCode: '+48', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugalia', dialCode: '+351', flag: '🇵🇹' },
  { code: 'RS', name: 'Serbia', dialCode: '+381', flag: '🇷🇸' },
  { code: 'SE', name: 'Suedia', dialCode: '+46', flag: '🇸🇪' },
  { code: 'SI', name: 'Slovenia', dialCode: '+386', flag: '🇸🇮' },
  { code: 'SK', name: 'Slovacia', dialCode: '+421', flag: '🇸🇰' },
  { code: 'TR', name: 'Turcia', dialCode: '+90', flag: '🇹🇷' },
  { code: 'UA', name: 'Ucraina', dialCode: '+380', flag: '🇺🇦' },
  { code: 'AE', name: 'Emiratele Arabe Unite', dialCode: '+971', flag: '🇦🇪' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'US', name: 'SUA', dialCode: '+1', flag: '🇺🇸' },
]

const DEFAULT_COUNTRY = COUNTRIES[0]

function parseE164(value: string): { country: Country; localDigits: string } {
  if (!value) return { country: DEFAULT_COUNTRY, localDigits: '' }

  // Backward compat: exactly 9 digits → legacy Romanian mobile (stored without country code)
  if (/^\d{9}$/.test(value)) {
    return { country: DEFAULT_COUNTRY, localDigits: value }
  }

  if (!value.startsWith('+')) {
    return { country: DEFAULT_COUNTRY, localDigits: value.replace(/\D/g, '') }
  }

  // Match longest dial code first to avoid e.g. +3 (none) matching before +358 (Finland)
  const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length)
  for (const c of sorted) {
    if (value.startsWith(c.dialCode)) {
      return { country: c, localDigits: value.slice(c.dialCode.length).replace(/\D/g, '') }
    }
  }

  return { country: DEFAULT_COUNTRY, localDigits: value.replace(/\D/g, '') }
}

export function buildE164(country: Country, localDigits: string): string {
  if (!localDigits) return ''
  return `${country.dialCode}${localDigits}`
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
  placeholder = '7XX XXX XXX',
  error = false,
  disabled = false,
  autoComplete = 'tel',
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: PhoneInputProps) {
  const { country, localDigits } = parseE164(value)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 10)
  }, [open])

  const filtered = search.trim()
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dialCode.includes(search) ||
          c.code.toLowerCase().includes(search.toLowerCase()),
      )
    : COUNTRIES

  function selectCountry(c: Country) {
    onChange(buildE164(c, localDigits))
    setOpen(false)
    setSearch('')
    setTimeout(() => inputRef.current?.focus(), 10)
  }

  function handleLocalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 15)
    onChange(buildE164(country, digits))
  }

  const shellBase = 'flex h-12 w-full items-stretch overflow-hidden rounded-xl border bg-white transition-shadow'
  const shellClass = error
    ? `${shellBase} border-red-400 ring-1 ring-red-400`
    : `${shellBase} border-slate-200 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400`

  return (
    <div className="relative" ref={containerRef}>
      <div className={shellClass}>
        {/* Country selector */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => { setOpen((o) => !o); setSearch('') }}
          className="flex shrink-0 items-center gap-1.5 border-r border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          aria-label="Selectează țara"
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className="select-none text-base leading-none">{country.flag}</span>
          <span className="tabular-nums">{country.dialCode}</span>
          <ChevronDown
            size={12}
            className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Local number */}
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          autoComplete={autoComplete}
          disabled={disabled}
          value={localDigits}
          onChange={handleLocalChange}
          placeholder={placeholder}
          className="min-w-0 flex-1 border-0 bg-transparent px-3.5 text-sm font-['Inter'] text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 p-2">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută țara…"
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-['Inter'] outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
              onKeyDown={(e) => {
                if (e.key === 'Escape') { setOpen(false); setSearch('') }
                if (e.key === 'Enter' && filtered.length === 1) selectCountry(filtered[0])
              }}
            />
          </div>
          <ul className="max-h-56 overflow-y-auto p-1" role="listbox">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-slate-400 font-['Inter']">Nicio țară găsită.</li>
            )}
            {filtered.map((c) => (
              <li key={c.code} role="option" aria-selected={c.code === country.code}>
                <button
                  type="button"
                  onClick={() => selectCountry(c)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 font-['Inter'] ${
                    c.code === country.code ? 'bg-slate-100 font-semibold' : ''
                  }`}
                >
                  <span className="select-none text-base leading-none">{c.flag}</span>
                  <span className="flex-1 text-slate-800">{c.name}</span>
                  <span className="text-xs tabular-nums text-slate-400">{c.dialCode}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
