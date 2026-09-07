# @sebas-dv/shadcn-theme-editor-react

[![npm](https://img.shields.io/npm/v/@sebas-dv/shadcn-theme-editor-react?style=flat-square&color=black&logo=npm)](https://www.npmjs.com/package/@sebas-dv/shadcn-theme-editor-react)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](https://github.com/Sebas-DV/shadcn-theme-editor/blob/main/LICENSE)

Drop-in `<ThemeEditor />` React component that mounts the live shadcn theme editor overlay in **Next.js (App & Pages Router)** and other React applications.

---

## Installation

```bash
pnpm add -D @sebas-dv/shadcn-theme-editor-react @sebas-dv/shadcn-theme-editor
# or: npm i -D @sebas-dv/shadcn-theme-editor-react @sebas-dv/shadcn-theme-editor
```

---

## Usage (Next.js App Router)

### 1. Start the companion server

Add the companion to your `dev` script in `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently \"npx @sebas-dv/shadcn-theme-editor\" \"next dev\""
  }
}
```

### 2. Place `<ThemeEditor />` in your Root Layout

```tsx
// app/layout.tsx
import { ThemeEditor } from "@sebas-dv/shadcn-theme-editor-react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ThemeEditor apiBase="http://localhost:7433" />
      </body>
    </html>
  );
}
```

---

## Zero Production Overhead Guarantee

`<ThemeEditor />` verifies `NODE_ENV === "production"` and immediately returns `null` before loading any code. In production builds, Next.js / bundlers completely tree-shake and dead-code eliminate (DCE) the overlay bundle.

---

## Props

| Prop           | Type      | Default               | Description                                                    |
| -------------- | --------- | --------------------- | -------------------------------------------------------------- |
| `apiBase`      | `string`  | `""`                  | Origin of the companion server (e.g. `http://localhost:7433`). |
| `basePath`     | `string`  | `"/__theme-editor__"` | Endpoint mount prefix.                                         |
| `autoOpen`     | `boolean` | `false`               | Open panel initially (if not already minimized).               |
| `persistState` | `boolean` | `true`                | Persist minimized state in `localStorage`.                     |
| `enabled`      | `boolean` | `true` in dev         | Force disable with `enabled={false}`.                          |

---

## License

MIT © [Sebas-DV](https://github.com/Sebas-DV/shadcn-theme-editor)
