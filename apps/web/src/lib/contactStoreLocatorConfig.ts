export const BATERINO_MAP_CENTER = { lat: 44.5022567, lng: 26.2100898 } as const
export const BATERINO_PLACE_ID = 'ChIJRarzdvD3sUAR5MNpNun5ajM'
export const BATERINO_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=place_id:${BATERINO_PLACE_ID}`

type ContactStoreLocatorConfiguration = {
  locations: Array<{
    title: string
    address1: string
    address2: string
    coords: { lat: number; lng: number }
    placeId: string
  }>
  mapOptions: {
    center: { lat: number; lng: number }
    fullscreenControl: boolean
    mapTypeControl: boolean
    streetViewControl: boolean
    zoom: number
    zoomControl: boolean
    maxZoom: number
    mapId: string
  }
  mapsApiKey: string
  capabilities: {
    input: boolean
    autocomplete: boolean
    directions: boolean
    distanceMatrix: boolean
    details: boolean
    actions: boolean
  }
}

export function buildContactStoreLocatorConfig(apiKey: string): ContactStoreLocatorConfiguration {
  return {
    locations: [
      {
        title: 'Baterino Romania',
        address1: 'Șoseaua București Urziceni nr13',
        address2: 'Ilfov, Romania',
        coords: BATERINO_MAP_CENTER,
        placeId: BATERINO_PLACE_ID,
      },
    ],
    mapOptions: {
      center: BATERINO_MAP_CENTER,
      fullscreenControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      zoom: 15,
      zoomControl: true,
      maxZoom: 17,
      mapId: '',
    },
    mapsApiKey: apiKey,
    capabilities: {
      input: false,
      autocomplete: false,
      directions: false,
      distanceMatrix: false,
      details: false,
      actions: false,
    },
  }
}
