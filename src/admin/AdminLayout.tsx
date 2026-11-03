import { Boxes, ExternalLink, LayoutDashboard, LogOut, Menu, Package, ReceiptText } from 'lucide-react'
import { useState } from 'react'
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '../components/layout/Logo'
import { ToastHost } from '../components/layout/ToastHost'
import { Sheet } from '../components/ui/Sheet'
import { DEMO_ADMIN, isAdminSignedIn, signOut } from '../lib/auth'
import { cn } from '../lib/format'
import { useCatalog } from '../store/catalog'

export function AdminLayout() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  if (!isAdminSignedIn()) {
    return <Navigate to={`/admin/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />
  }

  return (
    <div className="min-h-dvh bg-ivory lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col self-start border-r border-line bg-white lg:flex">
        <div className="px-6 pt-6 pb-5">
          <Logo />
          <p className="mt-2 text-xs font-bold tracking-[0.14em] text-subtle uppercase">Admin</p>
        </div>
        <AdminNav />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-white/95 px-3 backdrop-blur lg:hidden">
        <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open admin menu" className="grid size-11 place-items-center rounded-full hover:bg-blush">
          <Menu className="size-6" />
        </button>
        <Logo />
        <span className="ml-1 rounded-md bg-ink px-2 py-0.5 text-[11px] font-bold tracking-wide text-white uppercase">Admin</span>
      </header>
      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Admin" side="left">
        <AdminNav onNavigate={() => setMenuOpen(false)} />
      </Sheet>

      <main className="min-w-0 pb-24">
        <Outlet />
      </main>
      <ToastHost />
    </div>
  )
}

function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate()
  const { orders, products } = useCatalog()
  const newOrders = orders.filter((o) => o.status === 'New').length

  const links = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products', icon: Package, count: products.length },
    { to: '/admin/inventory', label: 'Inventory & prices', icon: Boxes },
    { to: '/admin/orders', label: 'Orders', icon: ReceiptText, count: newOrders, highlight: newOrders > 0 },
  ]

  return (
    <nav className="flex flex-1 flex-col px-3 pb-4" aria-label="Admin">
      <div className="space-y-1">
        {links.map(({ to, label, icon: Icon, end, count, highlight }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition',
                isActive ? 'bg-blush text-maroon' : 'text-ink hover:bg-ivory',
              )
            }
          >
            <Icon className="size-[18px]" />
            <span className="flex-1">{label}</span>
            {count !== undefined && count > 0 && (
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-bold', highlight ? 'bg-maroon text-white' : 'bg-ink/8 text-muted')}>{count}</span>
            )}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto space-y-1 border-t border-line pt-4">
        <a href="/" target="_blank" rel="noreferrer" className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-ink hover:bg-ivory">
          <ExternalLink className="size-[18px]" /> View store
        </a>
        <button
          type="button"
          onClick={() => {
            signOut()
            navigate('/admin/login')
          }}
          className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-ink hover:bg-ivory"
        >
          <LogOut className="size-[18px]" /> Sign out
        </button>
        <p className="truncate px-3 pt-2 text-xs text-subtle">{DEMO_ADMIN.email}</p>
      </div>
    </nav>
  )
}
