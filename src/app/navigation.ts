import type { IconType } from "react-icons";
import { FiBarChart2, FiCalendar, FiGrid, FiRepeat, FiShield, FiTrendingUp } from "react-icons/fi";
import type { TranslationKey } from "@/types/i18n";
import { UserRole } from "@/types/user";

export interface NavItem {
  labelKey: TranslationKey;
  path: string;
  icon: IconType;
  /** Shorter label used by the bottom mobile navigation. */
  mobileLabelKey?: TranslationKey;
  /** Small badge shown next to the label in the sidebar. */
  badgeKey?: TranslationKey;
  /** Roles allowed to see and open this page. Omit for every signed-in user. */
  roles?: readonly UserRole[];
}

export const navItems: NavItem[] = [
  { labelKey: "nav.dashboard", path: "/dashboard", icon: FiGrid },
  { labelKey: "nav.reports", path: "/reports", icon: FiBarChart2 },
  { labelKey: "nav.scheduled", path: "/scheduled", icon: FiCalendar },
  { labelKey: "nav.creditsDebits", path: "/credits-debits", icon: FiRepeat, mobileLabelKey: "nav.lending" },
  { labelKey: "nav.investments", path: "/investments", icon: FiTrendingUp },
  { labelKey: "nav.adminPanel", path: "/admin", icon: FiShield, badgeKey: "nav.adminBadge", roles: [UserRole.Admin] },
];

/** Profile and Settings are reached from the profile menu, so they are routes but not sidebar / mobile-bar items. */
export const PROFILE_PATH = "/profile";
export const SETTINGS_PATH = "/settings";

export type PageRoute = Pick<NavItem, "labelKey" | "path" | "roles">;

const additionalPageRoutes: PageRoute[] = [{ labelKey: "nav.profile", path: PROFILE_PATH },
  { labelKey: "nav.settings", path: SETTINGS_PATH },]
/** Every page the app routes to: the navigation items plus Profile and Settings. */
export const pageRoutes: PageRoute[] = [
  ...navItems,
  ...additionalPageRoutes
];

/** Slots in the bottom mobile bar. When there are more destinations, the last slot becomes "More". */
export const MOBILE_NAV_SLOTS = 5;

/** The navigation items the given role may use. */
export function navItemsForRole(role: UserRole | undefined): NavItem[] {
  return navItems.filter((item) => !item.roles || (role !== undefined && item.roles.includes(role)));
}
