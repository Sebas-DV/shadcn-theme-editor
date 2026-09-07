import { mount, type OverlayOptions } from "./mount";

// Captured at initial synchronous execution, where currentScript is valid.
const thisScript =
  typeof document !== "undefined"
    ? (document.currentScript as HTMLScriptElement | null)
    : null;

declare global {
  interface Window {
    __SHADCN_THEME_EDITOR__?: OverlayOptions;
  }
}

declare const process: { env?: Record<string, string | undefined> } | undefined;

function readConfig(): OverlayOptions {
  const ds = thisScript?.dataset ?? {};
  const global = window.__SHADCN_THEME_EDITOR__ ?? {};
  return {
    apiBase: ds.apiBase ?? global.apiBase,
    basePath: ds.basePath ?? global.basePath,
    autoOpen:
      ds.autoOpen === "true" ? true : global.autoOpen === true ? true : undefined,
    persistState:
      ds.persistState !== undefined
        ? ds.persistState !== "false"
        : global.persistState !== undefined
          ? global.persistState
          : undefined,
  };
}

function start(): void {
  if (typeof process !== "undefined" && process?.env?.NODE_ENV === "production") {
    return;
  }
  mount(readConfig());
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}

export { mount };
