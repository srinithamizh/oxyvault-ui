import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeModePicker from "./ThemeModePicker";
import { THEME_STORAGE_KEY } from "@/hooks/useTheme/useTheme";
import { renderWithProviders } from "@/test/renderWithProviders";

describe("ThemeModePicker", () => {
  it("offers Light, Dark and System as a radio group", () => {
    renderWithProviders(<ThemeModePicker />);
    expect(screen.getByRole("group", { name: "Theme" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio").map((radio) => (radio as HTMLInputElement).value)).toEqual([
      "light",
      "dark",
      "system",
    ]);
  });

  it("starts on Light", () => {
    renderWithProviders(<ThemeModePicker />);
    expect(screen.getByRole("radio", { name: "Light" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Dark" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "System" })).not.toBeChecked();
  });

  it("switches to Dark, applies it and saves it", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeModePicker />);
    await user.click(screen.getByRole("radio", { name: "Dark" }));

    expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked();
    expect(document.documentElement).toHaveClass("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("switches to System and saves it", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeModePicker />);
    await user.click(screen.getByRole("radio", { name: "System" }));

    expect(screen.getByRole("radio", { name: "System" })).toBeChecked();
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
  });

  it("reflects the stored mode", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    renderWithProviders(<ThemeModePicker />);
    expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked();
  });

  it("can be operated with the keyboard", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeModePicker />);
    await user.tab();
    expect(screen.getByRole("radio", { name: "Light" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked();
  });
});
