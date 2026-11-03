/** Store contact details — the single source for every phone, WhatsApp and address link. */
export const contact = {
  phoneDisplay: '+91 86683 58883',
  phoneHref: 'tel:+918668358883',
  /** WhatsApp number in international format, digits only */
  whatsapp: '918668358883',
  addressLines: ['Barkat Complex, Near Baba Petrol Pump', 'Nanded, Maharashtra 431604'],
  mapsUrl: 'https://maps.app.goo.gl/XBtMNtb41FuZrnJ46',
}

export function whatsappUrl(message?: string) {
  return `https://wa.me/${contact.whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ''}`
}
