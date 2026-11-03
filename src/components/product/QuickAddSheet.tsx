import { ArrowRight, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/format'
import { buttonClass } from '../../lib/ui'
import { useCatalog } from '../../store/catalog'
import { useStore } from '../../store/store'
import type { Product, Size } from '../../types'
import { Price } from '../ui/Price'
import { ProductImage } from '../ui/ProductImage'
import { Rating } from '../ui/Rating'
import { Sheet } from '../ui/Sheet'
import { SizeSelector } from './SizeSelector'

/** Global size/colour picker opened from product cards and the wishlist. */
export function QuickAddSheet() {
  const { quickAddId, closeQuickAdd } = useStore()
  const { getProduct } = useCatalog()
  const product = getProduct(quickAddId ?? undefined)

  return (
    <Sheet open={Boolean(product)} onClose={closeQuickAdd} title="Select size">
      {/* Keyed so selections reset for each product */}
      {product && <QuickAddBody key={product.id} product={product} />}
    </Sheet>
  )
}

function QuickAddBody({ product }: { product: Product }) {
  const { addToCart, closeQuickAdd } = useStore()
  const [size, setSize] = useState<Size | null>(null)
  const [color, setColor] = useState(product.colors[0].name)
  const [error, setError] = useState(false)

  const add = () => {
    if (!size) return setError(true)
    addToCart(product.id, size, color)
    closeQuickAdd()
  }

  return (
    <div className="space-y-5 px-5 py-4">
      <div className="flex gap-3.5">
        <ProductImage photo={product.photos[0]} alt={product.name} sizes="96px" className="aspect-[4/5] w-20 shrink-0 rounded-xl" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">{product.category}</p>
          <p className="font-semibold">{product.name}</p>
          <Price price={product.price} mrp={product.mrp} className="mt-1" />
          <Rating rating={product.rating} reviews={product.reviews} className="mt-2" />
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-sm font-semibold">
          Colour: <span className="font-normal text-muted">{color}</span>
        </p>
        <div className="flex flex-wrap gap-2.5">
          {product.colors.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setColor(c.name)}
              aria-label={c.name}
              aria-pressed={color === c.name}
              className={cn(
                'grid size-11 place-items-center rounded-full border-2 transition',
                color === c.name ? 'border-maroon' : 'border-transparent hover:border-line',
              )}
            >
              <span className="size-8 rounded-full ring-1 ring-ink/10" style={{ backgroundColor: c.hex }} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className={cn('mb-2.5 text-sm font-semibold', error && 'text-rose-dark')}>
          {error ? 'Please select a size' : 'Size'}
        </p>
        <SizeSelector
          product={product}
          value={size}
          error={error}
          onChange={(s) => {
            setSize(s)
            setError(false)
          }}
        />
      </div>

      <div className="flex flex-col gap-2.5 pb-1 sm:flex-row-reverse">
        <button type="button" onClick={add} className={buttonClass('primary', 'lg', 'w-full sm:flex-1')}>
          <ShoppingBag className="size-5" />
          Add to bag
        </button>
        <Link to={`/product/${product.id}`} onClick={closeQuickAdd} className={buttonClass('ghost', 'md', 'w-full sm:w-auto')}>
          View details <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}
