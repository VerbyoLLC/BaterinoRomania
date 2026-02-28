import { useState, useRef } from 'react'

const MAX_IMAGES = 5
const DOCUMENTE_COUNT = 4

export default function AdminProducts() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const docFileInputRef = useRef<HTMLInputElement>(null)
  const docUploadIndexRef = useRef(0)
  const [panelOpen, setPanelOpen] = useState(false)
  const [isClosingPanel, setIsClosingPanel] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<{ file: File; preview: string }[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [tipProdus, setTipProdus] = useState<'rezidential' | 'industrial'>('rezidential')
  const [capacitate, setCapacitate] = useState('')
  const [capacitateNominala, setCapacitateNominala] = useState('')
  const [cicluriDescarcare, setCicluriDescarcare] = useState('')
  const [compatibilitate, setCompatibilitate] = useState('')
  const [dimensiuni, setDimensiuni] = useState('')
  const [greutate, setGreutate] = useState('')
  const [temperaturaOperare, setTemperaturaOperare] = useState('')
  const [documenteTehnice, setDocumenteTehnice] = useState<{ descriere: string; file: File | null }[]>(
    () => Array(DOCUMENTE_COUNT).fill(null).map(() => ({ descriere: '', file: null }))
  )

  const handleOpenPanel = () => {
    setTitle('')
    setDescription('')
    setTipProdus('rezidential')
    setCapacitate('')
    setCapacitateNominala('')
    setCicluriDescarcare('')
    setCompatibilitate('')
    setDimensiuni('')
    setGreutate('')
    setTemperaturaOperare('')
    setDocumenteTehnice(Array(DOCUMENTE_COUNT).fill(null).map(() => ({ descriere: '', file: null })))
    images.forEach(({ preview }) => URL.revokeObjectURL(preview))
    setImages([])
    setPanelOpen(true)
  }

  const addImages = (files: FileList | null) => {
    if (!files?.length) return
    const newEntries: { file: File; preview: string }[] = []
    for (let i = 0; i < files.length && images.length + newEntries.length < MAX_IMAGES; i++) {
      const f = files[i]
      if (f?.type.startsWith('image/')) {
        newEntries.push({ file: f, preview: URL.createObjectURL(f) })
      }
    }
    setImages((prev) => [...prev, ...newEntries].slice(0, MAX_IMAGES))
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = [...prev]
      URL.revokeObjectURL(next[index].preview)
      next.splice(index, 1)
      return next
    })
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addImages(e.dataTransfer.files)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => setIsDragging(false)

  const setDocumentDescriere = (index: number, descriere: string) => {
    setDocumenteTehnice((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], descriere }
      return next
    })
  }

  const setDocumentFile = (index: number, file: File | null) => {
    setDocumenteTehnice((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], file }
      return next
    })
  }

  const removeDocumentFile = (index: number) => {
    setDocumentFile(index, null)
  }

  const triggerDocUpload = (index: number) => {
    docUploadIndexRef.current = index
    docFileInputRef.current?.click()
  }

  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = docUploadIndexRef.current
    const file = e.target.files?.[0]
    if (file?.type === 'application/pdf') {
      setDocumentFile(index, file)
    }
    e.target.value = ''
  }

  const handleClosePanel = () => {
    setIsClosingPanel(true)
  }

  const handlePanelTransitionEnd = (e: React.TransitionEvent) => {
    if (e.target !== e.currentTarget) return
    if (isClosingPanel) {
      images.forEach(({ preview }) => URL.revokeObjectURL(preview))
      setImages([])
      setPanelOpen(false)
      setIsClosingPanel(false)
    }
  }

  const handleSave = () => {
    // TODO: save product
    handleClosePanel()
  }

  const panelVisible = panelOpen || isClosingPanel

  return (
    <div className={`flex flex-col w-full min-h-0 ${panelVisible ? 'h-[calc(100vh-4rem)] lg:h-screen overflow-hidden' : ''}`}>
      {/* Tab bar — full width */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white shrink-0">
        <h1 className="text-xl font-bold font-['Inter'] text-black">Produse</h1>
        {!panelVisible && (
          <button
            type="button"
            onClick={handleOpenPanel}
            className="h-9 px-5 bg-slate-900 text-white rounded-lg text-sm font-semibold font-['Inter'] hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        )}
      </div>

      {/* Content: list left, panel right (slides from left) */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: product list — half screen */}
        <div className={`w-1/2 min-w-0 shrink-0 p-5 overflow-y-auto ${panelVisible ? 'overflow-hidden' : ''}`}>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <p className="text-gray-500 text-sm font-['Inter']">
              Lista de produse va fi afișată aici. Funcționalitate în curând.
            </p>
          </div>
        </div>

        {/* Right: panel area — panel slides in from left */}
        <div className="w-1/2 shrink-0 overflow-hidden border-l border-gray-200 bg-white overflow-y-auto">
          <div
            className={`w-full min-h-full p-6 sm:p-8 shadow-lg transition-transform duration-300 ease-out ${
              isClosingPanel ? '-translate-x-full' : panelOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            onTransitionEnd={handlePanelTransitionEnd}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold font-['Inter'] text-black">Adaugă produs</h2>
              <button
                type="button"
                onClick={handleClosePanel}
                className="text-gray-500 hover:text-slate-900 p-1"
                aria-label="Închide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSave()
              }}
              className="flex flex-col gap-5"
            >
              {/* Tip Produs */}
              <div>
                <label className="block text-sm font-bold font-['Inter'] text-gray-900 mb-3">Tip Produs</label>
                <p className="text-xs text-gray-500 mb-2">Determină template-ul folosit la afișare.</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipProdus"
                      value="rezidential"
                      checked={tipProdus === 'rezidential'}
                      onChange={() => setTipProdus('rezidential')}
                      className="w-4 h-4 border-gray-300 text-slate-600 focus:ring-slate-500"
                    />
                    <span className="text-sm font-medium font-['Inter'] text-gray-700">Rezidential</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipProdus"
                      value="industrial"
                      checked={tipProdus === 'industrial'}
                      onChange={() => setTipProdus('industrial')}
                      className="w-4 h-4 border-gray-300 text-slate-600 focus:ring-slate-500"
                    />
                    <span className="text-sm font-medium font-['Inter'] text-gray-700">Industrial</span>
                  </label>
                </div>
              </div>

              {/* Descriere Produs */}
              <div className="pt-2 border-t border-gray-200">
                <h3 className="text-sm font-bold font-['Inter'] text-gray-900 mb-4">Descriere Produs</h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="product-title" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
                      Titlu
                    </label>
                    <input
                      id="product-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: EcoHome 5 kWh"
                      className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-description" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
                      Descriere
                    </label>
                    <textarea
                      id="product-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descrierea produsului..."
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* Detalii produs */}
              <div className="pt-2 border-t border-gray-200">
                <h3 className="text-sm font-bold font-['Inter'] text-gray-900 mb-4">Detalii produs:</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <div>
                    <label htmlFor="product-capacitate" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
                      Capacitate:
                    </label>
                    <input
                      id="product-capacitate"
                      type="text"
                      value={capacitate}
                      onChange={(e) => setCapacitate(e.target.value)}
                      placeholder="Ex: 5 kWh"
                      className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-capacitate-nominala" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
                      Capacitate nominală:
                    </label>
                    <input
                      id="product-capacitate-nominala"
                      type="text"
                      value={capacitateNominala}
                      onChange={(e) => setCapacitateNominala(e.target.value)}
                      placeholder="Ex: 5120 Wh"
                      className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-cicluri" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
                      Cicluri de descărcare:
                    </label>
                    <input
                      id="product-cicluri"
                      type="text"
                      value={cicluriDescarcare}
                      onChange={(e) => setCicluriDescarcare(e.target.value)}
                      placeholder="Ex: 6000"
                      className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-compatibilitate" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
                      Compatibilitate:
                    </label>
                    <input
                      id="product-compatibilitate"
                      type="text"
                      value={compatibilitate}
                      onChange={(e) => setCompatibilitate(e.target.value)}
                      placeholder="Ex: Inverteri hibrizi, on-grid"
                      className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-dimensiuni" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
                      Dimensiuni:
                    </label>
                    <input
                      id="product-dimensiuni"
                      type="text"
                      value={dimensiuni}
                      onChange={(e) => setDimensiuni(e.target.value)}
                      placeholder="Ex: 440 x 420 x 180 mm"
                      className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-greutate" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
                      Greutate:
                    </label>
                    <input
                      id="product-greutate"
                      type="text"
                      value={greutate}
                      onChange={(e) => setGreutate(e.target.value)}
                      placeholder="Ex: 48 kg"
                      className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-temperatura" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
                      Temperatura operare:
                    </label>
                    <input
                      id="product-temperatura"
                      type="text"
                      value={temperaturaOperare}
                      onChange={(e) => setTemperaturaOperare(e.target.value)}
                      placeholder="Ex: -10°C ... +50°C"
                      className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Add Images */}
              <div className="pt-2 border-t border-gray-200">
                <h3 className="text-sm font-bold font-['Inter'] text-gray-900 mb-4">Add Images:</h3>
                <p className="text-xs text-gray-500 mb-3">Up to 5 images to be uploaded.</p>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    isDragging ? 'border-slate-500 bg-slate-50/50' : 'border-gray-300 hover:border-gray-400'
                  } ${images.length >= MAX_IMAGES ? 'opacity-50 pointer-events-none' : ''}`}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onClick={() => images.length < MAX_IMAGES && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      addImages(e.target.files)
                      e.target.value = ''
                    }}
                  />
                  {images.length > 0 ? (
                    <div className="flex flex-wrap gap-3 justify-center">
                      {images.map(({ preview }, i) => (
                        <div key={i} className="relative group">
                          <img src={preview} alt="" className="h-20 w-20 object-cover rounded-lg border border-gray-200" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeImage(i) }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {images.length < MAX_IMAGES && (
                        <div className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                          + {MAX_IMAGES - images.length} left
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Trage sau click pentru a încărca imagini
                    </p>
                  )}
                </div>
              </div>

              {/* Documente tehnice */}
              <div className="pt-2 border-t border-gray-200">
                <h3 className="text-sm font-bold font-['Inter'] text-gray-900 mb-4">Documente tehnice:</h3>
                <input
                  ref={docFileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={handleDocFileChange}
                />
                <div className="flex flex-col gap-4">
                  {documenteTehnice.map((doc, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="flex-1 min-w-0">
                        <label htmlFor={`doc-desc-${i}`} className="block text-xs font-semibold font-['Inter'] text-gray-700 mb-1">
                          Descriere document
                        </label>
                        <input
                          id={`doc-desc-${i}`}
                          type="text"
                          value={doc.descriere}
                          onChange={(e) => setDocumentDescriere(i, e.target.value)}
                          placeholder="Ex: Fișă tehnică"
                          className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                        />
                      </div>
                      <div className="shrink-0 pt-5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => triggerDocUpload(i)}
                          className="h-10 px-4 rounded-lg border border-gray-300 text-sm font-medium font-['Inter'] text-gray-700 hover:bg-gray-50 transition-colors min-w-[100px] max-w-[160px]"
                          title={doc.file?.name}
                        >
                          <span className="block truncate">{doc.file ? doc.file.name : 'Upload PDF'}</span>
                        </button>
                        {doc.file && (
                          <button
                            type="button"
                            onClick={() => removeDocumentFile(i)}
                            className="h-10 w-10 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                            aria-label="Elimină document"
                            title="Elimină document"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M5 6V4a2 2 0 012-2h5a2 2 0 012 2v2M9 11v6M15 11v6" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Doar fișiere .pdf acceptate.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClosePanel}
                  className="flex-1 h-11 px-6 border border-gray-300 rounded-xl text-gray-700 text-sm font-semibold font-['Inter'] hover:bg-gray-50 transition-colors"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 px-6 bg-slate-900 text-white rounded-xl text-sm font-bold font-['Inter'] hover:bg-slate-700 transition-colors"
                >
                  Salvează
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
