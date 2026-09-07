// Which CSS block a token lives in: `:root`, `.dark`, or `@theme inline`.
export type TokenScope = "root" | "dark" | "theme";

export type TokenCategory =
  "color" | "radius" | "font" | "shadow" | "spacing" | "tracking" | "other";

export type ColorFormat = "oklch" | "hsl" | "rgb" | "hex" | "named" | "unknown";

export interface ThemeToken {
  name: string; // includes the leading `--`
  scope: TokenScope;
  rawValue: string; // verbatim, as written in the file
  category: TokenCategory;
  colorFormat?: ColorFormat;
  resolvedColor?: string; // a renderable color string, when the value is a literal color
  isReference: boolean; // true for var()/calc() values
}

export interface ThemeModel {
  tailwindVersion: 4;
  tokens: ThemeToken[];
  hasDarkMode: boolean;
}

export interface TokenChange {
  name: string;
  scope: TokenScope;
  value: string;
}

export interface DetectedCssFile {
  path: string;
  relativePath: string; // POSIX separators
  score: number; // higher = more likely the theme file
  tokenCount: number;
  isTailwindV4: boolean;
}
