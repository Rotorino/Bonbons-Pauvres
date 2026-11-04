import { describe, expect, it } from 'vitest';
import { formatPrice, products } from './catalog';

describe('catalog fixtures', () => {
  it('contains unique product ids and positive prices', () => {
    expect(new Set(products.map(product => product.id)).size).toBe(products.length);
    expect(products.every(product => product.price > 0)).toBe(true);
  });
  it('formats stored minor units as roubles', () => expect(formatPrice(69000)).toBe('690 ₽'));
});
