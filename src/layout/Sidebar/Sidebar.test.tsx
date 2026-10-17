import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { useState } from "react";
import Sidebar from "./Sidebar";
import { navItems } from "@/app/navigation";
import { renderWithProviders, testUser } from "@/test/renderWithProviders";

function Harness() {
  const [collapsed, setCollapsed] = useState(false);
  return <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />;
}

describe("Sidebar", () => {
  it("lists every navigation item with the right destination", () => {
    renderWithProviders(<Harness />);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    for (const { labelKey, path } of navItems) {
      expect(within(nav).getByRole("link", { name: i18n.t(labelKey) })).toHaveAttribute("href", path);
    }
  });

  it("does not list Settings, which lives in the profile menu", () => {
    renderWithProviders(<Harness />);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(within(nav).queryByRole("link", { name: "Settings" })).not.toBeInTheDocument();
  });

  it("marks the current route as active", () => {
    renderWithProviders(<Harness />, { route: "/reports" });
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(within(nav).getByRole("link", { name: "Reports" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
  });

  it("shows the Admin badge and vault health", () => {
    renderWithProviders(<Harness />);
    expect(within(screen.getByRole("navigation", { name: "Primary" })).getByText("Admin")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Your OxyVault Health" })).toHaveAttribute("aria-valuenow", "92");
  });

  it("does not repeat the user's name or role, which the header already shows", () => {
    renderWithProviders(<Harness />);
    const aside = screen.getByRole("complementary");
    expect(within(aside).queryByText(testUser.name)).not.toBeInTheDocument();
    expect(within(aside).queryByText(testUser.role)).not.toBeInTheDocument();
  });

  it("collapses to icons only and expands again", async () => {
    const userEv = userEvent.setup();
    renderWithProviders(<Harness />);
    const aside = screen.getByRole("complementary");
    expect(aside).toHaveAttribute("data-collapsed", "false");

    await userEv.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(aside).toHaveAttribute("data-collapsed", "true");
    expect(screen.queryByText("Vault health")).not.toBeInTheDocument();
    // Links stay reachable by accessible name even though the text is hidden.
    expect(within(aside).getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(within(aside).queryByText("Dashboard")).not.toBeInTheDocument();

    await userEv.click(screen.getByRole("button", { name: "Expand sidebar" }));
    expect(aside).toHaveAttribute("data-collapsed", "false");
    expect(screen.getByText("Your OxyVault Health")).toBeInTheDocument();
  });
});
