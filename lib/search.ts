import type { ExtractedEntities } from "./entities";

export interface SearchCandidate {
  url: string;
  title: string;
  snippet: string;
}

const FALLBACK_SITES = [
  "site:gov.ru",
  "site:ria.ru",
  "site:tass.ru",
  "site:rbc.ru",
  "site:lenta.ru",
  "site:meduza.io",
  "site:bbc.com",
  "site:reuters.com",
];

export async function searchSources(entities: ExtractedEntities): Promise<SearchCandidate[]> {
  const query = entities.searchQuery;
  const apiKey = process.env.GOOGLE_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;

  if (apiKey && cseId) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=8`
      );
      const data = (await res.json()) as {
        items?: Array<{ link: string; title: string; snippet?: string }>;
      };
      if (data.items?.length) {
        return data.items.map((i) => ({
          url: i.link,
          title: i.title,
          snippet: i.snippet ?? "",
        }));
      }
    } catch {
      // fallback below
    }
  }

  const candidates: SearchCandidate[] = [];
  const q = encodeURIComponent(query);
  for (const site of FALLBACK_SITES.slice(0, 4)) {
    candidates.push({
      url: `https://www.google.com/search?q=${q}+${encodeURIComponent(site)}`,
      title: `Поиск: ${site}`,
      snippet: `Запрос: ${query}. Откройте ссылку для просмотра результатов.`,
    });
  }
  return candidates;
}
