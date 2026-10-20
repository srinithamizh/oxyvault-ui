import { clearAccessToken, getAccessToken, setAccessToken } from "./tokenStore";

describe("tokenStore", () => {
  afterEach(() => clearAccessToken());

  it("keeps the token in memory only", () => {
    expect(getAccessToken()).toBeNull();
    setAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});
