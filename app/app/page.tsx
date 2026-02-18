"use client";

import Script from "next/script";
import { useEffect, useState, useCallback } from "react";

const MAX_TEXT_LENGTH = 3000;
const TELEGRAM_SCRIPT = "https://telegram.org/js/telegram-web-app.js";

interface RankedSource {
  url: string;
  title: string;
  snippet: string;
  confidence: number;
  reason: string;
}

export default function MiniAppPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<RankedSource[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<{ bg: string; text: string; hint: string }>({
    bg: "#ffffff",
    text: "#000000",
    hint: "#999999",
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.Telegram?.WebApp) return;
    const twa = window.Telegram.WebApp;
    twa.ready();
    twa.expand();
    const tp = twa.themeParams;
    setTheme({
      bg: tp.bg_color ?? "#ffffff",
      text: tp.text_color ?? "#000000",
      hint: tp.hint_color ?? "#999999",
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = text.trim();
      if (!trimmed) return;
      if (trimmed.length > MAX_TEXT_LENGTH) {
        setError(`Текст не должен превышать ${MAX_TEXT_LENGTH} символов`);
        return;
      }
      setError(null);
      setSources(null);
      setLoading(true);
      try {
        const initData = typeof window !== "undefined" ? window.Telegram?.WebApp?.initData ?? "" : "";
        const res = await fetch("/api/find-sources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed, initData }),
        });
        const data = (await res.json()) as { sources?: RankedSource[]; error?: string };
        if (!res.ok) {
          setError(data.error ?? "Ошибка запроса");
          setSources([]);
          return;
        }
        setSources(data.sources ?? []);
      } catch {
        setError("Ошибка сети");
        setSources([]);
      } finally {
        setLoading(false);
      }
    },
    [text]
  );

  return (
    <>
      <Script src={TELEGRAM_SCRIPT} strategy="beforeInteractive" />
      <main
        className="min-h-screen p-4 pb-8"
        style={{
          backgroundColor: theme.bg,
          color: theme.text,
        }}
      >
        <div className="mx-auto max-w-xl">
          <h1 className="mb-4 text-xl font-bold">FindOrigin</h1>
          <p className="mb-4 text-sm" style={{ color: theme.hint }}>
            Введите текст или утверждение — подберём до 3 возможных источников.
          </p>

          <form onSubmit={handleSubmit} className="mb-6">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Вставьте текст или утверждение…"
              maxLength={MAX_TEXT_LENGTH + 100}
              rows={5}
              className="mb-3 w-full resize-y rounded-lg border p-3 text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: theme.hint,
                backgroundColor: theme.bg,
                color: theme.text,
              }}
              disabled={loading}
            />
            <div className="mb-2 text-xs" style={{ color: theme.hint }}>
              {text.length} / {MAX_TEXT_LENGTH}
            </div>
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="w-full rounded-lg py-3 font-medium disabled:opacity-50"
              style={{
                backgroundColor: "var(--tg-theme-button-color, #2481cc)",
                color: "var(--tg-theme-button-text-color, #ffffff)",
              }}
            >
              {loading ? "Ищу источники…" : "Найти источники"}
            </button>
          </form>

          {error && (
            <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              {error}
            </div>
          )}

          {sources !== null && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Результаты</h2>
              {sources.length === 0 ? (
                <p style={{ color: theme.hint }}>Источники не найдены.</p>
              ) : (
                <ul className="space-y-4">
                  {sources.map((s, i) => (
                    <li key={i} className="rounded-lg border p-3" style={{ borderColor: theme.hint }}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium underline"
                        style={{ color: "var(--tg-theme-link-color, #2481cc)" }}
                      >
                        {s.title}
                      </a>
                      <p className="mt-1 text-sm opacity-90">{s.snippet}</p>
                      <p className="mt-2 text-xs" style={{ color: theme.hint }}>
                        Уверенность: {s.confidence}%. {s.reason}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      </main>
    </>
  );
}
