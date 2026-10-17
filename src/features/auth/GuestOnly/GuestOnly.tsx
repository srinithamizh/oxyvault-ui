import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth/useAuth";

function getRedirectTarget(state: unknown): string {
  const from = (state as { from?: unknown } | null)?.from;
  return typeof from === "string" && from.startsWith("/") ? from : "/dashboard";
}

/**
 * Route wrapper for login/register: signed-in users are sent on to the page they originally
 * asked for (or the dashboard), which is also how a successful sign-in navigates away.
 */
export default function GuestOnly() {
  const { user } = useAuth();
  const location = useLocation();

  if (user) return <Navigate to={getRedirectTarget(location.state)} replace />;
  return <Outlet />;
}
