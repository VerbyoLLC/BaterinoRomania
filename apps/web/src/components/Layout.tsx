import { Outlet } from 'react-router-dom'
import { LanguageProvider } from '../contexts/LanguageContext'
import { ViziuneHeaderProvider } from '../contexts/ViziuneHeaderContext'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  return (
    <LanguageProvider>
      <ViziuneHeaderProvider>
        <div className="min-h-screen w-full bg-white max-w-site mx-auto flex flex-col overflow-x-hidden">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </ViziuneHeaderProvider>
    </LanguageProvider>
  )
}
