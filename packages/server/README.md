# @sebas-dv/shadcn-theme-editor-server

[![npm](https://img.shields.io/npm/v/@sebas-dv/shadcn-theme-editor-server?style=flat-square&color=black&logo=npm)](https://www.npmjs.com/package/@sebas-dv/shadcn-theme-editor-server)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](https://github.com/Sebas-DV/shadcn-theme-editor/blob/main/LICENSE)

Companion dev server and Connect-style middleware powered by [Hono](https://hono.dev/).

Exposes HTTP endpoints to scan local shadcn (Tailwind v4 / OKLCH) theme CSS files and apply live edits back to disk surgically using PostCSS.

---

## Installation

```bash
pnpm add -D @sebas-dv/shadcn-theme-editor-server
# or: npm i -D @sebas-dv/shadcn-theme-editor-server
```

---

## Usage

### Standalone Server

```ts
import { startThemeEditorServer } from "@sebas-dv/shadcn-theme-editor-server";

const server = await startThemeEditorServer({
  port: 7433,
  root: process.cwd(),
  backup: false,
});

console.log(`Companion running at ${server.url}`);
```

### Connect / Vite Middleware

```ts
import { createThemeEditorMiddleware } from "@sebas-dv/shadcn-theme-editor-server";

const middleware = createThemeEditorMiddleware({
  root: process.cwd(),
  basePath: "/__theme-editor__",
  cors: true,
});

app.use(middleware);
```

---

## Endpoints

- `GET /__theme-editor__/api/health` — Companion status check.
- `GET /__theme-editor__/api/scan?path=...` — Detects and parses the active theme CSS.
- `POST /__theme-editor__/api/apply` — Rewrites changed CSS declarations with PostCSS.
- `GET /__theme-editor__/overlay.js` — Serves the live overlay bundle (when `overlayScriptPath` is provided).

---

## Security & Production Lockout

The server and middleware strictly forbid execution in production:

- `startThemeEditorServer()` rejects immediately if `NODE_ENV === "production"`.
- `createThemeEditorApp()` throws a fatal security exception if `NODE_ENV === "production"`.
- `createThemeEditorMiddleware()` acts as a harmless no-op pass-through (`next()`) in production.
- Filesystem writes are strictly confined to `.css` files located within the project root.

---

## License

MIT © [Sebas-DV](https://github.com/Sebas-DV/shadcn-theme-editor)
