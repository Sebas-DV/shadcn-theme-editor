import { ThemeEditorOverlay, type OverlayOptions } from "./overlay";

export interface MountHandle {
  destroy(): void;
}

const CONTAINER_ID = "shadcn-theme-editor-root";

declare const process: { env?: Record<string, string | undefined> } | undefined;

// Inject the overlay into an isolated Shadow Root. Idempotent (replaces a prior
// instance); no-op outside the browser. Strictly disabled in production.
export function mount(options: OverlayOptions = {}): MountHandle {
  if (typeof process !== "undefined" && process?.env?.NODE_ENV === "production") {
    if (typeof console !== "undefined" && console.warn) {
      console.warn(
        "[shadcn-theme-editor] Execution blocked: Theme editor overlay cannot run in production (NODE_ENV=production).",
      );
    }
    return { destroy() {} };
  }

  if (typeof document === "undefined") {
    return { destroy() {} };
  }

  document.getElementById(CONTAINER_ID)?.remove();

  const host = document.createElement("div");
  host.id = CONTAINER_ID;
  (document.body ?? document.documentElement).appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  const overlay = new ThemeEditorOverlay(shadow, options);

  return {
    destroy() {
      overlay.destroy();
      host.remove();
    },
  };
}

export type { OverlayOptions };
