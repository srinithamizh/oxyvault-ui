import { API_BASE_URL } from "@/config/apiBaseUrl/apiBaseUrl";
import { getAccessToken } from "@/services/tokenStore/tokenStore";

/** The server answered with a non-2xx status. */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(`Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/** The request never got an answer (offline, DNS, CORS rejection, timeout). */
export class NetworkError extends Error {
  constructor(options?: ErrorOptions) {
    super("Network request failed", options);
    this.name = "NetworkError";
  }
}

export const REQUEST_TIMEOUT_MS = 15_000;

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string>;
  signal?: AbortSignal;
  /** Attach the bearer token. Set to `false` for public endpoints such as login. Defaults to `true`. */
  auth?: boolean;
}

let onUnauthorized: (() => void) | null = null;

/** Registers what happens when an authenticated request is rejected with 401 (e.g. sign the user out). */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Calls the backend. Hardened defaults: no cookies are sent or accepted (`credentials: "omit"`),
 * responses aren't cached, the referrer isn't leaked, requests time out, and the token is only
 * attached to requests that ask for it.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, signal, auth = true } = options;

  const url = new URL(`${API_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) url.searchParams.set(key, value);

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = auth ? getAccessToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), REQUEST_TIMEOUT_MS);
  const onCallerAbort = () => timeout.abort();
  signal?.addEventListener("abort", onCallerAbort);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "omit",
      cache: "no-store",
      referrerPolicy: "no-referrer",
      mode: "cors",
      signal: timeout.signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error; // the caller cancelled; let it handle the abort
    throw new NetworkError({ cause: error });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onCallerAbort);
  }

  const data = await readBody(response);
  if (!response.ok) {
    if (response.status === 401 && token) onUnauthorized?.();
    throw new ApiError(response.status, data);
  }
  return data as T;
}
