import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AccentPicker from "./AccentPicker";
import { ACCENTS } from "@/theme/accents/accents";
import { ACCENT_STORAGE_KEY } from "@/hooks/useTheme/useTheme";
import { renderWithProviders } from "@/test/renderWithProviders";

describe("AccentPicker", () => {
  it("offers the five accent colours in a labelled radio group", () => {
    renderWithProviders(<AccentPicker />);
    expect(screen.getByRole("group", { name: "Accent color" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    for (const name of ["Green", "Blue", "Violet", "Orange", "Rose"]) {
      expect(screen.getByRole("radio", { name })).toBeInTheDocument();
    }
  });

  it("lays the colors out in a single row of five equal columns (also on mobile)", () => {
    renderWithProviders(<AccentPicker />);
    const options = screen.getByTestId("accent-options");
    expect(options).toHaveClass("grid", "grid-cols-5");
    expect(options).not.toHaveClass("flex-wrap");
  });

  it("paints each swatch with its colour", () => {
    renderWithProviders(<AccentPicker />);
    for (const { id, swatch } of ACCENTS) {
      expect(screen.getByTestId(`swatch-${id}`)).toHaveStyle({ backgroundColor: swatch });
    }
  });

  it("defaults to green", () => {
    renderWithProviders(<AccentPicker />);
    expect(screen.getByRole("radio", { name: "Green" })).toBeChecked();
    expect(document.documentElement.dataset.accent).toBe("green");
  });

  it("applies the chosen colour to the page and saves it to localStorage", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AccentPicker />);
    await user.click(screen.getByRole("radio", { name: "Blue" }));

    expect(screen.getByRole("radio", { name: "Blue" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Green" })).not.toBeChecked();
    expect(document.documentElement.dataset.accent).toBe("blue");
    expect(window.localStorage.getItem(ACCENT_STORAGE_KEY)).toBe("blue");
  });

  it.each(ACCENTS)("can select $id", async ({ id, labelKey }) => {
    const user = userEvent.setup();
    renderWithProviders(<AccentPicker />);
    const label = labelKey.split(".").pop()!;
    await user.click(screen.getByRole("radio", { name: new RegExp(label, "i") }));
    expect(document.documentElement.dataset.accent).toBe(id);
  });

  it("reflects the stored accent", () => {
    window.localStorage.setItem(ACCENT_STORAGE_KEY, "violet");
    renderWithProviders(<AccentPicker />);
    expect(screen.getByRole("radio", { name: "Violet" })).toBeChecked();
  });
});
