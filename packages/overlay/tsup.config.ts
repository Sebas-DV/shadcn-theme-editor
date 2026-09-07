import { defineConfig } from "tsup";

const noExternal = [/@sebas-dv\/shadcn-theme-editor-core/, /culori/];

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    sourcemap: true,
    target: "es2020",
    platform: "browser",
    noExternal,
  },
  {
    entry: { "theme-editor": "src/auto.ts" },
    format: ["iife"],
    globalName: "ShadcnThemeEditor",
    dts: false,
    sourcemap: true,
    minify: false, // keep readable so scanners don't flag it as "obfuscated"
    target: "es2018",
    platform: "browser",
    noExternal,
  },
]);
