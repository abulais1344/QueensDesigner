export type Category =
  | 'Bridal'
  | 'Lehengas'
  | 'Suits'
  | 'Festive Wear'
  | 'Sharara Sets'
  | 'Party Wear'

export type Occasion = 'Wedding' | 'Mehendi & Haldi' | 'Sangeet' | 'Reception' | 'Festive' | 'Party'

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'

/** Either a stock Unsplash photo (`id`) or an uploaded image (`src`, a data URL). */
export interface Photo {
  /** Unsplash photo id, e.g. "1619715613791-89d35b51ff81" */
  id?: string
  src?: string
  /** Focal point (0–1) used when cropping Unsplash photos to 4:5 */
  fx?: number
  fy?: number
}

export interface ColorOption {
  name: string
  hex: string
}

export interface Product {
  id: string
  name: string
  category: Category
  subtitle: string
  price: number
  mrp: number
  rating: number
  reviews: number
  photos: Photo[]
  colors: ColorOption[]
  sizes: Size[]
  /** Units in stock per offered size */
  stock: Partial<Record<Size, number>>
  fabric: string
  work: string
  occasion: Occasion
  setIncludes: string
  description: string
  highlights: string[]
  isNew?: boolean
  isBestseller?: boolean
  /** Hidden products are kept in admin but not shown in the store */
  hidden?: boolean
  /** Lower is more prominent in "Recommended" sort */
  rank: number
  /** Arrival order; higher is newer */
  arrival: number
}

export interface CartItem {
  key: string
  productId: string
  size: Size
  color: string
  qty: number
}

export const orderStatuses = ['New', 'Packed', 'Shipped', 'Delivered', 'Cancelled'] as const
export type OrderStatus = (typeof orderStatuses)[number]

export interface OrderItem {
  productId: string
  name: string
  photo: Photo
  size: Size
  color: string
  qty: number
  price: number
}

export interface Customer {
  name: string
  phone: string
  address: string
  city: string
  pincode: string
}

export interface Order {
  id: string
  createdAt: string
  status: OrderStatus
  customer: Customer
  payment: 'COD' | 'UPI'
  items: OrderItem[]
  subtotal: number
  couponDiscount: number
  shipping: number
  total: number
}
