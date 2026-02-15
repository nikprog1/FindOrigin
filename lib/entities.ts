export interface ExtractedEntities {
  claims: string[];
  dates: string[];
  numbers: string[];
  names: string[];
  links: string[];
  searchQuery: string;
}

const URL_REGEX =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;
const DATE_REGEX =
  /(?:\d{1,2}[./\-]\d{1,2}[./\-]\d{2,4})|(?:\d{4}[./\-]\d{1,2}[./\-]\d{1,2})|(?:\d{1,2}\s+(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)\s+\d{2,4})/gi;
const NUMBER_REGEX = /\b\d+(?:[.,]\d+)?(?:\s*%)?\b/g;

export function extractEntities(text: string): ExtractedEntities {
  const links = [...(text.match(URL_REGEX) ?? [])];
  const dates = [...(text.match(DATE_REGEX) ?? [])];
  const numbers = [...(text.match(NUMBER_REGEX) ?? [])];

  const textWithoutUrls = text.replace(URL_REGEX, " ").replace(/\s+/g, " ").trim();
  const sentences = textWithoutUrls
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  const claims = sentences.slice(0, 10);

  const nameCandidates = textWithoutUrls.match(/\b[А-ЯA-Z][а-яa-z]+(?:\s+[А-ЯA-Z][а-яa-z]+)*\b/g) ?? [];
  const names = Array.from(new Set(nameCandidates)).filter((n) => n.length > 2).slice(0, 15);

  const words = textWithoutUrls
    .toLowerCase()
    .replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const uniqueWords = Array.from(new Set(words)).slice(0, 8);
  const searchQuery = (uniqueWords.join(" ") + " " + claims.slice(0, 2).join(" ")).trim().slice(0, 200);

  return {
    claims,
    dates,
    numbers,
    names,
    links,
    searchQuery: searchQuery || textWithoutUrls.slice(0, 200),
  };
}
