import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfileMenu from "./ProfileMenu";
import { SESSION_STORAGE_KEY } from "@/hooks/useAuth/useAuth";
import { renderWithProviders } from "@/test/renderWithProviders";

const account = { name: "Arjun Kumar", role: "Administrator" };

function renderMenu() {
  return renderWithProviders(
    <div>
      <ProfileMenu user={account} />
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

  it("shows the user's role under their name", () => {
    renderMenu();
    expect(screen.getByText(account.role)).toBeInTheDocument();
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
      expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).not.toBeNull();
    });

    it("ends the session when the user confirms", async () => {
      const user = await openLogoutDialog();
      await user.click(screen.getByRole("button", { name: "Log out" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    });
  });
});
