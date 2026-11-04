import type { Metadata } from 'next';
import { ProductGrid } from '@/components/product-grid';
export const metadata: Metadata = { title: 'Коллекция' };
export default function MenuPage() { return <div className="page-intro"><p className="kicker">Репертуар лавки</p><h1>Коллекция вкусов</h1><p>Пять конфет, которые не пытаются вести себя прилично.</p><ProductGrid /></div>; }
