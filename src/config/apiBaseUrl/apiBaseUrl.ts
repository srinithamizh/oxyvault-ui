/**
 * Validates the configured backend URL. Fails loudly so a bad deployment is noticed immediately
 * instead of sending requests (or credentials) to the wrong place.
 */
export function parseApiBaseUrl(raw: string | undefined, isProduction: boolean): string {
  if (!raw?.trim()) {
    throw new Error("VITE_API_BASE_URL is not set. Copy .env.example to .env.development and set the backend URL.");
  }

  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error(`VITE_API_BASE_URL is not a valid URL: "${raw}"`);
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("VITE_API_BASE_URL must start with http:// or https://");
  }
  if (isProduction && url.protocol !== "https:") {
    throw new Error("VITE_API_BASE_URL must use https:// in production builds.");
  }
  if (url.username || url.password) {
    throw new Error("VITE_API_BASE_URL must not contain credentials.");
  }

  return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
}

/** Backend base URL with no trailing slash, e.g. "https://api.example.com". */
export const API_BASE_URL = parseApiBaseUrl(import.meta.env.VITE_API_BASE_URL, import.meta.env.PROD);
