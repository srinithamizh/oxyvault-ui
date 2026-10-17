import { useTranslation } from "react-i18next";
import PageHeader from "@/components/PageHeader/PageHeader";
import type { TranslationKey } from "@/types/i18n";

/** Temporary page body used until each page is implemented in its own phase. */
export default function PlaceholderPage({ titleKey }: { titleKey: TranslationKey }) {
  const { t } = useTranslation();
  return <PageHeader title={t(titleKey)} subtitle={t("placeholder.comingSoon")} />;
}
