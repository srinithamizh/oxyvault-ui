import type { TFunction } from "i18next";
import { isValidEmail } from "@/utils/isValidEmail/isValidEmail";

export const MIN_PASSWORD_LENGTH = 8;

/** Translated auth-form message for an email field, or `undefined` when valid. */
export function validateEmail(email: string, t: TFunction): string | undefined {
  if (!email.trim()) return t("auth.errors.emailRequired");
  if (!isValidEmail(email)) return t("auth.errors.emailInvalid");
  return undefined;
}

export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 20;
const USERNAME_PATTERN = /^[a-zA-Z0-9._]+$/;

/** Whether the username has an acceptable length and only allowed characters. */
export function isValidUsername(username: string): boolean {
  const value = username.trim();
  return value.length >= MIN_USERNAME_LENGTH && value.length <= MAX_USERNAME_LENGTH && USERNAME_PATTERN.test(value);
}

/** Translated auth-form message for a username field, or `undefined` when valid. */
export function validateUsername(username: string, t: TFunction): string | undefined {
  if (!username.trim()) return t("auth.errors.usernameRequired");
  if (!isValidUsername(username)) {
    return t("auth.errors.usernameInvalid", { min: MIN_USERNAME_LENGTH, max: MAX_USERNAME_LENGTH });
  }
  return undefined;
}
