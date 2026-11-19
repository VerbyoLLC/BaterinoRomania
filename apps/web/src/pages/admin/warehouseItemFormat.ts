import type { WarehouseSavedItemBySerial, WarehouseSavedItemLocation } from '../../lib/api'

export const WAREHOUSE_LOCATION_LABELS: Record<WarehouseSavedItemLocation, string> = {
  depozit: 'Depozit',
  distribuitor: 'Distribuitor',
  client_final: 'Client Final',
  service: 'Service',
}

export function warehouseItemLocationLabel(item: WarehouseSavedItemBySerial) {
  const key = String(item.location || 'depozit').trim() as WarehouseSavedItemLocation
  return WAREHOUSE_LOCATION_LABELS[key] ?? 'Depozit'
}

export function formatWarehouseItemLocation(item: WarehouseSavedItemBySerial) {
  const key = String(item.location || 'depozit').trim() as WarehouseSavedItemLocation
  const label = warehouseItemLocationLabel(item)
  const who =
    key === 'distribuitor' ? item.distributor : key !== 'depozit' ? item.clientName || (key === 'client_final' ? item.client : null) : null
  return who ? `${label} — ${who}` : label
}

export function formatWarehouseItemModel(item: WarehouseSavedItemBySerial) {
  const name = item.modelName && item.modelName !== item.modelNumber ? ` — ${item.modelName}` : ''
  const brand = item.brand ? ` [${item.brand}]` : ''
  return `${item.modelNumber}${name}${brand}`
}
