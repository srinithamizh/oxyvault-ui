import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppearanceSettingsPage from "./AppearanceSettingsPage";
import { ACCENT_STORAGE_KEY, THEME_STORAGE_KEY } from "@/hooks/useTheme/useTheme";
import { renderWithProviders } from "@/test/renderWithProviders";

describe("AppearanceSettingsPage", () => {
  it("shows the theme mode and accent color options", () => {
    renderWithProviders(<AppearanceSettingsPage />);
    expect(screen.getByRole("region", { name: "Appearance" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Theme" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Accent color" })).toBeInTheDocument();
  });

  it("saves the mode and accent independently", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppearanceSettingsPage />);

    await user.click(screen.getByRole("radio", { name: "Dark" }));
    await user.click(screen.getByRole("radio", { name: "Orange" }));

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(window.localStorage.getItem(ACCENT_STORAGE_KEY)).toBe("orange");
    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement.dataset.accent).toBe("orange");
  });
});
