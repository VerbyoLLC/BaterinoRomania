import { useMemo } from 'react'
import {
  cancelClientOrder,
  downloadClientOrderInvoice,
  downloadClientOrderProforma,
  getClientOrders,
  getClientPaymentBankDetails,
} from '../../lib/api'
import {
  ResidentialOrdersPage,
  type ResidentialOrdersPortalApi,
} from '../shared/ResidentialOrdersPage'

export default function ClientOrders() {
  const ordersApi = useMemo<ResidentialOrdersPortalApi>(
    () => ({
      getOrders: getClientOrders,
      getPaymentBankDetails: getClientPaymentBankDetails,
      downloadProforma: downloadClientOrderProforma,
      downloadInvoice: downloadClientOrderInvoice,
      cancelOrder: cancelClientOrder,
    }),
    [],
  )
  return <ResidentialOrdersPage ordersApi={ordersApi} />
}
