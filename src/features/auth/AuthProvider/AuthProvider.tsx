import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { queryKeys } from "@/data/queryClient";

export interface AuthProviderProps {
  children: ReactNode;
  /** Overrides the restored session (used by tests). The bearer token is not set. */
  initialUser?: AuthUser | null;
}

export default function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const currentUserQuery = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: async () => {
      try {
        return await loadCurrentUser();
      } catch (error) {
        clearAccessToken();
        console.error(
          "Could not restore the saved session.",
          error instanceof Error ? error.message : "Unexpected error",
        );
        throw error;
      }
    },
    enabled: initialUser === undefined && Boolean(getAccessToken()),
    staleTime: Infinity,
    initialData: initialUser ?? undefined,
    meta: { requiresAuth: true },
  });

  const clearSession = useCallback(() => {
    clearAccessToken();
    queryClient.removeQueries({
      predicate: (query) => query.meta?.requiresAuth === true && query.queryKey[0] !== "auth",
    });
    queryClient.setQueryData<AuthUser | null>(queryKeys.currentUser, null);
  }, [queryClient]);

  const loginMutation = useMutation({ mutationFn: loginRequest });
  const registerMutation = useMutation({ mutationFn: registerRequest });
  const logoutMutation = useMutation({ mutationFn: logoutRequest });

  const login = useCallback(async (input: LoginInput) => {
    const session = await loginMutation.mutateAsync(input);
    queryClient.removeQueries({
      predicate: (query) => query.meta?.requiresAuth === true && query.queryKey[0] !== "auth",
    });
    setAccessToken(session.accessToken);
    queryClient.setQueryData<AuthUser | null>(queryKeys.currentUser, session.user);
    return session.user;
  }, [loginMutation, queryClient]);

  const register = useCallback((input: RegisterInput) => registerMutation.mutateAsync(input), [registerMutation]);

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      clearSession();
    }
  }, [clearSession, logoutMutation]);

  // The backend rejected our token (expired or revoked): drop the session so the route guard shows /login.
  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const isInitializing = initialUser === undefined && Boolean(getAccessToken()) && currentUserQuery.isPending;
  const user: AuthUser | null = currentUserQuery.data ?? null;

  const value = useMemo<AuthContextValue>(
    () => ({ user, isInitializing, login, register, logout }),
    [user, isInitializing, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
