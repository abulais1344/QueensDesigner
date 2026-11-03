import { ArrowRight, BadgeCheck, MessageCircle, RotateCcw, Ruler, Star, Truck, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductGrid } from '../components/product/ProductGrid'
import { ProductRail } from '../components/product/ProductRail'
import { ProductImage } from '../components/ui/ProductImage'
import { SectionHeader } from '../components/ui/SectionHeader'
import { categories, occasions, priceBands } from '../data/catalog'
import { whatsappUrl } from '../data/contact'
import { photos } from '../data/photos'
import { cn } from '../lib/format'
import { selectBestSellers, selectNewArrivals } from '../lib/product'
import { buttonClass } from '../lib/ui'
import { useCatalog } from '../store/catalog'
import type { Category } from '../types'

export default function Home() {
  const { visibleProducts } = useCatalog()
  return (
    <>
      <Hero />
      <CategoryStrip />
      <TrustBar />
      <BestSellers />
      <Occasions />
      <section className="container-page mt-14 md:mt-20">
        <SectionHeader eyebrow="Just landed" title="New arrivals" linkTo="/shop?sort=new" />
        <ProductRail products={selectNewArrivals(visibleProducts)} label="New arrivals" />
      </section>
      <BudgetStrip />
      <BridalStudio />
      <Reviews />
    </>
  )
}

function Hero() {
  return (
    <section className="container-page pt-3 md:pt-6">
      <div className="grid gap-3 md:gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="relative isolate flex min-h-[500px] overflow-hidden rounded-3xl bg-maroon-dark text-white md:min-h-[540px]">
          <ProductImage
            photo={photos.scarletPalace}
            alt="Model in a scarlet bridal saree at a palace courtyard"
            eager
            ratio={0.75}
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="absolute inset-0 -z-10 [&_img]:object-[60%_30%]"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-maroon-dark via-maroon-dark/55 to-transparent md:bg-gradient-to-r md:from-maroon-dark/95 md:via-maroon-dark/60" />

          <div className="mt-auto max-w-lg p-6 md:my-auto md:p-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
              <span className="size-1.5 rounded-full bg-gold-soft" /> Wedding Season Sale · Up to 40% off
            </span>
            <h1 className="mt-4 text-[38px] leading-[1.02] font-extrabold tracking-[-0.035em] md:text-6xl">
              Wedding season,{' '}
              <span className="font-display font-semibold tracking-[-0.01em] text-blush-deep italic">beautifully sorted.</span>
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/85 md:text-base">
              Handcrafted lehengas, suits and shararas for every ceremony — from haldi mornings to reception nights.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/shop" className={buttonClass('outline', 'lg', 'border-white bg-white text-maroon hover:bg-blush hover:text-maroon')}>
                Shop the edit <ArrowRight className="size-5" />
              </Link>
              <Link
                to="/shop?category=bridal"
                className={buttonClass('ghost', 'lg', 'border border-white/40 text-white hover:bg-white/10')}
              >
                Bridal studio
              </Link>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-white/80">
              <Star className="size-4 fill-gold-soft text-gold-soft" />
              <strong className="font-semibold text-white">4.7/5</strong> from 18,400+ verified buyers
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-1">
          <PromoTile
            to="/shop?category=lehengas&sort=new"
            eyebrow="New in"
            title="Organza lehengas"
            note="From ₹13,490"
            photo={photos.tealLehenga}
            tone="bg-[#e3efee]"
          />
          <PromoTile
            to="/shop?category=suits&price=under-5k,5k-10k"
            eyebrow="Festive staples"
            title="Suits under ₹10k"
            note="Ready to ship"
            photo={photos.greenSuit}
            tone="bg-blush"
          />
        </div>
      </div>
    </section>
  )
}

interface PromoTileProps {
  to: string
  eyebrow: string
  title: string
  note: string
  photo: (typeof photos)[keyof typeof photos]
  tone: string
}

function PromoTile({ to, eyebrow, title, note, photo, tone }: PromoTileProps) {
  return (
    <Link to={to} className={cn('group relative flex min-h-[220px] flex-col overflow-hidden rounded-3xl lg:flex-row', tone)}>
      <div className="relative z-10 flex flex-col p-4 md:p-6 lg:w-1/2 lg:justify-center">
        <p className="text-[11px] font-bold tracking-[0.12em] text-rose-dark uppercase">{eyebrow}</p>
        <h2 className="mt-1 text-lg leading-tight font-extrabold tracking-[-0.02em] md:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-muted">{note}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-maroon">
          Shop now <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
      <ProductImage
        photo={photo}
        alt=""
        ratio={1}
        sizes="(min-width: 1024px) 20vw, 50vw"
        className="mt-auto aspect-[5/4] w-full transition-transform duration-500 group-hover:scale-[1.03] lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:aspect-auto lg:w-1/2"
      />
    </Link>
  )
}

function CategoryStrip() {
  return (
    <section className="container-page mt-10 md:mt-14" aria-labelledby="shop-by-category">
      <SectionHeader title={<span id="shop-by-category">Shop by category</span>} linkTo="/shop" linkLabel="All products" />
      <div className="scrollbar-none -mx-4 flex gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-6 md:gap-6 md:overflow-visible md:px-0">
        {categories.map((c) => (
          <Link key={c.slug} to={`/shop?category=${c.slug}`} className="group flex w-[84px] shrink-0 flex-col items-center text-center md:w-auto">
            <span className="block w-full rounded-full bg-gradient-to-br from-blush-deep to-gold-soft p-[3px] transition group-hover:from-rose group-hover:to-gold">
              <ProductImage photo={c.photo} alt="" ratio={1} sizes="(min-width: 768px) 15vw, 84px" className="aspect-square rounded-full border-[3px] border-ivory" />
            </span>
            <span className="mt-2 text-[13px] leading-tight font-semibold group-hover:text-maroon md:text-[15px]">{c.name}</span>
            <span className="mt-0.5 hidden text-xs text-muted md:block">{c.blurb}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

const trustItems = [
  { icon: Truck, title: 'Free shipping', text: 'On orders above ₹2,999' },
  { icon: RotateCcw, title: '7-day returns', text: 'Easy pickup from home' },
  { icon: Wallet, title: 'Cash on delivery', text: 'Plus UPI & EMI options' },
  { icon: BadgeCheck, title: 'Quality checked', text: 'Every piece, by hand' },
]

function TrustBar() {
  return (
    <section className="container-page mt-10 md:mt-14">
      <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
        {trustItems.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 md:p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blush text-maroon md:size-11">
              <Icon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-bold md:text-sm">{title}</span>
              <span className="block text-xs text-muted">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

const tabs: Array<'All' | Category> = ['All', 'Bridal', 'Lehengas', 'Suits', 'Festive Wear', 'Sharara Sets', 'Party Wear']

function BestSellers() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('All')
  const { visibleProducts: products } = useCatalog()
  const items = useMemo(
    () =>
      tab === 'All'
        ? selectBestSellers(products).slice(0, 8)
        : products
            .filter((p) => p.category === tab)
            .sort((a, b) => b.reviews - a.reviews)
            .slice(0, 8),
    [tab, products],
  )
  const slug = categories.find((c) => c.name === tab)?.slug

  return (
    <section className="container-page mt-14 md:mt-20">
      <SectionHeader eyebrow="Most loved" title="Best sellers" linkTo={slug ? `/shop?category=${slug}&sort=popular` : '/shop?sort=popular'} />
      <div role="tablist" aria-label="Filter best sellers" className="scrollbar-none -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 md:mx-0 md:mb-7 md:px-0">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              'h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition',
              tab === t ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink/40',
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <ProductGrid products={items} />
    </section>
  )
}

function Occasions() {
  return (
    <section className="container-page mt-14 md:mt-20">
      <SectionHeader eyebrow="Dress for the moment" title="Shop by occasion" />
      <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-6 md:gap-4 md:px-0">
        {occasions.map((o) => (
          <Link
            key={o.name}
            to={`/shop?occasion=${encodeURIComponent(o.name)}`}
            className="group relative w-[40%] shrink-0 snap-start overflow-hidden rounded-2xl sm:w-[28%] md:w-auto"
          >
            <ProductImage photo={o.photo} alt="" ratio={1.4} sizes="(min-width: 768px) 16vw, 40vw" className="aspect-[5/7] transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3 text-white md:p-4">
              <p className="text-[15px] leading-tight font-bold md:text-base">{o.name}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-white/80">
                Explore <ArrowRight className="size-3.5" />
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function BudgetStrip() {
  return (
    <section className="container-page mt-14 md:mt-20">
      <SectionHeader eyebrow="Shop smart" title="Shop by budget" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {priceBands.map((band, i) => (
          <Link
            key={band.id}
            to={`/shop?price=${band.id}`}
            className={cn(
              'group flex flex-col justify-between rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-lift md:p-5',
              i === 3 ? 'border-maroon bg-maroon text-white' : 'border-line bg-white',
            )}
          >
            <span className={cn('text-xs font-bold tracking-[0.12em] uppercase', i === 3 ? 'text-blush-deep' : 'text-rose-dark')}>
              {['Everyday festive', 'Function ready', 'Occasion edit', 'Luxe'][i]}
            </span>
            <span className="mt-6 text-xl leading-tight font-extrabold tracking-[-0.02em] md:text-2xl">{band.label}</span>
            <span className={cn('mt-2 inline-flex items-center gap-1 text-sm font-semibold', i === 3 ? 'text-white' : 'text-maroon')}>
              Shop now
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function BridalStudio() {
  return (
    <section className="container-page mt-14 md:mt-20">
      <div className="grid overflow-hidden rounded-3xl bg-blush md:grid-cols-2">
        <div className="grid grid-cols-2 gap-1.5 p-1.5 md:order-2">
          <ProductImage photo={photos.magentaBridal} alt="Bride in a rani pink Banarasi lehenga" ratio={1.4} sizes="(min-width: 768px) 25vw, 50vw" className="aspect-[5/7] rounded-[20px]" />
          <ProductImage photo={photos.bridalSilk} alt="Bride in a red Kanjeevaram silk saree" ratio={1.4} sizes="(min-width: 768px) 25vw, 50vw" className="aspect-[5/7] rounded-[20px]" />
        </div>
        <div className="flex flex-col justify-center p-6 md:p-12">
          <p className="text-xs font-bold tracking-[0.14em] text-rose-dark uppercase">The Bridal Studio</p>
          <h2 className="mt-2 text-3xl leading-[1.08] font-extrabold tracking-[-0.03em] md:text-[42px]">
            Your wedding look, <span className="font-display font-semibold text-maroon italic">made to measure.</span>
          </h2>
          <ul className="mt-6 space-y-3 text-[15px]">
            {[
              { icon: MessageCircle, text: 'Free 1:1 video styling session' },
              { icon: Ruler, text: 'Blouse & lehenga stitched to your measurements' },
              { icon: Truck, text: 'Insured delivery in 4–6 weeks, anywhere in India' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-maroon">
                  <Icon className="size-[18px]" />
                </span>
                {text}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop?category=bridal" className={buttonClass('primary', 'lg')}>
              Shop bridal <ArrowRight className="size-5" />
            </Link>
            <a href={whatsappUrl("Hi Queens Collection, I'd like to book a bridal styling call.")} target="_blank" rel="noreferrer" className={buttonClass('outline', 'lg')}>
              Book a video call
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

const reviews = [
  {
    name: 'Ritika S.',
    city: 'Indore',
    product: 'Teal Tiered Organza Lehenga',
    text: 'Wore it for my sister’s sangeet and got compliments all night. The fabric feels far more expensive than the price. Fit was perfect in M.',
  },
  {
    name: 'Ayesha K.',
    city: 'Lucknow',
    product: 'Ivory Chikan Sharara Set',
    text: 'As someone from Lucknow I’m picky about chikankari — this is the real deal. Delivered in 3 days with COD, packaging was lovely.',
  },
  {
    name: 'Priya M.',
    city: 'Pune',
    product: 'Rani Pink Banarasi Bridal Lehenga',
    text: 'The styling call made it so easy to choose my bridal lehenga. They altered the blouse twice before shipping. Felt like a queen!',
  },
]

function Reviews() {
  return (
    <section className="container-page mt-14 md:mt-20">
      <SectionHeader eyebrow="2 lakh+ happy customers" title="Loved across India" />
      <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:px-0">
        {reviews.map((r) => (
          <figure key={r.name} className="flex w-[85%] shrink-0 snap-start flex-col rounded-2xl border border-line bg-white p-5 md:w-auto md:p-6">
            <div className="flex gap-0.5" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="size-4 fill-gold text-gold" strokeWidth={0} />
              ))}
            </div>
            <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-ink">“{r.text}”</blockquote>
            <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
              <span className="grid size-10 place-items-center rounded-full bg-blush font-bold text-maroon">{r.name[0]}</span>
              <span className="text-sm">
                <span className="flex items-center gap-1 font-semibold">
                  {r.name} <BadgeCheck className="size-4 text-success" aria-label="Verified buyer" />
                </span>
                <span className="text-muted">
                  {r.city} · {r.product}
                </span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
