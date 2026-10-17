import { useTranslation } from "react-i18next";
import Card from "@/components/Card/Card";
import AccentPicker from "@/features/settings/appearance/AccentPicker/AccentPicker";
import ThemeModePicker from "@/features/settings/appearance/ThemeModePicker/ThemeModePicker";

export default function AppearanceSettingsPage() {
  const { t } = useTranslation();

  return (
    <Card aria-labelledby="appearance-settings-title">
      <div className="mb-[18px] border-b border-border pb-[15px]">
        <h2 id="appearance-settings-title" className="text-sm">
          {t("settings.appearance.title")}
        </h2>
        <p className="mt-[5px] text-[13px] text-muted">{t("settings.appearance.subtitle")}</p>
      </div>

      <div className="flex flex-col gap-7">
        <ThemeModePicker />
        <AccentPicker />
      </div>
    </Card>
  );
}
