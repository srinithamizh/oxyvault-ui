import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import App from "@/App";
import { settingsSections } from "@/app/settingsSections";
import { renderWithProviders } from "@/test/renderWithProviders";

describe("SettingsPage", () => {
  it("redirects /settings to the first sub-page (Appearance)", () => {
    renderWithProviders(<App />, { route: "/settings" });
    expect(screen.getByRole("heading", { level: 1, name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Appearance" })).toBeInTheDocument();
  });

  it("redirects unknown sub-pages to Appearance", () => {
    renderWithProviders(<App />, { route: "/settings/does-not-exist" });
    expect(screen.getByRole("heading", { level: 2, name: "Appearance" })).toBeInTheDocument();
  });

  it("lists every sub-page in its own navigation and marks the current one", () => {
    renderWithProviders(<App />, { route: "/settings/appearance" });
    const nav = screen.getByRole("navigation", { name: "Settings sections" });
    for (const { labelKey, path } of settingsSections) {
      expect(within(nav).getByRole("link", { name: i18n.t(labelKey) })).toHaveAttribute("href", `/settings/${path}`);
    }
    expect(within(nav).getByRole("link", { name: "Appearance" })).toHaveAttribute("aria-current", "page");
  });

  it("has no Profile sub-page (Profile is its own page)", () => {
    renderWithProviders(<App />, { route: "/settings/appearance" });
    const nav = screen.getByRole("navigation", { name: "Settings sections" });
    expect(within(nav).queryByRole("link", { name: "Profile" })).not.toBeInTheDocument();
  });

  it("changes the colour theme end to end and keeps it across a remount", async () => {
    const user = userEvent.setup();
    const view = renderWithProviders(<App />, { route: "/settings/appearance" });
    await user.click(screen.getByRole("radio", { name: "Violet" }));
    expect(document.documentElement.dataset.accent).toBe("violet");
    view.unmount();

    // A fresh page load reads the saved choice back from localStorage.
    delete document.documentElement.dataset.accent;
    renderWithProviders(<App />, { route: "/settings/appearance" });
    expect(screen.getByRole("radio", { name: "Violet" })).toBeChecked();
    expect(document.documentElement.dataset.accent).toBe("violet");
  });
});
