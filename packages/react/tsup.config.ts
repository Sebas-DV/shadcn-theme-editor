import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  target: "es2020",
  external: ["react", "react-dom", "@sebas-dv/shadcn-theme-editor-overlay"],
  banner: { js: '"use client";' },
});
