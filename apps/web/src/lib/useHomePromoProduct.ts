import { useEffect, useState } from 'react'
import { getProductAsGuest, type PublicProduct } from './api'
import { HOME_PROMO_PRODUCT_SLUG } from './homePromoPrice'

/** Load the catalog product linked to the homepage promo offer. */
export function useHomePromoProduct(enabled = true) {
  const [product, setProduct] = useState<PublicProduct | null>(null)
  const [loading, setLoading] = useState(enabled)

  useEffect(() => {
    if (!enabled || !HOME_PROMO_PRODUCT_SLUG) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    getProductAsGuest(HOME_PROMO_PRODUCT_SLUG)
      .then((p) => {
        if (!cancelled) setProduct(p)
      })
      .catch(() => {
        if (!cancelled) setProduct(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [enabled])

  return { product, loading }
}
