import { createRequire } from "node:module";
import type { Plugin, ViteDevServer } from "vite";
import {
  createThemeEditorMiddleware,
  DEFAULT_BASE_PATH,
} from "@sebas-dv/shadcn-theme-editor-server";

const require = createRequire(import.meta.url);

const VIRTUAL_ID = "virtual:shadcn-theme-editor";
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

export interface ThemeEditorPluginOptions {
  root?: string; // defaults to Vite's resolved root
  cssPath?: string;
  basePath?: string; // default /__theme-editor__
  apiBase?: string; // custom API origin (e.g. https://kuma.test:5173 or http://localhost:5173)
  autoOpen?: boolean;
  persistState?: boolean;
  backup?: boolean;
  // Auto-inject into index.html (default true). Server-rendered stacks have no
  // index.html — import `virtual:shadcn-theme-editor` from your JS entry instead.
  inject?: boolean;
}

function resolveOverlayScript(): string | undefined {
  try {
    return require.resolve("@sebas-dv/shadcn-theme-editor-overlay/global");
  } catch {
    return undefined;
  }
}

function resolveOverlayPackage(): string | undefined {
  try {
    const cjs = require.resolve("@sebas-dv/shadcn-theme-editor-overlay");
    const esm = cjs.replace(/index\.cjs$/, "index.js");
    return esm;
  } catch {
    return undefined;
  }
}

// Mounts the scan/apply API on the dev server and injects the overlay — via
// index.html for SPAs, or the `virtual:shadcn-theme-editor` module for SSR apps.
export function shadcnThemeEditor(options: ThemeEditorPluginOptions = {}): Plugin {
  const basePath = options.basePath ?? DEFAULT_BASE_PATH;
  const inject = options.inject ?? true;
  const overlayScriptPath = resolveOverlayScript();

  let isDev = false;
  let server: ViteDevServer | undefined;

  const getApiBase = (): string => {
    if (options.apiBase) return options.apiBase.replace(/\/+$/, "");
    const urls = [
      ...(server?.resolvedUrls?.local ?? []),
      ...(server?.resolvedUrls?.network ?? []),
    ];
    // Avoid fake wildcard replacement hosts like vite.domain.test on Windows
    const bestUrl = urls.find((u) => !u.includes("://vite.")) ?? urls[0];
    return bestUrl ? bestUrl.replace(/\/+$/, "") : "";
  };

  return {
    name: "shadcn-theme-editor",
    apply: "serve",

    configResolved(config) {
      isDev =
        config.command === "serve" &&
        config.mode !== "production" &&
        process.env.NODE_ENV !== "production";
    },

    configureServer(dev) {
      server = dev;
      if (
        !isDev ||
        dev.config.mode === "production" ||
        process.env.NODE_ENV === "production"
      ) {
        return;
      }

      dev.middlewares.use(
        createThemeEditorMiddleware({
          root: options.root ?? dev.config.root,
          cssPath: options.cssPath,
          basePath,
          backup: options.backup,
          cors: true,
          overlayScriptPath,
        }),
      );
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
      if (id === "@sebas-dv/shadcn-theme-editor-overlay") {
        return resolveOverlayPackage();
      }
      return undefined;
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return undefined;
      if (!isDev || process.env.NODE_ENV === "production") return "export {};"; // no-op in production builds
      const serverBase = getApiBase();
      const opts = {
        basePath,
        autoOpen: options.autoOpen ?? false,
        persistState: options.persistState ?? true,
      };
      return [
        `import { mount } from "@sebas-dv/shadcn-theme-editor-overlay";`,
        `const detectedOrigin = (typeof import.meta !== "undefined" && import.meta.url && !import.meta.url.startsWith("blob:") && !import.meta.url.startsWith("data:")) ? new URL(import.meta.url).origin : "";`,
        `const apiBase = ${options.apiBase ? JSON.stringify(options.apiBase) : `(detectedOrigin || ${JSON.stringify(serverBase)})`};`,
        `const opts = ${JSON.stringify(opts)};`,
        `opts.apiBase = apiBase;`,
        `mount(opts);`,
        `export {};`,
      ].join("\n");
    },

    transformIndexHtml() {
      if (!isDev || !inject || process.env.NODE_ENV === "production") return undefined;
      const apiBase = getApiBase();
      const attrs: Record<string, string | boolean> = {
        src: `${apiBase}${basePath}/overlay.js`,
        "data-base-path": basePath,
      };
      if (apiBase) attrs["data-api-base"] = apiBase;
      if (options.autoOpen) attrs["data-auto-open"] = "true";
      if (options.persistState !== undefined) {
        attrs["data-persist-state"] = String(options.persistState);
      }
      return [{ tag: "script", attrs, injectTo: "body" }];
    },
  };
}

export default shadcnThemeEditor;
export { mount } from "@sebas-dv/shadcn-theme-editor-overlay";
export type { OverlayOptions } from "@sebas-dv/shadcn-theme-editor-overlay";
