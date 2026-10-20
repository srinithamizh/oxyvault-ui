import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth/useAuth";
import type { UserRole } from "@/types/user";

export interface RequireRoleProps {
  roles: readonly UserRole[];
  /** Where users without a matching role are sent. */
  redirectTo?: string;
}

/** Route wrapper: renders the nested routes only for users with one of the given roles. */
export default function RequireRole({ roles, redirectTo = "/dashboard" }: RequireRoleProps) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <Navigate to={redirectTo} replace />;
  return <Outlet />;
}
