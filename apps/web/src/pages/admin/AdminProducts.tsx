import { useState, useRef } from 'react'
import { createProduct, uploadAdminFile } from '../../lib/api'

const MAX_IMAGES = 5

export default function AdminProducts() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const docFileInputRef = useRef<HTMLInputElement>(null)
  const docUploadIndexRef = useRef(0)
  const [panelOpen, setPanelOpen] = useState(false)
  const [isClosingPanel, setIsClosingPanel] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [sku, setSku] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<{ file: File; preview: string }[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [tipProdus, setTipProdus] = useState<'rezidential' | 'industrial'>('rezidential')
  const [energieNominala, setEnergieNominala] = useState('')
  const [capacitate, setCapacitate] = useState('')
  const [curentMaxDescarcare, setCurentMaxDescarcare] = useState('')
  const [curentMaxIncarcare, setCurentMaxIncarcare] = useState('')
  const [cicluriDescarcare, setCicluriDescarcare] = useState('')
  const [adancimeDescarcare, setAdancimeDescarcare] = useState('')
  const [greutate, setGreutate] = useState('')
  const [dimensiuni, setDimensiuni] = useState('')
  const [protectie, setProtectie] = useState('')
  const [certificari, setCertificari] = useState('')
  const [garantie, setGarantie] = useState('')
  const [tensiuneNominala, setTensiuneNominala] = useState('')
  const [eficientaCiclu, setEficientaCiclu] = useState('')
  const [temperaturaFunctionare, setTemperaturaFunctionare] = useState('')
  const [temperaturaStocare, setTemperaturaStocare] = useState('')
  const [umiditate, setUmiditate] = useState('')
  const [landedPrice, setLandedPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [vat, setVat] = useState('')
  const [documenteTehnice, setDocumenteTehnice] = useState<{ descriere: string; file: File | null }[]>([
    { descriere: '', file: null },
  ])
  const [faq, setFaq] = useState<{ q: string; a: string }[]>([{ q: '', a: '' }])

  const handleOpenPanel = () => {
    setSaveError(null)
    setTitle('')
    setSku('')
    setDescription('')
    setTipProdus('rezidential')
    setEnergieNominala('')
    setCapacitate('')
    setCurentMaxDescarcare('')
    setCurentMaxIncarcare('')
    setCicluriDescarcare('')
    setAdancimeDescarcare('')
    setGreutate('')
    setDimensiuni('')
    setProtectie('')
    setCertificari('')
    setGarantie('')
    setTensiuneNominala('')
    setEficientaCiclu('')
    setTemperaturaFunctionare('')
    setTemperaturaStocare('')
    setUmiditate('')
    setLandedPrice('')
    setSalePrice('')
    setVat('')
    setDocumenteTehnice([{ descriere: '', file: null }])
    setFaq([{ q: '', a: '' }])
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

  const addDocumentItem = () => {
    setDocumenteTehnice((prev) => [...prev, { descriere: '', file: null }])
  }

  const removeDocumentItem = (index: number) => {
    if (documenteTehnice.length <= 1) return
    setDocumenteTehnice((prev) => prev.filter((_, i) => i !== index))
  }

  const setFaqItem = (index: number, field: 'q' | 'a', value: string) => {
    setFaq((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addFaqItem = () => {
    setFaq((prev) => [...prev, { q: '', a: '' }])
  }

  const removeFaqItem = (index: number) => {
    if (faq.length <= 1) return
    setFaq((prev) => prev.filter((_, i) => i !== index))
  }

  const triggerDocUpload = (index: number) => {
    docUploadIndexRef.current = index
    docFileInputRef.current?.click()
  }

  const handleNumericInput = (value: string, setter: (v: string) => void) => {
    const filtered = value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
    setter(filtered)
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

  const getRequiredErrors = (): string[] => {
    const errs: string[] = []
    if (!title.trim()) errs.push('Titlu')
    if (!sku.trim()) errs.push('SKU')
    if (!description.trim()) errs.push('Descriere')
    if (!landedPrice.trim()) errs.push('Landed Price')
    if (!salePrice.trim()) errs.push('Sale Price')
    if (!vat.trim()) errs.push('TVA')
    if (!energieNominala.trim()) errs.push('Energie nominală')
    if (!capacitate.trim()) errs.push('Capacitate')
    if (!curentMaxDescarcare.trim()) errs.push('Curent max. descărcare')
    if (!curentMaxIncarcare.trim()) errs.push('Curent max. încărcare')
    if (!cicluriDescarcare.trim()) errs.push('Cicluri de descărcare')
    if (!adancimeDescarcare.trim()) errs.push('Adâncime descărcare (DOD)')
    if (!greutate.trim()) errs.push('Greutate')
    if (!dimensiuni.trim()) errs.push('Dimensiuni')
    if (!protectie.trim()) errs.push('Protecție')
    if (!certificari.trim()) errs.push('Certificări')
    if (!garantie.trim()) errs.push('Garanție')
    if (!tensiuneNominala.trim()) errs.push('Tensiune nominală')
    if (!eficientaCiclu.trim()) errs.push('Eficiență ciclu complet')
    if (!temperaturaFunctionare.trim()) errs.push('Temperatura funcționare')
    if (!temperaturaStocare.trim()) errs.push('Temperatura stocare')
    if (!umiditate.trim()) errs.push('Umiditate')
    if (images.length === 0) errs.push('Cel puțin o imagine')
    const hasValidDoc = documenteTehnice.some((d) => d.descriere.trim() && d.file)
    if (!hasValidDoc) errs.push('Cel puțin un document tehnic (descriere + fișier PDF)')
    const hasValidFaq = faq.some((f) => f.q.trim() && f.a.trim())
    if (!hasValidFaq) errs.push('Cel puțin o întrebare frecventă (întrebare + răspuns)')
    return errs
  }

  const buildPayload = async () => {
    const imageUrls: string[] = []
    for (const { file } of images) {
      const { url } = await uploadAdminFile(file)
      imageUrls.push(url)
    }

    const docTehnice: { descriere: string; url: string }[] = []
    for (const doc of documenteTehnice) {
      let url = ''
      if (doc.file) {
        const r = await uploadAdminFile(doc.file)
        url = r.url
      }
      docTehnice.push({ descriere: doc.descriere.trim(), url })
    }

    const faqFiltered = faq.filter((item) => item.q.trim() || item.a.trim()).map((item) => ({ q: item.q.trim(), a: item.a.trim() }))

    return {
      title: title.trim(),
      sku: sku.trim(),
      description: description.trim() || undefined,
      tipProdus,
      landedPrice: landedPrice || '0',
      salePrice: salePrice || '0',
      vat: vat || '19',
      energieNominala: energieNominala || undefined,
      capacitate: capacitate || undefined,
      curentMaxDescarcare: curentMaxDescarcare || undefined,
      curentMaxIncarcare: curentMaxIncarcare || undefined,
      cicluriDescarcare: cicluriDescarcare || undefined,
      adancimeDescarcare: adancimeDescarcare || undefined,
      greutate: greutate || undefined,
      dimensiuni: dimensiuni || undefined,
      protectie: protectie || undefined,
      certificari: certificari || undefined,
      garantie: garantie || undefined,
      tensiuneNominala: tensiuneNominala || undefined,
      eficientaCiclu: eficientaCiclu || undefined,
      temperaturaFunctionare: temperaturaFunctionare || undefined,
      temperaturaStocare: temperaturaStocare || undefined,
      umiditate: umiditate || undefined,
      images: imageUrls,
      documenteTehnice: docTehnice,
      faq: faqFiltered,
    }
  }

  const handleSave = async () => {
    const errs = getRequiredErrors()
    if (errs.length > 0) {
      setSaveError(`Câmpuri obligatorii: ${errs.join(', ')}`)
      return
    }
    setIsSaving(true)
    setSaveError(null)
    try {
      const payload = await buildPayload()
      await createProduct(payload, 'published')
      handleClosePanel()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Eroare la salvare.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveDraft = async () => {
    const errs = getRequiredErrors()
    if (errs.length > 0) {
      setSaveError(`Câmpuri obligatorii: ${errs.join(', ')}`)
      return
    }
    setIsSaving(true)
    setSaveError(null)
    try {
      const payload = await buildPayload()
      await createProduct(payload, 'draft')
      handleClosePanel()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Eroare la salvare.')
    } finally {
      setIsSaving(false)
    }
  }

  const panelVisible = panelOpen || isClosingPanel

  return (
    <div className={`flex flex-col w-full min-h-0 ${panelVisible ? 'h-[calc(100vh-4rem)] lg:h-screen overflow-hidden' : ''}`}>
      {/* Tab bar — full width */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white shrink-0">
        <h1 className="text-xl font-bold font-['Inter'] text-black">Produse</h1>
        {panelVisible ? (
          <div className="flex items-center gap-2">
            {saveError && (
              <span className="text-sm text-red-600 font-medium mr-2">{saveError}</span>
            )}
            <button
              type="submit"
              form="add-product-form"
              disabled={isSaving}
              className="h-9 px-4 bg-slate-900 text-white rounded-lg text-sm font-semibold font-['Inter'] hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Se salvează...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="h-9 px-4 border border-gray-300 rounded-lg text-gray-700 text-sm font-semibold font-['Inter'] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Draft
            </button>
            <button
              type="button"
              onClick={handleClosePanel}
              disabled={isSaving}
              className="h-9 px-4 border border-gray-300 rounded-lg text-gray-700 text-sm font-semibold font-['Inter'] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        ) : (
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
            <form
              id="add-product-form"
              onSubmit={(e) => {
                e.preventDefault()
                handleSave()
              }}
              className="flex flex-col gap-5"
            >
              <h2 className="text-lg font-bold font-['Inter'] text-black mb-2">Adaugă produs</h2>

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

              {/* SKU */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <label htmlFor="product-sku" className="block text-sm font-semibold font-['Inter'] text-gray-700">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <button
                      type="button"
                      className="w-5 h-5 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 flex items-center justify-center transition-colors"
                      aria-label="Format SKU"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <div className="absolute left-0 top-full mt-1 z-10 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs font-['Inter'] rounded-lg shadow-lg">
                      <p className="font-semibold mb-2">Format: BAT-LFP-51V-100AH-LT</p>
                      <ul className="space-y-1 text-gray-300">
                        <li>LFP = LiFePO4</li>
                        <li>51V = Tensiune (rotunjită)</li>
                        <li>100AH = Amp-oră</li>
                        <li>LT = Lithtech</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <input
                  id="product-sku"
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="BAT-LFP-51V-100AH-LT"
                  required
                  className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              {/* Descriere Produs */}
              <div className="pt-2 border-t border-gray-200">
                <h3 className="text-sm font-bold font-['Inter'] text-gray-900 mb-4">Descriere Produs</h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="product-title" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
                      Titlu <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="product-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: EcoHome 5 kWh"
                      required
                      className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-description" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
                      Descriere <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="product-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descrierea produsului..."
                      rows={6}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* Price Section */}
              <div className="pt-2 border-t border-gray-200">
                <h3 className="text-sm font-bold font-['Inter'] text-gray-900 mb-4">Preț</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <div>
                    <label htmlFor="product-landed-price" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
                      Landed Price (RON) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="product-landed-price"
                      type="text"
                      inputMode="decimal"
                      value={landedPrice}
                      onChange={(e) => handleNumericInput(e.target.value, setLandedPrice)}
                      placeholder="Ex: 15000"
                      required
                      className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-sale-price" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
                      Sale Price (RON)
                    </label>
                    <input
                      id="product-sale-price"
                      type="text"
                      inputMode="decimal"
                      value={salePrice}
                      onChange={(e) => handleNumericInput(e.target.value, setSalePrice)}
                      placeholder="Ex: 15840"
                      className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-vat" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
                      TVA (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="product-vat"
                      type="text"
                      inputMode="decimal"
                      value={vat}
                      onChange={(e) => handleNumericInput(e.target.value, setVat)}
                      placeholder="Ex: 19"
                      required
                      className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Detalii tehnice produs */}
              <div className="pt-2 border-t border-gray-200">
                <h3 className="text-sm font-bold font-['Inter'] text-gray-900 mb-4">Detalii tehnice produs</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <div>
                    <label htmlFor="product-energie-nominala" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Energie nominală <span className="text-red-500">*</span></label>
                    <input id="product-energie-nominala" type="text" value={energieNominala} onChange={(e) => setEnergieNominala(e.target.value)} placeholder="5,120 Wh" required className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                  </div>
                  <div>
                    <label htmlFor="product-capacitate" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Capacitate <span className="text-red-500">*</span></label>
                    <input id="product-capacitate" type="text" value={capacitate} onChange={(e) => setCapacitate(e.target.value)} placeholder="100Ah" required className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                  </div>
                  <div>
                    <label htmlFor="product-curent-descarcare" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Curent max. descărcare <span className="text-red-500">*</span></label>
                    <input id="product-curent-descarcare" type="text" value={curentMaxDescarcare} onChange={(e) => setCurentMaxDescarcare(e.target.value)} placeholder="100A" required className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                  </div>
                  <div>
                    <label htmlFor="product-curent-incarcare" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Curent max. încărcare <span className="text-red-500">*</span></label>
                    <input id="product-curent-incarcare" type="text" value={curentMaxIncarcare} onChange={(e) => setCurentMaxIncarcare(e.target.value)} placeholder="50A" required className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                  </div>
                  <div>
                    <label htmlFor="product-cicluri" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Cicluri de descărcare <span className="text-red-500">*</span></label>
                    <input id="product-cicluri" type="text" value={cicluriDescarcare} onChange={(e) => setCicluriDescarcare(e.target.value)} placeholder="5,000 (la 60% DOD)" required className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                  </div>
                  <div>
                    <label htmlFor="product-adancime-descarcare" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Adâncime descărcare (DOD) <span className="text-red-500">*</span></label>
                    <input id="product-adancime-descarcare" type="text" value={adancimeDescarcare} onChange={(e) => setAdancimeDescarcare(e.target.value)} placeholder="60%" required className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                  </div>
                  <div>
                    <label htmlFor="product-greutate" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Greutate <span className="text-red-500">*</span></label>
                    <input id="product-greutate" type="text" value={greutate} onChange={(e) => setGreutate(e.target.value)} placeholder="46 kg" required className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                  </div>
                  <div>
                    <label htmlFor="product-dimensiuni" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Dimensiuni (L × l × h) <span className="text-red-500">*</span></label>
                    <input id="product-dimensiuni" type="text" value={dimensiuni} onChange={(e) => setDimensiuni(e.target.value)} placeholder="460 × 400 × 130 mm" required className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                  </div>
                  <div>
                    <label htmlFor="product-protectie" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Protecție <span className="text-red-500">*</span></label>
                    <input id="product-protectie" type="text" value={protectie} onChange={(e) => setProtectie(e.target.value)} placeholder="IP20" required className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                  </div>
                  <div>
                    <label htmlFor="product-certificari" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Certificări <span className="text-red-500">*</span></label>
                    <input id="product-certificari" type="text" value={certificari} onChange={(e) => setCertificari(e.target.value)} placeholder="CE, IEC 62133, UN38.3" required className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                  </div>
                  <div>
                    <label htmlFor="product-garantie" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Garanție <span className="text-red-500">*</span></label>
                    <input id="product-garantie" type="text" value={garantie} onChange={(e) => setGarantie(e.target.value)} placeholder="10 ani" required className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                  </div>
                  <div>
                    <label htmlFor="product-tensiune-nominala" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Tensiune nominală <span className="text-red-500">*</span></label>
                    <input id="product-tensiune-nominala" type="text" value={tensiuneNominala} onChange={(e) => setTensiuneNominala(e.target.value)} placeholder="51.2V" required className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                  </div>
                  <div>
                    <label htmlFor="product-eficienta-ciclu" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Eficiență ciclu complet <span className="text-red-500">*</span></label>
                    <input id="product-eficienta-ciclu" type="text" value={eficientaCiclu} onChange={(e) => setEficientaCiclu(e.target.value)} placeholder="≥ 96%" required className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                  </div>
                  <div>
                    <label htmlFor="product-temperatura-functionare" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Temperatura funcționare <span className="text-red-500">*</span></label>
                    <input id="product-temperatura-functionare" type="text" value={temperaturaFunctionare} onChange={(e) => setTemperaturaFunctionare(e.target.value)} placeholder="-20 ~ 55°C" required className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                  </div>
                  <div>
                    <label htmlFor="product-temperatura-stocare" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Temperatura stocare <span className="text-red-500">*</span></label>
                    <input id="product-temperatura-stocare" type="text" value={temperaturaStocare} onChange={(e) => setTemperaturaStocare(e.target.value)} placeholder="-10 ~ 50°C" required className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                  </div>
                  <div>
                    <label htmlFor="product-umiditate" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Umiditate <span className="text-red-500">*</span></label>
                    <input id="product-umiditate" type="text" value={umiditate} onChange={(e) => setUmiditate(e.target.value)} placeholder="5 ~ 95% (fără condensare)" required className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                  </div>
                </div>
              </div>

              {/* Add Images */}
              <div className="pt-2 border-t border-gray-200">
                <h3 className="text-sm font-bold font-['Inter'] text-gray-900 mb-4">Imagini <span className="text-red-500">*</span></h3>
                <p className="text-xs text-gray-500 mb-3">Cel puțin o imagine obligatorie (max. 5).</p>
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
                <h3 className="text-sm font-bold font-['Inter'] text-gray-900 mb-4">Documente tehnice</h3>
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
                            aria-label="Elimină fișier"
                            title="Elimină fișier"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M5 6V4a2 2 0 012-2h5a2 2 0 012 2v2M9 11v6M15 11v6" />
                            </svg>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={addDocumentItem}
                          className="h-10 w-10 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center justify-center transition-colors"
                          aria-label="Adaugă document"
                          title="Adaugă document"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                        {documenteTehnice.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDocumentItem(i)}
                            className="h-10 w-10 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                            aria-label="Elimină rând"
                            title="Elimină rând"
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

              {/* Întrebări frecvente */}
              <div className="pt-2 border-t border-gray-200">
                <h3 className="text-sm font-bold font-['Inter'] text-gray-900 mb-4">Întrebări frecvente <span className="text-red-500">*</span></h3>
                <p className="text-xs text-gray-500 mb-3">Cel puțin o întrebare cu răspuns obligatoriu.</p>
                <div className="flex flex-col gap-4">
                  {faq.map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="flex-1 min-w-0 flex flex-col gap-2">
                        <label htmlFor={`faq-q-${i}`} className="block text-xs font-semibold font-['Inter'] text-gray-700">
                          Întrebare
                        </label>
                        <input
                          id={`faq-q-${i}`}
                          type="text"
                          value={item.q}
                          onChange={(e) => setFaqItem(i, 'q', e.target.value)}
                          placeholder="Ex: Cât durează instalarea?"
                          className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                        />
                        <label htmlFor={`faq-a-${i}`} className="block text-xs font-semibold font-['Inter'] text-gray-700">
                          Răspuns
                        </label>
                        <textarea
                          id={`faq-a-${i}`}
                          value={item.a}
                          onChange={(e) => setFaqItem(i, 'a', e.target.value)}
                          placeholder="Ex: Instalarea standard durează 2–4 ore..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 resize-y"
                        />
                      </div>
                      <div className="flex flex-col gap-1 pt-6 shrink-0">
                        <button
                          type="button"
                          onClick={addFaqItem}
                          className="h-10 w-10 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center justify-center transition-colors"
                          aria-label="Adaugă întrebare"
                          title="Adaugă întrebare"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                        {faq.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFaqItem(i)}
                            className="h-10 w-10 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                            aria-label="Elimină întrebare"
                            title="Elimină întrebare"
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
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
