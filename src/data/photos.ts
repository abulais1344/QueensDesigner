import type { Photo } from '../types'

/**
 * Curated stock photography (Unsplash). Swap these ids for real product
 * shoots — every image in the app is built from this table via `photoUrl`.
 */
export const photos = {
  tealLehenga: { id: '1619715613791-89d35b51ff81', fx: 0.5, fy: 0.45 },
  ivoryAnarkali: { id: '1583391733956-3750e0ff4e8b', fx: 0.5, fy: 0.5 },
  greenSuit: { id: '1597983073493-88cd35cf93b0', fx: 0.5, fy: 0.4 },
  mustardKurta: { id: '1605763240000-7e93b172d754', fx: 0.5, fy: 0.4 },
  noirSaree: { id: '1610030469668-8e9f641aaf27', fx: 0.5, fy: 0.4 },
  plumSaree: { id: '1610030469983-98e550d6193c', fx: 0.5, fy: 0.4 },
  bridalSilk: { id: '1617627143750-d86bc21e42bb', fx: 0.5, fy: 0.35 },
  sageSaree: { id: '1609748340041-f5d61e061ebc', fx: 0.5, fy: 0.4 },
  scarletPalace: { id: '1618901185975-d59f7091bcfe', fx: 0.45, fy: 0.55 },
  magentaBridal: { id: '1619516388835-2b60acc4049e', fx: 0.5, fy: 0.35 },
  redGown: { id: '1595777457583-95e059d581b8', fx: 0.5, fy: 0.5 },
  plumGown: { id: '1566174053879-31528523f8ae', fx: 0.4, fy: 0.35 },
  floralDrape: { id: '1622122201714-77da0ca8e5d2', fx: 0.5, fy: 0.45 },
  goldWrap: { id: '1612722432474-b971cdcea546', fx: 0.5, fy: 0.4 },
  tealFlow: { id: '1609357605129-26f69add5d6e', fx: 0.5, fy: 0.5 },
  jewellery: { id: '1601121141461-9d6647bca1ed', fx: 0.5, fy: 0.5 },
} satisfies Record<string, Photo & { id: string }>

export type PhotoView = 'full' | 'detail-top' | 'detail-bottom'

interface PhotoUrlOptions {
  width?: number
  /** height / width */
  ratio?: number
  view?: PhotoView
}

export function photoUrl(photo: Photo, { width = 600, ratio = 1.25, view = 'full' }: PhotoUrlOptions = {}) {
  if (photo.src) return photo.src
  const height = Math.round(width * ratio)
  const params = new URLSearchParams({
    auto: 'format',
    fit: 'crop',
    w: String(width),
    h: String(height),
    q: '75',
    crop: 'focalpoint',
    'fp-x': String(photo.fx ?? 0.5),
    'fp-y': String(view === 'detail-top' ? 0.3 : view === 'detail-bottom' ? 0.72 : (photo.fy ?? 0.5)),
  })
  if (view !== 'full') params.set('fp-z', '1.9')
  return `https://images.unsplash.com/photo-${photo.id}?${params}`
}

export function photoSrcSet(photo: Photo, options: Omit<PhotoUrlOptions, 'width'> = {}) {
  if (photo.src) return undefined
  return [360, 540, 720, 1080].map((w) => `${photoUrl(photo, { ...options, width: w })} ${w}w`).join(', ')
}
