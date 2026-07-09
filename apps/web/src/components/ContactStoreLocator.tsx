import { useEffect, useRef } from 'react'
import { APILoader, StoreLocator } from '@googlemaps/extended-component-library/react'
import type { StoreLocator as StoreLocatorElement } from '@googlemaps/extended-component-library/store_locator.js'
import { buildContactStoreLocatorConfig } from '../lib/contactStoreLocatorConfig'
import './contact-store-locator.css'

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''
const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID || 'DEMO_MAP_ID'

type ContactStoreLocatorProps = {
  isDesktop: boolean
  fallbackEmbedUrl: string
}

export default function ContactStoreLocator({ isDesktop, fallbackEmbedUrl }: ContactStoreLocatorProps) {
  const locatorRef = useRef<StoreLocatorElement>(null)
  const height = isDesktop ? '440px' : '400px'

  useEffect(() => {
    if (!MAPS_API_KEY) return

    let cancelled = false

    const configure = async () => {
      await customElements.whenDefined('gmpx-store-locator')
      if (cancelled || !locatorRef.current) return
      locatorRef.current.configureFromQuickBuilder(buildContactStoreLocatorConfig(MAPS_API_KEY))
    }

    void configure()

    return () => {
      cancelled = true
    }
  }, [])

  if (!MAPS_API_KEY) {
    return (
      <iframe
        title="Baterino Romania — Ilfov"
        src={fallbackEmbedUrl}
        className="block w-full grayscale-[15%]"
        style={{ height, border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    )
  }

  return (
    <div className="contact-store-locator-wrap" style={{ height }}>
      <APILoader apiKey={MAPS_API_KEY} solutionChannel="GMP_QB_locatorplus_v11_c" />
      <StoreLocator ref={locatorRef} mapId={MAP_ID} />
    </div>
  )
}
