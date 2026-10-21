import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext, type AuthContextValue } from "@/hooks/useAuth/useAuth";
import { setUnauthorizedHandler } from "@/services/apiClient/apiClient";
import {
  loadCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
} from "@/services/authService/authService";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/services/tokenStore/tokenStore";

export interface AuthProviderProps {
  children: ReactNode;
  /** Overrides the restored session (used by tests). The bearer token is not set. */
  initialUser?: AuthUser | null;
}

export default function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser ?? null);
  const [isInitializing, setIsInitializing] = useState(initialUser === undefined && Boolean(getAccessToken()));

  const clearSession = useCallback(() => {
    clearAccessToken();
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  // The backend rejected our token (expired or revoked): drop the session so the route guard shows /login.
  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  useEffect(() => {
    if (initialUser !== undefined || !getAccessToken()) return;

    let active = true;
    loadCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch((error: unknown) => {
        if (!active) return;
        clearSession();
        console.error(
          "Could not restore the saved session.",
          error instanceof Error ? error.message : "Unexpected error",
        );
      })
      .finally(() => {
        if (active) setIsInitializing(false);
      });

    return () => {
      active = false;
    };
  }, [clearSession, initialUser]);

  const login = useCallback(async (input: LoginInput) => {
    const session = await loginRequest(input);
    setAccessToken(session.accessToken);
    setUser(session.user);
    return session.user;
  }, []);

  const register = useCallback((input: RegisterInput) => registerRequest(input), []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isInitializing, login, register, logout }),
    [user, isInitializing, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
