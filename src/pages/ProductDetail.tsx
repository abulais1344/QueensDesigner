import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  ChevronRight,
  Heart,
  MapPin,
  PackageSearch,
  RotateCcw,
  Ruler,
  Share2,
  ShoppingBag,
  Tag,
  Truck,
  Wallet,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ProductGallery } from '../components/product/ProductGallery'
import { ProductRail } from '../components/product/ProductRail'
import { SizeSelector } from '../components/product/SizeSelector'
import { EmptyState } from '../components/ui/EmptyState'
import { Price } from '../components/ui/Price'
import { Rating } from '../components/ui/Rating'
import { SectionHeader } from '../components/ui/SectionHeader'
import { Sheet } from '../components/ui/Sheet'
import { categories, COUPON, sizeChart } from '../data/catalog'
import { cn, deliveryDate, formatPrice } from '../lib/format'
import { isOutOfStock, lowStockCount, stockFor } from '../lib/product'
import { buttonClass } from '../lib/ui'
import { useCatalog } from '../store/catalog'
import { useStore } from '../store/store'
import type { Product, Size } from '../types'

export default function ProductDetail() {
  const { productId } = useParams()
  const { getProduct } = useCatalog()
  const product = getProduct(productId)

  if (!product) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="This style isn’t available"
        message="It may have sold out or moved. Explore similar pieces from our latest collection."
        action={
          <Link to="/shop" className={buttonClass('primary')}>
            Browse all styles
          </Link>
        }
      />
    )
  }

  // Keyed so size/colour selections reset when navigating between products.
  return <ProductView key={product.id} product={product} />
}

function ProductView({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted, cart, showToast } = useStore()
  const { visibleProducts: products } = useCatalog()
  const [color, setColor] = useState(product.colors[0].name)
  const [size, setSize] = useState<Size | null>(null)
  const [sizeError, setSizeError] = useState(false)
  const [chartOpen, setChartOpen] = useState(false)
  const saved = isWishlisted(product.id)
  const inBag = cart.some((item) => item.productId === product.id && item.size === size && item.color === color)
  const category = categories.find((c) => c.name === product.category)!
  const soldOut = isOutOfStock(product)
  const sizeStock = size ? stockFor(product, size) : null
  const stockNote =
    sizeStock !== null
      ? sizeStock <= 3 && `Hurry — only ${sizeStock} left in size ${size}`
      : lowStockCount(product) && `Hurry — only ${lowStockCount(product)} left in stock`

  const couponPrice = product.price - Math.min(Math.round((product.price * COUPON.percent) / 100), COUPON.maxOff)

  const related = [
    ...products.filter((p) => p.id !== product.id && p.category === product.category),
    ...products.filter((p) => p.id !== product.id && p.category !== product.category && p.occasion === product.occasion),
  ].slice(0, 10)

  const handleAdd = () => {
    if (!size) {
      setSizeError(true)
      document.getElementById('size-picker')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    addToCart(product.id, size, color)
  }

  const share = async () => {
    const data = { title: product.name, url: window.location.href }
    try {
      if (navigator.share) await navigator.share(data)
      else {
        await navigator.clipboard.writeText(data.url)
        showToast('Link copied')
      }
    } catch {
      // Share sheet dismissed
    }
  }

  return (
    <div className="pb-24 md:pb-0">
      <div className="container-page pt-3 md:pt-6">
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1 overflow-hidden text-xs whitespace-nowrap text-muted md:mb-5">
          <Link to="/" className="hover:text-maroon">
            Home
          </Link>
          <ChevronRight className="size-3.5 shrink-0" />
          <Link to={`/shop?category=${category.slug}`} className="hover:text-maroon">
            {product.category}
          </Link>
          <ChevronRight className="size-3.5 shrink-0" />
          <span className="truncate font-semibold text-ink">{product.name}</span>
        </nav>

        <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:gap-10 xl:gap-14">
          <ProductGallery product={product} />

          <div className="md:sticky md:top-24 md:self-start">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link to={`/shop?category=${category.slug}`} className="text-xs font-bold tracking-[0.12em] text-rose-dark uppercase hover:text-maroon">
                  {product.category}
                </Link>
                <h1 className="mt-1 text-2xl leading-tight font-extrabold tracking-[-0.025em] md:text-[32px]">{product.name}</h1>
                <p className="mt-1 text-[15px] text-muted">{product.subtitle}</p>
              </div>
              <button type="button" onClick={share} aria-label="Share" className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-white hover:border-maroon hover:text-maroon">
                <Share2 className="size-[18px]" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Rating rating={product.rating} reviews={product.reviews} />
              {product.isBestseller && <span className="rounded-md bg-gold-soft px-2 py-1 text-xs font-bold text-[#7a5a22]">Bestseller</span>}
              {product.isNew && <span className="rounded-md bg-ink px-2 py-1 text-xs font-bold text-white">New arrival</span>}
            </div>

            <div className="mt-5 border-t border-line pt-5">
              <Price price={product.price} mrp={product.mrp} size="lg" />
              <p className="mt-1 text-xs font-medium text-success">Inclusive of all taxes</p>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-dashed border-gold/50 bg-gold-soft/60 p-3.5 text-sm">
              <Tag className="mt-0.5 size-[18px] shrink-0 text-gold" />
              <p>
                Best price <strong className="font-bold">{formatPrice(couponPrice)}</strong> with code{' '}
                <strong className="font-bold text-maroon">{COUPON.code}</strong>
                {product.price >= 10000 && (
                  <span className="block text-muted">No-cost EMI from {formatPrice(Math.ceil(product.price / 6))}/month</span>
                )}
              </p>
            </div>

            <div className="mt-6">
              <p className="mb-2.5 text-sm font-bold">
                Colour: <span className="font-medium text-muted">{color}</span>
              </p>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColor(c.name)}
                    aria-pressed={color === c.name}
                    className={cn(
                      'flex h-12 items-center gap-2.5 rounded-full border pr-4 pl-1.5 text-sm font-semibold transition',
                      color === c.name ? 'border-maroon bg-blush/50' : 'border-ink/15 bg-white hover:border-ink/40',
                    )}
                  >
                    <span className="size-9 rounded-full ring-1 ring-ink/10" style={{ backgroundColor: c.hex }} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 scroll-mt-28" id="size-picker">
              <div className="mb-2.5 flex items-center justify-between">
                <p className={cn('text-sm font-bold', sizeError && 'text-rose-dark')}>{sizeError ? 'Please select a size' : 'Select size'}</p>
                <button type="button" onClick={() => setChartOpen(true)} className="inline-flex h-10 items-center gap-1.5 text-sm font-semibold text-maroon hover:underline">
                  <Ruler className="size-4" /> Size guide
                </button>
              </div>
              <SizeSelector
                product={product}
                value={size}
                error={sizeError}
                onChange={(s) => {
                  setSize(s)
                  setSizeError(false)
                }}
              />
              {soldOut ? (
                <p className="mt-3 text-sm font-semibold text-rose-dark">Sold out in all sizes — save it to your wishlist for restock alerts</p>
              ) : (
                stockNote && <p className="mt-3 text-sm font-semibold text-rose-dark">{stockNote}</p>
              )}
            </div>

            <div className="mt-6 hidden gap-3 md:flex">
              {inBag ? (
                <Link to="/bag" className={buttonClass('dark', 'lg', 'flex-1')}>
                  Go to bag <ArrowRight className="size-5" />
                </Link>
              ) : (
                <button type="button" onClick={handleAdd} disabled={soldOut} className={buttonClass('primary', 'lg', 'flex-1')}>
                  <ShoppingBag className="size-5" /> {soldOut ? 'Sold out' : 'Add to bag'}
                </button>
              )}
              <button type="button" onClick={() => toggleWishlist(product.id)} aria-pressed={saved} className={buttonClass('outline', 'lg', 'px-6')}>
                <Heart className={cn('size-5', saved && 'fill-maroon text-maroon')} />
                {saved ? 'Wishlisted' : 'Wishlist'}
              </button>
            </div>

            <DeliveryCheck />

            <ul className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
              {[
                { icon: BadgeCheck, label: 'Quality checked' },
                { icon: RotateCcw, label: '7-day returns' },
                { icon: Wallet, label: 'COD available' },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white px-2 py-3 ring-1 ring-line">
                  <Icon className="size-5 text-maroon" />
                  {label}
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-line">
              <Accordion title="Product details" defaultOpen>
                <p>{product.description}</p>
                <ul className="mt-3 space-y-1.5">
                  {product.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-rose" /> {h}
                    </li>
                  ))}
                </ul>
              </Accordion>
              <Accordion title="Fabric & specifications">
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5">
                  {[
                    ['Fabric', product.fabric],
                    ['Work', product.work],
                    ['Occasion', product.occasion],
                    ['Set includes', product.setIncludes],
                    ['Care', 'Dry clean only. Store folded in a muslin bag.'],
                  ].map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-muted">{k}</dt>
                      <dd className="font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Accordion>
              <Accordion title="Shipping & returns">
                <p>
                  Ships in 24–48 hours (made-to-order pieces ship in 4–6 weeks). Free shipping on orders above ₹2,999. Easy 7-day returns and
                  size exchanges with free home pickup across 19,000+ pincodes.
                </p>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-page mt-14 md:mt-20">
          <SectionHeader eyebrow="You may also like" title="Similar styles" linkTo={`/shop?category=${category.slug}`} />
          <ProductRail products={related} label="Similar styles" />
        </section>
      )}

      {/* Mobile sticky actions */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-line bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          className="grid size-14 shrink-0 place-items-center rounded-full border border-ink/15 bg-white active:scale-95"
        >
          <Heart className={cn('size-5', saved && 'fill-maroon text-maroon')} />
        </button>
        {inBag ? (
          <Link to="/bag" className={buttonClass('dark', 'lg', 'flex-1')}>
            Go to bag <ArrowRight className="size-5" />
          </Link>
        ) : (
          <button type="button" onClick={handleAdd} disabled={soldOut} className={buttonClass('primary', 'lg', 'flex-1')}>
            <ShoppingBag className="size-5" /> {soldOut ? 'Sold out' : `Add to bag · ${formatPrice(product.price)}`}
          </button>
        )}
      </div>

      <Sheet open={chartOpen} onClose={() => setChartOpen(false)} title="Size guide (inches)">
        <div className="px-5 py-4">
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full text-center text-sm">
              <thead className="bg-ivory text-xs tracking-wide text-muted uppercase">
                <tr>
                  {['Size', 'Bust', 'Waist', 'Hip'].map((h) => (
                    <th key={h} className="px-3 py-3 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizeChart.map((row) => (
                  <tr key={row.size} className="border-t border-line">
                    <td className="px-3 py-3 font-bold">{row.size}</td>
                    <td className="px-3 py-3">{row.bust}</td>
                    <td className="px-3 py-3">{row.waist}</td>
                    <td className="px-3 py-3">{row.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-muted">
            Between sizes? Choose the larger one — every blouse has 2" of margin for alterations. Our stylists can help on WhatsApp.
          </p>
        </div>
      </Sheet>
    </div>
  )
}

function DeliveryCheck() {
  const [pincode, setPincode] = useState('')
  const [result, setResult] = useState<'ok' | 'invalid' | null>(null)

  return (
    <div className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-line">
      <p className="flex items-center gap-2 text-sm font-bold">
        <Truck className="size-[18px] text-maroon" /> Check delivery
      </p>
      <form
        className="mt-3 flex h-12 items-center rounded-full border border-line pr-1.5 pl-4 focus-within:border-maroon"
        onSubmit={(e) => {
          e.preventDefault()
          setResult(/^[1-9]\d{5}$/.test(pincode) ? 'ok' : 'invalid')
        }}
      >
        <MapPin className="size-[18px] shrink-0 text-muted" />
        <input
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, ''))
            setResult(null)
          }}
          placeholder="Enter 6-digit pincode"
          aria-label="Pincode"
          className="h-full w-full bg-transparent px-2.5 text-[15px] outline-none placeholder:text-subtle"
        />
        <button type="submit" className="h-9 rounded-full px-4 text-sm font-bold text-maroon hover:bg-blush">
          Check
        </button>
      </form>
      {result === 'ok' && (
        <p className="mt-2.5 text-sm">
          Delivery by <strong>{deliveryDate(4)}</strong> · Cash on delivery available
        </p>
      )}
      {result === 'invalid' && <p className="mt-2.5 text-sm text-rose-dark">Please enter a valid 6-digit pincode</p>}
    </div>
  )
}

function Accordion({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  return (
    <details open={defaultOpen} className="group border-b border-line">
      <summary className="flex h-14 cursor-pointer list-none items-center justify-between text-[15px] font-bold [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="size-5 text-muted transition-transform group-open:rotate-180" />
      </summary>
      <div className="pb-5 text-sm leading-relaxed text-ink/85">{children}</div>
    </details>
  )
}
