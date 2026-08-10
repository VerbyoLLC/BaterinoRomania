import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '../contexts/LanguageContext'
import { ViziuneHeaderProvider } from '../contexts/ViziuneHeaderContext'
import { CookieConsentProvider } from '../contexts/CookieConsentContext'
import { CatalogCurrencyProvider } from '../contexts/CatalogCurrencyContext'
import { CartProvider } from '../contexts/CartContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import FloatingStickyButtons from '../components/FloatingStickyButtons'
import CookieConsentBanner from '../components/CookieConsentBanner'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.baterino.ro'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>
        <LanguageProvider>
          <ViziuneHeaderProvider>
            <CookieConsentProvider>
              <CatalogCurrencyProvider>
                <CartProvider>
                  <div className="min-h-screen w-full min-w-0 bg-white flex flex-col overflow-x-clip">
                    <Header />
                    <main className="flex-1 min-w-0">{children}</main>
                    <Footer />
                    <FloatingStickyButtons />
                  </div>
                  <CookieConsentBanner />
                </CartProvider>
              </CatalogCurrencyProvider>
            </CookieConsentProvider>
          </ViziuneHeaderProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
