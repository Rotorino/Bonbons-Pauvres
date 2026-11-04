'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { categories, formatPrice, products, type Category } from '@/data/catalog';
import { useCart } from '@/components/cart-provider';

export function ProductGrid({ featured = false }: { featured?: boolean }) {
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [query, setQuery] = useState('');
  const { add } = useCart();
  const visible = useMemo(() => products.filter(product => (!featured || product.badge) && (category === 'all' || product.category === category) && product.title.toLowerCase().includes(query.toLowerCase())), [category, query, featured]);

  return <section className="collection"><div className="collection__head"><div><p className="kicker">Коллекция / {featured ? 'избранное' : 'все вкусы'}</p><h2>{featured ? 'Неприлично хорошие' : 'Выберите свой скандал'}</h2></div>{!featured && <label className="search"><span className="sr-only">Поиск по названию</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Найти вкус" /></label>}</div>{!featured && <div className="filter-row" aria-label="Категории">{[{ slug: 'all', label: 'Все' }, ...categories].map(item => <button className={category === item.slug ? 'selected' : ''} onClick={() => setCategory(item.slug as Category | 'all')} key={item.slug}>{item.label}</button>)}</div>}<div className="product-grid">{visible.map(product => <article className="product" key={product.id}><div className="product__image"><Image src={product.image} alt={product.alt} fill sizes="(max-width: 700px) 100vw, 33vw" /><span>{product.badge ?? product.category}</span></div><div className="product__body"><h3>{product.title}</h3><p className="product__weight">{product.weight}</p><p>{product.description}</p><div><strong>{formatPrice(product.price)}</strong><button onClick={() => add(product.id)}>В корзину <span aria-hidden="true">↗</span></button></div></div></article>)}</div>{!visible.length && <p className="empty">Ничего не нашлось. Попробуйте другое слово или категорию.</p>}</section>;
}
