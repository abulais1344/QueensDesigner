import { cn, formatPrice } from '../../lib/format'
import { discountPercent } from '../../lib/product'

interface PriceProps {
  price: number
  mrp: number
  size?: 'sm' | 'lg'
  className?: string
}

export function Price({ price, mrp, size = 'sm', className }: PriceProps) {
  const off = discountPercent({ price, mrp })
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-0.5', className)}>
      <span className={cn('font-bold text-ink', size === 'lg' ? 'text-2xl md:text-[28px]' : 'text-[15px]')}>
        {formatPrice(price)}
      </span>
      {off > 0 && (
        <>
          <span className={cn('text-subtle line-through', size === 'lg' ? 'text-base' : 'text-xs')}>
            <span className="sr-only">MRP </span>
            {formatPrice(mrp)}
          </span>
          <span className={cn('font-bold text-rose-dark', size === 'lg' ? 'text-base' : 'text-xs')}>{off}% OFF</span>
        </>
      )}
    </div>
  )
}
