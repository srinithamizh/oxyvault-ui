import { clearAccessToken, getAccessToken, setAccessToken } from "./tokenStore";

describe("tokenStore", () => {
  afterEach(() => clearAccessToken());

  it("persists the token for the current tab session", () => {
    expect(getAccessToken()).toBeNull();
    setAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.getItem("oxyvault-access-token")).toBe("abc");
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
    expect(window.sessionStorage.getItem("oxyvault-access-token")).toBeNull();
  });
});
