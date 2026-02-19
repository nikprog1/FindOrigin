import { NextRequest, NextResponse } from "next/server";
import { getRankedSources } from "@/lib/pipeline";
import { validateTelegramWebAppInitData } from "@/lib/validateInitData";

const MAX_TEXT_LENGTH = 10000;

export async function POST(request: NextRequest) {
  let body: { text?: string; initData?: string };
  try {
    body = (await request.json()) as { text?: string; initData?: string };
  } catch {
    return NextResponse.json({ error: "Неверное тело запроса" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Укажите текст для поиска источников" }, { status: 400 });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `Текст не должен превышать ${MAX_TEXT_LENGTH} символов` },
      { status: 400 }
    );
  }

  const initData = typeof body.initData === "string" ? body.initData : "";
  const skipValidation = process.env.SKIP_INITDATA_VALIDATION === "true";
  if (initData && !skipValidation) {
    const botToken = process.env.BOT_TOKEN;
    if (!botToken || !validateTelegramWebAppInitData(initData, botToken)) {
      return NextResponse.json({ error: "Недействительные данные Mini App" }, { status: 401 });
    }
  }

  try {
    const sources = await getRankedSources(text);
    return NextResponse.json({ sources });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Ошибка при поиске источников";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
