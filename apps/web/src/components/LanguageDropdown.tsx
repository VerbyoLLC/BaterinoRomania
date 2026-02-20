import { LANGUAGES } from '../i18n/menu'

type LanguageEntry = (typeof LANGUAGES)[number]

export function LanguageDropdown({
  current,
  isOpen,
  onToggle,
  onSelect,
}: {
  current: LanguageEntry
  isOpen: boolean
  onToggle: () => void
  onSelect: (lang: LanguageEntry) => void
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
        aria-label="Select language"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`block w-full text-left px-4 py-2 text-sm ${current.code === lang.code ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
              onClick={() => { onSelect(lang); onToggle(); }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
