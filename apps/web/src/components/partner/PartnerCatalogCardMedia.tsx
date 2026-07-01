import type { PublicProduct } from '../../lib/api'
import type { getProduseTranslations } from '../../i18n/produse'
import type { getPartnerProductsTranslations } from '../../i18n/partner/products'
import {
  catalogBadgeLabelsFromProduseTr,
  getCatalogDeliveryBadgeLabel,
  getCatalogStockBadgeLabel,
} from '../../lib/catalogProductBadges'

type Props = {
  product: PublicProduct
  trProduse: ReturnType<typeof getProduseTranslations>
  trProducts: ReturnType<typeof getPartnerProductsTranslations>
  quoteStyle: boolean
}

export function PartnerCatalogCardMedia({ product, trProduse, trProducts, quoteStyle }: Props) {
  const badgeLabels = catalogBadgeLabelsFromProduseTr(trProduse)
  const stockLabel = getCatalogStockBadgeLabel(product, {
    inStock: badgeLabels.stockIn,
    outOfStock: badgeLabels.stockOut,
    comingSoon: badgeLabels.stockSoon,
    onOrder: badgeLabels.stockOnOrder,
  })
  const deliveryLabel = getCatalogDeliveryBadgeLabel(product, {
    h24: badgeLabels.delivery24h,
    h48: badgeLabels.delivery48h,
    d7_14: badgeLabels.delivery7_14d,
    d60: badgeLabels.delivery60d,
  })
  const deliveryCategory = quoteStyle ? trProducts.cardLeadTimeCategory : badgeLabels.deliveryCategory
  const deliveryValue = quoteStyle ? trProducts.cardDeliveryOnRequest : deliveryLabel

  return (
    <>
      {stockLabel ? (
        <span
          className={`absolute left-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${
            quoteStyle ? 'bg-[#eef2f7] text-[#4d6079]' : 'bg-[#eaf7f1] text-[#0e8459]'
          }`}
        >
          <span
            className={`h-[7px] w-[7px] rounded-full ${quoteStyle ? 'bg-[#4d6079]' : 'bg-[#159b6a]'}`}
            aria-hidden
          />
          {stockLabel}
        </span>
      ) : null}
      {deliveryValue ? (
        <span className="absolute right-3.5 top-[15px] text-[11.5px] text-[#6a7281]">
          {deliveryCategory} · <b className="font-semibold text-[#0f1422]">{deliveryValue}</b>
        </span>
      ) : null}
    </>
  )
}
