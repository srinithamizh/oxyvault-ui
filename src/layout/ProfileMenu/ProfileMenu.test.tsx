import { UserRole } from "@/types/user";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfileMenu from "./ProfileMenu";
import { useAuth } from "@/hooks/useAuth/useAuth";
import { renderWithProviders } from "@/test/renderWithProviders";

const account = { name: "Arjun Kumar", role: UserRole.Admin };

function SessionState() {
  const { user } = useAuth();
  return <p data-testid="session">{user ? "signed in" : "signed out"}</p>;
}

function renderMenu() {
  return renderWithProviders(
    <div>
      <ProfileMenu user={account} />
      <SessionState />
      <p>outside</p>
    </div>,
  );
}

describe("ProfileMenu", () => {
  it("is closed by default", () => {
    renderMenu();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Account menu" })).toHaveAttribute("aria-expanded", "false");
  });

  it("opens and lists its items", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Account menu" }));

    expect(screen.getByRole("button", { name: "Account menu" })).toHaveAttribute("aria-expanded", "true");
    const menu = screen.getByRole("menu", { name: "Account" });
    expect(within(menu).getByRole("menuitem", { name: "Profile" })).toHaveAttribute("href", "/profile");
    expect(within(menu).getByRole("menuitem", { name: "Settings" })).toHaveAttribute("href", "/settings");
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Account menu" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes when clicking outside", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Account menu" }));
    await user.click(screen.getByText("outside"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes after choosing an item", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Account menu" }));
    await user.click(screen.getByRole("menuitem", { name: "Settings" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("labels the user role as User", () => {
    renderWithProviders(<ProfileMenu user={{ name: "Meera Nair", role: UserRole.User }} />);
    expect(screen.getByText("User")).toBeInTheDocument();
  });

  it("shows the user's role under their name", () => {
    renderMenu();
    expect(screen.getByText("Administrator")).toBeInTheDocument();
  });

  describe("log out", () => {
    async function openLogoutDialog() {
      const user = userEvent.setup();
      renderMenu();
      await user.click(screen.getByRole("button", { name: "Account menu" }));
      await user.click(screen.getByRole("menuitem", { name: "Log out" }));
      return user;
    }

    it("asks for confirmation instead of logging out immediately", async () => {
      await openLogoutDialog();
      expect(screen.getByRole("dialog", { name: "Log out of OxyVault?" })).toBeInTheDocument();
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("keeps the session when the user cancels", async () => {
      const user = await openLogoutDialog();
      await user.click(screen.getByRole("button", { name: "Cancel" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByTestId("session")).toHaveTextContent("signed in");
    });

    it("ends the session when the user confirms", async () => {
      const user = await openLogoutDialog();
      await user.click(screen.getByRole("button", { name: "Log out" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      await waitFor(() => expect(screen.getByTestId("session")).toHaveTextContent("signed out"));
    });
  });
});
