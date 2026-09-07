# @sebas-dv/shadcn-theme-editor

[![npm](https://img.shields.io/npm/v/@sebas-dv/shadcn-theme-editor?style=flat-square&color=black&logo=npm)](https://www.npmjs.com/package/@sebas-dv/shadcn-theme-editor)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](https://github.com/Sebas-DV/shadcn-theme-editor/blob/main/LICENSE)

Run the companion dev server for the live shadcn (Tailwind v4 / OKLCH) theme editor overlay.

Reads your project's theme CSS file, scans `@theme`, `:root`, and `.dark` variables, and surgically writes live changes back to disk using PostCSS.

---

## Quick Start

Run directly with `npx` in any project with a shadcn theme:

```bash
npx @sebas-dv/shadcn-theme-editor
```

By default, it starts the companion server on `http://localhost:7433`.

---

## Options

```
Options:
  -p, --port <n>     Port to listen on (default 7433)
      --root <dir>   Project root to scan/write (default: cwd)
      --path <file>  Force a specific theme CSS file (relative or absolute)
      --base <path>  API/asset mount prefix (default /__theme-editor__)
      --backup       Write a .bak copy before overwriting the CSS file
  -h, --help         Show this help
```

---

## Next.js Setup

Next.js does not use Vite, so run this companion server alongside `next dev`:

### 1. Install packages

```bash
pnpm add -D @sebas-dv/shadcn-theme-editor @sebas-dv/shadcn-theme-editor-react
```

### 2. Update `package.json` scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npx @sebas-dv/shadcn-theme-editor\" \"next dev\""
  }
}
```

### 3. Add `<ThemeEditor />` to your root layout

```tsx
// app/layout.tsx
import { ThemeEditor } from "@sebas-dv/shadcn-theme-editor-react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <ThemeEditor apiBase="http://localhost:7433" />
      </body>
    </html>
  );
}
```

`<ThemeEditor />` is strictly disabled in production builds with zero bundle overhead.

---

## Security

Execution is **strictly prohibited in production (`NODE_ENV=production`)**. The CLI terminates immediately with an error if invoked outside development.

---

## License

MIT © [Sebas-DV](https://github.com/Sebas-DV/shadcn-theme-editor)
