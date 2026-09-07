# Security Policy

## Supported Versions

Only the latest major and minor release lines receive active security updates.

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

---

## Reporting a Vulnerability

We take the security of `shadcn-theme-editor` and downstream applications seriously. If you discover a security issue or vulnerability, please do **NOT** open a public issue on GitHub.

Instead, please report security vulnerabilities through one of the following channels:

- **GitHub Security Advisory**: Use the [Privately report a security vulnerability](https://github.com/) feature on the repository.
- **Direct Email**: Send details, proof-of-concept steps, and environment information to the maintainers at security@example.com (or repository maintainer contact).

You should receive an acknowledgment within 48 hours. We will collaborate with you to validate the issue, prepare a patch, and coordinate a responsible public disclosure.

---

## Threat Model & Security Guarantees

`shadcn-theme-editor` includes a local companion HTTP server and an in-browser Shadow-DOM overlay designed for **local development and design iteration**. Because the companion server reads and rewrites CSS theme files on the local filesystem, strict security guarantees are enforced across every layer of the architecture.

### 1. Hard Production Lockout (Development-Only Guarantee)

> [!IMPORTANT]
> **Under no circumstances is `shadcn-theme-editor` allowed to execute or start in production.**

The codebase enforces multi-layered barriers against production execution:

- **Companion Server (`@sebas-dv/shadcn-theme-editor-server`)**:
  - `startThemeEditorServer()` rejects immediately if `NODE_ENV === "production"`.
  - `createThemeEditorApp()` throws a fatal security exception if `NODE_ENV === "production"`.
  - `createThemeEditorMiddleware()` acts as a transparent no-op pass-through (`next()`) in production, exposing zero endpoints.
  - `createThemeService().scan()` and `apply()` throw critical security errors in production.
- **CLI (`@sebas-dv/shadcn-theme-editor`)**:
  - Inspects `process.env.NODE_ENV` at startup. If set to `production`, the process immediately terminates with an error exit code `1`.
- **Vite Plugin (`@sebas-dv/shadcn-theme-editor-vite`)**:
  - Declares `apply: "serve"`, ensuring Vite completely ignores and skips the plugin during `vite build`.
  - During server startup, if `mode === "production"` or `NODE_ENV === "production"`, middleware registration, script injection, and virtual modules are completely deactivated.
- **React Component (`@sebas-dv/shadcn-theme-editor-react`)**:
  - `<ThemeEditor />` evaluates `process.env.NODE_ENV === "production"` and immediately returns `null` without invoking hooks or importing the client overlay bundle, guaranteeing zero production bundle overhead and dead-code elimination.
- **Overlay UI (`@sebas-dv/shadcn-theme-editor-overlay`)**:
  - `mount()` verifies `NODE_ENV !== "production"` before inspecting the DOM or creating elements. In production, it logs a warning and returns a harmless no-op handle.

### 2. Path Traversal & Filesystem Confinement

The companion server modifies theme CSS files on disk. To prevent arbitrary file read/write vulnerabilities:

- All target paths are strictly resolved against the configured project root (`process.cwd()` or `options.root`).
- Any path attempting to escape the root directory using relative segments (e.g., `../`, `..\\`) is rejected with `Path escapes the project root`.
- The companion service strictly refuses to interact with any file that does not end with the `.css` extension.
- PostCSS applies surgical AST transformations without executing dynamic code.

### 3. Localhost Binding & Network Safety

- The companion server defaults to `localhost` (`127.0.0.1`), avoiding exposure on public network interfaces unless explicitly specified by the developer.
- CORS headers are configured for local cross-port communication (e.g., Next.js dev server on port 3000 communicating with companion on port 7433).

### 4. DOM & Style Isolation

- The overlay UI is mounted inside an isolated **Shadow Root** (`attachShadow({ mode: "open" })`), protecting host CSS from leakage and preventing the host application from tampering with overlay controls.
