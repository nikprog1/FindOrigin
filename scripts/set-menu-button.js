/**
 * Установка кнопки меню бота (Mini App).
 * Запуск: npm run menu:set
 * Требует: BOT_TOKEN и NEXT_PUBLIC_APP_URL (или APP_URL) в .env
 */
const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const BOT_TOKEN = process.env.BOT_TOKEN;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || process.env.VERCEL_URL;

if (!BOT_TOKEN) {
  console.error("Укажите BOT_TOKEN в .env");
  process.exit(1);
}

const base = BASE_URL
  ? BASE_URL.startsWith("http")
    ? BASE_URL
    : `https://${BASE_URL}`
  : null;
if (!base) {
  console.error("Укажите NEXT_PUBLIC_APP_URL или VERCEL_URL в .env");
  process.exit(1);
}

const appUrl = `${base.replace(/\/$/, "")}/app`;

async function main() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/setChatMenuButton`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      menu_button: {
        type: "web_app",
        text: "Открыть FindOrigin",
        web_app: { url: appUrl },
      },
    }),
  });
  const data = await res.json();
  if (data.ok) {
    console.log("Кнопка меню установлена:", appUrl);
  } else {
    console.error("Ошибка:", data);
    process.exit(1);
  }
}

main();
