import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";
import { settingsSections } from "@/app/settingsSections";
import Card from "@/components/Card/Card";

export default function SettingsNav() {
  const { t } = useTranslation();

  return (
    <Card className="p-2">
      <nav aria-label={t("settings.navLabel")} className="flex flex-col max-[800px]:flex-row max-[800px]:overflow-auto">
        {settingsSections.map(({ labelKey, path, icon: Icon, iconSize = 18 }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-2.5 whitespace-nowrap rounded-[9px] p-[11px] text-left text-[11px] ${
                isActive ? "bg-accent-soft font-bold text-accent-dark" : "text-muted hover:bg-surface-2 hover:text-fg"
              }`
            }
          >
            {/* stroke-current: some icon sets hard-code a black stroke, which disappears in dark mode. */}
            <Icon size={iconSize} aria-hidden="true" className="shrink-0 [&_*]:stroke-current" />
            {t(labelKey)}
          </NavLink>
        ))}
      </nav>
    </Card>
  );
}
