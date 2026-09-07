# shadcn Theme Editor

[![CI](https://img.shields.io/github/actions/workflow/status/Sebas-DV/shadcn-theme-editor/ci.yml?branch=main&label=CI&style=flat-square)](https://github.com/Sebas-DV/shadcn-theme-editor/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-38%20passed-5fd39a?style=flat-square&logo=vitest&logoColor=white)](https://github.com/Sebas-DV/shadcn-theme-editor/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@sebas-dv/shadcn-theme-editor?style=flat-square&color=black&logo=npm)](https://www.npmjs.com/package/@sebas-dv/shadcn-theme-editor)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-12-f69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

An in-app, Shadow-DOM **overlay** to edit your [shadcn/ui](https://ui.shadcn.com/) (Tailwind v4 / OKLCH) theme tokens live — colors, border radiuses, typography, shadows, and spacing — with real-time preview on your running application and a single **Apply** button that writes changes straight back to your source CSS.

Framework-agnostic by design: one Vite plugin covers **Vite (React/Vue/Svelte)**, **Laravel + Inertia**, **TanStack Start**, **Astro**, **Remix**, and **SvelteKit**; a `<ThemeEditor/>` drop-in React component plus companion CLI cover **Next.js (App & Pages Router)**.

---

> [!CAUTION]
>
> ### Strict Development-Only Tool & Hard Production Lockout
>
> Because this package includes a local companion server that directly parses and writes to your CSS source files, **it is strictly prohibited from running in production (`NODE_ENV=production`)**.
>
> Multi-layered barriers ensure execution is impossible in production:
>
> - **Companion Server & CLI**: Throw fatal security errors and terminate immediately if `NODE_ENV === "production"`.
> - **Vite Plugin**: Configured with `apply: "serve"`, completely skipped during `vite build`, and ignores middleware in production.
> - **React Component (`<ThemeEditor />`)**: Evaluates `NODE_ENV === "production"` and immediately returns `null` prior to hooks, enabling complete dead-code elimination (DCE) in production bundles with **zero runtime overhead**.
> - **Overlay UI**: Aborts initialization if executed in a production environment.

---

## Highlights

- 🎨 **OKLCH-Native Color Sliders**: Live L / C / H / α gradient tracks with gamut safety, hex/oklch inputs, and native picker.
- ♿ **Real-Time WCAG Contrast Validation**: Live AA/AAA contrast badges against `--background` and pair tokens.
- 💾 **State Persistence**: If minimized, the overlay **remembers its minimized state across page reloads, navigations, and Vite HMR refreshes**.
- ⚡ **Surgical CSS Writes**: PostCSS updates only edited declarations, preserving comments, ordering, and exact formatting.
- 🛡️ **Filesystem Sandboxing**: File read/write is strictly confined to `.css` files inside your project root (path traversal protected).
- 🌓 **Dark / Light Mode Toggle**: Switch between light and dark scopes live without altering overlay chrome.

---

## How It Works

```
┌─────────────────────────┐            ┌───────────────────────────┐            ┌────────────────────────┐
│  Overlay (Shadow DOM)   │ ──scan───▶ │ Companion Server (Hono)   │ ──reads──▶ │ Source Theme CSS       │
│  - Live CSS variables   │            │ - Confined to root .css   │            │ (Tailwind v4 tokens)   │
│  - State in localStorage│ ◀──JSON─── │ - Validates paths & env   │            │                        │
│                         │            │                           │            │                        │
│  [Apply Button Clicked] │ ──apply──▶ │ Companion Server (Hono)   │ ──PostCSS─▶│ Surgical AST rewrite   │
└─────────────────────────┘            └───────────────────────────┘            └────────────────────────┘
```

1. **Scan**: The companion server scans the project root, detects the shadcn theme CSS (e.g. `src/styles/globals.css`), and parses `@theme`, `:root`, and `.dark` variables.
2. **Preview**: Sliders and inputs mutate CSS custom properties on `:root` and `.dark` directly in memory for instant feedback.
3. **Apply**: Clicking **Apply** sends the changes to the companion server, which updates the exact lines in the source CSS file via PostCSS (with optional `.bak` backup).

---

## Packages

| Package                                                        | Role                                                                    | Status                                                                                                                                                              |
| -------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@sebas-dv/shadcn-theme-editor-core`](./packages/core)        | Pure token parser, categorizer, color math, and PostCSS AST rewriter    | [![npm](https://img.shields.io/npm/v/@sebas-dv/shadcn-theme-editor-core?style=flat-square)](https://www.npmjs.com/package/@sebas-dv/shadcn-theme-editor-core)       |
| [`@sebas-dv/shadcn-theme-editor-server`](./packages/server)    | Companion scan/apply API (Hono); Vite middleware + standalone server    | [![npm](https://img.shields.io/npm/v/@sebas-dv/shadcn-theme-editor-server?style=flat-square)](https://www.npmjs.com/package/@sebas-dv/shadcn-theme-editor-server)   |
| [`@sebas-dv/shadcn-theme-editor-overlay`](./packages/overlay)  | Zero-dependency Shadow-DOM live editor UI with localStorage persistence | [![npm](https://img.shields.io/npm/v/@sebas-dv/shadcn-theme-editor-overlay?style=flat-square)](https://www.npmjs.com/package/@sebas-dv/shadcn-theme-editor-overlay) |
| [`@sebas-dv/shadcn-theme-editor-vite`](./packages/vite-plugin) | Vite plugin (dev server middleware + auto-injection)                    | [![npm](https://img.shields.io/npm/v/@sebas-dv/shadcn-theme-editor-vite?style=flat-square)](https://www.npmjs.com/package/@sebas-dv/shadcn-theme-editor-vite)       |
| [`@sebas-dv/shadcn-theme-editor-react`](./packages/react)      | `<ThemeEditor/>` drop-in component for Next.js and React apps           | [![npm](https://img.shields.io/npm/v/@sebas-dv/shadcn-theme-editor-react?style=flat-square)](https://www.npmjs.com/package/@sebas-dv/shadcn-theme-editor-react)     |
| [`@sebas-dv/shadcn-theme-editor`](./cli)                       | Standalone companion CLI (`npx @sebas-dv/shadcn-theme-editor`)          | [![npm](https://img.shields.io/npm/v/@sebas-dv/shadcn-theme-editor?style=flat-square)](https://www.npmjs.com/package/@sebas-dv/shadcn-theme-editor)                 |

---

## Quickstart & Setup

### 1. Vite Apps (Plain Vite, React, Vue, Svelte, TanStack Start, Astro, Remix)

Install the Vite plugin:

```bash
pnpm add -D @sebas-dv/shadcn-theme-editor-vite
# or: npm i -D @sebas-dv/shadcn-theme-editor-vite
# or: yarn add -D @sebas-dv/shadcn-theme-editor-vite
```

Add the plugin to `vite.config.ts`:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { shadcnThemeEditor } from "@sebas-dv/shadcn-theme-editor-vite";

export default defineConfig({
  plugins: [
    shadcnThemeEditor(), // Runs ONLY in development (apply: "serve")
  ],
});
```

Apps with an `index.html` have the overlay injected automatically. That's all!

---

### 2. Laravel + Inertia (React / Vue / Svelte)

Laravel serves the HTML response through PHP while Vite handles scripts. Add the plugin to your `vite.config.ts` and import the virtual entry in your client entrypoint:

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
import "virtual:shadcn-theme-editor"; // Self-mounts in dev; resolves to empty module in production builds
```

---

### 3. Next.js (App Router & Pages Router)

Next.js does not use Vite, so run the standalone companion server alongside `next dev` and use the `<ThemeEditor/>` component.

#### Step 1: Install dependencies

```bash
pnpm add -D @sebas-dv/shadcn-theme-editor @sebas-dv/shadcn-theme-editor-react
```

#### Step 2: Start the companion server

Add the companion to your `dev` script in `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently \"npx @sebas-dv/shadcn-theme-editor\" \"next dev\"",
    "build": "next build",
    "start": "next start"
  }
}
```

Or run in a separate terminal:

```bash
npx @sebas-dv/shadcn-theme-editor --port 7433
```

#### Step 3: Add the `<ThemeEditor/>` component

```tsx
// app/layout.tsx (Next.js App Router)
import { ThemeEditor } from "@sebas-dv/shadcn-theme-editor-react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Strictly disabled and tree-shaken when NODE_ENV === "production" */}
        <ThemeEditor apiBase="http://localhost:7433" />
      </body>
    </html>
  );
}
```

---

## Minimized State Persistence

When using the editor, you can collapse the panel into a discreet floating pill by clicking either the **Minimize (`—`)** button or the **Close (`✕`)** button.

- The editor records your choice in `localStorage` under `shadcn-theme-editor:minimized`.
- **When you reload the page, switch routes, or trigger Vite HMR, the editor stays minimized.**
- When you click the floating pill to expand it, the open state is updated.
- To disable state persistence, pass `persistState: false` in plugin options or component props.

---

## Configuration Reference

### Vite Plugin Options (`shadcnThemeEditor(options)`)

| Option         | Type      | Default               | Description                                                             |
| -------------- | --------- | --------------------- | ----------------------------------------------------------------------- |
| `cssPath`      | `string`  | _auto-detected_       | Explicit path to theme CSS (e.g. `src/styles/globals.css`).             |
| `basePath`     | `string`  | `"/__theme-editor__"` | Base URL path where API and overlay assets are served.                  |
| `autoOpen`     | `boolean` | `false`               | If `true`, opens full panel on first visit unless previously minimized. |
| `persistState` | `boolean` | `true`                | Persists minimized/open state across page reloads via `localStorage`.   |
| `backup`       | `boolean` | `false`               | Writes a `.bak` copy of the CSS file before writing modifications.      |
| `inject`       | `boolean` | `true`                | Automatically injects `<script>` into `index.html` during dev.          |
| `root`         | `string`  | Vite project root     | Project root directory to scan and restrict file writes to.             |

### React Component Props (`<ThemeEditor {...props} />`)

| Prop           | Type      | Default               | Description                                                            |
| -------------- | --------- | --------------------- | ---------------------------------------------------------------------- |
| `apiBase`      | `string`  | `""` (same origin)    | Origin URL where companion server runs (e.g. `http://localhost:7433`). |
| `basePath`     | `string`  | `"/__theme-editor__"` | Endpoint prefix mounted on companion server.                           |
| `autoOpen`     | `boolean` | `false`               | Initial open state if no saved minimized preference exists.            |
| `persistState` | `boolean` | `true`                | Persists minimized state in `localStorage`.                            |
| `enabled`      | `boolean` | `true` in dev         | Set to `false` to disable. Always `false` in production.               |

### CLI Options (`npx shadcn-theme-editor`)

```
Options:
  -p, --port <number>    Port to listen on (default: 7433)
      --root <dir>       Project root directory to scan/write (default: cwd)
      --path <file>      Force a specific theme CSS file
      --base <path>      API/asset mount prefix (default: /__theme-editor__)
      --backup           Write a .bak copy before overwriting CSS file
  -h, --help             Show help
```

---

## Monorepo Development

This project is built as a pnpm monorepo.

### Prerequisites

- Node.js `>= 18.0.0`
- pnpm `12.0.0` (or `>= 10.0.0`)

### Commands

```bash
pnpm install          # Install all dependencies across packages
pnpm build            # Compile every package and CLI using tsup
pnpm dev              # Watch and rebuild packages in parallel
pnpm test             # Run Vitest test suites across packages
pnpm typecheck        # Typecheck all TypeScript code
pnpm lint             # Run ESLint across monorepo
pnpm format:check     # Check code formatting with Prettier
pnpm check            # Run lint + typecheck + tests (pre-push gate)
```

### Try it locally

Run the included playground app to test the overlay in a real Tailwind v4 environment:

```bash
pnpm --filter playground-vite-vanilla dev
```

---

## Security

Please review our [SECURITY.md](SECURITY.md) for full details on vulnerability reporting, filesystem sandboxing, and our multi-layered development-only guarantees.

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for our contribution workflow, coding standards, and testing practices.

---

## License

This project is open source and available under the [MIT License](LICENSE).
