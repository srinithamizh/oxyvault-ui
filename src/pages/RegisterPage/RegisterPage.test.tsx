import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";
import { AuthError, checkUsernameAvailable, register } from "@/services/authService/authService";
import { renderWithProviders } from "@/test/renderWithProviders";
import { USERNAME_CHECK_DELAY_MS } from "@/hooks/useUsernameAvailability/useUsernameAvailability";
import { seedUsers } from "@/test/mockUsers";

vi.mock("@/services/authService/authService", async () => {
  const { createMockedAuthService } = await import("@/test/mockAuthService");
  return createMockedAuthService();
});

function renderRegister() {
  return renderWithProviders(<App />, { route: "/register", user: null });
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  values: Partial<{ firstName: string; lastName: string; username: string; email: string; password: string; confirm: string; terms: boolean }> = {},
) {
  const {
    firstName = "Meera",
    lastName = "Nair",
    username = "meera.nair",
    email = "meera@example.com", password = "Str0ng!pass", confirm = password, terms = true,
  } = values;
  await user.type(screen.getByLabelText("First name"), firstName);
  await user.type(screen.getByLabelText("Last name"), lastName);
  await user.type(screen.getByLabelText("Username"), username);
  await user.type(screen.getByLabelText("Email address"), email);
  await user.type(screen.getByLabelText("Password"), password);
  await user.type(screen.getByLabelText("Confirm password"), confirm);
  if (terms) await user.click(screen.getByRole("checkbox", { name: /Terms and Privacy Policy/ }));
}

describe("RegisterPage", () => {
  it("renders the registration form outside the app shell", () => {
    renderRegister();
    expect(screen.getByRole("heading", { level: 1, name: "Create your account" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Primary" })).not.toBeInTheDocument();
  });

  it("links back to the sign-in page", async () => {
    const user = userEvent.setup();
    renderRegister();
    await user.click(screen.getByRole("link", { name: "Sign in" }));
    expect(screen.getByRole("heading", { level: 1, name: "Welcome back" })).toBeInTheDocument();
  });

  it("shows an error for every empty required field", async () => {
    const user = userEvent.setup();
    renderRegister();
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByText("Enter your first name.")).toBeInTheDocument();
    expect(screen.getByText("Enter your last name.")).toBeInTheDocument();
    expect(screen.getByText("Choose a username.")).toBeInTheDocument();
    expect(screen.getByText("Enter your email address.")).toBeInTheDocument();
    expect(screen.getByText("Create a password.")).toBeInTheDocument();
    expect(screen.getByText("Confirm your password.")).toBeInTheDocument();
    expect(screen.getByText("You must accept the Terms and Privacy Policy.")).toBeInTheDocument();
  });

  it("puts first and last name side by side with username on the next row", () => {
    renderRegister();
    const first = screen.getByLabelText("First name");
    const last = screen.getByLabelText("Last name");
    const username = screen.getByLabelText("Username");
    expect(screen.queryByLabelText("Full name")).not.toBeInTheDocument();
    expect(first.compareDocumentPosition(last) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(last.compareDocumentPosition(username) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByTestId("name-row")).toContainElement(first);
    expect(screen.getByTestId("name-row")).toContainElement(last);
    expect(screen.getByTestId("name-row")).not.toContainElement(username);
  });

  it.each(["ab", "has space", "bad!char", "x".repeat(21)])("rejects the invalid username %j", async (username) => {
    const user = userEvent.setup();
    renderRegister();
    await fillForm(user, { username });
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(screen.getByText("Use 3-20 letters, numbers, dots or underscores.")).toBeInTheDocument();
  });

  it("reports a username that is already taken", async () => {
    const user = userEvent.setup();
    renderRegister();
    await fillForm(user, { username: seedUsers[0].username });
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByText("This username is already taken.")).toBeInTheDocument();
  });

  it("requires a password of at least 8 characters", async () => {
    const user = userEvent.setup();
    renderRegister();
    await fillForm(user, { password: "short1!" });
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(screen.getByText("Use at least 8 characters.")).toBeInTheDocument();
  });

  it("requires the confirmation to match", async () => {
    const user = userEvent.setup();
    renderRegister();
    await fillForm(user, { confirm: "Different1!" });
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
  });

  it("shows the mismatch error as soon as the confirmation differs", async () => {
    const user = userEvent.setup();
    renderRegister();
    await user.type(screen.getByLabelText("Password"), "Str0ng!pass");
    await user.type(screen.getByLabelText("Confirm password"), "Different1!");
    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it("requires accepting the terms", async () => {
    const user = userEvent.setup();
    renderRegister();
    await fillForm(user, { terms: false });
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(screen.getByText("You must accept the Terms and Privacy Policy.")).toBeInTheDocument();
  });

  it("shows the password strength as the user types", async () => {
    const user = userEvent.setup();
    renderRegister();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Password"), "abc");
    expect(screen.getByRole("status")).toHaveTextContent("Weak password");

    await user.clear(screen.getByLabelText("Password"));
    await user.type(screen.getByLabelText("Password"), "abcdEF1!");
    expect(screen.getByRole("status")).toHaveTextContent("Strong password");
  });

  it("reports an email that is already registered", async () => {
    const user = userEvent.setup();
    renderRegister();
    await fillForm(user, { email: seedUsers[0].email });
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByText("An account with this email already exists.")).toBeInTheDocument();
  });

  it("creates the account, then sends the user to the login page without signing them in", async () => {
    const user = userEvent.setup();
    renderRegister();
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Welcome back" })).toBeInTheDocument();
    expect(register).toHaveBeenCalledTimes(1);
    expect(vi.mocked(register).mock.calls[0]?.[0]).toEqual({
      firstName: "Meera",
      lastName: "Nair",
      username: "meera.nair",
      email: "meera@example.com",
      password: "Str0ng!pass",
    });
    expect(screen.getByRole("status")).toHaveTextContent("Account created. Sign in to continue.");
    expect(screen.getByLabelText("Email or username")).toHaveValue("meera.nair");
    expect(screen.queryByRole("heading", { level: 1, name: "Dashboard" })).not.toBeInTheDocument();
  });

  it("can then sign in with the new account", async () => {
    const user = userEvent.setup();
    renderRegister();
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));
    await screen.findByRole("heading", { level: 1, name: "Welcome back" });

    await user.type(screen.getByLabelText("Password"), "Str0ng!pass");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();
  });

  it("stays on the form and shows the error when the account is not created", async () => {
    vi.mocked(register).mockRejectedValueOnce(new AuthError("generic", "failed"));
    const user = userEvent.setup();
    renderRegister();
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong");
    expect(screen.getByRole("heading", { level: 1, name: "Create your account" })).toBeInTheDocument();
  });

  it("shows a friendly message when the server cannot be reached", async () => {
    vi.mocked(register).mockRejectedValueOnce(new AuthError("network", "offline"));
    const user = userEvent.setup();
    renderRegister();
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Can't reach the server");
  });

  describe("username availability", () => {
    const type = (user: ReturnType<typeof userEvent.setup>, text: string) =>
      user.type(screen.getByLabelText("Username"), text);
    const checkedNames = () => vi.mocked(checkUsernameAvailable).mock.calls.map(([name]) => name);

    it("does not call the API for an invalid username", async () => {
      const user = userEvent.setup();
      renderRegister();
      await type(user, "ab");
      await new Promise((resolve) => setTimeout(resolve, USERNAME_CHECK_DELAY_MS + 150));
      expect(checkUsernameAvailable).not.toHaveBeenCalled();
    });

    it("checks a valid username once typing pauses and reports it is free", async () => {
      const user = userEvent.setup();
      renderRegister();
      await type(user, "meera.nair");
      expect(await screen.findByText("Username is available")).toBeInTheDocument();
      expect(checkedNames()).toEqual(["meera.nair"]);
    });

    it("reports a username that is already taken, ignoring case", async () => {
      const user = userEvent.setup();
      renderRegister();
      await type(user, seedUsers[0].username.toUpperCase());
      expect(await screen.findByText("This username is already taken.")).toBeInTheDocument();
      expect(screen.queryByText("Username is available")).not.toBeInTheDocument();
    });

    it("blocks submitting a username known to be taken", async () => {
      const user = userEvent.setup();
      renderRegister();
      await fillForm(user, { username: seedUsers[0].username });
      await screen.findByText("This username is already taken.");
      await user.click(screen.getByRole("button", { name: "Create account" }));
      expect(register).not.toHaveBeenCalled();
    });

    it("only calls again when the username changes", async () => {
      const user = userEvent.setup();
      renderRegister();
      await type(user, "meera.nair");
      await screen.findByText("Username is available");

      // Typing a character and deleting it again leaves the same value, which must not be re-checked.
      await type(user, "x");
      await type(user, "{Backspace}");
      await screen.findByText("Username is available");
      expect(checkedNames()).toEqual(["meera.nair"]);

      await type(user, "2");
      await screen.findByText("Username is available");
      expect(checkedNames()).toEqual(["meera.nair", "meera.nair2"]);
    });

    it("does not flood the API while typing quickly", async () => {
      const user = userEvent.setup();
      renderRegister();
      await type(user, "quickly.typed");
      await screen.findByText("Username is available");
      expect(checkedNames()).toEqual(["quickly.typed"]);
    });

    it("keeps the form usable when the check fails", async () => {
      vi.mocked(checkUsernameAvailable).mockRejectedValueOnce(new Error("offline"));
      const user = userEvent.setup();
      renderRegister();
      await type(user, "meera.nair");
      expect(await screen.findByText("Couldn't check availability right now.")).toBeInTheDocument();
    });
  });
});
