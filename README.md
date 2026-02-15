# FindOrigin

Telegram-бот для поиска источников информации: получает текст или ссылку на пост и возвращает 1–3 возможных источника с оценкой уверенности.

## Стек

- Next.js (App Router)
- Деплой: Vercel

## Переменные окружения

Скопируйте `.env.example` в `.env` и заполните:

- `BOT_TOKEN` — токен бота от [@BotFather](https://t.me/BotFather)
- `OPENAI_API_KEY` — ключ OpenAI для семантического сравнения (опционально; без него выдаётся до 3 ссылок без AI-ранжирования)
- `GOOGLE_API_KEY`, `GOOGLE_CSE_ID` — для Google Custom Search (опционально; без них формируются поисковые ссылки)
- `NEXT_PUBLIC_APP_URL` или `VERCEL_URL` — базовый URL приложения (нужен для установки webhook)

## Запуск локально

```powershell
npm install
npm run dev
```

Для приёма обновлений от Telegram в разработке используйте [ngrok](https://ngrok.com/) или аналог и установите webhook на `https://<ваш-туннель>/api/webhook`.

## Установка webhook (после деплоя на Vercel)

```powershell
$env:NEXT_PUBLIC_APP_URL = "https://your-app.vercel.app"
npm run webhook:set
```

Либо задайте `NEXT_PUBLIC_APP_URL` в `.env` и выполните `npm run webhook:set`.

## Деплой на Vercel

1. Подключите репозиторий к Vercel.
2. В настройках проекта добавьте переменные: `BOT_TOKEN`, `OPENAI_API_KEY` (и при необходимости `GOOGLE_API_KEY`, `GOOGLE_CSE_ID`).
3. После деплоя установите webhook (см. выше), указав URL вида `https://<проект>.vercel.app`.

## Использование

- Отправьте боту текст или утверждение — бот вернёт до 3 возможных источников с оценкой уверенности.
- По ссылке на пост (t.me/…) бот не может прочитать содержимое; он попросит прислать текст или переслать пост.
- Команды: `/start`, `/help`.
