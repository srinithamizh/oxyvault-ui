import { vi } from "vitest";
import { API_BASE_URL } from "@/config/apiBaseUrl/apiBaseUrl";
import { seedUsers, type MockUser } from "@/test/mockUsers";

export interface RecordedRequest {
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: unknown;
  init: RequestInit;
}

type Override = { status: number; body?: unknown } | "offline";

/**
 * Only for tests of the API layer itself (apiClient, authService): install it with `fakeBackend.install()`.
 * Component and page tests mock the service with `vi.mock` instead (see mockAuthService.ts).
 *
 * An in-memory stand-in for the backend's /auth endpoints. Tests install it over `fetch`, so the
 * real apiClient and authService run unchanged against it.
 */
class FakeBackend {
  users: MockUser[] = [];
  requests: RecordedRequest[] = [];
  private override: Override | null = null;

  reset() {
    this.users = seedUsers.map((user) => ({ ...user }));
    this.requests = [];
    this.override = null;
  }

  install() {
    this.reset();
    vi.stubGlobal("fetch", (input: RequestInfo | URL, init: RequestInit = {}) => this.handle(input, init));
  }

  /** Answer the next request with this status instead of the normal behaviour. */
  failNext(status: number, body?: unknown) {
    this.override = { status, body };
  }

  /** Make the next request fail like a lost connection. */
  goOfflineOnce() {
    this.override = "offline";
  }

  /** Requests to a path, in order. */
  callsTo(path: string) {
    return this.requests.filter((request) => request.path === path);
  }

  private respond(status: number, body?: unknown) {
    return new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  private async handle(input: RequestInfo | URL, init: RequestInit): Promise<Response> {
    const url = new URL(input instanceof Request ? input.url : input.toString());
    const path = url.pathname.slice(new URL(API_BASE_URL).pathname.replace(/\/$/, "").length);
    const headers = Object.fromEntries(Object.entries((init.headers ?? {}) as Record<string, string>));
    const body = typeof init.body === "string" ? (JSON.parse(init.body) as unknown) : undefined;
    this.requests.push({
      method: init.method ?? "GET",
      path,
      query: Object.fromEntries(url.searchParams),
      headers,
      body,
      init,
    });

    const override = this.override;
    this.override = null;
    if (override === "offline") throw new TypeError("Failed to fetch");
    if (override) return this.respond(override.status, override.body);

    const input_ = (body ?? {}) as Record<string, string>;
    if (path === "/auth/login" && init.method === "POST") {
      const key = (input_.identifier ?? "").trim().toLowerCase();
      const user = this.users.find((u) => u.email === key || u.username.toLowerCase() === key);
      if (!user || user.password !== input_.password) return this.respond(401, { message: "Invalid credentials" });
      return this.respond(200, { accessToken: `token-${user.id}` });
    }

    if (path === "/profile" && (init.method ?? "GET") === "GET") {
      const token = headers.Authorization?.replace(/^Bearer\s+/i, "");
      const user = this.users.find((candidate) => `token-${candidate.id}` === token);
      if (!user) return this.respond(401, { message: "Invalid token" });
      return this.respond(200, {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        username: user.username,
        email: user.email,
        role: user.role.toUpperCase(),
      });
    }

    if (path === "/auth/register" && init.method === "POST") {
      const email = (input_.email ?? "").trim().toLowerCase();
      const username = (input_.username ?? "").trim().toLowerCase();
      if (this.users.some((u) => u.email === email)) return this.respond(409, { code: "EMAIL_TAKEN" });
      if (this.users.some((u) => u.username.toLowerCase() === username)) {
        return this.respond(409, { code: "USERNAME_TAKEN" });
      }
      const user: MockUser = {
        id: `u-${this.users.length + 1}`,
        firstName: input_.firstName,
        lastName: input_.lastName,
        username: input_.username,
        email,
        password: input_.password,
        role: "user",
      };
      this.users.push(user);
      return this.respond(201, "Account created");
    }

    if (path === "/auth/validate-username" && (init.method ?? "GET") === "GET") {
      const name = (url.searchParams.get("username") ?? "").toLowerCase();
      return this.respond(200, !this.users.some((u) => u.username.toLowerCase() === name));
    }

    return this.respond(404, { message: `No fake route for ${init.method ?? "GET"} ${path}` });
  }
}

export const fakeBackend = new FakeBackend();
