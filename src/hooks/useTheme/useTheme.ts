import { createContext, useContext } from "react";
import type { AccentId } from "@/theme/accents/accents";

/** What the user chose. "system" follows the operating system's light/dark setting. */
export type ThemeMode = "light" | "dark" | "system";

export interface ThemeContextValue {
  mode: ThemeMode;
  /** True when the dark palette is currently applied (an explicit "dark", or "system" on a dark OS). */
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  /** Flips between light and dark based on what is currently shown (used by the header button). */
  toggleTheme: () => void;
  accent: AccentId;
  setAccent: (accent: AccentId) => void;
}

export const THEME_STORAGE_KEY = "oxyvault-theme";
export const ACCENT_STORAGE_KEY = "oxyvault-accent";

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return context;
}
