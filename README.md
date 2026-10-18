<p align="center">
  <img src="frontend/public/assets/images/logo.webp" width="180" alt="Bonbons Pauvres">
</p>

<h1 align="center">Bonbons Pauvres</h1>

<p align="center">Русскоязычный магазин необычных конфет в эстетике мрачного парижского кабаре.</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white" alt="Node.js 22">
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express 5">
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL 16">
  <img src="https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=111111" alt="JavaScript ES6+">
  <img src="https://img.shields.io/badge/license-AGPL--3.0--or--later-A42E2B" alt="AGPL-3.0-or-later">
</p>

## Что это

Bonbons Pauvres — учебный full-stack проект: каталог необычных конфет, статьи, обратная связь, голосование и корзина. Сайт работает на Express и PostgreSQL, а интерфейс написан на чистом HTML, CSS и JavaScript без фронтенд-фреймворков.

Зачем это нужно: проект последовательно покрывает десять лабораторных работ — от семантической вёрстки и адаптивного дизайна до REST API, базы данных, интерактивности и тестирования.

## Возможности

- пять страниц: главная, о компании, меню, статьи и контакты;
- каталог из PostgreSQL: поиск, фильтры, сортировка и карточки товаров;
- корзина с количеством, итоговой суммой и сохранением в `localStorage`;
- оформление заявки из корзины с автоматическим составом заказа в комментарии;
- сохранение заявок в PostgreSQL и опциональные уведомления в Discord;
- опциональный SOCKS5-прокси только для Discord-вебхука;
- голосование с результатами, процентами и защитой от повторного голоса в сессии;
- адаптивная вёрстка, доступная клавиатурная навигация и проверенная HTML-разметка.

## Стек

| Зона | Технологии |
|---|---|
| Клиент | HTML5, CSS3, Vanilla JavaScript, Fetch API, `localStorage` |
| Сервер | Node.js, Express, `express-session`, `cookie-parser` |
| Данные | PostgreSQL, `pg` |
| Конфигурация | `dotenv`, Docker Compose |
| Интеграции | Discord webhook, `socks-proxy-agent` |

## Быстрый запуск

### Локально

1. Установите Node.js LTS и PostgreSQL.
2. Скопируйте `.env.example` в `.env` и заполните параметры PostgreSQL.
3. Установите зависимости и запустите проект:

```bash
npm install
npm start
```

Сайт будет доступен по адресу [http://localhost:3000](http://localhost:3000).

Для режима разработки с автоматическим перезапуском:

```bash
npm run dev
```

### Через Docker Compose

1. Скопируйте `.env.example` в `.env` и задайте безопасные значения.
2. Запустите контейнеры:

```bash
docker compose up -d --build
```

Compose поднимает приложение и PostgreSQL. База данных не публикует порт наружу; приложение доступно только на `127.0.0.1:3000`, чтобы его мог проксировать Nginx хоста.

Остановить сервисы:

```bash
docker compose down
```

Удалить вместе с данными PostgreSQL:

```bash
docker compose down -v
```

## Переменные окружения

| Переменная | Назначение |
|---|---|
| `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` | Подключение к PostgreSQL |
| `PORT` | Порт приложения, по умолчанию `3000` |
| `SESSION_SECRET` | Секрет сессий Express |
| `DISCORD_WEBHOOK_URL` | Необязательный Discord webhook для заявок |
| `DISCORD_SOCKS5_PROXY` | Необязательный SOCKS5 URL для Discord, например `socks5h://127.0.0.1:1080` |

Никогда не публикуйте `.env` и URL Discord webhook в репозитории.

## Проверка

```bash
node --check backend/server.js
node --check frontend/public/script.js
npx html-validate frontend/public/*.html
```

Проверки разметки и API можно повторить командами выше.

## Лицензия

Проект распространяется по лицензии [GNU Affero General Public License v3.0 or later](https://www.gnu.org/licenses/agpl-3.0.html). См. [LICENSE](LICENSE).
