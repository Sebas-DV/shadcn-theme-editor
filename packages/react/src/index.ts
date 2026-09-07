import { useEffect } from "react";
import type { OverlayOptions } from "@sebas-dv/shadcn-theme-editor-overlay";

// Avoid pulling @types/node into this browser package just for NODE_ENV.
declare const process: { env?: Record<string, string | undefined> } | undefined;

export interface ThemeEditorProps extends OverlayOptions {
  // Defaults to on only outside production, so it's a no-op in prod builds.
  enabled?: boolean;
}

// Drop-in overlay mount for React/Next.js. Renders nothing; lazily imports and
// mounts the overlay on the client, tearing it down on unmount.
//   <ThemeEditor apiBase="http://localhost:7433" />
export function ThemeEditor({ enabled, ...options }: ThemeEditorProps = {}): null {
  const isProduction =
    typeof process !== "undefined" && process?.env?.NODE_ENV === "production";

  if (isProduction) {
    return null;
  }

  const apiBase = options.apiBase;
  const basePath = options.basePath;
  const autoOpen = options.autoOpen;
  const persistState = options.persistState;

  useEffect(() => {
    if (enabled === false) return;

    let cancelled = false;
    let handle: { destroy(): void } | undefined;

    void import("@sebas-dv/shadcn-theme-editor-overlay").then((mod) => {
      if (cancelled) return;
      handle = mod.mount({ apiBase, basePath, autoOpen, persistState });
    });

    return () => {
      cancelled = true;
      handle?.destroy();
    };
  }, [enabled, apiBase, basePath, autoOpen, persistState]);

  return null;
}

export default ThemeEditor;
