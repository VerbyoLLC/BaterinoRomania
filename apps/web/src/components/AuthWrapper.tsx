import type { ReactNode } from 'react'
import { LanguageProvider } from '../contexts/LanguageContext'

export default function AuthWrapper({ children }: { children: ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>
}
