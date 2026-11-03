import { cn } from '../../lib/format'
import type { Product } from '../../types'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  products: Product[]
  /** Desktop column count */
  columns?: 3 | 4
  eagerCount?: number
}

export function ProductGrid({ products, columns = 4, eagerCount = 0 }: ProductGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-x-3 gap-y-4 md:gap-x-5 md:gap-y-7',
        columns === 4 ? 'md:grid-cols-3 lg:grid-cols-4' : 'md:grid-cols-3 xl:grid-cols-4',
      )}
    >
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          eager={i < eagerCount}
          sizes={columns === 4 ? '(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 48vw' : '(min-width: 1280px) 19vw, (min-width: 768px) 30vw, 48vw'}
        />
      ))}
    </div>
  )
}
