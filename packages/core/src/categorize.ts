import { isColorValue } from "./color";
import type { TokenCategory } from "./types";

// Lets us classify color tokens whose value is a var() reference (the value
// alone can't tell us), e.g. inside `@theme inline`.
const SHADCN_COLOR_NAMES = new Set<string>([
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
]);

// Prefix checks run before the value-based color check so that, e.g.,
// `--shadow-color` stays a shadow rather than a color.
export function categorize(name: string, value: string): TokenCategory {
  const n = name.toLowerCase().replace(/^--/, "");

  if (n === "radius" || n.startsWith("radius-")) return "radius";
  if (n === "tracking" || n.startsWith("tracking-")) return "tracking";
  if (n === "font" || n.startsWith("font-") || n.includes("font-family")) {
    return "font";
  }
  if (n === "shadow" || n.startsWith("shadow-")) return "shadow";
  if (n === "spacing" || n.startsWith("spacing-")) return "spacing";
  if (n.startsWith("color-")) return "color";

  if (isColorValue(value)) return "color";
  if (SHADCN_COLOR_NAMES.has(n)) return "color";
  return "other";
}

export { SHADCN_COLOR_NAMES };
