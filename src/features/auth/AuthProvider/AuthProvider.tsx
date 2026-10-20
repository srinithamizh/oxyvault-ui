import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext, type AuthContextValue } from "@/hooks/useAuth/useAuth";
import { setUnauthorizedHandler } from "@/services/apiClient/apiClient";
import {
  login as loginRequest,
  register as registerRequest,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
} from "@/services/authService/authService";
import { clearAccessToken, setAccessToken } from "@/services/tokenStore/tokenStore";

export interface AuthProviderProps {
  children: ReactNode;
  /** Starts signed in as this user (used by tests). The bearer token is not set. */
  initialUser?: AuthUser | null;
}

/**
 * Holds the signed-in user in memory. Nothing is persisted: the token lives in `tokenStore` (memory)
 * and a reload signs the user out, so no credentials or personal data sit in browser storage.
 */
export default function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);

  const logout = useCallback(() => {
    clearAccessToken();
    setUser(null);
  }, []);

  // The backend rejected our token (expired or revoked): drop the session so the route guard shows /login.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(async (input: LoginInput) => {
    const session = await loginRequest(input);
    setAccessToken(session.accessToken);
    setUser(session.user);
    return session.user;
  }, []);

  const register = useCallback((input: RegisterInput) => registerRequest(input), []);

  const value = useMemo<AuthContextValue>(() => ({ user, login, register, logout }), [user, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
