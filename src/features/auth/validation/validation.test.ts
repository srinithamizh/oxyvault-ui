import i18n from "i18next";
import { validateEmail } from "./validation";

const t = i18n.t.bind(i18n);

describe("validateEmail", () => {
  it("asks for an email when empty or blank", () => {
    expect(validateEmail("", t)).toBe("Enter your email address.");
    expect(validateEmail("   ", t)).toBe("Enter your email address.");
  });

  it("flags a malformed email", () => {
    expect(validateEmail("not-an-email", t)).toBe("Enter a valid email address.");
  });

  it("returns undefined for a valid email", () => {
    expect(validateEmail("a@b.co", t)).toBeUndefined();
  });
});
