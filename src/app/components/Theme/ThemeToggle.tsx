import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Toggle } from '@/app/components/ui/Toggle';
import { DEFAULT_ICON_SIZE } from '@/app/utils/constants';

const THEME_STORAGE_KEY = 'theme';
const DARK_THEME = 'dark';
const LIGHT_THEME = 'light';

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem(THEME_STORAGE_KEY) === DARK_THEME;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? DARK_THEME : LIGHT_THEME);
  }, [isDark]);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Sun size={DEFAULT_ICON_SIZE} className="text-muted-foreground" />
      <Toggle on={isDark} onChange={setIsDark} />
      <Moon size={DEFAULT_ICON_SIZE} className="text-muted-foreground" />
    </div>
  );
};