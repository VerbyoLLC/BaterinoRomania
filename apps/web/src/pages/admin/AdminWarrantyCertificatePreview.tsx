import { useMemo, useRef, useState } from 'react'
import { Printer, RotateCcw } from 'lucide-react'
import {
  buildWarrantyCertificateHtml,
  getWarrantyCertificateSampleValues,
  WARRANTY_CERTIFICATE_FIELDS,
  type WarrantyCertificateFieldDef,
  type WarrantyCertificateValues,
} from '../../lib/warrantyCertificateTemplate'

const GROUP_LABELS: Record<WarrantyCertificateFieldDef['group'], string> = {
  produs: 'Date produs',
  furnizor: 'Furnizor / Importator',
  beneficiar: 'Beneficiar (distribuitor)',
  utilizator: 'Utilizator final (client)',
  garantie: 'Condiții de garanție',
  semnaturi: 'Semnături',
}

const GROUP_ORDER: WarrantyCertificateFieldDef['group'][] = [
  'produs',
  'furnizor',
  'beneficiar',
  'utilizator',
  'garantie',
  'semnaturi',
]

export default function AdminWarrantyCertificatePreview() {
  const initialValues = useMemo<WarrantyCertificateValues>(
    () => getWarrantyCertificateSampleValues(),
    [],
  )
  const [values, setValues] = useState<WarrantyCertificateValues>(initialValues)
  const [highlight, setHighlight] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const html = useMemo(
    () => buildWarrantyCertificateHtml(values, { highlight }),
    [values, highlight],
  )

  const fieldsByGroup = useMemo(() => {
    const map = new Map<WarrantyCertificateFieldDef['group'], WarrantyCertificateFieldDef[]>()
    for (const f of WARRANTY_CERTIFICATE_FIELDS) {
      const list = map.get(f.group) ?? []
      list.push(f)
      map.set(f.group, list)
    }
    return map
  }, [])

  const handleReset = () => setValues(initialValues)

  const handlePrint = () => {
    const win = iframeRef.current?.contentWindow
    if (!win) return
    win.focus()
    win.print()
  }

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 font-['Inter'] sm:text-3xl">
            Certificat de garanție – Preview
          </h1>
          <p className="mt-1 text-sm text-slate-600 font-['Inter']">
            Atribuie surse de date pentru fiecare câmp din șablonul PDF.
            Folosit la „Generează certificat de garanție” din contul clientului.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 font-['Inter']">
            <input
              type="checkbox"
              checked={highlight}
              onChange={(e) => setHighlight(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-400"
            />
            Evidențiază câmpurile
          </label>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 font-['Inter']"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Reset valori
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 font-['Inter']"
          >
            <Printer className="h-4 w-4" aria-hidden />
            Print / PDF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 font-['Inter']">
            <span className="font-semibold text-slate-800">{WARRANTY_CERTIFICATE_FIELDS.length}</span>{' '}
            câmpuri dinamice. Editează valorile mai jos pentru a verifica
            randarea fiecărui placeholder.
          </div>

          {GROUP_ORDER.map((group) => {
            const items = fieldsByGroup.get(group) ?? []
            if (items.length === 0) return null
            return (
              <section
                key={group}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <header className="border-b border-slate-100 px-4 py-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-['Inter']">
                    {GROUP_LABELS[group]}
                  </h2>
                </header>
                <div className="space-y-3 px-4 py-4">
                  {items.map((f) => (
                    <div key={f.key}>
                      <div className="flex items-baseline justify-between gap-2">
                        <label
                          htmlFor={`field-${f.key}`}
                          className="text-sm font-semibold text-slate-900 font-['Inter']"
                        >
                          {f.label}
                        </label>
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 font-mono">
                          {`{{${f.key}}}`}
                        </code>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 font-['Inter']">
                        Sursă: <span className="text-slate-700">{f.source}</span>
                      </p>
                      <input
                        id={`field-${f.key}`}
                        type="text"
                        value={values[f.key]}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                        }
                        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 font-['Inter']"
                        autoComplete="off"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </aside>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
          <iframe
            ref={iframeRef}
            srcDoc={html}
            title="Preview certificat de garanție"
            className="block h-[1200px] w-full border-0 bg-white"
          />
        </div>
      </div>
    </div>
  )
}
