import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminUsersPage from "./AdminUsersPage";
import { renderWithProviders, testUser } from "@/test/renderWithProviders";
import { getUsers, updateUserRole } from "@/services/usersService/usersService";
import { UserRole } from "@/types/user";

vi.mock("@/services/usersService/usersService", () => ({
  getUsers: vi.fn(),
  updateUserRole: vi.fn(),
}));

const currentAdmin = {
  id: testUser.id,
  name: testUser.name,
  username: "admin",
  email: "admin@example.com",
  role: UserRole.Admin,
};
const otherUser = {
  id: "user-2",
  name: "Sam User",
  username: "sam",
  email: "sam@example.com",
  role: UserRole.User,
};

function page(number = 0) {
  return {
    content: [currentAdmin, otherUser],
    first: number === 0,
    last: number === 1,
    number,
    size: 20,
    totalElements: 22,
    totalPages: 2,
  };
}

describe("AdminUsersPage", () => {
  beforeEach(() => {
    vi.mocked(getUsers).mockResolvedValue(page());
    vi.mocked(updateUserRole).mockResolvedValue();
  });

  it("loads and displays the paginated users", async () => {
    renderWithProviders(<AdminUsersPage />);

    expect(await screen.findByText("Sam User")).toBeInTheDocument();
    expect(getUsers).toHaveBeenCalledWith(0, 20);
    expect(screen.getByText("Showing 1–2 of 22 users")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
  });

  it("shows an info tooltip for the signed-in admin and keeps roles read-only until editing", async () => {
    renderWithProviders(<AdminUsersPage />);

    expect(await screen.findByText("Administrator")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "It's you, so you can't edit your own role." })).toHaveAttribute(
      "title",
      "It's you, so you can't edit your own role.",
    );
    expect(screen.queryByRole("button", { name: "Role for Sam User" })).not.toBeInTheDocument();
  });

  it("enables role dropdowns only in edit mode and offers only the alternate role", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminUsersPage />);
    await screen.findByText("Sam User");

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByRole("button", { name: "Role for Sam User" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Role for Arjun Kumar" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "It's you, so you can't edit your own role." })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Role for Sam User" }));
    expect(screen.getByRole("option", { name: "User" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Administrator" })).toBeInTheDocument();
    expect(screen.queryByText("You")).not.toBeInTheDocument();
    await user.keyboard("{Escape}");

    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("button", { name: "Role for Sam User" })).not.toBeInTheDocument();
  });

  it("updates another user's role with the PATCH API", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminUsersPage />);

    await screen.findByText("Sam User");
    await user.click(screen.getByRole("button", { name: "Edit" }));
    const roleButton = screen.getByRole("button", { name: "Role for Sam User" });
    await user.click(roleButton);
    await user.click(screen.getByRole("option", { name: "Administrator" }));

    await waitFor(() => expect(updateUserRole).toHaveBeenCalledWith("user-2", UserRole.Admin));
    expect(roleButton).toHaveTextContent("Administrator");
  });

  it("paginates using the backend page number and size", async () => {
    const user = userEvent.setup();
    vi.mocked(getUsers).mockImplementation(async (number) => page(number));
    renderWithProviders(<AdminUsersPage />);
    await screen.findByText("Sam User");

    await user.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => expect(getUsers).toHaveBeenLastCalledWith(1, 20));
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
  });

  it("shows a retry option when loading fails", async () => {
    vi.mocked(getUsers).mockRejectedValueOnce(new Error("service unavailable"));
    renderWithProviders(<AdminUsersPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't load users");
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("reverts a role change and reports a failure when PATCH fails", async () => {
    const user = userEvent.setup();
    vi.mocked(updateUserRole).mockRejectedValueOnce(new Error("service unavailable"));
    renderWithProviders(<AdminUsersPage />);

    await screen.findByText("Sam User");
    await user.click(screen.getByRole("button", { name: "Edit" }));
    const roleButton = screen.getByRole("button", { name: "Role for Sam User" });
    await user.click(roleButton);
    await user.click(screen.getByRole("option", { name: "Administrator" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't update this user's role");
    expect(roleButton).toHaveTextContent("User");
  });
});
