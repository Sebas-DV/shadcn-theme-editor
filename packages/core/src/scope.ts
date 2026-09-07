import type { TokenScope } from "./types";

// Map a rule selector to a theme scope. `:root` → root, anything mentioning
// `.dark` or `[data-theme=dark]` → dark. Returns undefined for other selectors.
export function matchScope(selector: string): TokenScope | undefined {
  const s = selector.trim().toLowerCase();
  if (s === ":root") return "root";
  if (s === ".dark" || s.includes(".dark")) return "dark";
  if (s.includes('[data-theme="dark"]') || s.includes("[data-theme=dark]")) {
    return "dark";
  }
  if (s.startsWith(":root")) return "root";
  return undefined;
}
