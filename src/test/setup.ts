import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";
import "@/i18n/i18n";
import { installMatchMedia } from "./matchMedia";

beforeEach(() => {
  installMatchMedia();
});

afterEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
  delete document.documentElement.dataset.accent;
});
