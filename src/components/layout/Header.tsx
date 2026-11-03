import { Heart, Menu, Search, ShoppingBag } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { categories } from '../../data/catalog'
import { cn } from '../../lib/format'
import { useStore } from '../../store/store'
import { Logo } from './Logo'
import { MobileMenu } from './MobileMenu'

const announcements = ['Free shipping on orders above ₹2,999', 'Easy 7-day returns & exchanges', 'Extra 10% off with code QUEEN10']

export function Header() {
  const { wishlist, cartCount, setSearchOpen } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname, search } = useLocation()
  const params = new URLSearchParams(search)
  const activeCategory = pathname === '/shop' ? params.get('category') : null
  const newInActive = pathname === '/shop' && params.get('sort') === 'new' && !activeCategory

  return (
    <>
      <div className="bg-maroon text-white">
        <div className="container-page flex h-9 items-center justify-center gap-8 text-xs font-medium md:justify-between">
          <p className="truncate md:hidden">{announcements[2]}</p>
          {announcements.map((text) => (
            <p key={text} className="hidden md:block">
              {text}
            </p>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-md">
        <div className="container-page flex h-16 items-center gap-2 md:h-[76px] md:gap-6">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="-ml-2 grid size-11 place-items-center rounded-full hover:bg-blush lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-6" />
          </button>

          <Logo className="shrink-0" />

          <nav aria-label="Categories" className="ml-4 hidden h-full items-stretch lg:flex">
            <HeaderLink to="/shop?sort=new" active={newInActive}>
              New In
            </HeaderLink>
            {categories.map((c) => (
              <HeaderLink key={c.slug} to={`/shop?category=${c.slug}`} active={activeCategory === c.slug}>
                {c.name}
              </HeaderLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 md:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden h-11 w-56 items-center gap-2.5 rounded-full border border-line bg-ivory px-4 text-sm text-subtle transition hover:border-rose md:flex xl:w-72"
            >
              <Search className="size-[18px] text-muted" />
              Search lehengas, suits…
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid size-11 place-items-center rounded-full hover:bg-blush md:hidden"
              aria-label="Search"
            >
              <Search className="size-[22px]" />
            </button>
            <IconLink to="/wishlist" label="Wishlist" count={wishlist.length} className="hidden md:flex">
              <Heart className="size-[22px]" />
            </IconLink>
            <IconLink to="/bag" label="Bag" count={cartCount}>
              <ShoppingBag className="size-[22px]" />
            </IconLink>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}

function HeaderLink({ to, active, children }: { to: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      to={to}
      className={cn(
        'relative flex items-center px-2.5 text-[13.5px] font-semibold whitespace-nowrap transition-colors after:absolute after:inset-x-2.5 after:bottom-0 after:h-[3px] after:rounded-t-full after:transition-colors xl:px-3.5 xl:text-sm',
        active ? 'text-maroon after:bg-maroon' : 'text-ink hover:text-maroon hover:after:bg-blush-deep',
      )}
    >
      {children}
    </Link>
  )
}

interface IconLinkProps {
  to: string
  label: string
  count: number
  className?: string
  children: ReactNode
}

function IconLink({ to, label, count, className, children }: IconLinkProps) {
  return (
    <Link
      to={to}
      aria-label={`${label}${count ? ` (${count} items)` : ''}`}
      className={cn('relative flex h-11 min-w-11 flex-col items-center justify-center rounded-full px-2 hover:bg-blush', className)}
    >
      {children}
      <span className="hidden text-[11px] font-semibold md:block">{label}</span>
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-maroon px-1 text-[10px] font-bold text-white md:right-1.5">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}
