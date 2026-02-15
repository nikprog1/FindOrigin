import { parseTelegramPostUrl } from "./telegram";

/**
 * Telegram Bot API не позволяет получить содержимое поста по публичной ссылке
 * (t.me/channel/123), если бот не в канале. Поэтому возвращаем null —
 * вызывающий код попросит пользователя прислать текст или переслать пост.
 */
export async function getTextFromTelegramPost(_postUrl: string): Promise<string | null> {
  const parsed = parseTelegramPostUrl(_postUrl);
  if (!parsed) return null;
  return null;
}
