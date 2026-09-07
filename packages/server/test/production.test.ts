import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createThemeEditorApp } from "../src/app";
import { createThemeEditorMiddleware } from "../src/middleware";
import { startThemeEditorServer } from "../src/serve";
import { createThemeService } from "../src/service";

describe("Production safety guards", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = "production";
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("startThemeEditorServer rejects with security error in production", async () => {
    await expect(startThemeEditorServer()).rejects.toThrow(
      /Security error: Cannot start theme editor server in production/,
    );
  });

  it("createThemeEditorApp throws security error in production", () => {
    expect(() => createThemeEditorApp()).toThrow(
      /Security error: Cannot initialize theme editor app in production/,
    );
  });

  it("createThemeService.scan throws security error in production", async () => {
    const service = createThemeService();
    await expect(service.scan()).rejects.toThrow(
      /Security error: Cannot scan theme tokens in production/,
    );
  });

  it("createThemeService.apply throws security error in production", async () => {
    const service = createThemeService();
    await expect(
      service.apply({
        changes: [{ scope: "root", name: "--primary", value: "oklch(0.5 0.2 250)" }],
      }),
    ).rejects.toThrow(/Security error: Cannot apply theme changes in production/);
  });

  it("createThemeEditorMiddleware passes through to next() in production", () => {
    const middleware = createThemeEditorMiddleware();
    let nextCalled = false;
    const req = { url: "/__theme-editor__/api/health" } as any;
    const res = {} as any;
    middleware(req, res, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(true);
  });
});
