import { afterEach, beforeEach, describe, expect, it } from "vitest";
import DefaultThemeEditor, { ThemeEditor } from "../src/index";

describe("<ThemeEditor/> React component", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("exports named and default ThemeEditor", () => {
    expect(ThemeEditor).toBeDefined();
    expect(DefaultThemeEditor).toBe(ThemeEditor);
  });

  it("strictly returns null and avoids any hooks in production", () => {
    process.env.NODE_ENV = "production";
    const result = ThemeEditor({ enabled: true, autoOpen: true });
    expect(result).toBeNull();
  });

  it("strictly returns null in production even when called without arguments", () => {
    process.env.NODE_ENV = "production";
    const result = ThemeEditor();
    expect(result).toBeNull();
  });
});
