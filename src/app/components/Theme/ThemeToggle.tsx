import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Toggle } from "@/app/components/ui/Toggle";
import { DEFAULT_ICON_SIZE } from "@/app/utils/constants";

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);

    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
          <Sun size={DEFAULT_ICON_SIZE} className="text-muted-foreground" />
          <Toggle on={isDark} onChange={setIsDark} />
          <Moon size={DEFAULT_ICON_SIZE} className="text-muted-foreground" />
        </div>
  );
}