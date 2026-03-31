import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  createProduct,
  updateProduct,
  uploadAdminFile,
  getAdminProducts,
  getAdminProduct,
  updateProductStatus,
  deleteProduct,
  type AdminProduct,
  type CreateProductPayload,
} from '../../lib/api'
import {
  INDUSTRIAL_SPEC_FIELDS,
  createEmptyIndustrialModelEntry,
  createEmptyIndustrialTechnicalSpecs,
  normalizeIndustrialTechnicalSpecs,
  type IndustrialTechnicalSpecsData,
} from '../../lib/industrialTechnicalSpec'

const MAX_IMAGES = 5

export default function AdminProducts() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const replaceIndexRef = useRef<number | null>(null)
  const docFileInputRef = useRef<HTMLInputElement>(null)
  const docUploadIndexRef = useRef(0)
  const cardPhotoInputRef = useRef<HTMLInputElement>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [isClosingPanel, setIsClosingPanel] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [productsError, setProductsError] = useState<string | null>(null)
  const [filterCategorie, setFilterCategorie] = useState<'all' | 'rezidential' | 'industrial' | 'medical' | 'maritim'>('all')
  const [brand, setBrand] = useState('')
  const [title, setTitle] = useState('')
  const [sku, setSku] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [overview, setOverview] = useState('')
  const [description, setDescription] = useState('')
  const [keyAdvantages, setKeyAdvantages] = useState<
    { title: string; file: File | null; url?: string; preview?: string }[]
  >([])
  const advantageFileInputRef = useRef<HTMLInputElement>(null)
  const advantageUploadIndexRef = useRef(0)
  const [images, setImages] = useState<{ file: File | null; preview: string; url?: string }[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [tipProdus, setTipProdus] = useState<'rezidential' | 'industrial'>('rezidential')
  const [categorieRezidential, setCategorieRezidential] = useState(false)
  const [categorieIndustrial, setCategorieIndustrial] = useState(false)
  const [categorieMedical, setCategorieMedical] = useState(false)
  const [categorieMaritim, setCategorieMaritim] = useState(false)
  const [energieNominala, setEnergieNominala] = useState('')
  const [capacitate, setCapacitate] = useState('')
  const [curentMaxDescarcare, setCurentMaxDescarcare] = useState('')
  const [curentMaxIncarcare, setCurentMaxIncarcare] = useState('')
  const [cicluriDescarcare, setCicluriDescarcare] = useState('')
  const [adancimeDescarcare, setAdancimeDescarcare] = useState('')
  const [greutate, setGreutate] = useState('')
  const [compozitie, setCompozitie] = useState('')
  const [dimensiuniL, setDimensiuniL] = useState('')
  const [dimensiuniW, setDimensiuniW] = useState('')
  const [dimensiuniH, setDimensiuniH] = useState('')
  const [protectie, setProtectie] = useState('')
  const [conectivitateWifi, setConectivitateWifi] = useState(false)
  const [conectivitateBluetooth, setConectivitateBluetooth] = useState(false)
  const [protectieFoc, setProtectieFoc] = useState('')
  const [certificari, setCertificari] = useState('')
  const [garantie, setGarantie] = useState('')
  const [tensiuneNominala, setTensiuneNominala] = useState('')
  const [eficientaCiclu, setEficientaCiclu] = useState('')
  const [temperaturaFunctionareMin, setTemperaturaFunctionareMin] = useState('')
  const [temperaturaFunctionareMax, setTemperaturaFunctionareMax] = useState('')
  const [temperaturaStocareMin, setTemperaturaStocareMin] = useState('')
  const [temperaturaStocareMax, setTemperaturaStocareMax] = useState('')
  const [umiditateMin, setUmiditateMin] = useState('')
  const [umiditateMax, setUmiditateMax] = useState('')
  const [landedPrice, setLandedPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [vat, setVat] = useState('')
  const [documenteTehnice, setDocumenteTehnice] = useState<{ descriere: string; file: File | null; url?: string }[]>([
    { descriere: '', file: null },
  ])
  const [faq, setFaq] = useState<{ q: string; a: string }[]>([{ q: '', a: '' }])
  const [alimentaModalContent, setAlimentaModalContent] = useState<string>('')
  const [cardPhoto, setCardPhoto] = useState<{
    file: File | null
    url?: string
    preview: string
  }>({ file: null, preview: '' })
  const [technicalSpecs, setTechnicalSpecs] = useState<IndustrialTechnicalSpecsData>(() =>
    createEmptyIndustrialTechnicalSpecs()
  )
  const [technicalSpecModelExpanded, setTechnicalSpecModelExpanded] = useState<boolean[]>([])

  const fetchProducts = async () => {
    setProductsLoading(true)
    setProductsError(null)
    try {
      const list = await getAdminProducts()
      setProducts(list)
    } catch (err) {
      const e = err as Error & { status?: number; path?: string }
      let msg = e?.message || 'Eroare la încărcare.'
      if (e?.status === 404 && e?.path) msg += ` (${e.path})`
      setProductsError(msg)
      // Don't clear on error – keep existing list (e.g. after save)
    } finally {
      setProductsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (tipProdus !== 'industrial' || !panelOpen) return
    setDocumenteTehnice((prev) => (prev.length === 0 ? [{ descriere: '', file: null }] : prev))
  }, [tipProdus, panelOpen])

  const parseUnitValue = (s: string | null | undefined, _unit: string): string => {
    if (!s) return ''
    const cleaned = s.replace(/\s/g, '')
    const m = cleaned.match(new RegExp(`^([\\d.,-]+)`, 'i'))
    return m ? m[1] : cleaned.replace(/\D/g, '')
  }
  const parseRange = (s: string | null | undefined): { min: string; max: string } => {
    if (!s) return { min: '', max: '' }
    const m = s.match(/([-\d.]+)\s*~\s*([-\d.]+)/)
    return m ? { min: m[1], max: m[2] } : { min: '', max: '' }
  }
  const parseDims = (s: string | null | undefined): { l: string; w: string; h: string } => {
    if (!s) return { l: '', w: '', h: '' }
    const parts = s.replace(/\s*mm\s*$/i, '').split(/\s*[×x]\s*/i)
    return { l: parts[0] || '', w: parts[1] || '', h: parts[2] || '' }
  }

  const handleEditClick = async (p: AdminProduct) => {
    setEditingProductId(p.id)
    setSaveError(null)
    let row: AdminProduct = p
    try {
      row = await getAdminProduct(p.id)
    } catch {
      /* fallback: grid row (may omit nested JSON if response was ever truncated) */
    }

    setBrand(row.brand || '')
    setTitle(row.title || '')
    setSku(row.sku || '')
    setSubtitle(String((row as { subtitle?: string }).subtitle || ''))
    setOverview(String((row as { overview?: string }).overview || ''))
    setDescription(row.description || '')
    const kaRaw = (row as { keyAdvantages?: { title: string; image: string }[] }).keyAdvantages
    setKeyAdvantages(
      Array.isArray(kaRaw) && kaRaw.length > 0
        ? kaRaw.map((x) => ({
            title: x.title || '',
            file: null,
            url: x.image,
            preview: x.image || '',
          }))
        : []
    )
    setTipProdus(
      (String(row.tipProdus || '').toLowerCase().trim() === 'industrial' ? 'industrial' : 'rezidential') as
        | 'rezidential'
        | 'industrial'
    )
    const cat = String((row as { categorie?: string }).categorie || '').toLowerCase()
    setCategorieRezidential(cat.includes('rezidential'))
    setCategorieIndustrial(cat.includes('industrial'))
    setCategorieMedical(cat.includes('medical'))
    setCategorieMaritim(cat.includes('maritim'))
    setEnergieNominala(parseUnitValue((row as { energieNominala?: string }).energieNominala, 'Wh'))
    setCapacitate(parseUnitValue((row as { capacitate?: string }).capacitate, 'Ah'))
    setCurentMaxDescarcare(parseUnitValue((row as { curentMaxDescarcare?: string }).curentMaxDescarcare, 'A'))
    setCurentMaxIncarcare(parseUnitValue((row as { curentMaxIncarcare?: string }).curentMaxIncarcare, 'A'))
    setCicluriDescarcare(parseUnitValue((row as { cicluriDescarcare?: string }).cicluriDescarcare, 'Cicluri'))
    setAdancimeDescarcare(parseUnitValue((row as { adancimeDescarcare?: string }).adancimeDescarcare, '%'))
    setGreutate(parseUnitValue((row as { greutate?: string }).greutate, 'Kg'))
    setCompozitie((row as { compozitie?: string }).compozitie || '')
    const dims = parseDims((row as { dimensiuni?: string }).dimensiuni)
    setDimensiuniL(dims.l)
    setDimensiuniW(dims.w)
    setDimensiuniH(dims.h)
    setProtectie((row as { protectie?: string }).protectie || '')
    setConectivitateWifi(row.conectivitateWifi === true)
    setConectivitateBluetooth(row.conectivitateBluetooth === true)
    setProtectieFoc((row as { protectieFoc?: string }).protectieFoc || '')
    setCertificari((row as { certificari?: string }).certificari || '')
    setGarantie(parseUnitValue((row as { garantie?: string }).garantie, 'ani'))
    setTensiuneNominala(parseUnitValue((row as { tensiuneNominala?: string }).tensiuneNominala, 'V'))
    setEficientaCiclu(parseUnitValue((row as { eficientaCiclu?: string }).eficientaCiclu, '%'))
    const tempFunc = parseRange((row as { temperaturaFunctionare?: string }).temperaturaFunctionare)
    setTemperaturaFunctionareMin(tempFunc.min)
    setTemperaturaFunctionareMax(tempFunc.max)
    const tempStoc = parseRange((row as { temperaturaStocare?: string }).temperaturaStocare)
    setTemperaturaStocareMin(tempStoc.min)
    setTemperaturaStocareMax(tempStoc.max)
    const umid = parseRange((row as { umiditate?: string }).umiditate)
    setUmiditateMin(umid.min.replace('%', ''))
    setUmiditateMax(umid.max.replace('%', ''))
    const land = (row as { landedPrice?: string | number }).landedPrice
    const sale = row.salePrice
    const v = (row as { vat?: string | number }).vat
    setLandedPrice(land != null ? String(land).replace('.', ',') : '')
    setSalePrice(sale != null ? String(sale).replace('.', ',') : '')
    setVat(v != null ? String(v).replace('.', ',') : '')
    const imgs = Array.isArray(row.images) ? row.images : []
    setImages(imgs.map((url) => ({ file: null, preview: url, url })))
    const docs = (row as { documenteTehnice?: { descriere: string; url: string }[] }).documenteTehnice
    setDocumenteTehnice(
      Array.isArray(docs) && docs.length > 0
        ? docs.map((d) => ({ descriere: d.descriere || '', file: null, url: d.url }))
        : [{ descriere: '', file: null }]
    )
    const faqData = (row as { faq?: { q: string; a: string }[] }).faq
    setFaq(
      Array.isArray(faqData) && faqData.length > 0
        ? faqData.map((f) => ({ q: f.q || '', a: f.a || '' }))
        : [{ q: '', a: '' }]
    )
    const alimenta = (row as { alimentaModalContent?: unknown }).alimentaModalContent
    setAlimentaModalContent(
      alimenta && typeof alimenta === 'object'
        ? JSON.stringify(alimenta, null, 2)
        : ''
    )
    const cardImg = String((row as { cardImage?: string }).cardImage || '').trim()
    setCardPhoto({ file: null, url: cardImg || undefined, preview: cardImg })
    const rawTs =
      (row as { technicalSpecsModels?: unknown }).technicalSpecsModels ??
      (row as { technical_specs_models?: unknown }).technical_specs_models
    const tsLoaded = normalizeIndustrialTechnicalSpecs(rawTs) ?? createEmptyIndustrialTechnicalSpecs()
    setTechnicalSpecs(tsLoaded)
    setTechnicalSpecModelExpanded(tsLoaded.entries.map(() => true))
    setPanelOpen(true)
  }

  const handleOpenPanel = () => {
    setEditingProductId(null)
    setSaveError(null)
    setBrand('')
    setTitle('')
    setSku('')
    setSubtitle('')
    setOverview('')
    setDescription('')
    setKeyAdvantages([])
    setTipProdus('rezidential')
    setCategorieRezidential(false)
    setCategorieIndustrial(false)
    setCategorieMedical(false)
    setCategorieMaritim(false)
    setEnergieNominala('')
    setCapacitate('')
    setCurentMaxDescarcare('')
    setCurentMaxIncarcare('')
    setCicluriDescarcare('')
    setAdancimeDescarcare('')
    setGreutate('')
    setCompozitie('')
    setDimensiuniL('')
    setDimensiuniW('')
    setDimensiuniH('')
    setProtectie('')
    setConectivitateWifi(false)
    setConectivitateBluetooth(false)
    setProtectieFoc('')
    setCertificari('')
    setGarantie('')
    setTensiuneNominala('')
    setEficientaCiclu('')
    setTemperaturaFunctionareMin('')
    setTemperaturaFunctionareMax('')
    setTemperaturaStocareMin('')
    setTemperaturaStocareMax('')
    setUmiditateMin('')
    setUmiditateMax('')
    setLandedPrice('')
    setSalePrice('')
    setVat('')
    setDocumenteTehnice([{ descriere: '', file: null }])
    setFaq([{ q: '', a: '' }])
    setAlimentaModalContent('')
    setCardPhoto((prev) => {
      if (prev.preview.startsWith('blob:')) URL.revokeObjectURL(prev.preview)
      return { file: null, preview: '' }
    })
    setTechnicalSpecs(createEmptyIndustrialTechnicalSpecs())
    setTechnicalSpecModelExpanded([])
    images.forEach(({ preview }) => URL.revokeObjectURL(preview))
    setImages([])
    setPanelOpen(true)
  }

  const addImages = (files: FileList | null) => {
    if (!files?.length) return
    const newEntries: { file: File | null; preview: string; url?: string }[] = []
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
      if (next[index].preview.startsWith('blob:')) URL.revokeObjectURL(next[index].preview)
      next.splice(index, 1)
      return next
    })
  }

  const replaceImage = (index: number) => {
    replaceIndexRef.current = index
    fileInputRef.current?.click()
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

  const addKeyAdvantage = () => {
    setKeyAdvantages((prev) => [...prev, { title: '', file: null }])
  }

  const removeKeyAdvantage = (index: number) => {
    setKeyAdvantages((prev) => {
      const next = prev.filter((_, i) => i !== index)
      const removed = prev[index]
      if (removed?.preview?.startsWith('blob:')) URL.revokeObjectURL(removed.preview)
      return next
    })
  }

  const setKeyAdvantageTitle = (index: number, value: string) => {
    setKeyAdvantages((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], title: value }
      return next
    })
  }

  const triggerAdvantageUpload = (index: number) => {
    advantageUploadIndexRef.current = index
    advantageFileInputRef.current?.click()
  }

  const onAdvantageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = advantageUploadIndexRef.current
    const file = e.target.files?.[0]
    if (file?.type.startsWith('image/')) {
      setKeyAdvantages((prev) => {
        const next = [...prev]
        const prevRow = next[index]
        if (prevRow?.preview?.startsWith('blob:')) URL.revokeObjectURL(prevRow.preview)
        next[index] = {
          ...next[index],
          file,
          preview: URL.createObjectURL(file),
          url: undefined,
        }
        return next
      })
    }
    e.target.value = ''
  }

  const triggerDocUpload = (index: number) => {
    docUploadIndexRef.current = index
    docFileInputRef.current?.click()
  }

  /** Format number with thousand separator (e.g. 15000 → "15.000") */
  const formatWithThousand = (v: string): string => {
    const parts = v.replace(/[^\d.,]/g, '').replace(',', '.').split('.')
    const int = parts[0]?.replace(/\B(?=(\d{3})+(?!\d))/g, '.') || ''
    const dec = parts[1] !== undefined ? ',' + parts[1] : ''
    return int + dec
  }

  /** Parse formatted number to raw (e.g. "15.000" → "15000") */
  const parseFormattedNumber = (v: string): string => {
    const cleaned = v.replace(/\./g, '').replace(',', '.')
    const match = cleaned.match(/^(\d*)(\.?\d*)/)
    return match ? match[1] + (match[2] || '') : ''
  }

  const handleNumericInput = (value: string, setter: (v: string) => void) => {
    const raw = parseFormattedNumber(value)
    const filtered = raw.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
    setter(formatWithThousand(filtered))
  }

  /** Numbers only (no decimals) - for Wh, Ah, A fields */
  const handleIntegerOnly = (value: string, setter: (v: string) => void) => {
    const filtered = value.replace(/\D/g, '')
    setter(formatWithThousand(filtered))
  }

  /** Digits only, max 5 chars - for dimension fields (mm) */
  const handleDimensionInput = (value: string, setter: (v: string) => void) => {
    const filtered = value.replace(/\D/g, '').slice(0, 5)
    setter(filtered)
  }

  /** Numbers with optional leading minus - for temperature fields (°C) */
  const handleTemperatureInput = (value: string, setter: (v: string) => void) => {
    let s = value.replace(/[^\d-]/g, '')
    if (s.startsWith('-')) {
      s = '-' + s.slice(1).replace(/\D/g, '')
    } else {
      s = s.replace(/\D/g, '')
    }
    setter(s)
  }

  /** Decimals only, no thousand separator - for voltage (V) */
  const handleDecimalInput = (value: string, setter: (v: string) => void) => {
    const filtered = value.replace(/[^\d.,]/g, '').replace(/(\..*)\./g, '$1').replace(',', '.')
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

  const onCardPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file?.type.startsWith('image/')) return
    setCardPhoto((prev) => {
      if (prev.preview.startsWith('blob:')) URL.revokeObjectURL(prev.preview)
      return { file, url: undefined, preview: URL.createObjectURL(file) }
    })
  }

  const clearCardPhoto = () => {
    setCardPhoto((prev) => {
      if (prev.preview.startsWith('blob:')) URL.revokeObjectURL(prev.preview)
      return { file: null, url: undefined, preview: '' }
    })
  }

  const addTechnicalSpecModel = () => {
    setTechnicalSpecs((prev) => ({
      entries: [...prev.entries, createEmptyIndustrialModelEntry()],
    }))
    setTechnicalSpecModelExpanded((prev) => [...prev, true])
  }

  const removeTechnicalSpecModel = (index: number) => {
    setTechnicalSpecs((prev) => ({
      entries: prev.entries.filter((_, i) => i !== index),
    }))
    setTechnicalSpecModelExpanded((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleTechnicalSpecModelExpanded = (index: number) => {
    setTechnicalSpecModelExpanded((prev) => prev.map((v, i) => (i === index ? !v : v)))
  }

  const setTechnicalSpecModelName = (index: number, value: string) => {
    setTechnicalSpecs((prev) => ({
      entries: prev.entries.map((e, i) => (i === index ? { ...e, modelName: value } : e)),
    }))
  }

  const setTechnicalSpecField = (entryIndex: number, fieldKey: string, value: string) => {
    setTechnicalSpecs((prev) => ({
      entries: prev.entries.map((e, i) => {
        if (i !== entryIndex) return e
        return { ...e, specs: { ...e.specs, [fieldKey]: value } }
      }),
    }))
  }

  const handleClosePanel = () => {
    setIsClosingPanel(true)
  }

  const handlePanelTransitionEnd = (e: React.TransitionEvent) => {
    if (e.target !== e.currentTarget) return
    if (isClosingPanel) {
      images.forEach(({ preview }) => preview.startsWith('blob:') && URL.revokeObjectURL(preview))
      keyAdvantages.forEach((ka) => ka.preview?.startsWith('blob:') && URL.revokeObjectURL(ka.preview))
      if (cardPhoto.preview.startsWith('blob:')) URL.revokeObjectURL(cardPhoto.preview)
      setImages([])
      setKeyAdvantages([])
      setCardPhoto({ file: null, preview: '' })
      setTechnicalSpecs(createEmptyIndustrialTechnicalSpecs())
      setTechnicalSpecModelExpanded([])
      setEditingProductId(null)
      setPanelOpen(false)
      setIsClosingPanel(false)
    }
  }

  const buildPayload = async () => {
    const productFolder = title.trim() || 'Fără titlu'
    const imageUrls: string[] = []
    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      if (img.url) {
        imageUrls.push(img.url)
      } else if (img.file) {
        const { url } = await uploadAdminFile(img.file, productFolder, i + 1)
        imageUrls.push(url)
      }
    }

    const docTehnice: { descriere: string; url: string }[] = []
    for (const doc of documenteTehnice) {
      let url = ''
      if (doc.file) {
        const r = await uploadAdminFile(doc.file, productFolder)
        url = r.url
      } else if (doc.url) {
        url = doc.url
      }
      docTehnice.push({ descriere: doc.descriere.trim(), url })
    }
    const docTehniceFinal =
      tipProdus === 'industrial'
        ? docTehnice.filter((d) => d.url || d.descriere).slice(0, 1)
        : docTehnice

    const keyAdvPayload: { title: string; image: string }[] = []
    if (tipProdus === 'industrial') {
      let ki = 0
      for (const row of keyAdvantages) {
        if (!row.title.trim() && !row.file && !row.url) continue
        let imageUrl = row.url || ''
        if (row.file) {
          const { url } = await uploadAdminFile(row.file, productFolder, 100 + ki)
          imageUrl = url
          ki++
        }
        keyAdvPayload.push({ title: row.title.trim(), image: imageUrl })
      }
    }

    const faqFiltered = faq.filter((item) => item.q.trim() || item.a.trim()).map((item) => ({ q: item.q.trim(), a: item.a.trim() }))

    const dims = [dimensiuniL, dimensiuniW, dimensiuniH].filter(Boolean).join(' × ')
    const dimensiuniStr = dims ? `${dims} mm` : undefined

    const carouselTemplate = tipProdus === 'industrial'
    const descriptionOut = carouselTemplate
      ? overview.trim() || subtitle.trim() || undefined
      : description.trim() || undefined

    const alimentaParsed = (() => {
      if (carouselTemplate) return null
      const s = alimentaModalContent.trim()
      if (!s) return null
      try {
        const parsed = JSON.parse(s) as { title?: string; intro?: string; sections?: Array<{ label?: string; items?: string[] }> }
        if (parsed && typeof parsed.title === 'string' && Array.isArray(parsed.sections)) {
          return {
            title: parsed.title,
            intro: parsed.intro ?? undefined,
            sections: parsed.sections.map((sec) => ({
              label: String(sec?.label ?? ''),
              items: Array.isArray(sec?.items) ? sec.items : [],
            })),
          }
        }
      } catch {
        /* invalid JSON */
      }
      return null
    })()

    let cardImageOut: string | null = null
    if (cardPhoto.file) {
      const { url } = await uploadAdminFile(cardPhoto.file, productFolder, 99)
      cardImageOut = url
    } else if (cardPhoto.url) {
      cardImageOut = cardPhoto.url
    } else {
      cardImageOut = null
    }

    let technicalSpecsModelsOut: CreateProductPayload['technicalSpecsModels'] = null
    if (carouselTemplate) {
      technicalSpecsModelsOut = {
        entries: technicalSpecs.entries.map((e) => ({
          modelName: e.modelName.trim(),
          specs: Object.fromEntries(
            INDUSTRIAL_SPEC_FIELDS.map((f) => [f.key, String(e.specs[f.key] ?? '').trim()])
          ),
        })),
      }
    }

    const payload: CreateProductPayload = {
      brand: brand || undefined,
      title: title.trim() || 'Fără titlu',
      sku: sku.trim() || `SKU-${Date.now()}`,
      description: descriptionOut,
      tipProdus,
      categorie: [categorieRezidential && 'rezidential', categorieIndustrial && 'industrial', categorieMedical && 'medical', categorieMaritim && 'maritim'].filter(Boolean).join(',') || undefined,
      landedPrice: carouselTemplate ? '0' : parseFormattedNumber(landedPrice) || '0',
      salePrice: carouselTemplate ? '0' : parseFormattedNumber(salePrice) || '0',
      vat: carouselTemplate ? '19' : parseFormattedNumber(vat) || '19',
      energieNominala: carouselTemplate ? undefined : energieNominala ? `${parseFormattedNumber(energieNominala)} Wh` : undefined,
      capacitate: carouselTemplate ? undefined : capacitate ? `${parseFormattedNumber(capacitate)} Ah` : undefined,
      curentMaxDescarcare: carouselTemplate ? undefined : curentMaxDescarcare ? `${parseFormattedNumber(curentMaxDescarcare)} A` : undefined,
      curentMaxIncarcare: carouselTemplate ? undefined : curentMaxIncarcare ? `${parseFormattedNumber(curentMaxIncarcare)} A` : undefined,
      cicluriDescarcare: carouselTemplate ? undefined : cicluriDescarcare ? `${parseFormattedNumber(cicluriDescarcare)} Cicluri` : undefined,
      adancimeDescarcare: carouselTemplate ? undefined : adancimeDescarcare ? `${parseFormattedNumber(adancimeDescarcare)}%` : undefined,
      greutate: carouselTemplate ? undefined : greutate ? `${parseFormattedNumber(greutate)} Kg` : undefined,
      compozitie: carouselTemplate ? undefined : compozitie || undefined,
      dimensiuni: carouselTemplate ? undefined : dimensiuniStr,
      protectie: carouselTemplate ? undefined : protectie || undefined,
      conectivitateWifi: carouselTemplate ? false : conectivitateWifi,
      conectivitateBluetooth: carouselTemplate ? false : conectivitateBluetooth,
      protectieFoc: carouselTemplate ? undefined : protectieFoc || undefined,
      certificari: carouselTemplate ? undefined : certificari || undefined,
      garantie: carouselTemplate ? undefined : garantie ? `${parseFormattedNumber(garantie)} ani` : undefined,
      tensiuneNominala: carouselTemplate ? undefined : tensiuneNominala ? `${String(tensiuneNominala).replace(',', '.')} V` : undefined,
      eficientaCiclu: carouselTemplate ? undefined : eficientaCiclu ? `${parseFormattedNumber(eficientaCiclu)}%` : undefined,
      temperaturaFunctionare:
        carouselTemplate ? undefined : (temperaturaFunctionareMin || temperaturaFunctionareMax)
          ? `${temperaturaFunctionareMin || '?'} ~ ${temperaturaFunctionareMax || '?'}°C`
          : undefined,
      temperaturaStocare:
        carouselTemplate ? undefined : (temperaturaStocareMin || temperaturaStocareMax)
          ? `${temperaturaStocareMin || '?'} ~ ${temperaturaStocareMax || '?'}°C`
          : undefined,
      umiditate:
        carouselTemplate ? undefined : (umiditateMin || umiditateMax) ? `${umiditateMin || '?'} ~ ${umiditateMax || '?'}%` : undefined,
      images: imageUrls,
      cardImage: cardImageOut,
      documenteTehnice: docTehniceFinal,
      faq: faqFiltered,
      alimentaModalContent: alimentaParsed,
    }

    if (carouselTemplate) {
      payload.subtitle = subtitle.trim() || undefined
      payload.overview = overview.trim() || undefined
      payload.keyAdvantages = keyAdvPayload
      payload.technicalSpecsModels = technicalSpecsModelsOut
    }

    return payload
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const payload = await buildPayload()
      if (editingProductId) {
        const updated = await updateProduct(editingProductId, payload, 'published')
        setSaveSuccess(true)
        setProducts((prev) => prev.map((p) => (p.id === editingProductId ? (updated as AdminProduct) : p)))
      } else {
        const created = await createProduct(payload, 'published')
        setSaveSuccess(true)
        setProducts((prev) => [created as AdminProduct, ...prev])
      }
      await fetchProducts()
      handleClosePanel()
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Eroare la salvare.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const payload = await buildPayload()
      if (editingProductId) {
        const updated = await updateProduct(editingProductId, payload, 'draft')
        setSaveSuccess(true)
        setProducts((prev) => prev.map((p) => (p.id === editingProductId ? (updated as AdminProduct) : p)))
      } else {
        const created = await createProduct(payload, 'draft')
        setSaveSuccess(true)
        setProducts((prev) => [created as AdminProduct, ...prev])
      }
      await fetchProducts()
      handleClosePanel()
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Eroare la salvare.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleGoLive = async (id: string) => {
    setSaveError(null)
    try {
      await updateProductStatus(id, 'published')
      await fetchProducts()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Eroare la actualizare.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sigur ștergi acest produs?')) return
    setSaveError(null)
    try {
      await deleteProduct(id)
      await fetchProducts()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Eroare la ștergere.')
    }
  }

  const panelVisible = panelOpen || isClosingPanel

  return (
    <div className={`flex flex-col w-full min-h-0 ${panelVisible ? 'h-[calc(100vh-4rem)] lg:h-screen overflow-hidden' : ''}`}>
      {/* Tab bar — full width, sticky on scroll */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white shrink-0 shadow-sm">
        <h1 className="text-xl font-bold font-['Inter'] text-black">Produse</h1>
        {panelVisible ? (
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-sm text-green-600 font-medium mr-2">Produsul a fost salvat.</span>
            )}
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
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-sm text-green-600 font-medium">Produsul a fost salvat.</span>
            )}
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
          </div>
        )}
      </div>

      {/* Content: list left, panel right (slides from left) */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: product list — half screen */}
        <div className={`w-1/2 min-w-0 shrink-0 p-5 overflow-y-auto ${panelVisible ? 'overflow-hidden' : ''}`}>
          {productsLoading ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex items-center justify-center">
              <p className="text-gray-500 text-sm">Se încarcă produsele…</p>
            </div>
          ) : productsError ? (
            <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-sm">
              <p className="text-red-600 text-sm mb-2">{productsError}</p>
              {productsError.includes('Rută negăsită') && (
                <p className="text-gray-600 text-xs mb-3">
                  Asigură-te că API-ul rulează local (npm run dev:api) sau că ai făcut deploy pe Railway cu ultimele modificări.
                </p>
              )}
              <button type="button" onClick={fetchProducts} className="text-sm font-medium text-slate-700 hover:underline">Reîncearcă</button>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
              <p className="text-gray-500 text-sm font-['Inter']">
                Nu există produse în baza de date. Adaugă primul produs.
              </p>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-sm font-medium text-gray-600 mr-1">Filtre:</span>
                {(['all', 'rezidential', 'industrial', 'medical', 'maritim'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCategorie(cat)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filterCategorie === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat === 'all' ? 'Toate' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
              {(() => {
                const filtered = filterCategorie === 'all'
                  ? products
                  : products.filter((p) => {
                      const cat = String((p as { categorie?: string }).categorie || '').toLowerCase()
                      return cat.includes(filterCategorie)
                    })
                return (
                  <>
                    <p className="text-sm text-gray-500 mb-3 font-['Inter']">
                      {filtered.length} produs{filtered.length === 1 ? '' : 'e'}
                      {filterCategorie !== 'all' && ` (${products.length} total)`}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {filtered.map((p) => {
                  const imgs = Array.isArray(p.images) ? p.images : []
                  const thumb =
                    String((p as { cardImage?: string }).cardImage || '').trim() || imgs[0] || ''
                  const conectivitate = [
                    p.conectivitateWifi && 'WiFi',
                    p.conectivitateBluetooth && 'Bluetooth',
                  ].filter(Boolean).join(', ') || '—'
                  const priceVal = p.salePrice
                  const priceStr = priceVal != null ? String(priceVal) : null
                  return (
                    <div key={p.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                      {/* Image on top */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                        {thumb ? (
                          <img src={thumb} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">—</div>
                        )}
                        {/* Photo count badge — bottom left */}
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/50 text-white text-xs font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{imgs.length}</span>
                        </div>
                        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${
                            p.status === 'published' ? 'bg-green-100 text-green-700' :
                            p.status === 'suspended' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {p.status === 'published' ? (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Live
                              </>
                            ) : p.status === 'suspended' ? (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                Suspended
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Draft
                              </>
                            )}
                          </span>
                          <div className="flex gap-1">
                            <button type="button" onClick={() => handleEditClick(p)} title="Editează" className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-gray-600 shadow-sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            {p.status === 'draft' && (
                              <button type="button" onClick={() => handleGoLive(p.id)} title="Go Live" className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-green-600 shadow-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </button>
                            )}
                            <button type="button" onClick={() => handleDelete(p.id)} title="Șterge" className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-red-600 shadow-sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* Title, description, details, price */}
                      <div className="p-4 flex flex-col gap-2 flex-1">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">{p.title || 'Fără titlu'}</h3>
                        {p.brand && <p className="text-xs text-gray-500">Brand: {p.brand}</p>}
                        {p.description && <p className="text-xs text-gray-600 line-clamp-2">{p.description}</p>}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                          {p.tensiuneNominala && <span>Tensiune: {p.tensiuneNominala}</span>}
                          {p.capacitate && <span>Capacitate: {p.capacitate}</span>}
                          {p.compozitie && <span>Compoziție: {p.compozitie}</span>}
                          {p.cicluriDescarcare && <span>Cicluri: {p.cicluriDescarcare}</span>}
                          <span>Conectivitate: {conectivitate}</span>
                        </div>
                        {priceStr && !Number.isNaN(Number(priceStr)) && (
                          <p className="text-sm font-semibold text-gray-800 mt-auto">{Number(priceStr).toLocaleString('ro-RO')} lei</p>
                        )}
                      </div>
                    </div>
                  )
                })}
                    </div>
                  </>
                )
              })()}
            </>
          )}
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
              <h2 className="text-lg font-bold font-['Inter'] text-black mb-2">{editingProductId ? 'Editează produs' : 'Adaugă produs'}</h2>

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
                {tipProdus === 'industrial' && (
                  <p className="mt-2 text-xs text-slate-600 font-['Inter'] rounded-lg bg-slate-100 border border-slate-200 px-3 py-2">
                    <strong>Industrial</strong> — șablon cu carousel, Overview, avantaje cheie și broșură PDF. Folosește câmpurile de mai jos (subtitlu, overview, imagini, avantaje).
                  </p>
                )}
                {tipProdus === 'rezidential' && (
                  <p className="mt-2 text-xs text-slate-600 font-['Inter'] rounded-lg bg-slate-100 border border-slate-200 px-3 py-2">
                    <strong>Rezidențial</strong> — șablon clasic: descriere, preț, specificații tehnice complete, documente multiple, FAQ, opțional „Ce se poate alimenta”.
                  </p>
                )}
              </div>

              {/* Categorie */}
              <div>
                <label className="block text-sm font-bold font-['Inter'] text-gray-900 mb-3">Categorie</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={categorieRezidential} onChange={(e) => setCategorieRezidential(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900" />
                    <span className="text-sm font-['Inter'] text-gray-800">Rezidential</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={categorieIndustrial} onChange={(e) => setCategorieIndustrial(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900" />
                    <span className="text-sm font-['Inter'] text-gray-800">Industrial</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={categorieMedical} onChange={(e) => setCategorieMedical(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900" />
                    <span className="text-sm font-['Inter'] text-gray-800">Medical</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={categorieMaritim} onChange={(e) => setCategorieMaritim(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900" />
                    <span className="text-sm font-['Inter'] text-gray-800">Maritim</span>
                  </label>
                </div>
              </div>

              {/* SKU */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <label htmlFor="product-sku" className="block text-sm font-semibold font-['Inter'] text-gray-700">
                    SKU
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
                  className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              {/* Brand + Descriere Produs */}
              <div className="pt-2 border-t border-gray-200">
                <div className="mb-4">
                  <label htmlFor="product-brand" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Brand</label>
                  <select id="product-brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-white">
                    <option value="">Selectează brand</option>
                    <option value="Lithtech">Lithtech</option>
                  </select>
                </div>
                <h3 className="text-sm font-bold font-['Inter'] text-gray-900 mb-4">Descriere produs</h3>
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
                      placeholder={tipProdus === 'industrial' ? 'Titlu principal (hero)' : 'Ex: EcoHome 5 kWh'}
                      className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                  {tipProdus === 'industrial' ? (
                    <div>
                      <label htmlFor="product-subtitle" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
                        Subtitlu
                      </label>
                      <input
                        id="product-subtitle"
                        type="text"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        placeholder="Subtitlu sub titlu (ex: tagline scurt)"
                        className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                      />
                    </div>
                  ) : (
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
                  )}
                  <div>
                    <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
                      Upload Product Photo
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Afișată pe cardurile de produs (listă, acasă, parteneri). Dacă nu încarci nimic aici, se folosește prima imagine din galerie.
                    </p>
                    <input
                      ref={cardPhotoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onCardPhotoChange}
                    />
                    <div className="flex flex-wrap items-center gap-4">
                      {cardPhoto.preview ? (
                        <img
                          src={cardPhoto.preview}
                          alt=""
                          className="h-28 w-28 object-cover rounded-xl border border-gray-200 bg-neutral-50"
                        />
                      ) : null}
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => cardPhotoInputRef.current?.click()}
                          className="h-10 px-4 rounded-xl border border-gray-300 text-sm font-medium font-['Inter'] text-gray-700 hover:bg-gray-50 bg-white w-fit"
                        >
                          Alege fișier
                        </button>
                        {cardPhoto.preview ? (
                          <button
                            type="button"
                            onClick={clearCardPhoto}
                            className="text-sm text-red-600 hover:underline text-left w-fit font-['Inter']"
                          >
                            Elimină fotografia
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Section */}
              {tipProdus === 'rezidential' && (
              <div className="pt-2 border-t border-gray-200">
                <h3 className="text-sm font-bold font-['Inter'] text-gray-900 mb-4">Preț</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <div>
                    <label htmlFor="product-landed-price" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
                      Landed Price (RON)
                    </label>
                    <input
                      id="product-landed-price"
                      type="text"
                      inputMode="decimal"
                      value={landedPrice}
                      onChange={(e) => handleNumericInput(e.target.value, setLandedPrice)}
                      placeholder="Ex: 15.000"
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
                      placeholder="Ex: 15.840"
                      className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-vat" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">
                      TVA (%)
                    </label>
                    <input
                      id="product-vat"
                      type="text"
                      inputMode="decimal"
                      value={vat}
                      onChange={(e) => handleNumericInput(e.target.value, setVat)}
                      placeholder="Ex: 19"
                      className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Detalii tehnice produs */}
              {tipProdus === 'rezidential' && (
              <div className="pt-2 border-t border-gray-200">
                <h3 className="text-sm font-bold font-['Inter'] text-gray-900 mb-4">Detalii tehnice produs</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <div>
                    <label htmlFor="product-energie-nominala" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Energie nominală</label>
                    <div className="relative">
                      <input id="product-energie-nominala" type="text" inputMode="numeric" value={energieNominala} onChange={(e) => handleIntegerOnly(e.target.value, setEnergieNominala)} placeholder="5.120" className="w-full h-11 pl-4 pr-12 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">Wh</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="product-capacitate" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Capacitate</label>
                    <div className="relative">
                      <input id="product-capacitate" type="text" inputMode="numeric" value={capacitate} onChange={(e) => handleIntegerOnly(e.target.value, setCapacitate)} placeholder="100" className="w-full h-11 pl-4 pr-12 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">Ah</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="product-curent-descarcare" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Curent max. descărcare</label>
                    <div className="relative">
                      <input id="product-curent-descarcare" type="text" inputMode="numeric" value={curentMaxDescarcare} onChange={(e) => handleIntegerOnly(e.target.value, setCurentMaxDescarcare)} placeholder="100" className="w-full h-11 pl-4 pr-12 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">A</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="product-curent-incarcare" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Curent max. încărcare</label>
                    <div className="relative">
                      <input id="product-curent-incarcare" type="text" inputMode="numeric" value={curentMaxIncarcare} onChange={(e) => handleIntegerOnly(e.target.value, setCurentMaxIncarcare)} placeholder="50" className="w-full h-11 pl-4 pr-12 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">A</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="product-cicluri" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Cicluri</label>
                    <div className="relative">
                      <input id="product-cicluri" type="text" inputMode="numeric" value={cicluriDescarcare} onChange={(e) => handleIntegerOnly(e.target.value, setCicluriDescarcare)} placeholder="5.000" className="w-full h-11 pl-4 pr-20 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">Cicluri</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="product-adancime-descarcare" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Adâncime descărcare (DOD)</label>
                    <div className="relative">
                      <input id="product-adancime-descarcare" type="text" inputMode="numeric" value={adancimeDescarcare} onChange={(e) => handleIntegerOnly(e.target.value, setAdancimeDescarcare)} placeholder="60" className="w-full h-11 pl-4 pr-12 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">%</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="product-greutate" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Greutate</label>
                    <div className="relative">
                      <input id="product-greutate" type="text" value={greutate} onChange={(e) => handleNumericInput(e.target.value, setGreutate)} placeholder="46" className="w-full h-11 pl-4 pr-12 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">Kg</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="product-compozitie" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Compoziție</label>
                    <select id="product-compozitie" value={compozitie} onChange={(e) => setCompozitie(e.target.value)} className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-white">
                      <option value="">Selectează</option>
                      <option value="LiFePo4">LiFePo4</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Dimensiuni (mm)</label>
                    <div className="flex gap-2 items-center w-full">
                      <div className="flex-1 min-w-0">
                        <label htmlFor="product-dims-l" className="block text-xs text-gray-500 mb-1">L (mm)</label>
                        <input id="product-dims-l" type="text" inputMode="numeric" maxLength={5} value={dimensiuniL} onChange={(e) => handleDimensionInput(e.target.value, setDimensiuniL)} placeholder="460" className="w-full h-11 px-3 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                      </div>
                      <span className="text-gray-400 pt-5 shrink-0">×</span>
                      <div className="flex-1 min-w-0">
                        <label htmlFor="product-dims-w" className="block text-xs text-gray-500 mb-1">l (mm)</label>
                        <input id="product-dims-w" type="text" inputMode="numeric" maxLength={5} value={dimensiuniW} onChange={(e) => handleDimensionInput(e.target.value, setDimensiuniW)} placeholder="400" className="w-full h-11 px-3 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                      </div>
                      <span className="text-gray-400 pt-5 shrink-0">×</span>
                      <div className="flex-1 min-w-0">
                        <label htmlFor="product-dims-h" className="block text-xs text-gray-500 mb-1">h (mm)</label>
                        <input id="product-dims-h" type="text" inputMode="numeric" maxLength={5} value={dimensiuniH} onChange={(e) => handleDimensionInput(e.target.value, setDimensiuniH)} placeholder="130" className="w-full h-11 px-3 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label htmlFor="product-protectie" className="block text-sm font-semibold font-['Inter'] text-gray-700">Protecție (IP)</label>
                      <div className="relative group">
                        <button type="button" className="w-5 h-5 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 flex items-center justify-center" aria-label="Explicație IP">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <div className="absolute left-0 top-full mt-1 z-10 hidden group-hover:block w-72 p-3 bg-gray-900 text-white text-xs font-['Inter'] rounded-lg shadow-lg">
                          <p className="font-semibold mb-2">Clasificare IP (Ingress Protection)</p>
                          <p className="text-gray-300 mb-2">Prima cifră: obiecte solide (0–6). A doua cifră: apă/umiditate (0–9).</p>
                          <ul className="space-y-1 text-gray-300">
                            <li><strong>IP20</strong> – Interior, protecție degete</li>
                            <li><strong>IP54</strong> – Praf limitat, stropire apă</li>
                            <li><strong>IP65</strong> – Etanș praf, jeturi apă (exterior)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <select id="product-protectie" value={protectie} onChange={(e) => setProtectie(e.target.value)} className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-white">
                      <option value="">Selectează</option>
                      <option value="IP20">IP20 – Interior (protecție degete)</option>
                      <option value="IP21">IP21 – Interior (picături verticale)</option>
                      <option value="IP54">IP54 – Exterior parțial (praf limitat, stropire)</option>
                      <option value="IP55">IP55 – Exterior (jeturi apă)</option>
                      <option value="IP65">IP65 – Exterior (etanș praf, jeturi apă)</option>
                      <option value="IP66">IP66 – Exterior (jeturi puternice)</option>
                      <option value="IP67">IP67 – Scufundare temporară</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Conectivitate</label>
                    <div className="h-11 flex items-center justify-center gap-4 border border-gray-300 rounded-xl px-4 bg-white">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={conectivitateWifi} onChange={(e) => setConectivitateWifi(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900" />
                        <span className="text-sm font-['Inter'] text-gray-800">WiFi</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={conectivitateBluetooth} onChange={(e) => setConectivitateBluetooth(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900" />
                        <span className="text-sm font-['Inter'] text-gray-800">Bluetooth</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Protecție la foc</label>
                    <div className="h-11 flex items-center justify-center gap-4 border border-gray-300 rounded-xl px-4 bg-white">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="protectieFoc" checked={protectieFoc === 'protectie'} onChange={() => setProtectieFoc('protectie')} className="w-4 h-4 border-gray-300 text-slate-900 focus:ring-slate-900" />
                        <span className="text-sm font-['Inter'] text-gray-800">Protecție la foc</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="protectieFoc" checked={protectieFoc === 'fara'} onChange={() => setProtectieFoc('fara')} className="w-4 h-4 border-gray-300 text-slate-900 focus:ring-slate-900" />
                        <span className="text-sm font-['Inter'] text-gray-800">Fără protecție la foc</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="product-certificari" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Certificări</label>
                    <input id="product-certificari" type="text" value={certificari} onChange={(e) => setCertificari(e.target.value)} placeholder="CE, IEC 62133, UN38.3" className="w-full h-11 px-4 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                  </div>
                  <div>
                    <label htmlFor="product-garantie" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Garanție</label>
                    <div className="relative">
                      <input id="product-garantie" type="text" inputMode="numeric" value={garantie} onChange={(e) => handleIntegerOnly(e.target.value, setGarantie)} placeholder="10" className="w-full h-11 pl-4 pr-14 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">ani</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="product-tensiune-nominala" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Tensiune nominală</label>
                    <div className="relative">
                      <input id="product-tensiune-nominala" type="text" inputMode="decimal" value={tensiuneNominala} onChange={(e) => handleDecimalInput(e.target.value, setTensiuneNominala)} placeholder="51.2" className="w-full h-11 pl-4 pr-12 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">V</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="product-eficienta-ciclu" className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Eficiență ciclu complet</label>
                    <div className="relative">
                      <input id="product-eficienta-ciclu" type="text" inputMode="numeric" value={eficientaCiclu} onChange={(e) => handleIntegerOnly(e.target.value, setEficientaCiclu)} placeholder="96" className="w-full h-11 pl-4 pr-12 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Temperatura funcționare</label>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1 relative">
                        <input id="product-temp-func-min" type="text" inputMode="numeric" value={temperaturaFunctionareMin} onChange={(e) => handleTemperatureInput(e.target.value, setTemperaturaFunctionareMin)} placeholder="-20" className="w-full h-11 pl-4 pr-12 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">°C</span>
                      </div>
                      <span className="text-gray-400 shrink-0">–</span>
                      <div className="flex-1 relative">
                        <input id="product-temp-func-max" type="text" inputMode="numeric" value={temperaturaFunctionareMax} onChange={(e) => handleTemperatureInput(e.target.value, setTemperaturaFunctionareMax)} placeholder="55" className="w-full h-11 pl-4 pr-12 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">°C</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Temperatura stocare</label>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1 relative">
                        <input id="product-temp-stoc-min" type="text" inputMode="numeric" value={temperaturaStocareMin} onChange={(e) => handleTemperatureInput(e.target.value, setTemperaturaStocareMin)} placeholder="-10" className="w-full h-11 pl-4 pr-12 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">°C</span>
                      </div>
                      <span className="text-gray-400 shrink-0">–</span>
                      <div className="flex-1 relative">
                        <input id="product-temp-stoc-max" type="text" inputMode="numeric" value={temperaturaStocareMax} onChange={(e) => handleTemperatureInput(e.target.value, setTemperaturaStocareMax)} placeholder="50" className="w-full h-11 pl-4 pr-12 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">°C</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold font-['Inter'] text-gray-700 mb-2">Umiditate</label>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1 relative">
                        <input id="product-umiditate-min" type="text" inputMode="numeric" value={umiditateMin} onChange={(e) => handleIntegerOnly(e.target.value, setUmiditateMin)} placeholder="5" className="w-full h-11 pl-4 pr-12 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">%</span>
                      </div>
                      <span className="text-gray-400 shrink-0">–</span>
                      <div className="flex-1 relative">
                        <input id="product-umiditate-max" type="text" inputMode="numeric" value={umiditateMax} onChange={(e) => handleIntegerOnly(e.target.value, setUmiditateMax)} placeholder="95" className="w-full h-11 pl-4 pr-12 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* Add Images */}
              <div className="pt-2 border-t border-gray-200">
                <h3 className="text-sm font-bold font-['Inter'] text-gray-900 mb-4">
                  {tipProdus === 'industrial' ? 'Imagini carousel' : 'Imagini'}
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  {tipProdus === 'industrial'
                    ? 'Încarcă imaginile pentru caruselul din pagina produsului (max. 5).'
                    : 'Opțional (max. 5). Poți șterge sau înlocui orice imagine.'}
                </p>
                <div
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors min-h-[200px] ${
                    isDragging ? 'border-slate-500 bg-slate-50/50' : 'border-gray-300 hover:border-gray-400'
                  }`}
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
                      const idx = replaceIndexRef.current
                      replaceIndexRef.current = null
                      if (idx !== null && e.target.files?.[0]) {
                        const f = e.target.files[0]
                        if (f.type.startsWith('image/')) {
                          setImages((prev) => {
                            const next = [...prev]
                            URL.revokeObjectURL(next[idx].preview)
                            next[idx] = { file: f, preview: URL.createObjectURL(f) }
                            return next
                          })
                        }
                      } else if (idx === null) {
                        addImages(e.target.files)
                      }
                      e.target.value = ''
                    }}
                  />
                  {images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4 justify-items-center">
                      {images.map(({ preview }, i) => (
                        <div key={i} className="relative group">
                          <img src={preview} alt="" className="h-28 w-28 object-cover rounded-lg border border-gray-200 cursor-pointer" onClick={(e) => { e.stopPropagation(); replaceImage(i) }} title="Înlocuiește" />
                          <div className="absolute inset-0 flex gap-1 items-end justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-lg">
                            <button type="button" onClick={(e) => { e.stopPropagation(); replaceImage(i) }} className="px-2 py-0.5 bg-white/90 text-gray-800 text-xs rounded hover:bg-white">Înlocuiește</button>
                            <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(i) }} className="px-2 py-0.5 bg-red-500 text-white text-xs rounded hover:bg-red-600">Șterge</button>
                          </div>
                        </div>
                      ))}
                      {images.length < MAX_IMAGES && (
                        <div className="h-28 w-28 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                          + {MAX_IMAGES - images.length}
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

              {tipProdus === 'industrial' && (
                <>
                  <div className="pt-2 border-t border-gray-200">
                    <label htmlFor="product-overview" className="block text-sm font-bold font-['Inter'] text-gray-900 mb-2">
                      Overview
                    </label>
                    <p className="text-xs text-gray-500 mb-2">Text pentru secțiunea Overview de pe pagina produsului.</p>
                    <textarea
                      id="product-overview"
                      value={overview}
                      onChange={(e) => setOverview(e.target.value)}
                      placeholder="Introdu textul overview…"
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-['Inter'] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 resize-y"
                    />
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="text-sm font-bold font-['Inter'] text-gray-900">Avantaje cheie</h3>
                      <button
                        type="button"
                        onClick={addKeyAdvantage}
                        className="h-9 px-3 rounded-lg border border-gray-300 text-sm font-medium font-['Inter'] text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        + Adaugă casetă
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      Pentru fiecare casetă: titlu și imagine. Afișate în pagina publică în secțiunea cu file Key Advantages.
                    </p>
                    <input
                      ref={advantageFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onAdvantageFileChange}
                    />
                    <div className="flex flex-col gap-4">
                      {keyAdvantages.map((row, i) => (
                        <div key={i} className="rounded-xl border border-gray-200 p-4 space-y-3 bg-neutral-50/80">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-gray-600">Casetă {i + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeKeyAdvantage(i)}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Elimină
                            </button>
                          </div>
                          <div>
                            <label htmlFor={`ka-title-${i}`} className="block text-xs font-semibold font-['Inter'] text-gray-700 mb-1">
                              Titlu
                            </label>
                            <input
                              id={`ka-title-${i}`}
                              type="text"
                              value={row.title}
                              onChange={(e) => setKeyAdvantageTitle(i, e.target.value)}
                              placeholder="Titlu avantaj"
                              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm font-['Inter'] text-gray-800"
                            />
                          </div>
                          <div>
                            <span className="block text-xs font-semibold font-['Inter'] text-gray-700 mb-1">Imagine</span>
                            <div className="flex items-center gap-3 flex-wrap">
                              {(row.preview || row.url) && (
                                <img
                                  src={row.preview || row.url}
                                  alt=""
                                  className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                                />
                              )}
                              <button
                                type="button"
                                onClick={() => triggerAdvantageUpload(i)}
                                className="h-10 px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-white bg-white"
                              >
                                {row.file || row.url ? 'Înlocuiește imaginea' : 'Încarcă imagine'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <h3 className="text-sm font-bold font-['Inter'] text-gray-900">Specificații tehnice</h3>
                      <button
                        type="button"
                        onClick={addTechnicalSpecModel}
                        className="h-9 px-3 rounded-lg border border-gray-300 text-sm font-medium font-['Inter'] text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
                      >
                        + Adaugă model
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">
                      La fiecare model completezi <strong>toate</strong> câmpurile (același set ca în tabelul din șablonul industrial). Pe site, fiecare model devine o <strong>coloană</strong> în tabelul din fila Technical specification.
                    </p>

                    {technicalSpecs.entries.length === 0 ? (
                      <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                        Apasă „Adaugă model” pentru a adăuga un bloc cu nume model și câmpuri tehnice.
                      </p>
                    ) : null}

                    <div className="flex flex-col gap-4">
                      {technicalSpecs.entries.map((entry, ei) => {
                        const specModelOpen = technicalSpecModelExpanded[ei] ?? true
                        return (
                          <div
                            key={ei}
                            className="rounded-xl border border-gray-200 bg-neutral-50/80 p-4 space-y-3"
                          >
                            <div
                              className={`flex flex-wrap items-center justify-between gap-2 pb-3 ${specModelOpen ? 'border-b border-gray-200' : ''}`}
                            >
                              <button
                                type="button"
                                onClick={() => toggleTechnicalSpecModelExpanded(ei)}
                                className="flex items-center gap-2 min-w-0 text-left rounded-lg -ml-1 pl-1 pr-2 py-1 hover:bg-gray-100/80 transition-colors"
                                aria-expanded={specModelOpen}
                              >
                                <ChevronDown
                                  className={`h-4 w-4 shrink-0 text-gray-600 transition-transform ${specModelOpen ? '' : '-rotate-90'}`}
                                  aria-hidden
                                />
                                <span className="text-sm font-bold font-['Inter'] text-gray-900 truncate">
                                  Model {ei + 1}
                                  {entry.modelName.trim() ? ` — ${entry.modelName.trim()}` : ''}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => removeTechnicalSpecModel(ei)}
                                className="text-sm text-red-600 hover:underline font-['Inter'] shrink-0"
                              >
                                Elimină modelul
                              </button>
                            </div>
                            {specModelOpen ? (
                              <>
                                <div>
                                  <label htmlFor={`spec-model-name-${ei}`} className="block text-xs font-semibold font-['Inter'] text-gray-700 mb-1">
                                    Nume / cod model
                                  </label>
                                  <input
                                    id={`spec-model-name-${ei}`}
                                    type="text"
                                    value={entry.modelName}
                                    onChange={(e) => setTechnicalSpecModelName(ei, e.target.value)}
                                    placeholder="ex. LTS1331314L-01"
                                    className="w-full max-w-md h-10 px-3 border border-gray-300 rounded-lg text-sm font-['Inter'] text-gray-800"
                                  />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 max-h-[min(60vh,480px)] overflow-y-auto pr-1">
                                  {INDUSTRIAL_SPEC_FIELDS.map((field) => (
                                    <div key={field.key}>
                                      <label
                                        htmlFor={`spec-${ei}-${field.key}`}
                                        className="block text-xs font-semibold font-['Inter'] text-gray-700 mb-1"
                                      >
                                        {field.label}
                                      </label>
                                      <input
                                        id={`spec-${ei}-${field.key}`}
                                        type="text"
                                        value={entry.specs[field.key] ?? ''}
                                        onChange={(e) => setTechnicalSpecField(ei, field.key, e.target.value)}
                                        className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm font-['Inter'] text-gray-800"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Documente tehnice */}
              <div className="pt-2 border-t border-gray-200">
                {tipProdus === 'rezidential' ? (
                  <>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <h3 className="text-sm font-bold font-['Inter'] text-gray-900">Documente tehnice</h3>
                      <button
                        type="button"
                        onClick={addDocumentItem}
                        className="h-9 px-3 rounded-lg border border-gray-300 text-sm font-medium font-['Inter'] text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 shrink-0"
                        aria-label="Adaugă document"
                        title="Adaugă document"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Adaugă
                      </button>
                    </div>
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
                              className="h-10 px-4 rounded-lg border border-gray-300 text-sm font-medium font-['Inter'] text-gray-700 hover:bg-gray-50 transition-colors min-w-[100px] max-w-[160px] flex items-center gap-2"
                              title={doc.file?.name}
                            >
                              <span className="block truncate">{doc.file ? doc.file.name : 'Upload PDF'}</span>
                              {doc.file && (
                                <span
                                  role="button"
                                  tabIndex={0}
                                  onClick={(e) => { e.stopPropagation(); removeDocumentFile(i) }}
                                  onKeyDown={(e) => e.key === 'Enter' && removeDocumentFile(i)}
                                  className="text-gray-400 hover:text-red-600 text-lg leading-none"
                                  aria-label="Șterge fișier"
                                  title="Șterge fișier"
                                >
                                  ×
                                </span>
                              )}
                            </button>
                            {documenteTehnice.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeDocumentItem(i)}
                                className="h-10 px-3 rounded-lg border border-gray-300 text-xs font-medium font-['Inter'] text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                                aria-label="Șterge rând"
                                title="Șterge rând"
                              >
                                Șterge rând
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Doar fișiere .pdf acceptate. Click pentru înlocuire, × pentru ștergerea fișierului.</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-bold font-['Inter'] text-gray-900 mb-2">Broșură tehnică</h3>
                    <p className="text-xs text-gray-500 mb-3">Un singur fișier PDF.</p>
                    <input
                      ref={docFileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={handleDocFileChange}
                    />
                    {documenteTehnice[0] && (
                      <div className="flex gap-3 items-center flex-wrap">
                        <button
                          type="button"
                          onClick={() => { docUploadIndexRef.current = 0; triggerDocUpload(0) }}
                          className="h-10 px-4 rounded-lg border border-gray-300 text-sm font-medium font-['Inter'] text-gray-700 hover:bg-gray-50"
                        >
                          {documenteTehnice[0].file
                            ? documenteTehnice[0].file.name
                            : documenteTehnice[0].url
                              ? 'PDF încărcat (înlocuiește)'
                              : 'Încarcă PDF'}
                        </button>
                        {(documenteTehnice[0].file || documenteTehnice[0].url) && (
                          <button
                            type="button"
                            onClick={() => setDocumenteTehnice([{ descriere: '', file: null }])}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Elimină fișier
                          </button>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Doar PDF este acceptat.</p>
                  </>
                )}
              </div>

              {/* Întrebări frecvente */}
              <div className="pt-2 border-t border-gray-200">
                <h3 className="text-sm font-bold font-['Inter'] text-gray-900 mb-4">Întrebări frecvente</h3>
                <p className="text-xs text-gray-500 mb-3">Opțional.</p>
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

              {/* Ce se poate alimenta – conținut modal personalizat (șablon clasic / rezidențial) */}
              {tipProdus === 'rezidential' && (
                <div className="pt-2 border-t border-gray-200">
                  <h3 className="text-sm font-bold font-['Inter'] text-gray-900 mb-4">Ce se poate alimenta – conținut modal</h3>
                  <p className="text-xs text-gray-500 mb-3">Opțional. JSON: {"{ title, intro?, sections: [{ label, items: string[] }] }"}. Dacă gol, se folosește conținutul implicit (5kWh).</p>
                  <textarea
                    value={alimentaModalContent}
                    onChange={(e) => setAlimentaModalContent(e.target.value)}
                    placeholder='{"title":"Ce se poate alimenta cu o baterie de 10kWh?","intro":"Capacitate ~9–10 kWh.","sections":[{"label":"Autonomie estimativă","items":["300W → ~30h","500W → ~18–20h"]}]}'
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 resize-y"
                  />
                </div>
              )}

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
