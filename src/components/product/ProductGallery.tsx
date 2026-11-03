import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState } from 'react'
import type { PhotoView } from '../../data/photos'
import { cn } from '../../lib/format'
import type { Photo, Product } from '../../types'
import { ProductImage } from '../ui/ProductImage'

export function ProductGallery({ product }: { product: Product }) {
  const [first, ...rest] = product.photos
  // Stock photos get zoomed detail crops; uploaded photos are shown as-is.
  const views: { photo: Photo; view: PhotoView; label: string }[] = [
    { photo: first, view: 'full', label: 'Front view' },
    ...(first.src
      ? []
      : [
          { photo: first, view: 'detail-top' as const, label: 'Neckline & embroidery detail' },
          { photo: first, view: 'detail-bottom' as const, label: 'Hem & fabric detail' },
        ]),
    ...rest.map((photo, i) => ({ photo, view: 'full' as const, label: `View ${i + 2}` })),
  ]
  const [active, setActive] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)

  const goTo = (index: number) => {
    const next = (index + views.length) % views.length
    setActive(next)
    const el = scroller.current
    if (el) el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="md:grid md:grid-cols-[76px_1fr] md:gap-4">
      {/* Desktop thumbnails */}
      <div className="hidden flex-col gap-3 md:flex" role="tablist" aria-label="Product images">
        {views.map((v, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active === i}
            aria-label={v.label}
            onClick={() => goTo(i)}
            className={cn(
              'overflow-hidden rounded-xl border-2 transition',
              active === i ? 'border-maroon' : 'border-transparent opacity-70 hover:opacity-100',
            )}
          >
            <ProductImage photo={v.photo} view={v.view} alt="" sizes="80px" className="aspect-[4/5]" />
          </button>
        ))}
      </div>

      <div className="relative -mx-4 md:mx-0">
        <div
          ref={scroller}
          onScroll={(e) => {
            const el = e.currentTarget
            const index = Math.round(el.scrollLeft / el.clientWidth)
            if (index !== active) setActive(index)
          }}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto md:rounded-3xl"
        >
          {views.map((v, i) => (
            <ProductImage
              key={i}
              photo={v.photo}
              view={v.view}
              alt={`${product.name} — ${v.label}`}
              eager={i === 0}
              sizes="(min-width: 1024px) 46vw, (min-width: 768px) 55vw, 100vw"
              className="aspect-[4/5] w-full shrink-0 snap-center"
            />
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-1.5 md:hidden" aria-hidden>
          {views.map((_, i) => (
            <span key={i} className={cn('h-1.5 rounded-full bg-white shadow transition-all', active === i ? 'w-5' : 'w-1.5 opacity-60')} />
          ))}
        </div>

        {(['prev', 'next'] as const).map((dir) => (
          <button
            key={dir}
            type="button"
            onClick={() => goTo(active + (dir === 'prev' ? -1 : 1))}
            aria-label={dir === 'prev' ? 'Previous image' : 'Next image'}
            className={cn(
              'absolute top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-card backdrop-blur hover:bg-white md:grid',
              dir === 'prev' ? 'left-4' : 'right-4',
            )}
          >
            {dir === 'prev' ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
          </button>
        ))}
      </div>
    </div>
  )
}
