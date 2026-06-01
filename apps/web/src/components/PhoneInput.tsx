interface Country {
  code: string
  dialCode: string
}

const COUNTRIES: Country[] = [
  { code: 'RO', dialCode: '+40' },
  { code: 'AF', dialCode: '+93' },
  { code: 'AL', dialCode: '+355' },
  { code: 'DZ', dialCode: '+213' },
  { code: 'AD', dialCode: '+376' },
  { code: 'AO', dialCode: '+244' },
  { code: 'AR', dialCode: '+54' },
  { code: 'AM', dialCode: '+374' },
  { code: 'AU', dialCode: '+61' },
  { code: 'AT', dialCode: '+43' },
  { code: 'AZ', dialCode: '+994' },
  { code: 'BH', dialCode: '+973' },
  { code: 'BD', dialCode: '+880' },
  { code: 'BY', dialCode: '+375' },
  { code: 'BE', dialCode: '+32' },
  { code: 'BZ', dialCode: '+501' },
  { code: 'BJ', dialCode: '+229' },
  { code: 'BT', dialCode: '+975' },
  { code: 'BO', dialCode: '+591' },
  { code: 'BA', dialCode: '+387' },
  { code: 'BW', dialCode: '+267' },
  { code: 'BR', dialCode: '+55' },
  { code: 'BN', dialCode: '+673' },
  { code: 'BG', dialCode: '+359' },
  { code: 'BF', dialCode: '+226' },
  { code: 'BI', dialCode: '+257' },
  { code: 'KH', dialCode: '+855' },
  { code: 'CM', dialCode: '+237' },
  { code: 'CA', dialCode: '+1' },
  { code: 'CV', dialCode: '+238' },
  { code: 'CF', dialCode: '+236' },
  { code: 'TD', dialCode: '+235' },
  { code: 'CL', dialCode: '+56' },
  { code: 'CN', dialCode: '+86' },
  { code: 'CO', dialCode: '+57' },
  { code: 'KM', dialCode: '+269' },
  { code: 'CG', dialCode: '+242' },
  { code: 'CD', dialCode: '+243' },
  { code: 'CR', dialCode: '+506' },
  { code: 'HR', dialCode: '+385' },
  { code: 'CU', dialCode: '+53' },
  { code: 'CY', dialCode: '+357' },
  { code: 'CZ', dialCode: '+420' },
  { code: 'DK', dialCode: '+45' },
  { code: 'DJ', dialCode: '+253' },
  { code: 'DO', dialCode: '+1809' },
  { code: 'EC', dialCode: '+593' },
  { code: 'EG', dialCode: '+20' },
  { code: 'SV', dialCode: '+503' },
  { code: 'GQ', dialCode: '+240' },
  { code: 'ER', dialCode: '+291' },
  { code: 'EE', dialCode: '+372' },
  { code: 'ET', dialCode: '+251' },
  { code: 'FJ', dialCode: '+679' },
  { code: 'FI', dialCode: '+358' },
  { code: 'FR', dialCode: '+33' },
  { code: 'GA', dialCode: '+241' },
  { code: 'GM', dialCode: '+220' },
  { code: 'GE', dialCode: '+995' },
  { code: 'DE', dialCode: '+49' },
  { code: 'GH', dialCode: '+233' },
  { code: 'GR', dialCode: '+30' },
  { code: 'GT', dialCode: '+502' },
  { code: 'GN', dialCode: '+224' },
  { code: 'GW', dialCode: '+245' },
  { code: 'GY', dialCode: '+592' },
  { code: 'HT', dialCode: '+509' },
  { code: 'HN', dialCode: '+504' },
  { code: 'HK', dialCode: '+852' },
  { code: 'HU', dialCode: '+36' },
  { code: 'IS', dialCode: '+354' },
  { code: 'IN', dialCode: '+91' },
  { code: 'ID', dialCode: '+62' },
  { code: 'IR', dialCode: '+98' },
  { code: 'IQ', dialCode: '+964' },
  { code: 'IE', dialCode: '+353' },
  { code: 'IL', dialCode: '+972' },
  { code: 'IT', dialCode: '+39' },
  { code: 'JM', dialCode: '+1876' },
  { code: 'JP', dialCode: '+81' },
  { code: 'JO', dialCode: '+962' },
  { code: 'KZ', dialCode: '+7' },
  { code: 'KE', dialCode: '+254' },
  { code: 'KW', dialCode: '+965' },
  { code: 'KG', dialCode: '+996' },
  { code: 'LA', dialCode: '+856' },
  { code: 'LV', dialCode: '+371' },
  { code: 'LB', dialCode: '+961' },
  { code: 'LS', dialCode: '+266' },
  { code: 'LR', dialCode: '+231' },
  { code: 'LY', dialCode: '+218' },
  { code: 'LI', dialCode: '+423' },
  { code: 'LT', dialCode: '+370' },
  { code: 'LU', dialCode: '+352' },
  { code: 'MO', dialCode: '+853' },
  { code: 'MK', dialCode: '+389' },
  { code: 'MG', dialCode: '+261' },
  { code: 'MW', dialCode: '+265' },
  { code: 'MY', dialCode: '+60' },
  { code: 'MV', dialCode: '+960' },
  { code: 'ML', dialCode: '+223' },
  { code: 'MT', dialCode: '+356' },
  { code: 'MR', dialCode: '+222' },
  { code: 'MX', dialCode: '+52' },
  { code: 'MD', dialCode: '+373' },
  { code: 'MC', dialCode: '+377' },
  { code: 'MN', dialCode: '+976' },
  { code: 'ME', dialCode: '+382' },
  { code: 'MA', dialCode: '+212' },
  { code: 'MZ', dialCode: '+258' },
  { code: 'MM', dialCode: '+95' },
  { code: 'NA', dialCode: '+264' },
  { code: 'NP', dialCode: '+977' },
  { code: 'NL', dialCode: '+31' },
  { code: 'NZ', dialCode: '+64' },
  { code: 'NI', dialCode: '+505' },
  { code: 'NE', dialCode: '+227' },
  { code: 'NG', dialCode: '+234' },
  { code: 'NO', dialCode: '+47' },
  { code: 'OM', dialCode: '+968' },
  { code: 'PK', dialCode: '+92' },
  { code: 'PA', dialCode: '+507' },
  { code: 'PG', dialCode: '+675' },
  { code: 'PY', dialCode: '+595' },
  { code: 'PE', dialCode: '+51' },
  { code: 'PH', dialCode: '+63' },
  { code: 'PL', dialCode: '+48' },
  { code: 'PT', dialCode: '+351' },
  { code: 'QA', dialCode: '+974' },
  { code: 'RS', dialCode: '+381' },
  { code: 'RU', dialCode: '+7' },
  { code: 'RW', dialCode: '+250' },
  { code: 'SA', dialCode: '+966' },
  { code: 'SN', dialCode: '+221' },
  { code: 'SC', dialCode: '+248' },
  { code: 'SL', dialCode: '+232' },
  { code: 'SG', dialCode: '+65' },
  { code: 'SK', dialCode: '+421' },
  { code: 'SI', dialCode: '+386' },
  { code: 'SO', dialCode: '+252' },
  { code: 'ZA', dialCode: '+27' },
  { code: 'KR', dialCode: '+82' },
  { code: 'SS', dialCode: '+211' },
  { code: 'ES', dialCode: '+34' },
  { code: 'LK', dialCode: '+94' },
  { code: 'SD', dialCode: '+249' },
  { code: 'SR', dialCode: '+597' },
  { code: 'SE', dialCode: '+46' },
  { code: 'CH', dialCode: '+41' },
  { code: 'SY', dialCode: '+963' },
  { code: 'TW', dialCode: '+886' },
  { code: 'TJ', dialCode: '+992' },
  { code: 'TZ', dialCode: '+255' },
  { code: 'TH', dialCode: '+66' },
  { code: 'TL', dialCode: '+670' },
  { code: 'TG', dialCode: '+228' },
  { code: 'TT', dialCode: '+1868' },
  { code: 'TN', dialCode: '+216' },
  { code: 'TR', dialCode: '+90' },
  { code: 'TM', dialCode: '+993' },
  { code: 'UG', dialCode: '+256' },
  { code: 'UA', dialCode: '+380' },
  { code: 'AE', dialCode: '+971' },
  { code: 'GB', dialCode: '+44' },
  { code: 'US', dialCode: '+1' },
  { code: 'UY', dialCode: '+598' },
  { code: 'UZ', dialCode: '+998' },
  { code: 'VE', dialCode: '+58' },
  { code: 'VN', dialCode: '+84' },
  { code: 'YE', dialCode: '+967' },
  { code: 'ZM', dialCode: '+260' },
  { code: 'ZW', dialCode: '+263' },
]

// Pre-sorted by dial code length descending so longest prefix matches first
const SORTED = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length)

const DEFAULT: Country = { code: 'RO', dialCode: '+40' }

function detectCountry(value: string): Country {
  if (!value || !value.startsWith('+')) return DEFAULT
  if (/^\d{9}$/.test(value)) return DEFAULT
  for (const c of SORTED) {
    if (value.startsWith(c.dialCode)) return c
  }
  return DEFAULT
}

function sanitize(raw: string): string {
  if (!raw) return ''
  const plus = raw.startsWith('+')
  const digits = raw.replace(/\D/g, '')
  return (plus ? '+' : '') + digits.slice(0, 15)
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

  const shell = error
    ? 'flex h-12 w-full items-stretch overflow-hidden rounded-xl border border-red-400 ring-1 ring-red-400 bg-white'
    : 'flex h-12 w-full items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400'

  return (
    <div className={shell}>
      <span className="flex shrink-0 select-none items-center border-r border-slate-200 bg-slate-50 px-3.5 text-xs font-bold tracking-wide text-slate-500">
        {country.code}
      </span>
      <input
        type="tel"
        autoComplete={autoComplete}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(sanitize(e.target.value))}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-0 bg-transparent px-3.5 text-sm font-['Inter'] text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
      />
    </div>
  )
}
