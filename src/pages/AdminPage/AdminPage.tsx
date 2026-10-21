import { useTranslation } from "react-i18next";
import { NavLink, Outlet } from "react-router";
import { FiUsers } from "react-icons/fi";
import Card from "@/components/Card/Card";
import PageHeader from "@/components/PageHeader/PageHeader";

export default function AdminPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col gap-[22px]">
      <PageHeader title={t("nav.adminPanel")} subtitle={t("adminPanel.subtitle")} />
      <div className="grid grid-cols-[210px_1fr] items-start gap-4 max-[800px]:grid-cols-1">
        <Card className="p-2">
          <nav aria-label={t("adminPanel.navLabel")} className="flex flex-col max-[800px]:flex-row max-[800px]:overflow-auto">
            <NavLink
              to="users"
              className={({ isActive }) =>
                `flex items-center gap-2.5 whitespace-nowrap rounded-[9px] p-[11px] text-left text-[11px] ${
                  isActive ? "bg-accent-soft font-bold text-accent-dark" : "text-muted hover:bg-surface-2 hover:text-fg"
                }`
              }
            >
              <FiUsers size={18} aria-hidden="true" className="shrink-0" />
              {t("adminPanel.manageUsers")}
            </NavLink>
          </nav>
        </Card>
        <div className="flex min-w-0 flex-col gap-[15px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
