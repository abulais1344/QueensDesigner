import { MapPin, MessageCircle, Navigation, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categories } from '../../data/catalog'
import { contact, whatsappUrl } from '../../data/contact'
import { Logo } from './Logo'

const help = ['Track your order', 'Returns & exchanges', 'Shipping policy', 'Size guide', 'FAQs']
const year = new Date().getFullYear()
const company = ['Our story', 'Bridal appointments', 'Store locator', 'Careers', 'Privacy policy']

export function Footer() {
  return (
    <footer className="mt-16 bg-ink text-white/75 md:mt-24">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] md:py-16">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Contemporary Indian occasion wear from our store in Nanded, Maharashtra — bridal, lehengas, suits and festive wear, delivered
            across India.
          </p>
          <div className="mt-5 flex gap-2">
            {['Instagram', 'Facebook', 'YouTube', 'Pinterest'].map((s) => (
              <a key={s} href="#" className="grid h-10 place-items-center rounded-full border border-white/15 px-3.5 text-xs font-semibold text-white hover:border-blush-deep hover:text-blush-deep">
                {s.slice(0, 2).toUpperCase()}
                <span className="sr-only">{s}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 md:contents">
          <FooterColumn title="Shop">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link to={`/shop?category=${c.slug}`} className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </FooterColumn>
          <FooterColumn title="Help">
            {help.map((h) => (
              <li key={h}>
                <a href="#" className="hover:text-white">
                  {h}
                </a>
              </li>
            ))}
            {company.slice(0, 2).map((h) => (
              <li key={h} className="md:hidden">
                <a href="#" className="hover:text-white">
                  {h}
                </a>
              </li>
            ))}
          </FooterColumn>
        </div>

        <FooterColumn title="Visit or call us">
          <li className="flex items-center gap-2.5">
            <Phone className="size-4 text-blush-deep" />
            <a href={contact.phoneHref} className="hover:text-white">
              {contact.phoneDisplay}
            </a>
          </li>
          <li className="flex items-center gap-2.5">
            <MessageCircle className="size-4 text-blush-deep" />
            <a href={whatsappUrl()} target="_blank" rel="noreferrer" className="hover:text-white">
              Chat on WhatsApp
            </a>
          </li>
          <li className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 size-4 shrink-0 text-blush-deep" />
            <address className="not-italic">
              {contact.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </li>
          <li>
            <a
              href={contact.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-semibold text-white hover:border-blush-deep hover:text-blush-deep"
            >
              <Navigation className="size-4" /> Get directions
            </a>
          </li>
        </FooterColumn>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-5 pb-[calc(1.25rem+64px+env(safe-area-inset-bottom))] text-xs md:flex-row md:items-center md:justify-between md:pb-5">
          <p>
            © {year} Queens Collection. All rights reserved. ·{' '}
            <Link to="/admin" className="underline-offset-2 hover:text-white hover:underline">
              Staff login
            </Link>
          </p>
          <p className="flex flex-wrap gap-2">
            {['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net Banking', 'COD'].map((m) => (
              <span key={m} className="rounded border border-white/15 px-2 py-1 font-semibold text-white/80">
                {m}
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-bold tracking-[0.14em] text-white uppercase">{title}</h3>
      <ul className="space-y-3 text-sm">{children}</ul>
    </div>
  )
}
