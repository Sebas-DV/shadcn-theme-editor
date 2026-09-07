# @sebas-dv/shadcn-theme-editor-vite

[![npm](https://img.shields.io/npm/v/@sebas-dv/shadcn-theme-editor-vite?style=flat-square&color=black&logo=npm)](https://www.npmjs.com/package/@sebas-dv/shadcn-theme-editor-vite)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](https://github.com/Sebas-DV/shadcn-theme-editor/blob/main/LICENSE)

Official Vite plugin for the live **shadcn Theme Editor**.

Covers **Vite (Vanilla, React, Vue, Svelte)**, **Laravel + Inertia**, **TanStack Start**, **Astro**, **Remix**, and **SvelteKit**.

---

## Installation

```bash
pnpm add -D @sebas-dv/shadcn-theme-editor-vite
# or: npm i -D @sebas-dv/shadcn-theme-editor-vite
```

---

## Setup

### 1. Plain Vite Apps

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { shadcnThemeEditor } from "@sebas-dv/shadcn-theme-editor-vite";

export default defineConfig({
  plugins: [shadcnThemeEditor()],
});
```

Projects with an `index.html` have the overlay script injected automatically.

### 2. Laravel + Inertia

```ts
// vite.config.ts
import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import { shadcnThemeEditor } from "@sebas-dv/shadcn-theme-editor-vite";

export default defineConfig({
  plugins: [laravel(["resources/js/app.tsx"]), shadcnThemeEditor()],
});
```

```tsx
// resources/js/app.tsx
import "virtual:shadcn-theme-editor"; // Mounts in dev; no-op in production
```

---

## Options

| Option         | Type      | Default               | Description                                        |
| -------------- | --------- | --------------------- | -------------------------------------------------- |
| `cssPath`      | `string`  | _auto-detected_       | Custom path to the theme CSS file.                 |
| `basePath`     | `string`  | `"/__theme-editor__"` | API mount prefix.                                  |
| `autoOpen`     | `boolean` | `false`               | Open panel instead of launcher button.             |
| `persistState` | `boolean` | `true`                | Preserve minimized state across page reloads.      |
| `backup`       | `boolean` | `false`               | Write a `.bak` backup copy before writing changes. |
| `inject`       | `boolean` | `true`                | Auto-inject overlay script into `index.html`.      |

---

## Security

The plugin uses `apply: "serve"` and strictly disables all middleware and scripts during production builds (`NODE_ENV === "production"`), ensuring **zero overhead**.

---

## License

MIT © [Sebas-DV](https://github.com/Sebas-DV/shadcn-theme-editor)
