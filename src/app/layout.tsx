import type { Metadata } from 'next';
import { Playfair_Display, Raleway } from 'next/font/google';
import '@/app/globals.css';
import '@/app/audit.css';
import '@/app/contact-layout.css';
import '@/app/candy-rain.css';
import { CartProvider } from '@/components/cart-provider';
import { CandyRain } from '@/components/candy-rain';
import { CartDrawer, Footer, Header } from '@/components/store-shell';
const display = Playfair_Display({ subsets: ['cyrillic'], variable: '--font-display' });
const sans = Raleway({ subsets: ['cyrillic'], variable: '--font-sans' });
export const metadata: Metadata = { title: { default: 'Bonbons Pauvres — конфеты с характером', template: '%s — Bonbons Pauvres' }, description: 'Коллекция необычных конфет в эстетике парижского кабаре.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ru" className={`${display.variable} ${sans.variable}`}><body><CartProvider><CandyRain /><a className="skip-link" href="#content">К содержанию</a><Header /><main id="content">{children}</main><Footer /><CartDrawer /></CartProvider></body></html>; }
