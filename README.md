# Bonbons Pauvres

Bonbons Pauvres — витрина необычных конфет в эстетике тёмного парижского кабаре.

Проект построен на Node.js, TypeScript и Next.js.

## Быстрый старт

    npm ci
    npm run dev

Откройте http://127.0.0.1:3000.

## Команды

| Команда | Назначение |
|---|---|
| npm run dev | Локальная разработка Next.js |
| npm run build | Production-сборка |
| npm start | Запуск production-сборки |
| npm run lint | ESLint |
| npm run typecheck | Строгая проверка TypeScript |
| npm test | Unit-тесты |
| npm run db:generate | Генерация Drizzle migration |
| npm run db:migrate | Применение migration |

## PostgreSQL

Скопируйте `.env.example` в `.env` и укажите `DATABASE_URL`. Схема базы находится в `src/server/db/schema.ts`.
