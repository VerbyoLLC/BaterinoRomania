import { MapPin } from 'lucide-react'
import type { ProductCaseStudyExample } from '../../lib/productCaseStudies'

type Props = {
  title: string
  items: ProductCaseStudyExample[]
  className?: string
}

export default function ProductCaseStudiesSection({ title, items, className = '' }: Props) {
  if (items.length === 0) return null

  return (
    <section className={className} aria-labelledby="product-case-studies-heading">
      <h2 id="product-case-studies-heading" className="text-black text-lg font-bold font-['Inter'] mb-4 sm:mb-6">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {items.map((item, i) => (
          <article
            key={`${item.title}-${i}`}
            className="overflow-hidden rounded-[10px] border border-neutral-200/80 bg-white shadow-sm"
          >
            {item.image ? (
              <div className="aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                <img
                  src={item.image}
                  alt={item.title || ''}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ) : (
              <div className="aspect-[16/10] w-full bg-neutral-100" aria-hidden />
            )}
            <div className="px-4 py-4 sm:px-5 sm:py-5">
              {item.title ? (
                <h3 className="m-0 text-base font-bold leading-snug text-slate-900 font-['Inter'] sm:text-lg">
                  {item.title}
                </h3>
              ) : null}
              {item.location ? (
                <p
                  className={`m-0 inline-flex items-center gap-1.5 text-sm text-neutral-500 font-['Inter'] ${item.title ? 'mt-2' : ''}`}
                >
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                  <span>{item.location}</span>
                </p>
              ) : null}
              {item.subtitle ? (
                <p
                  className={`m-0 text-sm leading-relaxed text-gray-600 font-['Inter'] sm:text-base ${
                    item.title || item.location ? 'mt-2' : ''
                  }`}
                >
                  {item.subtitle}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
