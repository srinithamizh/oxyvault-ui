import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { FiCheck, FiChevronDown, FiChevronLeft, FiChevronRight, FiEdit2, FiInfo, FiRefreshCw } from "react-icons/fi";
import Button from "@/components/Button/Button";
import Card from "@/components/Card/Card";
import IconButton from "@/components/IconButton/IconButton";
import { useAuth } from "@/hooks/useAuth/useAuth";
import { getUsers, updateUserRole, type ManagedUser, type UserPage } from "@/services/usersService/usersService";
import { UserRole } from "@/types/user";

const PAGE_SIZE = 20;

interface RoleDropdownProps {
  name: string;
  role: UserRole;
  disabled: boolean;
  onChange: (role: UserRole) => void;
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  openAbove: boolean;
}

function RoleDropdown({ name, role, disabled, onChange }: RoleDropdownProps) {
  const { t } = useTranslation();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<DropdownPosition | null>(null);

  const roles = [UserRole.Admin, UserRole.User];

  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const estimatedMenuHeight = 88;
    const openAbove = rect.bottom + estimatedMenuHeight > window.innerHeight && rect.top > estimatedMenuHeight;
    setPosition({
      top: openAbove ? rect.top - 4 : rect.bottom + 4,
      left: Math.min(rect.left, window.innerWidth - Math.max(rect.width, 128) - 8),
      width: Math.max(rect.width, 128),
      openAbove,
    });
  };

  useEffect(() => {
    if (!open) return;

    updatePosition();
    const dismiss = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  return (
    <div className="inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-label={t("adminUsers.changeRoleFor", { name })}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => {
          if (open) {
            setOpen(false);
            return;
          }
          updatePosition();
          setOpen(true);
        }}
        className="inline-flex min-w-32 items-center justify-between gap-3 rounded-lg border border-border bg-surface px-2.5 py-2 text-left text-sm text-fg hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {t(`roles.${role}`)}
        <FiChevronDown
          aria-hidden="true"
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          size={16}
        />
      </button>
      {open && position && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-label={t("adminUsers.changeRoleFor", { name })}
          className={`fixed z-[200] overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-card ${
            position.openAbove ? "-translate-y-full" : ""
          }`}
          style={{
            top: position.top,
            left: Math.max(position.left, 8),
            minWidth: position.width,
          }}
        >
          {roles.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={role === option}
              onClick={() => {
                setOpen(false);
                if (role !== option) onChange(option);
              }}
              className={`flex w-full items-center justify-between gap-4 whitespace-nowrap rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                role === option ? "bg-accent-soft font-semibold text-accent-dark" : "text-fg hover:bg-surface-2"
              }`}
            >
              {t(`roles.${option}`)}
              {role === option && <FiCheck aria-hidden="true" size={15} />}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [page, setPage] = useState<UserPage | null>(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getUsers(pageNumber, PAGE_SIZE)
      .then((result) => {
        if (controller.signal.aborted) return;
        setUsers(result.content);
        setPage(result);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(true);
        console.error("Could not load users.", cause instanceof Error ? cause.message : "Unexpected error");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [pageNumber, retryCount]);

  const changeRole = async (managedUser: ManagedUser, role: UserRole) => {
    if (managedUser.id === currentUser?.id || managedUser.role === role) return;
    setUpdatingUserId(managedUser.id);
    setUpdateError(null);
    try {
      await updateUserRole(managedUser.id, role);
      setUsers((current) => current.map((item) => (item.id === managedUser.id ? { ...item, role } : item)));
    } catch (cause) {
      setUpdateError(t("adminUsers.roleUpdateError"));
      console.error("Could not update user role.", cause instanceof Error ? cause.message : "Unexpected error");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const goToPage = (nextPage: number) => {
    setError(false);
    setLoading(true);
    setPageNumber(nextPage);
  };

  const startIndex = page ? page.number * page.size : 0;

  return (
    <Card className="overflow-hidden p-5 hover:translate-y-0">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[17px]">{t("adminUsers.title")}</h2>
          <p className="mt-[5px] text-[10px] text-muted">{t("adminUsers.subtitle")}</p>
        </div>
        {!error && (
          <Button
            variant="secondary"
            icon={editing ? FiCheck : FiEdit2}
            aria-label={t(editing ? "transactionOptions.done" : "transactionOptions.edit")}
            aria-pressed={editing}
            onClick={() => setEditing((current) => !current)}
          >
            {t(editing ? "transactionOptions.done" : "transactionOptions.edit")}
          </Button>
        )}
      </div>
        {error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p role="alert" className="text-sm text-danger">{t("adminUsers.loadError")}</p>
            <Button
              variant="secondary"
              icon={FiRefreshCw}
              onClick={() => {
                setError(false);
                setLoading(true);
                setRetryCount((count) => count + 1);
              }}
            >
              {t("common.retry")}
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th scope="col" className="px-5 py-3">{t("adminUsers.name")}</th>
                    <th scope="col" className="px-5 py-3">{t("adminUsers.username")}</th>
                    <th scope="col" className="px-5 py-3">{t("adminUsers.email")}</th>
                    <th scope="col" className="px-5 py-3">{t("adminUsers.role")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-muted">{t("common.loading")}</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-muted">{t("adminUsers.empty")}</td></tr>
                  ) : users.map((managedUser) => {
                    const isCurrentUser = managedUser.id === currentUser?.id;
                    const isUpdating = updatingUserId === managedUser.id;
                    return (
                      <tr key={managedUser.id} className="hover:bg-surface-2/50">
                        <td className="px-5 py-3.5 font-semibold">
                          {managedUser.name}
                        </td>
                        <td className="px-5 py-3.5 text-muted">{managedUser.username}</td>
                        <td className="px-5 py-3.5 text-muted">{managedUser.email}</td>
                        <td className="px-5 py-3.5">
                          <label className="sr-only" htmlFor={`user-role-${managedUser.id}`}>
                            {t("adminUsers.changeRoleFor", { name: managedUser.name })}
                          </label>
                          <span className="inline-flex items-center gap-1 whitespace-nowrap">
                            {editing && !isCurrentUser ? (
                              <RoleDropdown
                                name={managedUser.name}
                                role={managedUser.role}
                                disabled={isUpdating}
                                onChange={(role) => void changeRole(managedUser, role)}
                              />
                            ) : (
                              <span>{t(`roles.${managedUser.role}`)}</span>
                            )}
                            {isCurrentUser && (
                              <IconButton
                                icon={FiInfo}
                                label={t("adminUsers.cannotEditOwnRole")}
                                title={t("adminUsers.cannotEditOwnRole")}
                                size={16}
                                className="inline-grid size-7 shrink-0 hover:bg-transparent"
                              />
                            )}
                          </span>
                          {isUpdating && <span className="ml-2 text-xs text-muted">{t("adminUsers.saving")}</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3">
              <p className="text-xs text-muted">
                {page && page.totalElements > 0
                  ? t("adminUsers.paginationSummary", {
                      from: startIndex + 1,
                      to: startIndex + users.length,
                      total: page.totalElements,
                    })
                  : t("adminUsers.paginationEmpty")}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  icon={FiChevronLeft}
                  disabled={loading || !page || page.first}
                  onClick={() => goToPage(Math.max(0, pageNumber - 1))}
                >
                  {t("adminUsers.previous")}
                </Button>
                <span className="min-w-20 text-center text-xs text-muted">
                  {page ? t("adminUsers.page", { current: page.number + 1, total: Math.max(page.totalPages, 1) }) : ""}
                </span>
                <Button
                  variant="secondary"
                  icon={FiChevronRight}
                  disabled={loading || !page || page.last}
                  onClick={() => goToPage(pageNumber + 1)}
                >
                  {t("adminUsers.next")}
                </Button>
              </div>
            </div>
            {updateError && <p role="alert" className="border-t border-border px-5 py-3 text-sm text-danger">{updateError}</p>}
          </>
        )}
    </Card>
  );
}
