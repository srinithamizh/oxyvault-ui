import i18n from "i18next";
import { validateEmail, validateUsername } from "./validation";

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

describe("validateUsername", () => {
  it("asks for a username when empty or blank", () => {
    expect(validateUsername("", t)).toBe("Choose a username.");
    expect(validateUsername("  ", t)).toBe("Choose a username.");
  });

  it.each(["ab", "has space", "bad!", "x".repeat(21)])("rejects %j", (value) => {
    expect(validateUsername(value, t)).toBe("Use 3-20 letters, numbers, dots or underscores.");
  });

  it.each(["abc", "meera.nair", "Meera_N2", "x".repeat(20)])("accepts %j", (value) => {
    expect(validateUsername(value, t)).toBeUndefined();
  });
});
