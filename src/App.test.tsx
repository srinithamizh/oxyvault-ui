import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import App from "./App";
import { pageRoutes } from "@/app/navigation";
import { resetAuthStore } from "@/services/authService/authService";
import { renderWithProviders } from "@/test/renderWithProviders";
import { seedUsers } from "@/data/mockUsers";

describe("App routing", () => {
  it("redirects the root path to the dashboard", () => {
    renderWithProviders(<App />, { route: "/" });
    expect(screen.getByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();
  });

  it("redirects unknown paths to the dashboard", () => {
    renderWithProviders(<App />, { route: "/does-not-exist" });
    expect(screen.getByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();
  });

  it.each(pageRoutes)("renders the $labelKey page at $path", ({ labelKey, path }) => {
    renderWithProviders(<App />, { route: path });
    expect(screen.getByRole("heading", { level: 1, name: i18n.t(labelKey) })).toBeInTheDocument();
  });

  it("reaches the Profile page from the profile menu", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: "/dashboard" });

    await user.click(screen.getByRole("button", { name: "Account menu" }));
    await user.click(screen.getByRole("menuitem", { name: "Profile" }));

    expect(screen.getByRole("heading", { level: 1, name: "Profile" })).toBeInTheDocument();
  });

  it("reaches Settings from the profile menu", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: "/dashboard" });

    await user.click(screen.getByRole("button", { name: "Account menu" }));
    await user.click(screen.getByRole("menuitem", { name: "Settings" }));

    expect(screen.getByRole("heading", { level: 1, name: "Settings" })).toBeInTheDocument();
  });

  it("redirects signed-out visitors to the login page", () => {
    renderWithProviders(<App />, { route: "/reports", user: null });
    expect(screen.getByRole("heading", { level: 1, name: "Welcome back" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Primary" })).not.toBeInTheDocument();
  });

  it("sends signed-in users away from the login page", () => {
    renderWithProviders(<App />, { route: "/login" });
    expect(screen.getByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();
  });

  it("returns to the page the visitor originally asked for after signing in", async () => {
    const user = userEvent.setup();
    resetAuthStore();
    renderWithProviders(<App />, { route: "/reports", user: null });

    await user.type(screen.getByLabelText("Email address"), seedUsers[0].email);
    await user.type(screen.getByLabelText("Password"), seedUsers[0].password);
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Reports" })).toBeInTheDocument();
  });

  it("logs out through the profile menu and returns to the login page", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: "/settings" });

    await user.click(screen.getByRole("button", { name: "Account menu" }));
    await user.click(screen.getByRole("menuitem", { name: "Log out" }));
    await user.click(screen.getByRole("button", { name: "Log out" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Welcome back" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Primary" })).not.toBeInTheDocument();
  });

  it("navigates when a sidebar link is clicked and marks it as current", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: "/dashboard" });

    const sidebar = screen.getByRole("navigation", { name: "Primary" });
    await user.click(within(sidebar).getByRole("link", { name: "Reports" }));

    expect(screen.getByRole("heading", { level: 1, name: "Reports" })).toBeInTheDocument();
    expect(within(sidebar).getByRole("link", { name: "Reports" })).toHaveAttribute("aria-current", "page");
    expect(within(sidebar).getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
  });
});
