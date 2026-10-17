import { getPasswordStrength } from "./passwordStrength";

describe("getPasswordStrength", () => {
  it.each([
    ["", 0, null],
    ["abc", 1, "auth.strength.weak"],
    ["abcdefgh", 1, "auth.strength.weak"],
    ["abcdEFGH", 2, "auth.strength.fair"],
    ["abcdEFG1", 3, "auth.strength.good"],
    ["abcdEF1!", 4, "auth.strength.strong"],
  ])("scores %j as %i", (password, score, labelKey) => {
    expect(getPasswordStrength(password)).toEqual({ score, labelKey });
  });
});
