import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import App from "./App";
import { pageRoutes } from "@/app/navigation";
import { renderWithProviders, testUser } from "@/test/renderWithProviders";
import { UserRole } from "@/types/user";
import { seedUsers } from "@/test/mockUsers";
import { getUsers } from "@/services/usersService/usersService";
import { getSources } from "@/services/sourcesService/sourcesService";
import { getPaymentMethods } from "@/services/paymentMethodsService/paymentMethodsService";
import { getCategories } from "@/services/transactionCategoriesService/transactionCategoriesService";
import { testSources } from "@/test/fixtures/sources";
import { testPaymentMethods } from "@/test/fixtures/paymentMethods";
import { setAccessToken } from "@/services/tokenStore/tokenStore";
import { getTransactions } from "@/services/transactionsService/transactionsService";

vi.mock("@/services/authService/authService", async () => {
  const { createMockedAuthService } = await import("@/test/mockAuthService");
  return createMockedAuthService();
});

vi.mock("@/services/usersService/usersService", () => ({
  getUsers: vi.fn(async (number: number, size: number) => ({
    content: [],
    first: number === 0,
    last: true,
    number,
    size,
    totalElements: 0,
    totalPages: 0,
  })),
  updateUserRole: vi.fn(),
}));

vi.mock("@/services/sourcesService/sourcesService", () => ({
  getSources: vi.fn(),
  createSource: vi.fn(),
  updateSource: vi.fn(),
  deleteSource: vi.fn(),
}));

vi.mock("@/services/paymentMethodsService/paymentMethodsService", () => ({
  getPaymentMethods: vi.fn(),
  createPaymentMethod: vi.fn(),
  updatePaymentMethod: vi.fn(),
  deletePaymentMethod: vi.fn(),
}));

vi.mock("@/services/transactionCategoriesService/transactionCategoriesService", () => ({
  getCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

vi.mock("@/services/transactionsService/transactionsService", () => ({
  getTransactions: vi.fn(async () => ({
    content: [],
    page: { size: 25, number: 0, totalElements: 0, totalPages: 0 },
  })),
  createTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
}));

describe("App routing", () => {
  it("loads dashboard data once and reuses it when returning to the dashboard", async () => {
    const user = userEvent.setup();
    vi.clearAllMocks();
    vi.mocked(getSources).mockResolvedValue(testSources);
    vi.mocked(getPaymentMethods).mockResolvedValue(testPaymentMethods);
    vi.mocked(getCategories).mockResolvedValue([]);
    setAccessToken("test-token");
    renderWithProviders(<App />, {
      route: "/dashboard",
      initialSources: null,
      initialMethods: null,
      initialCategories: null,
    });

    await waitFor(() => {
      expect(getSources).toHaveBeenCalledTimes(1);
      expect(getPaymentMethods).toHaveBeenCalledTimes(1);
      expect(getCategories).toHaveBeenCalledTimes(1);
    });
    expect(getUsers).not.toHaveBeenCalled();

    const sidebar = screen.getByRole("navigation", { name: "Primary" });
    await user.click(within(sidebar).getByRole("link", { name: "Reports" }));
    await user.click(within(sidebar).getByRole("link", { name: "Dashboard" }));

    expect(getSources).toHaveBeenCalledTimes(1);
    expect(getPaymentMethods).toHaveBeenCalledTimes(1);
    expect(getCategories).toHaveBeenCalledTimes(1);
  });

  it("loads admin users only on the manage users page", async () => {
    vi.clearAllMocks();
    vi.mocked(getUsers).mockResolvedValue({
      content: [],
      first: true,
      last: true,
      number: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    });
    setAccessToken("test-token");
    renderWithProviders(<App />, {
      route: "/admin/users",
      initialSources: null,
      initialMethods: null,
      initialCategories: null,
    });

    await waitFor(() => expect(getUsers).toHaveBeenCalledWith(0, 20));
    expect(getSources).not.toHaveBeenCalled();
    expect(getPaymentMethods).not.toHaveBeenCalled();
    expect(getCategories).not.toHaveBeenCalled();
  });

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

  it("does not load dashboard data or admin users on the login page", () => {
    vi.clearAllMocks();
    renderWithProviders(<App />, { route: "/login", user: null });

    expect(screen.getByRole("heading", { level: 1, name: "Welcome back" })).toBeInTheDocument();
    expect(getCategories).not.toHaveBeenCalled();
    expect(getSources).not.toHaveBeenCalled();
    expect(getPaymentMethods).not.toHaveBeenCalled();
    expect(getUsers).not.toHaveBeenCalled();
    expect(getTransactions).not.toHaveBeenCalled();
  });

  it("sends signed-in users away from the login page", () => {
    renderWithProviders(<App />, { route: "/login" });
    expect(screen.getByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();
  });

  it("returns to the page the visitor originally asked for after signing in", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: "/reports", user: null });

    await user.type(screen.getByLabelText("Email or username"), seedUsers[0].email);
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

  it("lets admins open the Admin Panel", () => {
    renderWithProviders(<App />, { route: "/admin", user: { ...testUser, role: UserRole.Admin } });
    expect(screen.getByRole("heading", { level: 1, name: "Admin Panel" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Manage Users" })).toBeInTheDocument();
  });

  it("opens the Manage Users subpage directly", () => {
    renderWithProviders(<App />, { route: "/admin/users", user: { ...testUser, role: UserRole.Admin } });
    expect(screen.getByRole("heading", { level: 2, name: "Manage Users" })).toBeInTheDocument();
  });

  it("sends regular users away from the Admin Panel", () => {
    renderWithProviders(<App />, { route: "/admin", user: { ...testUser, role: UserRole.User } });
    expect(screen.queryByRole("heading", { level: 1, name: "Admin Panel" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();
  });
});
