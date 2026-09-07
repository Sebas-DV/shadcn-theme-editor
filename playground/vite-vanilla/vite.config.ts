import { defineConfig } from "vite";
import { shadcnThemeEditor } from "@sebas-dv/shadcn-theme-editor-vite";

export default defineConfig({
  plugins: [shadcnThemeEditor({ autoOpen: true })],
});
