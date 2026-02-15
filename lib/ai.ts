import OpenAI from "openai";
import type { SearchCandidate } from "./search";

export interface RankedSource {
  url: string;
  title: string;
  snippet: string;
  confidence: number;
  reason: string;
}

export async function rankSourcesWithAI(
  userText: string,
  candidates: SearchCandidate[]
): Promise<RankedSource[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || candidates.length === 0) {
    return candidates.slice(0, 3).map((c) => ({
      ...c,
      confidence: 50,
      reason: "Оценка без AI (задайте OPENAI_API_KEY для семантического сравнения).",
    }));
  }

  const openai = new OpenAI({ apiKey });
  const list = candidates
    .slice(0, 10)
    .map((c, i) => `[${i}] ${c.title}\n${c.snippet}\nURL: ${c.url}`)
    .join("\n\n");

  const prompt = `Ты — эксперт по проверке источников. Пользователь прислал текст/утверждение. Ниже список кандидатов-источников (URL, заголовок, сниппет).
Задача: выбрать от 1 до 3 источников, которые лучше всего подходят как ИСТОЧНИК этой информации (официальные, новости, исследования). Сравнивай СМЫСЛ, не буквальный текст.
Ответь строго в формате JSON-массива, без markdown и без пояснений вне JSON. Каждый элемент:
{"index": номер из списка 0-9, "confidence": число от 1 до 100, "reason": "краткая причина выбора"}

Текст пользователя:
---
${userText.slice(0, 2000)}
---

Кандидаты:
---
${list}
---`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });
    const content = completion.choices[0]?.message?.content?.trim() ?? "[]";
    const json = content.replace(/^```\w*\n?|\n?```$/g, "").trim();
    const parsed = JSON.parse(json) as Array<{ index: number; confidence: number; reason: string }>;
    const valid = parsed
      .filter((p) => typeof p.index === "number" && p.index >= 0 && p.index < candidates.length)
      .slice(0, 3);
    return valid.map((p) => {
      const c = candidates[p.index];
      return {
        url: c.url,
        title: c.title,
        snippet: c.snippet,
        confidence: Math.min(100, Math.max(0, p.confidence)),
        reason: p.reason || "",
      };
    });
  } catch {
    return candidates.slice(0, 3).map((c) => ({
      ...c,
      confidence: 50,
      reason: "Не удалось выполнить AI-оценку.",
    }));
  }
}
