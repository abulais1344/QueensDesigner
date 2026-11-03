import { Heart, Home, LayoutGrid, Search, ShoppingBag, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/format'
import { useStore } from '../../store/store'

export function MobileNav() {
  const { wishlist, cartCount, setSearchOpen } = useStore()

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <div className="grid h-16 grid-cols-5">
        <Tab to="/" icon={Home} label="Home" end />
        <Tab to="/shop" icon={LayoutGrid} label="Shop" />
        <button type="button" onClick={() => setSearchOpen(true)} className="flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-muted">
          <Search className="size-[22px]" />
          Search
        </button>
        <Tab to="/wishlist" icon={Heart} label="Wishlist" count={wishlist.length} />
        <Tab to="/bag" icon={ShoppingBag} label="Bag" count={cartCount} />
      </div>
    </nav>
  )
}

interface TabProps {
  to: string
  icon: LucideIcon
  label: string
  count?: number
  end?: boolean
}

function Tab({ to, icon: Icon, label, count = 0, end }: TabProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn('relative flex flex-col items-center justify-center gap-1 text-[11px] font-semibold', isActive ? 'text-maroon' : 'text-muted')
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute top-0 h-[3px] w-8 rounded-b-full bg-maroon" aria-hidden />}
          <span className="relative">
            <Icon className={cn('size-[22px]', isActive && label === 'Wishlist' && 'fill-maroon')} />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-2.5 grid h-4 min-w-4 place-items-center rounded-full bg-maroon px-1 text-[10px] font-bold text-white">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </span>
          {label}
        </>
      )}
    </NavLink>
  )
}
