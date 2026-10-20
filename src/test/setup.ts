import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import "@/i18n/i18n";
import { clearAccessToken } from "@/services/tokenStore/tokenStore";
import { resetMockUsers } from "./mockAuthService";
import { installMatchMedia } from "./matchMedia";

beforeEach(() => {
  installMatchMedia();
  resetMockUsers();
});

afterEach(() => {
  clearAccessToken();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
  delete document.documentElement.dataset.accent;
});
