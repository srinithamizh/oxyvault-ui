import { useTranslation } from "react-i18next";
import { FiBell, FiMoon, FiSun } from "react-icons/fi";
import IconButton from "@/components/IconButton/IconButton";
import Logo from "@/components/Logo/Logo";
import ProfileMenu from "@/layout/ProfileMenu/ProfileMenu";
import { useTheme } from "@/hooks/useTheme/useTheme";
import type { UserSummary } from "@/types/user";

export default function Header({ user }: { user: UserSummary }) {
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 flex h-[76px] items-center justify-end border-b border-border bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-8 backdrop-blur-[14px] max-[800px]:h-16 max-[800px]:justify-between max-[800px]:px-4">
      <div className="hidden max-[800px]:block">
        <Logo />
      </div>

      <div className="flex items-center gap-[7px]">
        <IconButton icon={isDark ? FiSun : FiMoon} label={t("header.toggleTheme")} onClick={toggleTheme} />
        <IconButton icon={FiBell} label={t("header.notifications")}>
          <i className="absolute right-[7px] top-[7px] size-[7px] rounded-full border-2 border-surface bg-danger" />
        </IconButton>
        <ProfileMenu user={user} />
      </div>
    </header>
  );
}
