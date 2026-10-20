import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthProvider from "./AuthProvider";
import { useAuth } from "@/hooks/useAuth/useAuth";
import { apiRequest, ApiError } from "@/services/apiClient/apiClient";
import { AuthError, login, logout, register } from "@/services/authService/authService";
import { getAccessToken } from "@/services/tokenStore/tokenStore";
import { fullNameOf, seedUsers } from "@/test/mockUsers";

vi.mock("@/services/authService/authService", async () => {
  const { createMockedAuthService } = await import("@/test/mockAuthService");
  return createMockedAuthService();
});

/** Replaces `fetch` with a stub that answers every request, recording what was sent. */
function stubFetch(status = 200, body: unknown = true) {
  const fetchStub = vi.fn(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchStub);
  return fetchStub;
}

const SEED = { identifier: seedUsers[0].email, password: seedUsers[0].password };

function Probe() {
  const { user, login, register, logout } = useAuth();
  return (
    <div>
      <p data-testid="who">{user ? user.name : "signed out"}</p>
      <button type="button" onClick={() => login(SEED)}>
        login
      </button>
      <button type="button" onClick={() => login({ ...SEED, password: "bad" }).catch(() => {})}>
        bad-login
      </button>
      <button type="button" onClick={() => register({ firstName: "Meera", lastName: "Nair", username: "meera", email: "meera@example.com", password: "Str0ng!pass" })}>
        register
      </button>
      <button type="button" onClick={logout}>
        logout
      </button>
    </div>
  );
}

const renderProbe = (initialUser?: Parameters<typeof AuthProvider>[0]["initialUser"]) =>
  render(
    <AuthProvider initialUser={initialUser}>
      <Probe />
    </AuthProvider>,
  );

describe("AuthProvider", () => {
  it("starts signed out", () => {
    renderProbe();
    expect(screen.getByTestId("who")).toHaveTextContent("signed out");
  });

  it("signs in, exposes the user and keeps the token in memory only", async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByRole("button", { name: "login" }));

    expect(await screen.findByText(fullNameOf(seedUsers[0]))).toBeInTheDocument();
    expect(getAccessToken()).toBe("token-u-1");
    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
    expect(document.cookie).toBe("");
  });

  it("sends the token on later API requests", async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByRole("button", { name: "login" }));
    await screen.findByText(fullNameOf(seedUsers[0]));

    const fetchStub = stubFetch();
    await apiRequest("/profile");
    const init = fetchStub.mock.calls[0] as unknown as [URL, RequestInit];
    expect((init[1].headers as Record<string, string>).Authorization).toBe("Bearer token-u-1");
  });

  it("keeps the user signed out when login fails", async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByRole("button", { name: "bad-login" }));
    expect(screen.getByTestId("who")).toHaveTextContent("signed out");
    expect(getAccessToken()).toBeNull();
  });

  it("passes the credentials to the auth service", async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByRole("button", { name: "login" }));
    await screen.findByText(fullNameOf(seedUsers[0]));
    expect(login).toHaveBeenCalledWith(SEED);
  });

  it("rejects with an AuthError from the service", async () => {
    let caught: unknown;
    function Catcher() {
      const { login } = useAuth();
      return (
        <button type="button" onClick={() => login({ ...SEED, password: "bad" }).catch((error) => (caught = error))}>
          go
        </button>
      );
    }
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <Catcher />
      </AuthProvider>,
    );
    await user.click(screen.getByRole("button", { name: "go" }));
    expect(caught).toBeInstanceOf(AuthError);
  });

  it("registers an account without signing the user in", async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByRole("button", { name: "register" }));
    await waitFor(() => expect(register).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId("who")).toHaveTextContent("signed out");
    expect(getAccessToken()).toBeNull();
  });

  it("logout clears the user and the token", async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByRole("button", { name: "login" }));
    await screen.findByText(fullNameOf(seedUsers[0]));

    await user.click(screen.getByRole("button", { name: "logout" }));
    expect(logout).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("who")).toHaveTextContent("signed out");
    expect(getAccessToken()).toBeNull();
  });

  it("does not restore a session from browser storage", () => {
    window.localStorage.setItem(
      "oxyvault-session",
      JSON.stringify({ id: "u-1", name: "Stored User", username: "stored", email: "s@example.com", role: "user" }),
    );
    renderProbe();
    expect(screen.getByTestId("who")).toHaveTextContent("signed out");
  });

  it("signs out when the backend rejects the token with 401", async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByRole("button", { name: "login" }));
    await screen.findByText(fullNameOf(seedUsers[0]));

    stubFetch(401, { message: "expired" });
    await expect(apiRequest("/profile")).rejects.toBeInstanceOf(ApiError);
    expect(await screen.findByText("signed out")).toBeInTheDocument();
    expect(getAccessToken()).toBeNull();
  });

  it("throws a helpful error when useAuth is used outside the provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow("useAuth must be used inside <AuthProvider>");
    spy.mockRestore();
  });
});
