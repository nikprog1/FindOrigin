import { sendMessage, isTelegramPostUrl } from "./telegram";
import { getTextFromTelegramPost } from "./getPostText";
import { extractEntities } from "./entities";
import { searchSources } from "./search";
import { rankSourcesWithAI, type RankedSource } from "./ai";

const HELP_TEXT = `FindOrigin — бот для поиска источников информации.

Отправьте текст или утверждение — я подберу 1–3 возможных источника с оценкой уверенности.

Если у вас ссылка на пост в Telegram — пришлите, пожалуйста, текст поста отдельным сообщением или перешлите пост сюда (по ссылке t.me я не могу прочитать содержимое).`;

function formatRankedSources(sources: RankedSource[]): string {
  if (sources.length === 0) return "Источники не найдены.";
  return sources
    .map(
      (s, i) =>
        `${i + 1}. ${s.title}\n${s.url}\nУверенность: ${s.confidence}%.${s.reason ? ` ${s.reason}` : ""}`
    )
    .join("\n\n");
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
    const candidates = await searchSources(entities);
    const ranked = await rankSourcesWithAI(text, candidates);
    const message = formatRankedSources(ranked);
    await sendMessage(chatId, message);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Ошибка при обработке текста.";
    await sendMessage(chatId, `Ошибка: ${msg}`);
  }
}
