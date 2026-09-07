import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  applyChanges,
  detectCssFiles,
  parseTheme,
  type DetectedCssFile,
  type ThemeModel,
  type TokenChange,
} from "@sebas-dv/shadcn-theme-editor-core";

export interface ThemeServiceOptions {
  root?: string; // defaults to process.cwd()
  cssPath?: string; // force a theme file (absolute or relative to root)
  backup?: boolean; // write a .bak before overwriting
}

export interface FileRef {
  path: string;
  relativePath: string;
}

export interface ScanResult {
  file: FileRef | null;
  candidates: DetectedCssFile[];
  model: ThemeModel | null;
  css: string | null;
}

export interface ApplyInput {
  changes: TokenChange[];
  path?: string;
}

export interface ApplyResult {
  file: FileRef;
  applied: string[];
  missing: TokenChange[];
  wrote: boolean;
}

export interface ThemeService {
  readonly root: string;
  scan(explicitPath?: string): Promise<ScanResult>;
  apply(input: ApplyInput): Promise<ApplyResult>;
}

function assertNotProduction(action: string): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `[shadcn-theme-editor] Security error: Cannot ${action} in production. shadcn-theme-editor is strictly a development tool and cannot run when NODE_ENV=production.`,
    );
  }
}

// The transport-agnostic core: locate, scan and rewrite the theme file. File
// access is confined to `.css` files inside the project root.
export function createThemeService(options: ThemeServiceOptions = {}): ThemeService {
  const root = path.resolve(options.root ?? process.cwd());

  const toRelative = (abs: string): string =>
    path.relative(root, abs).split(path.sep).join("/");

  const resolveInRoot = (candidate: string): string => {
    const abs = path.isAbsolute(candidate) ? candidate : path.resolve(root, candidate);
    const rel = path.relative(root, abs);
    if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) {
      throw new Error(`Path escapes the project root: ${candidate}`);
    }
    if (!abs.toLowerCase().endsWith(".css")) {
      throw new Error(`Refusing to touch a non-CSS file: ${candidate}`);
    }
    return abs;
  };

  const pickFile = async (
    explicit?: string,
  ): Promise<{ abs: string | null; candidates: DetectedCssFile[] }> => {
    const candidates = await detectCssFiles(root);
    const chosen = explicit ?? options.cssPath;
    if (chosen) return { abs: resolveInRoot(chosen), candidates };
    const best = candidates[0];
    return { abs: best ? best.path : null, candidates };
  };

  return {
    root,

    async scan(explicitPath) {
      assertNotProduction("scan theme tokens");
      const { abs, candidates } = await pickFile(explicitPath);
      if (!abs) return { file: null, candidates, model: null, css: null };
      const css = await readFile(abs, "utf8");
      return {
        file: { path: abs, relativePath: toRelative(abs) },
        candidates,
        model: parseTheme(css),
        css,
      };
    },

    async apply({ changes, path: explicitPath }) {
      assertNotProduction("apply theme changes");
      const { abs } = await pickFile(explicitPath);
      if (!abs) throw new Error("No theme CSS file found to write to.");
      const current = await readFile(abs, "utf8");
      const { css: next, applied, missing } = applyChanges(current, changes);
      const wrote = applied.length > 0 && next !== current;
      if (wrote) {
        if (options.backup) await writeFile(`${abs}.bak`, current, "utf8");
        await writeFile(abs, next, "utf8");
      }
      return {
        file: { path: abs, relativePath: toRelative(abs) },
        applied,
        missing,
        wrote,
      };
    },
  };
}
