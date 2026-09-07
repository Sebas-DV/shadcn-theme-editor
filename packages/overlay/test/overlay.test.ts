/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_STORAGE_KEY, ThemeEditorOverlay, mount } from "../src/index";

describe("ThemeEditorOverlay persistence and safety", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.NODE_ENV = "test";
    localStorage.clear();
    document.body.innerHTML = "";
    globalThis.fetch = () =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            ok: true,
            model: { tokens: [] },
            file: { path: "/app/src/globals.css", relativePath: "src/globals.css" },
          }),
      } as any);
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    globalThis.fetch = originalFetch;
    localStorage.clear();
    document.body.innerHTML = "";
  });

  it("exports the default storage key", () => {
    expect(DEFAULT_STORAGE_KEY).toBe("shadcn-theme-editor:minimized");
  });

  it("mount() strictly aborts and renders nothing in production", () => {
    process.env.NODE_ENV = "production";
    const handle = mount({ autoOpen: true });
    expect(document.getElementById("shadcn-theme-editor-root")).toBeNull();
    expect(typeof handle.destroy).toBe("function");
    handle.destroy();
  });

  it("starts minimized by default if autoOpen is false and no stored preference", () => {
    const host = document.createElement("div");
    const shadow = host.attachShadow({ mode: "open" });
    const overlay = new ThemeEditorOverlay(shadow, { autoOpen: false });

    expect(overlay.isMinimized()).toBe(true);
    expect(shadow.querySelector(".te-launcher")).not.toBeNull();
    expect(shadow.querySelector(".te-panel")).toBeNull();
  });

  it("persists minimized = true when minimize() is called", () => {
    const host = document.createElement("div");
    const shadow = host.attachShadow({ mode: "open" });
    const overlay = new ThemeEditorOverlay(shadow, { autoOpen: true });

    overlay.minimize();
    expect(overlay.isMinimized()).toBe(true);
    expect(localStorage.getItem(DEFAULT_STORAGE_KEY)).toBe("true");
    expect(shadow.querySelector(".te-launcher")).not.toBeNull();
  });

  it("persists minimized = false when open() is called", async () => {
    const host = document.createElement("div");
    const shadow = host.attachShadow({ mode: "open" });
    const overlay = new ThemeEditorOverlay(shadow, { autoOpen: false });

    await overlay.open();
    expect(overlay.isMinimized()).toBe(false);
    expect(localStorage.getItem(DEFAULT_STORAGE_KEY)).toBe("false");
    expect(shadow.querySelector(".te-panel")).not.toBeNull();
  });

  it("maintains minimized state on reload even if autoOpen: true is configured", () => {
    // User left it minimized previously:
    localStorage.setItem(DEFAULT_STORAGE_KEY, "true");

    const host = document.createElement("div");
    const shadow = host.attachShadow({ mode: "open" });
    // Host page loads with autoOpen: true
    const overlay = new ThemeEditorOverlay(shadow, { autoOpen: true });

    // Must still stay minimized!
    expect(overlay.isMinimized()).toBe(true);
    expect(shadow.querySelector(".te-launcher")).not.toBeNull();
    expect(shadow.querySelector(".te-panel")).toBeNull();
  });

  it("maintains open state on reload if user previously opened it", () => {
    localStorage.setItem(DEFAULT_STORAGE_KEY, "false");

    const host = document.createElement("div");
    const shadow = host.attachShadow({ mode: "open" });
    const overlay = new ThemeEditorOverlay(shadow, { autoOpen: false });

    expect(overlay.isMinimized()).toBe(false);
    expect(shadow.querySelector(".te-panel")).not.toBeNull();
  });

  it("ignores localStorage when persistState is false", () => {
    localStorage.setItem(DEFAULT_STORAGE_KEY, "true");

    const host = document.createElement("div");
    const shadow = host.attachShadow({ mode: "open" });
    const overlay = new ThemeEditorOverlay(shadow, {
      autoOpen: true,
      persistState: false,
    });

    // Since persistState is false, it respects autoOpen: true
    expect(overlay.isMinimized()).toBe(false);
  });
});
