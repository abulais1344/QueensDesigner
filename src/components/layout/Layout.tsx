import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { QuickAddSheet } from '../product/QuickAddSheet'
import { Footer } from './Footer'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { SearchOverlay } from './SearchOverlay'
import { ToastHost } from './ToastHost'

export function Layout() {
  const { pathname } = useLocation()
  // Product and bag pages show their own sticky action bar on mobile instead.
  const showMobileNav = !pathname.startsWith('/product/') && pathname !== '/bag'

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {showMobileNav && <MobileNav />}
      <SearchOverlay />
      <QuickAddSheet />
      <ToastHost />
    </div>
  )
}
