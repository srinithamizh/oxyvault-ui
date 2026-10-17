import type { TranslationKey } from "@/types/i18n";

export type StrengthScore = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrength {
  score: StrengthScore;
  /** Translation key for the label; `null` when there is no password yet. */
  labelKey: TranslationKey | null;
}

const LABEL_KEYS = [
  null,
  "auth.strength.weak",
  "auth.strength.fair",
  "auth.strength.good",
  "auth.strength.strong",
] as const satisfies readonly (TranslationKey | null)[];

/** One point each for: 8+ characters, upper and lower case, a number, a symbol. */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, labelKey: null };

  const checks = [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = Math.max(1, checks.filter(Boolean).length) as StrengthScore;
  return { score, labelKey: LABEL_KEYS[score] };
}
