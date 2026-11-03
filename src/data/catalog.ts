import type { Category, Occasion, Photo, Size } from '../types'
import { photos } from './photos'

export interface CategoryInfo {
  name: Category
  slug: string
  blurb: string
  photo: Photo
}

export const categories: CategoryInfo[] = [
  { name: 'Bridal', slug: 'bridal', blurb: 'Lehengas & sarees for the big day', photo: photos.magentaBridal },
  { name: 'Lehengas', slug: 'lehengas', blurb: 'Sangeet to reception', photo: photos.tealLehenga },
  { name: 'Suits', slug: 'suits', blurb: 'Anarkalis & kurta sets', photo: photos.greenSuit },
  { name: 'Festive Wear', slug: 'festive-wear', blurb: 'Sarees & anarkali gowns', photo: photos.plumSaree },
  { name: 'Sharara Sets', slug: 'sharara-sets', blurb: 'Shararas & ghararas', photo: photos.mustardKurta },
  { name: 'Party Wear', slug: 'party-wear', blurb: 'Gowns & Indo-western', photo: photos.redGown },
]

export const occasions: { name: Occasion; photo: Photo }[] = [
  { name: 'Wedding', photo: photos.scarletPalace },
  { name: 'Mehendi & Haldi', photo: photos.mustardKurta },
  { name: 'Sangeet', photo: photos.tealLehenga },
  { name: 'Reception', photo: photos.plumGown },
  { name: 'Festive', photo: photos.plumSaree },
  { name: 'Party', photo: photos.redGown },
]

export const priceBands = [
  { id: 'under-5k', label: 'Under ₹5,000', min: 0, max: 4999 },
  { id: '5k-10k', label: '₹5,000 – ₹9,999', min: 5000, max: 9999 },
  { id: '10k-25k', label: '₹10,000 – ₹24,999', min: 10000, max: 24999 },
  { id: '25k-plus', label: '₹25,000 & above', min: 25000, max: Infinity },
] as const

export const sizeOrder: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export const sortOptions = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'new', label: "What's new" },
  { id: 'popular', label: 'Popularity' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'rating', label: 'Customer rating' },
  { id: 'discount', label: 'Better discount' },
] as const

export type SortId = (typeof sortOptions)[number]['id']

export const sizeChart = [
  { size: 'XS', bust: 32, waist: 26, hip: 35 },
  { size: 'S', bust: 34, waist: 28, hip: 37 },
  { size: 'M', bust: 36, waist: 30, hip: 39 },
  { size: 'L', bust: 38, waist: 32, hip: 41 },
  { size: 'XL', bust: 40, waist: 34, hip: 43 },
  { size: 'XXL', bust: 42, waist: 36, hip: 45 },
]

export const COUPON = { code: 'QUEEN10', percent: 10, maxOff: 2500 }
export const FREE_SHIPPING_THRESHOLD = 2999
export const SHIPPING_FEE = 99
