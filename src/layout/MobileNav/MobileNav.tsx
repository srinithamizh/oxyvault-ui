import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiMoreHorizontal } from "react-icons/fi";
import { NavLink, useLocation } from "react-router";
import { MOBILE_NAV_SLOTS, navItemsForRole, type NavItem } from "@/app/navigation";
import Badge from "@/components/Badge/Badge";
import { useAuth } from "@/hooks/useAuth/useAuth";
import { useDismiss } from "@/hooks/useDismiss/useDismiss";

export interface MobileNavProps {
  items?: NavItem[];
  /** Total slots in the bar. If there are more items than slots, the last slot is "More". */
  slots?: number;
}

const slotClass = "flex flex-col items-center gap-[3px] px-2 py-[3px] text-[8px]";

export default function MobileNav({ items: itemsProp, slots = MOBILE_NAV_SLOTS }: MobileNavProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const items = itemsProp ?? navItemsForRole(user?.role);
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const hasOverflow = items.length > slots;
  const visibleItems = hasOverflow ? items.slice(0, slots - 1) : items;
  const overflowItems = hasOverflow ? items.slice(slots - 1) : [];
  const overflowActive = overflowItems.some(({ path }) => pathname === path || pathname.startsWith(`${path}/`));

  useDismiss(moreRef, moreOpen, () => setMoreOpen(false));

  return (
    <nav
      aria-label={t("nav.mobile")}
      className="fixed inset-x-0 bottom-0 z-30 hidden h-[65px] justify-around border-t border-border bg-surface px-1 py-1.5 max-[800px]:flex"
    >
      {visibleItems.map(({ labelKey, mobileLabelKey, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) => `${slotClass} ${isActive ? "text-accent-dark" : "text-muted"}`}
        >
          <Icon size={18} aria-hidden="true" />
          <span>{t(mobileLabelKey ?? labelKey)}</span>
        </NavLink>
      ))}

      {hasOverflow && (
        <div ref={moreRef} className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={moreOpen}
            data-active={overflowActive}
            onClick={() => setMoreOpen((open) => !open)}
            className={`${slotClass} bg-transparent ${overflowActive || moreOpen ? "text-accent-dark" : "text-muted"}`}
          >
            <FiMoreHorizontal size={18} aria-hidden="true" />
            <span>{t("nav.more")}</span>
          </button>

          {moreOpen && (
            <div
              role="menu"
              aria-label={t("nav.moreMenu")}
              className="absolute bottom-[calc(100%+14px)] right-0 w-[210px] rounded-xl border border-border bg-surface p-[7px] shadow-card"
            >
              {overflowItems.map(({ labelKey, path, icon: Icon, badgeKey }) => (
                <NavLink
                  key={path}
                  to={path}
                  role="menuitem"
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg p-2.5 text-[13px] ${
                      isActive ? "bg-accent-soft font-bold text-accent-dark" : "text-fg hover:bg-surface-2"
                    }`
                  }
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{t(labelKey)}</span>
                  {badgeKey && (
                    <Badge tone="accent" className="ml-auto px-[5px] py-[3px] text-[9px]">
                      {t(badgeKey)}
                    </Badge>
                  )}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
