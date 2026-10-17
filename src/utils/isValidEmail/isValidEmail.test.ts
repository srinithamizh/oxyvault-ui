import { isValidEmail } from "./isValidEmail";

describe("isValidEmail", () => {
  it.each(["a@b.co", "first.last@genesys.com", "user+tag@example.org", "  padded@example.com  "])(
    "accepts %j",
    (email) => {
      expect(isValidEmail(email)).toBe(true);
    },
  );

  it.each(["", "plain", "@example.com", "user@", "user@example", "two@@example.com", "sp ace@example.com"])(
    "rejects %j",
    (email) => {
      expect(isValidEmail(email)).toBe(false);
    },
  );
});
