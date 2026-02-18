import { isValid } from "@tma.js/init-data-node";

/**
 * Проверка подписи initData от Telegram WebApp.
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramWebAppInitData(initData: string, botToken: string): boolean {
  if (!initData?.trim() || !botToken) return false;
  return isValid(initData, botToken, { expiresIn: 0 });
}
