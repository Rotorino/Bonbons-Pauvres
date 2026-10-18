INSERT INTO categories (name, slug) VALUES
  ('Шоколад', 'шоколад'),
  ('Лакрица', 'лакрица'),
  ('Экспериментальное', 'экспериментальное')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO dishes (title, description, price, weight, category_id, badge, image_url, sort_order)
SELECT v.title, v.description, v.price, v.weight, c.id, v.badge, v.image_url, v.sort_order
FROM (VALUES
  ('Боярышниковые хлопья', 'Хрупкие, терпкие и подозрительно изысканные.', 690, '80 г', 'Новинка', '/assets/images/hawthorn-flakes.webp', 1, 'экспериментальное'),
  ('Gorilla Boogers', '«Козявки гориллы» — зелёная легенда кабаре.', 790, '100 г', 'Хит', '/assets/images/gorilla-boogers.webp', 2, 'экспериментальное'),
  ('Корка с болячек', 'Карамельная хрустящая фантазия с дерзким названием.', 595, '90 г', '−15%', '/assets/images/sore-bark.webp', 3, 'экспериментальное'),
  ('Солёная лакрица', 'Финская классика для людей с сильным характером.', 640, '120 г', 'Классика', '/assets/images/salty-licorice.webp', 4, 'лакрица'),
  ('Конфеты с муравьями', 'Шоколадный десерт с неожиданным хрустом.', 850, '100 г', 'Хит', '/assets/images/ant-candies.webp', 5, 'шоколад')
) AS v(title, description, price, weight, badge, image_url, sort_order, slug)
JOIN categories c ON c.slug = v.slug
WHERE NOT EXISTS (SELECT 1 FROM dishes d WHERE d.title = v.title);

INSERT INTO services (title, description, sort_order) VALUES
  ('Смелый вкус', 'Необычные сочетания для любопытных гурманов.', 1),
  ('Театральная подача', 'Каждая коробка — маленький спектакль.', 2),
  ('Тайная доставка', 'Привезём заказ так, будто он приехал из-за кулис.', 3)
ON CONFLICT DO NOTHING;

INSERT INTO articles (title, excerpt, content) VALUES
  ('Почему странные конфеты становятся модными', 'Короткая история вкусов, которые сначала пугают, а потом не отпускают.', 'История смелых кондитерских экспериментов.'),
  ('Лакрица: любовь с первого укуса', 'Разбираемся в финской солёной классике.', 'Лакрица разделяет публику, но никогда не оставляет её равнодушной.')
ON CONFLICT DO NOTHING;

INSERT INTO polls (question, is_active)
SELECT 'Какое блюдо добавить в меню?', TRUE
WHERE NOT EXISTS (SELECT 1 FROM polls WHERE question = 'Какое блюдо добавить в меню?');

INSERT INTO poll_options (poll_id, title, sort_order)
SELECT p.id, v.title, v.sort_order
FROM polls p
CROSS JOIN (VALUES ('Конфеты с муравьями', 1), ('Солёная лакрица', 2), ('Gorilla Boogers', 3), ('Боярышниковые хлопья', 4), ('Корка с болячек', 5)) AS v(title, sort_order)
WHERE p.question = 'Какое блюдо добавить в меню?'
  AND NOT EXISTS (SELECT 1 FROM poll_options o WHERE o.poll_id = p.id);
