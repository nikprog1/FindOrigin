const TELEGRAM_API = "https://api.telegram.org";

export function getBotUrl(): string {
  const token = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("BOT_TOKEN или TELEGRAM_BOT_TOKEN не задан");
  return `${TELEGRAM_API}/bot${token}`;
}

export async function sendMessage(chatId: number, text: string): Promise<void> {
  const url = getBotUrl() + "/sendMessage";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram sendMessage failed: ${res.status} ${err}`);
  }
}

export type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number; type: string };
    text?: string;
    entities?: Array<{ type: string; offset: number; length: number }>;
  };
};

export function parseTelegramPostUrl(text: string): { username: string; postId: number } | null {
  const match = text.trim().match(
    /(?:https?:\/\/)?(?:t\.me|telegram\.me|telegram\.dog)\/([a-zA-Z0-9_]+)\/(\d+)/
  );
  if (!match) return null;
  return { username: match[1], postId: parseInt(match[2], 10) };
}

export function isTelegramPostUrl(text: string): boolean {
  return parseTelegramPostUrl(text) !== null;
}
