import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import type { Product } from '../../types'
import { ProductCard } from './ProductCard'

export function ProductRail({ products, label }: { products: Product[]; label: string }) {
  const scroller = useRef<HTMLDivElement>(null)

  const scroll = (dir: 1 | -1) => {
    const el = scroller.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={scroller}
        role="region"
        aria-label={label}
        className="scrollbar-none -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 md:-mx-6 md:scroll-px-6 md:gap-5 md:px-6 xl:mx-0 xl:scroll-px-0 xl:px-0"
      >
        {products.map((product) => (
          <div key={product.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23%] xl:w-[calc((100%-5rem)/5)]">
            <ProductCard product={product} sizes="(min-width: 1024px) 20vw, (min-width: 640px) 31vw, 46vw" />
          </div>
        ))}
      </div>
      {(['left', 'right'] as const).map((side) => (
        <button
          key={side}
          type="button"
          onClick={() => scroll(side === 'left' ? -1 : 1)}
          aria-label={side === 'left' ? 'Scroll left' : 'Scroll right'}
          className={`absolute top-[38%] z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-ink shadow-card transition hover:border-maroon hover:text-maroon lg:grid ${
            side === 'left' ? '-left-5' : '-right-5'
          }`}
        >
          {side === 'left' ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
        </button>
      ))}
    </div>
  )
}
