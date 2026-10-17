import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_ACCENT, isAccentId, type AccentId } from "@/theme/accents/accents";
import {
  ACCENT_STORAGE_KEY,
  THEME_STORAGE_KEY,
  ThemeContext,
  type ThemeContextValue,
  type ThemeMode,
} from "@/hooks/useTheme/useTheme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode); the choice still applies for this session.
  }
}

function readStoredMode(): ThemeMode {
  const stored = readStorage(THEME_STORAGE_KEY);
  return stored === "dark" || stored === "system" ? stored : "light";
}

function readStoredAccent(): AccentId {
  const stored = readStorage(ACCENT_STORAGE_KEY);
  return isAccentId(stored) ? stored : DEFAULT_ACCENT;
}

function systemPrefersDark(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia(DARK_QUERY).matches;
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(readStoredMode);
  const [accent, setAccent] = useState<AccentId>(readStoredAccent);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  // Follow the OS setting while it changes (only matters in "system" mode, but cheap to keep current).
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(DARK_QUERY);
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const isDark = mode === "dark" || (mode === "system" && systemDark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    document.documentElement.dataset.accent = accent;
  }, [accent]);

  useEffect(() => writeStorage(THEME_STORAGE_KEY, mode), [mode]);
  useEffect(() => writeStorage(ACCENT_STORAGE_KEY, accent), [accent]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      isDark,
      setMode,
      toggleTheme: () => setMode(isDark ? "light" : "dark"),
      accent,
      setAccent,
    }),
    [mode, isDark, accent],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
