import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/browser.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  target: "es2022",
  // node:fs is only used by the node entry; keep it external so the browser
  // entry stays clean when bundled downstream.
  external: ["node:fs", "node:fs/promises", "node:path"],
});
