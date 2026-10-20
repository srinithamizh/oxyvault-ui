import { parseApiBaseUrl } from "./apiBaseUrl";

describe("parseApiBaseUrl", () => {
  it("returns the origin without a trailing slash", () => {
    expect(parseApiBaseUrl("http://localhost:8080/", false)).toBe("http://localhost:8080");
    expect(parseApiBaseUrl(" https://api.example.com ", true)).toBe("https://api.example.com");
  });

  it("keeps a path prefix", () => {
    expect(parseApiBaseUrl("https://example.com/api/v1/", true)).toBe("https://example.com/api/v1");
  });

  it.each([undefined, "", "   "])("rejects a missing value (%j)", (value) => {
    expect(() => parseApiBaseUrl(value, false)).toThrow(/not set/);
  });

  it("rejects values that are not URLs or not http(s)", () => {
    expect(() => parseApiBaseUrl("api.example.com", false)).toThrow(/valid URL/);
    expect(() => parseApiBaseUrl("ftp://example.com", false)).toThrow(/http/);
  });

  it("requires https in production but allows http in development", () => {
    expect(() => parseApiBaseUrl("http://api.example.com", true)).toThrow(/https/);
    expect(parseApiBaseUrl("http://localhost:8080", false)).toBe("http://localhost:8080");
  });

  it("rejects embedded credentials", () => {
    expect(() => parseApiBaseUrl("https://user:pass@example.com", true)).toThrow(/credentials/);
  });
});
