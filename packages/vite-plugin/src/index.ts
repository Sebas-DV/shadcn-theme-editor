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

// Mounts the scan/apply API on the dev server and injects the overlay — via
// index.html for SPAs, or the `virtual:shadcn-theme-editor` module for SSR apps.
export function shadcnThemeEditor(options: ThemeEditorPluginOptions = {}): Plugin {
  const basePath = options.basePath ?? DEFAULT_BASE_PATH;
  const inject = options.inject ?? true;
  const overlayScriptPath = resolveOverlayScript();

  let isDev = false;
  let server: ViteDevServer | undefined;

  const getApiBase = (): string => {
    const url = server?.resolvedUrls?.local?.[0];
    return url ? url.replace(/\/+$/, "") : "";
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
      return undefined;
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return undefined;
      if (!isDev || process.env.NODE_ENV === "production") return "export {};"; // no-op in production builds
      const opts = {
        apiBase: getApiBase(),
        basePath,
        autoOpen: options.autoOpen ?? false,
        persistState: options.persistState ?? true,
      };
      return [
        `import { mount } from "@sebas-dv/shadcn-theme-editor-overlay";`,
        `mount(${JSON.stringify(opts)});`,
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
