import { useState } from 'react'
import { photoSrcSet, photoUrl, type PhotoView } from '../../data/photos'
import { cn } from '../../lib/format'
import type { Photo } from '../../types'

interface ProductImageProps {
  photo: Photo
  alt: string
  sizes?: string
  ratio?: number
  view?: PhotoView
  eager?: boolean
  className?: string
}

/** Responsive Unsplash image with a branded placeholder while loading or if it fails. */
export function ProductImage({
  photo,
  alt,
  sizes = '(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw',
  ratio = 1.25,
  view = 'full',
  eager = false,
  className,
}: ProductImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  // `relative` would override a caller's `absolute` (same specificity, later in the stylesheet).
  const positioned = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className ?? '')

  return (
    <div className={cn('overflow-hidden bg-blush', !positioned && 'relative', className)}>
      {status !== 'loaded' && (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-blush to-blush-deep" aria-hidden>
          <span className={cn('font-display text-2xl font-semibold text-rose/60', status === 'loading' && 'animate-pulse')}>
            QC
          </span>
        </div>
      )}
      {status !== 'error' && (
        <img
          src={photoUrl(photo, { width: 720, ratio, view })}
          srcSet={photoSrcSet(photo, { ratio, view })}
          sizes={sizes}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-300',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </div>
  )
}
