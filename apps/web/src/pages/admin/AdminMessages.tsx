import { useEffect, useState } from 'react'
import { getAdminInquiries, markInquiryRead, type AdminInquiry } from '../../lib/api'

const DOMAIN_LABELS: Record<string, string> = {
  rezidential: 'Rezidențial',
  industrial: 'Industrial',
  medical: 'Medical',
  maritim: 'Maritim',
}

const REQUEST_TYPE_LABELS: Record<string, string> = {
  sales: 'Vânzări',
  technical: 'Tehnic',
  service: 'Service',
  partnership: 'Parteneriat',
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateShort(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' })
}

export default function AdminMessages() {
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = inquiries.find((i) => i.id === selectedId)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getAdminInquiries()
        if (!cancelled) {
          setInquiries(data)
          if (data.length > 0 && !selectedId) setSelectedId(data[0].id)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Eroare la încărcare.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleSelect = async (inquiry: AdminInquiry) => {
    setSelectedId(inquiry.id)
    if (!inquiry.isRead) {
      try {
        await markInquiryRead(inquiry.id)
        setInquiries((prev) =>
          prev.map((i) => (i.id === inquiry.id ? { ...i, isRead: true } : i))
        )
        window.dispatchEvent(new CustomEvent('admin-inquiries-updated'))
      } catch {
        // ignore
      }
    }
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col p-6 sm:p-8 lg:p-10">
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Messages</h1>
        <p className="text-gray-500 text-sm font-['Inter'] mb-6">Solicitări primite prin formularul de contact.</p>
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex items-center justify-center">
          <p className="text-gray-500">Se încarcă...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8 lg:p-10">
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Messages</h1>
        <p className="text-red-600 text-sm font-['Inter']">{error}</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col lg:h-[calc(100vh-0px)]">
      <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900">Messages</h1>
        <p className="text-gray-500 text-sm font-['Inter'] mt-0.5">Solicitări primite prin formularul de contact.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left: message list (email inbox style) */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50/50 overflow-y-auto max-h-60 lg:max-h-none">
          {inquiries.length === 0 ? (
            <div className="p-6 text-gray-500 text-sm font-['Inter'] text-center">
              Nu există mesaje.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {inquiries.map((inquiry) => (
                <li key={inquiry.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(inquiry)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors ${
                      selectedId === inquiry.id ? 'bg-white shadow-sm border-l-2 border-l-slate-900' : ''
                    } ${!inquiry.isRead ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 truncate">{inquiry.name}</p>
                        <p className="text-sm text-gray-600 truncate">{inquiry.email}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {DOMAIN_LABELS[inquiry.domain] || inquiry.domain}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 tabular-nums flex-shrink-0">
                        {formatDateShort(inquiry.createdAt)}
                      </span>
                    </div>
                    {!inquiry.isRead && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Nou
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right: message content */}
        <div className="flex-1 min-w-0 overflow-y-auto bg-white">
          {selected ? (
            <div className="p-6 sm:p-8 lg:p-10 max-w-4xl">
              <div className="border-b border-gray-200 pb-6 mb-6">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                  <h2 className="text-xl font-bold text-slate-900">{selected.name}</h2>
                  {!selected.isRead && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Nou
                    </span>
                  )}
                </div>
                <a
                  href={`mailto:${selected.email}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {selected.email}
                </a>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                  <span><strong>Companie:</strong> {selected.company}</span>
                  <span><strong>Divizie:</strong> {DOMAIN_LABELS[selected.domain] || selected.domain}</span>
                  <span><strong>Tip:</strong> {REQUEST_TYPE_LABELS[selected.requestType] || selected.requestType}</span>
                  {selected.registrationNumber && (
                    <span><strong>Nr. înreg.:</strong> {selected.registrationNumber}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {formatDateTime(selected.createdAt)}
                </p>
              </div>

              <div className="prose prose-slate max-w-none">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Mesaj</h3>
                <div className="text-gray-700 whitespace-pre-wrap font-['Inter'] leading-relaxed">
                  {selected.message}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <p className="text-sm font-['Inter']">Selectează un mesaj pentru a-l citi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
