# @sebas-dv/shadcn-theme-editor-core

[![npm](https://img.shields.io/npm/v/@sebas-dv/shadcn-theme-editor-core?style=flat-square&color=black&logo=npm)](https://www.npmjs.com/package/@sebas-dv/shadcn-theme-editor-core)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](https://github.com/Sebas-DV/shadcn-theme-editor/blob/main/LICENSE)

Framework-agnostic engine for parsing, categorizing, and rewriting shadcn/ui (Tailwind v4 / OKLCH) theme tokens.

---

## Features

- 🎯 **Theme Parsing**: Extracts CSS custom properties from `@theme`, `:root`, and `.dark` scopes.
- 🎨 **OKLCH Color Math**: Powered by `culori` with WCAG contrast ratios, AA/AAA grading, gamut safety, and color space conversions.
- ⚡ **Surgical AST Writes**: Uses PostCSS to update only edited declarations without disturbing formatting, comments, or structure.
- 🌐 **Browser Safe**: Dual exports (`index` for Node.js file operations, `browser` for zero-filesystem client-side color operations).

---

## Installation

```bash
pnpm add @sebas-dv/shadcn-theme-editor-core
```

---

## Usage

### Node.js (Parsing & Applying Changes)

```ts
import { parseTheme, applyChanges } from "@sebas-dv/shadcn-theme-editor-core";

const css = `
:root {
  --background: oklch(1 0 0);
  --primary: oklch(0.205 0 0);
}
`;

const model = parseTheme(css);
console.log(model.tokens);

const { css: updatedCss, applied } = applyChanges(css, [
  { scope: "root", name: "--primary", value: "oklch(0.55 0.2 260)" },
]);
```

### Browser (Color Math & WCAG Contrast)

```ts
import {
  contrastRatio,
  wcagGrade,
  toHex,
} from "@sebas-dv/shadcn-theme-editor-core/browser";

const ratio = contrastRatio("oklch(0.98 0 0)", "oklch(0.2 0 0)");
console.log(ratio, wcagGrade(ratio)); // e.g. 15.4, "AAA"
```

---

## License

MIT © [Sebas-DV](https://github.com/Sebas-DV/shadcn-theme-editor)
