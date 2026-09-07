import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createThemeService } from "../src/service";

const FIXTURE = `@import "tailwindcss";
@custom-variant dark (&:is(.dark *));

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --primary: oklch(0.205 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --primary: oklch(0.922 0 0);
}
`;

let root: string;

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), "theme-editor-"));
  await mkdir(path.join(root, "src", "styles"), { recursive: true });
  await writeFile(path.join(root, "src", "styles", "globals.css"), FIXTURE, "utf8");
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("createThemeService", () => {
  it("scans and finds the theme file with a parsed model", async () => {
    const service = createThemeService({ root });
    const result = await service.scan();
    expect(result.file?.relativePath).toBe("src/styles/globals.css");
    expect(result.model?.hasDarkMode).toBe(true);
    expect(result.model?.tokens.some((t) => t.name === "--primary")).toBe(true);
  });

  it("applies changes and writes them to disk", async () => {
    const service = createThemeService({ root });
    const result = await service.apply({
      changes: [{ scope: "root", name: "--primary", value: "oklch(0.5 0.2 250)" }],
    });
    expect(result.wrote).toBe(true);
    expect(result.applied).toEqual(["root::--primary"]);

    const onDisk = await readFile(
      path.join(root, "src", "styles", "globals.css"),
      "utf8",
    );
    expect(onDisk).toContain("--primary: oklch(0.5 0.2 250);");
    // dark scope untouched
    expect(onDisk).toContain("--primary: oklch(0.922 0 0);");
  });

  it("writes a backup when requested", async () => {
    const service = createThemeService({ root, backup: true });
    await service.apply({
      changes: [{ scope: "dark", name: "--background", value: "oklch(0.1 0 0)" }],
    });
    const backup = await readFile(
      path.join(root, "src", "styles", "globals.css.bak"),
      "utf8",
    );
    expect(backup).toBe(FIXTURE);
  });

  it("rejects paths outside the project root", async () => {
    const service = createThemeService({ root });
    await expect(service.scan("../../../etc/passwd.css")).rejects.toThrow(
      /escapes the project root/,
    );
  });

  it("rejects non-css targets", async () => {
    const service = createThemeService({ root });
    await expect(service.scan("src/styles/evil.js")).rejects.toThrow(/non-CSS file/);
  });
});
