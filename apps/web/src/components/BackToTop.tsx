import { useCallback } from 'react'
import { createPortal } from 'react-dom'

export default function BackToTop() {
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const button = (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed z-[9999] bottom-6 right-6 w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-900 text-white flex items-center justify-center transition-colors shadow-lg border-2 border-gray-600"
      style={{
        position: 'fixed',
        zIndex: 9999,
        bottom: '1.5rem',
        right: '1.5rem',
        width: '48px',
        height: '48px',
        borderRadius: '9999px',
        backgroundColor: '#1f2937',
        color: '#fff',
        border: '2px solid #4b5563',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      }}
      aria-label="Scroll to top"
    >
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  )

  if (typeof document === 'undefined') return null
  return createPortal(button, document.body)
}
