import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Download,
  Loader2,
  PackagePlus,
  ShieldCheck,
  Truck,
  UserCheck,
  UserRound,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react'
import {
  WAREHOUSE_SN_FACTORY_PREFIX,
  downloadAdminWarehouseWarrantyCertificate,
  getAuthToken,
  type WarehouseItemHistoryEvent,
  type WarehouseSavedItemBySerial,
} from '../../lib/api'
import { formatWarehouseSerialDisplay, useWarehouseSerialLookup } from './warehouseQrScan'
import { formatWarehouseItemModel, warehouseItemLocationLabel } from './warehouseItemFormat'
import WarehouseSerialEntry from './WarehouseSerialEntry'

function formatDate(iso: string | null | undefined, withTime = false) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('ro-RO', withTime ? { dateStyle: 'short', timeStyle: 'short' } : { dateStyle: 'short' }).format(d)
}

function formatClientReceiptDate(raw: string | null | undefined) {
  const s = raw != null ? String(raw).trim() : ''
  if (!s) return '—'
  if (/^\d{4}-\d{2}-\d{2}/.test(s) || s.includes('T')) return formatDate(s)
  return s
}

const ENTRY_METHOD_LABELS: Record<string, string> = {
  qr_scan: 'Scanare cod QR',
  manual: 'Introducere manuală',
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-slate-500 font-['Inter']">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-semibold text-slate-900 font-['Inter']">{children}</dd>
    </div>
  )
}

function Section({ title, image, children }: { title: string; image?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mt-0 mb-4 text-sm font-bold uppercase tracking-wide text-slate-500 font-['Inter']">{title}</h2>
      <div className={image ? 'flex flex-col gap-4 sm:flex-row sm:items-start' : undefined}>
        {image}
        <dl className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2">{children}</dl>
      </div>
    </section>
  )
}

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <div className="flex aspect-square w-full max-w-[220px] shrink-0 items-center justify-center self-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-3 sm:w-44 sm:self-start">
      <img src={src} alt={alt} className="h-full w-full object-contain" loading="lazy" onError={() => setFailed(true)} />
    </div>
  )
}

function describeHistoryEvent(ev: WarehouseItemHistoryEvent): { title: string; icon: LucideIcon; tone: string } {
  switch (ev.type) {
    case 'warehouse_in':
      return { title: 'Intrare în depozit', icon: PackagePlus, tone: 'bg-emerald-100 text-emerald-700' }
    case 'moved':
      if (ev.location === 'distribuitor') {
        return { title: 'Ieșire din depozit către distribuitor', icon: Truck, tone: 'bg-sky-100 text-sky-700' }
      }
      if (ev.location === 'service') {
        return { title: 'Trimis în service', icon: Wrench, tone: 'bg-amber-100 text-amber-700' }
      }
      return { title: 'Ieșire din depozit către clientul final', icon: UserRound, tone: 'bg-indigo-100 text-indigo-700' }
    case 'client_registered':
      return { title: 'Înregistrat de client în cont', icon: UserCheck, tone: 'bg-violet-100 text-violet-700' }
    case 'warranty_generated':
      return { title: 'Certificat de garanție generat', icon: ShieldCheck, tone: 'bg-teal-100 text-teal-700' }
    default:
      return { title: ev.type, icon: PackagePlus, tone: 'bg-slate-100 text-slate-600' }
  }
}

function HistoryTimeline({ events }: { events: WarehouseItemHistoryEvent[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mt-0 mb-4 text-sm font-bold uppercase tracking-wide text-slate-500 font-['Inter']">Istoric</h2>
      {events.length === 0 ? (
        <p className="text-sm text-slate-500 font-['Inter']">Nu există evenimente înregistrate pentru această unitate.</p>
      ) : (
        <ol className="m-0 list-none p-0">
          {events.map((ev, i) => {
            const { title, icon: Icon, tone } = describeHistoryEvent(ev)
            const isLast = i === events.length - 1
            return (
              <li key={ev.id} className="relative flex gap-3 pb-5 last:pb-0">
                {!isLast && <span className="absolute left-4 top-9 bottom-0 w-px -translate-x-1/2 bg-slate-200" aria-hidden />}
                <span className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone}`}>
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 pt-1">
                  <p className="text-sm font-semibold text-slate-900 font-['Inter']">
                    {title}
                    {ev.name && <span className="font-normal text-slate-600"> — {ev.name}</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 font-['Inter']">
                    <time dateTime={ev.createdAt}>{formatDate(ev.createdAt, true)}</time>
                    {ev.actor && <> · de {ev.actor.name}</>}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

function ItemDetails({ item }: { item: WarehouseSavedItemBySerial }) {
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const account = item.clientAccount
  const accountName = account ? `${account.firstName} ${account.lastName}`.trim() : ''
  const location = String(item.location || 'depozit').trim()

  const downloadCertificate = async () => {
    setDownloading(true)
    setDownloadError(null)
    try {
      const { pdfBlob, filename } = await downloadAdminWarehouseWarrantyCertificate(item.id)
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : 'Eroare la descărcare.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Section
        title="Produs"
        image={
          item.productImage ? (
            <ProductImage src={item.productImage} alt={item.productTitle || item.modelNumber} />
          ) : undefined
        }
      >
        <Field label="Model">{formatWarehouseItemModel(item)}</Field>
        <Field label="Produs catalog">
          {item.productTitle || '—'}
          {item.productSku && <span className="ml-1 font-normal text-slate-500">({item.productSku})</span>}
        </Field>
        <Field label="Data fabricației">{item.producedOn || '—'}</Field>
        <Field label="Nr. articol">{item.itemNumber != null ? String(item.itemNumber).padStart(4, '0') : '—'}</Field>
      </Section>

      <HistoryTimeline events={item.history ?? []} />

      <Section title="Depozit">
        <Field label="Locație">{warehouseItemLocationLabel(item)}</Field>
        <Field label="Mod de înregistrare">
          {item.entryMethod ? ENTRY_METHOD_LABELS[item.entryMethod] ?? item.entryMethod : '—'}
        </Field>
        <Field label="Warehouse in">{formatDate(item.warehouseIn)}</Field>
        <Field label="Warehouse out">{formatDate(item.warehouseOut)}</Field>
      </Section>

      <Section title="Distribuție și client">
        <Field label="Distribuitor">{item.distributor || '—'}</Field>
        <Field label={location === 'service' ? 'Nume (service)' : 'Nume client'}>{item.clientName || '—'}</Field>
        <Field label="Cont client">
          {account ? (
            <>
              {accountName || '—'}
              <span className="block font-normal text-slate-500">{account.email}</span>
            </>
          ) : item.client ? (
            <span className="font-mono text-xs">{item.client}</span>
          ) : (
            '—'
          )}
        </Field>
        <Field label="Data recepției client">{formatClientReceiptDate(item.clientReceiptDate)}</Field>
      </Section>

      <Section title="Garanție">
        <Field label="Nr. certificat">{item.warrantyCertificateNumber || '—'}</Field>
        <Field label="Generat la">{formatDate(item.warrantyCertificateGeneratedAt, true)}</Field>
        {item.warrantyCertificateAvailable && (
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={() => void downloadCertificate()}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 font-['Inter'] hover:bg-slate-50 disabled:opacity-50"
            >
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
              Descarcă certificatul
            </button>
            {downloadError && <p className="mt-2 text-sm text-red-700 font-['Inter']">{downloadError}</p>}
          </div>
        )}
      </Section>

      <Section title="Înregistrare">
        <Field label="Creat la">{formatDate(item.createdAt, true)}</Field>
        <Field label="Actualizat la">{formatDate(item.updatedAt, true)}</Field>
      </Section>
    </div>
  )
}

export default function AdminStocuriSearch() {
  const navigate = useNavigate()
  const { serialBody, searching, item, notFound, error, lookup, clear } = useWarehouseSerialLookup()

  useEffect(() => {
    if (!getAuthToken()) navigate('/admin/login', { replace: true })
  }, [navigate])

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-4xl">
      <h1 className="text-2xl font-extrabold font-['Inter'] text-slate-900 mb-2">Search</h1>
      <p className="text-gray-500 text-sm font-['Inter'] mb-8">
        Scanează codul QR sau introdu manual numărul de serie pentru a vedea toate detaliile unității.
      </p>

      <div className="space-y-6">
        <WarehouseSerialEntry onSerial={(digits) => void lookup(digits)} busy={searching} />

        {(serialBody || searching) && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-live="polite">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 font-['Inter']">Număr serie</p>
                <p className="mt-1 font-mono text-sm font-bold tabular-nums text-slate-900 sm:text-2xl">
                  {formatWarehouseSerialDisplay(WAREHOUSE_SN_FACTORY_PREFIX, serialBody) || '—'}
                </p>
              </div>
              {!searching && (
                <button
                  type="button"
                  onClick={clear}
                  className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Șterge căutarea"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              )}
            </div>
            {searching && (
              <p className="mt-3 flex items-center gap-2 text-sm text-slate-600 font-['Inter']">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Se caută în stocuri…
              </p>
            )}
            {notFound && (
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 font-['Inter']">
                Numărul de serie nu există în stocuri.
              </p>
            )}
            {error && (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 font-['Inter']" role="alert">
                {error}
              </p>
            )}
          </div>
        )}

        {item && <ItemDetails key={item.id} item={item} />}
      </div>
    </div>
  )
}
