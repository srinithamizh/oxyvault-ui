import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import PageHeader from "@/components/PageHeader/PageHeader";
import SettingsNav from "@/features/settings/SettingsNav/SettingsNav";

/** Settings shell: a side navigation plus the selected sub-page rendered through <Outlet />. */
export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col gap-[22px]">
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />
      <div className="grid grid-cols-[210px_1fr] items-start gap-4 max-[800px]:grid-cols-1">
        <SettingsNav />
        <div className="flex min-w-0 flex-col gap-[15px]">
          <Outlet />
        </div>
      </div>
      <SiteFooter className="mt-auto pt-6" />
    </div>
  );
}
