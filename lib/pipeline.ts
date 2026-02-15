import { sendMessage, isTelegramPostUrl } from "./telegram";
import { getTextFromTelegramPost } from "./getPostText";
import { extractEntities } from "./entities";

const HELP_TEXT = `FindOrigin — бот для поиска источников информации.

Отправьте текст или утверждение — я подберу 1–3 возможных источника с оценкой уверенности.

Если у вас ссылка на пост в Telegram — пришлите, пожалуйста, текст поста отдельным сообщением или перешлите пост сюда (по ссылке t.me я не могу прочитать содержимое).`;

function formatEntities(entities: ReturnType<typeof extractEntities>): string {
  const parts: string[] = [];
  if (entities.claims.length) parts.push("Утверждения: " + entities.claims.slice(0, 3).join(" | "));
  if (entities.dates.length) parts.push("Даты: " + entities.dates.join(", "));
  if (entities.numbers.length) parts.push("Числа: " + entities.numbers.slice(0, 5).join(", "));
  if (entities.names.length) parts.push("Имена: " + entities.names.slice(0, 5).join(", "));
  if (entities.links.length) parts.push("Ссылки: " + entities.links.join(", "));
  parts.push("Поисковый запрос: " + entities.searchQuery.slice(0, 150));
  return parts.filter(Boolean).join("\n\n");
}

export async function runPipeline(chatId: number, input: string): Promise<void> {
  const trimmed = input?.trim();
  if (!trimmed) {
    await sendMessage(chatId, "Пришлите текст или утверждение для поиска источников.");
    return;
  }

  if (trimmed === "/start" || trimmed === "/help") {
    await sendMessage(chatId, HELP_TEXT);
    return;
  }

  let text: string | null = trimmed;

  if (isTelegramPostUrl(trimmed)) {
    text = await getTextFromTelegramPost(trimmed);
    if (!text) {
      await sendMessage(
        chatId,
        "По ссылке на пост я не могу прочитать содержимое. Пришлите текст поста отдельным сообщением или перешлите пост сюда."
      );
      return;
    }
  }

  await sendMessage(chatId, "Обрабатываю текст…");

  try {
    const entities = extractEntities(text);
    const message =
      "Выполнено до этапа поиска. Извлечённые сущности:\n\n" + formatEntities(entities);
    await sendMessage(chatId, message);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Ошибка при обработке текста.";
    await sendMessage(chatId, `Ошибка: ${msg}`);
  }
}
