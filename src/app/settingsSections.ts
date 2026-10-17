import type { IconType } from "react-icons";
import { BsSun, BsCreditCard2Back, BsCash, BsCardList} from "react-icons/bs";
import type { TranslationKey } from "@/types/i18n";

export interface SettingsSection {
  labelKey: TranslationKey;
  /** Path relative to /settings. */
  path: string;
  icon: IconType;
  /** Pixel size of the icon; defaults to 18. Some icon sets draw smaller inside their box. */
  iconSize?: number;
}

/** Sub-pages of Settings, shown in its side navigation. */
export const settingsSections: SettingsSection[] = [
  { labelKey: "settings.nav.appearance", path: "appearance", icon: BsSun },
  { labelKey: "settings.nav.sources", path: "sources", icon: BsCreditCard2Back },
  { labelKey: "settings.nav.paymentMethods", path: "payment-methods", icon: BsCash },
  { labelKey: "settings.nav.transactionCategories", path: "transaction-categories", icon: BsCardList },
];

export const DEFAULT_SETTINGS_SECTION = settingsSections[0].path;
