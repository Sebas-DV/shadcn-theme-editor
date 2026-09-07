import { readFile } from "node:fs/promises";
import path from "node:path";
import { glob } from "tinyglobby";
import type { DetectedCssFile } from "./types";

const IGNORE = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/.next/**",
  "**/.nuxt/**",
  "**/.output/**",
  "**/.svelte-kit/**",
  "**/.turbo/**",
  "**/vendor/**",
  "**/public/build/**",
  "**/coverage/**",
];

const SIGNAL_TOKENS = [
  "--background",
  "--foreground",
  "--primary",
  "--secondary",
  "--muted",
  "--accent",
  "--destructive",
  "--border",
  "--input",
  "--ring",
  "--radius",
  "--card",
  "--popover",
  "--sidebar",
];

interface CssScore {
  score: number;
  tokenCount: number;
  isTailwindV4: boolean;
}

function scoreCss(css: string, relativePath: string): CssScore {
  let tokenCount = 0;
  for (const token of SIGNAL_TOKENS) {
    if (css.includes(`${token}:`)) tokenCount += 1;
  }

  const isTailwindV4 =
    /@import\s+["']tailwindcss["']/.test(css) ||
    /@theme\b/.test(css) ||
    /@custom-variant\b/.test(css);

  const hasRoot = /:root\b/.test(css);
  const hasDark = /\.dark\b/.test(css);

  let score = tokenCount * 10;
  if (isTailwindV4) score += 25;
  if (hasRoot) score += 5;
  if (hasDark) score += 5;

  // Prefer conventional locations; lightly penalise deep nesting.
  const p = relativePath.toLowerCase();
  if (/(^|\/)(app|resources|src)\//.test(p)) score += 4;
  if (/globals?\.css$|app\.css$|index\.css$|main\.css$/.test(p)) score += 6;
  score -= Math.max(0, p.split("/").length - 3);

  return { score, tokenCount, isTailwindV4 };
}

export interface DetectOptions {
  ignore?: string[];
  requireTokens?: boolean; // default true
}

// Content-based, so it works for any framework: scan every .css and rank by a
// heuristic score, most likely theme file first.
export async function detectCssFiles(
  root: string,
  options: DetectOptions = {},
): Promise<DetectedCssFile[]> {
  const { ignore = [], requireTokens = true } = options;

  const files = await glob(["**/*.css"], {
    cwd: root,
    ignore: [...IGNORE, ...ignore],
    absolute: true,
    dot: false,
  });

  const results: DetectedCssFile[] = [];

  for (const abs of files) {
    let css: string;
    try {
      css = await readFile(abs, "utf8");
    } catch {
      continue;
    }
    const relativePath = path.relative(root, abs).split(path.sep).join("/");
    const { score, tokenCount, isTailwindV4 } = scoreCss(css, relativePath);

    if (requireTokens && tokenCount === 0 && !isTailwindV4) continue;

    results.push({ path: abs, relativePath, score, tokenCount, isTailwindV4 });
  }

  results.sort(
    (a, b) => b.score - a.score || a.relativePath.length - b.relativePath.length,
  );
  return results;
}

export async function detectThemeFile(
  root: string,
  options?: DetectOptions,
): Promise<DetectedCssFile | undefined> {
  const [best] = await detectCssFiles(root, options);
  return best;
}
