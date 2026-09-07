import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseTheme } from "../src/parse";

const here = path.dirname(fileURLToPath(import.meta.url));
const css = readFileSync(path.join(here, "fixtures/globals.v4.css"), "utf8");

describe("parseTheme", () => {
  const model = parseTheme(css);

  it("detects dark mode", () => {
    expect(model.hasDarkMode).toBe(true);
    expect(model.tailwindVersion).toBe(4);
  });

  it("collects tokens from :root, .dark and @theme", () => {
    const scopes = new Set(model.tokens.map((t) => t.scope));
    expect(scopes).toEqual(new Set(["root", "dark", "theme"]));
  });

  it("classifies a color token with resolved value and format", () => {
    const primary = model.tokens.find(
      (t) => t.name === "--primary" && t.scope === "root",
    );
    expect(primary).toBeDefined();
    expect(primary?.category).toBe("color");
    expect(primary?.colorFormat).toBe("oklch");
    expect(primary?.resolvedColor).toMatch(/^oklch\(/);
    expect(primary?.isReference).toBe(false);
  });

  it("classifies radius, font and shadow tokens", () => {
    const radius = model.tokens.find((t) => t.name === "--radius");
    const font = model.tokens.find(
      (t) => t.name === "--font-sans" && t.scope === "root",
    );
    const shadow = model.tokens.find((t) => t.name === "--shadow-sm");
    expect(radius?.category).toBe("radius");
    expect(font?.category).toBe("font");
    expect(shadow?.category).toBe("shadow");
  });

  it("marks @theme aliases as references", () => {
    const alias = model.tokens.find(
      (t) => t.name === "--color-primary" && t.scope === "theme",
    );
    expect(alias?.isReference).toBe(true);
    expect(alias?.category).toBe("color");
  });

  it("parses alpha oklch in dark mode", () => {
    const border = model.tokens.find(
      (t) => t.name === "--border" && t.scope === "dark",
    );
    expect(border?.category).toBe("color");
    expect(border?.rawValue).toBe("oklch(1 0 0 / 10%)");
  });
});
