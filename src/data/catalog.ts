export type Category = 'шоколад' | 'лакрица' | 'экспериментальное';

export type Product = {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number;
  weight: string;
  category: Category;
  badge?: string;
  image: string;
  alt: string;
};

export const categories: Array<{ slug: Category; label: string }> = [
  { slug: 'шоколад', label: 'Шоколад' },
  { slug: 'лакрица', label: 'Лакрица' },
  { slug: 'экспериментальное', label: 'Экспериментальное' },
];

export const products: Product[] = [
  { id: 1, slug: 'hawthorn-flakes', title: 'Боярышниковые хлопья', description: 'Хрупкие, терпкие и подозрительно изысканные.', price: 69000, weight: '80 г', category: 'экспериментальное', badge: 'Новинка', image: '/assets/images/hawthorn-flakes.webp', alt: 'Упаковка конфет «Боярышниковые хлопья»' },
  { id: 2, slug: 'gorilla-boogers', title: 'Gorilla Boogers', description: '«Козявки гориллы», зелёная легенда кабаре.', price: 79000, weight: '100 г', category: 'экспериментальное', badge: 'Хит', image: '/assets/images/gorilla-boogers.webp', alt: 'Упаковка конфет Gorilla Boogers' },
  { id: 3, slug: 'sore-bark', title: 'Корка с болячек', description: 'Карамельная хрустящая фантазия с дерзким названием.', price: 59500, weight: '90 г', category: 'экспериментальное', badge: '−15%', image: '/assets/images/sore-bark.webp', alt: 'Упаковка конфет «Корка с болячек»' },
  { id: 4, slug: 'salty-licorice', title: 'Солёная лакрица', description: 'Финская классика для людей с сильным характером.', price: 64000, weight: '120 г', category: 'лакрица', badge: 'Классика', image: '/assets/images/salty-licorice.webp', alt: 'Упаковка солёной лакрицы' },
  { id: 5, slug: 'ant-candies', title: 'Конфеты с муравьями', description: 'Шоколадный десерт с неожиданным хрустом.', price: 85000, weight: '100 г', category: 'шоколад', badge: 'Хит', image: '/assets/images/ant-candies.webp', alt: 'Упаковка конфет с муравьями' },
];

export const formatPrice = (minor: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(minor / 100);
