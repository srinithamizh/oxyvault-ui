import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth/useAuth";

/** Route wrapper: renders the nested routes only for a signed-in user, otherwise redirects to /login. */
export default function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  return <Outlet />;
}
