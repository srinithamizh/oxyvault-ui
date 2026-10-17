import { seedUsers, type MockUser } from "@/data/mockUsers";
import type { UserSummary } from "@/types/user";

/**
 * In-memory auth service backed by dummy data.
 * Replace the bodies of these functions with API calls once the backend is ready;
 * the signatures are what the UI depends on.
 */

export interface AuthUser extends UserSummary {
  id: string;
  email: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
}

/** Machine-readable reason for a failed auth call; the UI maps it to a translated message. */
export type AuthErrorCode = "invalidCredentials" | "emailTaken";

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

const DEFAULT_ROLE = "Member";

let users: MockUser[] = seedUsers.map((user) => ({ ...user }));

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const toAuthUser = ({ id, name, email, role }: MockUser): AuthUser => ({ id, name, email, role });

export async function login({ email, password }: LoginInput): Promise<AuthUser> {
  const user = users.find((candidate) => candidate.email === normalizeEmail(email));
  if (!user || user.password !== password) {
    throw new AuthError("invalidCredentials", "Invalid email or password.");
  }
  return toAuthUser(user);
}

export async function register({ name, email, password }: RegisterInput): Promise<AuthUser> {
  const normalized = normalizeEmail(email);
  if (users.some((candidate) => candidate.email === normalized)) {
    throw new AuthError("emailTaken", "An account with this email already exists.");
  }
  const user: MockUser = {
    id: `u-${users.length + 1}`,
    name: name.trim(),
    email: normalized,
    password,
    role: DEFAULT_ROLE,
  };
  users = [...users, user];
  return toAuthUser(user);
}

/** Test helper: restores the seed data. */
export function resetAuthStore() {
  users = seedUsers.map((user) => ({ ...user }));
}
