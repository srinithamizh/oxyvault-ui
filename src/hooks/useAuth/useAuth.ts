import { createContext, useContext } from "react";
import type { AuthUser, LoginInput, RegisterInput, RegisterResponse } from "@/services/authService/authService";

export interface AuthContextValue {
  /** The signed-in user, or `null` when signed out. */
  user: AuthUser | null;
  /** True while a saved session is being validated. */
  isInitializing: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  /** Creates the account. It does not sign the user in; they log in afterwards. */
  register: (input: RegisterInput) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
