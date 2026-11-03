import { Heart, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/format'
import { isOutOfStock, lowStockCount } from '../../lib/product'
import { buttonClass } from '../../lib/ui'
import { useStore } from '../../store/store'
import type { Product } from '../../types'
import { Price } from '../ui/Price'
import { ProductImage } from '../ui/ProductImage'
import { Rating } from '../ui/Rating'

interface ProductCardProps {
  product: Product
  eager?: boolean
  sizes?: string
}

export function ProductCard({ product, eager, sizes }: ProductCardProps) {
  const { isWishlisted, toggleWishlist, openQuickAdd } = useStore()
  const saved = isWishlisted(product.id)
  const href = `/product/${product.id}`
  const soldOut = isOutOfStock(product)
  const lowStock = lowStockCount(product)
  const badge = product.isBestseller ? 'Bestseller' : product.isNew ? 'New' : null

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-line/70 transition-shadow hover:shadow-lift">
      <Link to={href} className="relative block aspect-[4/5]" aria-label={product.name}>
        <ProductImage photo={product.photos[0]} alt={product.name} eager={eager} sizes={sizes} className="absolute inset-0" />
        {product.photos[1] && (
          <ProductImage
            photo={product.photos[1]}
            alt=""
            sizes={sizes}
            className="absolute inset-0 opacity-0 transition-opacity duration-500 [@media(hover:hover)]:group-hover:opacity-100"
          />
        )}
        {badge && (
          <span
            className={cn(
              'absolute top-2.5 left-2.5 rounded-md px-2 py-1 text-[11px] font-bold tracking-wide uppercase',
              badge === 'Bestseller' ? 'bg-gold-soft text-[#7a5a22]' : 'bg-ink text-white',
            )}
          >
            {badge}
          </span>
        )}
        <Rating rating={product.rating} reviews={product.reviews} variant="overlay" className="absolute bottom-2.5 left-2.5" />
        {soldOut && (
          <span className="absolute inset-0 grid place-items-center bg-white/55">
            <span className="rounded-full bg-ink px-3.5 py-1.5 text-xs font-bold tracking-wide text-white uppercase">Sold out</span>
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={() => toggleWishlist(product.id)}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        className="absolute top-2 right-2 grid size-10 place-items-center rounded-full bg-white/95 shadow-sm backdrop-blur transition-transform active:scale-90"
      >
        <Heart className={cn('size-[18px]', saved ? 'fill-maroon text-maroon' : 'text-ink')} strokeWidth={2} />
      </button>

      <div className="flex flex-1 flex-col p-3 md:p-3.5">
        <p className="text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">{product.category}</p>
        <h3 className="mt-0.5 line-clamp-1 text-sm font-semibold text-ink md:text-[15px]">
          <Link to={href} className="hover:text-maroon">
            {product.name}
          </Link>
        </h3>
        <Price price={product.price} mrp={product.mrp} className="mt-1.5" />
        {lowStock && <p className="mt-1 text-xs font-semibold text-rose-dark">Only {lowStock} left</p>}
        <div className="mt-auto pt-3">
          {soldOut ? (
            <button type="button" disabled className={buttonClass('outline', 'sm', 'w-full px-3')}>
              Sold out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openQuickAdd(product.id)}
              className={buttonClass('outline', 'sm', 'w-full px-3 group-hover:border-maroon group-hover:bg-maroon group-hover:text-white')}
            >
              <ShoppingBag className="size-4" />
              Add to bag
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
