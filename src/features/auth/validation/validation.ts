import type { TFunction } from "i18next";
import { isValidEmail } from "@/utils/isValidEmail/isValidEmail";

export const MIN_PASSWORD_LENGTH = 8;

/** Translated auth-form message for an email field, or `undefined` when valid. */
export function validateEmail(email: string, t: TFunction): string | undefined {
  if (!email.trim()) return t("auth.errors.emailRequired");
  if (!isValidEmail(email)) return t("auth.errors.emailInvalid");
  return undefined;
}
