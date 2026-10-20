import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiChevronDown, FiLogOut, FiSettings, FiUser } from "react-icons/fi";
import { Link } from "react-router";
import { PROFILE_PATH, SETTINGS_PATH } from "@/app/navigation";
import Avatar from "@/components/Avatar/Avatar";
import LogoutDialog from "@/features/auth/LogoutDialog/LogoutDialog";
import { useAuth } from "@/hooks/useAuth/useAuth";
import { useDismiss } from "@/hooks/useDismiss/useDismiss";
import type { UserSummary } from "@/types/user";

const itemClass = "flex w-full items-center gap-2.5 rounded-lg bg-transparent p-2.5 text-left hover:bg-surface-2";

export default function ProfileMenu({ user }: { user: UserSummary }) {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useDismiss(containerRef, open, () => setOpen(false));

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("profileMenu.trigger")}
        onClick={() => setOpen((value) => !value)}
        className="ml-1.5 flex items-center gap-[9px] border-l border-border bg-transparent pl-3.5 text-fg max-[800px]:pl-2"
      >
        <Avatar name={user.name} />
        <span className="flex flex-col text-left max-[800px]:hidden">
          <strong className="text-sm">{user.name}</strong>
          <small className="text-[10px] text-muted">{t(`roles.${user.role}`)}</small>
        </span>
        <FiChevronDown size={14} aria-hidden="true" className="max-[800px]:hidden" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t("profileMenu.menu")}
          className="absolute right-0 top-[50px] w-[190px] rounded-xl border border-border bg-surface p-[7px] shadow-card"
        >
          <Link role="menuitem" to={PROFILE_PATH} className={`${itemClass} text-fg`} onClick={() => setOpen(false)}>
            <FiUser size={18} aria-hidden="true" />
            {t("profileMenu.profile")}
          </Link>
          <Link role="menuitem" to={SETTINGS_PATH} className={`${itemClass} text-fg`} onClick={() => setOpen(false)}>
            <FiSettings size={18} aria-hidden="true" />
            {t("profileMenu.settings")}
          </Link>
          <div role="separator" className="mx-[5px] my-[5px] h-px bg-border" />
          <button
            type="button"
            role="menuitem"
            className={`${itemClass} text-danger`}
            onClick={() => {
              setOpen(false);
              setConfirmingLogout(true);
            }}
          >
            <FiLogOut size={18} aria-hidden="true" />
            {t("profileMenu.logout")}
          </button>
        </div>
      )}

      {confirmingLogout && (
        <LogoutDialog
          onCancel={() => setConfirmingLogout(false)}
          onConfirm={() => {
            setConfirmingLogout(false);
            logout();
          }}
        />
      )}
    </div>
  );
}
