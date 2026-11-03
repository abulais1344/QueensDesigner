import { Star } from 'lucide-react'
import { cn, formatCount } from '../../lib/format'

interface RatingProps {
  rating: number
  reviews?: number
  variant?: 'pill' | 'overlay'
  className?: string
}

export function Rating({ rating, reviews, variant = 'pill', className }: RatingProps) {
  if (reviews === 0) return null
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md text-xs font-semibold',
        variant === 'overlay'
          ? 'bg-white/92 px-1.5 py-1 text-ink shadow-sm backdrop-blur'
          : 'border border-line bg-white px-2 py-1 text-ink',
        className,
      )}
      aria-label={`Rated ${rating} out of 5${reviews ? ` from ${reviews} reviews` : ''}`}
    >
      {rating.toFixed(1)}
      <Star className="size-3 fill-rating text-rating" strokeWidth={0} aria-hidden />
      {reviews !== undefined && (
        <>
          <span className="h-3 w-px bg-ink/20" aria-hidden />
          <span className="font-medium text-muted">{formatCount(reviews)}</span>
        </>
      )}
    </span>
  )
}
