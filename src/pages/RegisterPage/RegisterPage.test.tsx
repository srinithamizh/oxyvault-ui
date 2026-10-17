import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";
import { login, resetAuthStore } from "@/services/authService/authService";
import { renderWithProviders } from "@/test/renderWithProviders";
import { seedUsers } from "@/data/mockUsers";

function renderRegister() {
  return renderWithProviders(<App />, { route: "/register", user: null });
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  values: Partial<{ name: string; email: string; password: string; confirm: string; terms: boolean }> = {},
) {
  const { name = "Meera Nair", email = "meera@example.com", password = "Str0ng!pass", confirm = password, terms = true } = values;
  await user.type(screen.getByLabelText("Full name"), name);
  await user.type(screen.getByLabelText("Email address"), email);
  await user.type(screen.getByLabelText("Password"), password);
  await user.type(screen.getByLabelText("Confirm password"), confirm);
  if (terms) await user.click(screen.getByRole("checkbox", { name: /Terms and Privacy Policy/ }));
}

describe("RegisterPage", () => {
  beforeEach(() => resetAuthStore());

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

    expect(screen.getByText("Enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Enter your email address.")).toBeInTheDocument();
    expect(screen.getByText("Create a password.")).toBeInTheDocument();
    expect(screen.getByText("Confirm your password.")).toBeInTheDocument();
    expect(screen.getByText("You must accept the Terms and Privacy Policy.")).toBeInTheDocument();
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

  it("creates the account and lands on the dashboard", async () => {
    const user = userEvent.setup();
    renderRegister();
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();
    await expect(login({ email: "meera@example.com", password: "Str0ng!pass" })).resolves.toMatchObject({
      name: "Meera Nair",
    });
  });
});
