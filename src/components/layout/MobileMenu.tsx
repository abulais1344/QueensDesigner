import { ChevronRight, Heart, MapPin, Phone, RotateCcw, Sparkles, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categories } from '../../data/catalog'
import { contact } from '../../data/contact'
import { ProductImage } from '../ui/ProductImage'
import { Sheet } from '../ui/Sheet'

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Shop Queens Collection" side="left">
      <nav aria-label="Mobile categories" className="px-3 py-3">
        <Link
          to="/shop?sort=new"
          onClick={onClose}
          className="mb-2 flex items-center gap-3 rounded-2xl bg-blush px-4 py-3.5 font-semibold text-maroon"
        >
          <Sparkles className="size-5" />
          New arrivals
          <ChevronRight className="ml-auto size-5" />
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            to={`/shop?category=${c.slug}`}
            onClick={onClose}
            className="flex items-center gap-3.5 rounded-2xl px-2 py-2 hover:bg-ivory"
          >
            <ProductImage photo={c.photo} alt="" sizes="56px" ratio={1} className="size-12 shrink-0 rounded-full" />
            <span className="flex-1">
              <span className="block text-[15px] font-semibold">{c.name}</span>
              <span className="block text-xs text-muted">{c.blurb}</span>
            </span>
            <ChevronRight className="size-5 text-subtle" />
          </Link>
        ))}
      </nav>
      <div className="mx-5 border-t border-line py-4 text-sm">
        {[
          { icon: Heart, label: 'My wishlist', to: '/wishlist' },
          { icon: Truck, label: 'Track order', to: '/bag' },
          { icon: RotateCcw, label: 'Returns & exchanges', to: '/bag' },
        ].map(({ icon: Icon, label, to }) => (
          <Link key={label} to={to} onClick={onClose} className="flex h-12 items-center gap-3 font-medium text-ink">
            <Icon className="size-5 text-muted" /> {label}
          </Link>
        ))}
        <a href={contact.phoneHref} className="flex h-12 items-center gap-3 font-medium text-ink">
          <Phone className="size-5 text-muted" /> {contact.phoneDisplay}
        </a>
        <a href={contact.mapsUrl} target="_blank" rel="noreferrer" className="flex min-h-12 items-center gap-3 py-2 font-medium text-ink">
          <MapPin className="size-5 shrink-0 text-muted" />
          <span>
            Visit our store
            <span className="block text-xs font-normal text-muted">{contact.addressLines.join(', ')}</span>
          </span>
        </a>
      </div>
    </Sheet>
  )
}
