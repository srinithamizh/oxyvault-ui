import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeProvider from "./ThemeProvider";
import { DEFAULT_ACCENT } from "@/theme/accents/accents";
import { ACCENT_STORAGE_KEY, THEME_STORAGE_KEY, useTheme } from "@/hooks/useTheme/useTheme";
import { setSystemPrefersDark } from "@/test/matchMedia";

function Probe() {
  const { mode, isDark, accent, setMode, setAccent, toggleTheme } = useTheme();
  return (
    <div>
      <p data-testid="state">{`${mode}|${isDark ? "dark" : "light"}|${accent}`}</p>
      <button type="button" onClick={toggleTheme}>
        toggle
      </button>
      <button type="button" onClick={() => setMode("system")}>
        system
      </button>
      <button type="button" onClick={() => setMode("dark")}>
        dark
      </button>
      <button type="button" onClick={() => setAccent("blue")}>
        blue
      </button>
    </div>
  );
}

const renderProbe = () =>
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );

const state = () => screen.getByTestId("state").textContent;

describe("ThemeProvider", () => {
  describe("mode", () => {
    it("defaults to light, the green accent, and does not add the dark class", () => {
      renderProbe();
      expect(state()).toBe(`light|light|${DEFAULT_ACCENT}`);
      expect(document.documentElement).not.toHaveClass("dark");
      expect(document.documentElement.dataset.accent).toBe("green");
    });

    it("toggles the dark class on <html> and persists the choice", async () => {
      const user = userEvent.setup();
      renderProbe();
      await user.click(screen.getByRole("button", { name: "toggle" }));

      expect(state()).toBe("dark|dark|green");
      expect(document.documentElement).toHaveClass("dark");
      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    });

    it("restores a stored mode on load", () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
      renderProbe();
      expect(state()).toBe("dark|dark|green");
      expect(document.documentElement).toHaveClass("dark");
    });

    it("ignores an unknown stored mode", () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, "purple");
      renderProbe();
      expect(state()).toBe("light|light|green");
    });
  });

  describe("system mode", () => {
    it("follows the operating system setting", async () => {
      const user = userEvent.setup();
      setSystemPrefersDark(true);
      renderProbe();
      await user.click(screen.getByRole("button", { name: "system" }));

      expect(state()).toBe("system|dark|green");
      expect(document.documentElement).toHaveClass("dark");
      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
    });

    it("updates live when the operating system switches", async () => {
      const user = userEvent.setup();
      renderProbe();
      await user.click(screen.getByRole("button", { name: "system" }));
      expect(state()).toBe("system|light|green");

      act(() => setSystemPrefersDark(true));
      expect(state()).toBe("system|dark|green");
      expect(document.documentElement).toHaveClass("dark");

      act(() => setSystemPrefersDark(false));
      expect(state()).toBe("system|light|green");
      expect(document.documentElement).not.toHaveClass("dark");
    });

    it("ignores operating system changes when a mode is chosen explicitly", async () => {
      const user = userEvent.setup();
      renderProbe();
      await user.click(screen.getByRole("button", { name: "dark" }));
      act(() => setSystemPrefersDark(false));
      expect(state()).toBe("dark|dark|green");
    });

    it("toggle flips what is currently shown, even from system mode", async () => {
      const user = userEvent.setup();
      setSystemPrefersDark(true);
      renderProbe();
      await user.click(screen.getByRole("button", { name: "system" }));
      await user.click(screen.getByRole("button", { name: "toggle" }));
      expect(state()).toBe("light|light|green");
    });
  });

  describe("accent", () => {
    it("applies the accent to <html> and persists it", async () => {
      const user = userEvent.setup();
      renderProbe();
      await user.click(screen.getByRole("button", { name: "blue" }));

      expect(state()).toBe("light|light|blue");
      expect(document.documentElement.dataset.accent).toBe("blue");
      expect(window.localStorage.getItem(ACCENT_STORAGE_KEY)).toBe("blue");
    });

    it("restores a stored accent on load", () => {
      window.localStorage.setItem(ACCENT_STORAGE_KEY, "orange");
      renderProbe();
      expect(state()).toBe("light|light|orange");
      expect(document.documentElement.dataset.accent).toBe("orange");
    });

    it("falls back to green for an unknown stored accent", () => {
      window.localStorage.setItem(ACCENT_STORAGE_KEY, "chartreuse");
      renderProbe();
      expect(state()).toBe("light|light|green");
    });

    it("keeps the accent when the mode changes", async () => {
      const user = userEvent.setup();
      renderProbe();
      await user.click(screen.getByRole("button", { name: "blue" }));
      await user.click(screen.getByRole("button", { name: "dark" }));
      expect(state()).toBe("dark|dark|blue");
    });
  });

  it("throws a helpful error when used outside the provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow("useTheme must be used inside <ThemeProvider>");
    spy.mockRestore();
  });
});
