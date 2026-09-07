# @sebas-dv/shadcn-theme-editor-overlay

[![npm](https://img.shields.io/npm/v/@sebas-dv/shadcn-theme-editor-overlay?style=flat-square&color=black&logo=npm)](https://www.npmjs.com/package/@sebas-dv/shadcn-theme-editor-overlay)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](https://github.com/Sebas-DV/shadcn-theme-editor/blob/main/LICENSE)

Framework-agnostic, zero-dependency **Shadow-DOM overlay UI** to edit shadcn (Tailwind v4 / OKLCH) theme tokens live in the browser.

---

## Features

- 🛡️ **Shadow DOM Isolation**: Encapsulated within a Shadow Root so host CSS cannot break or bleed into the editor.
- 💾 **State Persistence**: Remembers minimized state across page reloads and HMR refreshes using `localStorage`.
- 🎛️ **OKLCH Sliders**: Live L / C / H / α slider tracks with gamut preservation.
- ⚡ **Real-time Preview**: Overrides `:root` and `.dark` CSS variables in memory instantly.

---

## Installation

```bash
pnpm add -D @sebas-dv/shadcn-theme-editor-overlay
```

---

## Usage

### Programmatic Mount

```ts
import { mount } from "@sebas-dv/shadcn-theme-editor-overlay";

const handle = mount({
  apiBase: "http://localhost:7433",
  basePath: "/__theme-editor__",
  autoOpen: false,
  persistState: true,
});

// To unmount:
handle.destroy();
```

### Script Tag (Self-mounting IIFE)

```html
<script
  src="http://localhost:7433/__theme-editor__/overlay.js"
  data-api-base="http://localhost:7433"
  defer
></script>
```

---

## Security

The overlay strictly aborts initialization when running in a production environment (`NODE_ENV === "production"`).

---

## License

MIT © [Sebas-DV](https://github.com/Sebas-DV/shadcn-theme-editor)
