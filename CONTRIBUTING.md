# Contributing to shadcn Theme Editor

Thank you for your interest in contributing to **shadcn Theme Editor**! We welcome contributions, bug fixes, enhancements, and feedback from the community.

---

## Code of Conduct

Please be respectful, collaborative, and constructive in all discussions, issues, and pull requests.

---

## Prerequisites

Before contributing, ensure your environment meets the following requirements:

- **Node.js**: `>= 18.0.0` (LTS recommended)
- **pnpm**: `>= 10.0.0` (monorepo configured with `pnpm@12.0.0`)
- **Git**

---

## Monorepo Architecture

This project is organized as a pnpm monorepo:

| Path                      | Package                                 | Description                                                         |
| ------------------------- | --------------------------------------- | ------------------------------------------------------------------- |
| `packages/core`           | `@sebas-dv/shadcn-theme-editor-core`    | Pure parsing, token categorization, color math (OKLCH), AST rewrite |
| `packages/server`         | `@sebas-dv/shadcn-theme-editor-server`  | Hono-based companion dev server, scan/apply HTTP API, middleware    |
| `packages/overlay`        | `@sebas-dv/shadcn-theme-editor-overlay` | Zero-dependency Shadow-DOM live editor UI & state persistence       |
| `packages/vite-plugin`    | `@sebas-dv/shadcn-theme-editor-vite`    | Vite dev plugin, auto-injection, virtual modules                    |
| `packages/react`          | `@sebas-dv/shadcn-theme-editor-react`   | `<ThemeEditor />` drop-in component for React & Next.js             |
| `cli`                     | `@sebas-dv/shadcn-theme-editor`         | Standalone CLI runner (`npx @sebas-dv/shadcn-theme-editor`)         |
| `playground/vite-vanilla` | —                                       | Playground app for testing and live iteration                       |

---

## Getting Started

1. **Fork and clone** the repository:

   ```bash
   git clone https://github.com/Sebas-DV/shadcn-theme-editor.git
   cd shadcn-theme-editor
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Build packages**:

   ```bash
   pnpm build
   ```

4. **Run the development playground**:
   ```bash
   pnpm --filter playground-vite-vanilla dev
   ```

---

## Development Scripts

Run these scripts from the repository root:

- `pnpm build`: Compiles all packages and CLI with `tsup`.
- `pnpm dev`: Runs `tsup --watch` in parallel across packages.
- `pnpm test`: Executes Vitest suites across all workspace packages.
- `pnpm typecheck`: Typechecks all packages using `tsc --noEmit`.
- `pnpm lint`: Runs ESLint across the codebase.
- `pnpm lint:fix`: Runs ESLint with autofix.
- `pnpm format:check`: Validates formatting with Prettier.
- `pnpm format`: Formats code across the workspace with Prettier.
- `pnpm check`: Runs lint, typecheck, and tests in one command (required before pushing).

---

## Git Hooks & Quality Gates

This repository uses **Husky** and **lint-staged**:

- **pre-commit**: Automatically runs ESLint autofix and Prettier on staged files.
- **pre-push**: Runs `pnpm check` (`lint` + `typecheck` + `test`). Push is rejected if any check fails.

---

## Critical Contribution Rules

### 1. Hard Production Safety

Because this tool operates a companion server that rewrites CSS files on disk:

- **Never allow execution in production**: Any change must ensure that all servers, middleware, overlays, and components strictly no-op or throw security errors if `process.env.NODE_ENV === "production"`.
- Verify that tests covering production safety remain intact and passing.

### 2. State Persistence

- Minimized state is stored in `localStorage` under `shadcn-theme-editor:minimized`.
- Any UI changes to panel states (minimize, expand, close) must maintain persistence so user preference survives page reloads and HMR refreshes.

### 3. Test Coverage

- Add unit tests for every new feature, bug fix, or security barrier.
- Ensure all tests pass with `pnpm test`.

---

## Submitting a Pull Request

1. Create a feature branch from `master` or `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Commit your changes following clear, descriptive commit messages.
3. Verify that `pnpm check` passes with zero errors:
   ```bash
   pnpm check
   ```
4. Push your branch and open a Pull Request against the main branch.
5. Provide a clear PR description detailing:
   - What problem is solved.
   - What changes were made.
   - How the changes were tested.
