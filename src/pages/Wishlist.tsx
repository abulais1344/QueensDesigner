import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProductGrid } from '../components/product/ProductGrid'
import { ProductRail } from '../components/product/ProductRail'
import { EmptyState } from '../components/ui/EmptyState'
import { SectionHeader } from '../components/ui/SectionHeader'
import { selectBestSellers } from '../lib/product'
import { buttonClass } from '../lib/ui'
import { useCatalog } from '../store/catalog'
import { useStore } from '../store/store'
import type { Product } from '../types'

export default function Wishlist() {
  const { wishlist } = useStore()
  const { getProduct, visibleProducts } = useCatalog()
  const items = wishlist.map((id) => getProduct(id)).filter((p): p is Product => Boolean(p))

  return (
    <div className="container-page pt-5 md:pt-8">
      {items.length ? (
        <>
          <div className="mb-5 flex items-baseline gap-3 md:mb-7">
            <h1 className="text-2xl font-extrabold tracking-[-0.025em] md:text-[32px]">My wishlist</h1>
            <p className="text-sm text-muted">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <ProductGrid products={items} />
        </>
      ) : (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          message="Tap the heart on any style to save it here — perfect for shortlisting outfits for every function."
          action={
            <Link to="/shop" className={buttonClass('primary')}>
              Discover styles
            </Link>
          }
        />
      )}

      <section className="mt-14 md:mt-20">
        <SectionHeader eyebrow="Trending now" title="Best sellers you’ll love" linkTo="/shop?sort=popular" />
        <ProductRail products={selectBestSellers(visibleProducts).filter((p) => !wishlist.includes(p.id))} label="Best sellers" />
      </section>
    </div>
  )
}
