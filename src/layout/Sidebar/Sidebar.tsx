import { useTranslation } from "react-i18next";
import { FiChevronLeft, FiChevronRight, FiShield } from "react-icons/fi";
import { NavLink } from "react-router";
import { navItems } from "@/app/navigation";
import Badge from "@/components/Badge/Badge";
import Logo from "@/components/Logo/Logo";

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const linkBase =
  "flex items-center gap-3 whitespace-nowrap rounded-[11px] px-3 py-[11px] text-left font-medium transition-colors";
const linkIdle = "text-muted hover:bg-surface-2 hover:text-fg";
const linkActive = "bg-accent-soft font-bold text-accent-dark";

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { t } = useTranslation();
  const ToggleIcon = collapsed ? FiChevronRight : FiChevronLeft;

  return (
    <aside
      data-collapsed={collapsed}
      className={`fixed inset-y-0 left-0 z-20 flex flex-col border-r border-border bg-surface px-4 pb-4 pt-[22px] transition-[width] duration-200 max-[800px]:hidden ${
        collapsed ? "w-[78px]" : "w-[250px]"
      }`}
    >
      <button
        type="button"
        aria-label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
        aria-expanded={!collapsed}
        onClick={onToggle}
        className="absolute -right-[13px] top-[31px] grid size-[25px] place-items-center rounded-full border border-border bg-surface text-muted"
      >
        <ToggleIcon size={14} aria-hidden="true" />
      </button>

      <div className="mb-[25px] flex h-11 items-center px-2">
        <Logo showName={!collapsed} />
      </div>

      <nav aria-label={t("nav.primary")} className="flex flex-col gap-[5px]">
        {navItems.map(({ labelKey, path, icon: Icon, badgeKey }) => {
          const label = t(labelKey);
          return (
            <NavLink
              key={path}
              to={path}
              aria-label={label}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `${linkBase} ${collapsed ? "justify-center" : ""} ${isActive ? linkActive : linkIdle}`
              }
            >
              <Icon size={18} aria-hidden="true" />
              {!collapsed && <span>{label}</span>}
              {!collapsed && badgeKey && (
                <Badge tone="accent" className="ml-auto px-[5px] py-[3px] text-[9px]">
                  {t(badgeKey)}
                </Badge>
              )}
            </NavLink>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="mt-auto flex flex-col gap-1.5 rounded-[14px] border border-border bg-surface-2 p-3.5 text-xs">
          <FiShield size={18} className="text-accent" aria-hidden="true" />
          <strong>{t("sidebar.vaultHealth")}</strong>
          <span className="text-muted">{t("sidebar.allSynced")}</span>
          <div
            role="progressbar"
            aria-label={t("sidebar.vaultHealth")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={92}
            className="mt-[7px] h-1 overflow-hidden rounded-md bg-border"
          >
            <i className="block h-full w-[92%] rounded-md bg-accent" />
          </div>
        </div>
      )}
    </aside>
  );
}
