import { vi } from "vitest";
import { ApiError, apiRequest, NetworkError, setUnauthorizedHandler } from "./apiClient";
import { clearAccessToken, setAccessToken } from "@/services/tokenStore/tokenStore";
import { fakeBackend } from "@/test/fakeBackend";

describe("apiRequest", () => {
  beforeEach(() => fakeBackend.install());

  afterEach(() => {
    setUnauthorizedHandler(null);
    clearAccessToken();
  });

  it("calls the configured backend with safe defaults", async () => {
    await apiRequest("/auth/validate-username", { query: { username: "a b" } });
    const [request] = fakeBackend.requests;
    expect(request.path).toBe("/auth/validate-username");
    expect(request.query).toEqual({ username: "a b" });
    expect(request.init).toMatchObject({
      credentials: "omit",
      cache: "no-store",
      referrerPolicy: "no-referrer",
      mode: "cors",
    });
    expect(request.headers.Accept).toBe("application/json");
  });

  it("attaches the bearer token only when asked and available", async () => {
    await apiRequest("/auth/validate-username", { query: { username: "x" } });
    expect(fakeBackend.requests[0].headers.Authorization).toBeUndefined();

    setAccessToken("secret-token");
    await apiRequest("/auth/validate-username", { query: { username: "x" } });
    expect(fakeBackend.requests[1].headers.Authorization).toBe("Bearer secret-token");

    await apiRequest("/auth/validate-username", { query: { username: "x" }, auth: false });
    expect(fakeBackend.requests[2].headers.Authorization).toBeUndefined();
  });

  it("sends JSON bodies with a content type", async () => {
    await apiRequest("/auth/login", { method: "POST", auth: false, body: { identifier: "a", password: "b" } }).catch(() => {});
    const [request] = fakeBackend.requests;
    expect(request.headers["Content-Type"]).toBe("application/json");
    expect(request.body).toEqual({ identifier: "a", password: "b" });
  });

  it("parses bare JSON values such as true", async () => {
    await expect(apiRequest("/auth/validate-username", { query: { username: "free" } })).resolves.toBe(true);
  });

  it("throws an ApiError carrying the status and body", async () => {
    fakeBackend.failNext(409, { code: "X" });
    const attempt = apiRequest("/anything");
    await expect(attempt).rejects.toBeInstanceOf(ApiError);
    await expect(attempt).rejects.toMatchObject({ status: 409, body: { code: "X" } });
  });

  it("can require an exact successful response status", async () => {
    await expect(
      apiRequest("/auth/validate-username", { query: { username: "free" }, expectedStatus: 200 }),
    ).resolves.toBe(true);
    await expect(
      apiRequest("/auth/validate-username", { query: { username: "free" }, expectedStatus: 201 }),
    ).rejects.toMatchObject({ name: "ApiError", status: 200 });
  });

  it("throws a NetworkError when the request never completes", async () => {
    fakeBackend.goOfflineOnce();
    await expect(apiRequest("/anything")).rejects.toBeInstanceOf(NetworkError);
  });

  it("signs the user out on 401 for an authenticated request", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    setAccessToken("expired");
    fakeBackend.failNext(401);
    await expect(apiRequest("/profile")).rejects.toBeInstanceOf(ApiError);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not trigger sign-out for a 401 without a token (e.g. a wrong password at login)", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    fakeBackend.failNext(401);
    await expect(apiRequest("/auth/login", { method: "POST", auth: false, body: {} })).rejects.toBeInstanceOf(ApiError);
    expect(handler).not.toHaveBeenCalled();
  });

  it("lets the caller cancel without reporting a network error", async () => {
    const controller = new AbortController();
    vi.stubGlobal("fetch", (_input: unknown, init: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
      });
    });
    const attempt = apiRequest("/slow", { signal: controller.signal });
    controller.abort();
    await expect(attempt).rejects.toMatchObject({ name: "AbortError" });
  });
});
