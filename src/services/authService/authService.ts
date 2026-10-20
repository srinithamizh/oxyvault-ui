import { ApiError, apiRequest, NetworkError } from "@/services/apiClient/apiClient";
import { clearAccessToken, setAccessToken } from "@/services/tokenStore/tokenStore";
import { isUserRole, type UserSummary } from "@/types/user";

/** Talks to the backend's /auth endpoints. */

export interface AuthUser extends UserSummary {
  id: string;
  email: string;
  username: string;
}

export interface LoginInput {
  /** The account's email address or its username. */
  identifier: string;
  password: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

/** What login hands back: the bearer token and the signed-in user. */
export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export interface LoginResponse {
  accessToken: string;
}

export type BackendUserRole = "ADMIN" | "USER";

export interface ProfileResponse {
  id: string;
  name: string;
  username: string;
  email: string;
  role: BackendUserRole;
}

export type RegisterResponse = string;

/** Machine-readable reason for a failed auth call; the UI maps it to a translated message. */
export type AuthErrorCode =
  | "invalidCredentials"
  | "emailTaken"
  | "usernameTaken"
  | "tooManyRequests"
  | "network"
  | "generic";

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

function parseAccessToken(data: LoginResponse): string {
  const accessToken = data.accessToken.trim();
  if (!accessToken) throw new AuthError("generic", "Unexpected response from the server.");
  return accessToken;
}

function parseUser(data: ProfileResponse): AuthUser {
  const role = data.role.toLowerCase();
  if (!isUserRole(role)) {
    throw new AuthError("generic", "Unexpected response from the server.");
  }

  return { id: data.id, name: data.name, username: data.username, email: data.email, role };
}

async function loadCurrentUser(): Promise<AuthUser> {
  const data = await apiRequest<ProfileResponse>("/profile", { auth: true });
  return parseUser(data);
}

function toAuthError(error: unknown, conflict?: (body: unknown) => AuthErrorCode): AuthError {
  if (error instanceof AuthError) return error;
  if (error instanceof NetworkError) return new AuthError("network", "Cannot reach the server.");
  if (error instanceof ApiError) {
    if (error.status === 429) return new AuthError("tooManyRequests", "Too many attempts.");
    if (error.status === 409 && conflict) return new AuthError(conflict(error.body), "Account already exists.");
    if (error.status === 400 || error.status === 401 || error.status === 403) {
      return new AuthError("invalidCredentials", "Invalid email/username or password.");
    }
  }
  return new AuthError("generic", "Something went wrong.");
}

/** A 409 from /auth/register: the body says whether the email or the username clashed. */
function registrationConflict(body: unknown): AuthErrorCode {
  return JSON.stringify(body ?? "").toLowerCase().includes("username") ? "usernameTaken" : "emailTaken";
}

export async function login({ identifier, password }: LoginInput): Promise<AuthSession> {
  try {
    const data = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      auth: false,
      body: { identifier: identifier.trim(), password },
    });

    const accessToken = parseAccessToken(data);
    setAccessToken(accessToken);
    const currentUser = await loadCurrentUser();
    return { accessToken, user: currentUser };
  } catch (error) {
    throw toAuthError(error);
  }
}

/**
 * Creates the account. The backend answers with a string and does NOT sign the user in (no token),
 * so the caller sends the user to the login page. Any failure throws an AuthError.
 */
export async function register(input: RegisterInput): Promise<RegisterResponse> {
  try {
    return await apiRequest<RegisterResponse>("/auth/register", {
      method: "POST",
      auth: false,
      body: {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        username: input.username.trim(),
        email: input.email.trim().toLowerCase(),
        password: input.password,
      },
    });
  } catch (error) {
    throw toAuthError(error, registrationConflict);
  }
}

/** Resolves `true` when nobody has taken the username yet. */
export async function checkUsernameAvailable(username: string, signal?: AbortSignal): Promise<boolean> {
  const data = await apiRequest<boolean>("/auth/validate-username", {
    auth: false,
    query: { username },
    signal,
  });
  if (typeof data !== "boolean") throw new Error("Unexpected response from /auth/validate-username");
  return data;
}

export async function logout(): Promise<void> {
  try {
    const data = await apiRequest<void>("/auth/logout", { method: "POST", auth: true });
    if (data !== undefined) throw new Error("Unexpected response from /auth/logout");
  } catch (error) {
    throw toAuthError(error);
  } finally {
    clearAccessToken();
  }
}
