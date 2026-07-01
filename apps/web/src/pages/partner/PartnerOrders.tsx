import { useMemo } from 'react'
import {
  cancelPartnerOrder,
  downloadPartnerOrderInvoice,
  downloadPartnerOrderProforma,
  getPartnerOrders,
  getPartnerPaymentBankDetails,
  type ClientOrderRow,
} from '../../lib/api'
import {
  ResidentialOrdersPage,
  type ResidentialOrdersPortalApi,
} from '../shared/ResidentialOrdersPage'

function isPartnerActiveOrder(row: ClientOrderRow): boolean {
  if (row.orderKind === 'rfq' || row.fulfillmentStatus === 'cerere_oferta') return true
  const status = String(row.fulfillmentStatus || 'de_platit').trim()
  return status !== 'anulata' && status !== 'livrata'
}

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
      <ResidentialOrdersPage
        ordersApi={ordersApi}
        productsHref="/partner/produse"
        showDiscount={false}
        hidePageTitle
        ordersFilter={isPartnerActiveOrder}
      />
    </div>
  )
}
