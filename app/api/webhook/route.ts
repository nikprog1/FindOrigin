import { NextRequest, NextResponse } from "next/server";
import type { TelegramUpdate } from "@/lib/telegram";
import { runPipeline } from "@/lib/pipeline";

export async function POST(request: NextRequest) {
  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const chatId = update.message?.chat?.id;
  const text = update.message?.text?.trim();

  if (chatId == null || text == null) {
    return NextResponse.json({ ok: true });
  }

  runPipeline(chatId, text).catch(() => {});
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ service: "FindOrigin webhook" });
}
