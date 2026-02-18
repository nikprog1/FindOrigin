import crypto from "crypto";

/**
 * Проверка подписи initData от Telegram WebApp.
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramWebAppInitData(initData: string, botToken: string): boolean {
  if (!initData?.trim() || !botToken) return false;

  const pairs = initData.split("&").map((part) => {
    const i = part.indexOf("=");
    return i === -1 ? [part, ""] as const : [part.slice(0, i), part.slice(i + 1)] as const;
  });
  const hashEntry = pairs.find(([k]) => k === "hash");
  if (!hashEntry) return false;
  const hash = hashEntry[1];
  const rest = pairs.filter(([k]) => k !== "hash").sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = rest.map(([k, v]) => `${k}=${v}`).join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  return calculatedHash === hash;
}
