import { readFile } from "node:fs/promises";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createThemeService, type ThemeServiceOptions } from "./service";

export const DEFAULT_BASE_PATH = "/__theme-editor__";

export interface ThemeEditorAppOptions extends ThemeServiceOptions {
  basePath?: string; // default /__theme-editor__
  cors?: boolean; // needed for the cross-port Next.js setup
  // When set, the overlay IIFE bundle is served at `${basePath}/overlay.js`.
  overlayScriptPath?: string;
}

export interface ThemeEditorApp {
  app: Hono;
  basePath: string;
}

// Routes: GET api/health, GET api/scan?path=…, POST api/apply {changes, path?}.
export function createThemeEditorApp(
  options: ThemeEditorAppOptions = {},
): ThemeEditorApp {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[shadcn-theme-editor] Security error: Cannot initialize theme editor app in production. shadcn-theme-editor companion server is strictly prohibited when NODE_ENV=production.",
    );
  }

  const basePath = options.basePath ?? DEFAULT_BASE_PATH;
  const service = createThemeService(options);
  const app = new Hono();

  if (options.cors) {
    app.use(`${basePath}/*`, cors());
  }

  app.get(`${basePath}/api/health`, (c) => c.json({ ok: true, root: service.root }));

  if (options.overlayScriptPath) {
    const scriptPath = options.overlayScriptPath;
    app.get(`${basePath}/overlay.js`, async (c) => {
      try {
        // Read fresh each time so a rebuilt overlay shows up on reload.
        const source = await readFile(scriptPath, "utf8");
        return c.body(source, 200, {
          "content-type": "text/javascript; charset=utf-8",
          "cache-control": "no-cache",
        });
      } catch (error) {
        return c.text(
          `/* theme-editor overlay not found: ${messageOf(error)} */`,
          500,
          {
            "content-type": "text/javascript; charset=utf-8",
          },
        );
      }
    });
  }

  app.get(`${basePath}/api/scan`, async (c) => {
    try {
      const result = await service.scan(c.req.query("path"));
      return c.json({ ok: true, ...result });
    } catch (error) {
      return c.json({ ok: false, error: messageOf(error) }, 400);
    }
  });

  app.post(`${basePath}/api/apply`, async (c) => {
    try {
      const body = await c.req.json<{
        changes?: unknown;
        path?: string;
      }>();
      const changes = Array.isArray(body.changes) ? body.changes : [];
      const result = await service.apply({ changes, path: body.path });
      return c.json({ ok: true, ...result });
    } catch (error) {
      return c.json({ ok: false, error: messageOf(error) }, 400);
    }
  });

  return { app, basePath };
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
