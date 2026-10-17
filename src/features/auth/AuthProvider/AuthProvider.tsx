import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  login as loginRequest,
  register as registerRequest,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
} from "@/services/authService/authService";
import { AuthContext, SESSION_STORAGE_KEY, type AuthContextValue } from "@/hooks/useAuth/useAuth";

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return ["id", "name", "email", "role"].every((key) => typeof candidate[key] === "string");
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isAuthUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export interface AuthProviderProps {
  children: ReactNode;
  /** Overrides the stored session (used by tests). `null` forces a signed-out start. */
  initialUser?: AuthUser | null;
}

export default function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => (initialUser !== undefined ? initialUser : readStoredUser()));

  useEffect(() => {
    try {
      if (user) window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      else window.localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Storage can be unavailable (private mode); the session still works until reload.
    }
  }, [user]);

  const login = useCallback(async (input: LoginInput) => {
    const signedIn = await loginRequest(input);
    setUser(signedIn);
    return signedIn;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const created = await registerRequest(input);
    setUser(created);
    return created;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo<AuthContextValue>(() => ({ user, login, register, logout }), [user, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
