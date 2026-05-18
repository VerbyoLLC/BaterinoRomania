import { useMemo } from 'react'
import {
  cancelPartnerOrder,
  downloadPartnerOrderInvoice,
  downloadPartnerOrderProforma,
  getPartnerOrders,
  getPartnerPaymentBankDetails,
} from '../../lib/api'
import {
  ResidentialOrdersPage,
  type ResidentialOrdersPortalApi,
} from '../shared/ResidentialOrdersPage'

export default function PartnerOrders() {
  const ordersApi = useMemo<ResidentialOrdersPortalApi>(
    () => ({
      getOrders: getPartnerOrders,
      getPaymentBankDetails: getPartnerPaymentBankDetails,
      downloadProforma: downloadPartnerOrderProforma,
      downloadInvoice: downloadPartnerOrderInvoice,
      cancelOrder: cancelPartnerOrder,
    }),
    [],
  )
  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <div className="w-full max-w-5xl">
        <ResidentialOrdersPage ordersApi={ordersApi} productsHref="/partner/produse" showDiscount={false} />
      </div>
    </div>
  )
}
