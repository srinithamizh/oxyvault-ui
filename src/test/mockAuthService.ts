import { vi } from "vitest";
import type * as AuthServiceModule from "@/services/authService/authService";
import { seedUsers, fullNameOf, type MockUser } from "@/test/mockUsers";

/**
 * Reusable `vi.mock` helper for the auth service. Use it at the top of a test file:
 *
 *   vi.mock("@/services/authService/authService", async () => {
 *     const { createMockedAuthService } = await import("@/test/mockAuthService");
 *     return createMockedAuthService();
 *   });
 *
 * `login`, `register` and `checkUsernameAvailable` then become `vi.fn`s backed by in-memory seed users;
 * override one per test with `vi.mocked(login).mockRejectedValueOnce(...)`. Mocks reset to these
 * defaults after every test (see setup.ts). Do the same for future services in their own helper.
 */
type AuthService = typeof AuthServiceModule;

let users: MockUser[] = seedUsers.map((user) => ({ ...user }));

/** Restores the seed accounts. Called before every test by setup.ts. */
export function resetMockUsers() {
  users = seedUsers.map((user) => ({ ...user }));
}

/** The real module with `login`, `register` and `checkUsernameAvailable` replaced by mocks (AuthError stays real). */
export async function createMockedAuthService(): Promise<AuthService> {
  const original = await vi.importActual<AuthService>("@/services/authService/authService");
  const { AuthError } = original;

  const toSession = (user: MockUser): AuthServiceModule.AuthSession => ({
    accessToken: `token-${user.id}`,
    user: {
      id: user.id,
      name: fullNameOf(user),
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });

  return {
    ...original,

    login: vi.fn(async ({ identifier, password }: AuthServiceModule.LoginInput) => {
      const key = identifier.trim().toLowerCase();
      const user = users.find((u) => u.email === key || u.username.toLowerCase() === key);
      if (!user || user.password !== password) {
        throw new AuthError("invalidCredentials", "Invalid email/username or password.");
      }
      return toSession(user);
    }),

    register: vi.fn(async (input: AuthServiceModule.RegisterInput) => {
      const email = input.email.trim().toLowerCase();
      const username = input.username.trim().toLowerCase();
      if (users.some((u) => u.email === email)) throw new AuthError("emailTaken", "Email already registered.");
      if (users.some((u) => u.username.toLowerCase() === username)) {
        throw new AuthError("usernameTaken", "Username already taken.");
      }
      const user: MockUser = {
        id: `u-${users.length + 1}`,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        username: input.username.trim(),
        email,
        password: input.password,
        role: "user",
      };
      users = [...users, user];
      return "Account created";
    }),

    checkUsernameAvailable: vi.fn(async (username: string) => {
      const key = username.trim().toLowerCase();
      return !users.some((u) => u.username.toLowerCase() === key);
    }),
  };
}
