import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { applyChanges } from "../src/apply";

const here = path.dirname(fileURLToPath(import.meta.url));
const css = readFileSync(path.join(here, "fixtures/globals.v4.css"), "utf8");

describe("applyChanges", () => {
  it("updates only the targeted declaration and preserves everything else", () => {
    const {
      css: next,
      applied,
      missing,
    } = applyChanges(css, [
      { scope: "root", name: "--primary", value: "oklch(0.5 0.2 250)" },
    ]);

    expect(applied).toEqual(["root::--primary"]);
    expect(missing).toEqual([]);
    expect(next).toContain("--primary: oklch(0.5 0.2 250);");
    // Dark-mode --primary must be untouched.
    expect(next).toContain("--primary: oklch(0.922 0 0);");
    // Line count unchanged → no structural damage.
    expect(next.split("\n").length).toBe(css.split("\n").length);
  });

  it("scopes changes to the right block", () => {
    const { css: next } = applyChanges(css, [
      { scope: "dark", name: "--background", value: "oklch(0.1 0 0)" },
    ]);
    expect(next).toContain("--background: oklch(0.1 0 0);"); // dark updated
    expect(next).toContain("--background: oklch(1 0 0);"); // root intact
  });

  it("reports missing tokens without altering the file", () => {
    const {
      css: next,
      applied,
      missing,
    } = applyChanges(css, [
      { scope: "root", name: "--does-not-exist", value: "oklch(0 0 0)" },
    ]);
    expect(applied).toEqual([]);
    expect(missing).toHaveLength(1);
    expect(next).toBe(css);
  });

  it("is a no-op for an empty change set", () => {
    const { css: next } = applyChanges(css, []);
    expect(next).toBe(css);
  });

  it("preserves comments and @layer blocks", () => {
    const { css: next } = applyChanges(css, [
      { scope: "root", name: "--radius", value: "1rem" },
    ]);
    expect(next).toContain("--radius: 1rem;");
    expect(next).toContain("@apply border-border outline-ring/50;");
    expect(next).toContain("@custom-variant dark (&:is(.dark *));");
  });
});
