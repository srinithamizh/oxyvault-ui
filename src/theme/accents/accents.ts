import type { TranslationKey } from "@/types/i18n";

/**
 * The selectable accent colours. `swatch` is the colour shown in the picker and must equal the
 * `--accent` value for that id in src/styles/tokens.css.
 */
export const ACCENTS = [
  { id: "green", labelKey: "settings.appearance.accents.green", swatch: "#10b981" },
  { id: "blue", labelKey: "settings.appearance.accents.blue", swatch: "#3b82f6" },
  { id: "violet", labelKey: "settings.appearance.accents.violet", swatch: "#8b5cf6" },
  { id: "orange", labelKey: "settings.appearance.accents.orange", swatch: "#f97316" },
  { id: "rose", labelKey: "settings.appearance.accents.rose", swatch: "#db2777" },
] as const satisfies readonly { id: string; labelKey: TranslationKey; swatch: string }[];

export type AccentId = (typeof ACCENTS)[number]["id"];

export const DEFAULT_ACCENT: AccentId = "green";

export function isAccentId(value: unknown): value is AccentId {
  return ACCENTS.some((accent) => accent.id === value);
}
