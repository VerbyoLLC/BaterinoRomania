import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scrolls to top of page on every route change. */
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    const layoutScroll =
      document.getElementById('admin-layout-scroll') ??
      document.getElementById('partner-layout-scroll')
    if (layoutScroll) {
      layoutScroll.scrollTop = 0
      return
    }
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
