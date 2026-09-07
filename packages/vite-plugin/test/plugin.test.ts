import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { shadcnThemeEditor } from "../src/index";

describe("shadcnThemeEditor Vite plugin", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("has apply: 'serve' to never run during vite build", () => {
    const plugin = shadcnThemeEditor();
    expect(plugin.apply).toBe("serve");
    expect(plugin.name).toBe("shadcn-theme-editor");
  });

  it("resolves virtual:shadcn-theme-editor ID", () => {
    const plugin = shadcnThemeEditor();
    const resolveId = plugin.resolveId as (id: string) => string | undefined;
    expect(resolveId("virtual:shadcn-theme-editor")).toBe(
      "\0virtual:shadcn-theme-editor",
    );
    expect(resolveId("other-module")).toBeUndefined();
  });

  it("returns no-op in production mode or build", () => {
    process.env.NODE_ENV = "production";
    const plugin = shadcnThemeEditor();

    const configResolved = plugin.configResolved as (config: any) => void;
    configResolved({ command: "serve", mode: "production" });

    const load = plugin.load as (id: string) => string | undefined;
    expect(load("\0virtual:shadcn-theme-editor")).toBe("export {};");

    const transformIndexHtml = plugin.transformIndexHtml as any;
    expect(transformIndexHtml()).toBeUndefined();

    let middlewareUsed = false;
    const configureServer = plugin.configureServer as (server: any) => void;
    configureServer({
      config: { mode: "production", root: process.cwd() },
      middlewares: {
        use: () => {
          middlewareUsed = true;
        },
      },
    });
    expect(middlewareUsed).toBe(false);
  });

  it("injects script and registers middleware in dev mode", () => {
    process.env.NODE_ENV = "development";
    const plugin = shadcnThemeEditor({ basePath: "/custom-base" });

    const configResolved = plugin.configResolved as (config: any) => void;
    configResolved({ command: "serve", mode: "development" });

    let middlewareRegistered = false;
    const configureServer = plugin.configureServer as (server: any) => void;
    configureServer({
      config: { mode: "development", root: process.cwd() },
      resolvedUrls: { local: ["http://localhost:5173"] },
      middlewares: {
        use: () => {
          middlewareRegistered = true;
        },
      },
    });
    expect(middlewareRegistered).toBe(true);

    const load = plugin.load as (id: string) => string | undefined;
    const virtualCode = load("\0virtual:shadcn-theme-editor");
    expect(virtualCode).toContain("mount(");
    expect(virtualCode).toContain('"/custom-base"');

    const transformIndexHtml = plugin.transformIndexHtml as any;
    const tags = transformIndexHtml();
    expect(tags).toHaveLength(1);
    expect(tags[0].tag).toBe("script");
    expect(tags[0].attrs.src).toContain("/custom-base/overlay.js");
  });
});
