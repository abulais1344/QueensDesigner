import { cn } from '../../lib/format'
import { isSizeAvailable } from '../../lib/product'
import type { Product, Size } from '../../types'

interface SizeSelectorProps {
  product: Product
  value: Size | null
  onChange: (size: Size) => void
  error?: boolean
}

export function SizeSelector({ product, value, onChange, error }: SizeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Select size">
      {product.sizes.map((size) => {
        const soldOut = !isSizeAvailable(product, size)
        const selected = value === size
        return (
          <button
            key={size}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={soldOut}
            onClick={() => onChange(size)}
            className={cn(
              'relative grid h-12 min-w-12 place-items-center rounded-full border px-4 text-sm font-semibold transition',
              selected
                ? 'border-maroon bg-maroon text-white'
                : error
                  ? 'border-rose-dark/60 bg-white text-ink hover:border-maroon'
                  : 'border-ink/15 bg-white text-ink hover:border-maroon',
              soldOut && 'border-line bg-ivory text-subtle line-through hover:border-line',
            )}
          >
            {size}
            {soldOut && <span className="sr-only"> (sold out)</span>}
          </button>
        )
      })}
    </div>
  )
}
