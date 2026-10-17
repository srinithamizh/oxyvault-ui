import i18n from "i18next";
import enUS from "@/locales/en-US.json";
import { DEFAULT_LANGUAGE } from "./i18n";

function collectLeaves(node: unknown, path = ""): { path: string; value: string }[] {
  if (typeof node === "string") return [{ path, value: node }];
  return Object.entries(node as Record<string, unknown>).flatMap(([key, child]) =>
    collectLeaves(child, path ? `${path}.${key}` : key),
  );
}

describe("i18n", () => {
  it("defaults to en-US and sets the document language", () => {
    expect(i18n.language).toBe(DEFAULT_LANGUAGE);
    expect(document.documentElement.lang).toBe("en-US");
  });

  it("resolves keys from en-US.json", () => {
    expect(i18n.t("nav.dashboard")).toBe("Dashboard");
    expect(i18n.t("auth.login.title")).toBe("Welcome back");
  });

  it("interpolates values", () => {
    expect(i18n.t("auth.errors.passwordTooShort", { min: 8 })).toBe("Use at least 8 characters.");
  });

  it("has no empty strings in en-US.json", () => {
    const empty = collectLeaves(enUS).filter(({ value }) => value.trim() === "");
    expect(empty).toEqual([]);
  });
});
