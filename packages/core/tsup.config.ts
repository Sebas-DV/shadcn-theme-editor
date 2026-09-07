import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/browser.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false, // readable output — never let the dist look "obfuscated"
  target: "es2022",
  external: ["node:fs", "node:fs/promises", "node:path"],
  // Bundle culori in (browser-safe, pure JS) so consumers don't inherit it and
  // its "obfuscated" flag disappears. postcss/tinyglobby stay external — they
  // use dynamic require() that breaks when inlined into ESM.
  noExternal: ["culori"],
});
