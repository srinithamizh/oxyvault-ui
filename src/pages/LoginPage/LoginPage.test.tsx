import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";
import { AuthError, login } from "@/services/authService/authService";
import { renderWithProviders } from "@/test/renderWithProviders";
import { fullNameOf, seedUsers } from "@/test/mockUsers";

vi.mock("@/services/authService/authService", async () => {
  const { createMockedAuthService } = await import("@/test/mockAuthService");
  return createMockedAuthService();
});

const VALID_EMAIL = seedUsers[0].email;
const VALID_PASSWORD = seedUsers[0].password;

function renderLogin() {
  return renderWithProviders(<App />, { route: "/login", user: null });
}

describe("LoginPage", () => {
  it("renders the sign-in form outside the app shell", () => {
    renderLogin();
    expect(screen.getByRole("heading", { level: 1, name: "Welcome back" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email or username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Primary" })).not.toBeInTheDocument();
  });

  it("links to the registration page", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole("link", { name: "Create an account" }));
    expect(screen.getByRole("heading", { level: 1, name: "Create your account" })).toBeInTheDocument();
  });

  it("shows required-field errors and does not navigate", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByText("Enter your email or username.")).toBeInTheDocument();
    expect(screen.getByText("Enter your password.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Welcome back" })).toBeInTheDocument();
  });

  it("shows an error for wrong credentials", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText("Email or username"), VALID_EMAIL);
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Invalid email/username or password.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Welcome back" })).toBeInTheDocument();
  });

  it("signs in with the username instead of the email", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText("Email or username"), seedUsers[0].username);
    await user.type(screen.getByLabelText("Password"), VALID_PASSWORD);
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();
  });

  it("signs in with valid credentials, lands on the dashboard and shows the user", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText("Email or username"), VALID_EMAIL);
    await user.type(screen.getByLabelText("Password"), VALID_PASSWORD);
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getAllByText(fullNameOf(seedUsers[0])).length).toBeGreaterThan(0);
  });

  it("sends the trimmed identifier and the password to the auth service", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText("Email or username"), `  ${VALID_EMAIL}  `);
    await user.type(screen.getByLabelText("Password"), VALID_PASSWORD);
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await screen.findByRole("heading", { level: 1, name: "Dashboard" });

    expect(login).toHaveBeenCalledTimes(1);
    expect(vi.mocked(login).mock.calls[0]?.[0]).toEqual({
      identifier: `  ${VALID_EMAIL}  `,
      password: VALID_PASSWORD,
    });
  });

  it("does not call the service when a field is empty", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(login).not.toHaveBeenCalled();
  });

  it.each([
    ["network", "Can't reach the server"],
    ["tooManyRequests", "Too many attempts"],
    ["generic", "Something went wrong"],
  ] as const)("shows the %s error message", async (code, message) => {
    vi.mocked(login).mockRejectedValueOnce(new AuthError(code, code));
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText("Email or username"), VALID_EMAIL);
    await user.type(screen.getByLabelText("Password"), VALID_PASSWORD);
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(message);
  });

  it("falls back to a generic message for an unexpected error", async () => {
    vi.mocked(login).mockRejectedValueOnce(new Error("boom"));
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText("Email or username"), VALID_EMAIL);
    await user.type(screen.getByLabelText("Password"), VALID_PASSWORD);
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong");
  });
});
