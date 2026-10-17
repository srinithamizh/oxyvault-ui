import type { IconType } from "react-icons";
import { BsBank2, BsCreditCard2Back, BsCash, BsReceiptCutoff } from "react-icons/bs";
import type { TranslationKey } from "@/types/i18n";
import type { SourceType } from "@/types/source";

export interface SourceTypeOption {
  type: SourceType;
  labelKey: TranslationKey;
  icon: IconType;
}

/** The kinds of financial source a user can add, in the order they are offered. */
export const SOURCE_TYPES: SourceTypeOption[] = [
  { type: "bank", labelKey: "sources.types.bank", icon: BsBank2 },
  { type: "card", labelKey: "sources.types.card", icon: BsCreditCard2Back },
  { type: "cash", labelKey: "sources.types.cash", icon: BsCash },
  { type: "loan", labelKey: "sources.types.loan", icon: BsReceiptCutoff },
];

export function getSourceTypeOption(type: SourceType): SourceTypeOption {
  return SOURCE_TYPES.find((option) => option.type === type)!;
}
