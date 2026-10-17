import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ACCENTS, DEFAULT_ACCENT, isAccentId } from "./accents";

// Read the stylesheet from disk: Vitest runs with CSS processing off, so importing it would give nothing.
const tokensCss = readFileSync(resolve(process.cwd(), "src/styles/tokens.css"), "utf8");

/** The declarations inside the first rule whose selector matches `selector` exactly. */
function ruleBody(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = tokensCss.match(new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`));
  if (!match) throw new Error(`No CSS rule found for ${selector}`);
  return match[1];
}

const declaration = (body: string, property: string) =>
  body.match(new RegExp(`${property}:\\s*([^;]+);`))?.[1].trim();

/** Relative luminance, per WCAG, for #rrggbb colours. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe("accents", () => {
  it("offers exactly five accent colours with unique ids and swatches", () => {
    expect(ACCENTS).toHaveLength(5);
    expect(new Set(ACCENTS.map((accent) => accent.id)).size).toBe(5);
    expect(new Set(ACCENTS.map((accent) => accent.swatch)).size).toBe(5);
  });

  it("defaults to green, the original brand colour", () => {
    expect(DEFAULT_ACCENT).toBe("green");
    expect(ACCENTS[0]).toMatchObject({ id: "green", swatch: "#10b981" });
  });

  it("recognises valid ids only", () => {
    expect(isAccentId("blue")).toBe(true);
    expect(isAccentId("chartreuse")).toBe(false);
    expect(isAccentId(null)).toBe(false);
  });

  describe("tokens.css stays in sync with the swatches", () => {
    it("defines the default accent on :root", () => {
      const green = ACCENTS.find((accent) => accent.id === DEFAULT_ACCENT)!;
      expect(declaration(ruleBody(":root"), "--accent")).toBe(green.swatch);
    });

    it.each(ACCENTS.filter((accent) => accent.id !== DEFAULT_ACCENT))(
      "defines the $id accent with its swatch colour",
      ({ id, swatch }) => {
        expect(declaration(ruleBody(`:root[data-accent="${id}"]`), "--accent")).toBe(swatch);
      },
    );
  });

  describe("dark mode keeps accent text readable", () => {
    const darkBackground = (): string => declaration(ruleBody(".dark"), "--surface")!;

    it("the default accent has a light text colour and a dark tint in dark mode", () => {
      const dark = ruleBody(".dark");
      expect(declaration(dark, "--accent-dark")).toBeDefined();
      expect(declaration(dark, "--accent-soft")).toBeDefined();
    });

    it("green: accent text on its tint and on the surface has enough contrast", () => {
      const dark = ruleBody(".dark");
      const text = declaration(dark, "--accent-dark")!;
      expect(contrast(text, declaration(dark, "--accent-soft")!)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(text, darkBackground())).toBeGreaterThanOrEqual(4.5);
    });

    it.each(ACCENTS.filter((accent) => accent.id !== DEFAULT_ACCENT))(
      "$id: overrides the text colour and tint for dark mode with enough contrast",
      ({ id }) => {
        const dark = ruleBody(`:root[data-accent="${id}"].dark`);
        const text = declaration(dark, "--accent-dark");
        const tint = declaration(dark, "--accent-soft");
        expect(text, "dark --accent-dark").toBeDefined();
        expect(tint, "dark --accent-soft").toBeDefined();
        expect(contrast(text!, tint!)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(text!, darkBackground())).toBeGreaterThanOrEqual(4.5);
      },
    );

    it.each(ACCENTS.filter((accent) => accent.id !== DEFAULT_ACCENT))(
      "$id: its light-mode text colour is dark enough on white",
      ({ id }) => {
        const text = declaration(ruleBody(`:root[data-accent="${id}"]`), "--accent-dark")!;
        expect(contrast(text, "#ffffff")).toBeGreaterThanOrEqual(4.5);
      },
    );
  });
});
