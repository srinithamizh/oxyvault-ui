import { createContext, useContext } from "react";
import type { AuthUser, LoginInput, RegisterInput } from "@/services/authService/authService";

export interface AuthContextValue {
  /** The signed-in user, or `null` when signed out. */
  user: AuthUser | null;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => void;
}

export const SESSION_STORAGE_KEY = "oxyvault-session";

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
