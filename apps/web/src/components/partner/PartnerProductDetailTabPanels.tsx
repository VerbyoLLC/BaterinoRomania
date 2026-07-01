import { useState } from 'react'
import {
  BarChart3,
  Download,
  FileText,
  Plus,
  ShieldCheck,
  TrendingUp,
  Zap,
} from 'lucide-react'
import type { PublicProduct } from '../../lib/api'
import type { ProductDetailTranslations } from '../../i18n/product-detail'
import { normalizeProductFaq } from '../../lib/productFaq'
import { normalizeProductCaseStudyExamples } from '../../lib/productCaseStudies'
import ProductCaseStudiesSection from '../product/ProductCaseStudiesSection'
import PartnerProductTechnicalSpecsPanel from './PartnerProductTechnicalSpecsPanel'
import type { PartnerProductDetailTab } from '../ProductDetailRightSection'

const FEATURE_ICONS = [BarChart3, TrendingUp, Zap, ShieldCheck] as const

function downloadTechnicalDoc(doc: { descriere: string; url: string }, fallbackLabel: string) {
  const apiBase = import.meta.env.DEV ? 'http://localhost:3001/api' : `${window.location.origin}/api`
  const proxyUrl = `${apiBase}/download-proxy?url=${encodeURIComponent(doc.url)}`
  const a = document.createElement('a')
  a.href = proxyUrl
  a.download =
    ((doc.descriere || fallbackLabel).replace(/[^a-zA-Z0-9-_ăâîșțĂÂÎȘȚ\s]/g, '') || fallbackLabel) + '.pdf'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

type Props = {
  product: PublicProduct
  tr: ProductDetailTranslations
  langCode: string
  activeTab: PartnerProductDetailTab
}

export default function PartnerProductDetailTabPanels({ product, tr, langCode, activeTab }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const faqItems = normalizeProductFaq(product.faq)
  const caseStudyItems = normalizeProductCaseStudyExamples(product.caseStudyExamples)
  const docs = product.documenteTehnice ?? []
  const lead = String(product.overview ?? product.description ?? '').trim()
  const keyAdvantages = Array.isArray(product.keyAdvantages)
    ? product.keyAdvantages.filter((a) => a?.title?.trim())
    : []

  if (activeTab === 'detalii') {
    return (
      <div className="animate-[fadeIn_.2s_ease]">
        {lead ? (
          <p className="m-0 mb-4 max-w-[64ch] text-sm leading-relaxed text-[#39414f]">{lead}</p>
        ) : null}
        {keyAdvantages.length > 0 ? (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {keyAdvantages.map((item, i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length]
              return (
                <div
                  key={`${item.title}-${i}`}
                  className="flex items-start gap-2.5 rounded-[11px] border border-[#e8eaf0] p-3"
                >
                  <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[#eaf7f1] text-[#0e8459]">
                    <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <b className="block text-[13.5px] text-[#0f1422]">{item.title}</b>
                  </div>
                  {item.image?.startsWith('http') || item.image?.startsWith('/') ? (
                    <img src={item.image} alt="" className="h-8 w-8 shrink-0 rounded object-cover" loading="lazy" />
                  ) : null}
                </div>
              )
            })}
          </div>
        ) : null}
      </div>
    )
  }

  if (activeTab === 'tehnice') {
    return <PartnerProductTechnicalSpecsPanel product={product} tr={tr} langCode={langCode} />
  }

  if (activeTab === 'manuale') {
    if (docs.length === 0) {
      return <p className="m-0 py-6 text-center text-sm text-[#6a7281]">{tr.documenteTehnice}</p>
    }
    return (
      <div className="animate-[fadeIn_.2s_ease]">
        {docs.map((doc, i) => (
          <button
            key={`${doc.url}-${i}`}
            type="button"
            onClick={() => downloadTechnicalDoc(doc, tr.document)}
            className="mb-2 flex w-full items-center gap-3 rounded-[11px] border border-[#e8eaf0] p-[13px_15px] text-left transition hover:border-[#d9dde6] hover:bg-[#f4f5f7]"
          >
            <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-[#eef2f7] text-[#4d6079]">
              <FileText className="h-[17px] w-[17px]" strokeWidth={1.7} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <b className="block text-[13.5px] text-[#0f1422]">{doc.descriere || tr.document}</b>
              <span className="text-[11.5px] text-[#9aa1af]">PDF</span>
            </div>
            <Download className="ml-auto h-[18px] w-[18px] shrink-0 text-[#4d6079]" strokeWidth={1.8} aria-hidden />
          </button>
        ))}
      </div>
    )
  }

  if (activeTab === 'videos') {
    return (
      <div className="animate-[fadeIn_.2s_ease]">
        <div className="flex aspect-video items-center justify-center rounded-[13px] bg-gradient-to-br from-[#1a2030] to-[#0f1422] text-white">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
            <svg className="ml-0.5 h-[22px] w-[22px] fill-white" viewBox="0 0 24 24" aria-hidden>
              <path d="M8 5v14l11-7Z" />
            </svg>
          </span>
        </div>
        <p className="mt-4 text-center text-sm text-[#6a7281]">Videoclipuri de instalare vor fi disponibile în curând.</p>
      </div>
    )
  }

  if (activeTab === 'caseStudies') {
    return <ProductCaseStudiesSection items={caseStudyItems} className="animate-[fadeIn_.2s_ease]" />
  }

  if (activeTab === 'faq') {
    if (faqItems.length === 0) {
      return <p className="m-0 py-6 text-sm text-[#6a7281]">{tr.faqEmpty}</p>
    }
    return (
      <div className="animate-[fadeIn_.2s_ease]">
        {faqItems.map((item, i) => {
          const open = openFaq === i
          return (
            <div key={`${item.q}-${i}`} className="border-b border-[#e8eaf0]">
              <button
                type="button"
                onClick={() => setOpenFaq(open ? null : i)}
                className="flex w-full items-center gap-3 bg-transparent py-[15px] text-left text-sm font-semibold text-[#0f1422]"
              >
                <span className="min-w-0 flex-1">{item.q}</span>
                <span
                  className={`ml-auto shrink-0 text-[#9aa1af] transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
                  aria-hidden
                >
                  <Plus className="h-[18px] w-[18px]" strokeWidth={2} />
                </span>
              </button>
              {open ? (
                <p className="m-0 pb-[15px] text-[13px] leading-relaxed text-[#6a7281] whitespace-pre-wrap">{item.a}</p>
              ) : null}
            </div>
          )
        })}
      </div>
    )
  }

  return null
}
