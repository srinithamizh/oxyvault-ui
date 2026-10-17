import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthProvider from "./AuthProvider";
import { SESSION_STORAGE_KEY, useAuth } from "@/hooks/useAuth/useAuth";
import { AuthError, resetAuthStore } from "@/services/authService/authService";
import { seedUsers } from "@/data/mockUsers";

const SEED = { email: seedUsers[0].email, password: seedUsers[0].password };

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
      <button type="button" onClick={() => register({ name: "Meera Nair", email: "meera@example.com", password: "Str0ng!pass" })}>
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
  beforeEach(() => resetAuthStore());

  it("starts signed out when nothing is stored", () => {
    renderProbe();
    expect(screen.getByTestId("who")).toHaveTextContent("signed out");
  });

  it("signs in, exposes the user and persists the session", async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByRole("button", { name: "login" }));

    expect(await screen.findByText(seedUsers[0].name)).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEY)!)).toMatchObject({ id: "u-1", role: "Administrator" });
  });

  it("keeps the user signed out when login fails", async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByRole("button", { name: "bad-login" }));
    expect(screen.getByTestId("who")).toHaveTextContent("signed out");
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
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

  it("signs in a newly registered user", async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByRole("button", { name: "register" }));
    expect(await screen.findByText("Meera Nair")).toBeInTheDocument();
  });

  it("logout clears the user and the stored session", async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByRole("button", { name: "login" }));
    await screen.findByText(seedUsers[0].name);

    await user.click(screen.getByRole("button", { name: "logout" }));
    expect(screen.getByTestId("who")).toHaveTextContent("signed out");
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it("restores a stored session on load", () => {
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ id: "u-1", name: "Stored User", email: "s@example.com", role: "Member" }),
    );
    renderProbe();
    expect(screen.getByTestId("who")).toHaveTextContent("Stored User");
  });

  it.each(["not json", JSON.stringify({ name: "Missing fields" }), JSON.stringify(null)])(
    "ignores a corrupt stored session (%s)",
    (stored) => {
      window.localStorage.setItem(SESSION_STORAGE_KEY, stored);
      renderProbe();
      expect(screen.getByTestId("who")).toHaveTextContent("signed out");
    },
  );

  it("throws a helpful error when useAuth is used outside the provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow("useAuth must be used inside <AuthProvider>");
    spy.mockRestore();
  });
});
