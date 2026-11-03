import { Link } from 'react-router-dom'
import { cn } from '../../lib/format'

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Link to="/" aria-label="Queens Collection — home" className={cn('inline-flex flex-col leading-none', className)}>
      <span className={cn('font-display text-[22px] font-bold tracking-[-0.01em] md:text-[26px]', light ? 'text-white' : 'text-maroon')}>
        Queens
      </span>
      <span
        className={cn(
          'mt-0.5 text-[9px] font-bold tracking-[0.42em] md:text-[10px]',
          light ? 'text-blush-deep' : 'text-gold',
        )}
      >
        COLLECTION
      </span>
    </Link>
  )
}
